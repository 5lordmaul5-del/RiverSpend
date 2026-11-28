// RC-6 worker job specification validator. Safe declarative profile; no command execution.
import {exactDataObject} from "./engine.mjs";
const profiles=Object.freeze({
 "node-static":Object.freeze({runtime:"node",buildProfile:"static-site",timeoutSeconds:300,network:"restricted"}),
 "node-tests":Object.freeze({runtime:"node",buildProfile:"test-suite",timeoutSeconds:300,network:"restricted"})
});
export function validateWorkerJob(job){
 const data=exactDataObject(job,["commit","target","profile"]);
 if(!data||Object.values(data).some(v=>typeof v!=="string"))throw new Error("invalid_job");
 if(data.target!=="staging")throw new Error("target_must_be_staging");
 if(!/^[0-9a-f]{40}$/i.test(data.commit))throw new Error("immutable_commit_sha_required");
 const profile=profiles[data.profile];if(!profile)throw new Error("profile_not_allowlisted");
 return Object.freeze({projectId:"riverspend",repository:"5lordmaul5-del/RiverSpend",branch:"main",commit:data.commit.toLowerCase(),target:"staging",profile:data.profile,profileConfig:profile,status:"specification_only"});
}
export function availableProfiles(){return Object.keys(profiles);}
