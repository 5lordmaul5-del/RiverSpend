import test from "node:test";
import assert from "node:assert/strict";
import { samplesToMs, estimateBufferRoundTripMs, classifyLatency, chooseWorkflow } from "../lib/riverband/anti-latency-core.js";

test("sample conversion", () => assert.equal(samplesToMs(480, 48000), 10));
test("rough buffer round-trip estimate", () => assert.equal(estimateBufferRoundTripMs(128, 48000), 10.666666666666666));
test("latency classification boundaries", () => {
  assert.equal(classifyLatency(8).tier, "excellent");
  assert.equal(classifyLatency(15).tier, "good");
  assert.equal(classifyLatency(30).tier, "workable");
  assert.equal(classifyLatency(40).tier, "high");
});
test("network conditions choose best-effort live only for favorable measurements", () => {
  assert.equal(chooseWorkflow({roundTripMs:10, networkRttMs:12, jitterMs:2}).mode, "live-jam-candidate");
  assert.equal(chooseWorkflow({roundTripMs:15, networkRttMs:80, jitterMs:15}).mode, "remote-recording");
});
test("invalid inputs rejected", () => {
  assert.throws(() => samplesToMs(-1, 48000), RangeError);
  assert.throws(() => classifyLatency(-1), RangeError);
});
