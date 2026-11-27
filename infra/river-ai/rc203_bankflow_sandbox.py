"""RiverSSAI BankFlow Intelligence: offline fictional payment-flow sandbox."""
from dataclasses import dataclass, asdict
from datetime import datetime, timezone
from enum import Enum
from uuid import uuid4

class Status(str, Enum):
    CREATED="created"; AUTHORIZED="authorized"; REVIEW="review"; COMPLETED="completed"; REJECTED="rejected"

@dataclass
class SimulatedTransfer:
    transfer_id: str
    source_account: str
    destination_account: str
    amount: float
    currency: str
    status: str
    purpose: str
    created_at: str

class BankFlowSandbox:
    """No network calls, real credentials, or actual banking rails."""
    def __init__(self, balances=None, daily_limits=None):
        self.balances=dict(balances or {"SIM-A":10000.0,"SIM-B":0.0})
        self.limits=dict(daily_limits or {})
        self.transfers={}
        self.audit=[]
        self._keys={}
    def _event(self, kind, transfer_id, details=None):
        self.audit.append({"event":kind,"transfer_id":transfer_id,"details":details or {},
            "timestamp":datetime.now(timezone.utc).isoformat()})
    def create(self, source, destination, amount, currency="EUR", purpose="sandbox test", idempotency_key=None):
        if not source.startswith("SIM-") or not destination.startswith("SIM-"):
            raise ValueError("Only fictional SIM-* accounts are accepted")
        if source==destination: raise ValueError("Source and destination must differ")
        if not isinstance(amount,(int,float)) or amount<=0: raise ValueError("Amount must be positive")
        if currency!="EUR": raise ValueError("Sandbox supports EUR only")
        if idempotency_key:
            if idempotency_key in self._keys: return self.transfers[self._keys[idempotency_key]]
        if source not in self.balances or destination not in self.balances:
            raise ValueError("Unknown sandbox account")
        t=SimulatedTransfer("SIMTX-"+uuid4().hex[:12],source,destination,float(amount),currency,
            Status.CREATED.value,str(purpose),datetime.now(timezone.utc).isoformat())
        self.transfers[t.transfer_id]=t
        if idempotency_key: self._keys[idempotency_key]=t.transfer_id
        self._event("created",t.transfer_id,{"amount":amount,"currency":currency})
        return t
    def authorize(self, transfer_id, approver="SIM-USER"):
        t=self._get(transfer_id)
        if t.status!=Status.CREATED.value: raise ValueError("Only created transfers may be authorized")
        if not approver.startswith("SIM-"): raise ValueError("Sandbox approver identity required")
        self._event("authorized",t.transfer_id,{"approver":approver})
        t.status=Status.AUTHORIZED.value
        return t
    def execute(self, transfer_id):
        t=self._get(transfer_id)
        if t.status!=Status.AUTHORIZED.value: raise ValueError("Transfer must be authorized first")
        limit=self.limits.get(t.source_account)
        if limit is not None and t.amount>limit:
            t.status=Status.REVIEW.value; self._event("limit_review",t.transfer_id,{"limit":limit}); return t
        if self.balances[t.source_account]<t.amount:
            t.status=Status.REJECTED.value; self._event("insufficient_funds",t.transfer_id); return t
        self.balances[t.source_account]-=t.amount
        self.balances[t.destination_account]+=t.amount
        t.status=Status.COMPLETED.value
        self._event("completed",t.transfer_id,{"simulated":True})
        return t
    def _get(self, transfer_id):
        try: return self.transfers[transfer_id]
        except KeyError: raise ValueError("Unknown simulated transfer") from None
    def receipt(self, transfer_id):
        t=self._get(transfer_id)
        return {"transfer":asdict(t),"audit_events":[e for e in self.audit if e["transfer_id"]==transfer_id],
            "sandbox_only":True,"actual_payment":False}
