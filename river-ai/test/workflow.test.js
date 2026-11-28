import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root=path.dirname(fileURLToPath(import.meta.url));
const workflow=await readFile(path.join(root,'../../.github/workflows/riverssai-core-test.yml'),'utf8');

test('RiverSSAI CI pins checkout and setup-node to immutable SHAs',()=>{
  assert.match(workflow,/actions\/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1/);
  assert.match(workflow,/actions\/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1/);
  assert.match(workflow,/node-version:\s*'22'/);
  assert.match(workflow,/run:\s*npm test/);
});
