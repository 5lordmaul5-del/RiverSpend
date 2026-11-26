// RC-150: explicit, guarded lifecycle state machine. No execution transition is supported.
const TRANSITIONS=Object.freeze({
 planned_not_queued:Object.freeze(["prepared_not_executed","rejected"]),
 prepared_not_executed:Object.freeze(["verified","rejected"]),
 verified:Object.freeze(["rejected"]),
 rejected:Object.freeze([])
});
const STATES=Object.freeze(Object.keys(TRANSITIONS));
export function isLifecycleState(s){return typeof s==="string"&&Object.hasOwn(TRANSITIONS,s);}
export function canTransition(from,to){return isLifecycleState(from)&&typeof to==="string"&&TRANSITIONS[from].includes(to);}
export function transitionLifecycle(record,next){
 if(!record||typeof record!=="object"||Array.isArray(record))throw new Error("lifecycle_record_invalid");
 if(Object.getPrototypeOf(record)!==Object.prototype&&Object.getPrototypeOf(record)!==null)throw new Error("lifecycle_record_invalid");\n const own=Reflect.ownKeys(record);if(own.some(k=>typeof k!=="string"))throw new Error("lifecycle_record_invalid");
 for(const k of own){const d=Object.getOwnPropertyDescriptor(record,k);if(!d||!d.enumerable||!Object.hasOwn(d,"value"))throw new Error("lifecycle_record_invalid");}
 const statusDescriptor=Object.getOwnPropertyDescriptor(record,"status");\n if(!statusDescriptor||!Object.hasOwn(statusDescriptor,"value"))throw new Error("lifecycle_record_invalid");\n if(!canTransition(statusDescriptor.value,next))throw new Error("lifecycle_transition_denied");
 return Object.freeze({...record,status:next});
}
export function lifecycleStates(){return [...STATES];}
export function lifecycleTransitions(){return Object.fromEntries(STATES.map(s=>[s,[...TRANSITIONS[s]]]));}
