"""RC-182 bounded worker runner atop RC-181 payload ledger.

This is a one-task-at-a-time execution seam with injected authorization, policy,
and executor functions. It deliberately avoids network/service side effects.
Executor failures leave the lease to expire and be retried by the ledger.
"""
from __future__ import annotations

from typing import Callable, Any


class WorkerRejected(RuntimeError):
    """Raised when authorization or policy rejects a leased task."""


class BoundedWorkerRunner:
    def __init__(
        self,
        ledger,
        worker_id: str,
        capabilities: tuple[str, ...],
        authorize: Callable[[str, dict], bool],
        policy: Callable[[dict], bool],
        executor: Callable[[dict], Any],
    ):
        if not isinstance(worker_id, str) or not worker_id.strip():
            raise ValueError("worker_id required")
        if not capabilities or any(not isinstance(c, str) or not c.strip() for c in capabilities):
            raise ValueError("non-empty capabilities required")
        if not callable(authorize) or not callable(policy) or not callable(executor):
            raise TypeError("authorize, policy and executor must be callable")
        self.ledger = ledger
        self.worker_id = worker_id
        self.capabilities = tuple(capabilities)
        self.authorize = authorize
        self.policy = policy
        self.executor = executor

    def run_once(self) -> dict | None:
        task = self.ledger.lease_next(self.worker_id, self.capabilities)
        if task is None:
            return None
        # Fail closed. The ledger has no failure/release operation yet, so rejected
        # or failed tasks remain leased until expiry and then become eligible again.
        if not self.authorize(self.worker_id, task):
            raise WorkerRejected("worker/task authorization denied")
        if not self.policy(task):
            raise WorkerRejected("execution policy denied")
        result = self.executor(task)
        if not self.ledger.complete(task["id"], self.worker_id):
            raise WorkerRejected("task completion rejected; lease may have expired")
        return {"task_id": task["id"], "state": "completed", "result": result}
