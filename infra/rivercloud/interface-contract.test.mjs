import test from "node:test";import assert from "node:assert/strict";import {makeContract,validateContract,contractCodes} from "./interface-contract.mjs";
test("success contract validates",()=>assert.equal(validateContract(makeContract({component:"demo",ok:true,code:"ok",message:"ready"})),true));
test("diagnostic contract validates",()=>assert.equal(validateContract(makeContract({component:"demo",ok:false,code:"blocked",message:"blocked",diagnostics:[{code:"RC-X",severity:"high",message:"policy"}]})),true));
test("bad diagnostic rejected",()=>assert.throws(()=>makeContract({component:"demo",ok:false,code:"blocked",message:"no",diagnostics:[{code:"x",severity:"bogus",message:"bad"}]})));
test("accessors rejected",()=>{const x=makeContract({component:"demo",ok:true,code:"ok",message:"fine"});Object.defineProperty(x,"ok",{get(){throw Error();}});assert.equal(validateContract(x),false);});
test("codes catalog stable",()=>assert.equal(contractCodes().length,6));
