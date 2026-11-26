// RC-17: job lifecycle and tamper-evident audit records committed in one state transaction.
// Actor labels are not authenticated here; OIDC/RBAC integration remains a separate gate.
import { transactState, readState } from "./rc11-state.mjs";
import { createHash } from "node:crypto";
const STATES = ["pending", "approved", "rejected", "prepared", "running", "completed", "failed", "cancelled"];
const transitions = {
  pending: new Set(["rejected", "cancelled"]),
  approved: new Set(["prepared", "cancelled"]),
  rejected: new Set(), prepared: new Set(["running", "cancelled", "failed"]),
  running: new Set(["completed", "failed"]), completed: new Set(),
  failed: new Set(["prepared"]), cancelled: new Set()
};
const safeId = /^[A-Za-z0-9_-]{1,64}$/;
const HASH = /^[a-f0-9]{64}$/i;
const MAX_LIFECYCLE_JOBS = 5000;
const MAX_AUDIT_RECORDS = 10000;
const MAX_LIFECYCLE_APPROVALS = 10000;
const MAX_LIFECYCLE_EVENTS = 10000;
function ensureLifecycleJobs(state) { if (state.lifecycleJobs === undefined) state.lifecycleJobs = []; else if (!Array.isArray(state.lifecycleJobs)) throw new Error('lifecycle_jobs_schema_invalid'); return state.lifecycleJobs; }
function ensureAuditRecords(state) { if (state.auditRecords === undefined) state.auditRecords = []; else if (!Array.isArray(state.auditRecords)) throw new Error('audit_records_schema_invalid'); return state.auditRecords; }
const sensitive = /password|secret|token|authorization|cookie|private.?key|credential|api.?key/i;
function redact(value, depth = 0) {
  if (depth > 8) return "[depth-limit]";
  if (Array.isArray(value)) return value.slice(0, 100).map(v => redact(v, depth + 1));
  if (value && typeof value === "object") {
    const out = Object.create(null);
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
  let previous = "GENESIS", pendingApprovalTransition = null;
  const states = new Map(), digests = new Map(), approvals = new Map();
  for (let i = 0; i < records.length; i++) {
    const r = records[i], d = r?.details;
    if (!r || r.sequence !== i + 1 || typeof r.at !== "string" || !Number.isFinite(Date.parse(r.at)) || !d || typeof d !== "object" || Array.isArray(d) || r.previousHash !== previous) return { valid: false, reason: "record_schema_invalid" };
    if (pendingApprovalTransition && r.event !== "job_transition") return { valid: false, reason: "approval_transition_not_adjacent" };
    if (r.event === "job_transition") {
      if (!safeId.test(String(d.jobId ?? "")) || !STATES.includes(d.to) || (d.from !== null && !STATES.includes(d.from)) || typeof d.actor !== "string" || !d.actor.trim() || typeof d.note !== "string") return { valid: false, reason: "transition_details_invalid" };
      if (d.from === null) {
        if (d.to !== "pending" || states.has(d.jobId) || !HASH.test(String(d.digest ?? ""))) return { valid: false, reason: "creation_record_invalid" };
        states.set(d.jobId, "pending"); digests.set(d.jobId, String(d.digest).toLowerCase());
      } else {
        const approvalTransition = pendingApprovalTransition && pendingApprovalTransition.jobId === d.jobId && pendingApprovalTransition.consumer === d.actor && d.from === "pending" && d.to === "approved" && d.note === "approval_consumed";
        if (states.get(d.jobId) !== d.from || (!transitions[d.from]?.has(d.to) && !approvalTransition)) return { valid: false, reason: "transition_sequence_invalid" };
        if (d.digest !== undefined && String(d.digest).toLowerCase() !== digests.get(d.jobId)) return { valid: false, reason: "transition_digest_mismatch" };
        states.set(d.jobId, d.to);
      }
      if (pendingApprovalTransition) {
        const expected = pendingApprovalTransition;
        if (d.jobId !== expected.jobId || d.from !== "pending" || d.to !== "approved" || d.actor !== expected.consumer || d.note !== "approval_consumed") return { valid: false, reason: "approval_transition_mismatch" };
        pendingApprovalTransition = null;
      }
    } else if (r.event === "approval_issued") {
      if (!HASH.test(String(d.approvalId ?? "")) || !safeId.test(String(d.jobId ?? "")) || !HASH.test(String(d.digest ?? "")) || typeof d.approver !== "string" || !d.approver.trim() || !Number.isSafeInteger(d.expiresAt) || d.expiresAt <= Date.parse(r.at) || states.get(d.jobId) !== "pending" || digests.get(d.jobId) !== String(d.digest).toLowerCase() || approvals.has(d.approvalId)) return { valid: false, reason: "approval_issue_invalid" };
      approvals.set(d.approvalId, { jobId: d.jobId, digest: String(d.digest).toLowerCase(), approver: d.approver, expiresAt: d.expiresAt, used: false });
    } else if (r.event === "approval_consumed") {
      const approval = approvals.get(d.approvalId);
      if (!HASH.test(String(d.approvalId ?? "")) || !safeId.test(String(d.jobId ?? "")) || !HASH.test(String(d.digest ?? "")) || typeof d.consumer !== "string" || !d.consumer.trim() || !approval || approval.used || approval.jobId !== d.jobId || approval.digest !== String(d.digest).toLowerCase() || approval.expiresAt <= Date.parse(r.at) || approval.approver === d.consumer || states.get(d.jobId) !== "pending" || digests.get(d.jobId) !== String(d.digest).toLowerCase()) return { valid: false, reason: "approval_consume_invalid" };
      approval.used = true;
      pendingApprovalTransition = { jobId: d.jobId, consumer: d.consumer };
    } else return { valid: false, reason: "event_type_invalid" };
    const { hash, ...payload } = r;
    if (typeof hash !== "string" || digestPayload(payload) !== hash) return { valid: false, reason: "record_hash_mismatch" };
    previous = hash;
  }
  if (pendingApprovalTransition) return { valid: false, reason: "approval_transition_missing" };
  return { valid: true, count: records.length, states: Object.fromEntries(states), digests: Object.fromEntries(digests), approvals: Object.fromEntries(approvals) };
}
function appendAtomicAuditBatch(state, detailsList) {
  const records = ensureAuditRecords(state);
  if (records.length + detailsList.length > MAX_AUDIT_RECORDS) throw new Error('audit_capacity_exceeded');
  const checked = verifyAtomicAudit(records);
  if (!checked.valid) throw new Error("audit_integrity_failure");
  for (const details of detailsList) {
    const payload = { sequence: records.length + 1, event: details.event, details: redact(details.details), at: new Date().toISOString(), previousHash: records.at(-1)?.hash || "GENESIS" };
    const record = { ...payload, hash: digestPayload(payload) };
    records.push(record);
  }
  if (!verifyAtomicAudit(records).valid) throw new Error("audit_integrity_failure");
  return detailsList.map((_, i) => records[records.length - detailsList.length + i]);
}
function appendAtomicAudit(state, details) { return appendAtomicAuditBatch(state, [{ event: "job_transition", details }])[0]; }
export async function createLifecycleJobAtomic(file, { jobId, digest, plan, actor = "system" } = {}) {
  if (!safeId.test(jobId ?? "") || !/^[a-f0-9]{64}$/i.test(String(digest ?? "")) || !plan || typeof plan !== "object" || Array.isArray(plan) || typeof actor !== "string" || !actor.trim() || actor.length > 100) throw new Error("invalid_job");
  // Never persist raw secrets from caller-supplied plan data.
  const safePlan = redact(plan);
  return transactState(file, state => {
    const jobs = ensureLifecycleJobs(state); ensureAuditRecords(state);
    if (jobs.some(j => j.id === jobId)) throw new Error("job_exists");
    if (jobs.length >= MAX_LIFECYCLE_JOBS) throw new Error("lifecycle_job_capacity_exceeded");
    const at = new Date().toISOString();
    const job = { id: jobId, digest: digest.toLowerCase(), plan: safePlan, state: "pending", createdAt: at, updatedAt: at };
    jobs.push(job);
    appendAtomicAudit(state, { jobId, from: null, to: "pending", actor, note: "created", digest: job.digest });
    return job;
  });
}
export async function transitionLifecycleJobAtomic(file, { jobId, to, actor = "system", note = "" } = {}) {
  if (!safeId.test(jobId ?? "") || !STATES.includes(to) || typeof actor !== "string" || !actor.trim() || actor.length > 100 || typeof note !== "string" || note.length > 500) throw new Error("invalid_transition_input");
  return transactState(file, state => {
    const jobs = ensureLifecycleJobs(state); ensureAuditRecords(state);
    const job = jobs.find(j => j.id === jobId);
    if (!job) throw new Error("job_not_found");
    if (to === "approved") throw new Error("approval_required");
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
    const jobs = ensureLifecycleJobs(state); ensureAuditRecords(state);
    if (!Array.isArray(state.approvals) || !Array.isArray(state.events)) throw new Error('approval_state_schema_invalid');
    if (state.events.length >= MAX_LIFECYCLE_EVENTS) throw new Error('approval_event_capacity_exceeded');
    if (state.approvals.some(a => a.tokenId === record.tokenId)) throw new Error("approval_exists");
    const job = jobs.find(j => j.id === record.jobId);
    if (!job || job.state !== "pending" || String(job.digest).toLowerCase() !== String(record.binding.digest).toLowerCase()) {
      throw new Error("approval_job_not_pending_or_digest_mismatch");
    }
    const audit = verifyAtomicAudit(ensureAuditRecords(state));
    if (!audit.valid || audit.states[job.id] !== job.state || audit.digests[job.id] !== String(job.digest).toLowerCase()) {
      throw new Error("audit_integrity_failure");
    }
    if (state.approvals.length >= MAX_LIFECYCLE_APPROVALS) throw new Error('approval_capacity_exceeded');
    if (state.approvals.some(a => a.jobId === job.id && !a.used && a.expiresAt > Date.now())) {
      throw new Error("approval_already_issued");
    }
    state.approvals.push({ ...record, used: false });
    state.events.push({ event: "approval_issued", jobId: job.id, at: new Date().toISOString() });
    appendAtomicAuditBatch(state, [{ event: "approval_issued", details: { approvalId: record.tokenId, jobId: job.id, digest: job.digest, approver: record.approver, expiresAt: record.expiresAt } }]);
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
    const jobs = ensureLifecycleJobs(state); ensureAuditRecords(state);
    if (!Array.isArray(state.approvals) || !Array.isArray(state.events)) throw new Error('approval_state_schema_invalid');
    if (state.events.length >= MAX_LIFECYCLE_EVENTS) throw new Error('approval_event_capacity_exceeded');
    const approval = state.approvals.find(a => a.tokenId === tokenId);
    if (!approval || approval.used) throw new Error("approval_missing_or_used");
    if (!Number.isSafeInteger(approval.expiresAt) || approval.expiresAt <= Date.now()) throw new Error("approval_expired");
    if (approval.jobId !== binding.jobId || approval.binding?.jobId !== binding.jobId ||
        String(approval.binding?.digest ?? "").toLowerCase() !== String(binding.digest).toLowerCase()) {
      throw new Error("approval_binding_mismatch");
    }
    if (approval.approver === consumerIdentity) throw new Error("self_approval_not_allowed");
    if (verifyApproval(approval) !== true) throw new Error("approval_binding_mismatch");
    const job = jobs.find(j => j.id === binding.jobId);
    if (!job) throw new Error("job_not_found");
    if (job.state !== "pending" || String(job.digest).toLowerCase() !== String(binding.digest).toLowerCase()) {
      throw new Error("job_not_pending_or_digest_mismatch");
    }
    const audit = verifyAtomicAudit(ensureAuditRecords(state));
    if (!audit.valid || audit.states[job.id] !== job.state || audit.digests[job.id] !== String(job.digest).toLowerCase()) {
      throw new Error("audit_integrity_failure");
    }
    const from = job.state, at = new Date().toISOString();
    approval.used = true;
    state.events.push({ event: "approval_consumed", jobId: job.id, at });
    job.state = "approved";
    job.updatedAt = at;
    appendAtomicAuditBatch(state, [
      { event: "approval_consumed", details: { approvalId: tokenId, jobId: job.id, digest: job.digest, consumer: consumerIdentity } },
      { event: "job_transition", details: { jobId: job.id, from, to: "approved", actor: consumerIdentity, note: "approval_consumed", digest: job.digest } }
    ]);
    return { approved: true, jobId: job.id, jobState: job.state, approver: approval.approver, consumerIdentity };
  });
}

export async function readAtomicLifecycle(file) {
  const state = await readState(file);
  if (state.lifecycleJobs !== undefined && !Array.isArray(state.lifecycleJobs)) return { jobs: [], auditRecords: [], integrity: { valid: false, reason: 'lifecycle_jobs_schema_invalid' } };
  if (state.auditRecords !== undefined && !Array.isArray(state.auditRecords)) return { jobs: [], auditRecords: [], integrity: { valid: false, reason: 'audit_records_schema_invalid' } };
  const jobs = state.lifecycleJobs ?? [], auditRecords = state.auditRecords ?? [];
  let integrity = verifyAtomicAudit(auditRecords);
  if (integrity.valid) {
    const jobIds = new Set();
    if (jobs.length !== Object.keys(integrity.states).length) integrity = { valid: false, reason: "job_audit_count_mismatch" };
    else for (const job of jobs) {
      if (!job || !safeId.test(String(job.id ?? "")) || jobIds.has(job.id) || integrity.states[job.id] !== job.state || integrity.digests[job.id] !== String(job.digest ?? "").toLowerCase()) { integrity = { valid: false, reason: "job_audit_state_mismatch" }; break; }
      jobIds.add(job.id);
    }
    if (integrity.valid) {
      const approvals = Array.isArray(state.approvals) ? state.approvals : [];
      if (approvals.length !== Object.keys(integrity.approvals).length) integrity = { valid: false, reason: "approval_audit_count_mismatch" };
      else for (const stored of approvals) {
        const audited = integrity.approvals[stored?.tokenId];
        if (!stored || !HASH.test(String(stored.tokenId ?? "")) || !audited || stored.jobId !== audited.jobId || String(stored.binding?.digest ?? "").toLowerCase() !== audited.digest || stored.approver !== audited.approver || stored.expiresAt !== audited.expiresAt || stored.used !== audited.used) { integrity = { valid: false, reason: "approval_audit_mismatch" }; break; }
      }
    }
  }
  return { jobs, auditRecords, integrity };
}
