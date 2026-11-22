import { createClient } from "@supabase/supabase-js";

const MODEL = process.env.RIVER_SIGNALS_BASE_MODEL || process.env.RIVER_AI_MODEL || "openai/gpt-oss-20b";
const MAX_HISTORY = 10;
const MAX_CHARS = 1600;
const recentRequests = new Map();

const BASE_PROMPT = [
  "Sei RiverSSAI Base, assistente integrato in RiverSignals.",
  "Rispondi in italiano, in modo pratico, chiaro e rispettoso.",
  "Aiuti a scrivere messaggi, riassumere testi incollati dall'utente, tradurre brevi messaggi e orientarsi nelle funzioni RiverSignals.",
  "Sei una versione leggera: non hai accesso agli strumenti amministrativi di RiverSpend, ai database privati, alle chat non fornite dall'utente, ai pagamenti o alla rete completa dei 90 specialisti.",
  "Non dichiarare di aver eseguito azioni nell'app, inviato messaggi, effettuato pagamenti, consultato dati live o modificato impostazioni.",
  "Non chiedere password, codici di accesso o chiavi. Non invitare a condividere dati sensibili.",
  "Quando un'informazione non è disponibile, dichiaralo chiaramente. Non inventare funzioni RiverSignals che non sono attive.",
  "Non mostrare ragionamenti interni privati: fornisci conclusioni, spiegazioni sintetiche e passaggi utili."
].join("\n");

function json(res, status, body) {
  return res.status(status).json(body);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { error: "Metodo non consentito." });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const groqKey = process.env.GROQ_API_KEY;
  if (!supabaseUrl || !serviceKey || !groqKey) {
    return json(res, 503, { error: "RiverSSAI Base non è configurato sul server. La chat Signals resta disponibile." });
  }

  const authorization = req.headers.authorization || "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!token) return json(res, 401, { error: "Accedi a RiverSignals per usare RiverSSAI Base." });

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data?.user) return json(res, 401, { error: "Sessione non valida. Accedi di nuovo a RiverSignals." });

  // Best-effort per-instance throttle; the provider also applies its own quota and rate limits.
  const now = Date.now();
  const last = recentRequests.get(data.user.id) || 0;
  if (now - last < 2500) {
    res.setHeader("Retry-After", "3");
    return json(res, 429, { error: "Attendi qualche secondo prima di inviare un'altra richiesta." });
  }
  recentRequests.set(data.user.id, now);

  const messages = Array.isArray(req.body?.messages) ? req.body.messages.slice(-MAX_HISTORY) : [];
  const safeMessages = messages
    .filter((message) => message && ["user", "assistant"].includes(message.role) && typeof message.content === "string")
    .map((message) => ({ role: message.role, content: message.content.slice(0, MAX_CHARS) }));

  if (!safeMessages.length || safeMessages[safeMessages.length - 1].role !== "user") {
    return json(res, 400, { error: "Scrivi una richiesta prima di inviare." });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + groqKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "system", content: BASE_PROMPT }, ...safeMessages],
        temperature: 0.35,
        max_tokens: 650
      }),
      signal: controller.signal
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      if (response.status === 429) {
        res.setHeader("Retry-After", "30");
        return json(res, 429, { error: "RiverSSAI Base è temporaneamente occupato. Riprova tra poco." });
      }
      console.error("RiverSSAI Base provider error:", response.status);
      return json(res, 503, { error: "RiverSSAI Base non è disponibile in questo momento." });
    }
    const answer = payload?.choices?.[0]?.message?.content;
    if (typeof answer !== "string" || !answer.trim()) {
      return json(res, 502, { error: "RiverSSAI Base ha restituito una risposta vuota." });
    }
    return json(res, 200, { answer: answer.trim(), mode: "signals-base", model: MODEL });
  } catch (error) {
    console.error("RiverSSAI Base request failed:", error?.message || "unknown");
    return json(res, error?.name === "AbortError" ? 504 : 502, {
      error: error?.name === "AbortError" ? "La risposta ha superato il tempo massimo. Riprova." : "Connessione RiverSSAI Base non riuscita."
    });
  } finally {
    clearTimeout(timeout);
  }
}
