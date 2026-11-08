/**
 * Server-side LLM provider with automatic fallback.
 * Supported backup configuration:
 *   BACKUP_LLM_API_KEY / BACKUP_LLM_BASE_URL / BACKUP_LLM_MODEL
 * Legacy aliases:
 *   OPENROUTER_API_KEY / OPENROUTER_BASE_URL / RIVER_AI_BACKUP_MODEL
 */
function isRetryable(error) {
  return error?.name === "AbortError"
    || error instanceof TypeError
    || error?.status === 408
    || error?.status === 429
    || (Number(error?.status) >= 500 && Number(error?.status) <= 599);
}

function getProviders() {
  const providers = [];
  const groqKey = process.env.GROQ_API_KEY;
  const groqModel = process.env.GROQ_MODEL || process.env.RIVER_AI_MODEL || "openai/gpt-oss-20b";
  const backupKey = process.env.BACKUP_LLM_API_KEY || process.env.OPENROUTER_API_KEY;
  const backupUrl = process.env.BACKUP_LLM_BASE_URL || process.env.OPENROUTER_BASE_URL
    || "https://openrouter.ai/api/v1/chat/completions";
  const backupModel = process.env.BACKUP_LLM_MODEL || process.env.RIVER_AI_BACKUP_MODEL;

  if (groqKey) providers.push({
    name: "groq",
    endpoint: "https://api.groq.com/openai/v1/chat/completions",
    apiKey: groqKey,
    model: groqModel
  });

  if (backupKey && backupModel) {
    const isOpenRouter = /openrouter\.ai/i.test(backupUrl);
    providers.push({
      name: isOpenRouter ? "openrouter" : "backup",
      endpoint: backupUrl,
      apiKey: backupKey,
      model: backupModel
    });
  } else if (backupKey && !backupModel) {
    throw new Error("Provider di backup configurato senza BACKUP_LLM_MODEL.");
  }

  if (!providers.length) throw new Error("Nessun provider LLM configurato.");
  return providers;
}

async function requestProvider(provider, messages, options) {
  const controller = new AbortController();
  const timeoutMs = Number.isFinite(options.timeout_ms) ? options.timeout_ms : 45000;
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const headers = {
      Authorization: "Bearer " + provider.apiKey,
      "Content-Type": "application/json"
    };
    if (provider.name === "openrouter") {
      if (process.env.OPENROUTER_SITE_URL) headers["HTTP-Referer"] = process.env.OPENROUTER_SITE_URL;
      headers["X-Title"] = "RiverSpend RiverSSAI";
    }
    const response = await fetch(provider.endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: provider.model,
        messages,
        temperature: options.temperature ?? 0.3,
        max_tokens: options.max_tokens ?? 250
      }),
      signal: controller.signal
    });

    const raw = await response.text();
    let payload = {};
    try { payload = raw ? JSON.parse(raw) : {}; } catch { /* invalid provider response */ }

    if (!response.ok) {
      const error = new Error(payload?.error?.message || provider.name + " HTTP " + response.status);
      error.status = response.status;
      error.provider = provider.name;
      throw error;
    }

    const content = payload?.choices?.[0]?.message?.content;
    if (typeof content !== "string" || !content.trim()) {
      const error = new Error(provider.name + " ha restituito una risposta vuota o non valida.");
      error.status = 502;
      error.provider = provider.name;
      throw error;
    }

    return { success: true, provider: provider.name, model: provider.model, content: content.trim() };
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Calls Groq first and transparently falls back to the configured OpenAI-compatible provider
 * for rate limits, transient server errors, timeouts and network failures.
 */
export async function callLLMWithFailover(messages, options = {}) {
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new TypeError("I messaggi LLM devono essere un array non vuoto.");
  }

  const providers = getProviders();
  let lastError;

  for (let index = 0; index < providers.length; index += 1) {
    const provider = providers[index];
    try {
      const result = await requestProvider(provider, messages, options);
      if (index > 0) {
        console.warn("[RiverSSAI Failover] Provider secondario attivato:", provider.name);
      }
      return result;
    } catch (error) {
      lastError = error;
      const hasBackup = index < providers.length - 1;
      if (!hasBackup || !isRetryable(error)) throw error;
      console.warn("[RiverSSAI Failover] Provider primario temporaneamente non disponibile:", error?.status || error?.name || "network");
    }
  }

  throw lastError || new Error("Tutti i provider LLM sono temporaneamente non disponibili.");
}
