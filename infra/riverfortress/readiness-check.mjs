#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const inventoryPath = path.resolve(process.argv[2] ?? 'infra/riverfortress/readiness-inventory.json');
const inv = JSON.parse(fs.readFileSync(inventoryPath, 'utf8'));
const allowed = new Set(['contract','prototype-or-contract','ci-tested','operationally-verified']);
const problems = [];
if (inv.schemaVersion !== 1) problems.push('schemaVersion must equal 1');
if (!Array.isArray(inv.controls) || inv.controls.length === 0) problems.push('controls must be a non-empty array');
const seen = new Set();
for (const c of inv.controls ?? []) {
  if (!c.id || !c.name) problems.push('each control requires id and name');
  if (seen.has(c.id)) problems.push('duplicate control id: ' + c.id);
  seen.add(c.id);
  if (!allowed.has(c.status)) problems.push('invalid status for ' + c.id + ': ' + c.status);
  if (!Array.isArray(c.evidence)) problems.push('evidence must be an array for ' + c.id);
  if (c.status === 'ci-tested' && !(c.evidence ?? []).some(e => e.type === 'ci' && e.commit)) problems.push(c.id + ': ci-tested requires CI evidence with commit SHA');
  if (c.status === 'operationally-verified' && !(c.evidence ?? []).some(e => e.type === 'operational-test' && e.record)) problems.push(c.id + ': operationally-verified requires a test record');
}
if (problems.length) {
  console.error('RiverFortress readiness: FAIL');
  for (const p of problems) console.error('- ' + p);
  process.exitCode = 1;
} else {
  console.log('RiverFortress readiness inventory: VALID (schema/evidence claims only)');
  console.log('Controls:', inv.controls.length);
  console.log('This checker does NOT prove security or operational readiness.');
}
