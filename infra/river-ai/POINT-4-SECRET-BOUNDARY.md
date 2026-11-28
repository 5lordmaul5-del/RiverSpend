# RiverSSAI Point 4 — secret boundary and owner access safeguards

This increment defines a safe operating boundary for the standalone owner runtime. It is a checklist and static validation, not a credential rotation, host change, or security certification.

## Secret-handling rules
- Keep runtime credentials in `infra/river-ai/.env` only on the owner host; never commit, paste into issues, logs, chat, screenshots, or backups in plaintext.
- Require restrictive file permissions (0600 for the environment file; 0700 for directories containing secrets).
- Generate unique high-entropy values for database and API bearer credentials. Do not reuse RiverSpend website, GitHub, Vercel, Supabase or personal account credentials.
- Keep backup encryption passphrase independent from runtime credentials and from the backup location.
- Treat logs, crash reports, shell history, copied compose output and diagnostic bundles as potentially sensitive.
- Do not publish the API or Ollama port. Public exposure requires a separate design review: TLS, reverse proxy, firewall, authentication, abuse controls, audit logging, rate limits and explicit owner approval.

## Owner access and recovery
- The single owner controls host, files, model, backups and access tokens.
- Store recovery material in two independent locations; keep the passphrase separate from encrypted backup files.
- If a token is suspected compromised: stop service exposure, revoke/replace it on the owner host, check logs, and re-run authenticated smoke tests. Do not paste the token into any remediation request.
- Share access only after explicit review. No collaborator access or credential change is performed by this PR.

## Safe audit checklist
- [ ] `.env` excluded from Git and never tracked.
- [ ] No credential values in committed files.
- [ ] API host binding remains loopback/private.
- [ ] Ollama has no public host port.
- [ ] Authenticated API required for chat endpoint.
- [ ] Rate/parallel request limits configured.
- [ ] Backup passphrase stored separately.
- [ ] Access and incident procedure documented.

## Limitations / acceptance
This document does not inspect or certify a provisioned host, actual permissions, network firewall, secrets store, credential rotation, or external exposure. Static CI is only a repository guardrail. A host audit requires owner-controlled execution and review.