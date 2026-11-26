"""RC-173: assemble a review package from caller-provided data; no execution."""
GATES=("tests","security_review","documentation","rollback_plan","human_approval")
RULES=(("high","secret-marker",("-----BEGIN PRIVATE KEY-----","ghp_","AKIA")),("high","dangerous-command",("rm -rf /","mkfs.","shutdown -h")),("medium","unsafe-execution",("eval(","exec(","subprocess.Popen(")),("medium","network-operation",("requests.get(","urllib.request","socket.connect(")))
def _review(text):
    findings=[]
    low=text.lower()
    for severity,rule,markers in RULES:
        for marker in markers:
            if marker.lower() in low: findings.append({"severity":severity,"rule":rule,"message":"Found marker: "+marker})
    return findings
def build_review_package(title, supplied_text, gate_statuses=None):
    if not isinstance(title,str) or not title.strip() or len(title)>160: raise ValueError("invalid title")
    if not isinstance(supplied_text,str) or len(supplied_text)>100000: raise ValueError("text must be string up to 100000 characters")
    if gate_statuses is None: gate_statuses={}
    if not isinstance(gate_statuses,dict) or set(gate_statuses)-set(GATES): raise ValueError("invalid gate statuses")
    if any(type(v) is not bool for v in gate_statuses.values()): raise TypeError("gate values must be boolean")
    gates={g:gate_statuses.get(g,False) for g in GATES}; findings=_review(supplied_text)
    counts={"high":0,"medium":0,"low":0}
    for f in findings: counts[f["severity"]]+=1
    review_required=counts["high"]>0 or counts["medium"]>0
    summary={"counts":counts,"review_required":review_required,"disclaimer":"Pattern triage only; false positives and missed risks possible."}
    return {"title":title.strip(),"findings":findings,"finding_summary":summary,"gates":gates,"ready_for_human_review":all(gates.values()) and not review_required,"review_note":"This package is triage only; human review remains necessary."}
