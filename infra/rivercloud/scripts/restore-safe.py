#!/usr/bin/env python3
"""Safe, restricted restore for RiverCloud local tar.gz backups."""
import os
import shutil
import stat
import sys
import tarfile
from pathlib import Path, PurePosixPath

def read_positive_limit(name, default):
    raw = os.environ.get(name, str(default))
    try:
        value = int(raw)
    except (TypeError, ValueError):
        print("restore limits must be positive integers", file=sys.stderr)
        raise SystemExit(2)
    if value < 1:
        print("restore limits must be positive integers", file=sys.stderr)
        raise SystemExit(2)
    return value

MAX_FILES = read_positive_limit("RIVERCLOUD_RESTORE_MAX_FILES", 100000)
MAX_BYTES = read_positive_limit("RIVERCLOUD_RESTORE_MAX_BYTES", 20 * 1024**3)
MAX_ARCHIVE_BYTES = read_positive_limit("RIVERCLOUD_RESTORE_MAX_ARCHIVE_BYTES", 20 * 1024**3)
MAX_PATH_DEPTH = 128
MAX_PATH_BYTES = 4096
MAX_COMPONENT_BYTES = 255

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
    if len(clean) > MAX_PATH_DEPTH:
        fail("archive path depth limit exceeded")
    encoded_parts = [os.fsencode(part) for part in clean]
    if any(len(part) > MAX_COMPONENT_BYTES for part in encoded_parts):
        fail("archive path component length limit exceeded")
    if sum(len(part) for part in encoded_parts) + len(clean) - 1 > MAX_PATH_BYTES:
        fail("archive path length limit exceeded")
    if member.isdir():
        return clean
    if member.isfile():
        return clean
    fail("unsupported archive entry type (links and special files are denied)")

_DIR_FLAGS = os.O_RDONLY | getattr(os, "O_DIRECTORY", 0) | getattr(os, "O_NOFOLLOW", 0)
_FILE_FLAGS = os.O_WRONLY | os.O_CREAT | os.O_EXCL | getattr(os, "O_NOFOLLOW", 0)


def require_dirfd_support():
    required = (os.open, os.mkdir, os.stat, os.unlink, os.rmdir)
    if (not hasattr(os, "O_DIRECTORY") or not hasattr(os, "O_NOFOLLOW")
            or any(fn not in os.supports_dir_fd for fn in required)
            or os.listdir not in os.supports_fd):
        fail("safe directory-descriptor extraction unavailable")


def open_absolute_directory(path):
    if not path.is_absolute():
        fail("restore parent must be absolute")
    current_fd = os.open("/", _DIR_FLAGS)
    try:
        if (os.fstat(current_fd).st_mode & 0o022) and not (os.fstat(current_fd).st_mode & 0o1000):
            fail("restore parent directory has unsafe permissions")
        for part in path.parts[1:]:
            if part in ("", ".", ".."):
                fail("unsafe restore parent path")
            next_fd = os.open(part, _DIR_FLAGS, dir_fd=current_fd)
            if (os.fstat(next_fd).st_mode & 0o022) and not (os.fstat(next_fd).st_mode & 0o1000):
                os.close(next_fd)
                fail("restore parent directory has unsafe permissions")
            os.close(current_fd)
            current_fd = next_fd
        return current_fd
    except Exception:
        os.close(current_fd)
        raise


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


def remove_directory_contents(directory_fd):
    for name in os.listdir(directory_fd):
        entry = os.stat(name, dir_fd=directory_fd, follow_symlinks=False)
        if stat.S_ISDIR(entry.st_mode) and not stat.S_ISLNK(entry.st_mode):
            child_fd = os.open(name, _DIR_FLAGS, dir_fd=directory_fd)
            try:
                remove_directory_contents(child_fd)
            finally:
                os.close(child_fd)
            os.rmdir(name, dir_fd=directory_fd)
        else:
            os.unlink(name, dir_fd=directory_fd)


def cleanup_owned_target_at(parent_fd, target_name, root_fd, root_identity):
    try:
        current = os.stat(target_name, dir_fd=parent_fd, follow_symlinks=False)
        if (stat.S_ISDIR(current.st_mode) and current.st_dev == root_identity.st_dev
                and current.st_ino == root_identity.st_ino):
            remove_directory_contents(root_fd)
            current = os.stat(target_name, dir_fd=parent_fd, follow_symlinks=False)
            if (stat.S_ISDIR(current.st_mode) and current.st_dev == root_identity.st_dev
                    and current.st_ino == root_identity.st_ino):
                os.rmdir(target_name, dir_fd=parent_fd)
                os.fsync(parent_fd)
    except OSError:
        pass

def main(archive_path, target_path):
    archive_path = Path(archive_path)
    target = Path(os.path.abspath(str(target_path)))
    target_name = target.name
    if target_name in ("", ".", ".."):
        fail("invalid restore target name")
    if not hasattr(os, "O_NOFOLLOW"):
        fail("safe archive open unavailable")
    require_dirfd_support()
    target_parent_fd = open_absolute_directory(target.parent)
    try:
        parent_mode = os.fstat(target_parent_fd).st_mode
        if (parent_mode & 0o022) and not (parent_mode & 0o1000):
            fail("restore parent directory has unsafe permissions")
        try:
            os.stat(target_name, dir_fd=target_parent_fd, follow_symlinks=False)
            fail("restore target must not already exist")
        except FileNotFoundError:
            pass
    except Exception:
        os.close(target_parent_fd)
        raise

    fd = None
    try:
        fd = os.open(str(archive_path), os.O_RDONLY | os.O_NOFOLLOW)
        archive_stat = os.fstat(fd)
        if not stat.S_ISREG(archive_stat.st_mode):
            fail("archive must be a regular file")
        if archive_stat.st_size > MAX_ARCHIVE_BYTES:
            fail("archive compressed-size limit exceeded")
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

                os.mkdir(target_name, mode=0o700, dir_fd=target_parent_fd)
                os.fsync(target_parent_fd)
                root_fd = os.open(target_name, _DIR_FLAGS, dir_fd=target_parent_fd)
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
                        cleanup_owned_target_at(target_parent_fd, target_name, root_fd, root_identity)
                        raise
                finally:
                    os.close(root_fd)
        finally:
            raw.close()
    finally:
        if fd is not None:
            os.close(fd)
        os.close(target_parent_fd)
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
