// Provider-neutral adapter contract and local-only Ollama adapter.
const LOCAL_HOSTS=new Set(["127.0.0.1","localhost","[::1]"]);
const MAX_PROMPT=8000,MAX_RESPONSE=16000,MAX_MODEL=120;
export function createMockAdapter({name="mock"}={}) {
 return Object.freeze({name,connected:false,async generate(){throw new Error("mock-provider-not-connected");}});
}
export function createOllamaAdapter({baseUrl="http://127.0.0.1:11434",model,fetchImpl=globalThis.fetch,timeoutMs=30000}={}) {
 let url;
 try{url=new URL(baseUrl);}catch{throw new Error("invalid-ollama-url");}
 if(!["http:","https:"].includes(url.protocol)||!LOCAL_HOSTS.has(url.hostname.toLowerCase())||url.pathname!=="/"||url.search||url.hash||url.username||url.password)throw new Error("ollama-local-endpoint-required");
 if(typeof model!=="string"||!model.trim()||model.trim().length>MAX_MODEL||/[\u0000-\u001f\u007f]/.test(model))throw new Error("invalid-ollama-model");
 if(typeof fetchImpl!=="function")throw new Error("fetch-adapter-required");
 if(!Number.isInteger(timeoutMs)||timeoutMs<1||timeoutMs>120000)throw new Error("timeoutMs must be 1..120000");
 const state={connected:false},endpoint=url.origin;
 return Object.freeze({name:"ollama-local",endpoint,model:model.trim(),get connected(){return state.connected;},async generate(prompt,{numPredict=512,temperature=0.2}={}){
  if(typeof prompt!=="string"||!prompt.trim()||prompt.length>MAX_PROMPT)throw new Error("invalid-prompt");
  if(!Number.isInteger(numPredict)||numPredict<1||numPredict>2048)throw new Error("invalid-num-predict");
  if(!Number.isFinite(temperature)||temperature<0||temperature>1)throw new Error("invalid-temperature");
  const controller=new AbortController();let timer;
  try{
   timer=setTimeout(()=>controller.abort(),timeoutMs);
   const response=await fetchImpl(endpoint+"/api/generate",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({model:model.trim(),prompt,stream:false,options:{num_predict:numPredict,temperature}}),signal:controller.signal});
   if(!response||typeof response.ok!=="boolean")throw new Error("ollama-response-invalid");
   if(!response.ok)throw new Error("ollama-http-"+response.status);
   let data;try{data=await response.json();}catch{throw new Error("ollama-response-invalid");}
   if(!data||typeof data.response!=="string")throw new Error("ollama-response-invalid");
   if(data.response.length>MAX_RESPONSE)throw new Error("ollama-response-too-large");
   state.connected=true;
   return Object.freeze({provider:"ollama-local",model:model.trim(),response:data.response,done:data.done===true,executionEnabled:false});
  }catch(e){if(controller.signal.aborted)throw new Error("ollama-timeout");throw e;}
  finally{clearTimeout(timer);}
 }});
}
export function getProviderState(adapter=null){
 return {configured:!!adapter,provider:adapter?.name||"none",connected:adapter?.connected===true,capability:adapter?.name==="ollama-local"?"local-inference-adapter":"adapter-contract-only"};
}
