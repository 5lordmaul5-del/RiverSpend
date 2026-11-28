import {createHash} from 'node:crypto';
const hash=v=>createHash('sha256').update(JSON.stringify(v,Object.keys(v||{}).sort())).digest('hex');
const MAX=1000;
/** Explicit, bounded, in-memory execution authorizations. Does not invoke or grant access to any executor. */
export class RiverBuildExecutionAuthorization{
 constructor({maxTokens=MAX}={}){if(!Number.isInteger(maxTokens)||maxTokens<1||maxTokens>MAX)throw Error('maxTokens must be 1..1000');this.maxTokens=maxTokens;this.tokens=[];}
 issue({review,approvalId,jobId,jobHash,authorizedBy,issuedAt,expiresAt,authorizationId}={}){
  if(review?.readyForHumanReview!==true||review?.executionTriggered===true)throw Error('clean human-review result required');
  if(!approvalId||!jobId||!jobHash||!/^[a-f0-9]{64}$/i.test(jobHash))throw Error('approval, job ID and SHA-256 job hash required');
  if(!authorizedBy||typeof authorizedBy!=='string'||authorizedBy.trim().length>200)throw Error('authorizedBy required');
  const start=Date.parse(issuedAt),end=Date.parse(expiresAt);
  if(!Number.isFinite(start)||!Number.isFinite(end)||end<=start||end-start>3600000)throw Error('authorization validity must be positive and at most one hour');
  const id=authorizationId||'exec-auth-'+createHash('sha256').update([approvalId,jobId,jobHash,authorizedBy.trim(),issuedAt,expiresAt].join('|')).digest('hex').slice(0,24);
  if(this.tokens.some(t=>t.authorizationId===id))throw Error('duplicate authorization ID');
  const token={authorizationId:id,approvalId:String(approvalId),jobId:String(jobId),jobHash:jobHash.toLowerCase(),authorizedBy:authorizedBy.trim(),issuedAt:new Date(start).toISOString(),expiresAt:new Date(end).toISOString(),revoked:false,revokedAt:null,revokedBy:null};
  token.tokenHash=createHash('sha256').update(JSON.stringify(token)).digest('hex');Object.freeze(token);
  if(this.tokens.length>=this.maxTokens)this.tokens.shift();this.tokens.push(token);return token;
 }
 revoke({authorizationId,revokedBy,revokedAt}={}){
  const i=this.tokens.findIndex(t=>t.authorizationId===authorizationId);if(i<0)throw Error('authorization not found');
  if(this.tokens[i].revoked)throw Error('already revoked');
  if(!revokedBy||!Number.isFinite(Date.parse(revokedAt)))throw Error('revoker and timestamp required');
  const t={...this.tokens[i],revoked:true,revokedAt:new Date(revokedAt).toISOString(),revokedBy:String(revokedBy).slice(0,200)};delete t.tokenHash;t.tokenHash=createHash('sha256').update(JSON.stringify(t)).digest('hex');this.tokens[i]=Object.freeze(t);return t;
 }
 validate({authorizationId,jobId,jobHash,now=new Date().toISOString()}={}){
  const t=this.tokens.find(x=>x.authorizationId===authorizationId);if(!t)return Object.freeze({valid:false,reason:'not-found',executionTriggered:false});
  const issues=[];const n=Date.parse(now);
  if(t.revoked)issues.push('revoked');if(String(jobId)!==t.jobId)issues.push('job-id-mismatch');if(jobHash!==t.jobHash)issues.push('job-hash-mismatch');
  if(!Number.isFinite(n)||n<Date.parse(t.issuedAt))issues.push('not-yet-valid');if(n>=Date.parse(t.expiresAt))issues.push('expired');
  return Object.freeze({valid:issues.length===0,issues:Object.freeze(issues),authorization:t,executionTriggered:false,readOnly:true});
 }
 list(){return Object.freeze([...this.tokens]);}
}