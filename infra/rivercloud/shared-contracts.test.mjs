import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { API_KEY_SCOPES } from "./api-key-core.mjs";
import { MAX_AGENT_DEFINITIONS } from "./agent-registry-core.mjs";\nimport { MOCK_GATEWAY_ROUTES } from "./gateway-mock.mjs";

const root=path.dirname(fileURLToPath(import.meta.url));
const contract=JSON.parse(await readFile(path.join(root,"SHARED-CONTRACTS-v1.json"),"utf8"));

test("shared contract versions gateway and five service boundaries",()=>{
  assert.equal(contract.version,"river-spend.shared.v1");
  assert.equal(contract.common.apiPrefix,"/api/v1");
  for(const service of ["RiverCloud","RiverSSAI","RiverAPI","Signals","Shop"]) assert.ok(Object.hasOwn(contract.services,service));
  assert.equal(contract.boundary.noProductionKeys,true);
  assert.equal(contract.boundary.noRealPaymentAuthorization,true);
});

test("contract scope catalog stays aligned with API key core",()=>{
  assert.deepEqual(contract.apiKey.scopes,API_KEY_SCOPES);
  assert.equal(contract.apiKey.secretReturnedOnce,true);
  assert.match(contract.apiKey.storage,/digest only/i);
});

test("contract routes stay aligned with mock gateway",()=>{\n  assert.deepEqual(contract.mockGatewayRoutes,MOCK_GATEWAY_ROUTES);\n});\n\ntest("100000 registry ceiling is a definition catalogue, not process count",()=>{
  assert.equal(contract.agentRegistry.maximumDefinitions,MAX_AGENT_DEFINITIONS);
  assert.equal(contract.agentRegistry.definitionCatalogOnly,true);
  assert.equal(contract.agentRegistry.workerProcessesCreated,false);
  assert.equal(contract.agentRegistry.highRiskRequiresApproval,true);
});
