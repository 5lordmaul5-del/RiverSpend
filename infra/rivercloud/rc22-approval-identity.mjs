// RC-22: approval helpers that require an identity already validated by the RC-13 claim gate.
// This is not a JWT/OIDC verifier or API integration: the caller must provide claims from
// a trusted provider-verification step and a verifier callback that checks that provenance.
import { createHash } from "node:crypto";
import { validateIdentityClaims, hasPermission } from "./rc13-identity.mjs";
import { issueApproval, consumeApproval } from "./approval-bound.mjs";

const identityLabel = actor => "oidc:" + createHash("sha256").update(JSON.stringify({ issuer: actor.issuer, subject: actor.subject })).digest("hex");

function requireApprovalActor(claims, identityOptions) {
  if (!identityOptions || typeof identityOptions !== "object" || typeof identityOptions.verifyIssuer !== "function") throw new Error("verified_identity_required");
  const result = validateIdentityClaims(claims, identityOptions);
  if (!result.ok) throw new Error("identity_rejected:" + result.reason);
  if (!hasPermission(result.actor, "approve_jobs")) throw new Error("approval_permission_denied");
  return result.actor;
}

export async function issueApprovalForIdentity({ claims, identityOptions, storeDir, binding, secret, ttlMs = 300000 }) {
  const actor = requireApprovalActor(claims, identityOptions);
  const issued = await issueApproval({ storeDir, binding, secret, ttlMs, approver: identityLabel(actor) });
  return { ...issued, approverIdentity: { issuer: actor.issuer, subject: actor.subject } };
}

export async function consumeApprovalForIdentity({ claims, identityOptions, storeDir, binding, secret, token }) {
  const actor = requireApprovalActor(claims, identityOptions);
  const label = identityLabel(actor);
  const consumed = await consumeApproval({ storeDir, binding, secret, token, consumerIdentity: label });
  return { ...consumed, consumer: { issuer: actor.issuer, subject: actor.subject } };
}
