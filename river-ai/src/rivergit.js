// RiverGit Phase 0: repository service abstraction and local repository manifest.
// Uses Git itself as the storage/versioning engine; this is not a hosted Git server.
const MAX=80;
const REPO_NAME=/^[a-zA-Z0-9][a-zA-Z0-9._-]{0,79}$/;
export function validateRepositoryName(name){return typeof name==="string"&&REPO_NAME.test(name)&&name!=="."&&name!=="..";}
export function repositoryManifest(name,description=""){
 if(!validateRepositoryName(name))throw new TypeError("invalid repository name");
 return Object.freeze({name,description:typeof description==="string"?description.slice(0,MAX):"",backend:"git",mode:"local-repository-manifest",bare:true,initialized:false,remote:null,creationEnabled:false});
}
export function riverGitStatus(){return Object.freeze({name:"RiverGit",phase:"foundation",gitCompatible:true,hostingImplemented:false,remotePushEnabled:false,repositoryCreationEnabled:false,authenticationImplemented:false,backupImplemented:false,notes:["Uses Git as the underlying version-control engine","Manifest only; no repository created","Hosting, authentication, backup and service runtime are future work"]});}
