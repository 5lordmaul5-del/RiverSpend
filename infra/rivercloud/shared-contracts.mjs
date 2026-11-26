// Shared contracts for RiverCloud queue and proxy API layers.
// Declarative validation only; does not authenticate actors or authorize execution.
export const DEPLOY_REQUEST_KEYS = Object.freeze(["projectId","branch","commit","target"]);
export const ACTOR_ROLES = Object.freeze(["owner","admin","operator","auditor","viewer"]);
export const POLICY_ERROR_CODES = Object.freeze([
 "invalid_request","project_not_allowlisted","target_not_allowed",
 "immutable_commit_sha_required","branch_not_allowlisted","profile_not_allowed"
]);
export const CAPACITY_ERROR_CODES = Object.freeze(["queue_capacity_exceeded","state_file_too_large","state_lock_timeout"]);
export function normalizeActorContext(input){
 const allowed=new Set(ACTOR_ROLES);
 if(input===null||input===undefined)return null;
 if(!input||typeof input!=="object"||Array.isArray(input)||
   !/^[a-f0-9]{64}$/i.test(String(input.actorRef??""))||
   !Array.isArray(input.roles)||input.roles.length<1||input.roles.length>5||
   input.roles.some(role=>typeof role!=="string"||!allowed.has(role)))throw new Error("invalid_actor_context");
 return {actorRef:String(input.actorRef).toLowerCase(),roles:[...new Set(input.roles)].sort()};
}
