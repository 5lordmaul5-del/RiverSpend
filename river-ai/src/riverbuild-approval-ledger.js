import {createHash} from 'node:crypto';
const canon=v=>v===null||typeof v!=='object'?JSON.stringify(v):Array.isArray(v)?'['+v.map(canon).join(',')+']':'{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+canon(v[k])).join(',')+'}';
const hash=v=>createHash('sha256').update(canon(v)).digest('hex');
const MAX=1000;
/** Bounded, in-memory approval/revocation ledger. Records are hash-linked by content only; not durable or signed. */
export class RiverBuildApprovalLedger{
 constructor({maxRecords=MAX}={}){if(!Number.isInteger(maxRecords)||maxRecords<1||maxRecords>MAX)throw Error('maxRecords must be 1..1000');this.maxRecords=maxRecords;this.records=[];}
 approve({job,approvedBy,approvedAt,jobHash,approvalId}={}){
  if(!job||typeof job!=='object'||!job.id)throw Error('job with id required');
  if(!approvedBy||typeof approvedBy!=='string'||approvedBy.trim().length>200)throw Error('approvedBy required (max 200)');
  if(!approvedAt||!Number.isFinite(Date.parse(approvedAt)))throw Error('valid approvedAt required');
  if(!jobHash||typeof jobHash!=='string'||!/^[a-f0-9]{64}$/i.test(jobHash))throw Error('jobHash must be a SHA-256 hex hash');
  const id=approvalId||'approval-'+hash({jobId:String(job.id),approvedBy:approvedBy.trim(),approvedAt,jobHash}).slice(0,24);
  if(this.records.some(r=>r.approvalId===id))throw Error('duplicate approvalId');
  const record={approvalId:id,jobId:String(job.id),approvedBy:approvedBy.trim(),approvedAt:new Date(approvedAt).toISOString(),jobHash:jobHash.toLowerCase(),revoked:false,revokedAt:null,revokedBy:null};
  record.recordHash=hash(record);
  if(this.records.length>=this.maxRecords)this.records.shift();
  this.records.push(Object.freeze(record));
  return record;
 }
 revoke({approvalId,revokedBy,revokedAt}={}){
  const idx=this.records.findIndex(r=>r.approvalId===approvalId);
  if(idx<0)throw Error('approval not found');
  if(this.records[idx].revoked)throw Error('approval already revoked');
  if(!revokedBy||typeof revokedBy!=='string'||revokedBy.trim().length>200)throw Error('revokedBy required');
  if(!revokedAt||!Number.isFinite(Date.parse(revokedAt)))throw Error('valid revokedAt required');
  const old=this.records[idx],next={...old,revoked:true,revokedAt:new Date(revokedAt).toISOString(),revokedBy:revokedBy.trim()};
  delete next.recordHash;next.recordHash=hash(next);
  this.records[idx]=Object.freeze(next);return next;
 }
 get(approvalId){return this.records.find(r=>r.approvalId===approvalId)||null;}
 verify({approvalId,job,jobHash}={}){
  const r=this.get(approvalId);
  if(!r)return Object.freeze({valid:false,reason:'not-found',approvalId});
  const reasons=[];
  if(r.revoked)reasons.push('revoked');
  if(!job||String(job.id)!==r.jobId)reasons.push('job-id-mismatch');
  if(!jobHash||jobHash!==r.jobHash)reasons.push('job-hash-mismatch');
  return Object.freeze({valid:reasons.length===0,reason:reasons.length?'invalid':'valid',reasons:Object.freeze(reasons),record:r,readOnly:true});
 }
 list({jobId}={}){return this.records.filter(r=>jobId===undefined||r.jobId===String(jobId));}
 export(){return Object.freeze({count:this.records.length,records:Object.freeze([...this.records]),readOnly:true, durable:false, cryptographicSignature:false});}
}