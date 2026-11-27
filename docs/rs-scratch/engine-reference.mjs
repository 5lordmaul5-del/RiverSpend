// RS Scratch policy-engine reference. Dependency-free, illustrative, no real prize assignment.
// Rewards are preconfigured non-cash promotional items. Distribution must be legally reviewed.
export function evaluateCampaign(campaign, now = new Date()) {
  if (!campaign || campaign.active !== true) return { ok: false, code: "INACTIVE" };
  const start = Date.parse(campaign.startsAt), end = Date.parse(campaign.endsAt), time = now.getTime();
  if (![start, end].every(Number.isFinite) || end <= start) return { ok: false, code: "INVALID_WINDOW" };
  if (time < start) return { ok: false, code: "NOT_STARTED" };
  if (time >= end) return { ok: false, code: "ENDED" };
  if (!Number.isInteger(campaign.claimLimit) || campaign.claimLimit < 1) return { ok: false, code: "INVALID_LIMIT" };
  return { ok: true, code: "ELIGIBLE" };
}

export function evaluateUserLimit(limit, existingClaims) {
  if (!Number.isInteger(limit) || limit < 1) return { ok: false, code: "INVALID_LIMIT" };
  if (!Number.isInteger(existingClaims) || existingClaims < 0) return { ok: false, code: "INVALID_COUNT" };
  return existingClaims < limit ? { ok: true, remaining: limit - existingClaims } : { ok: false, code: "LIMIT_REACHED" };
}

export function validateReward(reward) {
  if (!reward || typeof reward.code !== "string" || !reward.code.trim()) return { ok: false, code: "BAD_REWARD" };
  if (reward.cashValue === true || reward.cashConvertible === true) return { ok: false, code: "CASH_REWARD_DISABLED" };
  if (reward.active !== true) return { ok: false, code: "REWARD_INACTIVE" };
  if (Number.isInteger(reward.inventory) && reward.inventory < 0) return { ok: false, code: "BAD_INVENTORY" };
  return { ok: true, code: "REWARD_VALID" };
}

// Idempotency and atomicity MUST be enforced by persistent database constraints/transactions.
export function requestFingerprint(userId, campaignId, idempotencyKey) {
  for (const value of [userId, campaignId, idempotencyKey]) if (typeof value !== "string" || !value.trim()) throw new TypeError("Required string missing");
  return [userId, campaignId, idempotencyKey].join(":");
}
