"""RC-171: deterministic, safe repository change-review helpers.
These helpers inspect supplied text only; they do not access the filesystem or execute code.
"""
from dataclasses import dataclass

@dataclass(frozen=True)
class ReviewFinding:
    severity: str
    rule: str
    message: str

# Deliberately conservative text checks; not a security scanner.
RULES = [
    ("high", "secret-marker", ("-----BEGIN PRIVATE KEY-----", "ghp_", "AKIA")),
    ("high", "dangerous-command", ("rm -rf /", "mkfs.", "shutdown -h")),
    ("medium", "unsafe-execution", ("eval(", "exec(", "subprocess.Popen(")),
    ("medium", "network-operation", ("requests.get(", "urllib.request", "socket.connect(")),
]

def review_text(text):
    if not isinstance(text, str):
        raise TypeError("review input must be text")
    findings=[]
    lowered=text.lower()
    for severity, rule, markers in RULES:
        for marker in markers:
            if marker.lower() in lowered:
                findings.append(ReviewFinding(severity, rule, f"Found marker: {marker}"))
    return findings

def summarize(findings):
    counts={"high":0,"medium":0,"low":0}
    for finding in findings:
        if finding.severity in counts: counts[finding.severity]+=1
    return {"counts":counts,"review_required":counts["high"]>0 or counts["medium"]>0,
            "disclaimer":"Text-pattern triage only; findings may be false positives or missed risks."}
