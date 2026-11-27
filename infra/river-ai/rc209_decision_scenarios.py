"""RC209: scenario comparison helper, deterministic and offline."""
from dataclasses import dataclass, asdict
@dataclass
class Scenario:
    scenario_id: str
    title: str
    estimated_cost: float
    estimated_benefit: float
    risk_score: int = 0
    notes: str = ""

def evaluate(s: Scenario):
    if s.estimated_cost < 0 or s.estimated_benefit < 0:
        raise ValueError("cost and benefit must be non-negative")
    if not 0 <= s.risk_score <= 25:
        raise ValueError("risk_score must be between 0 and 25")
    net=s.estimated_benefit-s.estimated_cost
    return {**asdict(s),"net_estimate":net,"benefit_cost_ratio":None if s.estimated_cost==0 else s.estimated_benefit/s.estimated_cost,
      "risk_band":"low" if s.risk_score<=4 else "moderate" if s.risk_score<=9 else "high" if s.risk_score<=16 else "critical",
      "scope":"rough scenario comparison, not a forecast or recommendation"}
def compare(scenarios):
    results=[evaluate(s) for s in scenarios]
    ranked=sorted(results,key=lambda x:(-x["net_estimate"],x["risk_score"],x["scenario_id"]))
    return {"scenarios":ranked,"count":len(results),"ranking_basis":"net estimate descending, risk ascending, then ID",
      "warning":"Estimates are user-supplied and uncertain; ranking is not a decision or investment recommendation."}
