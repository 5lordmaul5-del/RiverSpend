import pg from 'pg';
const {Pool}=pg;
const valid=['queued','review','running','succeeded','failed','cancelled'];
const transitions={queued:['review','running','cancelled'],review:['queued','running','cancelled'],running:['succeeded','failed','cancelled'],failed:['queued','cancelled'],succeeded:[],cancelled:[]};
export class RiverDBTaskRepository {
 constructor({connectionString, poolOptions={}}={}){if(!connectionString)throw new Error('connectionString required');this.pool=new Pool({connectionString,...poolOptions});}
 async close(){await this.pool.end();}
 async create({module_id='powertron',task_type,payload={},created_by=null,idempotency_key=null}={}){
  if(!task_type)throw new Error('task_type required');
  const client=await this.pool.connect();try{await client.query('BEGIN');
   const q=await client.query('INSERT INTO riverdb.tasks(module_id,task_type,payload,created_by,idempotency_key) VALUES($1,$2,$3,$4,$5) ON CONFLICT(idempotency_key) DO NOTHING RETURNING *',[module_id,task_type,payload,created_by,idempotency_key]);
   let row=q.rows[0];if(!row&&idempotency_key){const existing=await client.query('SELECT * FROM riverdb.tasks WHERE idempotency_key=$1',[idempotency_key]);row=existing.rows[0];}
   if(!row)throw new Error('Task insert conflict');await client.query('INSERT INTO audit.records(actor,action,entity_type,entity_id,details) VALUES($1,$2,$3,$4,$5)',[created_by||'system','task.create','task',String(row.task_id),{module_id,task_type}]);await client.query('COMMIT');return row;
  }catch(e){await client.query('ROLLBACK');throw e;}finally{client.release();}
 }
 async get(taskId){const r=await this.pool.query('SELECT * FROM riverdb.tasks WHERE task_id=$1',[taskId]);return r.rows[0]||null;}
 async list({status,limit=100}={}){limit=Math.min(Math.max(Number(limit)||100,1),500);const r=status?await this.pool.query('SELECT * FROM riverdb.tasks WHERE status=$1 ORDER BY created_at DESC LIMIT $2',[status,limit]):await this.pool.query('SELECT * FROM riverdb.tasks ORDER BY created_at DESC LIMIT $1',[limit]);return r.rows;}
 async transition(taskId,next,actor='operator'){if(!valid.includes(next))throw new Error('Invalid status');const client=await this.pool.connect();try{await client.query('BEGIN');const q=await client.query('SELECT * FROM riverdb.tasks WHERE task_id=$1 FOR UPDATE',[taskId]);const row=q.rows[0];if(!row)throw new Error('Task not found');if(!transitions[row.status]?.includes(next))throw new Error('Transition not allowed');const u=await client.query('UPDATE riverdb.tasks SET status=$2,updated_at=now(),version=version+1 WHERE task_id=$1 RETURNING *',[taskId,next]);await client.query('INSERT INTO audit.records(actor,action,entity_type,entity_id,details) VALUES($1,$2,$3,$4,$5)',[actor,'task.transition','task',String(taskId),{from:row.status,to:next}]);await client.query('COMMIT');return u.rows[0];}catch(e){await client.query('ROLLBACK');throw e;}finally{client.release();}}
 async claimNext(){const client=await this.pool.connect();try{await client.query('BEGIN');const q=await client.query("SELECT * FROM riverdb.tasks WHERE status='queued' ORDER BY created_at FOR UPDATE SKIP LOCKED LIMIT 1");const row=q.rows[0];if(!row){await client.query('COMMIT');return null;}const u=await client.query("UPDATE riverdb.tasks SET status='running',updated_at=now(),version=version+1 WHERE task_id=$1 RETURNING *",[row.task_id]);await client.query('INSERT INTO audit.records(actor,action,entity_type,entity_id,details) VALUES($1,$2,$3,$4,$5)', ['dispatcher','task.claim','task',String(row.task_id),{previous_status:row.status}]);await client.query('COMMIT');return u.rows[0];}catch(e){await client.query('ROLLBACK');throw e;}finally{client.release();}}
}
