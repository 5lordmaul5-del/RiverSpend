import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";

const registry = JSON.parse(await readFile(new URL("../../registry/river-apps.registry.json", import.meta.url), "utf8"));
const topology = JSON.parse(await readFile(new URL("../../architecture/river-datacenter-rss.topology.json", import.meta.url), "utf8"));

assert.equal(topology.topology_version, "1.0.0");
assert.equal(topology.status, "design_only");
assert.equal(topology.source_registry, "registry/river-apps.registry.json");

const nodeIds = topology.nodes.map((node) => node.id);
assert.equal(new Set(nodeIds).size, nodeIds.length, "Duplicate topology node IDs");

const expectedIds = new Set([
  ...registry.applications.map((app) => app.app_id),
  ...registry.platform_services.map((service) => service.service_id),
]);
for (const id of expectedIds) {
  assert.ok(nodeIds.includes(id), `Registry entry missing from topology: ${id}`);
}
for (const node of topology.nodes) {
  assert.ok(expectedIds.has(node.id), `Unknown topology node: ${node.id}`);
  assert.ok(["application", "platform_service"].includes(node.kind), `Invalid node kind: ${node.id}`);
}
for (const edge of topology.edges) {
  assert.ok(expectedIds.has(edge.from), `Unknown edge source: ${edge.from}`);
  assert.ok(expectedIds.has(edge.to), `Unknown edge target: ${edge.to}`);
  assert.equal(edge.status, "planned", "Topology edges must remain explicitly planned until verified");
}
assert.ok(topology.guardrails.length >= 4);
console.log(`River topology valid: ${topology.nodes.length} nodes, ${topology.edges.length} planned edges.`);
