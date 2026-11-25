// RC-9 facade migrated to RC-17 atomic lifecycle/audit storage.
import path from "node:path";
import { createLifecycleJobAtomic, transitionLifecycleJobAtomic, readAtomicLifecycle } from "./rc17-atomic-lifecycle.mjs";
export const STATES=["pending","approved","rejected","prepared","running","completed","failed","cancelled"];
const transitions={pending:new Set(["approved","rejected","cancelled"]),approved:new Set(["prepared","cancelled"]),rejected:new Set(),prepared:new Set(["running","cancelled","failed"]),running:new Set(["completed","failed"]),completed:new Set(),failed:new Set(["prepared"]),cancelled:new Set()};
export function transitionAllowed(from,to){return STATES.includes(from)&&transitions[from]?.has(to)===true;}
function fileFor(storeDir){if(typeof storeDir!=="string"||!storeDir.trim())throw new Error("store_dir_required");return path.join(storeDir,"lifecycle.json");}
export async function createLifecycleJob({storeDir,jobId,digest,plan,actor="system"}){return createLifecycleJobAtomic(fileFor(storeDir),{jobId,digest,plan,actor});}
export async function transitionJob({storeDir,jobId,to,actor="system",note=""}){return transitionLifecycleJobAtomic(fileFor(storeDir),{jobId,to,actor,note});}
export async function readLifecycle(storeDir){return readAtomicLifecycle(fileFor(storeDir));}
