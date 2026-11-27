"""RC-197 bridge using RC-196 owner-scoped idempotency."""
class ExecutionBridge:
    def __init__(self, registry, executor):
        self.registry = registry
        self.executor = executor

    def run(self, owner, key, payload):
        # owner must be derived by the caller from a verified identity, never client payload.
        decision = self.registry.begin(owner, key, payload)
        if decision["status"] != "accepted":
            return decision

        try:
            result = self.executor(payload)
        except Exception as exc:
            error_type = type(exc).__name__
            try:
                recorded = self.registry.fail(owner, key, error_type)
            except Exception:
                return {"status": "reconciliation_required", "reason": "failure_recording_failed"}
            if not recorded:
                return {"status": "reconciliation_required", "reason": "failure_state_changed"}
            return {"status": "failed", "error_code": "executor_failed", "error_type": error_type}

        if type(result) is not str:
            if not self.registry.fail(owner, key, "invalid_result_type"):
                return {"status": "reconciliation_required", "reason": "invalid_result_recording_failed"}
            return {"status": "failed", "error_code": "invalid_result"}

        if not self.registry.complete(owner, key, result):
            # The external side effect may already have occurred; do not expose/re-run it.
            return {"status": "reconciliation_required", "reason": "completion_state_changed"}
        return {"status": "completed", "result": result}
