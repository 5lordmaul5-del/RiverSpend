// RC-197: combine supplied security/governance observations, preserving review flags.
export function consolidateSecurityGovernance(security=[],governance=[]) {
 if(!Array.isArray(security)||!Array.isArray(governance)||security.length>300||governance.length>300)throw new TypeError("bounded inputs required");
 const findings=[],issues=[];
 for(const [kind,arr] of [["security",security],["governance",governance]])for(const x of arr){if(!x||typeof x!=="object"||Array.isArray(x)){issues.push("invalid-"+kind+"-item");continue;}
 const id=String(x.id??"").trim(),state=String(x.state??"unknown").toLowerCase();if(!id){issues.push("missing-"+kind+"-id");continue;}
 findings.push({kind,id:id.slice(0,100),state:state.slice(0,40),detail:String(x.detail??"").slice(0,400)});
 if(["open","blocked","critical","unknown","unverified"].includes(state))issues.push(kind+"-review:"+id);}
 return {count:findings.length,issues,reviewRequired:issues.length>0,findings};
}