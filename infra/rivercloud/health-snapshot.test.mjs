// RC-162 snapshot tests — authored, not executed.
import assert from "node:assert/strict";
import {buildHealthSnapshot,validateHealthSnapshot} from "./health-snapshot.mjs";
const records=["gateway","observatory","diagnostic-report","boundary-isolation"].map(component=>({component,faultCode:"none",integrity:true,availability:true}));
const s=buildHealthSnapshot(records);assert.equal(validateHealthSnapshot(s),true);assert.equal(s.status,"healthy");
assert.equal(buildHealthSnapshot([]).status,"degraded");
assert.equal(validateHealthSnapshot(null),false);
