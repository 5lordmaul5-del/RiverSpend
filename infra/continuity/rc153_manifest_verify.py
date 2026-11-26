#!/usr/bin/env python3
"""Verify a SHA-256 manifest for a backup directory. Standard library only.

Manifest format: one file per line, '<sha256>  <relative-path>'.
The verifier rejects paths outside the backup root and reports missing,
changed, and malformed entries. It does not modify files.
"""
from __future__ import annotations
import hashlib
import sys
from pathlib import Path

def digest(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()

def verify(root: Path, manifest: Path) -> int:
    root = root.resolve()
    failed = False
    for line_no, raw in enumerate(manifest.read_text(encoding="utf-8").splitlines(), 1):
        if not raw.strip() or raw.lstrip().startswith("#"):
            continue
        parts = raw.split("  ", 1)
        if len(parts) != 2 or len(parts[0]) != 64:
            print(f"INVALID manifest line {line_no}")
            failed = True
            continue
        expected, rel = parts
        candidate = (root / rel).resolve()
        if not candidate.is_relative_to(root):
            print(f"REJECT path escape: {rel}")
            failed = True
            continue
        if not candidate.is_file():
            print(f"MISSING {rel}")
            failed = True
            continue
        actual = digest(candidate)
        if actual != expected.lower():
            print(f"MISMATCH {rel}")
            failed = True
        else:
            print(f"OK {rel}")
    return 1 if failed else 0

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: rc153_manifest_verify.py BACKUP_ROOT MANIFEST", file=sys.stderr)
        raise SystemExit(2)
    raise SystemExit(verify(Path(sys.argv[1]), Path(sys.argv[2])))
