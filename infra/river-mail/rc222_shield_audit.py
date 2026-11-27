"""RC222 RiverMail Shield: transparent, user-authorized email threat checks.
Prototype rule engine; not covert surveillance, antivirus, or a production classifier."""
from dataclasses import dataclass, asdict
import re
from typing import Iterable

@dataclass
class Finding:
    rule_id: str
    severity: str
    summary: str
    evidence: str

@dataclass
class AuditReport:
    message_id: str
    findings: list[Finding]
    risk_score: int
    verdict: str
    inspected_fields: list[str]

RULES = [
    ("URL_SHORTENER", "medium", r"https?://(?:bit\.ly|tinyurl\.com|t\.co|is\.gd|cutt\.ly)/", "Shortened link detected"),
    ("URL_IP_ADDRESS", "high", r"https?://(?:\d{1,3}\.){3}\d{1,3}(?:[:/]|$)", "Link uses an IP address"),
    ("URGENCY_PRESSURE", "low", r"\b(?:urgent|immediately|within\s+\d+\s+hours|account\s+(?:suspended|blocked))\b", "Urgency or account-pressure language"),
    ("CREDENTIAL_REQUEST", "high", r"\b(?:password|passcode|otp|one[- ]time code|recovery phrase)\b.{0,70}\b(?:send|reply|share|provide|confirm)\b", "Possible credential disclosure request"),
    ("PAYMENT_PRESSURE", "medium", r"\b(?:gift cards?|crypto(?:currency)?|wire transfer)\b.{0,80}\b(?:send|pay|transfer|urgent)\b", "Unusual payment request pattern"),
    ("EXECUTABLE_ATTACHMENT", "high", r"\.(?:exe|scr|bat|cmd|js|vbs|msi|apk|iso)$", "Potentially dangerous attachment extension"),
]

SCORE = {"low": 10, "medium": 25, "high": 45, "critical": 70}

def audit_message(message: dict, *, inspect_body: bool = True) -> dict:
    """Audit only a message supplied by an authorized caller; no mailbox crawling.
    Content scanning is explicit via inspect_body and reports inspected fields.
    """
    findings=[]
    fields=[]
    parts=[]
    for key in ("subject", "sender", "attachment_names"):
        val=message.get(key, "")
        if val:
            fields.append(key); parts.append(str(val))
    if inspect_body and message.get("body"):
        fields.append("body"); parts.append(str(message["body"]))
    text="\\n".join(parts)
    for rid,severity,pattern,summary in RULES:
        m=re.search(pattern,text,re.I)
        if m:
            findings.append(Finding(rid,severity,summary,m.group(0)[:160]))
    score=min(100,sum(SCORE[f.severity] for f in findings))
    verdict="high-risk" if score>=60 else "review" if score>=25 else "low-signal"
    return asdict(AuditReport(str(message.get("id","unknown")),findings,score,verdict,fields))

def audit_batch(messages: Iterable[dict], *, inspect_body: bool=True) -> list[dict]:
    return [audit_message(m,inspect_body=inspect_body) for m in messages]
