const KINDS=new Set(['diagnostic','failure','test','review','state_change','unknown']);
export function normalizeEvent(input){
 if(!input||typeof input!=='object'||Array.isArray(input)||Object.getPrototypeOf(input)!==Object.prototype)throw new TypeError('invalid event');
 const keys=['id','kind','component','summary','timestamp','source'];for(const k of Object.keys(input))if(!keys.includes(k))throw new TypeError('unexpected key');for(const k of keys){const d=Object.getOwnPropertyDescriptor(input,k);if(!d||!Object.hasOwn(d,'value'))throw new TypeError('missing/accessor');}
 if(typeof input.id!=='string'||!input.id.trim()||!KINDS.has(input.kind)||typeof input.component!=='string'||!input.component.trim()||typeof input.summary!=='string'||input.summary.length>2000||!Number.isSafeInteger(input.timestamp)||input.timestamp<0||typeof input.source!=='string'||input.source.length>200)throw new TypeError('invalid event fields');
 return Object.freeze({schema:'rivercloud.event.v1',id:input.id.trim(),kind:input.kind,component:input.component.trim(),summary:input.summary,timestamp:input.timestamp,source:input.source,normalized:true});
}
