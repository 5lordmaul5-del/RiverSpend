#!/usr/bin/env python3
"""Deterministic regression for a nested-directory replacement during extraction."""
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


if __name__ == "__main__":
    test_restore_uses_open_directory_descriptors_during_path_replacement()
    print("1/1 directory replacement race test passed")
