# RC-204 — RiverSSAI Intelligence Center

This step defines a centralized module catalog and routing contract for RiverSSAI. It provides a shared organizational layer, not a live AI orchestrator.

## Catalog
- Market Intelligence: market indicator research
- Risk Intelligence: anomaly/risk flags for human review
- Financial Intelligence: business metric summaries
- Economic Intelligence: macroeconomic scenario exploration
- Logistics Intelligence: delivery and supply chain metrics
- Customer Intelligence: aggregate, privacy-safe experience metrics
- BankFlow Sandbox: fictional payment-flow simulation

## Architecture goals
- Common catalog and module IDs
- Explicit input/output boundaries
- Module status and safety notes
- Future orchestration can be layered without coupling modules
- No external calls or automatic decisions in this prototype

## Privacy and controls
Prefer data minimization and aggregate/anonymized customer signals. Avoid sensitive profiling. Risk outputs must be explainable and reviewed by humans. Financial modules must not claim certainty or provide unlicensed personalized advice. BankFlow remains fictional sandbox-only.

## Limitations
This catalog is a prototype and is not wired to existing RiverSSAI services. Tests are authored, not executed here.
