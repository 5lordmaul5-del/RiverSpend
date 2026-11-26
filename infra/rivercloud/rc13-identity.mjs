// RC-13: strict identity-claim validation prototype. Claims are NOT trusted until a real authentication provider verifies them.
const ROLES=new Set(["owner","admin","operator","auditor","viewer"]);
const PERMISSIONS=new Set(["manage_users","manage_projects","approve_jobs","read_audit","read_status","read_jobs"]);
const MAX_TOKEN_LIFETIME_MS=12*60*60*1000,MAX_SUBJECT_LENGTH=256,MAX_ISSUER_LENGTH=2048;
const REQUIRED=["issuer","subject","audience","issuedAt","expiresAt","roles"];
function audienceMatches(audience,expected){if(typeof expected!=="string"||!expected.trim())return false;if(typeof audience==="string")return audience===expected;if(Array.isArray(audience)&&audience.length>0&&audience.length<=20)return audience.every(v=>typeof v==="string"&&v.length>0)&&audience.includes(expected);return false;}
export function validateIdentityClaims(claims,{now=Date.now(),verifyIssuer=()=>false,expectedIssuer,expectedAudience}={}) {
 if(!claims||typeof claims!=="object"||Array.isArray(claims))return {ok:false,reason:"invalid_claims"};
 for(const key of REQUIRED)if(!(key in claims))return {ok:false,reason:"missing_claim"};
 if(typeof claims.issuer!=="string"||!claims.issuer.trim()||claims.issuer.length>MAX_ISSUER_LENGTH||typeof claims.subject!=="string"||!claims.subject.trim()||claims.subject.length>MAX_SUBJECT_LENGTH)return {ok:false,reason:"invalid_subject"};
 if(typeof expectedIssuer!=="string"||!expectedIssuer.trim()||claims.issuer!==expectedIssuer||!audienceMatches(claims.audience,expectedAudience))return {ok:false,reason:"issuer_or_audience_mismatch"};
 if(!Number.isSafeInteger(now)||!Number.isSafeInteger(claims.issuedAt)||!Number.isSafeInteger(claims.expiresAt)||claims.expiresAt<=now||claims.issuedAt>now+60_000||claims.expiresAt<=claims.issuedAt||claims.expiresAt-claims.issuedAt>MAX_TOKEN_LIFETIME_MS)return {ok:false,reason:"invalid_time_window"};
 if(!Array.isArray(claims.roles)||claims.roles.length===0||claims.roles.length>10||claims.roles.some(role=>typeof role!=="string"||!ROLES.has(role)))return {ok:false,reason:"invalid_roles"};
 if(typeof verifyIssuer!=="function"||verifyIssuer(claims)!==true)return {ok:false,reason:"signature_not_verified"};
 return {ok:true,actor:{issuer:claims.issuer,subject:claims.subject,audience:claims.audience,roles:[...new Set(claims.roles)]}};
}
export function hasRole(actor,role){return Boolean(actor&&Array.isArray(actor.roles)&&ROLES.has(role)&&actor.roles.includes(role));}
export const RC13_ROLE_POLICY=Object.freeze({owner:["*"],admin:["manage_users","manage_projects","approve_jobs","read_audit","read_status","read_jobs"],operator:["manage_projects","approve_jobs","read_status","read_jobs"],auditor:["read_audit","read_status"],viewer:["read_status"]});
export function hasPermission(actor,permission){if(typeof permission!=="string"||!PERMISSIONS.has(permission)||!actor||!Array.isArray(actor.roles))return false;return actor.roles.some(role=>ROLES.has(role)&&(RC13_ROLE_POLICY[role].includes("*")||RC13_ROLE_POLICY[role].includes(permission)));}
