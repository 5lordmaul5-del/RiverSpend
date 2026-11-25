import http from "node:http";
import { timingSafeEqual } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { queuePlan, listQueue } from "./queue.mjs";

const MAX_BODY = 8192;
const POLICY_ERRORS = new Set(["invalid_request", "project_not_allowlisted", "target_not_allowed", "immutable_commit_sha_required", "branch_not_allowlisted"]);
const CAPACITY_ERRORS = new Set(["queue_capacity_exceeded", "state_file_too_large"]);

function authorized(req, token) {
  const header = req.headers.authorization;
  const supplied = typeof header === "string" && header.startsWith("Bearer ") ? header.slice(7) : "";
  const a = Buffer.from(supplied), b = Buffer.from(token);
  return a.length === b.length && timingSafeEqual(a, b);
}

async function readBody(req) {
  const ct = String(req.headers["content-type"] || "").toLowerCase();
  if (ct.split(";")[0].trim() !== "application/json") throw Object.assign(new Error("json_required"), { status: 415 });
  let size = 0, chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY) throw Object.assign(new Error("body_too_large"), { status: 413 });
    chunks.push(chunk);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString("utf8")); }
  catch { throw Object.assign(new Error("invalid_json"), { status: 400 }); }
}

function respond(res, status, data) {
  res.writeHead(status, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-content-type-options": "nosniff" });
  res.end(JSON.stringify(data));
}

export function createServer({ host = "127.0.0.1", port = 8787, token = process.env.RIVERCLOUD_ENGINE_TOKEN || "", storeFile = path.resolve(process.env.RIVERCLOUD_QUEUE_DIR || "./queue-data/state.json") } = {}) {
  if (!["127.0.0.1", "::1"].includes(host)) throw new Error("Prototype must bind loopback only");
  if (!Number.isInteger(port) || port < 0 || port > 65535) throw new Error("invalid_port");
  if (typeof token !== "string" || token.length < 32) throw new Error("Set RIVERCLOUD_ENGINE_TOKEN to at least 32 characters");
  const server = http.createServer(async (req, res) => {
    try {
      if (!authorized(req, token)) return respond(res, 401, { error: "unauthorized" });
      const url = new URL(req.url || "/", "http://localhost");
      if (req.method === "GET" && url.pathname === "/health") return respond(res, 200, { status: "queue_prototype", runnerConnected: false, executionEnabled: false });
      if (req.method === "GET" && url.pathname === "/jobs") return respond(res, 200, { jobs: await listQueue(storeFile) });
      if (req.method === "POST" && url.pathname === "/deploy") {
        const input = await readBody(req);
        const result = await queuePlan(storeFile, input);
        return respond(res, result.duplicate ? 200 : 202, { job: result.job, duplicate: result.duplicate, notice: "Plan only; no build or deployment is executed." });
      }
      return respond(res, 404, { error: "not_found" });
    } catch (e) {
      const status = e.status || (POLICY_ERRORS.has(e.message) ? 400 : e.message === "state_lock_timeout" || CAPACITY_ERRORS.has(e.message) ? 503 : 500);
      return respond(res, status, { error: status >= 500 ? (e.message === "state_lock_timeout" || CAPACITY_ERRORS.has(e.message) ? e.message : "internal_error") : (e.message || "request_failed") });
    }
  });
  // Bounded request/headers/socket inactivity to reduce slow-client resource exhaustion.
  server.requestTimeout = 15_000;
  server.headersTimeout = 10_000;
  server.timeout = 15_000;
  server.keepAliveTimeout = 5_000;
  server.maxRequestsPerSocket = 100;
  return server;
}

export function startServer(options = {}) {
  const server = createServer(options);
  server.listen(options.port ?? 8787, options.host ?? "127.0.0.1");
  return server;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const host = process.env.RIVERCLOUD_ENGINE_HOST || "127.0.0.1";
  const port = Number(process.env.RIVERCLOUD_ENGINE_PORT || 8787);
  const token = process.env.RIVERCLOUD_ENGINE_TOKEN || "";
  const server = startServer({ host, port, token });
  server.once("listening", () => console.log("RiverCloud queue-only prototype listening on " + host + ":" + server.address().port));
  server.once("error", e => { console.error("RiverCloud server startup failed:", e.message); process.exitCode = 1; });
}
