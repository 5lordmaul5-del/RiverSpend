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

_DIR_FLAGS = os.O_RDONLY | getattr(os, "O_DIRECTORY", 0) | getattr(os, "O_NOFOLLOW", 0)
_FILE_FLAGS = os.O_WRONLY | os.O_CREAT | os.O_EXCL | getattr(os, "O_NOFOLLOW", 0)


def require_dirfd_support():
    if (not hasattr(os, "O_DIRECTORY") or not hasattr(os, "O_NOFOLLOW")
            or os.open not in os.supports_dir_fd or os.mkdir not in os.supports_dir_fd):
        fail("safe directory-descriptor extraction unavailable")


def open_child_directory(parent_fd, name):
    created = False
    try:
        os.mkdir(name, mode=0o700, dir_fd=parent_fd)
        created = True
    except FileExistsError:
        pass
    child_fd = os.open(name, _DIR_FLAGS, dir_fd=parent_fd)
    if created:
        os.fsync(parent_fd)
    return child_fd


def open_directory_chain(root_fd, parts):
    current_fd = os.dup(root_fd)
    try:
        for part in parts:
            next_fd = open_child_directory(current_fd, part)
            os.close(current_fd)
            current_fd = next_fd
        return current_fd
    except Exception:
        os.close(current_fd)
        raise


def cleanup_owned_target(target, root_identity):
    try:
        current = target.lstat()
        if (stat.S_ISDIR(current.st_mode) and not stat.S_ISLNK(current.st_mode)
                and current.st_dev == root_identity.st_dev and current.st_ino == root_identity.st_ino):
            shutil.rmtree(target, ignore_errors=True)
    except OSError:
        pass

def main(archive_path, target_path):
    archive_path = Path(archive_path)
    target = Path(target_path)
    if target.exists() or target.is_symlink():
        fail("restore target must not already exist")
    if not target.parent.is_dir():
        fail("restore parent directory must exist")
    if not hasattr(os, "O_NOFOLLOW"):
        fail("safe archive open unavailable")
    require_dirfd_support()

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
                root_fd = os.open(target, _DIR_FLAGS)
                root_identity = os.fstat(root_fd)
                try:
                    try:
                        for member, parts in entries:
                            if member.isdir():
                                dir_fd = open_directory_chain(root_fd, parts)
                                try:
                                    os.fsync(dir_fd)
                                finally:
                                    os.close(dir_fd)
                                continue
                            parent_fd = open_directory_chain(root_fd, parts[:-1])
                            try:
                                file_fd = os.open(parts[-1], _FILE_FLAGS, 0o600, dir_fd=parent_fd)
                                try:
                                    src = archive.extractfile(member)
                                    if src is None:
                                        fail("missing file stream")
                                    with src, os.fdopen(file_fd, "wb", closefd=False) as out:
                                        shutil.copyfileobj(src, out, length=1024*1024)
                                    os.fsync(file_fd)
                                    os.fsync(parent_fd)
                                finally:
                                    os.close(file_fd)
                            finally:
                                os.close(parent_fd)
                        os.fsync(root_fd)
                    except Exception:
                        cleanup_owned_target(target, root_identity)
                        raise
                finally:
                    os.close(root_fd)
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
