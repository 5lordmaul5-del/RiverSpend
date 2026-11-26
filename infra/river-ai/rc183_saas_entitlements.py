"""RC-183: framework-neutral RiverSSAI SaaS plan and usage policy.

This is policy scaffolding only: it does not authenticate users, bill customers,
or connect to a model/provider. Limits are illustrative defaults to be reviewed.
"""
from dataclasses import dataclass
from typing import FrozenSet

@dataclass(frozen=True)
class Plan:
    key: str
    monthly_price_eur: float
    monthly_token_budget: int
    concurrent_tasks: int
    features: FrozenSet[str]

PLANS = {
    "free": Plan("free", 0.0, 100_000, 1, frozenset({"chat"})),
    "plus": Plan("plus", 7.90, 1_000_000, 2, frozenset({"chat", "file_analysis"})),
    "pro": Plan("pro", 19.90, 5_000_000, 4, frozenset({"chat", "file_analysis", "agents"})),
    "ultra": Plan("ultra", 39.90, 15_000_000, 8, frozenset({"chat", "file_analysis", "agents", "priority"})),
}

class PolicyError(ValueError):
    """Raised when an operation violates plan policy."""

def get_plan(plan_key: str) -> Plan:
    try:
        return PLANS[plan_key.strip().lower()]
    except (AttributeError, KeyError):
        raise PolicyError("unknown plan") from None

def check_feature(plan_key: str, feature: str) -> bool:
    return feature in get_plan(plan_key).features

def check_task_capacity(plan_key: str, active_tasks: int) -> bool:
    if isinstance(active_tasks, bool) or not isinstance(active_tasks, int) or active_tasks < 0:
        raise PolicyError("active_tasks must be a non-negative integer")
    return active_tasks < get_plan(plan_key).concurrent_tasks

def check_monthly_budget(plan_key: str, used_tokens: int, requested_tokens: int) -> bool:
    plan = get_plan(plan_key)
    for value in (used_tokens, requested_tokens):
        if isinstance(value, bool) or not isinstance(value, int) or value < 0:
            raise PolicyError("token counts must be non-negative integers")
    return used_tokens + requested_tokens <= plan.monthly_token_budget

def require_feature(plan_key: str, feature: str) -> None:
    if not check_feature(plan_key, feature):
        raise PolicyError("feature not available on this plan")

def require_task_capacity(plan_key: str, active_tasks: int) -> None:
    if not check_task_capacity(plan_key, active_tasks):
        raise PolicyError("concurrent task limit reached")

def require_monthly_budget(plan_key: str, used_tokens: int, requested_tokens: int) -> None:
    if not check_monthly_budget(plan_key, used_tokens, requested_tokens):
        raise PolicyError("monthly token budget exceeded")
