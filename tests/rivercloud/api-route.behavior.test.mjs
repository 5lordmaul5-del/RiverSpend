import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, chmod, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import http from "node:http";
import { createServer } from "../../infra/rivercloud/server.mjs";
import { createProxyApiServer } from "../../infra/rivercloud/rc34-proxy-api.mjs";

async function stateFixture(t) {
  const dir = await mkdtemp(path.join(os.tmpdir(), "rivercloud-api-fixture-"));
  await chmod(dir, 0o700);
  t.after(() => rm(dir, { recursive: true, force: true }));
  return path.join(dir, "state.json");
}
async function listen(t, server) {
  await new Promise((resolve, reject) => { server.once("error", reject); server.listen(0, "127.0.0.1", resolve); });
  t.after(() => new Promise(resolve => server.close(resolve)));
  return server.address().port;
}
function request(port, { method="GET", pathname="/health", headers={}, body }={}) {
  return new Promise((resolve, reject) => {
    const req=http.request({host:"127.0.0.1",port,path:pathname,method,headers},res=>{
      let data="";res.setEncoding("utf8");res.on("data",chunk=>data+=chunk);res.on("end",()=>resolve({status:res.statusCode,headers:res.headers,body:data?JSON.parse(data):null}));
    });
    req.on("error",reject);if(body!==undefined)req.write(body);req.end();
  });
}
const requestPlan={ projectId:"riverspend", branch:"main", commit:"a".repeat(40), target:"staging" };
const secret="fixture-api-token-which-is-at-least-32-characters-long";
const pseudonymSecret="fixture-pseudonym-secret-longer-than-32-characters";

test("engine API rejects missing bearer and returns plan-only health when authenticated", async t=>{
  const storeFile=await stateFixture(t), port=await listen(t,createServer({token:secret,storeFile}));
  assert.equal((await request(port)).status,401);
  const health=await request(port,{headers:{authorization:"Bearer "+secret}});
  assert.equal(health.status,200);assert.equal(health.body.runnerConnected,false);assert.equal(health.body.executionEnabled,false);
});

test("engine API plan endpoint accepts a bounded plan-only request and idempotent repeat", async t=>{
  const storeFile=await stateFixture(t), port=await listen(t,createServer({token:secret,storeFile}));
  const headers={authorization:"Bearer "+secret,"content-type":"application/json"};
  const first=await request(port,{method:"POST",pathname:"/deploy",headers,body:JSON.stringify(requestPlan)});
  assert.equal(first.status,202);assert.equal(first.body.job.state,"accepted_not_executed");
  const repeat=await request(port,{method:"POST",pathname:"/deploy",headers,body:JSON.stringify(requestPlan)});
  assert.equal(repeat.status,200);assert.equal(repeat.body.duplicate,true);
  assert.equal((await request(port,{headers:{authorization:"Bearer "+secret}})).body.jobs.length,1);
});

test("proxy API refuses unmapped groups and grants viewer read-only health", async t=>{
  const storeFile=await stateFixture(t),port=await listen(t,createProxyApiServer({storeFile,actorPseudonymSecret:pseudonymSecret,trustedProxyAddress:"127.0.0.1"}));
  const base={"x-forwarded-user":"fixture-user","x-forwarded-groups":"UnknownGroup"};
  assert.equal((await request(port,{pathname:"/api/health",headers:base})).status,403);
  const viewer={"x-forwarded-user":"fixture-user","x-forwarded-groups":"RiverCloudViewers"};
  const health=await request(port,{pathname:"/api/health",headers:viewer});
  assert.equal(health.status,200);assert.equal(health.body.executionEnabled,false);
  const forbidden=await request(port,{method:"POST",pathname:"/api/plan",headers:{...viewer,"content-type":"application/json"},body:JSON.stringify(requestPlan)});
  assert.equal(forbidden.status,403);
});

test("proxy API operator can queue a plan but response stays non-executing", async t=>{
  const storeFile=await stateFixture(t),port=await listen(t,createProxyApiServer({storeFile,actorPseudonymSecret:pseudonymSecret,trustedProxyAddress:"127.0.0.1"}));
  const headers={"x-forwarded-user":"fixture-operator","x-forwarded-groups":"RiverCloudOperators","content-type":"application/json"};
  const result=await request(port,{method:"POST",pathname:"/api/plan",headers,body:JSON.stringify(requestPlan)});
  assert.equal(result.status,202);assert.equal(result.body.job.state,"accepted_not_executed");
  assert.match(result.body.job.actorRef,/^[a-f0-9]{64}$/);
  assert.equal(result.body.notice,"Plan only; no build or deployment is executed.");
});
