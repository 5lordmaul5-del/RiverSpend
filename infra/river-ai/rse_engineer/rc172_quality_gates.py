"""RC-172: lightweight engineering readiness gate evaluator."""
GATES=("tests", "security_review", "documentation", "rollback_plan", "human_approval")

def evaluate_gate_status(statuses):
    if not isinstance(statuses,dict): raise TypeError("statuses must be a dict")
    unknown=set(statuses)-set(GATES)
    if unknown: raise ValueError("unknown gates: "+", ".join(sorted(unknown)))
    normalized={gate:statuses.get(gate,False) for gate in GATES}
    if any(type(value) is not bool for value in normalized.values()): raise TypeError("gate values must be booleans")
    return {"gates":normalized,"ready":all(normalized.values()),"missing":[g for g,v in normalized.items() if not v],"note":"Readiness checklist only; does not certify safety or perform approvals."}
