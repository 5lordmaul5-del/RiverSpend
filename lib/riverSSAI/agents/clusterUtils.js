import { AGENTS_REGISTRY } from "../agentsRegistry";
import { AGENT_SIGNALS } from "../router";

// Build immutable domain clusters from the canonical registry and routing signals.
export function createCluster(agentKeys) {
  const cluster = {};
  for (const key of agentKeys) {
    const agent = AGENTS_REGISTRY[key];
    if (!agent) throw new Error("RiverSSAI cluster references unknown agent: " + key);
    if (cluster[key]) throw new Error("Duplicate RiverSSAI agent in cluster: " + key);
    const keywords = AGENT_SIGNALS[key] || [];
    cluster[key] = Object.freeze({
      id: key, key, name: agent.name, role: agent.role, sector: agent.sector,
      description: agent.prompt, prompt: agent.prompt,
      keywords: Object.freeze([...keywords]),
      embeddingText: [agent.name, agent.role, agent.sector, agent.prompt, ...keywords].join(". ")
    });
  }
  return Object.freeze(cluster);
}
