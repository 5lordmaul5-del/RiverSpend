"""RC212: Integrity checks, verified SQLite backups, and controlled restore for RC211 graph storage.

Local prototype. Restore is fail-closed: validate backup in an isolated temporary database
before writing to the destination. No network services or automated destructive actions.
"""
from __future__ import annotations
import hashlib
import json
import os
import sqlite3
import tempfile
from pathlib import Path
from datetime import datetime, timezone

def _sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()

def integrity_check(db_path: str | Path) -> dict:
    path = Path(db_path)
    if not path.exists():
        return {"ok": False, "path": str(path), "error": "database_missing"}
    try:
        with sqlite3.connect(f"file:{path.resolve()}?mode=ro", uri=True) as con:
            checks = [row[0] for row in con.execute("PRAGMA integrity_check")]
            fk = list(con.execute("PRAGMA foreign_key_check"))
            tables = {r[0] for r in con.execute("SELECT name FROM sqlite_master WHERE type='table'")}
            counts = {}
            for table in ("nodes", "edges"):
                if table in tables:
                    counts[table] = con.execute(f'SELECT COUNT(*) FROM "{table}"').fetchone()[0]
            ok = checks == ["ok"] and not fk
            return {"ok": ok, "integrity": checks, "foreign_key_violations": len(fk), "counts": counts}
    except sqlite3.Error as exc:
        return {"ok": False, "error": str(exc)}

def create_verified_backup(source: str | Path, backup: str | Path) -> dict:
    src, dest = Path(source), Path(backup)
    if not src.exists():
        raise FileNotFoundError(src)
    dest.parent.mkdir(parents=True, exist_ok=True)
    pre = integrity_check(src)
    if not pre.get("ok"):
        raise ValueError("Source database failed integrity check; backup refused.")
    # SQLite online backup API, avoids copying an active database file directly.
    with sqlite3.connect(src) as s, sqlite3.connect(dest) as d:
        s.backup(d)
    post = integrity_check(dest)
    if not post.get("ok"):
        dest.unlink(missing_ok=True)
        raise ValueError("Backup integrity verification failed; backup removed.")
    manifest = {"created_utc": datetime.now(timezone.utc).isoformat(),
                "source": str(src), "backup": str(dest), "sha256": _sha256(dest),
                "integrity": post}
    manifest_path = dest.with_suffix(dest.suffix + ".manifest.json")
    manifest_path.write_text(json.dumps(manifest, indent=2, sort_keys=True), encoding="utf-8")
    return manifest

def restore_verified_backup(backup: str | Path, destination: str | Path) -> dict:
    src, dest = Path(backup), Path(destination)
    manifest_path = src.with_suffix(src.suffix + ".manifest.json")
    if not src.exists() or not manifest_path.exists():
        raise ValueError("Backup or manifest missing.")
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    if manifest.get("sha256") != _sha256(src):
        raise ValueError("Backup hash mismatch; restore refused.")
    check = integrity_check(src)
    if not check.get("ok"):
        raise ValueError("Backup database integrity check failed.")
    dest.parent.mkdir(parents=True, exist_ok=True)
    # Build and validate staged restore first, then atomically replace destination.
    with tempfile.NamedTemporaryFile(prefix="rc212-restore-", suffix=".sqlite", dir=dest.parent, delete=False) as tmp:
        staged = Path(tmp.name)
    try:
        with sqlite3.connect(src) as s, sqlite3.connect(staged) as d:
            s.backup(d)
        if not integrity_check(staged).get("ok") or _sha256(staged) != _sha256(src):
            raise ValueError("Staged restore verification failed.")
        os.replace(staged, dest)
    finally:
        staged.unlink(missing_ok=True)
    return {"ok": True, "destination": str(dest), "sha256": _sha256(dest), "integrity": integrity_check(dest)}
