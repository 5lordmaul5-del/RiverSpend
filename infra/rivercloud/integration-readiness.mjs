// RC-198: readiness analysis based on explicit integration declarations.
export function integrationReadiness(integrations=[]) {
 if(!Array.isArray(integrations)||integrations.length>300)throw new TypeError("integrations max 300");
 const items=[],issues=[];
 for(const x of integrations){if(!x||typeof x!=="object"||Array.isArray(x)){issues.push("invalid-entry");continue;}
 const name=String(x.name??"").trim(),status=String(x.status??"unknown").toLowerCase();if(!name){issues.push("missing-name");continue;}
 items.push({name:name.slice(0,120),status:status.slice(0,40),evidence:String(x.evidence??"").slice(0,300)});
 if(!["verified","connected","tested"].includes(status))issues.push("not-verified:"+name);}
 return {count:items.length,issues,ready:issues.length===0};
}