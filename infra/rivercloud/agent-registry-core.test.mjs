import test from "node:test";
import assert from "node:assert/strict";
import { validateAgentDefinition, validateAgentRegistry, MAX_AGENT_DEFINITIONS } from "./agent-registry-core.mjs";

const schema = { type:"object", properties:{ query:{type:"string"} }, required:["query"], additionalProperties:false };
const sample = {
  id:"river.ai.search-specialist", version:"1.0.0", name:"Search specialist", domain:"research",
  capabilities:["search:public"], inputSchema:schema, outputSchema:schema, riskClass:"low",
  requiresApproval:false, maxRunSeconds:120, maxConcurrency:5, status:"draft"
};

test("valid definition passes and registry reports definitions, not running processes", () => {
  assert.deepEqual(validateAgentDefinition(sample), { valid:true });
  const result = validateAgentRegistry([sample]);
  assert.equal(result.valid, true);
  assert.equal(result.count, 1);
  assert.equal(result.byDomain.research, 1);
});

test("registry rejects duplicate IDs and extra execution fields", () => {
  assert.equal(validateAgentRegistry([sample,sample]).reason, "duplicate_agent_id");
  assert.equal(validateAgentDefinition({ ...sample, command:"shell" }).reason, "definition_schema_invalid");
});

test("high risk definitions require approval and malformed schemas are rejected", () => {
  assert.equal(validateAgentDefinition({ ...sample, riskClass:"high", requiresApproval:false }).reason, "risk_policy_invalid");
  assert.equal(validateAgentDefinition({ ...sample, inputSchema:{ type:"object", properties:{}, additionalProperties:true, required:[] } }).reason, "schema_contract_invalid");
});

test("registry has a hard ceiling of 100000 definitions without creating workers", () => {
  assert.equal(MAX_AGENT_DEFINITIONS, 100000);
  assert.equal(validateAgentRegistry(new Array(MAX_AGENT_DEFINITIONS + 1)).reason, "registry_capacity_exceeded");
  assert.equal(validateAgentRegistry(null).reason, "registry_not_array");
});


test("registry rejects cyclic and extra schema fields before snapshotting", () => {
  const cyclic = { type:"object", properties:{ query:{type:"string"} }, required:["query"], additionalProperties:false };
  cyclic.extra = cyclic;
  assert.equal(validateAgentDefinition({ ...sample, inputSchema:cyclic }).reason, "definition_json_invalid");
  const nested = { type:"string", extra:{} };
  nested.extra.self = nested.extra;
  const malformed = { type:"object", properties:{ query:nested }, required:["query"], additionalProperties:false };
  assert.equal(validateAgentDefinition({ ...sample, inputSchema:malformed }).reason, "definition_json_invalid");
  const sparseRequired = new Array(1);
  const sparseSchema = { type:"object", properties:{query:{type:"string"}}, required:sparseRequired, additionalProperties:false };
  assert.equal(validateAgentDefinition({ ...sample, inputSchema:sparseSchema }).reason, "definition_json_invalid");
});


test("registry rejects cycles, sparse arrays and non-JSON capability properties", () => {
  const cyclicCapabilities = ["search:public"];
  cyclicCapabilities.self = cyclicCapabilities;
  assert.equal(validateAgentDefinition({ ...sample, capabilities:cyclicCapabilities }).reason, "definition_json_invalid");
  const sparseCapabilities = new Array(1);
  assert.equal(validateAgentDefinition({ ...sample, capabilities:sparseCapabilities }).reason, "definition_json_invalid");
  const accessorCapabilities = ["search:public"];
  Object.defineProperty(accessorCapabilities, "extra", { enumerable:true, get(){ throw new Error("must not execute"); } });
  assert.equal(validateAgentDefinition({ ...sample, capabilities:accessorCapabilities }).reason, "definition_json_invalid");
});


test("registry accepts the full 100000-definition catalogue without creating processes", () => {
  const definitions = Array.from({ length:MAX_AGENT_DEFINITIONS }, (_, index) => ({
    ...sample, id:"agent.catalogue." + index
  }));
  const result = validateAgentRegistry(definitions);
  assert.equal(result.valid, true);
  assert.equal(result.count, MAX_AGENT_DEFINITIONS);
  assert.equal(result.byDomain.research, MAX_AGENT_DEFINITIONS);
});


test("registry rejects non-enumerable or hidden top-level definition fields", () => {
  const hidden = { ...sample };
  Object.defineProperty(hidden, "id", { value:sample.id, enumerable:false, configurable:true });
  assert.equal(validateAgentDefinition(hidden).reason, "definition_schema_invalid");
  const extra = { ...sample };
  Object.defineProperty(extra, "hiddenExecution", { value:"not-allowed", enumerable:false });
  assert.equal(validateAgentDefinition(extra).reason, "definition_schema_invalid");
});


test("registry rejects accessor, sparse and hidden catalogue entries without getter execution", () => {
  let getterCalls=0;
  const accessor=new Array(1);
  Object.defineProperty(accessor,"0",{enumerable:true,get(){getterCalls++;return sample;}});
  assert.equal(validateAgentRegistry(accessor).reason,"registry_array_invalid");

  const sparse=new Array(2);
  sparse[1]=sample;
  assert.equal(validateAgentRegistry(sparse).reason,"registry_array_invalid");

  const hidden=[sample];
  Object.defineProperty(hidden,"extra",{value:"hidden",enumerable:false});
  assert.equal(validateAgentRegistry(hidden).reason,"registry_array_invalid");

  const symbols=[sample];
  symbols[Symbol("hidden")]=sample;
  assert.equal(validateAgentRegistry(symbols).reason,"registry_array_invalid");
  assert.equal(getterCalls,0);
});
