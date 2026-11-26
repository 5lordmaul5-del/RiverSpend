// Test-only adapter joining persistent API-key verification with the planning-only RiverSSAI core.
import {createRiverSSAIOrchestrator} from "./river-ssai-orchestrator.mjs";

export function createStoreBackedRiverSSAIOrchestrator({store,definitions=[],maxIdempotencyEntries=5000,approvalVerifier=()=>false}={}){
  if(!store||typeof store.resolveRecord!=="function")throw new Error("api_key_store_required");
  const orchestrator=createRiverSSAIOrchestrator({definitions,maxIdempotencyEntries,approvalVerifier});
  return Object.freeze({
    async planInvoke(request={}){
      let verified;
      try{verified=await store.resolveRecord(request.key,{now:request.now});}
      catch{return {status:503,error:"api_key_store_unavailable"};}
      if(!verified.valid)return {status:verified.reason==="scope_denied"?403:401,error:verified.reason};
      return orchestrator.planInvoke({...request,record:verified.record});
    },
    getDefinitionCount(){return orchestrator.getDefinitionCount();},
    getIdempotencyCount(){return orchestrator.getIdempotencyCount();}
  });
}
