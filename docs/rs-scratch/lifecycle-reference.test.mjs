import test from "node:test";
import assert from "node:assert/strict";
import { transitionClaim, redemptionEligibility } from "./lifecycle-reference.mjs";

const claim={id:"c1",state:"CREATED"};
test("valid transition CREATED to ISSUED",()=>assert.equal(transitionClaim(claim,"ISSUED").ok,true));
test("reject invalid transition",()=>assert.equal(transitionClaim(claim,"REDEEMED").code,"INVALID_TRANSITION"));
test("reject malformed claim",()=>assert.equal(transitionClaim(null,"ISSUED").code,"BAD_CLAIM"));
test("reject bad timestamp",()=>assert.equal(transitionClaim(claim,"ISSUED","bad").code,"BAD_TIMESTAMP"));
test("award can redeem with matching token before expiry",()=>assert.equal(redemptionEligibility({state:"AWARD_ISSUED",redemptionToken:"t",expiresAt:"2027-01-01"}, "t",new Date("2026-12-01")).ok,true));
test("reject wrong token",()=>assert.equal(redemptionEligibility({state:"AWARD_ISSUED",redemptionToken:"t",expiresAt:"2027-01-01"}, "wrong").code,"TOKEN_INVALID"));
test("reject expired award",()=>assert.equal(redemptionEligibility({state:"AWARD_ISSUED",redemptionToken:"t",expiresAt:"2026-01-01"}, "t",new Date("2026-02-01")).code,"EXPIRED"));
test("reject redeemed award",()=>assert.equal(redemptionEligibility({state:"REDEEMED",redemptionToken:"t",expiresAt:"2027-01-01"}, "t").code,"AWARD_NOT_REDEEMABLE"));
