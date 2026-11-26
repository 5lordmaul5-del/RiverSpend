// RC-196: resilience posture projection from declared controls.
export function assessResilience(controls=[]) {
 if(!Array.isArray(controls)||controls.length>300)throw new TypeError("controls max 300");
 const items=[],issues=[];
 for(const c of controls){if(!c||typeof c!=="object"||Array.isArray(c)){issues.push("invalid-control");continue;}
 const name=String(c.name??"").trim(),state=String(c.state??"unknown").toLowerCase();
 if(!name){issues.push("missing-control-name");continue;}items.push({name:name.slice(0,120),state:state.slice(0,40),evidence:String(c.evidence??"").slice(0,300)});
 if(!["verified","tested"].includes(state))issues.push("unverified-control:"+name);}
 return {count:items.length,issues,assessment:issues.length?"needs-validation":"reported-controls-validated"};
}