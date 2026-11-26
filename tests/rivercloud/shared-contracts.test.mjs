import test from "node:test";
import assert from "node:assert/strict";
import { DEPLOY_REQUEST_KEYS, ACTOR_ROLES, normalizeActorContext, POLICY_ERROR_CODES, CAPACITY_ERROR_CODES } from "../../infra/rivercloud/shared-contracts.mjs";

test("shared deploy request keys are canonical and frozen",()=>{
 assert.deepEqual(DEPLOY_REQUEST_KEYS,["projectId","branch","commit","target"]);
 assert.equal(Object.isFrozen(DEPLOY_REQUEST_KEYS),true);
});
test("actor context normalization accepts valid pseudonym and roles",()=>{
 const actor=normalizeActorContext({actorRef:"a".repeat(64),roles:["operator","viewer","operator"]});
 assert.deepEqual(actor,{actorRef:"a".repeat(64),roles:["operator","viewer"].sort()});
});
test("actor context rejects invalid actor shape and role",()=>{
 assert.throws(()=>normalizeActorContext({actorRef:"x",roles:["owner"]}),/invalid_actor_context/);
 assert.throws(()=>normalizeActorContext({actorRef:"a".repeat(64),roles:["root"]}),/invalid_actor_context/);
});
test("contract error catalogs are nonempty and frozen",()=>{
 assert.ok(POLICY_ERROR_CODES.includes("invalid_request"));
 assert.ok(CAPACITY_ERROR_CODES.includes("queue_capacity_exceeded"));
 assert.equal(Object.isFrozen(ACTOR_ROLES),true);
});
