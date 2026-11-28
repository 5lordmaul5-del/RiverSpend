import fs from "node:fs";import path from "node:path";import {randomUUID} from "node:crypto";
const file=path.resolve(process.env.RIVERSSAI_MEMORY_FILE||"./data/memory.json");
function ensure(){fs.mkdirSync(path.dirname(file),{recursive:true});if(!fs.existsSync(file))fs.writeFileSync(file,JSON.stringify({entries:[]},null,2),{mode:0o600});}
export function listMemory(){ensure();return JSON.parse(fs.readFileSync(file,"utf8")).entries;}
export function addMemory(text){if(typeof text!=="string"||!text.trim()||text.length>2000)throw new Error("invalid-memory");ensure();const db=JSON.parse(fs.readFileSync(file,"utf8"));const entry={id:randomUUID(),text:text.trim(),createdAt:new Date().toISOString()};db.entries.push(entry);fs.writeFileSync(file,JSON.stringify(db,null,2),{mode:0o600});return entry;}
export function deleteMemory(id){ensure();const db=JSON.parse(fs.readFileSync(file,"utf8"));const n=db.entries.length;db.entries=db.entries.filter(e=>e.id!==id);fs.writeFileSync(file,JSON.stringify(db,null,2),{mode:0o600});return n!==db.entries.length;}
export function clearMemory(){ensure();fs.writeFileSync(file,JSON.stringify({entries:[]},null,2),{mode:0o600});}