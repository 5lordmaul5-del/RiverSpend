"""RC-196 local idempotency registry prototype for duplicate/replay detection."""
import sqlite3,time,hashlib
class IdempotencyRegistry:
 def __init__(self,path=":memory:",clock=time.time):
  self.clock=clock;self.db=sqlite3.connect(path,isolation_level=None)
  self.db.execute("""CREATE TABLE IF NOT EXISTS idempotency(
   key TEXT PRIMARY KEY, payload_hash TEXT NOT NULL,state TEXT NOT NULL,
   created REAL NOT NULL,updated REAL NOT NULL,result TEXT,error TEXT)""")
 @staticmethod
 def digest(payload):
  if not isinstance(payload,bytes):payload=str(payload).encode("utf-8")
  return hashlib.sha256(payload).hexdigest()
 def begin(self,key,payload):
  if not key:raise ValueError("idempotency key required")
  h=self.digest(payload);n=self.clock()
  self.db.execute("BEGIN IMMEDIATE")
  try:
   row=self.db.execute("SELECT payload_hash,state,result,error FROM idempotency WHERE key=?",(key,)).fetchone()
   if row:
    if row[0]!=h:self.db.execute("ROLLBACK");return {"status":"conflict","reason":"key reused with different payload"}
    self.db.execute("COMMIT")
    return {"status":"duplicate","state":row[1],"result":row[2],"error":row[3]}
   self.db.execute("INSERT INTO idempotency VALUES(?,?,?,?,?,?,?)",(key,h,"processing",n,n,None,None))
   self.db.execute("COMMIT");return {"status":"accepted","key":key}
  except Exception:self.db.execute("ROLLBACK");raise
 def complete(self,key,result):
  n=self.clock();cur=self.db.execute("UPDATE idempotency SET state='completed',result=?,error=NULL,updated=? WHERE key=? AND state='processing'",(str(result),n,key));return cur.rowcount==1
 def fail(self,key,error):
  n=self.clock();cur=self.db.execute("UPDATE idempotency SET state='failed',error=?,updated=? WHERE key=? AND state='processing'",(str(error),n,key));return cur.rowcount==1
 def get(self,key):return self.db.execute("SELECT key,payload_hash,state,created,updated,result,error FROM idempotency WHERE key=?",(key,)).fetchone()
 def close(self):self.db.close()
