// RC-158 gateway tests — authored, not executed here.
import assert from "node:assert/strict";
import { diagnosticGateway, gatewayRoutes } from "./diagnostic-gateway.mjs";
import { validateContract } from "./interface-contract.mjs";
assert.deepEqual(gatewayRoutes(),["observatory","diagnostic-report"]);
for(const route of gatewayRoutes())assert.equal(validateContract(diagnosticGateway(Object.freeze({}),route)),true);
assert.equal(validateContract(diagnosticGateway({}, "execute")),true);
assert.equal(diagnosticGateway({}, "execute").code,"invalid_input");
