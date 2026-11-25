import {createHash} from 'node:crypto';
const canonical=value=>{
 if(value===null||typeof value!=='object')return JSON.stringify(value);
 if(Array.isArray(value))return '['+value.map(canonical).join(',')+']';
 return '{'+Object.keys(value).sort().map(k=>JSON.stringify(k)+':'+canonical(value[k])).join(',')+'}';
};
const digest=value=>createHash('sha256').update(canonical(value)).digest('hex');
const LIMIT=1000;
/** Read-only integrity checks using stable canonical hashes. Does not prove authenticity. */
export class RiverBuildIntegrity{
 constructor({maxItems=LIMIT}={}){if(!Number.isInteger(maxItems)||maxItems<1||maxItems>LIMIT)throw Error('maxItems must be 1..1000');this.maxItems=maxItems;}
 fingerprint(value){return digest(value);}
 compare({expected,actual,label='object'}={}){
  if(expected===undefined||actual===undefined)throw Error('expected and actual required');
  const e=digest(expected),a=digest(actual),match=e===a;
  return Object.freeze({label:String(label).slice(0,120),match,expectedHash:e,actualHash:a,status:match?'match':'mismatch',readOnly:true});
 }
 auditBundle({job,report,recoveryDecision,historyRecord,expectedHashes={}}={}){
  const items={job,report,recoveryDecision,historyRecord};const results=[];
  for(const key of Object.keys(items)){
   const v=items[key];if(v===undefined||v===null)continue;
   if(expectedHashes[key]!==undefined){const actual=digest(v),expected=String(expectedHashes[key]);results.push({component:key,match:actual===expected,expectedHash:expected,actualHash:actual});}
   else results.push({component:key,match:null,hash:digest(v),reason:'no reference hash supplied'});
  }
  if(results.length>this.maxItems)throw Error('integrity bundle exceeds limit');
  return Object.freeze({integrityId:'integrity-'+digest(results).slice(0,16),checkedAt:new Date().toISOString(),results:Object.freeze(results),mismatches:results.filter(x=>x.match===false).length,unanchored:results.filter(x=>x.match===null).length,readOnly:true,authenticityVerified:false});
 }
}
