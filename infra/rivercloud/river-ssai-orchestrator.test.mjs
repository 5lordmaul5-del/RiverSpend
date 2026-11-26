import test from "node:test";
import assert from "node:assert/strict";
import {createApiKey} from "./api-key-core.mjs";
import {createRiverSSAIOrchestrator} from "./river-ssai-orchestrator.mjs";

const now=1_800_000_000_000,ttl=60*60*1000;
const schema={type:"object",properties:{prompt:{type:"string"},count:{type:"integer"}},required:["prompt"],additionalProperties:false};
const definition={id:"assistant.test",version:"1.0.0",name:"Mock specialist",domain:"tests",capabilities:["summarize"],inputSchema:schema,outputSchema:{type:"object",properties:{result:{type:"string"}},required:["result"],additionalProperties:false},riskClass:"low",requiresApproval:false,maxRunSeconds:30,maxConcurrency:2,status:"active"};
const high={...definition,id:"assistant.high",riskClass:"high",requiresApproval:true};
const keyData=createApiKey({ownerId:"test-owner",scopes:["ai:invoke"],now,ttlMs:ttl});
const noScope=createApiKey({ownerId:"test-owner",scopes:["signals:send"],now,ttlMs:ttl});
const invoke={key:keyData.key,record:keyData.record,agentId:definition.id,version:definition.version,input:{prompt:"hello"},requestId:"req-1",idempotencyKey:"idempotency-123456",now};

test("mock orchestrator accepts valid scoped plans without launching workers",async()=>{
  const o=createRiverSSAIOrchestrator({definitions:[definition]});
  const result=await o.planInvoke(invoke);
  assert.equal(result.status,202);assert.equal(result.duplicate,false);
  assert.equal(result.plan.executionEnabled,false);assert.equal(result.plan.status,"accepted_mock");
  assert.equal(o.getDefinitionCount(),1);assert.equal(o.getIdempotencyCount(),1);
});

test("scope, unknown agent, inactive definition and schema failures are denied",async()=>{
  const o=createRiverSSAIOrchestrator({definitions:[definition,{...definition,id:"assistant.draft",status:"draft"}]});
  assert.equal((await o.planInvoke({...invoke,key:noScope.key,record:noScope.record})).status,403);
  assert.equal((await o.planInvoke({...invoke,agentId:"missing"})).status,404);
  assert.equal((await o.planInvoke({...invoke,agentId:"assistant.draft"})).error,"agent_not_active");
  assert.equal((await o.planInvoke({...invoke,input:{prompt:1}})).error,"input_schema_invalid");
  assert.equal((await o.planInvoke({...invoke,input:{prompt:"x",extra:true}})).error,"input_schema_invalid");
});

test("high-risk definitions fail closed until a binding-aware approval is verified",async()=>{
  const o=createRiverSSAIOrchestrator({definitions:[high],approvalVerifier:({token,binding})=>token==="approved-token-123"&&binding.agentId===high.id&&binding.inputDigest.length===64});
  const request={...invoke,agentId:high.id};
  assert.equal((await o.planInvoke(request)).error,"approval_required");
  assert.equal((await o.planInvoke({...request,approvalToken:"unverified-token-123"})).error,"approval_not_verified");
  const result=await o.planInvoke({...request,approvalToken:"approved-token-123"});
  assert.equal(result.status,202);assert.equal(result.plan.approvalVerified,true);assert.equal(result.plan.executionEnabled,false);
});

test("approval verifier exceptions fail closed",async()=>{
  const o=createRiverSSAIOrchestrator({definitions:[high],approvalVerifier:()=>{throw new Error("verification_failure");}});
  assert.equal((await o.planInvoke({...invoke,agentId:high.id,approvalToken:"approval-token-123456"})).error,"approval_not_verified");
});

test("idempotency returns same plan for same input and conflicts for changed input",async()=>{
  const o=createRiverSSAIOrchestrator({definitions:[definition]});
  const first=await o.planInvoke(invoke);const duplicate=await o.planInvoke({...invoke,requestId:"req-2"});
  assert.equal(duplicate.duplicate,true);assert.deepEqual(duplicate.plan,first.plan);
  const conflict=await o.planInvoke({...invoke,input:{prompt:"different"}});
  assert.equal(conflict.status,409);assert.equal(conflict.error,"idempotency_conflict");
});

test("input size and idempotency capacity are bounded",async()=>{
  const o=createRiverSSAIOrchestrator({definitions:[definition],maxIdempotencyEntries:1});
  const large=await o.planInvoke({...invoke,input:{prompt:"x".repeat(9000)}});
  assert.equal(large.status,413);
  const first=await o.planInvoke(invoke);assert.equal(first.status,202);
  const second=await o.planInvoke({...invoke,idempotencyKey:"idempotency-abcdef"});
  assert.equal(second.status,503);assert.equal(second.error,"idempotency_capacity_exceeded");
});

test("orchestrator validates registry at construction",()=>{
  assert.throws(()=>createRiverSSAIOrchestrator({definitions:[{...definition,riskClass:"high",requiresApproval:false}]}),/registry_invalid/);
});

test("registry definitions are immutable snapshots after orchestrator construction",async()=>{
  const mutable={...definition,inputSchema:structuredClone(definition.inputSchema)};
  const o=createRiverSSAIOrchestrator({definitions:[mutable]});
  mutable.status="draft";mutable.riskClass="high";mutable.requiresApproval=true;mutable.inputSchema.properties.prompt.type="integer";
  const result=await o.planInvoke({...invoke,agentId:mutable.id});
  assert.equal(result.status,202);assert.equal(result.plan.riskClass,"low");assert.equal(result.plan.requiresApproval,false);
  assert.equal((await o.planInvoke({...invoke,agentId:mutable.id,idempotencyKey:"idempotency-abcdef",input:{prompt:1}})).error,"input_schema_invalid");
});


test("orchestrator rejects sparse arrays and excessive nesting",async()=>{
  const arrayDefinition={...definition,inputSchema:{type:"object",properties:{prompt:{type:"string"},items:{type:"array"}},required:["prompt"],additionalProperties:false}};
  const o=createRiverSSAIOrchestrator({definitions:[arrayDefinition]});
  const sparse=new Array(2);sparse[1]="x";
  const sparseResult=await o.planInvoke({...invoke,input:{prompt:"ok",items:sparse}});
  assert.equal(sparseResult.status,400);assert.equal(sparseResult.error,"input_invalid");
  let deep=[];let cursor=deep;for(let i=0;i<40;i++){const next=[];cursor.push(next);cursor=next;}
  const deepResult=await o.planInvoke({...invoke,input:{prompt:"ok",items:deep},idempotencyKey:"idempotency-depth"});
  assert.equal(deepResult.status,400);assert.equal(deepResult.error,"input_invalid");
});


test("concurrent high-risk requests reserve idempotency and capacity", async () => {
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  let verificationCalls = 0;
  const o = createRiverSSAIOrchestrator({
    definitions:[high],
    maxIdempotencyEntries:1,
    approvalVerifier:async () => { verificationCalls++; await gate; return true; }
  });
  const firstPromise = o.planInvoke({ ...invoke, agentId:high.id, approvalToken:"approval-token-123456" });
  const duplicatePromise = o.planInvoke({ ...invoke, requestId:"req-duplicate", agentId:high.id, approvalToken:"approval-token-123456" });
  const overflowPromise = o.planInvoke({ ...invoke, agentId:high.id, idempotencyKey:"idempotency-other", approvalToken:"approval-token-123456" });
  const overflow = await overflowPromise;
  assert.equal(overflow.status,503);
  release();
  const [first, duplicate] = await Promise.all([firstPromise, duplicatePromise]);
  assert.equal(first.status,202);
  assert.equal(first.duplicate,false);
  assert.equal(duplicate.status,202);
  assert.equal(duplicate.duplicate,true);
  assert.equal(verificationCalls,1);
  assert.equal(o.getIdempotencyCount(),1);
});
