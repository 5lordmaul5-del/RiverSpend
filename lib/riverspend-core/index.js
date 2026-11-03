/**
 * RiverSpend Core — server-only integration registry.
 *
 * Never import this module from browser components. Provider secrets are read
 * from server environment variables and are never returned by getCoreStatus().
 */

const PROVIDERS = Object.freeze({
  supabase: {
    label: "Supabase",
    env: ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"],
    services: ["Shop", "Signals", "Pay", "Box", "Panel Control"],
  },
  paypal: {
    label: "PayPal",
    env: ["PAYPAL_CLIENT_ID", "PAYPAL_CLIENT_SECRET", "PAYPAL_MODE"],
    services: ["Pay", "Shop", "Signals"],
  },
  sumup: {
    label: "SumUp",
    env: ["SUMUP_API_KEY", "SUMUP_MERCHANT_CODE"],
    services: ["Pay", "Shop"],
  },
  push: {
    label: "Web Push",
    env: ["PUSH_SEND_SECRET", "WEB_PUSH_VAPID_PUBLIC_KEY", "WEB_PUSH_VAPID_PRIVATE_KEY"],
    services: ["Signals", "Shop", "Park"],
  },
  riverAi: {
    label: "River AI",
    env: ["GROQ_API_KEY"],
    services: ["River AI", "Signals", "Shop"],
  },
});

function isConfigured(name) {
  const value = process.env[name];
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * Returns safe integration metadata only. Never return secret values,
 * partial keys, tokens, or raw environment data.
 */
export function getCoreStatus() {
  return Object.entries(PROVIDERS).map(([id, provider]) => {
    const missing = provider.env.filter((name) => !isConfigured(name));
    return {
      id,
      label: provider.label,
      status: missing.length === 0 ? "configured" : "needs_setup",
      missingCount: missing.length,
      services: provider.services,
    };
  });
}

/**
 * Server-side guard for a provider adapter. Returns true only when all
 * required environment variables exist; does not reveal their values.
 */
export function isProviderReady(providerId) {
  const provider = PROVIDERS[providerId];
  if (!provider) return false;
  return provider.env.every(isConfigured);
}

/**
 * Access a provider secret only from server-side code. Unknown keys are
 * rejected so callers cannot use this helper as an arbitrary env reader.
 */
export function getProviderSecret(providerId, envName) {
  const provider = PROVIDERS[providerId];
  if (!provider || !provider.env.includes(envName)) {
    throw new Error("RiverSpend Core: unsupported provider credential");
  }
  const value = process.env[envName];
  if (!value || !value.trim()) {
    throw new Error(`RiverSpend Core: ${envName} is not configured`);
  }
  return value;
}

export const riverSpendCoreVersion = "1.0.0";
