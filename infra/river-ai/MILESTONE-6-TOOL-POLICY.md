# RiverSSAI tool permission policy (milestone 6)

This module is a policy gate, not a tool executor. It fails closed for unknown capabilities and for capabilities marked disabled. Approval metadata does not override the disabled state. No shell, payment, deploy, repository write or destructive executor is enabled by this policy.

Run checks from the repository root:
`node --test` is not configured for this standalone assertion script; instead run `node lib/riverSSAI/testToolPolicy.mjs`.

To enable an executor in a later change: define its narrow input schema, sandbox boundary, audit record, timeout, output limits, permission scope and human-approval workflow; review and test it before changing `enabled`.
