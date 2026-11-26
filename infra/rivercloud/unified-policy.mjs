// Shared RiverCloud deployment policy. Declarative only; does not authorize execution.
export const PROJECT_POLICY = Object.freeze({
  riverspend: Object.freeze({ repository: "5lordmaul5-del/RiverSpend", branches: Object.freeze(["main"]), targets: Object.freeze(["staging"]) })
});
export const WORKER_PROFILES = Object.freeze({
  "node-static": Object.freeze({ runtime:"node", buildProfile:"static-site", timeoutSeconds:300, network:"restricted" }),
  "node-tests": Object.freeze({ runtime:"node", buildProfile:"test-suite", timeoutSeconds:300, network:"restricted" })
});
export function resolveProjectPolicy(projectId, branch, target) {
  const p = PROJECT_POLICY[projectId];
  if (!p) throw new Error("project_not_allowlisted");
  if (!p.branches.includes(branch)) throw new Error("branch_not_allowlisted");
  if (!p.targets.includes(target)) throw new Error("target_not_allowed");
  return p;
}
export function resolveWorkerProfile(profile) {
  const p = WORKER_PROFILES[profile];
  if (!p) throw new Error("profile_not_allowlisted");
  return p;
}
