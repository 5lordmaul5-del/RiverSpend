// RC-195: aggregate structured review signals; caller-supplied only.
export function systemReview(signals=[]) {
 if(!Array.isArray(signals)||signals.length>500)throw new TypeError("signals max 500");
 const normalized=[],issues=[];
 for(const s of signals){if(!s||typeof s!=="object"||Array.isArray(s)){issues.push("invalid-signal");continue;}
 const area=String(s.area??"").trim(),status=String(s.status??"unknown").toLowerCase();
 if(!area){issues.push("missing-area");continue;} normalized.push({area:area.slice(0,100),status:status.slice(0,40),detail:String(s.detail??"").slice(0,400)});
 if(["fail","blocked","critical","unknown"].includes(status))issues.push({area,status});}
 return {signalCount:normalized.length,issues,reviewStatus:issues.length?"review-required":"no-issues-reported",signals:normalized};
}