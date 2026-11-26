// RC-193: conservative compatibility assessment for declared contract versions.
export function compareContracts(contracts=[]) {
 if(!Array.isArray(contracts)||contracts.length>300)throw new TypeError("contracts array max 300");
 const issues=[],seen=new Set(),items=[];
 for(const c of contracts){if(!c||typeof c!=="object"||Array.isArray(c)){issues.push("invalid-contract");continue;}
 const id=String(c.id??"").trim(),version=String(c.version??"").trim(),compat=String(c.compatibility??"unknown").trim();
 if(!id||!version){issues.push("missing-id-or-version");continue;}const k=id+"\u0000"+version;if(seen.has(k))issues.push("duplicate-contract:"+id);seen.add(k);
 items.push({id,version,compatibility:compat,breakingChanges:Array.isArray(c.breakingChanges)?c.breakingChanges.slice(0,50).map(x=>String(x).slice(0,200)):[]});
 if(compat==="breaking"|| (Array.isArray(c.breakingChanges)&&c.breakingChanges.length))issues.push("review-required:"+id);
 }
 return {count:items.length,contracts:items,issues,reviewRequired:issues.length>0};
}