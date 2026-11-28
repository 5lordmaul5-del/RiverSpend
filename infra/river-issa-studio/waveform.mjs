export function computeWaveformPeaks(channelData, binCount = 128) {
  const channels = Array.from(channelData || []).filter((channel) => channel && typeof channel.length === "number");
  if (!channels.length) return [];
  const length = Math.min(...channels.map((channel) => channel.length));
  if (!length) return [];

  const requested = Math.floor(Number(binCount) || 1);
  const count = Math.min(length, 4096, Math.max(1, requested));
  const peaks = new Array(count);

  for (let bin = 0; bin < count; bin += 1) {
    const start = Math.floor(bin * length / count);
    const end = Math.max(start + 1, Math.floor((bin + 1) * length / count));
    let peak = 0;
    for (const channel of channels) {
      for (let sample = start; sample < Math.min(end, length); sample += 1) {
        const value = Number(channel[sample]);
        if (Number.isFinite(value)) peak = Math.max(peak, Math.abs(value));
      }
    }
    peaks[bin] = Math.min(1, peak);
  }
  return peaks;
}
