import test from "node:test";
import assert from "node:assert/strict";
import { evaluateCampaign, evaluateUserLimit, validateReward, requestFingerprint } from "./engine-reference.mjs";

const active = { active:true, startsAt:"2026-01-01T00:00:00Z", endsAt:"2027-01-01T00:00:00Z", claimLimit:3 };
test("campaign active window permits eligible requests",()=>assert.equal(evaluateCampaign(active,new Date("2026-06-01")).ok,true));
test("inactive campaign rejected",()=>assert.equal(evaluateCampaign({...active,active:false}).code,"INACTIVE"));
test("campaign before start rejected",()=>assert.equal(evaluateCampaign(active,new Date("2025-12-31")).code,"NOT_STARTED"));
test("campaign after end rejected",()=>assert.equal(evaluateCampaign(active,new Date("2027-01-01")).code,"ENDED"));
test("invalid date window rejected",()=>assert.equal(evaluateCampaign({...active,endsAt:"bad"}).code,"INVALID_WINDOW"));
test("user limit remaining count",()=>assert.deepEqual(evaluateUserLimit(3,2),{ok:true,remaining:1}));
test("user limit exhausted",()=>assert.equal(evaluateUserLimit(3,3).code,"LIMIT_REACHED"));
test("reward accepted when active",()=>assert.equal(validateReward({code:"RSP",active:true,inventory:5}).ok,true));
test("cash convertible reward blocked",()=>assert.equal(validateReward({code:"cash",active:true,cashConvertible:true}).code,"CASH_REWARD_DISABLED"));
test("inactive reward blocked",()=>assert.equal(validateReward({code:"X",active:false}).code,"REWARD_INACTIVE"));
test("fingerprint requires values",()=>assert.throws(()=>requestFingerprint("u","c",""),TypeError));
test("fingerprint deterministic",()=>assert.equal(requestFingerprint("u","c","k"),"u:c:k"));
