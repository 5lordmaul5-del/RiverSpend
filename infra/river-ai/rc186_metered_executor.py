"""RC-186: metered executor adapter connecting plan limits, quota holds and execution.

Usage: inject trusted identity/plan/period and a bounded executor. Never accept
these identity/policy values from untrusted task payloads.
"""
from rc183_saas_entitlements import get_plan
from rc185_atomic_quota import AtomicQuota

class MeteredExecutionError(RuntimeError): pass

class MeteredExecutor:
    def __init__(self, quota: AtomicQuota, execute, identity_resolver, period_resolver):
        if not callable(execute) or not callable(identity_resolver) or not callable(period_resolver):
            raise TypeError("executor and resolvers must be callable")
        self.quota=quota; self.execute=execute; self.identity_resolver=identity_resolver; self.period_resolver=period_resolver

    def __call__(self, task):
        # Resolvers are trusted server-side functions, not task payload fields.
        user_id, plan_key = self.identity_resolver(task)
        period_key = self.period_resolver(task)
        plan=get_plan(plan_key)
        estimate=task.get("estimated_tokens", 0)
        if isinstance(estimate,bool) or not isinstance(estimate,int) or estimate<=0:
            raise MeteredExecutionError("task must have a positive trusted token estimate")
        reservation_id="rc186:"+str(task["id"])
        if not self.quota.reserve(reservation_id,user_id,plan.key,period_key,estimate,plan.monthly_token_budget):
            raise MeteredExecutionError("monthly token quota exceeded")
        try:
            result=self.execute(task)
            actual=result.get("usage_tokens",estimate) if isinstance(result,dict) else estimate
            if isinstance(actual,bool) or not isinstance(actual,int) or actual<0:
                raise MeteredExecutionError("executor returned invalid usage_tokens")
            # Reconcile overshoot by refusing to record usage beyond this reservation:
            # a later extension can implement atomic adjustment/refund semantics.
            if actual>estimate:
                raise MeteredExecutionError("actual token usage exceeded reservation; increase estimate")
            request_id=str(task["id"])
            self.quota.commit(reservation_id,request_id,actual)
            return result
        except Exception:
            # If commit already transitioned state, release is harmless; it only
            # changes an active reservation. Exceptions intentionally propagate.
            try: self.quota.release(reservation_id)
            except Exception: pass
            raise
