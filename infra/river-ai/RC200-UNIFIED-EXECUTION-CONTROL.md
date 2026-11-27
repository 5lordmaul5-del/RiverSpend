# RC-200 — Unified Execution Control Core

Facade that calls RC-199 decision-only validator and normalizes its output into a unified control decision. It is intentionally decision-only and never dispatches or triggers execution.

Limitations: uses caller-supplied state; no verified connections to task ledger, lease/fencing registry, supervisor or recovery services; no enforcement of decisions at side-effect boundaries. Tests authored, not CI-verified.
