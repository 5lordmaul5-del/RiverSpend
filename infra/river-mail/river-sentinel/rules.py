"""River Sentinel prototype: explainable scoring of defensive email security metadata."""
from dataclasses import dataclass, asdict
from typing import Iterable

@dataclass
class Signal:
    kind: str
    description: str
    severity: int = 1
    recommendation: str = "Review this security event."

RULES = {
    "new_device": (20, "Verify this sign-in and revoke unknown sessions."),
    "login_burst": (25, "Review authentication attempts and enable MFA."),
    "forwarding_rule": (35, "Review/remove unexpected forwarding rules."),
    "oauth_grant": (30, "Review and revoke unrecognized application permissions."),
    "sender_domain_mismatch": (15, "Verify the sender using a trusted channel."),
    "suspicious_link": (25, "Avoid the link; report or delete the message."),
    "attachment_risk": (20, "Do not open the attachment; scan it with approved tools."),
    "security_setting_change": (20, "Confirm this account change was authorized."),
}

def evaluate(signals: Iterable[Signal]):
    items=[]
    score=0
    for s in signals:
        points, recommendation=RULES.get(s.kind, (max(0,min(10,s.severity)), s.recommendation))
        score=min(100, score+points)
        items.append({**asdict(s), "points":points, "recommended_action":recommendation})
    level="low" if score < 25 else "medium" if score < 50 else "high" if score < 75 else "critical"
    return {"score":score,"level":level,"signals":items,"privacy":"metadata-only prototype"}

if __name__ == "__main__":
    demo=evaluate([Signal("new_device","Sign-in from a new device"),Signal("forwarding_rule","New external forwarding rule")])
    print(demo)
