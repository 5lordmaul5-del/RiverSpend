export function rejectDuplicateObjectKeys(raw) {
  const stack = [];
  for (let i = 0; i < raw.length;) {
    const ch = raw[i];
    if (ch === '"') {
      const start = i++;
      while (i < raw.length) {
        if (raw[i] === "\\") { i += 2; continue; }
        if (raw[i] === '"') { i++; break; }
        i++;
      }
      const token = raw.slice(start, i);
      let next = i;
      while (next < raw.length && /\\s/.test(raw[next])) next++;
      const frame = stack[stack.length - 1];
      if (frame && frame.type === "object" && raw[next] === ":") {
        const key = JSON.parse(token);
        if (frame.keys.has(key)) throw new Error("duplicate_json_key");
        frame.keys.add(key);
      }
      continue;
    }
    if (ch === "{") stack.push({ type: "object", keys: new Set() });
    else if (ch === "[") stack.push({ type: "array" });
    else if (ch === "}" || ch === "]") stack.pop();
    i++;
  }
}
