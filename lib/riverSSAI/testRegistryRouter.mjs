import assert from "node:assert/strict";
import { AGENTS_REGISTRY, AGENT_SQUADS, getAgentPrompt } from "./agentsRegistry.mjs";
import { routeToSpecialists, routeToSpecialist, routeToAgent, selectTeam } from "./router.mjs";

assert.equal(Object.keys(AGENTS_REGISTRY).length, 90, "expected 90 registered roles");
assert.equal(Object.keys(AGENT_SQUADS).length, 10, "expected 10 squads");
for (const [squad, members] of Object.entries(AGENT_SQUADS)) {
  assert.ok(Array.isArray(members) && members.length > 0, `squad ${squad} must have members`);
  for (const key of members) assert.ok(AGENTS_REGISTRY[key], `unregistered squad member: ${key}`);
}
for (const key of Object.keys(AGENTS_REGISTRY)) assert.equal(typeof getAgentPrompt(key), "string");
assert.ok(routeToSpecialists("bug API JavaScript", 3).includes("tech"));
assert.equal(routeToSpecialist("richiesta senza segnali specializzati"), "general_assistant");
assert.equal(routeToAgent("richiesta senza segnali specializzati"), "general_assistant");
assert.ok(selectTeam(4, "bug API codice").length <= 4);
assert.ok(selectTeam(99, "bug API codice").length <= 30);
console.log("registry/router tests: PASS");
