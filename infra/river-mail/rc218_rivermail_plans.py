"""RC218 plan catalog/quota/subscription and sponsorship metadata prototype."""
import sqlite3,json,datetime,uuid
PLANS={
 "free":{"name":"RiverMail Free","sponsorship":True,"quota_bytes":None,"features":["basic mailbox","search","labels"]},
 "plus":{"name":"RiverMail Plus","sponsorship":False,"quota_bytes":None,"features":["no sponsored placements","expanded archive","advanced search","aliases","folders","higher attachment limits"]},
 "business":{"name":"RiverMail Business","sponsorship":False,"quota_bytes":None,"features":["custom domain","team admin","shared mailbox policies"]}
}
SUBS={"free","plus","business","trial","past_due","cancelled"}
class RiverMailPlans:
 def __init__(self,path="rivermail_plans.db"):
  self.path=str(path)
  with self.db() as d:d.executescript("CREATE TABLE IF NOT EXISTS accounts(account_id TEXT PRIMARY KEY,plan TEXT NOT NULL,status TEXT NOT NULL,used_bytes INTEGER NOT NULL DEFAULT 0,updated_at TEXT NOT NULL);CREATE TABLE IF NOT EXISTS campaigns(id TEXT PRIMARY KEY,title TEXT NOT NULL,advertiser TEXT NOT NULL,label TEXT NOT NULL DEFAULT 'Sponsored',active INTEGER NOT NULL DEFAULT 0,created_at TEXT NOT NULL);")
 def db(self):
  d=sqlite3.connect(self.path);d.row_factory=sqlite3.Row;return d
 def create_account(self,account_id,plan="free",status="free"):
  if plan not in PLANS or status not in SUBS:raise ValueError("Invalid plan/status")
  now=datetime.datetime.now(datetime.timezone.utc).isoformat()
  with self.db() as d:d.execute("INSERT INTO accounts(account_id,plan,status,updated_at) VALUES(?,?,?,?)",(account_id,plan,status,now))
 def change_plan(self,account_id,plan,status=None):
  if plan not in PLANS:raise ValueError("Unknown plan")
  now=datetime.datetime.now(datetime.timezone.utc).isoformat()
  with self.db() as d:
   row=d.execute("SELECT status FROM accounts WHERE account_id=?",(account_id,)).fetchone()
   if not row:return False
   d.execute("UPDATE accounts SET plan=?,status=?,updated_at=? WHERE account_id=?",(plan,status or plan,now,account_id));return True
 def record_usage(self,account_id,bytes_delta):
  if bytes_delta<0:raise ValueError("Use a separate deletion adjustment path")
  with self.db() as d:return d.execute("UPDATE accounts SET used_bytes=used_bytes+?,updated_at=? WHERE account_id=?",(bytes_delta,datetime.datetime.now(datetime.timezone.utc).isoformat(),account_id)).rowcount==1
 def account(self,account_id):
  with self.db() as d:
   r=d.execute("SELECT * FROM accounts WHERE account_id=?",(account_id,)).fetchone()
   if not r:return None
   x=dict(r);x["plan_details"]=PLANS[x["plan"]];return x
 def create_campaign(self,title,advertiser,active=False):
  cid=str(uuid.uuid4());now=datetime.datetime.now(datetime.timezone.utc).isoformat()
  with self.db() as d:d.execute("INSERT INTO campaigns(id,title,advertiser,label,active,created_at) VALUES(?,?,?,?,?,?)",(cid,title,advertiser,"Sponsored",int(active),now))
  return cid
 def campaigns(self):
  with self.db() as d:return [dict(r) for r in d.execute("SELECT * FROM campaigns ORDER BY created_at DESC")]
