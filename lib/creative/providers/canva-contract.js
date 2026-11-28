/**
 * Canva provider contract for RiverSSAI.
 * No OAuth, network, or secret access is implemented here.
 * These pure helpers are the safe contract layer for later adapter work.
 */
export const CANVA_PROVIDER = "canva";

export function normalizeCreativeBrief(input = {}) {
  const title = String(input.title ?? "").trim();
  const purpose = String(input.purpose ?? "").trim();
  const format = String(input.format ?? "").trim();
  const requiredText = Array.isArray(input.requiredText)
    ? input.requiredText.map((v) => String(v).trim()).filter(Boolean)
    : [];
  const constraints = Array.isArray(input.constraints)
    ? input.constraints.map((v) => String(v).trim()).filter(Boolean)
    : [];
  if (!title || !purpose || !format) {
    throw new TypeError("Brief requires title, purpose, and format.");
  }
  return Object.freeze({ title, purpose, format, requiredText, constraints, provider: CANVA_PROVIDER });
}

export function validateExportMetadata(meta = {}, limits = {}) {
  const errors = [];
  const allowedMime = limits.allowedMime ?? ["image/png", "image/jpeg", "image/webp", "application/pdf"];
  const maxBytes = limits.maxBytes ?? 20 * 1024 * 1024;
  if (!allowedMime.includes(meta.mimeType)) errors.push("Unsupported MIME type.");
  if (!Number.isSafeInteger(meta.sizeBytes) || meta.sizeBytes <= 0 || meta.sizeBytes > maxBytes)
    errors.push("Export size is invalid or exceeds limit.");
  if (!Number.isSafeInteger(meta.width) || meta.width <= 0) errors.push("Width is invalid.");
  if (!Number.isSafeInteger(meta.height) || meta.height <= 0) errors.push("Height is invalid.");
  if (typeof meta.filename !== "string" || !meta.filename.trim()) errors.push("Filename is required.");
  else if (/[\\/\\0]/.test(meta.filename)) errors.push("Filename must not contain path separators or NUL.");
  return Object.freeze({ ok: errors.length === 0, errors });
}

/** Intentionally denies publishing until a separate explicit approval gate is added. */
export function publicationGate({ approval } = {}) {
  return Object.freeze({ allowed: approval === "explicit-user-approval", reason: approval === "explicit-user-approval" ? "Approved" : "Explicit user approval required." });
}
