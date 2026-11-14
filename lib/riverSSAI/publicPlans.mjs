// RiverSSAI 10.0 — catalogo commerciale pubblico (anteprima).
// Prezzi approvati; checkout volutamente disabilitato fino a decisione esplicita.
export const RIVERSSAI_PUBLIC_PLANS = [
  {
    id: "free",
    name: "Free",
    priceEur: 0,
    interval: "month",
    audience: "Per conoscere RiverSSAI",
    description: "Accesso gratuito a Nova con una quota giornaliera essenziale.",
    level: "free",
  },
  {
    id: "bronze",
    name: "Bronzo",
    priceEur: 2.99,
    interval: "month",
    audience: "Per iniziare",
    description: "Accesso alle funzioni essenziali di RiverSSAI.",
    level: "entry",
  },
  {
    id: "silver",
    name: "Argento",
    priceEur: 5.99,
    interval: "month",
    audience: "Per un uso regolare",
    description: "Maggiore capacità di utilizzo e accesso a più strumenti.",
    level: "standard",
  },
  {
    id: "gold",
    name: "Oro",
    priceEur: 12.99,
    interval: "month",
    audience: "Per un uso avanzato",
    description: "Capacità superiore e accesso ampliato agli specialisti compatibili.",
    level: "advanced",
  },
  {
    id: "platinum",
    name: "Platinum",
    priceEur: 24.99,
    interval: "month",
    audience: "Per il massimo livello pubblico",
    description: "Il livello pubblico più completo, con priorità e capacità maggiori.",
    level: "premium",
  },
];

export const RIVERSSAI_COMMERCE_STATUS = Object.freeze({
  mode: "preview",
  currency: "EUR",
  interval: "month",
  checkoutEnabled: false,
  subscriptionsEnabled: false,
  accountProvisioningEnabled: false,
  ownerPlanPubliclyAssignable: false,
});
