// RC-17: job lifecycle and tamper-evident audit records committed in one state transaction.
// Actor labels are not authenticated here; OIDC/RBAC integration remains a separate gate.
import { transactState, readState } from "./rc11-state.mjs";
import { createHash } from "node:crypto";
const STATES = ["pending", "approved", "rejected", "prepared", "running", "completed", "failed", "cancelled"];
const transitions = {
  pending: new Set(["approved", "rejected", "cancelled"]),
  approved: new Set(["prepared", "cancelled"]),
  rejected: new Set(), prepared: new Set(["running", "cancelled", "failed"]),
  running: new Set(["completed", "failed"]), completed: new Set(),
  failed: new Set(["prepared"]), cancelled: new Set()
};
const safeId = /^[A-Za-z0-9_-]{1,64}$/;
const sensitive = /password|secret|token|authorization|cookie|private.?key|credential|api.?key/i;
function redact(value, depth = 0) {
  if (depth > 8) return "[depth-limit]";
  if (Array.isArray(value)) return value.slice(0, 100).map(v => redact(v, depth + 1));
  if (value && typeof value === "object") {
    const out = {};
    for (const [key, v] of Object.entries(value).slice(0, 100)) out[key] = sensitive.test(key) ? "[redacted]" : redact(v, depth + 1);
    return out;
  }
  if (typeof value === "string") return value.length > 4000 ? value.slice(0, 4000) + "[truncated]" : value;
  if (typeof value === "number" || typeof value === "boolean" || value === null) return value;
  return "[unsupported]";
}
function digestPayload(payload) { return createHash("sha256").update(JSON.stringify(payload)).digest("hex"); }
export function verifyAtomicAudit(records) {
  if (!Array.isArray(records)) return { valid: false, reason: "ledger_not_array" };
  let previous = "GENESIS";
  for (let i = 0; i < records.length; i++) {
    const r = records[i];
    if (!r || r.sequence !== i + 1 || r.event !== "job_transition" || r.previousHash !== previous || typeof r.at !== "string" || !r.details || typeof r.details !== "object") return { valid: false, reason: "record_schema_invalid" };
    const { hash, ...payload } = r;
    if (typeof hash !== "string" || digestPayload(payload) !== hash) return { valid: false, reason: "record_hash_mismatch" };
    previous = hash;
  }
  return { valid: true, count: records.length };
}
function appendAtomicAudit(state, details) {
  if (!Array.isArray(state.auditRecords)) state.auditRecords = [];
  const records = state.auditRecords;
  const checked = verifyAtomicAudit(records);
  if (!checked.valid) throw new Error("audit_integrity_failure");
  const payload = { sequence: records.length + 1, event: "job_transition", details: redact(details), at: new Date().toISOString(), previousHash: records.at(-1)?.hash || "GENESIS" };
  const record = { ...payload, hash: digestPayload(payload) };
  records.push(record);
  return record;
}
export async function createLifecycleJobAtomic(file, { jobId, digest, plan, actor = "system" } = {}) {
  if (!safeId.test(jobId ?? "") || !/^[a-f0-9]{64}$/i.test(String(digest ?? "")) || !plan || typeof plan !== "object" || Array.isArray(plan) || typeof actor !== "string" || !actor.trim() || actor.length > 100) throw new Error("invalid_job");
  // Never persist raw secrets from caller-supplied plan data.
  const safePlan = redact(plan);
  return transactState(file, state => {
    if (!Array.isArray(state.lifecycleJobs)) state.lifecycleJobs = [];
    if (state.lifecycleJobs.some(j => j.id === jobId)) throw new Error("job_exists");
    const at = new Date().toISOString();
    const job = { id: jobId, digest: digest.toLowerCase(), plan: safePlan, state: "pending", createdAt: at, updatedAt: at };
    state.lifecycleJobs.push(job);
    appendAtomicAudit(state, { jobId, from: null, to: "pending", actor, note: "created", digest: job.digest });
    return job;
  });
}
export async function transitionLifecycleJobAtomic(file, { jobId, to, actor = "system", note = "" } = {}) {
  if (!safeId.test(jobId ?? "") || !STATES.includes(to) || typeof actor !== "string" || !actor.trim() || actor.length > 100 || typeof note !== "string" || note.length > 500) throw new Error("invalid_transition_input");
  return transactState(file, state => {
    if (!Array.isArray(state.lifecycleJobs)) state.lifecycleJobs = [];
    const job = state.lifecycleJobs.find(j => j.id === jobId);
    if (!job) throw new Error("job_not_found");
    if (!STATES.includes(job.state) || !transitions[job.state]?.has(to)) throw new Error("transition_not_allowed");
    const from = job.state, at = new Date().toISOString();
    job.state = to; job.updatedAt = at;
    appendAtomicAudit(state, { jobId, from, to, actor, note });
    return job;
  });
}
export async function readAtomicLifecycle(file) {
  const state = await readState(file);
  const jobs = Array.isArray(state.lifecycleJobs) ? state.lifecycleJobs : [];
  const auditRecords = Array.isArray(state.auditRecords) ? state.auditRecords : [];
  const integrity = verifyAtomicAudit(auditRecords);
  return { jobs, auditRecords, integrity };
}
