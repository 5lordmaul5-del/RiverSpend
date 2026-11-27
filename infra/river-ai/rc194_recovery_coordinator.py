"""RC-194 bounded retry/recovery coordinator with SQLite dead-letter tracking."""
import sqlite3,time,uuid,random
class RecoveryCoordinator:
 def __init__(self,path=":memory:",clock=time.time,random_fn=random.random):
  self.clock,self.random_fn=clock,random_fn
  self.db=sqlite3.connect(path,isolation_level=None)
  self.db.execute("""CREATE TABLE IF NOT EXISTS recovery_jobs(
   id TEXT PRIMARY KEY, task_key TEXT NOT NULL, payload TEXT, state TEXT NOT NULL,
   attempts INTEGER NOT NULL, due REAL NOT NULL, max_attempts INTEGER NOT NULL,
   last_error TEXT, created REAL NOT NULL)""")
 def enqueue(self,task_key,payload=None,max_attempts=5,delay=0):
  if not task_key or max_attempts<1 or delay<0: raise ValueError("invalid job parameters")
  jid=str(uuid.uuid4()); now=self.clock()
  self.db.execute("INSERT INTO recovery_jobs VALUES(?,?,?,?,?,?,?,?,?)",
   (jid,task_key,payload,"queued",0,now+delay,max_attempts,None,now));return jid
 def fail(self,jid,error,base_delay=1,max_delay=300,jitter=0.2):
  if base_delay<0 or max_delay<0 or not 0<=jitter<=1: raise ValueError("invalid retry policy")
  self.db.execute("BEGIN IMMEDIATE")
  try:
   row=self.db.execute("SELECT attempts,max_attempts,state FROM recovery_jobs WHERE id=?",(jid,)).fetchone()
   if not row or row[2] not in ("queued","running"): self.db.execute("ROLLBACK");return False
   attempts=row[0]+1
   if attempts>=row[1]:
    self.db.execute("UPDATE recovery_jobs SET attempts=?,state='dead_letter',last_error=? WHERE id=?",(attempts,str(error),jid))
   else:
    delay=min(max_delay,base_delay*(2**max(0,attempts-1)))
    delay*=1+jitter*(2*self.random_fn()-1)
    self.db.execute("UPDATE recovery_jobs SET attempts=?,state='queued',due=?,last_error=? WHERE id=?",(attempts,self.clock()+max(0,delay),str(error),jid))
   self.db.execute("COMMIT");return True
  except Exception:
   self.db.execute("ROLLBACK");raise
 def due(self,limit=100):
  if limit<1:raise ValueError("limit must be positive")
  return self.db.execute("SELECT id,task_key,payload,attempts,due,max_attempts,last_error FROM recovery_jobs WHERE state='queued' AND due<=? ORDER BY due LIMIT ?",(self.clock(),limit)).fetchall()
 def claim(self,jid):
  cur=self.db.execute("UPDATE recovery_jobs SET state='running' WHERE id=? AND state='queued' AND due<=?",(jid,self.clock()));return cur.rowcount==1
 def succeed(self,jid):
  cur=self.db.execute("UPDATE recovery_jobs SET state='completed' WHERE id=? AND state='running'",(jid,));return cur.rowcount==1
 def dead_letters(self,limit=100):
  return self.db.execute("SELECT id,task_key,payload,attempts,last_error,created FROM recovery_jobs WHERE state='dead_letter' ORDER BY created LIMIT ?",(limit,)).fetchall()
 def get(self,jid):return self.db.execute("SELECT id,task_key,payload,state,attempts,due,max_attempts,last_error FROM recovery_jobs WHERE id=?",(jid,)).fetchone()
 def close(self):self.db.close()
