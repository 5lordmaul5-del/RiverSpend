import http from "node:http";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { queuePlan, listQueue } from "./queue.mjs";
import { hasPermission } from "./rc13-identity.mjs";

const MAX_BODY = 8192;
const MAX_GROUPS = 20;
const MAX_GROUP_HEADER = 2048;
const MAX_USER_LENGTH = 256;
const MAX_GROUP_LENGTH = 128;
const KNOWN_ROLES = new Set(["owner", "admin", "operator", "auditor", "viewer"]);
const POLICY_ERRORS = new Set(["invalid_request", "project_not_allowlisted", "target_not_allowed", "immutable_commit_sha_required", "branch_not_allowlisted", "profile_not_allowed"]);
const CAPACITY_ERRORS = new Set(["queue_capacity_exceeded", "state_file_too_large", "state_lock_timeout"]);

export const DEFAULT_GROUP_ROLE_MAP = Object.freeze({
  RiverCloudOwners: "owner",
  RiverCloudAdmins: "admin",
  RiverCloudOperators: "operator",
  RiverCloudAuditors: "auditor",
  RiverCloudViewers: "viewer"
});

function normalizeAddress(value) {
  return typeof value === "string" && value.startsWith("::ffff:") ? value.slice(7) : value;
}

function validateGroupRoleMap(input) {
  const entries = input instanceof Map ? [...input.entries()] : input && typeof input === "object" && !Array.isArray(input) ? Object.entries(input) : null;
  if (!entries || entries.length > 100) throw new Error("invalid_group_role_map");
  const map = new Map();
  for (const [group, role] of entries) {
    if (typeof group !== "string" || !group.trim() || group.length > MAX_GROUP_LENGTH || /[\r\n\0]/.test(group) || !KNOWN_ROLES.has(role)) throw new Error("invalid_group_role_map");
    map.set(group, role);
  }
  return map;
}

function actorFromHeaders(req, groupRoleMap) {
  const user = req.headers["x-forwarded-user"];
  const rawGroups = req.headers["x-forwarded-groups"];
  if (typeof user !== "string" || !user.trim() || user.length > MAX_USER_LENGTH || /[\r\n\0]/.test(user)) return null;
  if (typeof rawGroups !== "string" || !rawGroups.trim() || rawGroups.length > MAX_GROUP_HEADER || /[\r\n\0]/.test(rawGroups)) return null;
  const groups = rawGroups.split(",").map(g => g.trim()).filter(Boolean);
  if (!groups.length || groups.length > MAX_GROUPS || groups.some(g => g.length > MAX_GROUP_LENGTH || /[\r\n\0]/.test(g))) return null;
  const roles = [...new Set(groups.map(g => groupRoleMap.get(g)).filter(Boolean))];
  return { subject: user.trim(), roles, groups };
}

async function readBody(req) {
  const contentType = String(req.headers["content-type"] || "").toLowerCase();
  if (contentType.split(";")[0].trim() !== "application/json") throw Object.assign(new Error("json_required"), { status: 415 });
  let size = 0;
  const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY) throw Object.assign(new Error("body_too_large"), { status: 413 });
    chunks.push(chunk);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString("utf8")); }
  catch { throw Object.assign(new Error("invalid_json"), { status: 400 }); }
}

function respond(res, status, data) {
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "x-content-type-options": "nosniff",
    "x-frame-options": "DENY",
    "referrer-policy": "no-referrer",
    "content-security-policy": "default-src 'none'; frame-ancestors 'none'"
  });
  res.end(JSON.stringify(data));
}

export function createProxyApiServer({
  host = "127.0.0.1",
  port = 0,
  trustedProxyAddress = "172.31.250.3",
  groupRoleMap = DEFAULT_GROUP_ROLE_MAP,
  storeFile = path.resolve(process.env.RIVERCLOUD_QUEUE_DIR || "./queue-data/state.json")
} = {}) {
  if (!["127.0.0.1", "::1", "0.0.0.0"].includes(host)) throw new Error("invalid_api_bind_host");
  if (!Number.isInteger(port) || port < 0 || port > 65535) throw new Error("invalid_port");
  if (typeof trustedProxyAddress !== "string" || !trustedProxyAddress.trim() || trustedProxyAddress.length > 64) throw new Error("invalid_trusted_proxy");
  const rolesByGroup = validateGroupRoleMap(groupRoleMap);

  const server = http.createServer(async (req, res) => {
    try {
      if (normalizeAddress(req.socket.remoteAddress) !== normalizeAddress(trustedProxyAddress)) {
        return respond(res, 403, { error: "untrusted_proxy" });
      }
      const actor = actorFromHeaders(req, rolesByGroup);
      if (!actor) return respond(res, 401, { error: "identity_required" });
      if (!actor.roles.length) return respond(res, 403, { error: "role_not_mapped" });

      const url = new URL(req.url || "/", "http://rivercloud.internal");
      const routes = new Map([
        ["/api/health", { method: "GET", permission: "read_status" }],
        ["/api/jobs", { method: "GET", permission: "read_jobs" }],
        ["/api/plan", { method: "POST", permission: "manage_projects" }]
      ]);
      const route = routes.get(url.pathname);
      if (!route) return respond(res, 404, { error: "not_found" });
      if (req.method !== route.method) return respond(res, 405, { error: "method_not_allowed", allow: route.method });
      if (!hasPermission(actor, route.permission)) return respond(res, 403, { error: "permission_denied" });

      if (route.method === "GET" && url.pathname === "/api/health") {
        return respond(res, 200, { status: "proxy_identity_api_prototype", executionEnabled: false });
      }
      if (route.method === "GET" && url.pathname === "/api/jobs") {
        return respond(res, 200, { jobs: await listQueue(storeFile) });
      }
      if (route.method === "POST" && url.pathname === "/api/plan") {
        const input = await readBody(req);
        const actorRef = createHash("sha256").update("rivercloud-actor-v1\\0" + actor.subject).digest("hex");
        const result = await queuePlan(storeFile, input, { actorRef, roles: actor.roles });
        const responseJob = result.duplicate
          ? { id: result.job.id, digest: result.job.digest, state: result.job.state }
          : result.job;
        return respond(res, result.duplicate ? 200 : 202, {
          job: responseJob,
          duplicate: result.duplicate,
          notice: "Plan only; no build or deployment is executed."
        });
      }
      return respond(res, 404, { error: "not_found" });
    } catch (e) {
      const status = e.status || (POLICY_ERRORS.has(e.message) ? 400 : CAPACITY_ERRORS.has(e.message) ? 503 : 500);
      const error = status >= 500 && !CAPACITY_ERRORS.has(e.message) ? "internal_error" : e.message || "request_failed";
      return respond(res, status, { error });
    }
  });

  server.requestTimeout = 15_000;
  server.headersTimeout = 10_000;
  server.timeout = 15_000;
  server.keepAliveTimeout = 5_000;
  server.maxRequestsPerSocket = 100;
  return server;
}

export function startProxyApiServer(options = {}) {
  const server = createProxyApiServer(options);
  server.listen(options.port ?? 0, options.host ?? "127.0.0.1");
  return server;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const host = process.env.RIVERCLOUD_API_HOST || "127.0.0.1";
  const port = Number(process.env.RIVERCLOUD_API_PORT || 8788);
  const trustedProxyAddress = process.env.RIVERCLOUD_TRUSTED_PROXY_IP || "172.31.250.3";
  const server = startProxyApiServer({ host, port, trustedProxyAddress });
  server.once("listening", () => console.log("RiverCloud proxy-identity API prototype listening on " + host + ":" + server.address().port));
  server.once("error", e => { console.error("RiverCloud API startup failed:", e.message); process.exitCode = 1; });
}
