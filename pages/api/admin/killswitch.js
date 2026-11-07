import { getFortressStatus, updateFortressState } from "../../../lib/riverSSAI/killSwitch";
import { isAdminRequest, isSameOriginRequest } from "../../../lib/riverSSAI/adminSession";
import { fortressFlagsSchema } from "../../../lib/security/schemas";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store, max-age=0");
  if (!isAdminRequest(req)) return res.status(401).json({ success: false, error: "Sessione amministratore richiesta." });
  if (req.method === "GET") {
    try { return res.status(200).json({ success: true, fortress: await getFortressStatus() }); }
    catch (error) {
      console.error("[Fortress] status read failed:", error.message);
      return res.status(503).json({ success: false, error: "Control plane non disponibile o non configurato." });
    }
  }
  if (req.method === "POST") {
    if (!isSameOriginRequest(req)) return res.status(403).json({ success: false, error: "Origine della richiesta non valida." });
    const parsedFlags = fortressFlagsSchema.safeParse(req.body?.flags);
    if (!parsedFlags.success) return res.status(400).json({ success: false, error: "Payload flags non valido." });
    try {
      const state = await updateFortressState(parsedFlags.data, "admin-dashboard");
      return res.status(200).json({ success: true, fortress: state });
    } catch (error) {
      const invalid = error instanceof TypeError;
      return res.status(invalid ? 400 : 503).json({ success: false, error: invalid ? error.message : "Impossibile aggiornare il control plane." });
    }
  }
  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).json({ success: false, error: "Metodo non consentito." });
}
