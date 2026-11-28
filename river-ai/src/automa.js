// RiverAutoma: architecture manifest for a staged, self-hostable toolchain.
// This is descriptive groundwork, not an installer, orchestration runtime or clone.
const SERVICES=[
 {id:"river-ai",name:"RiverSSAI",category:"ai-core",ownership:"in-development",externalDependency:false,description:"Independent AI core and task planning foundation."},
 {id:"river-git",name:"RiverGit",category:"source-control",ownership:"planned",externalDependency:false,description:"Self-hosted repository/version-control service; not implemented."},
 {id:"river-deploy",name:"RiverDeploy",category:"build-deploy",ownership:"planned",externalDependency:false,description:"Self-hosted build and deployment engine; not implemented."},
 {id:"river-cloud",name:"RiverCloud",category:"storage-infrastructure",ownership:"in-development",externalDependency:false,description:"Independent cloud infrastructure core; not yet production infrastructure."},
 {id:"vercel-adapter",name:"Vercel",category:"external-platform-adapter",ownership:"external",externalDependency:true,description:"Optional integration with the external Vercel platform."},
 {id:"github-adapter",name:"GitHub",category:"external-platform-adapter",ownership:"external",externalDependency:true,description:"Optional integration with the external GitHub platform."},
 {id:"river-watch",name:"RiverWatch",category:"monitoring",ownership:"in-development",externalDependency:false,description:"Local event and alert foundation."},
 {id:"river-fortress",name:"RiverFortress",category:"security-resilience",ownership:"planned",externalDependency:false,description:"Security, backup and recovery architecture."}
];
export function listAutomaServices(){return SERVICES.map(s=>({...s}));}
export function getAutomaOverview(){return Object.freeze({name:"RiverAutoma",purpose:"Self-hosted ecosystem orchestration roadmap",executionEnabled:false,installationEnabled:false,services:Object.freeze(SERVICES.map(s=>Object.freeze({...s}))),disclaimer:"Manifest only: no services installed, provisioned, connected or running."});}
export function getService(id){const s=SERVICES.find(x=>x.id===id);return s?{...s}:null;}
