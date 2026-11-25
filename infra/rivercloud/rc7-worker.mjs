// RC-7 runtime adapter scaffold. It only produces a reviewable execution envelope.
// No checkout, shell, container, network, or build execution is performed.
import { validateWorkerJob } from "./worker-spec.mjs";
import { createHash } from "node:crypto";

export function makeExecutionEnvelope(input){
 const job=validateWorkerJob(input);
 const envelope={job,workerMode:"disabled",execution:"not_started",isolationRequired:["ephemeral_workspace","non_root","no_host_mounts","no_docker_socket","network_egress_allowlist","cpu_memory_time_limits"],approvalRequired:true,createdAt:new Date().toISOString()};
 const digest=createHash("sha256").update(JSON.stringify(envelope)).digest("hex");
 return Object.freeze({...envelope,envelopeDigest:digest});
}
export function startExecution(_envelope){
 throw new Error("rc7_execution_disabled: runtime isolation adapter, approvals and audit integration not implemented");
}
