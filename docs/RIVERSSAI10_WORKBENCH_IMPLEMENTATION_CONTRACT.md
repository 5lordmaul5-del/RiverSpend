# RiverSSAI 10 Workbench — implementation increment 2

Status: design and implementation contract only. No service, database, scheduling job, external action, or deployment is created by this document.

## Goals
Move the screenshot-inspired workbench from disconnected UI placeholders toward implementable, permission-aware modules, without falsely claiming privacy or execution guarantees.

## 1. Temporary sessions
- Session mode: `standard` or `temporary`; mode must be explicit.
- Temporary session content must not be written to ordinary chat-history persistence or user memory by default.
- UI clears visible conversation when the user enters temporary mode; show a persistent indicator and exit control.
- Server logs must avoid message bodies, attachments, prompts, and secrets. Operational logs may record request IDs, outcome, timing, and safety events only, with retention defined by deployment policy.
- Temporary mode is NOT anonymous and is NOT a server-side deletion guarantee until persistence, cache, logs, analytics, backups and provider retention have been audited.
- On exit, client should clear volatile content and avoid restoring temporary messages from history.
- No sensitive data is sent to third-party connectors without a separate explicit action.

## 2. Artifacts contract
Draft artifact types: note, document, code, plan, image-prompt, checklist.
Fields: id, owner, type, title, content, revision, created_at, updated_at, status (draft/review/ready/exported), source_session_id (optional).
- Drafts stay in client state until durable storage is implemented and verified.
- Send-to-Nova must pass a clearly labeled artifact payload and preserve the draft until user confirms discard.
- Export/share operations require an explicit user action.
- Versioning and conflict behavior required before shared editing.

## 3. Scheduler / RiverAutoma contract
A scheduled task is not created by the UI placeholder. A real task request must include:
- task_id, owner, description, trigger (once/interval/condition), timezone, next_run, enabled, status;
- allowed scope and connector list;
- approval requirement, retry policy, last outcome and audit reference.
- Use idempotency keys; retry with bounded exponential backoff; prevent overlapping runs unless declared safe.
- External actions, purchases, payments, deletion, deployment and credential changes require approval gates.
- Stop, pause, edit and delete task controls must be supported.
- Never report a task as scheduled unless the scheduler service confirms creation.

## 4. Tools catalog and workflow orchestration
Each capability declares: name, version, availability, permissions, input schema, output schema, timeout, risk tier, audit policy.
Workflow states: planned -> awaiting_approval (when needed) -> running -> verifying -> completed / failed / cancelled.
- Enforce authorization on server-side tool execution, not only UI.
- Fail closed if permission, schema, service or audit checks are unavailable.
- Each step records a concise outcome and verification evidence; never fabricate completion.
- User-visible execution controls: stop, approve, retry and inspect results.

## 5. Acceptance test checklist
- Temporary chat: no local-history restoration after exit/reload; explicit mode label; test ordinary chat unaffected; inspect network payloads and persistence before claiming privacy.
- Artifacts: draft survives panel close in session; send action adds exact draft; discard is explicit; no unapproved export.
- Scheduler: UI cannot claim success without service confirmation; idempotency; stop/pause; timezone; retries; authorization.
- Tools: unavailable connector is shown as unavailable; permission checks server-side; timeout and failure states; no false success.
- Mobile: responsive layout, keyboard behavior, accessibility labels, no overlap, back/close controls.
- Security: authz, rate limits, CSRF/origin rules as applicable, schema validation, secrets redaction, audit trail.

## 6. Integration order
1. Audit existing RiverSSAI chat persistence and server endpoints.
2. Implement temporary session lifecycle only after storage/provider boundaries are identified.
3. Add artifact draft persistence with versioning and export boundaries.
4. Connect scheduler via RiverAutoma service contract.
5. Connect tools registry and orchestrator permissions.
6. Run unit, integration, security and mobile tests; verify preview manually.
7. Report tested versus pending. No merge or deployment without authorization.
