"""Adapter exposing RC-161's allowlisted process supervisor as RC-183's executor."""
from __future__ import annotations

from rc161_sandbox_supervisor import ALLOWED, SandboxSupervisor, SupervisorError


class RC161SupervisorExecutor:
    """Test/local executor for bounded, side-effect-free toy tasks only."""

    def __init__(self, supervisor=None):
        self.supervisor = supervisor or SandboxSupervisor()

    def execute(self, capability, payload, idempotency_key):
        if type(capability) is not str or capability not in ALLOWED:
            raise SupervisorError("capability denied")
        if type(idempotency_key) is not str or not idempotency_key or len(idempotency_key) > 128:
            raise SupervisorError("idempotency key invalid")
        return self.supervisor.run(capability, payload)
