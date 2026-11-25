// RiverControl: read-only status aggregation for RiverSSAI modules.
// No network calls, credentials, execution or mutation actions.
import {ROLES,PERMISSIONS} from "./identity.js";
export function controlSnapshot(){
 return Object.freeze({
  name:"RiverControl",
  version:"foundation-1",
  mode:"local-foundation",
  executionEnabled:false,
  modelConnected:false,
  deploymentEnabled:false,
  modules:Object.freeze({
   identity:{status:"static-policy",roles:[...ROLES],permissionCount:PERMISSIONS.length},
   guard:{status:"policy-foundation",executionEnabled:false},
   audit:{status:"local-log-foundation",integrated:false},
   memory:{status:"local-file-foundation",httpWriteEnabled:false},
   knowledge:{status:"local-notes-foundation",integrated:false},
   provider:{status:"mock-only",liveInference:false},
   tasks:{status:"planning-only",executionEnabled:false},
   tools:{status:"registry-only",mutationsEnabled:false}
  }),
  warnings:Object.freeze(["Not authentication or production security","No runtime integration; status is descriptive","Execution is disabled"])
 });
}
