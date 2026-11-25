// RC-15: staging isolation and worker boundary prototype. No processes spawned.
const PROFILES=Object.freeze({"node-static":{network:false,readOnly:true,timeoutMs:30000},"node-tests":{network:false,readOnly:false,timeoutMs:120000}});
const SAFE=/^[a-f0-9]{40}$/i;
export function createStagingPlan({project,commit,profile,stagingPath,approved=false}={}){
 if(typeof project!=="string"||!project.trim())throw Error("project_required");
 if(!SAFE.test(commit??""))throw Error("commit_sha_required");
 if(!Object.hasOwn(PROFILES,profile))throw Error("profile_not_allowed");
 if(typeof stagingPath!=="string"||!stagingPath.startsWith("/staging/"))throw Error("staging_path_required");
 if(approved!==true)throw Error("approval_required");
 return Object.freeze({schema:"rivercloud.staging-plan.v1",project,commit:commit.toLowerCase(),profile,stagingPath,limits:PROFILES[profile],executionEnabled:false,createdAt:new Date().toISOString()});
}
export function validateWorkerSpec(spec){if(!spec||spec.schema!=="rivercloud.staging-plan.v1"||spec.executionEnabled!==false)return {ok:false,reason:"invalid_or_enabled_spec"};if(!Object.hasOwn(PROFILES,spec.profile))return {ok:false,reason:"profile_denied"};if(!SAFE.test(spec.commit??""))return {ok:false,reason:"commit_invalid"};return {ok:true};}
export function stagingIsolationChecklist(){return Object.freeze(["Dedicated staging host or VM/container isolation","No production secrets or production volumes","Worker runs as non-root with read-only base filesystem","CPU/memory/pids/timeout limits","No outbound network by default; explicit allowlist if required","No Docker socket mount","Separate staging credentials and data","Immutable source SHA and artifact digest","Logs and audit trail","Snapshot/cleanup policy"]);}
