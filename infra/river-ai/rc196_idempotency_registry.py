"""Owner-scoped local idempotency registry (prototype; not an external side-effect transaction)."""
import hashlib
import sqlite3
import time

MAX_OWNER_LENGTH = 128
MAX_KEY_LENGTH = 128
MAX_PAYLOAD_BYTES = 65536
MAX_VALUE_BYTES = 8192

class IdempotencyRegistry:
    def __init__(self, path=":memory:", clock=time.time):
        self.clock = clock
        self.db = sqlite3.connect(path, isolation_level=None, timeout=5)
        self.db.execute("PRAGMA busy_timeout=5000")
        self._migrate()

    def _migrate(self):
        self.db.execute("BEGIN IMMEDIATE")
        try:
            row = self.db.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='idempotency'").fetchone()
            if not row:
                self._create_table("idempotency")
            else:
                columns = {r[1] for r in self.db.execute("PRAGMA table_info(idempotency)")}
                if "owner" not in columns:
                    self._create_table("idempotency_v2")
                    legacy = self.db.execute("SELECT key,payload_hash,state,created,updated,result,error FROM idempotency").fetchall()
                    self.db.executemany("INSERT INTO idempotency_v2(owner,key,payload_hash,state,created,updated,result,error) VALUES(?,?,?,?,?,?,?,?)", [("__legacy_migration__", *item) for item in legacy])
                    self.db.execute("DROP TABLE idempotency")
                    self.db.execute("ALTER TABLE idempotency_v2 RENAME TO idempotency")
            self.db.execute("COMMIT")
        except Exception:
            self.db.execute("ROLLBACK")
            raise

    def _create_table(self, name):
        if name not in ("idempotency", "idempotency_v2"):
            raise ValueError("invalid table name")
        self.db.execute(f"""CREATE TABLE {name}(
            owner TEXT NOT NULL, key TEXT NOT NULL, payload_hash TEXT NOT NULL,
            state TEXT NOT NULL, created REAL NOT NULL, updated REAL NOT NULL,
            result TEXT, error TEXT, PRIMARY KEY(owner,key))""")

    @staticmethod
    def digest(payload):
        if type(payload) is str:
            payload = payload.encode("utf-8")
        elif type(payload) is not bytes:
            raise ValueError("payload must be str or bytes")
        if len(payload) > MAX_PAYLOAD_BYTES:
            raise ValueError("payload too large")
        return hashlib.sha256(payload).hexdigest()

    @staticmethod
    def _validate(owner, key):
        if type(owner) is not str or not owner.strip() or len(owner) > MAX_OWNER_LENGTH or owner == "__legacy_migration__":
            raise ValueError("invalid owner")
        if type(key) is not str or not key.strip() or len(key) > MAX_KEY_LENGTH:
            raise ValueError("invalid idempotency key")

    def begin(self, owner, key, payload):
        self._validate(owner, key)
        h = self.digest(payload)
        n = self.clock()
        self.db.execute("BEGIN IMMEDIATE")
        try:
            row = self.db.execute("SELECT payload_hash,state,result,error FROM idempotency WHERE owner=? AND key=?", (owner,key)).fetchone()
            if row:
                if row[0] != h:
                    self.db.execute("ROLLBACK")
                    return {"status":"conflict","reason":"key reused with different payload"}
                self.db.execute("COMMIT")
                return {"status":"duplicate","state":row[1],"result":row[2],"error":row[3]}
            self.db.execute("INSERT INTO idempotency(owner,key,payload_hash,state,created,updated,result,error) VALUES(?,?,?,?,?,?,?,?)", (owner,key,h,"processing",n,n,None,None))
            self.db.execute("COMMIT")
            return {"status":"accepted","key":key}
        except Exception:
            self.db.execute("ROLLBACK")
            raise

    def complete(self, owner, key, result):
        self._validate(owner,key)
        if type(result) is not str or len(result.encode("utf-8")) > MAX_VALUE_BYTES:
            raise ValueError("result too large or invalid")
        n = self.clock()
        cur = self.db.execute("UPDATE idempotency SET state='completed',result=?,error=NULL,updated=? WHERE owner=? AND key=? AND state='processing'", (result,n,owner,key))
        return cur.rowcount == 1

    def fail(self, owner, key, error):
        self._validate(owner,key)
        if type(error) is not str or len(error.encode("utf-8")) > MAX_VALUE_BYTES:
            raise ValueError("error too large or invalid")
        n = self.clock()
        cur = self.db.execute("UPDATE idempotency SET state='failed',error=?,updated=? WHERE owner=? AND key=? AND state='processing'", (error,n,owner,key))
        return cur.rowcount == 1

    def get(self, owner, key):
        self._validate(owner,key)
        return self.db.execute("SELECT owner,key,payload_hash,state,created,updated,result,error FROM idempotency WHERE owner=? AND key=?", (owner,key)).fetchone()

    def close(self):
        self.db.close()
