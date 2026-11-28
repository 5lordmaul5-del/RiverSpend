# RC-31 — restore archive source integrity

## Finding

The restricted restore helper performed archive preflight in one `tarfile.open` call and extraction in a second call. The path could be replaced between the two opens, so the checksum/preflight and extraction could refer to different archive contents. This was an integrity/TOCTOU concern, not evidence of path traversal bypass.

## Correction

- Open the archive once using `O_NOFOLLOW`; fail closed if the platform lacks that flag.
- Confirm the opened descriptor is a regular file.
- Keep the same descriptor and `TarFile` object for preflight and extraction, avoiding a second pathname open.
- Retain the existing path/type/size validation, exclusive file creation, fsync and cleanup-on-failure behavior.

## Regression

A new test creates a valid archive, exposes it through a symlink, verifies the checksum of that symlink path, and confirms the restore helper rejects the symlink and does not create the target directory.

## Verification status

The code and test were committed on the isolated PR branch. GitHub Actions **45717374680 (#314) — SUCCESS: 131/131 Node tests, 0 failures**, plus bootstrap shell syntax, backup/restore and Python extractor syntax, Compose configuration and Caddy validation. The run verified commit `dd90f8b3e0772275cfb7266c3d1db6a38c143cde`. The Caddy check used a temporary validation container; no RiverCloud services were started. No production backup or restore was performed.
