# RC-10 approval-bound prototype
Approval tokens bind a named job to RiverSpend project, fixed worker profile, staging target, commit SHA and plan digest. Tokens expire (default 5 minutes, bounded to 1 hour), HMAC signature validated, and are marked consumed in local persistence.

Limitations: prototype only; approver string is not authenticated identity; local storage writes are not transactional/atomic; nonce generation is prototype-grade; concurrent consume races are not prevented; no worker execution or deployment is connected. Requires hardened identity, durable transactional store, rate limits, audit integration and independent security review before use.
