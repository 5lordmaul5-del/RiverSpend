# RS Scratch — Reference Implementation

Prototype only. This module is an illustrative deterministic policy engine, not production gambling or prize-promotion infrastructure. Do not deploy or use to issue real prizes without legal review, secure storage, identity/eligibility checks, concurrency controls and audit.

## Pure policy model (TypeScript-style pseudocode)

```ts
export type ClaimStatus = "CREATED" | "ISSUED" | "REVEALED" | "AWARD_ISSUED" | "NO_AWARD" | "REJECTED";
export type AwardStatus = "ISSUED" | "REDEEMED" | "EXPIRED" | "VOIDED";

export interface Campaign {
  id: string;
  active: boolean;
  startsAt: string;
  endsAt: string;
  maxClaimsPerUser: number;
  prizesEnabled: boolean;
}
export interface EligibilityInput {
  campaign: Campaign;
  userId: string;
  now: string;
  priorClaims: number;
  freeParticipationAvailable: boolean;
}
export type EligibilityResult =
  | { eligible: true; reason: "OK" }
  | { eligible: false; reason: "CAMPAIGN_INACTIVE" | "NOT_STARTED" | "ENDED" | "LIMIT_REACHED" | "PARTICIPATION_UNAVAILABLE" };

export function checkEligibility(input: EligibilityInput): EligibilityResult {
  const { campaign, now, priorClaims, freeParticipationAvailable } = input;
  if (!campaign.active) return { eligible: false, reason: "CAMPAIGN_INACTIVE" };
  if (now < campaign.startsAt) return { eligible: false, reason: "NOT_STARTED" };
  if (now >= campaign.endsAt) return { eligible: false, reason: "ENDED" };
  if (priorClaims >= campaign.maxClaimsPerUser) return { eligible: false, reason: "LIMIT_REACHED" };
  if (!freeParticipationAvailable) return { eligible: false, reason: "PARTICIPATION_UNAVAILABLE" };
  return { eligible: true, reason: "OK" };
}

export function validateReveal(claimStatus: ClaimStatus): boolean {
  return claimStatus === "ISSUED";
}

export function validateRedeem(awardStatus: AwardStatus, now: string, expiresAt: string): AwardStatus {
  if (awardStatus !== "ISSUED") throw new Error("AWARD_NOT_REDEEMABLE");
  if (now >= expiresAt) return "EXPIRED";
  return "REDEEMED";
}
```

## Mandatory production safeguards
- Server-side decisions only; never rely on browser randomness or client state.
- Idempotency keys and unique DB constraints for claim and redemption.
- Transactional inventory decrement and award creation.
- Append-only event ledger; corrections via compensating events.
- Free participation and no paid attempts in this prototype.
- Explain reward types, eligibility, caps, expiry, and official terms before participation.
- Rate limiting, abuse controls, privacy-minimizing data collection and security review.
- Accessibility: keyboard/touch support, screen-reader reveal announcement, reduced motion.
- Public launch blocked pending Italian legal assessment and approved terms.