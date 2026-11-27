"""RC219 local mailbox storage/archive prototype. SQLite-backed; no mail transport."""
import sqlite3,datetime,uuid
DEFAULT_QUOTAS={"free":100*1024*1024,"plus":5*1024*1024*1024,"business":20*1024*1024*1024}
class RiverMailStorage:
 def __init__(self,path="rivermail_storage.db",quotas=None):
  self.path=str(path);self.quotas=dict(DEFAULT_QUOTAS);self.quotas.update(quotas or {})
  with self.db() as d:
   d.executescript("""
   CREATE TABLE IF NOT EXISTS accounts(account_id TEXT PRIMARY KEY,plan TEXT NOT NULL);
   CREATE TABLE IF NOT EXISTS messages(id TEXT PRIMARY KEY,account_id TEXT NOT NULL,subject TEXT NOT NULL,body TEXT NOT NULL,folder TEXT NOT NULL DEFAULT 'inbox',archived INTEGER NOT NULL DEFAULT 0,deleted_at TEXT,created_at TEXT NOT NULL);
   CREATE TABLE IF NOT EXISTS attachments(id TEXT PRIMARY KEY,message_id TEXT NOT NULL,account_id TEXT NOT NULL,name TEXT NOT NULL,mime TEXT NOT NULL,size INTEGER NOT NULL,data BLOB NOT NULL);
   CREATE TABLE IF NOT EXISTS folders(account_id TEXT NOT NULL,name TEXT NOT NULL,PRIMARY KEY(account_id,name));
   """)
 def db(self):
  d=sqlite3.connect(self.path);d.row_factory=sqlite3.Row;return d
 def _now(self):return datetime.datetime.now(datetime.timezone.utc).isoformat()
 def create_account(self,account,plan="free"):
  if plan not in self.quotas:raise ValueError("Unknown plan")
  with self.db() as d:d.execute("INSERT OR REPLACE INTO accounts(account_id,plan) VALUES(?,?)",(account,plan))
 def _account(self,d,account):
  r=d.execute("SELECT plan FROM accounts WHERE account_id=?",(account,)).fetchone()
  if not r:raise ValueError("Account not found")
  return r["plan"]
 def quota(self,account):
  with self.db() as d:
   plan=self._account(d,account);used=d.execute("SELECT COALESCE(SUM(size),0) n FROM attachments WHERE account_id=?",(account,)).fetchone()["n"]
   # Stored message body usage included in quota too.
   body=d.execute("SELECT COALESCE(SUM(length(CAST(body AS BLOB))),0) n FROM messages WHERE account_id=? AND deleted_at IS NULL",(account,)).fetchone()["n"]
   used+=body
   limit=self.quotas[plan];return {"account_id":account,"plan":plan,"used_bytes":used,"quota_bytes":limit,"remaining_bytes":max(0,limit-used),"percent":round(100*used/limit,2) if limit else None}
 def add_message(self,account,subject,body,folder="inbox"):
  with self.db() as d:
   self._account(d,account);mid=str(uuid.uuid4());d.execute("INSERT INTO messages(id,account_id,subject,body,folder,created_at) VALUES(?,?,?,?,?,?)",(mid,account,subject,body,folder,self._now()));return mid
 def _check_capacity(self,account,extra):
  q=self.quota(account)
  if q["used_bytes"]+extra>q["quota_bytes"]:raise ValueError("Storage quota exceeded")
 def add_attachment(self,account,message_id,name,mime,data):
  if not isinstance(data,(bytes,bytearray)):raise TypeError("Attachment data must be bytes")
  with self.db() as d:
   row=d.execute("SELECT id FROM messages WHERE id=? AND account_id=? AND deleted_at IS NULL",(message_id,account)).fetchone()
   if not row:raise ValueError("Message not found")
  self._check_capacity(account,len(data))
  aid=str(uuid.uuid4())
  with self.db() as d:d.execute("INSERT INTO attachments(id,message_id,account_id,name,mime,size,data) VALUES(?,?,?,?,?,?,?)",(aid,message_id,account,name,mime,len(data),bytes(data)))
  return aid
 def create_folder(self,account,name):
  name=name.strip()
  if not name or name.lower() in {"inbox","archive","trash"}:raise ValueError("Invalid or reserved folder")
  with self.db() as d:self._account(d,account);d.execute("INSERT OR IGNORE INTO folders(account_id,name) VALUES(?,?)",(account,name))
  return name
 def folders(self,account):
  with self.db() as d:
   self._account(d,account);custom=[r["name"] for r in d.execute("SELECT name FROM folders WHERE account_id=? ORDER BY name",(account,))]
   return ["inbox","archive","trash"]+custom
 def archive(self,account,message_id):
  with self.db() as d:return d.execute("UPDATE messages SET archived=1,folder='archive' WHERE id=? AND account_id=? AND deleted_at IS NULL",(message_id,account)).rowcount==1
 def move(self,account,message_id,folder):
  if folder not in self.folders(account):raise ValueError("Folder does not exist")
  with self.db() as d:return d.execute("UPDATE messages SET folder=?,archived=? WHERE id=? AND account_id=? AND deleted_at IS NULL",(folder,int(folder=="archive"),message_id,account)).rowcount==1
 def trash(self,account,message_id):
  with self.db() as d:return d.execute("UPDATE messages SET folder='trash',deleted_at=? WHERE id=? AND account_id=? AND deleted_at IS NULL",(self._now(),message_id,account)).rowcount==1
 def restore(self,account,message_id,folder="inbox"):
  if folder not in self.folders(account) or folder=="trash":raise ValueError("Invalid restore destination")
  with self.db() as d:return d.execute("UPDATE messages SET folder=?,deleted_at=NULL,archived=? WHERE id=? AND account_id=? AND deleted_at IS NOT NULL",(folder,int(folder=="archive"),message_id,account)).rowcount==1
 def purge(self,account,message_id):
  with self.db() as d:
   d.execute("DELETE FROM attachments WHERE account_id=? AND message_id=?",(account,message_id))
   return d.execute("DELETE FROM messages WHERE account_id=? AND id=? AND folder='trash' AND deleted_at IS NOT NULL",(account,message_id)).rowcount==1
 def list_messages(self,account,folder="inbox"):
  with self.db() as d:return [dict(r) for r in d.execute("SELECT id,subject,folder,archived,deleted_at,created_at FROM messages WHERE account_id=? AND folder=? ORDER BY created_at DESC",(account,folder))]
 def attachments(self,account,message_id):
  with self.db() as d:return [dict(r) for r in d.execute("SELECT id,name,mime,size FROM attachments WHERE account_id=? AND message_id=?",(account,message_id))]
