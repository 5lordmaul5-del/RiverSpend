"""RC208: transparent risk matrix scoring prototype."""
from dataclasses import dataclass, asdict

@dataclass
class Risk:
    risk_id: str
    description: str
    probability: int
    impact: int
    category: str = "general"
    mitigation: str = ""

def assess(risk: Risk):
    if not 1 <= risk.probability <= 5 or not 1 <= risk.impact <= 5:
        raise ValueError("probability and impact must be integers from 1 through 5")
    score=risk.probability*risk.impact
    level="low" if score<=4 else "moderate" if score<=9 else "high" if score<=16 else "critical"
    return {**asdict(risk),"score":score,"level":level,
            "rationale":f"score = probability ({risk.probability}) x impact ({risk.impact})",
            "scope":"heuristic prioritization only; requires human review"}

def portfolio(risks):
    results=[assess(r) for r in risks]
    counts={level:sum(1 for r in results if r["level"]==level) for level in ("low","moderate","high","critical")}
    ordered=sorted(results,key=lambda r:(-r["score"],r["risk_id"]))
    return {"assessments":ordered,"counts":counts,"total":len(results)}
