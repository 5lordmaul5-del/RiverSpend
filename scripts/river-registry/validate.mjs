import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";

const path = new URL("../../registry/river-apps.registry.json", import.meta.url);
const registry = JSON.parse(await readFile(path, "utf8"));

assert.equal(registry.registry_version, "1.0.0");
assert.ok(Array.isArray(registry.applications) && registry.applications.length > 0);
assert.ok(Array.isArray(registry.platform_services));

const appIds = registry.applications.map((app) => app.app_id);
const serviceIds = registry.platform_services.map((service) => service.service_id);
assert.equal(new Set(appIds).size, appIds.length, "Duplicate application IDs");
assert.equal(new Set(serviceIds).size, serviceIds.length, "Duplicate service IDs");

for (const app of registry.applications) {
  assert.match(app.app_id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, `Invalid app_id: ${app.app_id}`);
  assert.ok(app.display_name?.trim(), `Missing display_name: ${app.app_id}`);
  assert.equal(app.status, "identified_unverified", `Unexpected initial status: ${app.app_id}`);
  for (const field of ["repository", "repository_path", "deployment_url", "environment", "runtime", "health_endpoint", "api_version", "owner_service", "last_verified_at"]) {
    assert.ok(Object.hasOwn(app, field), `Missing ${field}: ${app.app_id}`);
  }
}

for (const service of registry.platform_services) {
  assert.match(service.service_id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, `Invalid service_id: ${service.service_id}`);
  assert.ok(service.display_name?.trim(), `Missing service display_name: ${service.service_id}`);
}

console.log(`River registry valid: ${appIds.length} applications, ${serviceIds.length} platform services.`);
