"""Authenticated intake adapter over the existing RC-181 persistent ledger.

The verifier and submission policy are injected trusted server-side contracts.
This module does not implement an identity provider or HTTP server.
"""
from __future__ import annotations

import hashlib
import json

from rc181_payload_ledger import (
    MAX_CAPABILITY_CHARS, MAX_OWNER_CHARS, MAX_REQUEST_KEY_CHARS,
    MAX_SUMMARY_CHARS, PayloadLedgerError, RequestKeyConflict, _canonical_payload,
)


class AuthenticatedTaskIntake:
    def __init__(self, ledger, identity_verifier, submission_policy):
        if not callable(identity_verifier) or not callable(submission_policy):
            raise TypeError("identity verifier and submission policy must be callable")
        if not callable(getattr(ledger, "enqueue", None)) or not callable(
            getattr(ledger, "record_intake_event", None)
        ):
            raise TypeError("ledger must support audited intake")
        self.ledger = ledger
        self.identity_verifier = identity_verifier
        self.submission_policy = submission_policy

    @staticmethod
    def _claims(token, verifier):
        if type(token) is not str or not token or len(token) > 8192:
            return None
        try:
            claims = verifier(token)
        except Exception:
            return None
        if type(claims) is not dict or set(claims) != {"subject"}:
            return None
        subject = claims["subject"]
        if type(subject) is not str or not subject.strip() or len(subject) > MAX_OWNER_CHARS:
            return None
        return subject

    @staticmethod
    def _key_digest(request_key):
        if type(request_key) is str and request_key.strip() and len(request_key) <= MAX_REQUEST_KEY_CHARS:
            return hashlib.sha256(request_key.encode("utf-8")).hexdigest()
        return None

    def _audit(self, actor, action, request_key=None):
        try:
            self.ledger.record_intake_event(
                actor, action, request_key_sha256=self._key_digest(request_key)
            )
        except Exception:
            return False
        return True

    def submit(self, token, capability, summary, payload, request_key):
        subject = self._claims(token, self.identity_verifier)
        if subject is None:
            self._audit(None, "authentication_denied")
            return {"status": "denied", "error": "identity_invalid"}

        valid_fields = (
            type(capability) is str and capability.strip() and len(capability) <= MAX_CAPABILITY_CHARS
            and type(summary) is str and len(summary) <= MAX_SUMMARY_CHARS
            and type(request_key) is str and request_key.strip()
            and len(request_key) <= MAX_REQUEST_KEY_CHARS
        )
        if not valid_fields:
            if not self._audit(subject, "request_invalid", request_key):
                return {"status": "audit_failed"}
            return {"status": "invalid", "error": "request_invalid"}
        try:
            canonical = _canonical_payload(payload)
            safe_payload = json.loads(canonical)
        except Exception:
            if not self._audit(subject, "request_invalid", request_key):
                return {"status": "audit_failed"}
            return {"status": "invalid", "error": "payload_invalid"}

        try:
            authorized = self.submission_policy(subject, capability, summary, safe_payload)
        except Exception:
            authorized = False
        if authorized is not True:
            if not self._audit(subject, "policy_denied", request_key):
                return {"status": "audit_failed"}
            return {"status": "denied", "error": "submission_not_authorized"}

        try:
            task_id, status = self.ledger.enqueue(
                capability, summary, subject, safe_payload,
                request_key=request_key, audit_actor=subject, return_status=True,
            )
        except OverflowError:
            return {"status": "queue_full"}
        except RequestKeyConflict:
            return {"status": "conflict", "error": "request_key_conflict"}
        except PayloadLedgerError:
            if not self._audit(subject, "request_invalid", request_key):
                return {"status": "audit_failed"}
            return {"status": "invalid", "error": "request_invalid"}
        except Exception:
            return {"status": "error", "error": "intake_failed"}
        return {"status": status, "task_id": task_id}
