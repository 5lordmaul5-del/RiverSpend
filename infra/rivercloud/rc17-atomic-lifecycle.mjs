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
  const states = new Map(), digests = new Map();
  for (let i = 0; i < records.length; i++) {
    const r = records[i];
    const d = r?.details;
    if (!r || r.sequence !== i + 1 || r.event !== "job_transition" || r.previousHash !== previous || typeof r.at !== "string" || !d || typeof d !== "object" || Array.isArray(d)) return { valid: false, reason: "record_schema_invalid" };
    if (!safeId.test(String(d.jobId ?? "")) || !STATES.includes(d.to) || (d.from !== null && !STATES.includes(d.from))) return { valid: false, reason: "transition_details_invalid" };
    if (d.from === null) {
      if (d.to !== "pending" || states.has(d.jobId) || !/^[a-f0-9]{64}$/i.test(String(d.digest ?? ""))) return { valid: false, reason: "creation_record_invalid" };
      states.set(d.jobId, "pending");
      digests.set(d.jobId, String(d.digest).toLowerCase());
    } else {
      if (states.get(d.jobId) !== d.from || !transitions[d.from]?.has(d.to)) return { valid: false, reason: "transition_sequence_invalid" };
      states.set(d.jobId, d.to);
    }
    const { hash, ...payload } = r;
    if (typeof hash !== "string" || digestPayload(payload) !== hash) return { valid: false, reason: "record_hash_mismatch" };
    previous = hash;
  }
  return { valid: true, count: records.length, states: Object.fromEntries(states), digests: Object.fromEntries(digests) };
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

export async function storeApprovalForLifecycleAtomic(file, record) {
  if (!record || !/^[a-f0-9]{64}$/i.test(String(record.tokenId ?? "")) ||
      !safeId.test(String(record.jobId ?? "")) || record.binding?.jobId !== record.jobId ||
      !/^[a-f0-9]{64}$/i.test(String(record.binding?.digest ?? "")) ||
      !Number.isSafeInteger(record.expiresAt) || record.expiresAt <= Date.now() ||
      typeof record.nonce !== "string" || !record.nonce ||
      typeof record.approver !== "string" || !record.approver.trim() || record.approver.length > 256) {
    throw new Error("invalid_approval");
  }
  return transactState(file, state => {
    if (!Array.isArray(state.lifecycleJobs)) state.lifecycleJobs = [];
    if (!Array.isArray(state.approvals)) state.approvals = [];
    if (!Array.isArray(state.events)) state.events = [];
    if (state.approvals.some(a => a.tokenId === record.tokenId)) throw new Error("approval_exists");
    const job = state.lifecycleJobs.find(j => j.id === record.jobId);
    if (!job || job.state !== "pending" || String(job.digest).toLowerCase() !== String(record.binding.digest).toLowerCase()) {
      throw new Error("approval_job_not_pending_or_digest_mismatch");
    }
    const audit = verifyAtomicAudit(state.auditRecords || []);
    if (!audit.valid || audit.states[job.id] !== job.state || audit.digests[job.id] !== String(job.digest).toLowerCase()) {
      throw new Error("audit_integrity_failure");
    }
    if (state.approvals.some(a => a.jobId === job.id && !a.used && a.expiresAt > Date.now())) {
      throw new Error("approval_already_issued");
    }
    state.approvals.push({ ...record, used: false });
    state.events.push({ event: "approval_issued", jobId: job.id, at: new Date().toISOString() });
    return record.tokenId;
  });
}

export async function consumeApprovalAndTransitionAtomic(file, {
  tokenId, binding, consumerIdentity, verifyApproval
} = {}) {
  if (!/^[a-f0-9]{64}$/i.test(String(tokenId ?? "")) || !binding ||
      !safeId.test(String(binding.jobId ?? "")) || !/^[a-f0-9]{64}$/i.test(String(binding.digest ?? "")) ||
      typeof consumerIdentity !== "string" || !consumerIdentity.trim() || consumerIdentity.length > 256 ||
      typeof verifyApproval !== "function") {
    throw new Error("invalid_approval_consume_request");
  }
  return transactState(file, state => {
    if (!Array.isArray(state.lifecycleJobs)) state.lifecycleJobs = [];
    if (!Array.isArray(state.approvals)) state.approvals = [];
    if (!Array.isArray(state.events)) state.events = [];
    const approval = state.approvals.find(a => a.tokenId === tokenId);
    if (!approval || approval.used) throw new Error("approval_missing_or_used");
    if (!Number.isSafeInteger(approval.expiresAt) || approval.expiresAt <= Date.now()) throw new Error("approval_expired");
    if (approval.jobId !== binding.jobId || approval.binding?.jobId !== binding.jobId ||
        String(approval.binding?.digest ?? "").toLowerCase() !== String(binding.digest).toLowerCase()) {
      throw new Error("approval_binding_mismatch");
    }
    if (approval.approver === consumerIdentity) throw new Error("self_approval_not_allowed");
    if (verifyApproval(approval) !== true) throw new Error("approval_binding_mismatch");
    const job = state.lifecycleJobs.find(j => j.id === binding.jobId);
    if (!job) throw new Error("job_not_found");
    if (job.state !== "pending" || String(job.digest).toLowerCase() !== String(binding.digest).toLowerCase()) {
      throw new Error("job_not_pending_or_digest_mismatch");
    }
    const audit = verifyAtomicAudit(state.auditRecords || []);
    if (!audit.valid || audit.states[job.id] !== job.state || audit.digests[job.id] !== String(job.digest).toLowerCase()) {
      throw new Error("audit_integrity_failure");
    }
    const from = job.state, at = new Date().toISOString();
    approval.used = true;
    state.events.push({ event: "approval_consumed", jobId: job.id, at });
    job.state = "approved";
    job.updatedAt = at;
    appendAtomicAudit(state, { jobId: job.id, from, to: "approved", actor: consumerIdentity, note: "approval_consumed", digest: job.digest });
    return { approved: true, jobId: job.id, jobState: job.state, approver: approval.approver, consumerIdentity };
  });
}

export async function readAtomicLifecycle(file) {
  const state = await readState(file);
  const jobs = Array.isArray(state.lifecycleJobs) ? state.lifecycleJobs : [];
  const auditRecords = Array.isArray(state.auditRecords) ? state.auditRecords : [];
  let integrity = verifyAtomicAudit(auditRecords);
  if (integrity.valid) {
    const jobIds = new Set();
    if (jobs.length !== Object.keys(integrity.states).length) integrity = { valid: false, reason: "job_audit_count_mismatch" };
    else {
      for (const job of jobs) {
        if (!job || !safeId.test(String(job.id ?? "")) || jobIds.has(job.id) || integrity.states[job.id] !== job.state || integrity.digests[job.id] !== String(job.digest ?? "").toLowerCase()) {
          integrity = { valid: false, reason: "job_audit_state_mismatch" };
          break;
        }
        jobIds.add(job.id);
      }
    }
  }
  return { jobs, auditRecords, integrity };
}
