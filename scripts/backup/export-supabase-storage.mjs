import fs from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";

const baseUrl = (process.env.SUPABASE_URL || "").replace(/\/+$/, "");
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const recipient = process.env.BACKUP_AGE_RECIPIENT || "";
const outputRoot = path.resolve(process.env.BACKUP_STORAGE_DIR || "backup-work/storage");

if (!baseUrl || !serviceKey || !recipient) {
  throw new Error("Missing required Supabase Storage backup configuration.");
}

const headers = {
  apikey: serviceKey,
  Authorization: `Bearer ${serviceKey}`,
  "Content-Type": "application/json"
};

async function requestWithRetry(url, options = {}) {
  let lastError;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    try {
      const requestHeaders = { ...headers, ...(options.headers || {}) };
      for (const [key, value] of Object.entries(requestHeaders)) {
        if (value === undefined || value === null) delete requestHeaders[key];
      }
      const response = await fetch(url, { ...options, headers: requestHeaders });
      if (response.ok) return response;
      if (![429, 500, 502, 503, 504].includes(response.status)) {
        throw new Error(`Supabase Storage request failed with HTTP ${response.status}.`);
      }
      lastError = new Error(`Supabase Storage temporarily returned HTTP ${response.status}.`);
    } catch (error) {
      lastError = error;
    }
    if (attempt < 3) await new Promise((resolve) => setTimeout(resolve, 1000 * (2 ** attempt)));
  }
  throw lastError || new Error("Supabase Storage request failed.");
}

function safeSegment(value) {
  if (typeof value !== "string" || !value || value === "." || value === ".." || value.includes("\\") || value.includes("\0")) {
    throw new Error("Storage returned an unsafe object path.");
  }
  return Buffer.from(value, "utf8").toString("base64url") || "_";
}

function encodedObjectPath(value) {
  return value.split("/").map((segment) => encodeURIComponent(segment)).join("/");
}

function encryptFile(source, destination) {
  const result = spawnSync("age", ["-r", recipient, "-o", destination, source], {
    encoding: "utf8",
    maxBuffer: 1024 * 1024
  });
  if (result.error || result.status !== 0) {
    throw new Error("Could not encrypt a Storage object with age.");
  }
}

async function listPage(bucket, prefix, offset, limit) {
  const url = `${baseUrl}/storage/v1/object/list/${encodeURIComponent(bucket)}`;
  const response = await requestWithRetry(url, {
    method: "POST",
    body: JSON.stringify({
      prefix,
      limit,
      offset,
      sortBy: { column: "name", order: "asc" }
    })
  });
  const data = await response.json();
  if (!Array.isArray(data)) throw new Error("Unexpected response from Supabase Storage listing.");
  return data;
}

async function downloadAndEncrypt(bucket, objectKey, destination) {
  const url = `${baseUrl}/storage/v1/object/${encodeURIComponent(bucket)}/${encodedObjectPath(objectKey)}`;
  const response = await requestWithRetry(url, { method: "GET", headers: { "Content-Type": undefined } });
  const bytes = Buffer.from(await response.arrayBuffer());
  const parent = path.dirname(destination);
  await fs.mkdir(parent, { recursive: true });

  const temporaryPlaintext = `${destination}.plaintext.tmp`;
  try {
    await fs.writeFile(temporaryPlaintext, bytes, { flag: "wx", mode: 0o600 });
    encryptFile(temporaryPlaintext, destination);
  } finally {
    await fs.rm(temporaryPlaintext, { force: true });
  }
  return bytes.length;
}

await fs.mkdir(outputRoot, { recursive: true });
const bucketResponse = await requestWithRetry(`${baseUrl}/storage/v1/bucket`, { method: "GET" });
const buckets = await bucketResponse.json();
if (!Array.isArray(buckets)) throw new Error("Unexpected response from Supabase Storage bucket listing.");

const manifest = {
  format: "river-spend-storage-backup-v1",
  createdAt: new Date().toISOString(),
  buckets: [],
  totalObjects: 0,
  totalBytes: 0
};

const pageSize = 100;
for (const bucket of buckets) {
  const bucketEntry = {
    id: bucket.id,
    name: bucket.name,
    public: bucket.public,
    fileSizeLimit: bucket.file_size_limit ?? null,
    allowedMimeTypes: bucket.allowed_mime_types ?? null,
    objects: []
  };
  const bucketFolder = path.join(outputRoot, "objects", safeSegment(bucket.name));
  const visitedFolders = new Set();

  async function walk(prefix = "") {
    if (visitedFolders.has(prefix)) return;
    visitedFolders.add(prefix);
    let offset = 0;

    while (true) {
      const entries = await listPage(bucket.name, prefix, offset, pageSize);
      for (const entry of entries) {
        if (entry.id == null && entry.metadata == null) {
          const childPrefix = prefix ? `${prefix}/${entry.name}` : entry.name;
          await walk(childPrefix);
          continue;
        }

        const objectKey = prefix ? `${prefix}/${entry.name}` : entry.name;
        const relativeEncodedPath = objectKey.split("/").map(safeSegment).join("/");
        const encryptedPath = path.join(bucketFolder, `${relativeEncodedPath}.age`);
        const size = await downloadAndEncrypt(bucket.name, objectKey, encryptedPath);

        bucketEntry.objects.push({
          key: objectKey,
          encryptedFile: path.relative(outputRoot, encryptedPath).split(path.sep).join("/"),
          sizeBytes: size,
          contentType: entry.metadata?.mimetype ?? null,
          lastModified: entry.updated_at ?? entry.created_at ?? null,
          etag: entry.metadata?.eTag ?? entry.metadata?.etag ?? null
        });
        manifest.totalObjects += 1;
        manifest.totalBytes += size;
      }

      if (entries.length < pageSize) break;
      offset += pageSize;
    }
  }

  await walk("");
  manifest.buckets.push(bucketEntry);
}

const manifestPath = path.join(outputRoot, "manifest.json");
const encryptedManifestPath = `${manifestPath}.age`;
await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), { mode: 0o600 });
try {
  encryptFile(manifestPath, encryptedManifestPath);
} finally {
  await fs.rm(manifestPath, { force: true });
}

console.log(JSON.stringify({
  buckets: manifest.buckets.length,
  objects: manifest.totalObjects,
  bytes: manifest.totalBytes
}));
