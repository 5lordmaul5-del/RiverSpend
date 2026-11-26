import test from "node:test";
import assert from "node:assert/strict";
import { reconcileAcceptedPlans } from "../../infra/rivercloud/queue-lifecycle-reconciliation.mjs";

test("reconciliation adapter is exported as an explicit function", () => {
  assert.equal(typeof reconcileAcceptedPlans, "function");
});
