# RiverFortress Readiness Inventory

This first executable gate validates the inventory schema and prevents evidence-free status claims. It is deliberately offline/read-only and does not contact production services.

Run: `node infra/riverfortress/readiness-check.mjs`
Run tests: `node --test infra/riverfortress/readiness-check.test.mjs`

Statuses are evidence labels, not security certifications. `ci-tested` requires a CI record tied to a commit SHA; `operationally-verified` requires a referenced operational test record. The checker does not itself validate the external evidence.