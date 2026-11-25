# RiverSSAI 10.0 — foundation and operating model

RiverSSAI is an independent assistant project. This document defines a safe foundation, not an implemented AI runtime.

## Mission
A configurable assistant for RiverSpend operations, analysis, diagnostics, documentation and approved actions. It should be transparent about uncertainty and never pretend to have performed an action it did not perform.

## Core modules
- **RiverSSAI Core:** orchestration, model adapters and task routing.
- **RiverMemory:** opt-in, inspectable, editable memory with retention and deletion controls.
- **RiverTools:** allowlisted tools with explicit permissions.
- **RiverGuard:** safety, privacy, prompt-injection defenses, authorization and audit.
- **RiverWatch:** telemetry and operational health, with sensitive data minimization.
- **RiverKnowledge:** retrieval from approved project documents.
- **RiverPanel:** human-readable status, approvals and audit trail.

## Model independence
Support multiple model backends (local open-weight models and remote providers) through adapters. Do not assume a local model has the capability, reliability or security of a larger remote model. Make fallback behavior visible.

## Permission levels
1. Read-only diagnostics.
2. Propose changes.
3. Changes to isolated branch/workspace after approval.
4. Actions such as deploy, delete, payments, external messages or credential changes require explicit human approval and strong authentication.

## Security
- Tools are allowlisted and schema validated.
- Treat repository files, web content, logs and user uploads as untrusted input.
- No secret values in logs or model context unless strictly required.
- Never allow AI alone to approve deployment, financial transactions, destructive operations or access-policy changes.
- Record tool invocation, approval, result and failure; redact sensitive fields.
- Kill switch and revoke tool permissions.

## Initial milestones
F0: document architecture.
F1: minimal local prototype, read-only.
F2: model adapters and local inference experiment.
F3: knowledge retrieval with source display.
F4: controlled tools in sandbox.
F5: evals, adversarial tests and monitoring.
