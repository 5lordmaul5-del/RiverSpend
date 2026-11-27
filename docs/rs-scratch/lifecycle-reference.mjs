// Dependency-free prototype of a deterministic claim lifecycle.
// This module does NOT select prizes, issue real awards, or perform database writes.
// Production requires database transaction + constraints around these operations.
const transitions = {
  CREATED: new Set(["ISSUED","VOIDED"]),
  ISSUED: new Set(["REVEALED","VOIDED"]),
  REVEALED: new Set(["AWARD_ISSUED","NO_AWARD","VOIDED"]),
  AWARD_ISSUED: new Set(["REDEEMED","EXPIRED","VOIDED"]),
  NO_AWARD: new Set(),
  REDEEMED: new Set(),
  EXPIRED: new Set(),
  VOIDED: new Set()
};

export function transitionClaim(claim, next, at = new Date().toISOString()) {
  if (!claim || typeof claim.id !== "string" || typeof claim.state !== "string") {
    return { ok:false, code:"BAD_CLAIM" };
  }
  if (!transitions[claim.state] || !transitions[claim.state].has(next)) {
    return { ok:false, code:"INVALID_TRANSITION" };
  }
  if (typeof at !== "string" || !Number.isFinite(Date.parse(at))) return { ok:false, code:"BAD_TIMESTAMP" };
  return { ok:true, claim:{...claim,state:next,updatedAt:at} };
}

export function redemptionEligibility(award, token, now = new Date()) {
  if (!award || award.state !== "AWARD_ISSUED") return {ok:false,code:"AWARD_NOT_REDEEMABLE"};
  if (typeof token !== "string" || token.trim() !== award.redemptionToken) return {ok:false,code:"TOKEN_INVALID"};
  if (!award.expiresAt || !Number.isFinite(Date.parse(award.expiresAt))) return {ok:false,code:"BAD_EXPIRY"};
  if (now.getTime() >= Date.parse(award.expiresAt)) return {ok:false,code:"EXPIRED"};
  return {ok:true,code:"REDEEMABLE"};
}
