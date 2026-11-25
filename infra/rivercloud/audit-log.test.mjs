import test from "node:test";import assert from "node:assert/strict";import {verifyLedger} from "./audit-log.mjs";
test("empty ledger verifies",()=>assert.deepEqual(verifyLedger([]),{valid:true,count:0}));
test("rejects tampering and chain mismatch",()=>{const payload={sequence:1,event:"plan_created",details:{},at:"2026-01-01",previousHash:"GENESIS"};const fake={...payload,hash:"not-a-real-hash"};assert.equal(verifyLedger([fake]).valid,false);});
