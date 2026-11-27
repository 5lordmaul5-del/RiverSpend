# River Sentinel — Mail Security & Anti-Spyware (prototype)

Defensive security monitor for RiverMail accounts. **Not a hidden spy, inbox-content surveillance tool, or administrator reading interface.** The design is user-visible, consent-based and scoped to security signals/metadata.

## Detectable signals (prototype rules)
- anomalous sign-in / unfamiliar device or IP (when supplied by the authentication layer)
- suspicious forwarding rules and OAuth/app permissions
- phishing indicators (sender-domain mismatch, suspicious links, urgency patterns) without storing full message bodies
- unusual attachment type/hash indicators (metadata only)
- account security changes, failed-login bursts
- security events, score, explanation and recommended response

## Privacy and controls
- account owner sees their own events; administrators see aggregated/system-level events only, except explicitly granted, logged support access
- opt-in telemetry, configurable retention, data minimization, access audit, export/delete
- never silently intercept or copy email contents, credentials, personal conversations or covertly track users
- prototype scoring is illustrative; production requires authenticated API, tenant isolation, threat-intelligence sources, secure event pipeline and independent testing

## Run dashboard
Open `index.html` locally. It displays synthetic sample events only; no real accounts or email data are accessed.
