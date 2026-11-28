// RiverSSAI tool authorization policy: fail closed; registry defines capability classes, not executors.
export const TOOL_POLICY = Object.freeze({
  "system.health": Object.freeze({ risk: "low", approval: false, enabled: true }),
  "memory.read": Object.freeze({ risk: "low", approval: false, enabled: true }),
  "memory.write": Object.freeze({ risk: "moderate", approval: false, enabled: true }),
  "repo.read": Object.freeze({ risk: "moderate", approval: true, enabled: false }),
  "repo.write": Object.freeze({ risk: "high", approval: true, enabled: false }),
  "shell.execute": Object.freeze({ risk: "critical", approval: true, enabled: false }),
  "payment.execute": Object.freeze({ risk: "critical", approval: true, enabled: false }),
  "publish.deploy": Object.freeze({ risk: "critical", approval: true, enabled: false }),
  "data.delete": Object.freeze({ risk: "critical", approval: true, enabled: false })
});

export function authorizeToolRequest(name, { approved = false } = {}) {
  if (typeof name !== "string" || !Object.prototype.hasOwnProperty.call(TOOL_POLICY, name)) {
    return Object.freeze({ allowed: false, reason: "unknown-tool-denied" });
  }
  const policy = TOOL_POLICY[name];
  if (!policy.enabled) return Object.freeze({ allowed: false, reason: "tool-disabled" });
  if (policy.approval && !approved) return Object.freeze({ allowed: false, reason: "human-approval-required" });
  return Object.freeze({ allowed: true, reason: "policy-allowed", risk: policy.risk });
}
