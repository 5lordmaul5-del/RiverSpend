import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Metodo non consentito." });
  }
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return res.status(503).json({ error: "Verifica accesso non configurata." });
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return res.status(401).json({ error: "Accesso richiesto." });
  const admin = createClient(supabaseUrl, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data: auth, error: authError } = await admin.auth.getUser(token);
  if (authError || !auth?.user) return res.status(401).json({ error: "Sessione non valida." });
  const { data, error } = await admin.from("river_ai_owner_access").select("tier").eq("singleton", true).eq("user_id", auth.user.id).maybeSingle();
  if (error) {
    console.error("Area 51 owner check failed:", error.message);
    return res.status(503).json({ error: "Non è stato possibile verificare i permessi." });
  }
  if (data?.tier !== "nova_ultra_power_mega") return res.status(403).json({ error: "Area 51 è riservata al proprietario RiverSpend." });
  return res.status(200).json({ allowed: true, area: "RIVERSPEND AREA 51", tier: data.tier });
}
