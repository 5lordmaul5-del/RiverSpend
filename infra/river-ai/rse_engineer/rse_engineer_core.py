"""RSEngineer: small, dependency-free engineering task intake prototype.
Does not execute code, access networks, or alter repository files.
"""
from dataclasses import dataclass, asdict
from uuid import uuid4

ALLOWED_TYPES = {"bug", "feature", "test", "review", "security", "integration", "documentation"}
ALLOWED_PRIORITIES = {"low", "normal", "high", "critical"}

@dataclass(frozen=True)
class EngineeringTask:
    task_id: str
    task_type: str
    title: str
    description: str
    priority: str
    approval_required: bool
    status: str = "queued"

    def to_dict(self):
        return asdict(self)

def create_task(task_type, title, description, priority="normal", approval_required=True):
    if task_type not in ALLOWED_TYPES:
        raise ValueError("unsupported task type")
    if priority not in ALLOWED_PRIORITIES:
        raise ValueError("unsupported priority")
    if not isinstance(title, str) or not title.strip() or len(title.strip()) > 160:
        raise ValueError("title must be 1-160 characters")
    if not isinstance(description, str) or not description.strip() or len(description.strip()) > 4000:
        raise ValueError("description must be 1-4000 characters")
    if type(approval_required) is not bool:
        raise ValueError("approval_required must be boolean")
    return EngineeringTask(str(uuid4()), task_type, title.strip(), description.strip(), priority, approval_required)
