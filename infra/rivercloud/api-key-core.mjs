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
const RECORD_KEYS = ["id","keyHash","ownerId","scopes","status","createdAt","expiresAt"];

function validOwner(ownerId) {
  return typeof ownerId === "string" && /^[A-Za-z0-9._:-]{1,128}$/.test(ownerId);
}
function dataOptions(input,allowed,defaults){
  try{
    if(input===undefined)return {...defaults};
    if(!input||typeof input!=="object"||Array.isArray(input)||
       (Object.getPrototypeOf(input)!==Object.prototype&&Object.getPrototypeOf(input)!==null)||
       Object.getOwnPropertySymbols(input).length)return null;
    const keys=Reflect.ownKeys(input);
    if(keys.some(k=>typeof k!=="string"||!allowed.includes(k)))return null;
    const out={...defaults};
    for(const key of keys){
      const descriptor=Object.getOwnPropertyDescriptor(input,key);
      if(!descriptor||!descriptor.enumerable||!Object.hasOwn(descriptor,"value"))return null;
      out[key]=descriptor.value;
    }
    return out;
  }catch{return null;}
}
export function snapshotApiKeyOptions(input,allowed,defaults){return dataOptions(input,allowed,defaults);}
function scopeValues(scopes) {
  try {
    if (!Array.isArray(scopes) || scopes.length < 1 || scopes.length > API_KEY_SCOPES.length ||
        Object.getOwnPropertySymbols(scopes).length) return null;
    const ownKeys = Reflect.ownKeys(scopes);
    if (ownKeys.length !== scopes.length + 1 || !ownKeys.includes("length")) return null;
    const lengthDescriptor = Object.getOwnPropertyDescriptor(scopes,"length");
    if (!lengthDescriptor || !Object.hasOwn(lengthDescriptor,"value") || lengthDescriptor.value !== scopes.length) return null;
    const values = [];
    for (let i=0;i<scopes.length;i++) {
      const descriptor = Object.getOwnPropertyDescriptor(scopes,String(i));
      if (!descriptor || !descriptor.enumerable || !Object.hasOwn(descriptor,"value") ||
          typeof descriptor.value !== "string" || !SCOPE_SET.has(descriptor.value)) return null;
      values.push(descriptor.value);
    }
    if (new Set(values).size !== values.length) return null;
    return values;
  } catch { return null; }
}
function digestKey(key) {
  return createHash("sha256").update("river-api-key-v1\0").update(key).digest("hex");
}
function parseKey(key) {
  if (typeof key !== "string") return null;
  const m = /^rs_test_([a-f0-9]{32})\.([A-Za-z0-9_-]{43})$/.exec(key);
  return m ? { id: m[1] } : null;
}
function recordSnapshot(record) {
  try {
    if (!record || typeof record !== "object" || Array.isArray(record) ||
        (Object.getPrototypeOf(record) !== Object.prototype && Object.getPrototypeOf(record) !== null) ||
        Object.getOwnPropertySymbols(record).length) return null;
    const keys = Reflect.ownKeys(record);
    if (keys.length !== RECORD_KEYS.length || keys.some(k=>typeof k!=="string"||!RECORD_KEYS.includes(k))) return null;
    const data = Object.create(null);
    for (const key of RECORD_KEYS) {
      const descriptor = Object.getOwnPropertyDescriptor(record,key);
      if (!descriptor || !descriptor.enumerable || !Object.hasOwn(descriptor,"value")) return null;
      data[key]=descriptor.value;
    }
    const scopes=scopeValues(data.scopes);
    if (typeof data.id !== "string" || !/^[a-f0-9]{32}$/.test(data.id) ||
        typeof data.keyHash !== "string" || !HASH_RE.test(data.keyHash) ||
        !validOwner(data.ownerId) || !scopes ||
        !["active","revoked"].includes(data.status) ||
        !Number.isSafeInteger(data.createdAt) || !Number.isSafeInteger(data.expiresAt) ||
        data.expiresAt <= data.createdAt) return null;
    return {id:data.id,keyHash:data.keyHash,ownerId:data.ownerId,scopes,status:data.status,createdAt:data.createdAt,expiresAt:data.expiresAt};
  } catch { return null; }
}
function validRecord(record) { return recordSnapshot(record)!==null; }

export function createApiKey(options) {
  const input=dataOptions(options,["ownerId","scopes","now","ttlMs"],{now:Date.now(),ttlMs:30*24*60*60*1000});
  if(!input)throw new Error("invalid_api_key_request");
  const {ownerId,scopes,now,ttlMs}=input;
  const scopeList=scopeValues(scopes);
  if (!validOwner(ownerId) || !scopeList || !Number.isSafeInteger(now) ||
      !Number.isSafeInteger(ttlMs) || ttlMs < MIN_TTL || ttlMs > MAX_TTL || now < 0 || !Number.isSafeInteger(now + ttlMs)) {
    throw new Error("invalid_api_key_request");
  }
  const id = randomBytes(16).toString("hex");
  const key = PREFIX + id + "." + randomBytes(32).toString("base64url");
  const record = Object.freeze({
    id, keyHash: digestKey(key), ownerId, scopes: Object.freeze(scopeList.sort()),
    status: "active", createdAt: now, expiresAt: now + ttlMs
  });
  return Object.freeze({ key, record });
}

export function validateApiKeyRecord(record) { return validRecord(record); }

export function verifyApiKey(key, record, options) {
  const input=dataOptions(options,["now","requiredScope"],{now:Date.now()});
  if(!input)return {valid:false,reason:"invalid_options"};
  const {now,requiredScope}=input;
  if (!Number.isSafeInteger(now) || now < 0) return { valid: false, reason: "invalid_time" };
  const safeRecord=recordSnapshot(record);
  if (!safeRecord) return { valid: false, reason: "invalid_record" };
  const parsed = parseKey(key);
  if (!parsed || parsed.id !== safeRecord.id) return { valid: false, reason: "key_id_mismatch" };
  if (safeRecord.status !== "active") return { valid: false, reason: "key_revoked" };
  if (safeRecord.expiresAt <= now) return { valid: false, reason: "key_expired" };
  if (requiredScope !== undefined && (typeof requiredScope !== "string" || !SCOPE_SET.has(requiredScope))) return { valid: false, reason: "invalid_required_scope" };
  if (requiredScope && !safeRecord.scopes.includes(requiredScope)) return { valid: false, reason: "scope_denied" };
  const expected = Buffer.from(safeRecord.keyHash, "hex");
  const actual = Buffer.from(digestKey(key), "hex");
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return { valid: false, reason: "key_hash_mismatch" };
  return { valid: true, keyId: safeRecord.id, ownerId: safeRecord.ownerId, scopes: [...safeRecord.scopes] };
}

export function revokeApiKey(record) {
  const safeRecord=recordSnapshot(record);
  if (!safeRecord) throw new Error("invalid_api_key_record");
  return Object.freeze({ ...safeRecord, scopes: Object.freeze([...safeRecord.scopes]), status: "revoked" });
}
