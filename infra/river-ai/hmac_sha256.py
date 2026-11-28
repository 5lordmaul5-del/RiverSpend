#!/usr/bin/env python3
"""Domain-separated HMAC-SHA256 for RiverSSAI encrypted backup artifacts."""
import hashlib
import hmac
import os
import sys

if len(sys.argv) != 2:
    print("Usage: hmac_sha256.py backup-file", file=sys.stderr)
    sys.exit(2)
passphrase = os.environ.get("RIVER_AI_BACKUP_PASSPHRASE")
if not passphrase:
    print("Set RIVER_AI_BACKUP_PASSPHRASE.", file=sys.stderr)
    sys.exit(1)
key = hashlib.pbkdf2_hmac(
    "sha256",
    passphrase.encode("utf-8"),
    b"RiverSSAI backup integrity v1",
    250000,
    dklen=32,
)
digest = hmac.new(key, digestmod=hashlib.sha256)
try:
    with open(sys.argv[1], "rb") as backup:
        for chunk in iter(lambda: backup.read(1024 * 1024), b""):
            digest.update(chunk)
except OSError as exc:
    print(f"Cannot read backup: {exc}", file=sys.stderr)
    sys.exit(1)
print(digest.hexdigest())
