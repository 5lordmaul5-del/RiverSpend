"""RC223 privacy-preserving event correlation prototype.
Input consists of security event metadata, not email content or credentials."""
from collections import defaultdict
from datetime import datetime, timezone

POINTS={"new_device":20,"login_burst":25,"forwarding_rule":35,"oauth_grant":30,"sender_domain_mismatch":15,"suspicious_link":25,"attachment_risk":20,"security_setting_change":20}

def analyze(events):
    # Events should be normalized upstream; user_id must be a pseudonymous tenant-local key.
    grouped=defaultdict(list)
    for e in events:
        if not isinstance(e,dict) or not e.get("user_key") or e.get("kind") not in POINTS: continue
        grouped[str(e["user_key"])].append(e)
    reports=[]
    for key, items in grouped.items():
        kinds={e["kind"] for e in items}
        score=min(100,sum(POINTS[e["kind"]] for e in items))
        correlated=[]
        if "new_device" in kinds and "login_burst" in kinds:
            correlated.append("login_anomaly_cluster")
            score=min(100,score+10)
        if "forwarding_rule" in kinds and "oauth_grant" in kinds:
            correlated.append("account_persistence_cluster")
            score=min(100,score+15)
        if "suspicious_link" in kinds and "sender_domain_mismatch" in kinds:
            correlated.append("phishing_cluster")
            score=min(100,score+10)
        level="green" if score<25 else "yellow" if score<50 else "orange" if score<75 else "red"
        actions={"green":["No immediate action; continue monitoring."],"yellow":["Review recent security events.","Enable multi-factor authentication if available."],"orange":["Verify recent sessions and revoke unfamiliar ones.","Review forwarding rules and app grants."],"red":["Secure the account promptly.","Revoke unknown sessions and app grants.","Change credentials and enable MFA through the trusted account interface."]}[level]
        reports.append({"user_key":key,"score":score,"level":level,"event_count":len(items),"correlations":correlated,"recommended_actions":actions,"event_kinds":sorted(kinds)})
    return reports

if __name__=="__main__":
    demo=[{"user_key":"demo-A","kind":"new_device"},{"user_key":"demo-A","kind":"login_burst"},{"user_key":"demo-A","kind":"forwarding_rule"}]
    print(analyze(demo))
