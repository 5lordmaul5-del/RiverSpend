// RiverCloud runner boundary prototype. It prepares and verifies a run record only; it does not execute builds.
import { createHash } from "node:crypto";
import { validateDeployRequest, planDigest } from "./engine.mjs";

const SAFETY = Object.freeze({ commandExecution: false, networkFetch: false, dockerSocket: false, production: false });
const EXPECTED_KEYS = ["runId", "digest", "plan", "status", "safety", "createdAt", "envelopeDigest"];
const SAFETY_KEYS = ["commandExecution", "networkFetch", "dockerSocket", "production"];
function envelopePayload(run) {
  return { runId: run.runId, digest: run.digest, plan: run.plan, status: run.status, safety: run.safety, createdAt: run.createdAt };
}
function envelopeDigest(run) {
  return createHash("sha256").update(JSON.stringify(envelopePayload(run))).digest("hex");
}
export function prepareRun(input) {
  const plan = validateDeployRequest(input);
  const digest = planDigest(plan);
  const base = {
    runId: digest.slice(0, 20),
    digest,
    plan,
    status: "prepared_not_executed",
    safety: Object.freeze({ ...SAFETY }),
    createdAt: new Date().toISOString(),
  };
  return Object.freeze({ ...base, envelopeDigest: envelopeDigest(base) });
}
export function verifyPreparedRun(run) {
  if (!run || typeof run !== "object" || Array.isArray(run)) return { ok: false, reason: "run_not_object" };
  if (Object.keys(run).sort().join("|") !== [...EXPECTED_KEYS].sort().join("|")) return { ok: false, reason: "run_schema_invalid" };
  if (run.status !== "prepared_not_executed") return { ok: false, reason: "run_status_invalid" };
  if (!run.safety || typeof run.safety !== "object" || Array.isArray(run.safety) || Object.keys(run.safety).sort().join("|") !== [...SAFETY_KEYS].sort().join("|") || SAFETY_KEYS.some(k => run.safety[k] !== false)) return { ok: false, reason: "unsafe_flags" };
  if (typeof run.createdAt !== "string" || !Number.isFinite(Date.parse(run.createdAt)) || new Date(run.createdAt).toISOString() !== run.createdAt) return { ok: false, reason: "timestamp_invalid" };
  let plan;
  try { plan = validateDeployRequest(run.plan); } catch { return { ok: false, reason: "plan_invalid" }; }
  if (JSON.stringify(plan) !== JSON.stringify(run.plan)) return { ok: false, reason: "plan_schema_invalid" };
  const digest = planDigest(plan);
  if (run.digest !== digest || run.runId !== digest.slice(0, 20)) return { ok: false, reason: "plan_digest_mismatch" };
  if (typeof run.envelopeDigest !== "string" || !/^[a-f0-9]{64}$/.test(run.envelopeDigest) || envelopeDigest(run) !== run.envelopeDigest) return { ok: false, reason: "envelope_digest_mismatch" };
  return { ok: true, digest, runId: run.runId };
}
export function executeRun(_run) {
  throw new Error("runner_execution_disabled: isolated runtime and approval gate are not implemented");
}
