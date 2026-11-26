# RC-47 — fail closed on backup transaction markers

## Finding

The RC-19 backup script excluded lock and temporary snapshot files from its archive but did not check whether those markers existed. Documentation instructed the operator to quiesce the writer, yet the script could still run while an active transaction marker was present.

## Correction

- The backup script now refuses if it finds a regular file matching `*.lock` or `*.tmp-*` in the source data directory.
- The existing archive exclusions remain as defense in depth.
- Regression tests cover both markers and the ordinary round-trip no longer uses a synthetic lock file.
- This preflight is not an atomic snapshot lock and can race a transaction; the operator must still stop/quiesce the writer.

## Verification status

- Code and test changes committed on the isolated PR branch.
- CI pending; no local test pass claimed.
- No real backup or restore performed, and no staging host, services, runner, deployment, merge, production data/credentials, provisioning or spending.

## Reproduce

```sh
node --test infra/rivercloud/backup-restore.test.mjs
```
