"""RC-158: bounded, dependency-free RSCommanderSSAI control-plane prototype.

This is an in-memory scheduling primitive, not an autonomous agent/model executor.
It deliberately uses virtual specialist profiles and a capped task queue.
"""
from __future__ import annotations
from dataclasses import dataclass, field
from time import time
from uuid import uuid4
from collections import deque
from typing import Optional

@dataclass(frozen=True)
class Specialist:
    role: str
    capabilities: tuple[str, ...] = ()

@dataclass
class Task:
    id: str
    capability: str
    payload_summary: str
    state: str = "queued"
    specialist_role: Optional[str] = None
    created_at: float = field(default_factory=time)
    leased_at: Optional[float] = None

class RSCommander:
    """Small bounded dispatcher: no payload execution, external effects, or persistence."""
    def __init__(self, specialists: tuple[Specialist, ...], queue_limit: int = 100,
                 active_limit: int = 4, summary_limit: int = 500):
        if queue_limit < 1 or active_limit < 1 or summary_limit < 1:
            raise ValueError("limits must be positive")
        self.specialists = specialists
        self.queue_limit, self.active_limit = queue_limit, active_limit
        self.summary_limit = summary_limit
        self.queue: deque[Task] = deque()
        self.active: dict[str, Task] = {}
        self.done: dict[str, Task] = {}

    def submit(self, capability: str, summary: str) -> Task:
        if not capability or not capability.strip():
            raise ValueError("capability required")
        if len(summary) > self.summary_limit:
            raise ValueError("task summary too long")
        if len(self.queue) >= self.queue_limit:
            raise OverflowError("queue capacity reached")
        if not any(capability in s.capabilities for s in self.specialists):
            raise ValueError("no registered specialist supports this capability")
        task = Task(id=str(uuid4()), capability=capability, payload_summary=summary)
        self.queue.append(task)
        return task

    def dispatch(self) -> list[Task]:
        """Lease matching queued tasks up to active cap; never executes them."""
        leased = []
        while self.queue and len(self.active) < self.active_limit:
            task = self.queue[0]
            match = next((s for s in self.specialists if task.capability in s.capabilities), None)
            if match is None:
                break
            self.queue.popleft()
            task.state, task.specialist_role, task.leased_at = "leased", match.role, time()
            self.active[task.id] = task
            leased.append(task)
        return leased

    def complete(self, task_id: str) -> Task:
        task = self.active.pop(task_id, None)
        if task is None:
            raise KeyError("task is not active")
        task.state = "completed"
        self.done[task_id] = task
        return task

    def cancel(self, task_id: str) -> bool:
        for task in list(self.queue):
            if task.id == task_id:
                self.queue.remove(task)
                task.state = "cancelled"
                return True
        task = self.active.pop(task_id, None)
        if task:
            task.state = "cancelled"
            return True
        return False

    def status(self) -> dict[str, int]:
        return {"queued": len(self.queue), "active_leases": len(self.active),
                "completed": len(self.done), "queue_limit": self.queue_limit,
                "active_limit": self.active_limit}
