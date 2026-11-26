# RC-20 Audit Follow-up — Restore and Audit Sink

Scope: read-only review of the RC-19 restricted extractor, RC-14 audit sink prototype, and RC-7 runner boundary on `feat/rivercloud-core-2026-11-25`. This note records findings; it does not authorize deployment or production operations.

## Verified baseline
- Latest checked GitHub Actions run 45657619903 succeeded: Node tests, shell/Python syntax, Compose configuration validation, and Caddy validation. Services were not started.
- Runner execution is explicitly disabled; preparation only.
- RC-14 performs no network delivery itself.

## Findings / next hardening gates

### RC-19 restore extractor
1. **Resource exhaustion before limits (high priority):** `tarfile.getmembers()` loads archive metadata before the configured entry-count and extracted-byte checks are evaluated. A highly compressed archive or excessive metadata can exhaust memory/CPU before those safeguards apply. Replace with bounded streaming/metadata processing and enforce compressed-input, member-count, per-file, total-size and elapsed/resource limits before materializing the whole archive.
2. **Filesystem race / parent-directory safety:** `O_NOFOLLOW` protects the final file component, but directory creation and path checks use pathname operations. Concurrent local manipulation of parent components could undermine confinement. Use directory-descriptor-relative operations (`openat`-style), no-follow checks for every component, and/or an isolated restore environment with strict ownership and permissions; test adversarial races.
3. **Durability/recovery proof:** current tests cover ordinary round-trip, symlink/hardlink/FIFO rejection on backup, traversal rejection, size-limit rejection, and refusing existing targets. Add hostile archive tests: duplicate/conflicting paths, symlink/hardlink/special archive members, malformed metadata, huge member counts, compressed bombs, partial extraction cleanup and crash/restart recovery. Validate checksum provenance and atomic promotion only after a verified restore.

### RC-14 audit sink
1. **Endpoint delivery boundary:** URL validation accepts HTTPS URLs but does not resolve or constrain destination IPs. If network delivery is added, require destination allowlisting, reject private/loopback/link-local/reserved addresses, defend against DNS rebinding, revalidate redirects and prohibit redirects unless explicitly safe. Currently this is a prototype contract; no network calls occur.
2. **Redaction coverage:** redaction is key-name based and bounded by depth/item/string limits. It cannot detect secrets embedded in ordinary text fields. Keep payload schemas narrowly allowlisted, avoid free-form event data, and add test vectors for nested keys, arrays, alternate secret naming, and embedded secret text. Treat redaction as defense-in-depth, not a guarantee.
3. **Replay handling:** signed descriptors use a time window, but receiver-side replay prevention/unique event IDs and durable replay tracking are not implemented. Add them before operational delivery.

### RC-7 Runner
Execution remains disabled, which is appropriate. Before enabling, require a disposable isolated worker, no host Docker socket, strict network egress policy, resource quotas, immutable image digests, short-lived credentials, and approval/actor binding. Add hostile workload and escape-path tests.

## Release gate
Do not merge or deploy until the above items are addressed, independently reviewed, tested on a disposable staging host, and accompanied by backup/restore and isolation evidence.
