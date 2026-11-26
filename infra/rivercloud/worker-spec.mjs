// RC-6 worker job specification validator. Declarative profile only; no execution.
import { exactDataObject } from "./engine.mjs";
import { WORKER_PROFILES, resolveProjectPolicy, resolveWorkerProfile } from "./unified-policy.mjs";
export function validateWorkerJob(job){
 const data=exactDataObject(job,["projectId","branch","commit","target","profile"]);
 if(!data||Object.values(data).some(v=>typeof v!=="string"))throw new Error("invalid_job");
 const project=resolveProjectPolicy(data.projectId,data.branch,data.target);
 if(!/^[0-9a-f]{40}$/i.test(data.commit))throw new Error("immutable_commit_sha_required");
 const profileConfig=resolveWorkerProfile(data.profile);
 return Object.freeze({projectId:data.projectId,repository:project.repository,branch:data.branch,commit:data.commit.toLowerCase(),target:data.target,profile:data.profile,profileConfig,status:"specification_only"});
}
export function availableProfiles(){return Object.keys(WORKER_PROFILES);}
