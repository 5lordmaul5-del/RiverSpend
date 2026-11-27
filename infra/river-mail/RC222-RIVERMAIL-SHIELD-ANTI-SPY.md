# RC222 RiverMail Shield / Anti-Spy prototype

## Scope
A transparent security layer to help users detect phishing, suspicious links, risky attachment types, credential-harvesting language and unusual payment requests. The prototype audits only messages explicitly supplied to its API by an authorized caller; it does not crawl mailboxes or covertly monitor users.

## Checks
- Rule-based signal detection and severity scoring.
- Explainable findings with evidence snippets.
- Inspectable-field list (metadata/body) for transparency.
- Option to audit metadata only; body inspection is explicitly controlled.
- Batch function for caller-authorized samples.

## Proposed panel (future)
- Threat alerts, user-authorized reports, severity, explanation and action status.
- Aggregate statistics with privacy thresholds; no unrestricted individual-mail browsing.
- Role-based access, just-in-time access, reason/approval, audit trail and retention controls.
- User controls to view/delete reports and opt into content scanning.
- Quarantine/link warning workflow; false-positive review and appeal.
- Security response without exposing message contents by default.

## Limits
Prototype rules are not a malware scanner or reliable classifier and can miss or mislabel threats. No real integrations, automatic mailbox surveillance, hidden spy pixels, administrator content browsing, auth, encrypted transport, storage, retention, UI, or deployment. Production needs threat-model review, privacy/legal review (GDPR), secure architecture and independent testing.
