// Registry definitions only: no agent processes, execution or credentials are created here.
export const MAX_AGENT_DEFINITIONS = 100000;
const ID = /^[a-z0-9][a-z0-9._:-]{1,127}$/;
const VERSION = /^\d+\.\d+\.\d+(?:-[a-z0-9.-]+)?$/;
const CAPABILITY = /^[a-z][a-z0-9:_-]{1,63}$/;
const DOMAINS = /^[a-z][a-z0-9._-]{1,63}$/;
const RISK = new Set(["low","medium","high"]);
const STATUS = new Set(["draft","active","deprecated"]);
const KEYS = ["id","version","name","domain","capabilities","inputSchema","outputSchema","riskClass","requiresApproval","maxRunSeconds","maxConcurrency","status"];
const SCHEMA_TYPES = new Set(["string","number","integer","boolean","array","object"]);

function plainObject(v) {
  return !!v && typeof v === "object" && !Array.isArray(v) &&
    (Object.getPrototypeOf(v) === Object.prototype || Object.getPrototypeOf(v) === null);
}
function exactDataObject(value, allowedKeys, exact = true) {
  if (!plainObject(value) || Object.getOwnPropertySymbols(value).length) return false;
  const keys = Reflect.ownKeys(value);
  if (keys.some(key => typeof key !== "string" || !allowedKeys.includes(key)) ||
      (exact && keys.length !== allowedKeys.length)) return false;
  return keys.every(key => {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    return !!descriptor && descriptor.enumerable && Object.hasOwn(descriptor, "value");
  });
}
function validateObjectSchema(schema) {
  if (!exactDataObject(schema, ["type","properties","required","additionalProperties"]) ||
      schema.type !== "object" || schema.additionalProperties !== false ||
      !plainObject(schema.properties) || Object.getOwnPropertySymbols(schema.properties).length ||
      !Array.isArray(schema.required) || schema.required.length > 64 ||
      Object.getOwnPropertySymbols(schema.required).length) return false;
  const requiredKeys = Object.keys(schema.required);
  if (requiredKeys.length !== schema.required.length ||
      requiredKeys.some((key, index) => key !== String(index))) return false;
  for (let index = 0; index < schema.required.length; index++) {
    const descriptor = Object.getOwnPropertyDescriptor(schema.required, String(index));
    if (!descriptor || !descriptor.enumerable || !Object.hasOwn(descriptor, "value") ||
        typeof descriptor.value !== "string") return false;
  }
  const keys = Object.keys(schema.properties);
  if (keys.length > 64 || keys.some(k => !/^[A-Za-z][A-Za-z0-9_-]{0,63}$/.test(k) ||
      ["__proto__","constructor","prototype"].includes(k))) return false;
  if (Reflect.ownKeys(schema.properties).length !== keys.length ||
      !keys.every(k => {
        const descriptor = Object.getOwnPropertyDescriptor(schema.properties, k);
        return !!descriptor && descriptor.enumerable && Object.hasOwn(descriptor, "value") &&
          exactDataObject(descriptor.value, ["type"]) && SCHEMA_TYPES.has(descriptor.value.type);
      })) return false;
  return schema.required.every(k => Object.hasOwn(schema.properties,k)) &&
    new Set(schema.required).size === schema.required.length;
}

export function validateAgentDefinition(definition) {
  if (!plainObject(definition) || Object.keys(definition).some(k => !KEYS.includes(k)) || KEYS.some(k => !Object.hasOwn(definition,k))) return { valid:false, reason:"definition_schema_invalid" };
  if (!ID.test(definition.id) || !VERSION.test(definition.version) || typeof definition.name !== "string" || !definition.name.trim() || definition.name.length > 128 || !DOMAINS.test(definition.domain)) return { valid:false, reason:"definition_metadata_invalid" };
  if (!Array.isArray(definition.capabilities) || definition.capabilities.length < 1 || definition.capabilities.length > 32 || definition.capabilities.some(c => typeof c !== "string" || !CAPABILITY.test(c)) || new Set(definition.capabilities).size !== definition.capabilities.length) return { valid:false, reason:"capabilities_invalid" };
  if (!validateObjectSchema(definition.inputSchema) || !validateObjectSchema(definition.outputSchema)) return { valid:false, reason:"schema_contract_invalid" };
  if (!RISK.has(definition.riskClass) || typeof definition.requiresApproval !== "boolean" || (definition.riskClass === "high" && !definition.requiresApproval)) return { valid:false, reason:"risk_policy_invalid" };
  if (!Number.isInteger(definition.maxRunSeconds) || definition.maxRunSeconds < 1 || definition.maxRunSeconds > 900 || !Number.isInteger(definition.maxConcurrency) || definition.maxConcurrency < 1 || definition.maxConcurrency > 100 || !STATUS.has(definition.status)) return { valid:false, reason:"limits_or_status_invalid" };
  return { valid:true };
}

export function validateAgentRegistry(definitions) {
  if (!Array.isArray(definitions)) return { valid:false, reason:"registry_not_array" };
  if (definitions.length > MAX_AGENT_DEFINITIONS) return { valid:false, reason:"registry_capacity_exceeded" };
  const ids = new Set();
  const byDomain = Object.create(null);
  for (const definition of definitions) {
    const result = validateAgentDefinition(definition);
    if (!result.valid) return result;
    if (ids.has(definition.id)) return { valid:false, reason:"duplicate_agent_id" };
    ids.add(definition.id);
    byDomain[definition.domain] = (byDomain[definition.domain] || 0) + 1;
  }
  return { valid:true, count:definitions.length, byDomain };
}
