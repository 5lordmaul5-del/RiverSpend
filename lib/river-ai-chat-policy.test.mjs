import test from "node:test";
import assert from "node:assert/strict";
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
