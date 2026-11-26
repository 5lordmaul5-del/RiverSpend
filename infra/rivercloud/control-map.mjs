const MAX_NODES=200,MAX_EDGES=1000;
export function buildControlMap(input){
 if(!Array.isArray(input)||input.length>MAX_NODES)throw new TypeError('node limit');
 const nodes=[],ids=new Set();
 for(const n of input){if(!n||typeof n!=='object'||Array.isArray(n)||Object.getPrototypeOf(n)!==Object.prototype)throw new TypeError('invalid node');
  const keys=['id','label','status','dependencies'];for(const k of Object.keys(n))if(!keys.includes(k))throw new TypeError('unexpected node field');
  for(const k of keys){const d=Object.getOwnPropertyDescriptor(n,k);if(!d||!Object.hasOwn(d,'value'))throw new TypeError('missing/accessor');}
  if(typeof n.id!=='string'||!n.id.trim()||ids.has(n.id)||typeof n.label!=='string'||n.label.length>200||!['healthy','degraded','faulted','unknown'].includes(n.status)||!Array.isArray(n.dependencies))throw new TypeError('invalid node data');
  if(n.dependencies.some(x=>typeof x!=='string'))throw new TypeError('invalid dependency');
  ids.add(n.id);nodes.push({id:n.id,label:n.label,status:n.status,dependencies:[...n.dependencies]});
 }
 let edges=0;for(const n of nodes){edges+=n.dependencies.length;if(edges>MAX_EDGES)throw new TypeError('edge limit');for(const d of n.dependencies)if(!ids.has(d))throw new TypeError('unknown dependency');}
 const ordered=nodes.sort((a,b)=>a.id.localeCompare(b.id)).map(n=>Object.freeze({...n,dependencies:Object.freeze(n.dependencies.sort())}));
 const counts=ordered.reduce((a,n)=>(a[n.status]++,a),{healthy:0,degraded:0,faulted:0,unknown:0});
 return Object.freeze({schema:'rivercloud.control-map.v1',nodes:Object.freeze(ordered),edgeCount:edges,counts:Object.freeze(counts),readOnly:true,execution:false});
}
