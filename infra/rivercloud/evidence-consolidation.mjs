// RC-191: deterministic consolidation of supplied release evidence.
export function consolidateEvidence(records = []) {
 if (!Array.isArray(records) || records.length > 500) throw new TypeError("records must be an array (max 500)");
 const out=[], seen=new Set(), issues=[];
 for (const r of records) {
  if (!r || typeof r !== "object" || Array.isArray(r)) { issues.push("invalid-record"); continue; }
  const type=String(r.type??"").trim().slice(0,80), reference=String(r.reference??"").trim().slice(0,240);
  if (!type || !reference) { issues.push("missing-type-or-reference"); continue; }
  const key=type+"\u0000"+reference;
  if (seen.has(key)) continue; seen.add(key);
  out.push({type,reference,status:String(r.status??"unknown").slice(0,40),note:String(r.note??"").slice(0,500)});
 }
 return {count:out.length,records:out,issues};
}