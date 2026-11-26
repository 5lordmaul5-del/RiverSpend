"""RC-187 composition seam for RC-182 worker + RC-186 metered executor.

The wrapper maps ledger task metadata to a metered task view. Authorization and
policy remain injected. Trusted identity resolvers must not trust task payload.
"""
from rc182_bounded_worker_runner import BoundedWorkerRunner
from rc186_metered_executor import MeteredExecutor

class RC187CompositionError(ValueError): pass

def metered_task_view(task):
    payload=task.get("payload") or {}
    if not isinstance(payload,dict): raise RC187CompositionError("task payload must be object")
    estimate=payload.get("estimated_tokens")
    if isinstance(estimate,bool) or not isinstance(estimate,int) or estimate<=0:
        raise RC187CompositionError("payload must include positive estimated_tokens")
    view=dict(task)
    view["estimated_tokens"]=estimate
    view["work_payload"]=payload
    return view

class RC187Worker:
    def __init__(self,ledger,worker_id,capabilities,authorize,policy,quota,identity_resolver,period_resolver,executor):
        self.runner=BoundedWorkerRunner(
            ledger,worker_id,capabilities,authorize,policy,
            MeteredExecutor(quota,self._execute,identity_resolver,period_resolver))
        self.executor=executor
    def _execute(self,task):
        view=metered_task_view(task)
        # Executor gets normalized task and can use work_payload explicitly.
        return self.executor(view)
    def run_once(self):
        return self.runner.run_once()
