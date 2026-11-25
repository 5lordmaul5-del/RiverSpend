// Task engine: planning-only. It never executes tools or external actions.
const MAX_TASK_CHARS=4000,MAX_STEPS=12;
const forbidden=["deploy","delete","payment","transfer","publish","send","credential","production"];
export function createTask(goal){
 if(typeof goal!=="string"||!goal.trim()||goal.length>MAX_TASK_CHARS)throw new Error("invalid-goal");
 const normalized=goal.trim();
 return {id:crypto.randomUUID(),goal:normalized,status:"planned",createdAt:new Date().toISOString(),steps:[{id:1,description:"Clarify goal and constraints",status:"pending"},{id:2,description:"Break goal into safe, reviewable actions",status:"pending"},{id:3,description:"Check requirements and risks",status:"pending"},{id:4,description:"Prepare proposal for human review",status:"pending"}].slice(0,MAX_STEPS),requiresApproval:true,executionEnabled:false};
}
export function assessTask(task){const terms=forbidden.filter(term=>task.goal.toLowerCase().includes(term));return {taskId:task.id,flags:terms,approvalRequired:true,executionEnabled:false,assessment:"planning-only"};}
