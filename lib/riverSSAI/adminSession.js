import crypto from "crypto";

const COOKIE_NAME = "river_fortress_admin";
const SESSION_TTL_SECONDS = 30 * 60;

function getSecret() {
  return process.env.FORTRESS_ADMIN_SECRET || process.env.ADMIN_SECRET_KEY || "";
}
function sign(value, secret) {
  return crypto.createHmac("sha256", secret).update(value).digest("hex");
}
function safeEqual(a, b) {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}
export function createAdminSessionToken(now = Date.now()) {
  const secret = getSecret();
  if (!secret || secret.length < 32) throw new Error("FORTRESS_ADMIN_SECRET deve contenere almeno 32 caratteri.");
  const payload = Buffer.from(JSON.stringify({ exp: Math.floor(now / 1000) + SESSION_TTL_SECONDS })).toString("base64url");
  return payload + "." + sign(payload, secret);
}
export function verifyAdminSessionToken(token, now = Date.now()) {
  const secret = getSecret();
  if (!secret || secret.length < 32 || typeof token !== "string") return false;
  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra || !safeEqual(signature, sign(payload, secret))) return false;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return Number.isFinite(data.exp) && data.exp > Math.floor(now / 1000);
  } catch { return false; }
}
export function getAdminCookie(req) {
  const cookieHeader = req.headers.cookie || "";
  const entry = cookieHeader.split(";").map((part) => part.trim()).find((part) => part.startsWith(COOKIE_NAME + "="));
  return entry ? decodeURIComponent(entry.slice(COOKIE_NAME.length + 1)) : "";
}
export function setAdminCookie(res, token) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  res.setHeader("Set-Cookie", COOKIE_NAME + "=" + encodeURIComponent(token) + "; Path=/api/admin; HttpOnly; SameSite=Strict; Max-Age=" + SESSION_TTL_SECONDS + secure);
}
export function clearAdminCookie(res) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  res.setHeader("Set-Cookie", COOKIE_NAME + "=; Path=/api/admin; HttpOnly; SameSite=Strict; Max-Age=0" + secure);
}
export function isSameOriginRequest(req) {
  const origin = req.headers.origin;
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  if (!origin || !host) return false;
  try { return new URL(origin).host === String(host).toLowerCase(); } catch { return false; }
}
export function isAdminRequest(req) {
  return verifyAdminSessionToken(getAdminCookie(req));
}
export function isAdminSecretConfigured() {
  const secret = getSecret();
  return secret.length >= 32;
}
