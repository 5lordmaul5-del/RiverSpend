export const toolRegistry=Object.freeze([
 {name:"status",description:"Read core status",enabled:true,risk:"read-only"},
 {name:"memory-list",description:"Read saved memory",enabled:true,risk:"read-only"},
 {name:"specialists-list",description:"List virtual specialist definitions",enabled:true,risk:"read-only"},
 {name:"scheduler-status",description:"Read in-memory scheduler status",enabled:true,risk:"read-only"},
 {name:"memory-add",description:"Save memory explicitly",enabled:false,risk:"write"},
 {name:"memory-delete",description:"Delete memory entry",enabled:false,risk:"write"},
 {name:"scheduler-enqueue",description:"Plan a bounded in-memory specialist assignment",enabled:false,risk:"write"}
]);
export function getToolRegistry(){return toolRegistry;}