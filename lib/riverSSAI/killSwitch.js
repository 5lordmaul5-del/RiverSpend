const DEFAULT_STATE = Object.freeze({
  shopActive: true,
  stripeEnabled: true,
  aiChatEnabled: true,
  forceStaticCdn: false,
  lastUpdated: null,
  updatedBy: "system"
});
const MUTABLE_FLAGS = ["shopActive", "stripeEnabled", "aiChatEnabled"];

function config() {
  const id = process.env.FORTRESS_EDGE_CONFIG_ID;
  const readToken = process.env.FORTRESS_EDGE_CONFIG_READ_TOKEN;
  const writeToken = process.env.VERCEL_ACCESS_TOKEN;
  if (!id || !/^ecfg_/.test(id) || !readToken || !writeToken) {
    throw new Error("Control plane non configurato: servono FORTRESS_EDGE_CONFIG_ID, FORTRESS_EDGE_CONFIG_READ_TOKEN e VERCEL_ACCESS_TOKEN.");
  }
  return { id, readToken, writeToken };
}
export async function getFortressStatus() {
  const { id, readToken } = config();
  const response = await fetch("https://global-config.vercel.com/" + encodeURIComponent(id) + "/items", {
    headers: { Authorization: "Bearer " + readToken },
    cache: "no-store"
  });
  if (!response.ok) throw new Error("Lettura Edge Config fallita (HTTP " + response.status + ").");
  const items = await response.json();
  const stored = items?.fortress_state;
  return { ...DEFAULT_STATE, ...(stored && typeof stored === "object" ? stored : {}) };
}
export async function updateFortressState(newFlags, updatedBy = "admin") {
  if (!newFlags || typeof newFlags !== "object" || Array.isArray(newFlags)) throw new TypeError("I flag della fortezza non sono validi.");
  const keys = Object.keys(newFlags);
  if (!keys.length || keys.some((key) => !MUTABLE_FLAGS.includes(key))) throw new TypeError("Uno o più flag non sono modificabili tramite questa API.");
  if (keys.some((key) => typeof newFlags[key] !== "boolean")) throw new TypeError("Ogni flag deve essere booleano.");
  const current = await getFortressStatus();
  const next = { ...current, ...newFlags, lastUpdated: new Date().toISOString(), updatedBy: String(updatedBy).slice(0, 80) };
  const { id, writeToken } = config();
  const url = new URL("https://api.vercel.com/v1/global-config/" + encodeURIComponent(id) + "/items");
  if (process.env.VERCEL_TEAM_ID) url.searchParams.set("teamId", process.env.VERCEL_TEAM_ID);
  const response = await fetch(url.toString(), {
    method: "PATCH",
    headers: { Authorization: "Bearer " + writeToken, "Content-Type": "application/json" },
    body: JSON.stringify({ items: [{ operation: "upsert", key: "fortress_state", value: next, description: "RiverSpend Fortress emergency control state" }] }),
    cache: "no-store"
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error("Aggiornamento Edge Config fallito (HTTP " + response.status + "): " + detail.slice(0, 240));
  }
  return next;
}
export function isModuleEnabled(moduleName, state) {
  switch (moduleName) {
    case "shop": return state.shopActive;
    case "stripe": return state.stripeEnabled && state.shopActive;
    case "ai": return state.aiChatEnabled;
    case "cdn_forced": return state.forceStaticCdn;
    default: return true;
  }
}
export { MUTABLE_FLAGS };
