import json
import sqlite3
import tempfile
import unittest
from pathlib import Path
from rc212_memory_recovery import integrity_check, create_verified_backup, restore_verified_backup

def make_db(path):
    with sqlite3.connect(path) as c:
        c.execute("CREATE TABLE nodes (id TEXT PRIMARY KEY, data TEXT)")
        c.execute("CREATE TABLE edges (id TEXT PRIMARY KEY, source TEXT, target TEXT)")
        c.execute("INSERT INTO nodes VALUES ('n1','{}')")
        c.execute("INSERT INTO edges VALUES ('e1','n1','n1')")

class RC212Tests(unittest.TestCase):
    def test_integrity_and_backup(self):
        with tempfile.TemporaryDirectory() as td:
            src=Path(td)/"source.sqlite"; backup=Path(td)/"backup.sqlite"
            make_db(src)
            self.assertTrue(integrity_check(src)["ok"])
            manifest=create_verified_backup(src, backup)
            self.assertEqual(manifest["sha256"], json.loads(backup.with_suffix(".sqlite.manifest.json").read_text())["sha256"])
            self.assertTrue(integrity_check(backup)["ok"])

    def test_restore(self):
        with tempfile.TemporaryDirectory() as td:
            src=Path(td)/"source.sqlite"; backup=Path(td)/"backup.sqlite"; dest=Path(td)/"restore.sqlite"
            make_db(src); create_verified_backup(src, backup)
            result=restore_verified_backup(backup, dest)
            self.assertTrue(result["ok"])
            with sqlite3.connect(dest) as c:
                self.assertEqual(c.execute("SELECT COUNT(*) FROM nodes").fetchone()[0], 1)

    def test_hash_mismatch_refuses_restore(self):
        with tempfile.TemporaryDirectory() as td:
            src=Path(td)/"source.sqlite"; backup=Path(td)/"backup.sqlite"; dest=Path(td)/"restore.sqlite"
            make_db(src); create_verified_backup(src, backup)
            backup.write_bytes(backup.read_bytes()+b"tamper")
            with self.assertRaises(ValueError): restore_verified_backup(backup, dest)
            self.assertFalse(dest.exists())

    def test_missing_db(self):
        with tempfile.TemporaryDirectory() as td:
            self.assertFalse(integrity_check(Path(td)/"missing.sqlite")["ok"])

if __name__ == "__main__":
    unittest.main()
