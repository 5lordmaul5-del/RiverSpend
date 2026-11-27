"""RC-193 local execution supervisor prototype: heartbeat, timeout and recovery decisions."""
import sqlite3,time,uuid
class ExecutionSupervisor:
 def __init__(self,path=":memory:",clock=time.time):
  self.clock=clock; self.db=sqlite3.connect(path,isolation_level=None)
  self.db.execute("""CREATE TABLE IF NOT EXISTS executions(
   id TEXT PRIMARY KEY, owner TEXT NOT NULL, state TEXT NOT NULL,
   heartbeat REAL NOT NULL, deadline REAL NOT NULL, detail TEXT)""")
 def start(self,owner,timeout):
  if not owner or timeout<=0: raise ValueError("owner and positive timeout required")
  now=self.clock(); eid=str(uuid.uuid4())
  self.db.execute("INSERT INTO executions VALUES(?,?,?,?,?,?)",(eid,owner,"running",now,now+timeout,None));return eid
 def heartbeat(self,eid,owner):
  now=self.clock();cur=self.db.execute("UPDATE executions SET heartbeat=? WHERE id=? AND owner=? AND state='running' AND deadline>?",(now,eid,owner,now))
  return cur.rowcount==1
 def finish(self,eid,owner,detail=None):
  cur=self.db.execute("UPDATE executions SET state='completed',detail=? WHERE id=? AND owner=? AND state='running' AND deadline>?",(detail,eid,owner,self.clock()));return cur.rowcount==1
 def stop(self,eid,reason="manual stop"):
  cur=self.db.execute("UPDATE executions SET state='stopped',detail=? WHERE id=? AND state='running'",(reason,eid));return cur.rowcount==1
 def scan(self):
  now=self.clock(); rows=self.db.execute("SELECT id,owner,state,heartbeat,deadline FROM executions WHERE state='running'").fetchall();out=[]
  for eid,owner,state,hb,deadline in rows:
   if deadline<=now:
    self.db.execute("UPDATE executions SET state='expired',detail='deadline elapsed' WHERE id=? AND state='running'",(eid,));out.append({"id":eid,"owner":owner,"action":"expired"})
   elif now-hb>min(30,deadline-now):
    out.append({"id":eid,"owner":owner,"action":"heartbeat_missing"})
   else: out.append({"id":eid,"owner":owner,"action":"healthy"})
  return out
 def get(self,eid): return self.db.execute("SELECT id,owner,state,heartbeat,deadline,detail FROM executions WHERE id=?",(eid,)).fetchone()
 def close(self): self.db.close()
