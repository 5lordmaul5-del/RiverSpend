const LEVELS=new Set(['low','medium','high','critical','unknown']),STATUSES=new Set(['open','mitigated','accepted','closed']);
export function buildRiskRegister(items){
 if(!Array.isArray(items)||items.length>300)throw new TypeError('risk limit');
 const ids=new Set(),out=[];for(const r of items){if(!r||typeof r!=='object'||Array.isArray(r)||Object.getPrototypeOf(r)!==Object.prototype)throw new TypeError('invalid risk');const keys=['id','description','severity','status','owner'];for(const k of Object.keys(r))if(!keys.includes(k))throw new TypeError('unexpected key');for(const k of keys){const d=Object.getOwnPropertyDescriptor(r,k);if(!d||!Object.hasOwn(d,'value'))throw new TypeError('missing/accessor');}
 if(typeof r.id!=='string'||!r.id.trim()||ids.has(r.id)||typeof r.description!=='string'||r.description.length>2000||!LEVELS.has(r.severity)||!STATUSES.has(r.status)||typeof r.owner!=='string'||r.owner.length>200)throw new TypeError('invalid fields');ids.add(r.id);out.push(Object.freeze({...r}));}
 return Object.freeze({schema:'rivercloud.risk-register.v1',risks:Object.freeze(out.sort((a,b)=>a.id.localeCompare(b.id))),count:out.length,reviewOnly:true,mitigationExecution:false});
}
