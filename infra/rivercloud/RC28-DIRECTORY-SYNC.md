# RC-28 — directory sync failure visibility\n\nThe RC-11 state store previously swallowed directory-sync failures after the atomic rename. It now throws `state_commit_durability_uncertain` with `commitApplied=true` and the original cause. The rename may already have committed; callers must read/reconcile state before retrying.\n\nA deterministic test injects a directory-sync failure after rename, confirms the state is visible, and confirms the lock is released for a subsequent transaction. This does not prove crash durability on every target filesystem.\n\n## Reproducible test\n\n```sh\nnode --test infra/rivercloud/rc11-state.test.mjs\n```\n

## CI closeout

- GitHub Actions **45708818257 (#257) — SUCCESS: 123/123 Node tests** and PR run **45708830490 (#258) — SUCCESS: 123/123** verify corrected commit `22a20c1e18ec8f497ce0ea2db77707d810743231`, plus shell/Python, Compose and Caddy validation. The first commit failed due syntax errors and is documented in the audit report.


### RC-28 report-only CI closeout

- The report-only commit `3230670d04de6620c464baefaf7f3cf18ab15fe6` was verified by **45708935211 (#259) and 45708941875 (#260) — SUCCESS: 123/123 Node tests** each, plus bootstrap, backup/restore and Python syntax, Compose configuration and Caddy validation. Code is unchanged from the verified RC-28 source commit.
