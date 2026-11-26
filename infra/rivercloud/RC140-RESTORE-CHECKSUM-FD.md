# RC-140 — Restore checksum verification bound to the open archive

The shell restore preflight verifies the archive checksum, but path-based preflight alone leaves a replacement window before the extractor opens the archive.

RC-140 closes that gap by passing the checksum sidecar to `restore-safe.py`. The extractor re-verifies the checksum against the **same opened file descriptor** it subsequently reads as the tar stream. It checks the sidecar as a bounded regular file, rejects symlinks, unsafe permissions, mismatched filenames and malformed sidecar contents, and rewinds the archive descriptor before extraction.

Regression tests cover:
- mismatched archive bytes rejected before the target is created;
- path replacement after opening the archive, with extraction remaining bound to the verified descriptor.

This does not provide authenticated backup provenance (SHA-256 sidecars can be replaced by an attacker who controls both files), encryption, off-site storage or a real restore rehearsal. Safe extraction continues to enforce directory-descriptor containment, file-type restrictions and bounded extraction.
