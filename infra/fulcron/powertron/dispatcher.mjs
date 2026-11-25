/** Dispatcher MVP: selects queued tasks for review. It does not execute agents. */
export function dispatch(queue, limit=10){
 if(!queue||typeof queue.list!=='function')throw new Error('Queue interface required');
 if(!Number.isInteger(limit)||limit<1||limit>100)throw new Error('Limit must be 1..100');
 return queue.list().filter(t=>t.status==='queued_for_review').slice(0,limit).map(t=>({task_id:t.task_id,group:t.suggested_group,roles:t.suggested_roles,approval_required:true,execution:'disabled'}));
}
