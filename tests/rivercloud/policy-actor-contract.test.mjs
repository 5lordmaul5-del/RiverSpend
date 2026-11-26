import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { DEPLOY_REQUEST_KEYS, ACTOR_ROLES, normalizeActorContext } from "../../infra/rivercloud/shared-contracts.mjs";
import { PROJECT_POLICY, WORKER_PROFILES } from "../../infra/rivercloud/unified-policy.mjs";

test("policy and shared contract remain restrictive at source level", async () => {
  assert.deepEqual(DEPLOY_REQUEST_KEYS, ["projectId", "branch", "commit", "target"]);
  assert.deepEqual(ACTOR_ROLES, ["owner", "admin", "operator", "auditor", "viewer"]);
  assert.deepEqual(PROJECT_POLICY.riverspend.branches, ["main"]);
  assert.deepEqual(PROJECT_POLICY.riverspend.targets, ["staging"]);
  assert.deepEqual(Object.keys(WORKER_PROFILES).sort(), ["node-static", "node-tests"]);
});

test("actor context normalization requires bounded pseudonym and known roles", () => {
  assert.throws(() => normalizeActorContext({actorRef:"bad",roles:["owner"]}), /invalid_actor_context/);
  assert.throws(() => normalizeActorContext({actorRef:"a".repeat(64),roles:["root"]}), /invalid_actor_context/);
  const actor = normalizeActorContext({actorRef:"A".repeat(64),roles:["viewer","viewer"]});
  assert.deepEqual(actor, {actorRef:"a".repeat(64),roles:["viewer"]});
});

test("policy resolver remains declarative and does not include execution wiring", async () => {
  const source = await readFile(new URL("../../infra/rivercloud/unified-policy.mjs", import.meta.url), "utf8");
  assert.doesNotMatch(source, /child_process|spawn\(|exec\(/);
  assert.match(source, /branches:Object\.freeze\(\["main"\]\)/);
});
