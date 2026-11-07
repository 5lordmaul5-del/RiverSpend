import { verifyHmacRequest } from "../../../lib/security/hmac";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ success: false, error: "method_not_allowed" });
  }

  // Temporary diagnostic endpoint: Preview only, explicitly opt-in.
  // It never changes Edge Config, database records, Stripe, or fortress flags.
  if (
    process.env.VERCEL_ENV !== "preview" ||
    process.env.FORTRESS_HMAC_TEST_ENABLED !== "true"
  ) {
    return res.status(404).json({ success: false, error: "not_found" });
  }

  const result = await verifyHmacRequest(req, req.body);

  if (!result.valid) {
    return res.status(401).json({
      success: false,
      error: result.reason || "hmac_verification_failed"
    });
  }

  return res.status(200).json({
    success: true,
    message: "HMAC and anti-replay verification passed"
  });
}
