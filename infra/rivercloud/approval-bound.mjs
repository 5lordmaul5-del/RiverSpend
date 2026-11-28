// Prototype: HMAC-bound approvals with random nonce and atomic one-use consumption.
// Approver remains an unverified label until a real OIDC/authentication layer is integrated.
import { createHmac, timingSafeEqual, createHash, randomBytes } from "node:crypto";
import path from "node:path";
import { storeApprovalForLifecycleAtomic, consumeApprovalAndTransitionAtomic } from "./rc17-atomic-lifecycle.mjs";

const normalize = x => ({ jobId: x.jobId, projectId: x.projectId, profile: x.profile, target: x.target, commit: String(x.commit || "").toLowerCase(), digest: String(x.digest || "").toLowerCase() });
const canonical = x => JSON.stringify(normalize(x));
const valid = x => x && /^[a-zA-Z0-9_-]{1,64}$/.test(x.jobId) && x.projectId === "riverspend" && ["node-static", "node-tests"].includes(x.profile) && x.target === "staging" && /^[a-f0-9]{40}$/i.test(String(x.commit || "")) && /^[a-f0-9]{64}$/i.test(String(x.digest || ""));
const signature = (secret, payload) => createHmac("sha256", secret).update(payload).digest("hex");
const tokenId = token => createHash("sha256").update(token).digest("hex");

export function approvalPayload(binding, expiresAt, nonce) { return canonical(binding) + "|" + expiresAt + "|" + nonce; }

export async function issueApproval({ storeDir, binding, secret, ttlMs = 300000, approver }) {
  if (!valid(binding) || typeof secret !== "string" || secret.length < 32 || typeof approver !== "string" || !approver.trim() || approver.length > 100 || !Number.isSafeInteger(ttlMs) || ttlMs < 1000 || ttlMs > 3600000) throw new Error("invalid_approval_request");
  const normalized = normalize(binding), expiresAt = Date.now() + ttlMs, nonce = randomBytes(32).toString("hex");
  const token = signature(secret, approvalPayload(normalized, expiresAt, nonce));
  await storeApprovalForLifecycleAtomic(path.join(storeDir, "lifecycle.json"), { tokenId: tokenId(token), jobId: normalized.jobId, binding: normalized, expiresAt, nonce, approver });
  return { token, expiresAt, binding: normalized, approver };
}

export async function consumeApproval({ storeDir, binding, secret, token, consumerIdentity }) {
  if (!valid(binding) || typeof secret !== "string" || secret.length < 32 || typeof token !== "string") throw new Error("invalid_approval");
  if (typeof consumerIdentity !== "string" || !consumerIdentity.trim() || consumerIdentity.length > 100) throw new Error("consumer_identity_required");
  const normalized = normalize(binding), id = tokenId(token);
  return consumeApprovalAndTransitionAtomic(path.join(storeDir, "lifecycle.json"), {
    tokenId: id, binding: normalized, consumerIdentity,
    verifyApproval(record) {
      if (canonical(record.binding) !== canonical(normalized)) return false;
      const expected = signature(secret, approvalPayload(record.binding, record.expiresAt, record.nonce));
      const a = Buffer.from(token), b = Buffer.from(expected);
      return a.length === b.length && timingSafeEqual(a, b);
    }
  });
}
