#!/usr/bin/env python3
"""Deterministic regressions for nested and parent-directory replacement during extraction."""
import hashlib
import importlib.util
import os
import tempfile
import tarfile
from io import BytesIO
from pathlib import Path

SCRIPT = Path(__file__).with_name("restore-safe.py")
spec = importlib.util.spec_from_file_location("restore_safe", SCRIPT)
restore_safe = importlib.util.module_from_spec(spec)
spec.loader.exec_module(restore_safe)


def make_archive(path):
    with tarfile.open(path, "w:gz") as archive:
        directory = tarfile.TarInfo("nested/")
        directory.type = tarfile.DIRTYPE
        archive.addfile(directory)
        for name, data in (("nested/first.txt", b"first"), ("nested/second.txt", b"second")):
            item = tarfile.TarInfo(name)
            item.size = len(data)
            archive.addfile(item, BytesIO(data))


def test_restore_uses_open_directory_descriptors_during_path_replacement():
    with tempfile.TemporaryDirectory(prefix="rc32-") as temp:
        root = Path(temp)
        archive = root / "archive.tar.gz"
        target = root / "restored"
        outside = root / "outside"
        outside.mkdir()
        (outside / "marker").write_text("outside-safe", encoding="utf-8")
        make_archive(archive)

        original_open = os.open
        injected = False

        def replace_nested_before_second_open(name, flags, *args, **kwargs):
            nonlocal injected
            if not injected and (
                (name == "second.txt" and kwargs.get("dir_fd") is not None)
                or str(name).endswith("/nested/second.txt")
            ):
                injected = True
                nested = target / "nested"
                moved = target / "nested-moved"
                os.rename(nested, moved)
                os.symlink(outside, nested)
            return original_open(name, flags, *args, **kwargs)

        os.supports_dir_fd.add(replace_nested_before_second_open)
        os.open = replace_nested_before_second_open
        try:
            restore_safe.main(str(archive), str(target))
        finally:
            os.open = original_open
            os.supports_dir_fd.discard(replace_nested_before_second_open)

        assert injected, "path-replacement hook did not fire"
        assert (outside / "marker").read_text(encoding="utf-8") == "outside-safe"
        assert not (outside / "second.txt").exists(), "restore wrote through the replaced symlink"
        assert (target / "nested-moved" / "second.txt").read_text(encoding="utf-8") == "second"
        assert (target / "nested-moved" / "first.txt").read_text(encoding="utf-8") == "first"


def test_restore_parent_path_replacement_uses_open_parent_descriptor():
    with tempfile.TemporaryDirectory(prefix="rc61-") as temp:
        root = Path(temp)
        parent = root / "restore-parent"
        moved = root / "restore-parent-moved"
        outside = root / "outside"
        parent.mkdir()
        outside.mkdir()
        (outside / "marker").write_text("outside-safe", encoding="utf-8")
        archive = root / "archive.tar.gz"
        make_archive(archive)
        target = parent / "restored"

        original_open = os.open
        injected = False

        def replace_parent_before_target_open(name, flags, *args, **kwargs):
            nonlocal injected
            is_target_open = (str(name) == str(target)) or (name == target.name and kwargs.get("dir_fd") is not None)
            if not injected and is_target_open and flags & getattr(os, "O_DIRECTORY", 0):
                injected = True
                os.rename(parent, moved)
                os.symlink(outside, parent)
            return original_open(name, flags, *args, **kwargs)

        os.supports_dir_fd.add(replace_parent_before_target_open)
        os.open = replace_parent_before_target_open
        try:
            restore_safe.main(str(archive), str(target))
        finally:
            os.open = original_open
            os.supports_dir_fd.discard(replace_parent_before_target_open)

        assert injected, "target-root replacement hook did not fire"
        assert (outside / "marker").read_text(encoding="utf-8") == "outside-safe"
        assert not (outside / "restored").exists(), "restore created target through the replaced parent symlink"
        assert (moved / "restored" / "nested" / "second.txt").read_text(encoding="utf-8") == "second"
        assert (moved / "restored" / "nested" / "first.txt").read_text(encoding="utf-8") == "first"





def test_restore_rejects_symlinked_parent_path():
    with tempfile.TemporaryDirectory(prefix="rc61-parent-symlink-") as temp:
        root = Path(temp)
        real_parent = root / "real-parent"
        alias_parent = root / "alias-parent"
        real_parent.mkdir()
        outside = root / "outside"
        outside.mkdir()
        archive = root / "archive.tar.gz"
        make_archive(archive)
        os.symlink(real_parent, alias_parent)
        target = alias_parent / "restored"
        try:
            restore_safe.main(str(archive), str(target))
        except OSError:
            pass
        else:
            raise AssertionError("restore accepted a symlinked target-parent component")
        assert not (real_parent / "restored").exists()

def write_checksum(archive, sidecar):
    digest = hashlib.sha256(archive.read_bytes()).hexdigest()
    sidecar.write_text(f"{digest}  {archive.name}\n", encoding="ascii")


def test_restore_rejects_archive_mismatch_with_checksum_sidecar():
    with tempfile.TemporaryDirectory(prefix="rc140-checksum-") as temp:
        root = Path(temp)
        archive = root / "archive.tar.gz"
        sidecar = root / "archive.tar.gz.sha256"
        target = root / "restored"
        make_archive(archive)
        write_checksum(archive, sidecar)
        archive.write_bytes(b"tampered archive bytes")
        try:
            restore_safe.main(str(archive), str(target), str(sidecar))
        except ValueError as exc:
            assert "checksum verification failed" in str(exc)
        else:
            raise AssertionError("restore accepted archive bytes that do not match the sidecar")
        assert not target.exists()


def test_restore_checksum_is_bound_to_open_archive_descriptor():
    with tempfile.TemporaryDirectory(prefix="rc140-fd-bound-") as temp:
        root = Path(temp)
        archive = root / "archive.tar.gz"
        sidecar = root / "archive.tar.gz.sha256"
        target = root / "restored"
        moved = root / "original-archive.tar.gz"
        make_archive(archive)
        write_checksum(archive, sidecar)
        original_open = os.open
        injected = False

        def replace_archive_after_open(name, flags, *args, **kwargs):
            nonlocal injected
            fd = original_open(name, flags, *args, **kwargs)
            if not injected and name == str(archive) and kwargs.get("dir_fd") is None:
                injected = True
                os.rename(archive, moved)
                archive.write_bytes(b"replacement bytes")
            return fd

        os.supports_dir_fd.add(replace_archive_after_open)
        os.open = replace_archive_after_open
        try:
            restore_safe.main(str(archive), str(target), str(sidecar))
        finally:
            os.open = original_open
            os.supports_dir_fd.discard(replace_archive_after_open)

        assert injected, "archive replacement hook did not fire"
        assert (target / "nested" / "first.txt").read_text(encoding="utf-8") == "first"
        assert (target / "nested" / "second.txt").read_text(encoding="utf-8") == "second"


if __name__ == "__main__":
    test_restore_uses_open_directory_descriptors_during_path_replacement()
    test_restore_parent_path_replacement_uses_open_parent_descriptor()
    test_restore_rejects_symlinked_parent_path()
    test_restore_rejects_archive_mismatch_with_checksum_sidecar()
    test_restore_checksum_is_bound_to_open_archive_descriptor()
    print("5/5 restore safety tests passed")
