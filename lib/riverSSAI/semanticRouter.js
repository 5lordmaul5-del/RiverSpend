import { ALL_CLUSTERS } from "./agents";

const MAX_SPECIALISTS = 2;
const DEFAULT_MIN_VECTOR_SCORE = 0.35; // Soglia provvisoria: calibrare su richieste etichettate.

function isVector(value) {
  return Array.isArray(value) || (typeof ArrayBuffer !== "undefined" && ArrayBuffer.isView(value));
}

function normalizeText(value = "") {
  return String(value)
    .toLocaleLowerCase("it")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

export function cosineSimilarity(left, right) {
  if (!isVector(left) || !isVector(right) || !left.length || left.length !== right.length) return 0;
  let dot = 0;
  let normLeft = 0;
  let normRight = 0;
  for (let index = 0; index < left.length; index += 1) {
    const a = Number(left[index]);
    const b = Number(right[index]);
    if (!Number.isFinite(a) || !Number.isFinite(b)) return 0;
    dot += a * b;
    normLeft += a * a;
    normRight += b * b;
  }
  if (!normLeft || !normRight) return 0;
  return dot / (Math.sqrt(normLeft) * Math.sqrt(normRight));
}

function keywordScore(query, keywords) {
  let score = 0;
  for (const keyword of keywords || []) {
    const normalized = normalizeText(keyword);
    if (normalized && query.includes(normalized)) score += normalized.includes(" ") ? 2 : 1;
  }
  return score;
}

function rankedClusterScores(scores) {
  return Object.entries(scores)
    .map(([cluster, score]) => ({ cluster, score }))
    .sort((a, b) => b.score - a.score || a.cluster.localeCompare(b.cluster));
}

function fallbackResult(method = "keyword-fallback") {
  return { cluster: null, agents: [], confidence: null, method, fallback: true };
}

function routeWithVectors(messageEmbedding, options) {
  const agentEmbeddings = options.agentEmbeddings || {};
  const clusterEmbeddings = options.clusterEmbeddings || {};
  const minScore = Number.isFinite(options.minVectorScore) ? options.minVectorScore : DEFAULT_MIN_VECTOR_SCORE;
  const clusterScores = {};
  const agentScores = {};

  for (const [clusterKey, agents] of Object.entries(ALL_CLUSTERS)) {
    const scores = [];
    for (const agentKey of Object.keys(agents)) {
      const embedding = agentEmbeddings[agentKey];
      if (!embedding) continue;
      const score = cosineSimilarity(messageEmbedding, embedding);
      agentScores[agentKey] = score;
      scores.push(score);
    }
    scores.sort((a, b) => b - a);
    const explicitClusterEmbedding = clusterEmbeddings[clusterKey];
    if (explicitClusterEmbedding) {
      clusterScores[clusterKey] = cosineSimilarity(messageEmbedding, explicitClusterEmbedding);
    } else {
      const weights = [1, 0.5, 0.25];
      const topScores = scores.slice(0, 3);
      const weightedTotal = topScores.reduce((sum, score, index) => sum + score * weights[index], 0);
      const weightTotal = topScores.reduce((sum, score, index) => sum + weights[index], 0);
      clusterScores[clusterKey] = weightTotal ? weightedTotal / weightTotal : 0;
    }
  }

  const rankedClusters = rankedClusterScores(clusterScores);
  const bestCluster = rankedClusters[0];
  if (!bestCluster || bestCluster.score < minScore) return fallbackResult("vector");
  if (rankedClusters[1] && bestCluster.score - rankedClusters[1].score < 0.025) return fallbackResult("vector-ambiguous");

  const candidates = Object.keys(ALL_CLUSTERS[bestCluster.cluster])
    .map(key => ({ key, cluster: bestCluster.cluster, score: agentScores[key] ?? 0 }))
    .filter(candidate => candidate.score >= minScore)
    .sort((a, b) => b.score - a.score || a.key.localeCompare(b.key))
    .slice(0, MAX_SPECIALISTS);
  if (!candidates.length) return fallbackResult("vector");
  return { cluster: bestCluster.cluster, agents: candidates, confidence: candidates[0].score, method: "vector", fallback: false };
}

function routeWithKeywords(userMessage) {
  const query = normalizeText(userMessage);
  if (!query) return fallbackResult();
  const perCluster = {};
  for (const [clusterKey, agents] of Object.entries(ALL_CLUSTERS)) {
    perCluster[clusterKey] = Object.entries(agents)
      .map(([key, agent]) => ({ key, score: keywordScore(query, agent.keywords) }))
      .filter(candidate => candidate.score > 0)
      .sort((a, b) => b.score - a.score || a.key.localeCompare(b.key));
  }
  // I migliori tre specialisti pesano il cluster: la dimensione del cluster non dà un vantaggio automatico.
  const clusterScores = Object.fromEntries(Object.entries(perCluster).map(([cluster, scores]) => [
    cluster, scores.slice(0, 3).reduce((sum, item, index) => sum + item.score / (index + 1), 0)
  ]));
  const rankedClusters = rankedClusterScores(clusterScores).filter(item => item.score > 0);
  const bestCluster = rankedClusters[0];
  if (!bestCluster) return fallbackResult();
  if (rankedClusters[1] && rankedClusters[1].score === bestCluster.score) return fallbackResult("keyword-ambiguous");
  const candidates = (perCluster[bestCluster.cluster] || []).slice(0, MAX_SPECIALISTS)
    .map(candidate => ({ ...candidate, cluster: bestCluster.cluster }));
  if (!candidates.length) return fallbackResult();
  return { cluster: bestCluster.cluster, agents: candidates, confidence: null, method: "keyword-fallback", fallback: false };
}

/**
 * Router a due livelli. Se riceve queryEmbedding e agentEmbeddings precalcolati usa cosine similarity.
 * In assenza di un provider vettoriale usa il fallback keyword, senza dichiararlo semanticamente.
 */
export function routeTo200PlusAgents(userMessage, options = {}) {
  const queryEmbedding = options.queryEmbedding;
  if (isVector(queryEmbedding) && queryEmbedding.length && options.agentEmbeddings) {
    return routeWithVectors(queryEmbedding, options);
  }
  return routeWithKeywords(userMessage);
}
