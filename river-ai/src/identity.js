// RiverIdentity: static, default-deny role and permission policy.
// This is policy groundwork only; it is NOT authentication or a security boundary.
export const ROLES = Object.freeze(["Owner","Admin","Operator","Viewer"]);
export const PERMISSIONS = Object.freeze([
 "core.read","audit.read","knowledge.read","knowledge.write",
 "memory.read","memory.write","tools.read","tasks.plan",
 "policy.manage","identity.manage","core.configure"
]);
const policy = Object.freeze({
 Owner: new Set(PERMISSIONS),
 Admin: new Set(["core.read","audit.read","knowledge.read","knowledge.write","memory.read","memory.write","tools.read","tasks.plan"]),
 Operator: new Set(["core.read","audit.read","knowledge.read","memory.read","tools.read","tasks.plan"]),
 Viewer: new Set(["core.read","audit.read","knowledge.read","memory.read","tools.read"])
});
export function permissionsFor(role){ return ROLES.includes(role)? [...policy[role]]:[]; }
export function authorize(role, permission){
 if(!ROLES.includes(role)||!PERMISSIONS.includes(permission)) return {allowed:false,reason:"unknown role or permission"};
 return policy[role].has(permission)?{allowed:true,reason:"granted by static policy"}:{allowed:false,reason:"denied by static policy"};
}
export function roleCanManageIdentity(role){return authorize(role,"identity.manage").allowed;}
export function roleCanManagePolicy(role){return authorize(role,"policy.manage").allowed;}
