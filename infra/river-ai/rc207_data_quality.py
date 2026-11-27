"""RC207 offline data-quality and anomaly checks for numeric observation batches."""
from statistics import median
from typing import Iterable

def analyze(records: Iterable[dict], *, id_field="id", metric_field="value", jump_threshold=3.0):
    items=list(records)
    flags=[]
    seen=set()
    valid=[]
    for i,r in enumerate(items):
        row_flags=[]
        if not isinstance(r,dict):
            flags.append({"index":i,"flags":["record_not_object"]}); continue
        rid=r.get(id_field)
        if rid is None: row_flags.append("missing_id")
        elif rid in seen: row_flags.append("duplicate_id")
        else: seen.add(rid)
        val=r.get(metric_field)
        if val is None: row_flags.append("missing_metric")
        elif isinstance(val,bool) or not isinstance(val,(int,float)): row_flags.append("metric_not_numeric")
        else: valid.append((i,float(val)))
        if row_flags: flags.append({"index":i,"flags":row_flags})
    values=[v for _,v in valid]
    if len(values)>=3:
        med=median(values)
        deviations=[abs(v-med) for v in values]
        mad=median(deviations)
        if mad:
            robust_cutoff=3.5*1.4826*mad
            for i,v in valid:
                if abs(v-med)>robust_cutoff:
                    flags.append({"index":i,"flags":["robust_outlier"],"value":v,"median":med})
        elif med:
            for i,v in valid:
                if abs(v-med)>abs(med)*jump_threshold:
                    flags.append({"index":i,"flags":["large_deviation_from_median"],"value":v,"median":med})
    sequential=[]
    for (i,a),(j,b) in zip(valid,valid[1:]):
        if a!=0 and abs(b-a)/abs(a)>=jump_threshold:
            sequential.append({"from_index":i,"to_index":j,"from_value":a,"to_value":b,"relative_change":abs(b-a)/abs(a)})
    return {"records_seen":len(items),"numeric_records":len(valid),"flagged_records":flags,
            "large_sequential_changes":sequential,
            "quality_summary":{"flag_count":len(flags),"change_count":len(sequential)},
            "scope":"heuristic checks only; no source verification, causal inference, or automated blocking"}
