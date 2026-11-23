import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  if (req.method !== "GET") { res.setHeader("Allow", "GET"); return res.status(405).end(); }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const header = req.headers.authorization || "", token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!url || !key || !token) return res.status(401).json({ error: "Accesso richiesto." });
  const admin = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data: auth, error: authError } = await admin.auth.getUser(token);
  if (authError || !auth?.user) return res.status(401).json({ error: "Sessione non valida." });
  const { data: owner, error } = await admin.from("river_ai_owner_access").select("tier").eq("singleton", true).eq("user_id", auth.user.id).maybeSingle();
  if (error) return res.status(503).json({ error: "Verifica permessi non disponibile." });
  if (owner?.tier !== "nova_ultra_power_mega") return res.status(403).json({ error: "Accesso non autorizzato." });
  let base;
  try { const parsed = new URL(process.env.COMFYUI_BASE_URL || ""); if (!["http:", "https:"].includes(parsed.protocol) || parsed.username || parsed.password) throw new Error(); base = parsed.origin; }
  catch { return res.status(503).json({ error: "Runtime immagini non configurato." }); }
  const filename = typeof req.query.filename === "string" ? req.query.filename : "";
  const subfolder = typeof req.query.subfolder === "string" ? req.query.subfolder : "";
  const type = typeof req.query.type === "string" ? req.query.type : "output";
  if (!filename || filename.length > 180 || /[\\/]/.test(filename) || filename.includes("..") || subfolder.length > 180 || subfolder.split("/").some((part) => part === "..") || !["output", "temp", "input"].includes(type)) return res.status(400).json({ error: "Riferimento file non valido." });
  const params = new URLSearchParams({ filename, subfolder, type });
  try {
    const response = await fetch(`${base}/view?${params.toString()}`);
    if (!response.ok) return res.status(502).json({ error: "Immagine non disponibile dal runtime." });
    res.setHeader("Content-Type", response.headers.get("content-type") || "image/png");
    res.setHeader("Cache-Control", "private, no-store");
    res.setHeader("Content-Disposition", "inline");
    return res.status(200).send(Buffer.from(await response.arrayBuffer()));
  } catch { return res.status(502).json({ error: "Errore nel recupero dell'immagine." }); }
}
