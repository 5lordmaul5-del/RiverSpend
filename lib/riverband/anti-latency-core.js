/**
 * RiverBand AntiLatency Core — browser-safe diagnostics and timing helpers.
 * This module does not claim to remove Internet latency; it estimates, measures,
 * and provides transparent guidance for recording vs live-jam workflows.
 */
export const BUFFER_PRESETS = Object.freeze([
  { samples: 64, label: "Ultra-low", risk: "high" },
  { samples: 128, label: "Low", risk: "medium" },
  { samples: 256, label: "Balanced", risk: "low" },
  { samples: 512, label: "Stable", risk: "very-low" },
]);

export function samplesToMs(samples, sampleRate) {
  if (!Number.isFinite(samples) || samples < 0 || !Number.isFinite(sampleRate) || sampleRate <= 0) {
    throw new RangeError("samples and sampleRate must be valid non-negative/positive numbers");
  }
  return (samples / sampleRate) * 1000;
}

export function estimateBufferRoundTripMs(bufferSamples, sampleRate, buffersPerDirection = 2) {
  if (!Number.isFinite(buffersPerDirection) || buffersPerDirection < 1) {
    throw new RangeError("buffersPerDirection must be >= 1");
  }
  return samplesToMs(bufferSamples, sampleRate) * buffersPerDirection * 2;
}

export function classifyLatency(ms) {
  if (!Number.isFinite(ms) || ms < 0) throw new RangeError("latency must be finite and non-negative");
  if (ms <= 10) return { tier: "excellent", label: "Molto reattivo" };
  if (ms <= 20) return { tier: "good", label: "Buono" };
  if (ms <= 35) return { tier: "workable", label: "Utilizzabile con cautela" };
  return { tier: "high", label: "Ritardo elevato: preferire registrazione sincronizzata" };
}

export function chooseWorkflow({ roundTripMs, networkRttMs, jitterMs = 0 } = {}) {
  const local = classifyLatency(roundTripMs ?? 0);
  if (networkRttMs == null) return { mode: "local-monitoring", local, message: "Misura locale; rete non misurata." };
  if (![networkRttMs, jitterMs].every(Number.isFinite) || networkRttMs < 0 || jitterMs < 0) {
    throw new RangeError("network RTT and jitter must be finite and non-negative");
  }
  if (networkRttMs <= 20 && jitterMs <= 5 && roundTripMs <= 20) {
    return { mode: "live-jam-candidate", local, message: "Condizioni favorevoli, ma prova audio reale necessaria." };
  }
  return { mode: "remote-recording", local, message: "Usare take registrati, click/reference e sincronizzazione in post-produzione." };
}
