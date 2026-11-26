// Test-only adapter joining the private API-key store with the mock vertical gateway.
import {createMockGateway} from "./gateway-mock.mjs";

export function createStoreBackedMockGateway({store,maxIdempotencyEntries=10000}={}){
  if(!store||typeof store.resolveRecord!=="function")throw new Error("api_key_store_required");
  const gateway=createMockGateway({maxIdempotencyEntries});
  return Object.freeze({
    async handle(request={}){
      const verified=await store.resolveRecord(request.key,{now:request.now});
      if(!verified.valid)return {status:verified.reason==="scope_denied"?403:401,error:verified.reason};
      return gateway.handle({...request,record:verified.record});
    },
    getIdempotencyCount(){return gateway.getIdempotencyCount();}
  });
}
