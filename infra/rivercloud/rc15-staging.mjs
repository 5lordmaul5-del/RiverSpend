const PROJECTS = new Set(["riverspend"]);
const PROFILES = Object.freeze({ "node-static": Object.freeze({ network: false, readOnly: true, timeoutMs: 30000 }), "node-tests": Object.freeze({ network: false, readOnly: false, timeoutMs: 120000 }) });
const SAFE = /^[a-f0-9]{40}$/i;
const SAFE_PATH = /^\/staging\/[A-Za-z0-9][A-Za-z0-9_-]*(?:\/[A-Za-z0-9][A-Za-z0-9_-]*)*$/;

export function createStagingPlan({ project, commit, profile, stagingPath, approved = false } = {}) {
  if (typeof project !== "string" || !PROJECTS.has(project)) throw Error("project_not_allowlisted");
  if (!SAFE.test(commit ?? "")) throw Error("commit_sha_required");
  if (!Object.hasOwn(PROFILES, profile)) throw Error("profile_not_allowed");
  if (typeof stagingPath !== "string" || !SAFE_PATH.test(stagingPath)) throw Error("staging_path_required");
  if (approved !== true) throw Error("approval_required");
  return Object.freeze({ schema: "rivercloud.staging-plan.v1", project, commit: commit.toLowerCase(), profile, stagingPath, limits: PROFILES[profile], executionEnabled: false, createdAt: new Date().toISOString() });
}

export function validateWorkerSpec(spec) {
  if (!spec || spec.schema !== "rivercloud.staging-plan.v1" || spec.executionEnabled !== false) return { ok: false, reason: "invalid_or_enabled_spec" };
  if (typeof spec.project !== "string" || !PROJECTS.has(spec.project)) return { ok: false, reason: "project_denied" };
  if (!Object.hasOwn(PROFILES, spec.profile)) return { ok: false, reason: "profile_denied" };
  if (!SAFE.test(spec.commit ?? "")) return { ok: false, reason: "commit_invalid" };
  if (typeof spec.stagingPath !== "string" || !SAFE_PATH.test(spec.stagingPath)) return { ok: false, reason: "staging_path_invalid" };
  const expected = PROFILES[spec.profile], limits = spec.limits;
  if (!limits || limits.network !== expected.network || limits.readOnly !== expected.readOnly || limits.timeoutMs !== expected.timeoutMs) return { ok: false, reason: "limits_mismatch" };
  return { ok: true };
}

export function stagingIsolationChecklist() {
  return Object.freeze(["Dedicated staging host or VM/container isolation", "No production secrets or production volumes", "Worker runs as non-root with read-only base filesystem", "CPU/memory/pids/timeout limits", "No outbound network by default; explicit allowlist if required", "No Docker socket mount", "Separate staging credentials and data", "Immutable source SHA and artifact digest", "Logs and audit trail", "Snapshot/cleanup policy"]);
}
