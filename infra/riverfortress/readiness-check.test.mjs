import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const checker = path.resolve('infra/riverfortress/readiness-check.mjs');
function run(data) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rf-'));
  const file = path.join(dir, 'inventory.json');
  fs.writeFileSync(file, JSON.stringify(data));
  return spawnSync(process.execPath, [checker, file], {encoding:'utf8'});
}
const valid = {schemaVersion:1, controls:[{id:'F0',name:'Foundation',status:'contract',evidence:[]}]};
test('accepts valid inventory schema', () => { assert.equal(run(valid).status, 0); });
test('rejects duplicate ids', () => { const d=structuredClone(valid); d.controls.push({...d.controls[0]}); assert.notEqual(run(d).status,0); });
test('rejects unsupported status', () => { const d=structuredClone(valid); d.controls[0].status='ready'; assert.notEqual(run(d).status,0); });
test('requires commit evidence for CI-tested', () => { const d=structuredClone(valid); d.controls[0].status='ci-tested'; assert.notEqual(run(d).status,0); });
test('requires record for operational claims', () => { const d=structuredClone(valid); d.controls[0].status='operationally-verified'; assert.notEqual(run(d).status,0); });
