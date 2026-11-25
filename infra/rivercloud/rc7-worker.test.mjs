import test from "node:test";import assert from "node:assert/strict";import {makeExecutionEnvelope,startExecution} from "./rc7-worker.mjs";
const job={commit:"0123456789abcdef0123456789abcdef01234567",target:"staging",profile:"node-static"};
test("envelope records required isolation and approval",()=>{const e=makeExecutionEnvelope(job);assert.equal(e.execution,"not_started");assert.equal(e.approvalRequired,true);assert.ok(e.envelopeDigest);assert.ok(e.isolationRequired.includes("no_docker_socket"));});
test("execution is deliberately disabled",()=>assert.throws(()=>startExecution(makeExecutionEnvelope(job)),/rc7_execution_disabled/));
test("invalid profile is rejected",()=>assert.throws(()=>makeExecutionEnvelope({...job,profile:"shell"}),/profile_not_allowlisted/));
