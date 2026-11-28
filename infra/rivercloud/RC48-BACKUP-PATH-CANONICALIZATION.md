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


## RC-48 CI closeout (26 November 2026)

- Code/test commit `7ebbabbae101c1d39e98d59a117c64078202ce6a`: GitHub Actions **45766399053 (#423) — SUCCESS, 156/156 Node tests**, 0 failures; bootstrap shell, backup/restore/Python syntax, restore directory-replacement race, Compose, API image build/inspection and Caddy validation passed.
- No real backup or restore was performed. No services or runner were started, no merge, deployment, production data/credentials, provisioning or spending.
