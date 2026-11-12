import assert from "node:assert/strict";
import {
  AGENTS_REGISTRY,
  AGENT_SQUADS,
  getAgentPrompt
} from "../../lib/riverSSAI/agentsRegistry.mjs";
import {
  AGENT_SIGNALS,
  routeToSpecialists,
  selectTeam
} from "../../lib/riverSSAI/router.mjs";

const registryKeys = Object.keys(AGENTS_REGISTRY);
assert.equal(registryKeys.length, 90, "registry must contain Nova + 89 specialists");
assert.equal(new Set(registryKeys).size, 90, "registry keys must be unique");
assert.ok(AGENTS_REGISTRY.nova, "Nova must be registered");

const squadNames = Object.keys(AGENT_SQUADS);
assert.equal(squadNames.length, 10, "there must be exactly 10 squads");
const squadMembers = squadNames.flatMap((name) => {
  const members = AGENT_SQUADS[name];
  assert.equal(members.length, 9, `squad ${name} must contain 9 roles`);
  return members;
});
assert.equal(squadMembers.length, 90, "all squads together must contain 90 roles");
assert.equal(new Set(squadMembers).size, 90, "each role must appear in exactly one squad");
assert.deepEqual([...squadMembers].sort(), [...registryKeys].sort(), "squads must cover the registry exactly");

const signalKeys = Object.keys(AGENT_SIGNALS);
assert.equal(signalKeys.length, 89, "all 89 specialist roles must have routing signals");
for (const key of signalKeys) {
  assert.ok(AGENTS_REGISTRY[key], `signal references unknown role: ${key}`);
  assert.ok(AGENT_SIGNALS[key].length > 0, `role has no routing signals: ${key}`);
  assert.ok(getAgentPrompt(key).length > 0, `role has no prompt: ${key}`);
}
for (const key of registryKeys.filter((key) => key !== "nova")) {
  assert.ok(AGENT_SIGNALS[key], `specialist has no routing signals: ${key}`);
}

assert.ok(routeToSpecialists("Ho un problema con un pagamento PayPal", 2).includes("payments"));
assert.equal(selectTeam(4, "richiesta senza parole chiave specifiche")[0], "general_assistant");
assert.ok(selectTeam(4, "problema con il checkout e un pagamento").length <= 4);
assert.ok(selectTeam(30, "problema con il checkout e un pagamento").length <= 30);

console.log("RiverSSAI registry/router validation: PASS (90 roles, 10 squads, 89 routing maps)");
