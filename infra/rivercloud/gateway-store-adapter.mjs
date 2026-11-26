// Test-only adapter joining the private API-key store with the mock vertical gateway.
import {createMockGateway} from "./gateway-mock.mjs";

export function createStoreBackedMockGateway({store,maxIdempotencyEntries=10000}={}){
  if(!store||typeof store.resolveRecord!=="function")throw new Error("api_key_store_required");
  const gateway=createMockGateway({maxIdempotencyEntries});
  return Object.freeze({
    async handle(request={}){
      // Normalize the clock once: passing {now: undefined} overrides store defaults.
      const now=request.now===undefined?Date.now():request.now;
      let verified;
      try{verified=await store.resolveRecord(request.key,{now});}
      catch{return {status:503,error:"api_key_store_unavailable"};}
      if(!verified.valid)return {status:verified.reason==="scope_denied"?403:401,error:verified.reason};
      return gateway.handle({...request,now,record:verified.record});
    },
    getIdempotencyCount(){return gateway.getIdempotencyCount();}
  });
}
