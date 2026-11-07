import { getFortressStatus, updateFortressState } from "../../../lib/riverSSAI/killSwitch";
import { verifyHmacRequest } from "../../../lib/security/hmac";
import { internalFortressCommandSchema } from "../../../lib/security/schemas";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store, max-age=0");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ success: false, error: "Metodo non consentito." });
  }

  const parsed = internalFortressCommandSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, error: "Comando Fortress non valido." });

  const verification = await verifyHmacRequest(req, req.body);
  if (!verification.valid) {
    const status = verification.reason === "not_configured" || verification.reason === "nonce_store_unavailable" ? 503 : 401;
    return res.status(status).json({ success: false, error: "Firma interna non valida o non verificabile." });
  }

  if (Object.values(parsed.data.flags).some((enabled) => enabled !== false)) {
    return res.status(403).json({ success: false, error: "Nova può soltanto disattivare moduli in emergenza; la riattivazione richiede un amministratore." });
  }

  try {
    const current = await getFortressStatus();
    const next = await updateFortressState(parsed.data.flags, "nova");
    return res.status(200).json({ success: true, previous: current, fortress: next });
  } catch (error) {
    console.error("[Fortress] signed command failed:", error.message);
    return res.status(503).json({ success: false, error: "Control plane non disponibile." });
  }
}
