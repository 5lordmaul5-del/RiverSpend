// RiverCloud deployment engine prototype: policy/queue only; no shell execution.
import { createHash } from "node:crypto";
import { resolveProjectPolicy } from "./unified-policy.mjs";\nimport { DEPLOY_REQUEST_KEYS } from "./shared-contracts.mjs";

export function exactDataObject(input,keys){
  try{
    if(!input||typeof input!=="object"||Array.isArray(input)||
       (Object.getPrototypeOf(input)!==Object.prototype&&Object.getPrototypeOf(input)!==null)||
       Object.getOwnPropertySymbols(input).length)return null;
    const ownKeys=Reflect.ownKeys(input);
    if(ownKeys.length!==keys.length||ownKeys.some(k=>typeof k!=="string"||!keys.includes(k)))return null;
    const snapshot=Object.create(null);
    for(const key of keys){
      const descriptor=Object.getOwnPropertyDescriptor(input,key);
      if(!descriptor||!descriptor.enumerable||!Object.hasOwn(descriptor,"value"))return null;
      snapshot[key]=descriptor.value;
    }
    return snapshot;
  }catch{return null;}
}

export function validateDeployRequest(input) {
  const data=exactDataObject(input,DEPLOY_REQUEST_KEYS);
  if(!data||Object.values(data).some(v=>typeof v!=="string"))throw new Error("invalid_request");
  const {projectId,commit,target,branch}=data;
  const project=resolveProjectPolicy(projectId,branch,target);
  if(!/^[0-9a-f]{40}$/i.test(commit))throw new Error("immutable_commit_sha_required");
  return Object.freeze({projectId,repository:project.repository,branch,commit:commit.toLowerCase(),target,status:"planned_not_queued"});
}
export function planDigest(plan){return createHash("sha256").update(JSON.stringify(plan)).digest("hex");}
export function describePrototype(){return {state:"policy_only",runnerConnected:false,shellExecution:false,dockerSocketAccess:false,deployable:false};}
