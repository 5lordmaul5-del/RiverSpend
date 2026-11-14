import { createClient } from "@supabase/supabase-js";

const MAX_MESSAGES = 40;
const MAX_CHARS = 4000;

function reply(res, status, body) {
  res.setHeader("Cache-Control", "no-store");
  return res.status(status).json(body);
}

function cleanMessages(value) {
  if (!Array.isArray(value)) return null;
  return value.slice(-MAX_MESSAGES).filter((item) =>
    item && ["user", "assistant"].includes(item.role) &&
    typeof item.content === "string" && item.content.length <= MAX_CHARS
  ).map((item) => ({ role: item.role, content: item.content }));
}

export default async function handler(req, res) {
  if (!["GET", "POST", "PATCH", "DELETE"].includes(req.method)) {
    res.setHeader("Allow", "GET, POST, PATCH, DELETE");
    return reply(res, 405, { error: "Metodo non consentito." });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return reply(res, 503, { error: "Archivio RiverSSAI non configurato." });

  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return reply(res, 401, { error: "Accesso richiesto." });

  const admin = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data: auth, error: authError } = await admin.auth.getUser(token);
  const user = auth?.user;
  if (authError || !user) return reply(res, 401, { error: "Sessione non valida." });

  const { data: owner, error: ownerError } = await admin.from("river_ai_owner_access")
    .select("tier").eq("singleton", true).eq("user_id", user.id).maybeSingle();
  if (ownerError || owner?.tier !== "nova_ultra_power_mega") {
    return reply(res, 403, { error: "Archivio riservato al proprietario RiverSpend." });
  }

  const table = admin.from("river_ai_conversations");
  if (req.method === "GET") {
    const { data, error } = await table.select("id,title,messages,is_archived,is_pinned,created_at,updated_at")
      .eq("user_id", user.id).order("updated_at", { ascending: false }).limit(60);
    if (error) {
      console.error("RiverSSAI conversations read failed:", error.message);
      return reply(res, 503, { error: "Archivio non ancora disponibile. Verificare la migrazione RiverSSAI." });
    }
    return reply(res, 200, { conversations: data || [] });
  }

  const body = req.body || {};
  if (req.method === "POST") {
    const messages = cleanMessages(body.messages);
    if (!messages) return reply(res, 400, { error: "Cronologia non valida." });
    const title = String(body.title || messages.find((m) => m.role === "user")?.content || "Nuova conversazione").slice(0, 120);
    const { data, error } = await table.insert({
      user_id: user.id, title, messages,
      is_archived: Boolean(body.is_archived), is_pinned: Boolean(body.is_pinned)
    }).select("id,title,messages,is_archived,is_pinned,created_at,updated_at").single();
    if (error) {
      console.error("RiverSSAI conversation create failed:", error.message);
      return reply(res, 503, { error: "Non riesco a salvare la conversazione. Verificare la migrazione RiverSSAI." });
    }
    return reply(res, 201, { conversation: data });
  }

  const id = String(body.id || req.query.id || "");
  if (!/^[0-9a-f-]{36}$/i.test(id)) return reply(res, 400, { error: "Identificativo conversazione non valido." });
  if (req.method === "PATCH") {
    const patch = { updated_at: new Date().toISOString() };
    if (Object.prototype.hasOwnProperty.call(body, "messages")) {
      const messages = cleanMessages(body.messages);
      if (!messages) return reply(res, 400, { error: "Cronologia non valida." });
      patch.messages = messages;
      if (!body.title) patch.title = String(messages.find((m) => m.role === "user")?.content || "Nuova conversazione").slice(0, 120);
    }
    if (Object.prototype.hasOwnProperty.call(body, "title")) patch.title = String(body.title).slice(0, 120);
    if (Object.prototype.hasOwnProperty.call(body, "is_archived")) patch.is_archived = Boolean(body.is_archived);
    if (Object.prototype.hasOwnProperty.call(body, "is_pinned")) patch.is_pinned = Boolean(body.is_pinned);
    const { data, error } = await table.update(patch).eq("id", id).eq("user_id", user.id)
      .select("id,title,messages,is_archived,is_pinned,created_at,updated_at").maybeSingle();
    if (error) {
      console.error("RiverSSAI conversation update failed:", error.message);
      return reply(res, 503, { error: "Non riesco ad aggiornare la conversazione." });
    }
    if (!data) return reply(res, 404, { error: "Conversazione non trovata." });
    return reply(res, 200, { conversation: data });
  }

  const { error } = await table.delete().eq("id", id).eq("user_id", user.id);
  if (error) {
    console.error("RiverSSAI conversation delete failed:", error.message);
    return reply(res, 503, { error: "Non riesco a eliminare la conversazione." });
  }
  return reply(res, 200, { deleted: true });
}
