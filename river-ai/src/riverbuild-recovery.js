const RETRYABLE=new Set(['failed','timeout']);
const TERMINAL=new Set(['passed','failed','timeout','blocked','cancelled']);
/** Bounded retry policy. It creates proposals only; it never queues or approves jobs. */
export class RiverBuildRecovery {
 #attempts=new Map();
 constructor({maxAttempts=3,retryableStatuses=['failed','timeout']}={}){
  if(!Number.isInteger(maxAttempts)||maxAttempts<1||maxAttempts>10)throw Error('maxAttempts must be 1..10');
  if(!Array.isArray(retryableStatuses)||retryableStatuses.some(s=>!TERMINAL.has(s)))throw Error('Invalid retryable statuses');
  this.maxAttempts=maxAttempts;this.retryable=new Set(retryableStatuses);
 }
 recordAttempt(buildId,status){
  if(typeof buildId!=='string'||!buildId.trim())throw Error('buildId required');
  if(!TERMINAL.has(status))throw Error('Terminal status required');
  const n=(this.#attempts.get(buildId)||0)+1;this.#attempts.set(buildId,n);return n;
 }
 evaluate({buildId,status,attempt}={}){
  if(typeof buildId!=='string'||!buildId.trim())throw Error('buildId required');
  if(!TERMINAL.has(status))throw Error('Terminal status required');
  const n=attempt??this.#attempts.get(buildId)??1;
  if(!Number.isInteger(n)||n<1)throw Error('attempt must be a positive integer');
  if(status==='passed')return {decision:'stop',reason:'success',attempt:n,maxAttempts:this.maxAttempts};
  if(status==='blocked'||status==='cancelled')return {decision:'stop',reason:status,attempt:n,maxAttempts:this.maxAttempts};
  if(!this.retryable.has(status))return {decision:'stop',reason:'not-retryable',attempt:n,maxAttempts:this.maxAttempts};
  if(n>=this.maxAttempts)return {decision:'stop',reason:'attempt-limit',attempt:n,maxAttempts:this.maxAttempts};
  return {decision:'retry-proposal',reason:'retryable-failure',attempt:n,nextAttempt:n+1,maxAttempts:this.maxAttempts,requiresApproval:true,automaticEnqueue:false};
 }
 reset(buildId){if(typeof buildId!=='string'||!buildId.trim())throw Error('buildId required');this.#attempts.delete(buildId);}
 getAttemptCount(buildId){return this.#attempts.get(buildId)||0;}
}
