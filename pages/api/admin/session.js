import crypto from "crypto";
import { clearAdminCookie, createAdminSessionToken, isAdminSecretConfigured, isSameOriginRequest, isAdminRequest, setAdminCookie } from "../../../lib/riverSSAI/adminSession";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store, max-age=0");
  if (req.method === "POST") {
    if (!isSameOriginRequest(req)) return res.status(403).json({ success: false, error: "Origine della richiesta non valida." });
    if (!isAdminSecretConfigured()) return res.status(503).json({ success: false, error: "Accesso amministratore non configurato: imposta FORTRESS_ADMIN_SECRET (minimo 32 caratteri)." });
    const supplied = typeof req.body?.secret === "string" ? req.body.secret : "";
    const expected = process.env.FORTRESS_ADMIN_SECRET || process.env.ADMIN_SECRET_KEY || "";
    const a = Buffer.from(supplied), b = Buffer.from(expected);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return res.status(401).json({ success: false, error: "Credenziale amministratore non valida." });
    setAdminCookie(res, createAdminSessionToken());
    return res.status(200).json({ success: true });
  }
  if (req.method === "GET") return res.status(200).json({ success: isAdminRequest(req) });
  if (req.method === "DELETE") {
    if (!isSameOriginRequest(req)) return res.status(403).json({ success: false, error: "Origine della richiesta non valida." });
    clearAdminCookie(res);
    return res.status(200).json({ success: true });
  }
  res.setHeader("Allow", ["GET", "POST", "DELETE"]);
  return res.status(405).json({ success: false, error: "Metodo non consentito." });
}
