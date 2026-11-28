"""RC-180: strict bridge between RC-159 ledger leases and worker contracts.

The ledger leases metadata (id/capability/summary/attempts/lease_owner); it does
not contain execution payload or authenticated owner identity. This bridge only
validates and binds a caller-supplied execution envelope to that lease. It does
not execute tasks or authenticate the caller.
"""
from __future__ import annotations

class ContractError(ValueError):
    pass

def bind_lease(lease: dict, envelope: dict) -> dict:
    if not isinstance(lease, dict) or not isinstance(envelope, dict):
        raise ContractError("invalid contract")
    required_lease = ("id", "capability", "summary", "lease_owner")
    if any(not isinstance(lease.get(k), str) or not lease[k] for k in required_lease):
        raise ContractError("invalid lease metadata")
    if lease.get("lease_owner") != envelope.get("worker_id"):
        raise ContractError("worker lease mismatch")
    kind = envelope.get("kind")
    owner = envelope.get("owner")
    payload = envelope.get("payload")
    if kind != lease["capability"]:
        raise ContractError("capability mismatch")
    if not isinstance(owner, str) or not owner.strip() or len(owner) > 128:
        raise ContractError("invalid owner")
    if not isinstance(payload, dict):
        raise ContractError("payload must be an object")
    return {
        "task_id": lease["id"],
        "kind": kind,
        "owner": owner,
        "payload": payload,
        "worker_id": lease["lease_owner"],
        "summary": lease["summary"],
        "attempts": lease.get("attempts", 0),
    }
