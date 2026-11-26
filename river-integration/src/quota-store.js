// Bounded in-memory fixed-window quota prototype. Not distributed or durable.
export function createQuotaStore({windowMs=60000,maxRequests=60,maxTenants=10000}={}){
 if(!Number.isInteger(windowMs)||windowMs<1||!Number.isInteger(maxRequests)||maxRequests<1||!Number.isInteger(maxTenants)||maxTenants<1)throw new Error("invalid-quota-config");
 const buckets=new Map();
 return Object.freeze({consume({tenantId,now=Date.now()}={}){
  if(typeof tenantId!=="string"||!tenantId.trim())return{allowed:false,reason:"invalid-tenant"};
  let b=buckets.get(tenantId);
  if(!b||now-b.start>=windowMs){if(!b&&buckets.size>=maxTenants){for(const[k,v]of buckets)if(now-v.start>=windowMs)buckets.delete(k);if(buckets.size>=maxTenants)return{allowed:false,reason:"capacity"};}b={start:now,count:0};buckets.set(tenantId,b);}
  if(b.count>=maxRequests)return{allowed:false,reason:"quota-exceeded",retryAfterMs:Math.max(0,windowMs-(now-b.start))};
  b.count++;return{allowed:true,remaining:maxRequests-b.count,resetAt:b.start+windowMs};
 },size:()=>buckets.size});
}
