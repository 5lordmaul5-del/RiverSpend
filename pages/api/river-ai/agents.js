import { createClient } from "@supabase/supabase-js";
import { AGENTS_REGISTRY } from "../../../lib/riverSSAI/agentsRegistry.js";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
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

  const { data: owner, error: ownerError } = await admin
    .from("river_ai_owner_access")
    .select("tier")
    .eq("singleton", true)
    .eq("user_id", auth.user.id)
    .maybeSingle();

  if (ownerError) {
    console.error("RiverSSAI registry access check failed:", ownerError.message);
    return res.status(503).json({ error: "Non è stato possibile verificare i permessi." });
  }
  if (owner?.tier !== "nova_ultra_power_mega") {
    return res.status(403).json({ error: "Il registro completo è riservato al proprietario RiverSpend." });
  }

  const agents = Object.entries(AGENTS_REGISTRY).map(([id, agent]) => ({
    id,
    name: agent.name,
    role: agent.role,
    sector: agent.sector,
    squad: agent.squad
  }));
  const squads = [...new Set(agents.map((agent) => agent.squad))];
  return res.status(200).json({
    agents,
    totalRoles: agents.length,
    specialistRoles: Math.max(0, agents.length - 1),
    squads: squads.length
  });
}
