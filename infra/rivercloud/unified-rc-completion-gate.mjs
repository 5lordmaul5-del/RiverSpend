// RC-200: conservative completion gate from explicit evidence signals; no deployment or certification.
const positive=new Set(["passed","verified","tested","complete","approved"]);
export function unifiedCompletionGate(signals=[]) {
 if(!Array.isArray(signals)||signals.length>500)throw new TypeError("signals max 500");
 const checks=[],missing=[],issues=[];
 for(const s of signals){if(!s||typeof s!=="object"||Array.isArray(s)){issues.push("invalid-signal");continue;}
 const key=String(s.key??"").trim(),state=String(s.state??"unknown").toLowerCase();if(!key){issues.push("missing-key");continue;}
 checks.push({key:key.slice(0,120),state:state.slice(0,40)});if(!positive.has(state))missing.push(key);}
 const complete=checks.length>0&&missing.length===0&&issues.length===0;
 return {checkCount:checks.length,complete,status:complete?"evidence-complete":"evidence-incomplete-or-review-required",missing,issues,checks};
}