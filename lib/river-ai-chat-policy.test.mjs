import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { chatMemoryPolicy } from "./river-ai-chat-policy.mjs";

test("temporary chat explicitly disables memory reads and writes", () => {
  assert.deepEqual(chatMemoryPolicy({ temporaryChat: true }), {
    temporary: true, readMemory: false, writeMemory: false
  });
});

test("standard chat keeps memory policy enabled", () => {
  for (const body of [{}, { temporaryChat: false }, { temporaryChat: "true" }]) {
    assert.deepEqual(chatMemoryPolicy(body), {
      temporary: false, readMemory: true, writeMemory: true
    });
  }
});


test("UI temporary mode avoids local persistence and preserves saved history on exit", () => {
  const source = readFileSync(new URL("../pages/river-ai.js", import.meta.url), "utf8");
  assert.match(source, /else if \(storageKey && !temporaryChat\)/);
  assert.match(source, /skipNextPersistence\.current = true/);
  assert.match(source, /body: JSON\.stringify\(\{ messages: next, agent: selectedAgent, teamSize, temporaryChat \}\)/);
  assert.match(source, /function toggleTemporaryChat\(\)/);
});

test("API memory reads and writes are gated by the temporary-chat policy", () => {
  const source = readFileSync(new URL("../pages/api/river-ai/chat.js", import.meta.url), "utf8");
  assert.match(source, /if \(memoryPolicy\.readMemory\)/);
  assert.match(source, /if \(memoryPolicy\.writeMemory\)/);
  assert.match(source, /temporaryChat: memoryPolicy\.temporary/);
});
