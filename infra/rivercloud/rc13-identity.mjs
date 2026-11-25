// RC-13: strict identity-claim validation prototype.
// Claims are NOT trusted until a real authentication provider verifies them.
const ROLES = new Set(["owner", "admin", "operator", "auditor", "viewer"]);
const REQUIRED = ["issuer", "subject", "audience", "issuedAt", "expiresAt", "roles"];
export function validateIdentityClaims(claims, { now = Date.now(), verifyIssuer = () => false, expectedIssuer, expectedAudience } = {}) {
  if (!claims || typeof claims !== "object" || Array.isArray(claims)) return { ok:false, reason:"invalid_claims" };
  for (const key of REQUIRED) if (!(key in claims)) return { ok:false, reason:"missing_claim" };
  if (typeof claims.issuer !== "string" || typeof claims.subject !== "string" || !claims.subject.trim()) return { ok:false, reason:"invalid_subject" };
  if (claims.issuer !== expectedIssuer || claims.audience !== expectedAudience) return { ok:false, reason:"issuer_or_audience_mismatch" };
  if (!Number.isFinite(claims.issuedAt) || !Number.isFinite(claims.expiresAt) || claims.expiresAt <= now || claims.issuedAt > now + 60_000 || claims.expiresAt <= claims.issuedAt) return { ok:false, reason:"invalid_time_window" };
  if (!Array.isArray(claims.roles) || claims.roles.length === 0 || claims.roles.some(role => !ROLES.has(role))) return { ok:false, reason:"invalid_roles" };
  if (typeof verifyIssuer !== "function" || verifyIssuer(claims) !== true) return { ok:false, reason:"signature_not_verified" };
  return { ok:true, actor:{ issuer:claims.issuer, subject:claims.subject, audience:claims.audience, roles:[...new Set(claims.roles)] } };
}
export function hasRole(actor, role) { return Boolean(actor && Array.isArray(actor.roles) && actor.roles.includes(role)); }
export const RC13_ROLE_POLICY = Object.freeze({ owner:["*"], admin:["manage_users","manage_projects","approve_jobs"], operator:["manage_projects","approve_jobs"], auditor:["read_audit"], viewer:["read_status"] });
