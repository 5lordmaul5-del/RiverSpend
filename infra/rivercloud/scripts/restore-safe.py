#!/usr/bin/env python3
"""Safe, restricted restore for RiverCloud local tar.gz backups."""
import os
import shutil
import stat
import sys
import tarfile
from pathlib import Path, PurePosixPath

MAX_FILES = 100_000
MAX_BYTES = int(os.environ.get("RIVERCLOUD_RESTORE_MAX_BYTES", str(20 * 1024**3)))

def fail(message):
    raise ValueError(message)

def validate_member(member):
    name = member.name
    if not name or "\\" in name or name.startswith("/"):
        fail("unsafe archive path")
    parts = PurePosixPath(name).parts
    if any(part in ("..", "") for part in parts):
        fail("unsafe archive path")
    if parts in ((".",), ()):
        return None
    clean = tuple(part for part in parts if part not in (".",))
    if not clean or any(part in ("..",) for part in clean):
        fail("unsafe archive path")
    if member.isdir():
        return clean
    if member.isfile():
        return clean
    fail("unsupported archive entry type (links and special files are denied)")

def mkdirs(root, parts):
    current = root
    for part in parts:
        current = current / part
        if current.exists():
            if not current.is_dir() or current.is_symlink():
                fail("archive path conflicts with non-directory")
        else:
            current.mkdir(mode=0o700)
    return current

def main(archive_path, target_path):
    archive_path = Path(archive_path)
    target = Path(target_path)
    if target.exists() or target.is_symlink():
        fail("restore target must not already exist")
    if not target.parent.is_dir():
        fail("restore parent directory must exist")
    if not hasattr(os, "O_NOFOLLOW"):
        fail("safe archive open unavailable")

    fd = os.open(str(archive_path), os.O_RDONLY | os.O_NOFOLLOW)
    try:
        if not stat.S_ISREG(os.fstat(fd).st_mode):
            fail("archive must be a regular file")
        raw = os.fdopen(fd, "rb", closefd=False)
        try:
            with tarfile.open(fileobj=raw, mode="r:gz") as archive:
                members = archive.getmembers()
                if len(members) > MAX_FILES:
                    fail("archive file-count limit exceeded")
                entries = []
                seen = set()
                total = 0
                for member in members:
                    clean = validate_member(member)
                    if clean is None:
                        continue
                    key = "/".join(clean)
                    if key in seen:
                        fail("duplicate archive path")
                    seen.add(key)
                    if member.isfile():
                        if member.size < 0:
                            fail("invalid archive file size")
                        total += member.size
                        if total > MAX_BYTES:
                            fail("archive size limit exceeded")
                    entries.append((member, clean))
                files = {"/".join(p) for m, p in entries if m.isfile()}
                for _, p in entries:
                    for i in range(1, len(p)):
                        ancestor = "/".join(p[:i])
                        if ancestor in files:
                            fail("file entry conflicts with child path")

                target.mkdir(mode=0o700)
                try:
                    for member, parts in entries:
                        dest = target.joinpath(*parts)
                        if member.isdir():
                            mkdirs(target, parts)
                            continue
                        mkdirs(target, parts[:-1])
                        file_fd = os.open(dest, os.O_WRONLY | os.O_CREAT | os.O_EXCL | getattr(os, "O_NOFOLLOW", 0), 0o600)
                        try:
                            src = archive.extractfile(member)
                            if src is None:
                                fail("missing file stream")
                            with src, os.fdopen(file_fd, "wb", closefd=False) as out:
                                shutil.copyfileobj(src, out, length=1024*1024)
                            os.fsync(file_fd)
                        finally:
                            os.close(file_fd)
                except Exception:
                    shutil.rmtree(target, ignore_errors=True)
                    raise
        finally:
            raw.close()
    finally:
        os.close(fd)
    print("Restore extracted safely to:", target)

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: restore-safe.py ARCHIVE TARGET", file=sys.stderr)
        sys.exit(2)
    try:
        main(sys.argv[1], sys.argv[2])
    except Exception as exc:
        print("Restore failed:", str(exc), file=sys.stderr)
        sys.exit(2)
