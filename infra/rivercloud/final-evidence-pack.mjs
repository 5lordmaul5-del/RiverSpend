// RC-199: bounded final evidence pack; informational, not a certification.
export function buildEvidencePack(sections=[]) {
 if(!Array.isArray(sections)||sections.length>100)throw new TypeError("sections max 100");
 const pack=[],issues=[];
 for(const s of sections){if(!s||typeof s!=="object"||Array.isArray(s)){issues.push("invalid-section");continue;}
 const title=String(s.title??"").trim(),items=Array.isArray(s.items)?s.items.slice(0,100).map(v=>String(v).slice(0,300)):[];
 if(!title){issues.push("missing-title");continue;}pack.push({title:title.slice(0,120),items});if(!items.length)issues.push("empty-section:"+title);}
 return {sectionCount:pack.length,itemCount:pack.reduce((n,s)=>n+s.items.length,0),issues,pack};
}