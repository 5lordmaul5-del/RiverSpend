const LEVELS=new Set(['deny','review','allow']);
export function analyzePolicyConflicts(rules){
 if(!Array.isArray(rules)||rules.length>300)throw new TypeError('rules limit');
 const seen=new Map(),issues=[];
 for(const r of rules){if(!r||typeof r!=='object'||Array.isArray(r)||Object.getPrototypeOf(r)!==Object.prototype)throw new TypeError('invalid rule');const keys=['id','scope','level'];for(const k of Object.keys(r))if(!keys.includes(k))throw new TypeError('unexpected key');for(const k of keys){const d=Object.getOwnPropertyDescriptor(r,k);if(!d||!Object.hasOwn(d,'value'))throw new TypeError('missing/accessor');}
 if(typeof r.id!=='string'||!r.id.trim()||typeof r.scope!=='string'||!r.scope.trim()||!LEVELS.has(r.level))throw new TypeError('invalid fields');
 const list=seen.get(r.scope)??[];list.push({id:r.id,level:r.level});seen.set(r.scope,list);}
 for(const [scope,list] of seen){const levels=new Set(list.map(x=>x.level));if(levels.size>1)issues.push({scope,kind:'mixed-policy-levels',ruleIds:list.map(x=>x.id).sort(),levels:[...levels].sort()});}
 return Object.freeze({schema:'rivercloud.policy-conflicts.v1',conflicts:Object.freeze(issues.map(Object.freeze)),conflictCount:issues.length,reviewOnly:true,policyMutation:false});
}
