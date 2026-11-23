import { createClient } from "@supabase/supabase-js";

async function authorize(req) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!url || !key || !token) return { ok: false, status: 401 };
  const admin = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data: auth, error: authError } = await admin.auth.getUser(token);
  if (authError || !auth?.user) return { ok: false, status: 401 };
  const { data, error } = await admin.from("river_ai_owner_access").select("tier").eq("singleton", true).eq("user_id", auth.user.id).maybeSingle();
  if (error) return { ok: false, status: 503 };
  if (data?.tier !== "nova_ultra_power_mega") return { ok: false, status: 403 };
  return { ok: true };
}

function comfyBase() {
  const raw = process.env.COMFYUI_BASE_URL;
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) return null;
    return url.origin;
  } catch { return null; }
}

function workflow(prompt) {
  const checkpoint = process.env.COMFYUI_CHECKPOINT || "sd_xl_base_1.0.safetensors";
  return {
    "1": { class_type: "CheckpointLoaderSimple", inputs: { ckpt_name: checkpoint } },
    "2": { class_type: "CLIPTextEncode", inputs: { text: prompt, clip: ["1", 1] } },
    "3": { class_type: "CLIPTextEncode", inputs: { text: "low quality, blurry, distorted, watermark, text artifacts", clip: ["1", 1] } },
    "4": { class_type: "EmptyLatentImage", inputs: { width: 1024, height: 1024, batch_size: 1 } },
    "5": { class_type: "KSampler", inputs: { seed: Math.floor(Math.random() * 2147483647), steps: 24, cfg: 7, sampler_name: "dpmpp_2m", scheduler: "karras", denoise: 1, model: ["1", 0], positive: ["2", 0], negative: ["3", 0], latent_image: ["4", 0] } },
    "6": { class_type: "VAEDecode", inputs: { samples: ["5", 0], vae: ["1", 2] } },
    "7": { class_type: "SaveImage", inputs: { filename_prefix: "RiverSSAI_Creative", images: ["6", 0] } }
  };
}

export default async function handler(req, res) {
  if (!["GET", "POST"].includes(req.method)) {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Metodo non consentito." });
  }
  const auth = await authorize(req);
  if (!auth.ok) return res.status(auth.status).json({ error: auth.status === 403 ? "Accesso non autorizzato." : "Verifica proprietario non disponibile." });
  const base = comfyBase();
  if (req.method === "GET" && req.query.capabilities === "1") {
    return res.status(200).json({ configured: Boolean(base), engine: "ComfyUI", note: base ? "Runtime locale configurato." : "Runtime non configurato: nessuna generazione verrà avviata." });
  }
  if (!base) return res.status(503).json({ error: "Image Engine non configurato. Occorre collegare un runtime ComfyUI privato con GPU e modello installato." });

  if (req.method === "POST") {
    const prompt = typeof req.body?.prompt === "string" ? req.body.prompt.trim() : "";
    if (!prompt || prompt.length > 1200) return res.status(400).json({ error: "Descrizione obbligatoria (massimo 1.200 caratteri)." });
    try {
      const response = await fetch(`${base}/prompt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: workflow(prompt), client_id: "riverssai-creative-studio" })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.prompt_id) return res.status(502).json({ error: data.error?.message || "ComfyUI non ha accettato il lavoro. Verifica modello e workflow." });
      return res.status(202).json({ prompt_id: data.prompt_id, status: "queued" });
    } catch {
      return res.status(502).json({ error: "Il runtime ComfyUI non è raggiungibile dalla piattaforma." });
    }
  }

  const promptId = typeof req.query.prompt_id === "string" ? req.query.prompt_id : "";
  if (!/^[a-f0-9-]{8,80}$/i.test(promptId)) return res.status(400).json({ error: "ID generazione non valido." });
  try {
    const response = await fetch(`${base}/history/${encodeURIComponent(promptId)}`);
    if (!response.ok) return res.status(502).json({ error: "Impossibile leggere lo stato del motore immagini." });
    const history = await response.json();
    const job = history[promptId];
    if (!job) return res.status(200).json({ status: "processing" });
    const outputs = Object.values(job.outputs || {});
    const image = outputs.flatMap((output) => output.images || [])[0];
    if (!image?.filename) return res.status(200).json({ status: "processing" });
    const params = new URLSearchParams({ filename: image.filename, subfolder: image.subfolder || "", type: image.type || "output" });
    return res.status(200).json({ status: "completed", image_url: `/api/river-ai/creative/image-file?${params.toString()}`, filename: image.filename });
  } catch {
    return res.status(502).json({ error: "Errore durante il controllo della generazione." });
  }
}
