/**
 * RiverPay provider registry.
 *
 * Readiness metadata only. Live processing is disabled.
 */
const PROVIDER_ENV = {
  stripe: {
    credentials: ["RIVERPAY_STRIPE_SECRET_KEY"],
    webhook: ["RIVERPAY_STRIPE_WEBHOOK_SECRET"]
  },
  paypal: {
    credentials: ["RIVERPAY_PAYPAL_CLIENT_ID", "RIVERPAY_PAYPAL_SECRET"],
    webhook: ["RIVERPAY_PAYPAL_WEBHOOK_ID"]
  },
  sumup: {
    credentials: ["RIVERPAY_SUMUP_API_KEY"],
    webhook: ["RIVERPAY_SUMUP_WEBHOOK_SECRET"]
  }
};

function allPresent(names, env) {
  return names.every((name) => Boolean(env[name]));
}

export function getRiverPayProviderRegistry(env = process.env) {
  return Object.entries(PROVIDER_ENV).reduce((registry, [provider, config]) => {
    const stripeTestReady = provider !== "stripe" ||
      (env.RIVERPAY_STRIPE_TEST_MODE === "true" &&
       String(env.RIVERPAY_STRIPE_SECRET_KEY || "").startsWith("sk_test_"));
    registry[provider] = {
      credentialsReady: allPresent(config.credentials, env),
      webhookReady: allPresent(config.webhook, env),
      testMode: stripeTestReady,
      enabled: false
    };
    return registry;
  }, {});
}

export function getRiverPayRuntimeStatus(env = process.env) {
  return {
    mode: "test_only",
    livePaymentsEnabled: false,
    liveTransfersEnabled: false,
    providers: getRiverPayProviderRegistry(env)
  };
}
