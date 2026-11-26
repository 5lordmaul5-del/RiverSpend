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
function validateObjectSchema(schema) {
  if (!plainObject(schema) || schema.type !== "object" || !plainObject(schema.properties) ||
      schema.additionalProperties !== false || !Array.isArray(schema.required) ||
      schema.required.length > 64 || schema.required.some(k => typeof k !== "string" || !Object.hasOwn(schema.properties,k)) ||
      new Set(schema.required).size !== schema.required.length) return false;
  const keys = Object.keys(schema.properties);
  if (keys.length > 64 || keys.some(k => !/^[A-Za-z][A-Za-z0-9_-]{0,63}$/.test(k) || ["__proto__","constructor","prototype"].includes(k))) return false;
  return keys.every(k => plainObject(schema.properties[k]) && SCHEMA_TYPES.has(schema.properties[k].type));
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
