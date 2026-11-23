import { createClient } from "@supabase/supabase-js";

async function owner(req) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const header = req.headers.authorization || "", token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!url || !key || !token) return 401;
  const admin = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data: auth, error: authError } = await admin.auth.getUser(token);
  if (authError || !auth?.user) return 401;
  const { data, error } = await admin.from("river_ai_owner_access").select("tier").eq("singleton", true).eq("user_id", auth.user.id).maybeSingle();
  if (error) return 503;
  return data?.tier === "nova_ultra_power_mega" ? 200 : 403;
}

function runtime() {
  try {
    const url = new URL(process.env.COMFYUI_BASE_URL || "");
    if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) return null;
    return url.origin;
  } catch { return null; }
}

export default async function handler(req, res) {
  if (!["GET", "POST"].includes(req.method)) { res.setHeader("Allow", "GET, POST"); return res.status(405).end(); }
  const status = await owner(req);
  if (status !== 200) return res.status(status).json({ error: status === 403 ? "Accesso non autorizzato." : "Verifica proprietario non disponibile." });
  const base = runtime();
  const rawWorkflow = process.env.COMFYUI_VIDEO_WORKFLOW_JSON;
  const promptNode = process.env.COMFYUI_VIDEO_PROMPT_NODE_ID || "";
  const promptInput = process.env.COMFYUI_VIDEO_PROMPT_INPUT || "text";
  if (req.method === "GET" && req.query.capabilities === "1") {
    return res.status(200).json({ configured: Boolean(base && rawWorkflow && promptNode), engine: "ComfyUI video workflow" });
  }
  if (!base || !rawWorkflow || !promptNode) return res.status(503).json({ error: "Video Engine non configurato. Serve un workflow ComfyUI video compatibile e un runtime GPU privato." });
  if (req.method === "POST") {
    const prompt = typeof req.body?.prompt === "string" ? req.body.prompt.trim() : "";
    if (!prompt || prompt.length > 1200) return res.status(400).json({ error: "Descrizione obbligatoria (massimo 1.200 caratteri)." });
    try {
      const graph = JSON.parse(rawWorkflow);
      if (!graph || typeof graph !== "object" || !graph[promptNode]?.inputs || !(promptInput in graph[promptNode].inputs)) return res.status(500).json({ error: "Il workflow video non contiene il nodo/testo configurato." });
      graph[promptNode].inputs[promptInput] = prompt;
      const response = await fetch(`${base}/prompt`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt: graph, client_id: "riverssai-video-engine" }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.prompt_id) return res.status(502).json({ error: data.error?.message || "ComfyUI non ha accettato il workflow video." });
      return res.status(202).json({ prompt_id: data.prompt_id, status: "queued" });
    } catch (error) { return res.status(502).json({ error: error instanceof SyntaxError ? "Il workflow video configurato non è JSON valido." : "Runtime video non raggiungibile." }); }
  }
  const promptId = typeof req.query.prompt_id === "string" ? req.query.prompt_id : "";
  if (!/^[a-f0-9-]{8,80}$/i.test(promptId)) return res.status(400).json({ error: "ID generazione non valido." });
  try {
    const response = await fetch(`${base}/history/${encodeURIComponent(promptId)}`);
    if (!response.ok) return res.status(502).json({ error: "Impossibile leggere lo stato del motore video." });
    const history = await response.json(), job = history[promptId];
    if (!job) return res.status(200).json({ status: "processing" });
    const outputs = Object.values(job.outputs || {});
    const media = outputs.flatMap((output) => [...(output.videos || []), ...(output.gifs || []), ...(output.images || [])])[0];
    if (!media?.filename) return res.status(200).json({ status: "processing" });
    const params = new URLSearchParams({ filename: media.filename, subfolder: media.subfolder || "", type: media.type || "output" });
    return res.status(200).json({ status: "completed", media_url: `/api/river-ai/creative/image-file?${params.toString()}`, filename: media.filename, media_type: media.type || "output" });
  } catch { return res.status(502).json({ error: "Errore durante il controllo della generazione video." }); }
}
