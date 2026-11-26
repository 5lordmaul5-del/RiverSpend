// RC-194: bounded technical debt catalog and transparent priority scoring.
const weights={low:1,medium:2,high:3,critical:4};
export function inventoryDebt(entries=[]) {
 if(!Array.isArray(entries)||entries.length>500)throw new TypeError("entries array max 500");
 const items=[],issues=[];
 for(const e of entries){if(!e||typeof e!=="object"||Array.isArray(e)){issues.push("invalid-entry");continue;}
 const id=String(e.id??"").trim(),title=String(e.title??"").trim(),severity=String(e.severity??"medium").toLowerCase();
 if(!id||!title){issues.push("missing-id-or-title");continue;}if(!(severity in weights)){issues.push("invalid-severity:"+id);continue;}
 const status=String(e.status??"open").slice(0,40),owner=String(e.owner??"unassigned").slice(0,100);
 items.push({id,title:title.slice(0,240),severity,priorityScore:weights[severity],status,owner,description:String(e.description??"").slice(0,500)});
 }
 items.sort((a,b)=>b.priorityScore-a.priorityScore||a.id.localeCompare(b.id));
 return {count:items.length,openCount:items.filter(x=>x.status==="open").length,items,issues};
}