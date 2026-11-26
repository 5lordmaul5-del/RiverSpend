"""RC-173: assemble a review package from caller-provided data; no execution."""
from rc171_review import review_text, summarize
GATES=("tests","security_review","documentation","rollback_plan","human_approval")
def build_review_package(title, supplied_text, gate_statuses=None):
    if not isinstance(title,str) or not title.strip() or len(title)>160: raise ValueError("invalid title")
    if not isinstance(supplied_text,str) or len(supplied_text)>100000: raise ValueError("text must be string up to 100000 characters")
    if gate_statuses is None: gate_statuses={}
    if not isinstance(gate_statuses,dict) or set(gate_statuses)-set(GATES): raise ValueError("invalid gate statuses")
    if any(type(v) is not bool for v in gate_statuses.values()): raise TypeError("gate values must be boolean")
    gates={g:gate_statuses.get(g,False) for g in GATES}
    findings=review_text(supplied_text)
    return {"title":title.strip(),"findings":[{"severity":f.severity,"rule":f.rule,"message":f.message} for f in findings],"finding_summary":summarize(findings),"gates":gates,"ready_for_human_review":all(gates.values()) and not summarize(findings)["review_required"],"review_note":"This package is triage only; human review remains necessary."}
