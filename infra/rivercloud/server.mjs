// RiverCloud local control-plane prototype. Queue-only: NEVER runs builds or shell commands.
import http from "node:http";
import { createHash, timingSafeEqual } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { validateDeployRequest, planDigest } from "./engine.mjs";

const HOST = process.env.RIVERCLOUD_ENGINE_HOST || "127.0.0.1";
const PORT = Number(process.env.RIVERCLOUD_ENGINE_PORT || 8787);
const TOKEN = process.env.RIVERCLOUD_ENGINE_TOKEN || "";
const STORE = path.resolve(process.env.RIVERCLOUD_QUEUE_DIR || "./queue-data");
const MAX_BODY = 8192;

if (HOST !== "127.0.0.1" && HOST !== "::1") throw new Error("Prototype must bind loopback only");
if (TOKEN.length < 32) throw new Error("Set RIVERCLOUD_ENGINE_TOKEN to a random token of at least 32 characters");

await mkdir(STORE, {recursive:true, mode:0o700});
async function records(){ try{return JSON.parse(await readFile(path.join(STORE,"jobs.json"),"utf8"));}catch(e){if(e.code==="ENOENT")return [];throw e;} }
async function save(items){await writeFile(path.join(STORE,"jobs.json"),JSON.stringify(items,null,2),{mode:0o600});}
function auth(req){const h=req.headers.authorization||"";const supplied=h.startsWith("Bearer ")?h.slice(7):"";const a=Buffer.from(supplied);const b=Buffer.from(TOKEN);return a.length===b.length&&timingSafeEqual(a,b);}
async function body(req){let chunks=[],size=0;for await(const chunk of req){size+=chunk.length;if(size>MAX_BODY)throw Object.assign(new Error("body_too_large"),{status:413});chunks.push(chunk);}try{return JSON.parse(Buffer.concat(chunks).toString("utf8"));}catch{throw Object.assign(new Error("invalid_json"),{status:400});}}
function respond(res,status,obj){res.writeHead(status,{"content-type":"application/json","cache-control":"no-store"});res.end(JSON.stringify(obj));}
const server=http.createServer(async(req,res)=>{try{
 if(!auth(req))return respond(res,401,{error:"unauthorized"});
 if(req.method==="GET"&&req.url==="/health")return respond(res,200,{status:"queue_prototype",runnerConnected:false});
 if(req.method==="GET"&&req.url==="/jobs"){const list=await records();return respond(res,200,{jobs:list});}
 if(req.method==="POST"&&req.url==="/deploy"){const input=await body(req);const plan=validateDeployRequest(input);const digest=planDigest(plan);const list=await records();if(list.some(x=>x.digest===digest))return respond(res,200,{job:list.find(x=>x.digest===digest),duplicate:true});const job={id:digest.slice(0,16),digest,plan,createdAt:new Date().toISOString(),state:"accepted_not_executed"};list.unshift(job);await save(list);return respond(res,202,{job,notice:"Queued as a plan only; no build or deployment is executed."});}
 return respond(res,404,{error:"not_found"});
 }catch(e){respond(res,e.status||400,{error:e.message||"request_failed"});}});
server.listen(PORT,HOST,()=>console.log("RiverCloud local queue prototype listening on "+HOST+":"+PORT));
