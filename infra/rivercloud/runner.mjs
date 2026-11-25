// RiverCloud runner boundary prototype. It prepares a run record only; it does not execute builds.
import { validateDeployRequest, planDigest } from "./engine.mjs";

export function prepareRun(input) {
  const plan = validateDeployRequest(input);
  const digest = planDigest(plan);
  return Object.freeze({
    runId: digest.slice(0, 20),
    digest,
    plan,
    status: "prepared_not_executed",
    safety: Object.freeze({ commandExecution: false, networkFetch: false, dockerSocket: false, production: false }),
    createdAt: new Date().toISOString(),
  });
}

export function executeRun(_run) {
  throw new Error("runner_execution_disabled: isolated runtime and approval gate are not implemented");
}
