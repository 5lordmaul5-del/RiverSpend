// RC-6 worker job specification validator. Safe declarative profile; no command execution.
const profiles=Object.freeze({
 "node-static":Object.freeze({runtime:"node",buildProfile:"static-site",timeoutSeconds:300,network:"restricted"}),
 "node-tests":Object.freeze({runtime:"node",buildProfile:"test-suite",timeoutSeconds:300,network:"restricted"})
});
export function validateWorkerJob(job){
 if(!job||typeof job!=="object")throw new Error("invalid_job");
 if(job.target!=="staging")throw new Error("target_must_be_staging");
 if(!/^[0-9a-f]{40}$/i.test(String(job.commit||"")))throw new Error("immutable_commit_sha_required");
 const profile=profiles[String(job.profile||"")];if(!profile)throw new Error("profile_not_allowlisted");
 return Object.freeze({projectId:"riverspend",repository:"5lordmaul5-del/RiverSpend",branch:"main",commit:job.commit.toLowerCase(),target:"staging",profile:job.profile,profileConfig:profile,status:"specification_only"});
}
export function availableProfiles(){return Object.keys(profiles);}
