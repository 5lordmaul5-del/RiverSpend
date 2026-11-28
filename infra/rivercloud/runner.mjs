// RiverCloud runner boundary prototype. It prepares and verifies a run record only; it does not execute builds.
import { createHash } from "node:crypto";
import { validateDeployRequest, planDigest, exactDataObject } from "./engine.mjs";

const SAFETY = Object.freeze({ commandExecution: false, networkFetch: false, dockerSocket: false, production: false });
const EXPECTED_KEYS = ["runId", "digest", "plan", "status", "safety", "createdAt", "envelopeDigest"];
const SAFETY_KEYS = ["commandExecution", "networkFetch", "dockerSocket", "production"];
const PLAN_KEYS=["projectId","repository","branch","commit","target","status"];
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
  // Snapshot the entire envelope and safety flags before reading values; no getters are evaluated.
  const data=exactDataObject(run,EXPECTED_KEYS);
  if(!data)return {ok:false,reason:"run_schema_invalid"};
  if (data.status !== "prepared_not_executed") return { ok: false, reason: "run_status_invalid" };
  const safety=exactDataObject(data.safety,SAFETY_KEYS);
  if(!safety||SAFETY_KEYS.some(k=>safety[k]!==false))return {ok:false,reason:"unsafe_flags"};
  if (typeof data.createdAt !== "string" || !Number.isFinite(Date.parse(data.createdAt)) || new Date(data.createdAt).toISOString() !== data.createdAt) return { ok: false, reason: "timestamp_invalid" };
  const planData=exactDataObject(data.plan,PLAN_KEYS);
  if(!planData)return {ok:false,reason:"plan_schema_invalid"};
  let plan;
  try { plan = validateDeployRequest({projectId:planData.projectId,branch:planData.branch,commit:planData.commit,target:planData.target}); } catch { return { ok: false, reason: "plan_invalid" }; }
  if(planData.repository!==plan.repository||planData.status!==plan.status||JSON.stringify(plan)!==JSON.stringify(planData))return {ok:false,reason:"plan_schema_invalid"};
  const digest = planDigest(plan);
  if (data.digest !== digest || data.runId !== digest.slice(0, 20)) return { ok: false, reason: "plan_digest_mismatch" };
  const normalized={runId:data.runId,digest:data.digest,plan,safety:Object.freeze({...safety}),status:data.status,createdAt:data.createdAt};
  if (typeof data.envelopeDigest !== "string" || !/^[a-f0-9]{64}$/.test(data.envelopeDigest) || envelopeDigest(normalized) !== data.envelopeDigest) return { ok: false, reason: "envelope_digest_mismatch" };
  return { ok: true, digest, runId: data.runId };
}
export function executeRun(_run) {
  throw new Error("runner_execution_disabled: isolated runtime and approval gate are not implemented");
}
