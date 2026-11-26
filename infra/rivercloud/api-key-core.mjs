// RC-API-Key core prototype: test-prefixed, one-time key material; hash-only records.
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

export const API_KEY_SCOPES = Object.freeze([
  "cloud:plan",
  "cloud:jobs:read",
  "ai:invoke",
  "registry:read",
  "signals:read",
  "signals:send",
  "shop:catalog:read",
  "shop:catalog:write",
  "shop:checkout:mock"
]);
const SCOPE_SET = new Set(API_KEY_SCOPES);
const PREFIX = "rs_test_";
const MIN_TTL = 60 * 60 * 1000;
const MAX_TTL = 90 * 24 * 60 * 60 * 1000;
const HASH_RE = /^[a-f0-9]{64}$/;

function validOwner(ownerId) {
  return typeof ownerId === "string" && /^[A-Za-z0-9._:-]{1,128}$/.test(ownerId);
}
function validScopes(scopes) {
  return Array.isArray(scopes) && scopes.length > 0 && scopes.length <= API_KEY_SCOPES.length &&
    scopes.every(s => typeof s === "string" && SCOPE_SET.has(s)) && new Set(scopes).size === scopes.length;
}
function digestKey(key) {
  return createHash("sha256").update("river-api-key-v1\0").update(key).digest("hex");
}
function parseKey(key) {
  if (typeof key !== "string") return null;
  const m = /^rs_test_([a-f0-9]{32})\.([A-Za-z0-9_-]{43})$/.exec(key);
  return m ? { id: m[1] } : null;
}
function validRecord(record) {
  return record && typeof record === "object" && !Array.isArray(record) &&
    typeof record.id === "string" && /^[a-f0-9]{32}$/.test(record.id) &&
    HASH_RE.test(record.keyHash || "") && validOwner(record.ownerId) &&
    validScopes(record.scopes) && ["active","revoked"].includes(record.status) &&
    Number.isSafeInteger(record.createdAt) && Number.isSafeInteger(record.expiresAt) &&
    record.expiresAt > record.createdAt;
}

export function createApiKey({ ownerId, scopes, now = Date.now(), ttlMs = 30 * 24 * 60 * 60 * 1000 } = {}) {
  if (!validOwner(ownerId) || !validScopes(scopes) || !Number.isSafeInteger(now) ||
      !Number.isSafeInteger(ttlMs) || ttlMs < MIN_TTL || ttlMs > MAX_TTL || now < 0 || !Number.isSafeInteger(now + ttlMs)) {
    throw new Error("invalid_api_key_request");
  }
  const id = randomBytes(16).toString("hex");
  const key = PREFIX + id + "." + randomBytes(32).toString("base64url");
  const record = Object.freeze({
    id, keyHash: digestKey(key), ownerId, scopes: Object.freeze([...scopes].sort()),
    status: "active", createdAt: now, expiresAt: now + ttlMs
  });
  return Object.freeze({ key, record });
}

export function verifyApiKey(key, record, { now = Date.now(), requiredScope } = {}) {
  if (!Number.isSafeInteger(now) || now < 0) return { valid: false, reason: "invalid_time" };
  if (!validRecord(record)) return { valid: false, reason: "invalid_record" };
  const parsed = parseKey(key);
  if (!parsed || parsed.id !== record.id) return { valid: false, reason: "key_id_mismatch" };
  if (record.status !== "active") return { valid: false, reason: "key_revoked" };
  if (record.expiresAt <= now) return { valid: false, reason: "key_expired" };
  if (requiredScope !== undefined && (typeof requiredScope !== "string" || !SCOPE_SET.has(requiredScope))) return { valid: false, reason: "invalid_required_scope" };
  if (requiredScope && !record.scopes.includes(requiredScope)) return { valid: false, reason: "scope_denied" };
  const expected = Buffer.from(record.keyHash, "hex");
  const actual = Buffer.from(digestKey(key), "hex");
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return { valid: false, reason: "key_hash_mismatch" };
  return { valid: true, keyId: record.id, ownerId: record.ownerId, scopes: [...record.scopes] };
}

export function revokeApiKey(record) {
  if (!validRecord(record)) throw new Error("invalid_api_key_record");
  return Object.freeze({ ...record, scopes: Object.freeze([...record.scopes]), status: "revoked" });
}
