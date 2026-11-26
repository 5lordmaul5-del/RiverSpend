# RiverSpend continuity mirror bootstrap

Creates/refreshes a local bare mirror and configures an independent remote. Safe default is fetch/configuration only; it does not push.

```bash
SOURCE_URL=https://github.com/5lordmaul5-del/RiverSpend.git MIRROR_URL=git@ALTERNATE-FORGE:ACCOUNT/RiverSpend.git bash scripts/continuity/mirror-bootstrap.sh
```

Review the target before push:
```bash
PUSH_MIRROR=1 MIRROR_URL=git@ALTERNATE-FORGE:ACCOUNT/RiverSpend.git bash scripts/continuity/mirror-bootstrap.sh
```

Use SSH keys or a credential manager; do not embed tokens, passwords, or private keys in command lines, URLs, or files. `git push --mirror` synchronizes all refs and can delete refs on the destination that are absent from the source mirror. Keep independent snapshots and review the target first.

This bootstrap is not a configured live mirror or second forge. Test a restore on the alternate forge before relying on it.
