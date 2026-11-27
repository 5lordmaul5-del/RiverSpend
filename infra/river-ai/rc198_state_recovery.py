"""RC-198 conservative inspection of owner-scoped RC-196 processing records."""
import math
import time

class StateRecovery:
    def __init__(self, registry, clock=None):
        self.registry = registry
        self.clock = clock or time.time

    def inspect(self, owner, key):
        row = self.registry.get(owner, key)
        if not row:
            return {"status": "absent"}
        # RC-196 owner-scoped row: owner,key,hash,state,created,updated,result,error
        return {
            "status": row[3],
            "key": row[1],
            "payload_hash": row[2],
            "updated": row[5],
            "result": row[6],
            "error": row[7],
        }

    def classify_processing(self, owner, key, stale_after):
        if isinstance(stale_after, bool) or not isinstance(stale_after, (int, float)) or not math.isfinite(stale_after) or stale_after < 0:
            raise ValueError("stale_after must be a finite non-negative number")
        item = self.inspect(owner, key)
        if item["status"] != "processing":
            return {"action": "none", "state": item["status"]}
        age = max(0.0, self.clock() - item["updated"])
        if age < stale_after:
            return {"action": "wait", "age": age}
        # Age alone cannot prove the original worker stopped or external effects are absent.
        return {
            "action": "manual_reconciliation",
            "age": age,
            "reason": "stale processing state does not prove original execution stopped",
        }
