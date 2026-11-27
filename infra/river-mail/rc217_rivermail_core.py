"""RC217 RiverMail prototype: SQLite mailbox and integration bridge. No real mail transport."""
import sqlite3,json,uuid,datetime
class RiverMailCore:
 def __init__(self,db_path="rivermail.db"):
  self.db_path=str(db_path)
  with self.db() as d:
   d.executescript("CREATE TABLE IF NOT EXISTS messages(id TEXT PRIMARY KEY,account TEXT,sender TEXT,recipient TEXT,subject TEXT,body TEXT,created_at TEXT,read INTEGER DEFAULT 0,source_app TEXT,source_ref TEXT,labels TEXT DEFAULT '[]'); CREATE TABLE IF NOT EXISTS events(id TEXT PRIMARY KEY,event_type TEXT,payload TEXT,created_at TEXT,processed INTEGER DEFAULT 0);")
 def db(self):
  d=sqlite3.connect(self.db_path);d.row_factory=sqlite3.Row;return d
 def receive_demo(self,account,sender,recipient,subject,body,source_app=None,source_ref=None,labels=None):
  mid=str(uuid.uuid4());now=datetime.datetime.now(datetime.timezone.utc).isoformat()
  with self.db() as d:d.execute("INSERT INTO messages(id,account,sender,recipient,subject,body,created_at,source_app,source_ref,labels) VALUES(?,?,?,?,?,?,?,?,?,?)",(mid,account,sender,recipient,subject,body,now,source_app,source_ref,json.dumps(labels or [])))
  return mid
 def list_messages(self,account):
  with self.db() as d:return [dict(r) for r in d.execute("SELECT * FROM messages WHERE account=? ORDER BY created_at DESC",(account,))]
 def mark_read(self,mid,read=True):
  with self.db() as d:return d.execute("UPDATE messages SET read=? WHERE id=?",(int(read),mid)).rowcount==1
 def search(self,account,q):
  q="%"+q+"%"
  with self.db() as d:return [dict(r) for r in d.execute("SELECT * FROM messages WHERE account=? AND (sender LIKE ? OR subject LIKE ? OR body LIKE ?) ORDER BY created_at DESC",(account,q,q,q))]
 def emit_event(self,typ,payload):
  eid=str(uuid.uuid4());now=datetime.datetime.now(datetime.timezone.utc).isoformat()
  with self.db() as d:d.execute("INSERT INTO events(id,event_type,payload,created_at) VALUES(?,?,?,?)",(eid,typ,json.dumps(payload),now))
  return eid
 def pending_events(self):
  with self.db() as d:return [dict(r) for r in d.execute("SELECT * FROM events WHERE processed=0 ORDER BY created_at")]
 def mark_event_processed(self,eid):
  with self.db() as d:return d.execute("UPDATE events SET processed=1 WHERE id=?",(eid,)).rowcount==1
 def integration_notification(self,app,event,account,subject,body,reference=None):
  if app not in {"RiverSpendShop","RiverSpaceSignals","RiverSSAI"}:raise ValueError("Unsupported integration")
  return self.receive_demo(account,app+" <notifications@river.local>",account,subject,body,app,reference,[app,event])
