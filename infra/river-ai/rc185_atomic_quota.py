"""RC-185: atomic monthly token quota reservations over RC-184 SQLite ledger."""
import sqlite3
from rc184_usage_ledger import UsageLedger
RESERVATIONS = """CREATE TABLE IF NOT EXISTS quota_reservations (reservation_id TEXT PRIMARY KEY,user_id TEXT NOT NULL,period_key TEXT NOT NULL,plan_key TEXT NOT NULL,tokens INTEGER NOT NULL CHECK(tokens > 0),state TEXT NOT NULL CHECK(state IN ('reserved','committed','released')),request_id TEXT UNIQUE,created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))); CREATE INDEX IF NOT EXISTS quota_res_user_period_state ON quota_reservations(user_id,period_key,state);"""
class QuotaReservationError(ValueError): pass
class AtomicQuota:
 def __init__(self,database_path):
  self.database_path=str(database_path); UsageLedger(database_path)
  db=self._connect(); db.executescript(RESERVATIONS); db.close()
 def _connect(self):
  db=sqlite3.connect(self.database_path,timeout=10); db.execute("PRAGMA busy_timeout=10000"); db.execute("PRAGMA foreign_keys=ON"); return db
 def reserve(self,reservation_id,user_id,plan_key,period_key,tokens,monthly_limit):
  if not all(isinstance(v,str) and v.strip() for v in (reservation_id,user_id,plan_key,period_key)): raise QuotaReservationError("identity and IDs must be non-empty strings")
  if any(isinstance(v,bool) or not isinstance(v,int) for v in (tokens,monthly_limit)) or tokens<=0 or monthly_limit<0: raise QuotaReservationError("token values invalid")
  db=self._connect()
  try:
   db.execute("BEGIN IMMEDIATE")
   ex=db.execute("SELECT user_id,period_key,tokens,state FROM quota_reservations WHERE reservation_id=?",(reservation_id,)).fetchone()
   if ex:
    if ex==(user_id,period_key,tokens,"reserved"): db.commit(); return True
    raise QuotaReservationError("reservation ID exists or not reusable")
   used=db.execute("SELECT COALESCE(SUM(tokens),0) FROM usage_events WHERE user_id=? AND period_key=?",(user_id,period_key)).fetchone()[0]
   held=db.execute("SELECT COALESCE(SUM(tokens),0) FROM quota_reservations WHERE user_id=? AND period_key=? AND state='reserved'",(user_id,period_key)).fetchone()[0]
   if used+held+tokens>monthly_limit: db.rollback(); return False
   db.execute("INSERT INTO quota_reservations(reservation_id,user_id,period_key,plan_key,tokens,state) VALUES(?,?,?,?,?,'reserved')",(reservation_id,user_id,period_key,plan_key,tokens)); db.commit(); return True
  except Exception: db.rollback(); raise
  finally: db.close()
 def commit(self,reservation_id,request_id,actual_tokens=None):
  if not all(isinstance(v,str) and v.strip() for v in (reservation_id,request_id)): raise QuotaReservationError("IDs required")
  if actual_tokens is not None and (isinstance(actual_tokens,bool) or not isinstance(actual_tokens,int) or actual_tokens<0): raise QuotaReservationError("actual_tokens invalid")
  db=self._connect()
  try:
   db.execute("BEGIN IMMEDIATE"); row=db.execute("SELECT user_id,plan_key,period_key,tokens,state FROM quota_reservations WHERE reservation_id=?",(reservation_id,)).fetchone()
   if not row: raise QuotaReservationError("reservation not found")
   user,plan,period,held,state=row
   if state!="reserved": raise QuotaReservationError("reservation is not active")
   amount=held if actual_tokens is None else actual_tokens
   db.execute("INSERT INTO usage_events(user_id,plan_key,period_key,request_id,tokens) VALUES(?,?,?,?,?)",(user,plan,period,request_id,amount))
   db.execute("UPDATE quota_reservations SET state='committed',request_id=? WHERE reservation_id=?",(request_id,reservation_id)); db.commit()
  except sqlite3.IntegrityError: db.rollback(); raise QuotaReservationError("request ID already recorded") from None
  except Exception: db.rollback(); raise
  finally: db.close()
 def release(self,reservation_id):
  db=self._connect()
  try:
   db.execute("BEGIN IMMEDIATE"); row=db.execute("SELECT state FROM quota_reservations WHERE reservation_id=?",(reservation_id,)).fetchone()
   if not row: raise QuotaReservationError("reservation not found")
   if row[0]=="reserved": db.execute("UPDATE quota_reservations SET state='released' WHERE reservation_id=?",(reservation_id,))
   db.commit()
  except Exception: db.rollback(); raise
  finally: db.close()
