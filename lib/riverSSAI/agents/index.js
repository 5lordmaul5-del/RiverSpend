import { AGENTS_REGISTRY } from "../agentsRegistry";
import { fiscalCluster } from "./fiscal";
import { p2pCluster } from "./p2p";
import { ecommerceCluster } from "./ecommerce";
import { analyticsCluster } from "./analytics";
import { securityCluster } from "./security";
import { platformCluster } from "./platform";

export const ALL_CLUSTERS = Object.freeze({ fiscal: fiscalCluster, p2p: p2pCluster, ecommerce: ecommerceCluster, analytics: analyticsCluster, security: securityCluster, platform: platformCluster });

const clusterEntries = Object.entries(ALL_CLUSTERS).flatMap(([cluster, agents]) => Object.keys(agents).map(key => ({ key, cluster })));
const seenKeys = new Set();
for (const item of clusterEntries) {
  if (seenKeys.has(item.key)) throw new Error("RiverSSAI agent assigned to multiple clusters: " + item.key);
  seenKeys.add(item.key);
}
const expectedKeys = Object.keys(AGENTS_REGISTRY).filter(key => key !== "nova");
const missingKeys = expectedKeys.filter(key => !seenKeys.has(key));
const unknownKeys = [...seenKeys].filter(key => !AGENTS_REGISTRY[key]);
if (missingKeys.length || unknownKeys.length) throw new Error("RiverSSAI cluster registry mismatch. Missing: " + missingKeys.join(", ") + ". Unknown: " + unknownKeys.join(", ") + ".");

export function getAgentByClusterAndKey(clusterKey, agentKey) { return ALL_CLUSTERS[clusterKey]?.[agentKey] ?? null; }
export function getAgentsByCluster(clusterKey) { return ALL_CLUSTERS[clusterKey] ?? {}; }
export function getAllAgents() { return clusterEntries.map(({ key, cluster }) => ({ ...ALL_CLUSTERS[cluster][key], cluster })); }
export function getAgentCount() { return clusterEntries.length; }
export function getClusterForAgent(agentKey) { return clusterEntries.find(item => item.key === agentKey)?.cluster ?? null; }
