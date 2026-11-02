import { createClient } from "@supabase/supabase-js";

const SYSTEM_PROMPT = `Sei River AI – CEO Edition, l'assistente AI privata dell'amministratore di RiverSpend.
Parla in italiano salvo diversa richiesta. Tono chiaro, concreto, paziente e collaborativo.
Il progetto si chiama RiverSpend; il marketplace è RiverSpendShop; payoff: YOUR SHOP • YOUR FLOW.
Ecosistema: RiverSpend Market, Pay, Shield, Box, Fidelity, Oracle, Experience, Recovery, Park, TV, Ecology, Fortress e RiverSpaceSignals.
Il proprietario non è uno sviluppatore: spiega le cose senza gergo e in piccoli passaggi.
Aiuta a ragionare, pianificare, diagnosticare problemi e preparare modifiche. Non affermare di aver letto il sito, modificato file, pubblicato codice, controllato ordini o eseguito azioni se non hai davvero ricevuto strumenti e conferme per farlo.
In questa prima versione puoi conversare e usare il contesto fornito, ma NON hai ancora accesso operativo a GitHub, Vercel o Supabase. Dillo chiaramente se ti viene chiesto di eseguire operazioni.
Non chiedere mai password, chiavi API, codici segreti o credenziali. Non rivelare segreti.
Per modifiche a pagamenti, dati personali, cancellazioni, pubblicazioni o impostazioni di sicurezza richiedi sempre conferma esplicita.
Non inventare lo stato attuale del sito, prezzi, ordini o dati di vendita. Distingui sempre fatti, ipotesi e proposte.`;

const json = (res, status, body) => res.status(status).json(body);

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { error: "Metodo non consentito." });
  }

  const apiKey = process.env.GROQ_API_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publicKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
  if (!apiKey) return json(res, 503, { error: "River AI non è ancora configurata: chiave AI mancante sul server." });
  if (!supabaseUrl || !publicKey || !serviceKey) return json(res, 503, { error: "Configurazione amministrativa Supabase incompleta." });

  const authorization = req.headers.authorization || "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!token) return json(res, 401, { error: "Accedi con il tuo account RiverSpend." });

  try {
    const authClient = createClient(supabaseUrl, publicKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data: authData, error: authError } = await authClient.auth.getUser(token);
    const user = authData?.user;
    if (authError || !user) return json(res, 401, { error: "Sessione non valida. Accedi di nuovo." });

    const adminClient = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data: role, error: roleError } = await adminClient
      .from("rs_admin_roles").select("role").eq("user_id", user.id).maybeSingle();
    if (roleError || role?.role !== "admin") return json(res, 403, { error: "River AI è riservata all'amministratore RiverSpend." });

    const incoming = Array.isArray(req.body?.messages) ? req.body.messages : [];
    const messages = incoming.slice(-16).map((item) => ({
      role: item?.role === "assistant" ? "assistant" : "user",
      content: String(item?.content || "").trim().slice(0, 6000)
    })).filter((item) => item.content);
    if (!messages.length || messages[messages.length - 1].role !== "user") {
      return json(res, 400, { error: "Scrivi un messaggio per River AI." });
    }
    if (messages.reduce((sum, item) => sum + item.content.length, 0) > 24000) {
      return json(res, 413, { error: "Conversazione troppo lunga. Apri una nuova chat." });
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "openai/gpt-oss-20b",
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
        max_completion_tokens: 1200
      })
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      console.error("River AI provider error:", response.status, payload?.error?.type || "provider_error");
      if (response.status === 429) return json(res, 429, { error: "Hai raggiunto temporaneamente il limite di utilizzo del modello. Riprova più tardi." });
      return json(res, 502, { error: "Il servizio AI non ha risposto correttamente. Riprova tra poco." });
    }
    const answer = payload?.choices?.[0]?.message?.content;
    if (!answer) return json(res, 502, { error: "River AI ha restituito una risposta vuota. Riprova." });
    return json(res, 200, { answer, model: payload.model || "openai/gpt-oss-20b" });
  } catch (error) {
    console.error("River AI request failed:", error?.message || "unknown");
    return json(res, 500, { error: "Errore temporaneo durante la richiesta a River AI." });
  }
}
