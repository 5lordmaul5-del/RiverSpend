import test from "node:test"; import assert from "node:assert/strict"; import {createHash} from "node:crypto";
import {createAuditEnvelope,buildSignedDelivery,verifyAuditEnvelope,verifySignedDelivery} from "./rc14-audit-sink.mjs";
const secret="s".repeat(40),endpoint="https://audit.example/receive",now=1700000000000;
const envelope=()=>createAuditEnvelope({type:"auth_denied",data:{password:"x",token:"y",reason:"bad"}},{sinkId:"sink-1",actor:"user-1",occurredAt:new Date(now).toISOString()});
const acceptReplay=async()=>true;
test("redacts sensitive keys in envelope",()=>{const e=envelope();assert.equal(e.data.password,"[redacted]");assert.equal(e.data.token,"[redacted]");assert.equal(e.data.reason,"bad");});
test("rejects unknown event type",()=>assert.throws(()=>createAuditEnvelope({type:"arbitrary"},{sinkId:"s",actor:"u"})));
test("rejects invalid envelope context and non-object data",()=>{assert.throws(()=>createAuditEnvelope({type:"system_event",data:"raw"},{sinkId:"s",actor:"u"}));assert.throws(()=>createAuditEnvelope({type:"system_event"},{sinkId:"s",actor:"u",previousHash:"bad"}));});
test("verifies canonical envelope digest and detects tampering",()=>{const e=envelope();assert.equal(verifyAuditEnvelope(e).valid,true);assert.equal(verifyAuditEnvelope({...e,actor:"changed"}).reason,"hash_mismatch");});
test("RC-64 rejects non-string endpoint values and unsafe URLs",()=>{for(const bad of ["http://example.com","https://user:pass@example.com","https://example.com/?token=x","https://example.com/#frag"," https://audit.example/receive","https://audit.example:443/receive",new String(endpoint),{toString:()=>endpoint}])assert.throws(()=>buildSignedDelivery(envelope(),{endpoint:bad,secret}));});
test("rejects short signing secret",()=>assert.throws(()=>buildSignedDelivery(envelope(),{endpoint,secret:"short"})));
test("creates and verifies signed descriptor without network",async()=>{const d=buildSignedDelivery(envelope(),{endpoint,secret,now});assert.equal(d.method,"POST");assert.ok(d.headers["x-rivercloud-audit-signature"].startsWith("sha256="));assert.ok(d.headers["x-rivercloud-audit-nonce"]);const v=await verifySignedDelivery(d,{secret,now,consumeReplay:acceptReplay});assert.equal(v.valid,true);assert.equal(v.envelopeHash,envelope().hash);});
test("rejects missing durable replay guard",async()=>{const d=buildSignedDelivery(envelope(),{endpoint,secret,now});assert.equal((await verifySignedDelivery(d,{secret,now})).reason,"invalid_verifier_config");});
test("rejects altered body and timestamp window",async()=>{const d=buildSignedDelivery(envelope(),{endpoint,secret,now});assert.equal((await verifySignedDelivery({...d,body:d.body+" "},{secret,now,consumeReplay:acceptReplay} )).reason,"noncanonical_body");assert.equal((await verifySignedDelivery(d,{secret,now:now+600000,consumeReplay:acceptReplay})).reason,"timestamp_out_of_window");});
test("replay callback accepts first delivery and rejects the same nonce thereafter",async()=>{const d=buildSignedDelivery(envelope(),{endpoint,secret,now});const seen=new Set();const consumeReplay=async({nonce})=>{if(seen.has(nonce))return false;seen.add(nonce);return true;};assert.equal((await verifySignedDelivery(d,{secret,now,consumeReplay})).valid,true);assert.equal((await verifySignedDelivery(d,{secret,now,consumeReplay})).reason,"replay_rejected");});
test("replay storage errors fail closed",async()=>{const d=buildSignedDelivery(envelope(),{endpoint,secret,now});assert.equal((await verifySignedDelivery(d,{secret,now,consumeReplay:async()=>{throw new Error("storage down");}})).reason,"replay_store_error");});
test("rejects missing or wrong JSON content type and non-string endpoint",async()=>{const d=buildSignedDelivery(envelope(),{endpoint,secret,now});for(const headers of [{...d.headers,"content-type":"text/plain"},{...d.headers}]){if(headers["content-type"]==="application/json")delete headers["content-type"];assert.equal((await verifySignedDelivery({...d,headers},{secret,now,consumeReplay:acceptReplay})).reason,"invalid_content_type");}assert.equal((await verifySignedDelivery({...d,endpoint:new String(endpoint)},{secret,now,consumeReplay:acceptReplay})).reason,"invalid_delivery");});
test("rejects malformed header container shapes",async()=>{const d=buildSignedDelivery(envelope(),{endpoint,secret,now});for(const headers of [null,[], "bad", 17])assert.equal((await verifySignedDelivery({...d,headers},{secret,now,consumeReplay:acceptReplay})).reason,"invalid_headers");const inherited=Object.create({"x-rivercloud-audit-timestamp":String(now)});inherited["x-rivercloud-audit-nonce"]="a".repeat(32);inherited["x-rivercloud-audit-signature"]="sha256="+"b".repeat(64);assert.equal((await verifySignedDelivery({...d,headers:inherited},{secret,now,consumeReplay:acceptReplay})).reason,"invalid_headers");});
test("rejects invalid verifier configuration",async()=>{const d=buildSignedDelivery(envelope(),{endpoint,secret,now});assert.equal((await verifySignedDelivery(d,{secret,now,maxSkewMs:700000,consumeReplay:acceptReplay})).reason,"invalid_verifier_config");});


test("redactor preserves special keys safely without prototype mutation",()=>{const input=JSON.parse('{"__proto__":{"token":"hidden"},"constructor":{"secret":"hidden"},"prototype":{"apiKey":"hidden"},"ordinary":"ok"}');const e=createAuditEnvelope({type:"system_event",data:input},{sinkId:"sink-1",actor:"user-1",occurredAt:new Date(now).toISOString()});assert.equal(Object.getPrototypeOf(e.data),null);assert.equal(Object.hasOwn(e.data,"__proto__"),true);assert.deepEqual(e.data.__proto__,Object.assign(Object.create(null),{token:"[redacted]"}));assert.equal(e.data.constructor.secret,"[redacted]");assert.equal(e.data.prototype.apiKey,"[redacted]");assert.equal(e.data.ordinary,"ok");assert.equal(verifyAuditEnvelope(e).valid,true);assert.equal(Object.prototype.token,undefined);});

test("rejects externally supplied envelope data that bypasses redaction even with a recomputed hash",()=>{const e=envelope();e.data.password="raw-secret";const {hash,...payload}=e;e.hash=createHash("sha256").update(JSON.stringify(payload)).digest("hex");assert.equal(verifyAuditEnvelope(e).reason,"data_not_redacted");});

test("audit envelope verifier rejects inherited and unexpected fields",()=>{const e=envelope();const inherited=Object.create(e);assert.equal(verifyAuditEnvelope(inherited).valid,false);assert.equal(verifyAuditEnvelope({...e,extra:"unexpected"}).valid,false);const missing={...e};delete missing.actor;assert.equal(verifyAuditEnvelope(missing).valid,false);});


test("RC-62 rejects unexpected signed-delivery header extensions",async()=>{const d=buildSignedDelivery(envelope(),{endpoint,secret,now});const extra={...d.headers,"x-extra":"ignored"};assert.equal((await verifySignedDelivery({...d,headers:extra},{secret,now,consumeReplay:acceptReplay})).reason,"unexpected_headers");});


test("RC-63 rejects noncanonical JSON body representation",async()=>{const d=buildSignedDelivery(envelope(),{endpoint,secret,now});const parsed=JSON.parse(d.body);const altered=JSON.stringify(parsed,null,2);const signed={...d,body:altered,headers:{...d.headers}};assert.equal((await verifySignedDelivery(signed,{secret,now,consumeReplay:acceptReplay})).reason,"noncanonical_body");});


test("RC-66 rejects unsafe integer timestamp values before verification",async()=>{const d=buildSignedDelivery(envelope(),{endpoint,secret,now});const altered={...d,headers:{...d.headers,"x-rivercloud-audit-timestamp":"9999999999999999"}};assert.equal((await verifySignedDelivery(altered,{secret,now,consumeReplay:acceptReplay})).reason,"timestamp_out_of_window");});


test("RC-67 rejects noncanonical timestamp header encodings",async()=>{const d=buildSignedDelivery(envelope(),{endpoint,secret,now});const altered={...d,headers:{...d.headers,"x-rivercloud-audit-timestamp":"0"+String(now)}};assert.equal((await verifySignedDelivery(altered,{secret,now,consumeReplay:acceptReplay})).reason,"timestamp_out_of_window");});


test("RC-68 rejects uppercase nonce encodings",async()=>{const d=buildSignedDelivery(envelope(),{endpoint,secret,now});const altered={...d,headers:{...d.headers,"x-rivercloud-audit-nonce":"A"+"a".repeat(31)}};assert.equal((await verifySignedDelivery(altered,{secret,now,consumeReplay:acceptReplay})).reason,"invalid_nonce");});


test("RC-69 rejects uppercase signature hex encoding",async()=>{const d=buildSignedDelivery(envelope(),{endpoint,secret,now});const sig=d.headers["x-rivercloud-audit-signature"];const altered={...d,headers:{...d.headers,"x-rivercloud-audit-signature":"sha256="+sig.slice(7).toUpperCase()}};assert.equal((await verifySignedDelivery(altered,{secret,now,consumeReplay:acceptReplay})).reason,"invalid_signature");});


test("RC-70 rejects delivery inherited and unexpected properties",async()=>{const d=buildSignedDelivery(envelope(),{endpoint,secret,now});const inherited=Object.create(d);assert.equal((await verifySignedDelivery(inherited,{secret,now,consumeReplay:acceptReplay})).reason,"invalid_delivery");assert.equal((await verifySignedDelivery({...d,extra:"x"},{secret,now,consumeReplay:acceptReplay})).reason,"invalid_delivery");});


test("RC-71 rejects exotic header prototypes",async()=>{const d=buildSignedDelivery(envelope(),{endpoint,secret,now});const h=Object.assign(Object.create({polluted:"x"}),d.headers);const altered={...d,headers:h};assert.equal((await verifySignedDelivery(altered,{secret,now,consumeReplay:acceptReplay})).reason,"invalid_headers");});


test("RC-72 rejects missing, extra, and inherited header keys",async()=>{const d=buildSignedDelivery(envelope(),{endpoint,secret,now});const missing={...d,headers:{"content-type":"application/json","x-rivercloud-audit-timestamp":d.headers["x-rivercloud-audit-timestamp"],"x-rivercloud-audit-nonce":d.headers["x-rivercloud-audit-nonce"]}};assert.equal((await verifySignedDelivery(missing,{secret,now,consumeReplay:acceptReplay})).reason,"invalid_headers");const extra={...d,headers:{...d.headers,extra:"x"}};assert.equal((await verifySignedDelivery(extra,{secret,now,consumeReplay:acceptReplay})).reason,"unexpected_headers");const inherited={...d,headers:Object.assign(Object.create(null),d.headers)};assert.equal((await verifySignedDelivery(inherited,{secret,now,consumeReplay:acceptReplay})).valid,true);});


test("RC-73 rejects negative verifier clock",async()=>{const d=buildSignedDelivery(envelope(),{endpoint,secret,now});assert.equal((await verifySignedDelivery(d,{secret,now:-1,consumeReplay:acceptReplay})).reason,"invalid_verifier_config");});


test("RC-74 replay store fails closed on false and thrown errors",async()=>{const d=buildSignedDelivery(envelope(),{endpoint,secret,now});assert.equal((await verifySignedDelivery(d,{secret,now,consumeReplay:async()=>false})).reason,"replay_rejected");assert.equal((await verifySignedDelivery(d,{secret,now,consumeReplay:async()=>{throw new Error("store down");}})).reason,"replay_store_error");});


test("RC-75 replay store is not called for invalid signatures",async()=>{const d=buildSignedDelivery(envelope(),{endpoint,secret,now});const bad={...d,headers:{...d.headers,"x-rivercloud-audit-signature":"sha256="+"0".repeat(64)}};let calls=0;const result=await verifySignedDelivery(bad,{secret,now,consumeReplay:async()=>{calls++;return true;}});assert.equal(result.valid,false);assert.equal(calls,0);});


test("RC-76 rejects replay callback return values other than strict true",async()=>{const d=buildSignedDelivery(envelope(),{endpoint,secret,now});for(const value of [undefined,null,1,"true",{}]){assert.equal((await verifySignedDelivery(d,{secret,now,consumeReplay:async()=>value})).reason,"replay_rejected");}});


test("RC-77 accepts timestamp exactly at configured skew boundary",async()=>{const d=buildSignedDelivery(envelope(),{endpoint,secret,now});assert.equal((await verifySignedDelivery(d,{secret,now:now+1000,maxSkewMs:1000,consumeReplay:acceptReplay})).valid,true);assert.equal((await verifySignedDelivery(d,{secret,now:now+1001,maxSkewMs:1000,consumeReplay:acceptReplay})).reason,"timestamp_out_of_window");});


test("RC-78 replay store receives the verified envelope identifiers once",async()=>{const e=envelope(),d=buildSignedDelivery(e,{endpoint,secret,now});let calls=0;const result=await verifySignedDelivery(d,{secret,now,consumeReplay:async info=>{calls++;assert.equal(info.nonce,d.headers["x-rivercloud-audit-nonce"]);assert.equal(info.timestamp,now);assert.equal(info.sinkId,e.sinkId);assert.equal(info.envelopeHash,e.hash);return true;}});assert.equal(result.valid,true);assert.equal(calls,1);});


test("RC-79 rejected replay never returns envelope hash",async()=>{const d=buildSignedDelivery(envelope(),{endpoint,secret,now});for(const callback of [async()=>false,async()=>{throw new Error("unavailable")}]){const result=await verifySignedDelivery(d,{secret,now,consumeReplay:callback});assert.equal(result.valid,false);assert.equal(result.envelopeHash,undefined);}});


test("RC-80 replay store is skipped for malformed timestamps",async()=>{const d=buildSignedDelivery(envelope(),{endpoint,secret,now});const bad={...d,headers:{...d.headers,"x-rivercloud-audit-timestamp":"01"+String(now)}};let calls=0;const result=await verifySignedDelivery(bad,{secret,now,consumeReplay:async()=>{calls++;return true;}});assert.equal(result.valid,false);assert.equal(calls,0);});


test("RC-81 rejects out-of-range replay timestamp windows",async()=>{const d=buildSignedDelivery(envelope(),{endpoint,secret,now});for(const skew of [999,600001,-1,1.5]){assert.equal((await verifySignedDelivery(d,{secret,now,maxSkewMs:skew,consumeReplay:acceptReplay})).reason,"invalid_verifier_config");}});


test("RC-82 invalid verifier configuration never touches replay storage",async()=>{const d=buildSignedDelivery(envelope(),{endpoint,secret,now});for(const config of [{secret:"short",now,consumeReplay:async()=>true},{secret,now:-1,consumeReplay:async()=>true},{secret,now,maxSkewMs:999,consumeReplay:async()=>true},{secret,now}]){let calls=0;const wrapped={...config};if(config.consumeReplay)wrapped.consumeReplay=async()=>{calls++;return true;};const result=await verifySignedDelivery(d,wrapped);assert.equal(result.valid,false);assert.equal(calls,0);}});


test("RC-83 oversized delivery body is rejected before replay storage",async()=>{const d=buildSignedDelivery(envelope(),{endpoint,secret,now});const oversized={...d,body:"x".repeat(65537)};let calls=0;const result=await verifySignedDelivery(oversized,{secret,now,consumeReplay:async()=>{calls++;return true;}});assert.equal(result.valid,false);assert.equal(result.reason,"invalid_delivery");assert.equal(calls,0);});

test("RC-85 invalid replay callback result fails closed",async()=>{const d=buildSignedDelivery(envelope(),{endpoint,secret,now});for(const value of [undefined,null,1,"true",{}]){const result=await verifySignedDelivery(d,{secret,now,consumeReplay:async()=>value});assert.equal(result.valid,false);}});
test("RC-86 replay callback receives verified nonce and envelope hash exactly once",async()=>{const d=buildSignedDelivery(envelope(),{endpoint,secret,now});let calls=0;let received;const result=await verifySignedDelivery(d,{secret,now,consumeReplay:async x=>{calls++;received=x;return true;}});assert.equal(result.valid,true);assert.equal(calls,1);assert.equal(received.nonce,d.headers["x-rivercloud-audit-nonce"]);assert.equal(received.envelopeHash,envelope().hash);});
test("RC-87 failed signature never reaches replay storage",async()=>{const d=buildSignedDelivery(envelope(),{endpoint,secret,now});const headers={...d.headers};headers["x-rivercloud-audit-signature"]="sha256="+"0".repeat(64);let calls=0;const result=await verifySignedDelivery({...d,headers},{secret,now,consumeReplay:async()=>{calls++;return true;}});assert.equal(result.valid,false);assert.equal(calls,0);});


test("RC-88 corrupted envelope hash never reaches replay storage",async()=>{const d=buildSignedDelivery(envelope(),{endpoint,secret,now});const parsed=JSON.parse(d.body);parsed.actor="tampered";const altered={...d,body:JSON.stringify(parsed)};let calls=0;const result=await verifySignedDelivery(altered,{secret,now,consumeReplay:async()=>{calls++;return true;}});assert.equal(result.valid,false);assert.equal(calls,0);});

test("RC-89 delivery signed with a different secret is rejected before replay storage",async()=>{const d=buildSignedDelivery(envelope(),{endpoint,secret,now});let calls=0;const result=await verifySignedDelivery(d,{secret:"z".repeat(40),now,consumeReplay:async()=>{calls++;return true;}});assert.equal(result.valid,false);assert.equal(result.reason,"signature_mismatch");assert.equal(calls,0);});

test("RC-90 missing nonce header is rejected before replay storage",async()=>{const d=buildSignedDelivery(envelope(),{endpoint,secret,now});const headers={...d.headers};delete headers["x-rivercloud-audit-nonce"];let calls=0;const result=await verifySignedDelivery({...d,headers},{secret,now,consumeReplay:async()=>{calls++;return true;}});assert.equal(result.valid,false);assert.equal(calls,0);});


test("RC-91 wrong content type never invokes replay storage",async()=>{const d=buildSignedDelivery(envelope(),{endpoint,secret,now});const headers={...d.headers,"content-type":"text/plain"};let calls=0;const result=await verifySignedDelivery({...d,headers},{secret,now,consumeReplay:async()=>{calls++;return true;}});assert.equal(result.valid,false);assert.equal(result.reason,"invalid_content_type");assert.equal(calls,0);});

test("RC-92 malformed nonce never invokes replay storage",async()=>{const d=buildSignedDelivery(envelope(),{endpoint,secret,now});const headers={...d.headers,"x-rivercloud-audit-nonce":"not-a-valid-nonce"};let calls=0;const result=await verifySignedDelivery({...d,headers},{secret,now,consumeReplay:async()=>{calls++;return true;}});assert.equal(result.valid,false);assert.equal(result.reason,"invalid_nonce");assert.equal(calls,0);});


test("RC-93 malformed signature format is rejected before replay storage",async()=>{const d=buildSignedDelivery(envelope(),{endpoint,secret,now});const headers={...d.headers,"x-rivercloud-audit-signature":"sha256=xyz"};let calls=0;const result=await verifySignedDelivery({...d,headers},{secret,now,consumeReplay:async()=>{calls++;return true;}});assert.equal(result.valid,false);assert.equal(result.reason,"invalid_signature");assert.equal(calls,0);});

test("RC-94 unsupported envelope schema rejected before replay storage",async()=>{const d=buildSignedDelivery(envelope(),{endpoint,secret,now});const parsed=JSON.parse(d.body);parsed.schema="rivercloud.audit.v2";const altered={...d,body:JSON.stringify(parsed)};let calls=0;const result=await verifySignedDelivery(altered,{secret,now,consumeReplay:async()=>{calls++;return true;}});assert.equal(result.valid,false);assert.equal(calls,0);});

test("RC-95 signature header prefix must be exact",async()=>{const d=buildSignedDelivery(envelope(),{endpoint,secret,now});const headers={...d.headers,"x-rivercloud-audit-signature":"SHA256="+d.headers["x-rivercloud-audit-signature"].slice(7)};let calls=0;const result=await verifySignedDelivery({...d,headers},{secret,now,consumeReplay:async()=>{calls++;return true;}});assert.equal(result.valid,false);assert.equal(result.reason,"invalid_signature");assert.equal(calls,0);});


test("RC-96 wrong method rejected before replay storage",async()=>{const d=buildSignedDelivery(envelope(),{endpoint,secret,now});const altered={...d,method:"PUT"};let calls=0;const result=await verifySignedDelivery(altered,{secret,now,consumeReplay:async()=>{calls++;return true;}});assert.equal(result.valid,false);assert.equal(calls,0);});

test("RC-97 endpoint query string rejected before replay storage",async()=>{const d=buildSignedDelivery(envelope(),{endpoint,secret,now});const altered={...d,endpoint:endpoint+"?x=1"};let calls=0;const result=await verifySignedDelivery(altered,{secret,now,consumeReplay:async()=>{calls++;return true;}});assert.equal(result.valid,false);assert.equal(calls,0);});

test("RC-98 delivery body JSON parse failure rejected before replay storage",async()=>{const d=buildSignedDelivery(envelope(),{endpoint,secret,now});const altered={...d,body:"{"};let calls=0;const result=await verifySignedDelivery(altered,{secret,now,consumeReplay:async()=>{calls++;return true;}});assert.equal(result.valid,false);assert.equal(result.reason,"invalid_body");assert.equal(calls,0);});


test("RC-99 HTTP endpoint is rejected before replay storage",async()=>{const d=buildSignedDelivery(envelope(),{endpoint,secret,now});const altered={...d,endpoint:"http://audit.example/receive"};let calls=0;const result=await verifySignedDelivery(altered,{secret,now,consumeReplay:async()=>{calls++;return true;}});assert.equal(result.valid,false);assert.equal(calls,0);});

test("RC-100 body whitespace alteration rejected before replay storage",async()=>{const d=buildSignedDelivery(envelope(),{endpoint,secret,now});const altered={...d,body:d.body+"\n"};let calls=0;const result=await verifySignedDelivery(altered,{secret,now,consumeReplay:async()=>{calls++;return true;}});assert.equal(result.valid,false);assert.equal(calls,0);});

test("RC-144 redaction rejects nested accessors without executing them",()=>{
 let getterCalls=0;
 const data={};
 Object.defineProperty(data,"reason",{enumerable:true,get(){getterCalls++;return "unsafe";}});
 assert.throws(()=>createAuditEnvelope({type:"system_event",data},{sinkId:"sink-1",actor:"user-1",occurredAt:new Date(now).toISOString()}),/audit_data_accessor_rejected/);
 assert.equal(getterCalls,0);
 const e=envelope(),hostile={...e,data:{}};
 Object.defineProperty(hostile.data,"reason",{enumerable:true,get(){getterCalls++;return "unsafe";}});
 assert.equal(verifyAuditEnvelope(hostile).valid,false);
 assert.equal(getterCalls,0);
});
test("RC-144 event accessors, sparse arrays and cyclic audit data fail closed",()=>{
 let getterCalls=0;
 const event={};
 Object.defineProperty(event,"type",{enumerable:true,get(){getterCalls++;return "system_event";}});
 assert.throws(()=>createAuditEnvelope(event,{sinkId:"sink-1",actor:"user-1"}),/unsupported_event_type/);
 assert.equal(getterCalls,0);
 const sparse=new Array(2);sparse[1]="x";
 assert.throws(()=>createAuditEnvelope({type:"system_event",data:{items:sparse}},{sinkId:"sink-1",actor:"user-1"}),/audit_data_array_invalid/);
 const cyclic={};cyclic.self=cyclic;
 assert.throws(()=>createAuditEnvelope({type:"system_event",data:cyclic},{sinkId:"sink-1",actor:"user-1"}),/audit_data_object_invalid/);
});
