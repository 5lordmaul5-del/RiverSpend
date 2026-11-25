// RiverCloud deployment engine prototype: policy/queue only, no shell execution.
// This module validates a deployment request and creates an auditable plan.
// Actual runner integration is intentionally not connected.
import { createHash } from "node:crypto";

const POLICY = Object.freeze({
  projects: { riverspend: { repository: "5lordmaul5-del/RiverSpend", branches: ["main"], targets: ["staging"] } },
  productionRequiresApproval: true,
});

export function validateDeployRequest(input) {
  if (!input || typeof input !== "object") throw new Error("invalid_request");
  const projectId = String(input.projectId || "");
  const commit = String(input.commit || "");
  const target = String(input.target || "");
  const project = POLICY.projects[projectId];
  if (!project) throw new Error("project_not_allowlisted");
  if (!project.targets.includes(target)) throw new Error("target_not_allowed");
  if (!/^[0-9a-f]{40}$/i.test(commit)) throw new Error("immutable_commit_sha_required");
  const branch = String(input.branch || "");
  if (!project.branches.includes(branch)) throw new Error("branch_not_allowlisted");
  if (target === "production" && POLICY.productionRequiresApproval) throw new Error("production_approval_required");
  return Object.freeze({ projectId, repository: project.repository, branch, commit: commit.toLowerCase(), target, status: "planned_not_queued" });
}

export function planDigest(plan) {
  return createHash("sha256").update(JSON.stringify(plan)).digest("hex");
}

export function describePrototype() {
  return { state: "policy_only", runnerConnected: false, shellExecution: false, dockerSocketAccess: false, deployable: false };
}
