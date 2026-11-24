import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store, max-age=0");
  if (req.method !== "GET") { res.setHeader("Allow", "GET"); return res.status(405).json({ error: "Metodo non consentito" }); }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publicKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
  if (!url || !publicKey || !serviceKey) return res.status(503).json({ error: "Autenticazione server non configurata." });
  const token = (req.headers.authorization || "").replace(/^Bearer /, "");
  if (!token) return res.status(401).json({ error: "Sessione richiesta." });
  try {
    const auth = createClient(url, publicKey);
    const { data: { user }, error } = await auth.auth.getUser(token);
    if (error || !user) return res.status(401).json({ error: "Sessione non valida." });
    const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data: role } = await admin.from("rs_admin_roles").select("role").eq("user_id", user.id).maybeSingle();
    if (role?.role !== "admin") return res.status(403).json({ error: "Accesso CEO/admin richiesto." });
    const env = (name) => Boolean(process.env[name]);
    return res.status(200).json({
      mode: "test_only",
      livePaymentsEnabled: false,
      providers: {
        stripe: { credentialsReady: env("RIVERPAY_STRIPE_SECRET_KEY"), webhookReady: env("RIVERPAY_STRIPE_WEBHOOK_SECRET"), testMode: true },
        paypal: { credentialsReady: env("RIVERPAY_PAYPAL_CLIENT_ID") && env("RIVERPAY_PAYPAL_SECRET"), webhookReady: env("RIVERPAY_PAYPAL_WEBHOOK_ID"), testMode: true },
        sumup: { credentialsReady: env("RIVERPAY_SUMUP_API_KEY"), webhookReady: env("RIVERPAY_SUMUP_WEBHOOK_SECRET"), testMode: true }
      },
      note: "Il sistema mostra soltanto lo stato delle variabili server; non restituisce mai valori o segreti."
    });
  } catch { return res.status(500).json({ error: "Errore nella verifica configurazione RiverPay." }); }
}
