# RC-48 — canonical backup path containment

## Finding

RC-19 checked whether the backup destination was inside the source using logical `pwd` paths. If the source was reached through a symlink alias and the backup directory used the physical path, the containment check could miss the destination inside the source tree.

## Correction

- Source and backup directories are now canonicalized with `pwd -P` before containment checks.
- Regression test uses a source-directory symlink alias and a backup destination inside the physical source directory; the backup must be refused.

## Verification status

- Code and test changes committed on the isolated PR branch.
- CI pending; no local test pass claimed.
- No real backup/restore, services, runner, staging, deployment, merge, production data/credentials, provisioning or spending.

## Reproduce

```sh
node --test infra/rivercloud/backup-restore.test.mjs
```
