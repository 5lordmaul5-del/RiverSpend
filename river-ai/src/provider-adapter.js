// Provider-neutral adapter contract. The mock provider is for local tests only.
export function createMockAdapter({name="mock"}={}) {
 return Object.freeze({name,connected:false,async generate(){throw new Error("mock-provider-not-connected");}});
}
export function getProviderState(adapter=null){return {configured:!!adapter,provider:adapter?.name||"none",connected:adapter?.connected===true,capability:"adapter-contract-only"};}
