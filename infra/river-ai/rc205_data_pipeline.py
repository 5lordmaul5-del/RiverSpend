"""RC-205: bounded data normalization, validation and provenance for RiverSSAI."""
from datetime import datetime, timezone
from hashlib import sha256
import json

REQUIRED={"source","observed_at","metric","value","unit"}

def _parse_time(v):
    if not isinstance(v,str): raise ValueError("observed_at must be ISO-8601 text")
    try: dt=datetime.fromisoformat(v.replace("Z","+00:00"))
    except Exception as e: raise ValueError("invalid observed_at timestamp") from e
    if dt.tzinfo is None: raise ValueError("timestamp must include timezone")
    return dt.astimezone(timezone.utc).isoformat()

def normalize_record(record):
    if not isinstance(record,dict): raise TypeError("record must be a dictionary")
    missing=REQUIRED-record.keys()
    if missing: raise ValueError("missing fields: "+", ".join(sorted(missing)))
    if not isinstance(record["source"],str) or not record["source"].strip(): raise ValueError("source required")
    if not isinstance(record["metric"],str) or not record["metric"].strip(): raise ValueError("metric required")
    value=record["value"]
    if not isinstance(value,(int,float)) or isinstance(value,bool): raise ValueError("value must be numeric")
    if not isinstance(record["unit"],str) or not record["unit"].strip(): raise ValueError("unit required")
    normalized={"source":record["source"].strip(),"observed_at":_parse_time(record["observed_at"]),
        "metric":record["metric"].strip().lower(),"value":float(value),"unit":record["unit"].strip(),
        "metadata":record.get("metadata",{})}
    serialized=json.dumps(normalized,sort_keys=True,separators=(",",":"),ensure_ascii=True)
    normalized["record_hash"]=sha256(serialized.encode()).hexdigest()
    normalized["quality_flags"]=[]
    return normalized

def batch_normalize(records):
    if not isinstance(records,list): raise TypeError("records must be a list")
    output=[]; rejected=[]
    for i,r in enumerate(records):
        try: output.append(normalize_record(r))
        except (ValueError,TypeError) as e: rejected.append({"index":i,"error":str(e)})
    return {"accepted":output,"rejected":rejected,"counts":{"accepted":len(output),"rejected":len(rejected)}}

def assess_series(records, expected_metric=None):
    """Basic, deterministic quality checks; never treats this as verified external data."""
    normalized=batch_normalize(records)
    accepted=normalized["accepted"]
    flags=[]
    if expected_metric and any(r["metric"]!=expected_metric.lower() for r in accepted):
        flags.append("metric_mismatch")
    sources={r["source"] for r in accepted}
    if len(sources)>1: flags.append("multiple_sources_not_reconciled")
    hashes=[r["record_hash"] for r in accepted]
    if len(hashes)!=len(set(hashes)): flags.append("duplicate_records")
    times=[r["observed_at"] for r in accepted]
    if times!=sorted(times): flags.append("timestamps_not_monotonic")
    return {"normalized":accepted,"rejected":normalized["rejected"],"quality_flags":flags,
            "data_is_verified":False,"note":"Checks are structural only; source authenticity and correctness are not verified."}
