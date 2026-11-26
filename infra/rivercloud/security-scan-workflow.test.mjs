import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const workflow = await readFile(path.join(root, "../../.github/workflows/rivercloud-tests.yml"), "utf8");

test("RiverCloud CI pins Trivy and generates a CycloneDX image SBOM", () => {
  assert.match(workflow, /aquasecurity\/setup-trivy@e07451d2e059ed86c2870430ea286b3a9e0bf241/);
  assert.match(workflow, /version:\s*v0\.76\.2/);
  assert.match(workflow, /trivy image --scanners vuln --format cyclonedx --output rivercloud-api-sbom\.cdx\.json rivercloud-api:ci/);
  assert.match(workflow, /GITHUB_STEP_SUMMARY/);
  assert.match(workflow, /SHA-256/);
  assert.match(workflow, /not uploaded or retained as an artifact/);
});

test("RiverCloud CI gates fixed HIGH and CRITICAL image vulnerabilities", () => {
  assert.match(workflow, /trivy image --scanners vuln --vuln-type os,library --severity HIGH,CRITICAL --ignore-unfixed --exit-code 1 rivercloud-api:ci/);
});
