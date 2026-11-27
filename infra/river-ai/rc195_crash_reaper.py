"""RC-195 crash reaper: recovers abandoned task records with bounded attempts."""
import sqlite3,time,uuid
class CrashReaper:
 def __init__(self,path=":memory:",clock=time.time):
  self.clock=clock;self.db=sqlite3.connect(path,isolation_level=None)
  self.db.execute("""CREATE TABLE IF NOT EXISTS reaper_tasks(
   id TEXT PRIMARY KEY, payload TEXT, state TEXT NOT NULL, owner TEXT,
   lease_until REAL, attempts INTEGER NOT NULL, max_attempts INTEGER NOT NULL,
   updated REAL NOT NULL, error TEXT)""")
 def submit(self,payload=None,max_attempts=4):
  if max_attempts<1:raise ValueError("max_attempts must be >=1")
  i=str(uuid.uuid4());n=self.clock()
  self.db.execute("INSERT INTO reaper_tasks VALUES(?,?,?,?,?,?,?,?,?)",(i,payload,"queued",None,None,0,max_attempts,n,None));return i
 def claim(self,i,owner,lease_seconds):
  if not owner or lease_seconds<=0:raise ValueError("owner and positive lease required")
  n=self.clock();cur=self.db.execute("UPDATE reaper_tasks SET state='running',owner=?,lease_until=?,updated=? WHERE id=? AND state='queued'",(owner,n+lease_seconds,n,i));return cur.rowcount==1
 def heartbeat(self,i,owner,lease_seconds):
  if lease_seconds<=0:raise ValueError("positive lease required")
  n=self.clock();cur=self.db.execute("UPDATE reaper_tasks SET lease_until=?,updated=? WHERE id=? AND state='running' AND owner=? AND lease_until>?",(n+lease_seconds,n,i,owner,n));return cur.rowcount==1
 def complete(self,i,owner):
  n=self.clock();cur=self.db.execute("UPDATE reaper_tasks SET state='completed',owner=NULL,lease_until=NULL,updated=? WHERE id=? AND state='running' AND owner=? AND lease_until>?",(n,i,owner,n));return cur.rowcount==1
 def reap(self):
  n=self.clock();self.db.execute("BEGIN IMMEDIATE")
  try:
   rows=self.db.execute("SELECT id,attempts,max_attempts FROM reaper_tasks WHERE state='running' AND lease_until<=?",(n,)).fetchall();out=[]
   for i,a,m in rows:
    a+=1;state="dead_letter" if a>=m else "queued"
    self.db.execute("UPDATE reaper_tasks SET state=?,owner=NULL,lease_until=NULL,attempts=?,updated=?,error='lease expired; reaped' WHERE id=? AND state='running' AND lease_until<=?",(state,a,n,i,n))
    out.append({"id":i,"state":state,"attempts":a})
   self.db.execute("COMMIT");return out
  except Exception:self.db.execute("ROLLBACK");raise
 def get(self,i):return self.db.execute("SELECT id,payload,state,owner,lease_until,attempts,max_attempts,updated,error FROM reaper_tasks WHERE id=?",(i,)).fetchone()
 def close(self):self.db.close()
