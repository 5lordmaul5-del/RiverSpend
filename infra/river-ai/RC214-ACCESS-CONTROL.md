# RC214 — Key Management & Access Control

- Role permission model: owner/admin/agent/reader.
- Permission checks enforced for policy updates, key metadata rotation, revocation and audit access.
- Key rotation metadata is monotonic by version.
- Revocation state and append-style audit events (optional JSONL file).
- Stores only external vault references, not cryptographic key material.

## Production caveats
Prototype policy registry is in-memory; audit JSONL has no signing, tamper-proof storage, locking or rotation. Identity/authentication is not implemented. Key references are placeholders; integrate a real vault/keystore and enforce authenticated identity, least privilege, secure audit, and incident response. Tests authored, not run. No merge/deployment.
