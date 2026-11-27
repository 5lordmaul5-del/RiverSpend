import test from 'node:test';
import assert from 'node:assert/strict';
import { computeWaveformPeaks } from './waveform.mjs';

test('computes peaks across stereo channels and bins', () => {
  const left = Float32Array.from([0, 0.25, -0.5, 0, 0.9, 0, -0.1, 0]);
  const right = Float32Array.from([0, -0.2, 0, 0.3, 0, 0.6, 0, -0.7]);
  assert.deepEqual(computeWaveformPeaks([left, right], 4), [0.25, 0.5, 0.9, 0.7]);
});

test('handles empty and short buffers without empty bins', () => {
  assert.deepEqual(computeWaveformPeaks([], 128), []);
  assert.deepEqual(computeWaveformPeaks([Float32Array.from([-0.75])], 128), [0.75]);
});

test('ignores non-finite samples and clamps peaks to one', () => {
  const channel = Float32Array.from([NaN, Infinity, -2, 0.1]);
  assert.deepEqual(computeWaveformPeaks([channel], 2), [0, 1]);
});
