// RC-192: compare declared component/invariant records; not a live architecture scan.
export function assessArchitecture(components=[], invariants=[]) {
 if (!Array.isArray(components)||!Array.isArray(invariants)||components.length>300||invariants.length>300) throw new TypeError("bounded arrays required");
 const ids=new Set(),issues=[];
 for(const c of components){if(!c||typeof c!=="object"||Array.isArray(c)){issues.push({kind:"invalid-component"});continue;} const id=String(c.id??"").trim();if(!id){issues.push({kind:"missing-component-id"});continue;}if(ids.has(id))issues.push({kind:"duplicate-component",id});ids.add(id);}
 for(const i of invariants){if(!i||typeof i!=="object"||Array.isArray(i)){issues.push({kind:"invalid-invariant"});continue;}const target=String(i.componentId??"").trim();if(target&&!ids.has(target))issues.push({kind:"invariant-target-missing",componentId:target});if(!String(i.description??"").trim())issues.push({kind:"invariant-description-missing"});}
 return {componentCount:ids.size,invariantCount:invariants.length,issues,consistent:issues.length===0};
}