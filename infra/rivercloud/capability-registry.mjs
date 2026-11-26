const ALLOWED=new Set(['inspect','validate','report','correlate','recommend_review']);
export function buildCapabilityRegistry(entries){
 if(!Array.isArray(entries)||entries.length>100)throw new TypeError('registry limit');
 const ids=new Set(),out=[];
 for(const e of entries){if(!e||typeof e!=='object'||Array.isArray(e)||Object.getPrototypeOf(e)!==Object.prototype)throw new TypeError('invalid entry');
 const keys=['id','description','capabilities','enabled'];for(const k of Object.keys(e))if(!keys.includes(k))throw new TypeError('unexpected key');for(const k of keys){const d=Object.getOwnPropertyDescriptor(e,k);if(!d||!Object.hasOwn(d,'value'))throw new TypeError('missing/accessor');}
 if(typeof e.id!=='string'||!e.id.trim()||ids.has(e.id)||typeof e.description!=='string'||e.description.length>500||!Array.isArray(e.capabilities)||typeof e.enabled!=='boolean')throw new TypeError('invalid fields');
 if(e.capabilities.some(c=>typeof c!=='string'||!ALLOWED.has(c)))throw new TypeError('capability denied');
 ids.add(e.id);out.push(Object.freeze({id:e.id,description:e.description,capabilities:Object.freeze([...new Set(e.capabilities)].sort()),enabled:e.enabled}));
 }
 return Object.freeze({schema:'rivercloud.capability-registry.v1',entries:Object.freeze(out.sort((a,b)=>a.id.localeCompare(b.id))),allowedCapabilities:Object.freeze([...ALLOWED].sort()),execution:false});
}
