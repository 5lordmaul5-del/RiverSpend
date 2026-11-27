/**
 * RiverLatency Monitor: browser capability scan and explicit network probe.
 * Does not modify hardware buffers or claim acoustic/round-trip measurement.
 */
export function scanAudioCapabilities(env = globalThis) {
  const nav = env.navigator ?? {};
  const win = env.window ?? env;
  const AudioCtx = win.AudioContext ?? win.webkitAudioContext;
  const rtc = win.RTCPeerConnection;
  const devices = nav.mediaDevices;
  const ctx = AudioCtx ? new AudioCtx({ latencyHint: "interactive" }) : null;
  const info = {
    scannedAt: new Date().toISOString(),
    audioContextAvailable: Boolean(AudioCtx),
    requestedLatencyHint: ctx?.latencyHint ?? null,
    sampleRate: ctx?.sampleRate ?? null,
    baseLatencyMs: Number.isFinite(ctx?.baseLatency) ? ctx.baseLatency * 1000 : null,
    outputLatencyMs: Number.isFinite(ctx?.outputLatency) ? ctx.outputLatency * 1000 : null,
    mediaDevicesAvailable: Boolean(devices),
    enumerateDevicesAvailable: Boolean(devices?.enumerateDevices),
    getUserMediaAvailable: Boolean(devices?.getUserMedia),
    webrtcAvailable: Boolean(rtc),
    webAudioAvailable: Boolean(AudioCtx),
    note: "Browser-reported estimates; not a physical loopback test."
  };
  if (ctx?.close) ctx.close().catch(() => {});
  return info;
}

export async function listAudioDevices(mediaDevices) {
  if (!mediaDevices?.enumerateDevices) return { supported: false, devices: [] };
  try {
    const list = await mediaDevices.enumerateDevices();
    return { supported: true, devices: list.filter(d => d.kind === "audioinput" || d.kind === "audiooutput").map(d => ({ kind:d.kind, label:d.label || "Dispositivo audio (nome non disponibile)", deviceId:d.deviceId || null })) };
  } catch (error) {
    return { supported: true, devices: [], error: error?.name || "enumeration-failed" };
  }
}

/** Probe only an endpoint explicitly supplied by the application/user.
 * Endpoint must return promptly; measurements are HTTP request timings, not audio latency.
 */
export async function measureNetworkProbe(endpoint, { samples = 5, fetchImpl = globalThis.fetch } = {}) {
  if (!endpoint || typeof fetchImpl !== "function") throw new TypeError("endpoint and fetch implementation required");
  if (!Number.isInteger(samples) || samples < 2 || samples > 20) throw new RangeError("samples must be between 2 and 20");
  const values = [];
  for (let i=0;i<samples;i++) {
    const start = performance.now();
    try {
      await fetchImpl(endpoint, { method:"GET", cache:"no-store" });
      values.push(performance.now()-start);
    } catch (e) {
      return { ok:false, samples:values, error:e?.name || "probe-failed", note:"Probe endpoint/network failure." };
    }
  }
  const sorted=[...values].sort((a,b)=>a-b);
  const avg=values.reduce((a,b)=>a+b,0)/values.length;
  const jitter=values.slice(1).reduce((a,v,i)=>a+Math.abs(v-values[i]),0)/(values.length-1);
  return { ok:true, samples:values, averageMs:avg, medianMs:sorted[Math.floor(sorted.length/2)], jitterEstimateMs:jitter, note:"HTTP timing proxy only; not RTP/audio latency or a standardized jitter measurement." };
}
