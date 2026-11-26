// Strict bounded canonicalization for mock API JSON payloads.
const PROTECTED_KEYS = new Set(["__proto__","prototype","constructor"]);
const isPlainObject = value => !!value && typeof value === "object" && !Array.isArray(value) &&
  (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null);

export function canonicalJson(value, { maxDepth = 32, maxBytes = 8192, maxNodes = 10000 } = {}) {
  if (!Number.isSafeInteger(maxDepth) || maxDepth < 1 || maxDepth > 128 ||
      !Number.isSafeInteger(maxBytes) || maxBytes < 1 ||
      !Number.isSafeInteger(maxNodes) || maxNodes < 1) throw new Error("canonical_limits_invalid");
  const active = new WeakSet();
  let bytes = 0, nodes = 0;
  function emit(part) {
    bytes += Buffer.byteLength(part);
    if (bytes > maxBytes) throw new Error("json_size_exceeded");
    return part;
  }
  function walk(value, depth) {
    if (depth > maxDepth) throw new Error("json_depth_exceeded");
    if (++nodes > maxNodes) throw new Error("json_nodes_exceeded");
    if (value === null || typeof value === "string" || typeof value === "boolean") return emit(JSON.stringify(value));
    if (typeof value === "number") {
      if (!Number.isFinite(value)) throw new Error("json_number_invalid");
      return emit(JSON.stringify(value));
    }
    if (Array.isArray(value)) {
      if (Object.getPrototypeOf(value)!==Array.prototype || active.has(value) || value.length > maxNodes) throw new Error("json_array_invalid");
      const keys=Reflect.ownKeys(value);
      if (keys.length!==value.length+1||!keys.includes("length")||
          keys.some(key=>key!=="length"&&(typeof key!=="string"||!/^(0|[1-9][0-9]*)$/.test(key)||Number(key)>=value.length))) throw new Error("json_array_invalid");
      for (let index = 0; index < value.length; index++) {
        const descriptor = Object.getOwnPropertyDescriptor(value, String(index));
        if (!descriptor || !descriptor.enumerable || !Object.hasOwn(descriptor, "value")) throw new Error("json_array_invalid");
      }
      active.add(value);
      try {
        const parts = [emit("[")];
        for (let index = 0; index < value.length; index++) {
          if (index) parts.push(emit(","));
          parts.push(walk(Object.getOwnPropertyDescriptor(value,String(index)).value, depth + 1));
        }
        parts.push(emit("]"));
        return parts.join("");
      } finally { active.delete(value); }
    }
    if (isPlainObject(value)) {
      if (active.has(value)) throw new Error("json_cycle_detected");
      const ownKeys=Reflect.ownKeys(value);
      if(ownKeys.some(key=>typeof key!=="string"))throw new Error("json_object_invalid");
      const keys=ownKeys.sort();
      if(keys.some(key=>PROTECTED_KEYS.has(key)))throw new Error("json_key_invalid");
      active.add(value);
      try {
        const parts = [emit("{")];
        for (let index = 0; index < keys.length; index++) {
          const key=keys[index],descriptor=Object.getOwnPropertyDescriptor(value,key);
          if(!descriptor||!descriptor.enumerable||!Object.hasOwn(descriptor,"value"))throw new Error("json_object_invalid");
          if (index) parts.push(emit(","));
          parts.push(emit(JSON.stringify(key)), emit(":"), walk(descriptor.value, depth + 1));
        }
        parts.push(emit("}"));
        return parts.join("");
      } finally { active.delete(value); }
    }
    throw new Error("json_value_invalid");
  }
  return walk(value, 0);
}
