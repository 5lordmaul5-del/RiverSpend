import crypto from "crypto";
import { hmacHeadersSchema } from "./schemas";

const DEFAULT_CLOCK_SKEW_SECONDS = 300;

function safeHexEqual(expected, supplied) {
  if (typeof supplied !== "string" || !/^[a-f0-9]{64}$/i.test(supplied)) return false;
  const left = Buffer.from(expected, "hex");
  const right = Buffer.from(supplied, "hex");
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

function canonicalPayload(timestamp, nonce, body) {
  return String(timestamp) + "." + nonce + "." + JSON.stringify(body ?? {});
}

export function createHmacSignature({ timestamp, nonce, body, secret = process.env.RIVER_API_HMAC_SECRET }) {
  if (!secret || secret.length < 32) throw new Error("RIVER_API_HMAC_SECRET deve contenere almeno 32 caratteri.");
  return crypto.createHmac("sha256", secret)
    .update(canonicalPayload(timestamp, nonce, body))
    .digest("hex");
}

async function consumeNonce(nonce, ttlSeconds) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error("Archivio nonce distribuito non configurato.");
  const response = await fetch(url.replace(/\/+$/, ""), {
    method: "POST",
    headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
    body: JSON.stringify(["SET", "river:hmac:nonce:" + nonce, "1", "NX", "EX", String(ttlSeconds)])
  });
  if (!response.ok) throw new Error("Archivio nonce non disponibile.");
  const result = await response.json();
  return result?.result === "OK";
}

/**
 * HMAC server-to-server. Firma il JSON canonico timestamp.nonce.body.
 * Il nonce viene consumato in Redis con SET NX, quindi i replay sono respinti
 * anche quando le richieste raggiungono istanze serverless differenti.
 */
export async function verifyHmacRequest(req, body = req.body, options = {}) {
  const parsed = hmacHeadersSchema.safeParse({
    signature: req.headers["x-signature"],
    timestamp: req.headers["x-timestamp"],
    nonce: req.headers["x-nonce"]
  });
  if (!parsed.success) return { valid: false, reason: "invalid_headers" };

  const secret = options.secret || process.env.RIVER_API_HMAC_SECRET;
  if (!secret || secret.length < 32) return { valid: false, reason: "not_configured" };

  const nowSeconds = Math.floor((options.now ?? Date.now()) / 1000);
  const maxSkew = options.maxSkewSeconds ?? DEFAULT_CLOCK_SKEW_SECONDS;
  if (Math.abs(nowSeconds - parsed.data.timestamp) > maxSkew) {
    return { valid: false, reason: "timestamp_out_of_window" };
  }

  const expected = createHmacSignature({
    timestamp: parsed.data.timestamp,
    nonce: parsed.data.nonce,
    body,
    secret
  });
  if (!safeHexEqual(expected, parsed.data.signature)) return { valid: false, reason: "bad_signature" };

  try {
    const consumed = await consumeNonce(parsed.data.nonce, maxSkew * 2);
    return consumed ? { valid: true } : { valid: false, reason: "replayed_nonce" };
  } catch (error) {
    console.error("[River HMAC] nonce store unavailable:", error.message);
    return { valid: false, reason: "nonce_store_unavailable" };
  }
}
