import { createClient } from "@supabase/supabase-js";
import { getRiverPayRuntimeStatus } from "../../../../lib/riverpay/provider-registry";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store, max-age=0");
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Metodo non consentito" });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publicKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
  if (!url || !publicKey || !serviceKey) {
    return res.status(503).json({ error: "Autenticazione server non configurata." });
  }

  const authorization = req.headers.authorization || "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!token) return res.status(401).json({ error: "Sessione richiesta." });

  try {
    const auth = createClient(url, publicKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
    const { data: authData, error: authError } = await auth.auth.getUser(token);
    const user = authData?.user;
    if (authError || !user) {
      return res.status(401).json({ error: "Sessione non valida." });
    }

    const admin = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
    const { data: role, error: roleError } = await admin
      .from("rs_admin_roles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();

    if (roleError || role?.role !== "admin") {
      return res.status(403).json({ error: "Accesso CEO/admin richiesto." });
    }

    return res.status(200).json({
      ...getRiverPayRuntimeStatus(),
      note: "Stato di configurazione soltanto: nessuna API di pagamento viene chiamata e nessun segreto viene restituito."
    });
  } catch {
    return res.status(500).json({ error: "Errore nella verifica configurazione RiverPay." });
  }
}
