import http from "node:http";
import {listMemory} from "./memory.js";
import {getToolRegistry} from "./tools.js";
import {SpecialistRegistry} from "./specialist-registry.js";
import {SpecialistScheduler} from "./scheduler.js";

const host=process.env.RIVERSSAI_HOST||"127.0.0.1",port=Number(process.env.RIVERSSAI_PORT||3030),provider=process.env.RIVERSSAI_PROVIDER||"none";
const LOOPBACK=new Set(["127.0.0.1","::1","localhost"]);
function send(res,code,body){res.writeHead(code,{"content-type":"application/json; charset=utf-8","cache-control":"no-store","x-content-type-options":"nosniff"});res.end(JSON.stringify(body));}
export function createServer({registry=new SpecialistRegistry(),scheduler=null}={}){
 const planner=scheduler||new SpecialistScheduler({registry});
 return http.createServer((req,res)=>{
  if(req.method!=="GET")return send(res,405,{error:"method-not-allowed"});
  let url;
  try{url=new URL(req.url||"/","http://127.0.0.1");}catch{return send(res,400,{error:"invalid-url"});}
  if(url.pathname==="/health")return send(res,200,{ok:true});
  if(url.pathname==="/status")return send(res,200,{name:"RiverSSAI 10.0",version:"0.1.1",state:"starter-core",provider,modelConnected:false,toolsEnabled:false,mode:"safe-readonly",note:"Nucleo iniziale; modello non collegato"});
  if(url.pathname==="/tools")return send(res,200,{tools:getToolRegistry()});
  if(url.pathname==="/memory")return send(res,200,{entries:listMemory(),mode:"read-only"});
  if(url.pathname==="/specialists"){
   try{return send(res,200,registry.list({offset:Number(url.searchParams.get("offset")||0),limit:Number(url.searchParams.get("limit")||100),domain:url.searchParams.get("domain")||undefined}));}
   catch(e){return send(res,400,{error:e.message||"invalid-specialist-query"});}
  }
  if(url.pathname==="/scheduler/status")return send(res,200,planner.status());
  return send(res,404,{error:"not-found"});
 });
}
export function startServer({bindHost=host,bindPort=port}={}){
 if(!LOOPBACK.has(bindHost))throw new Error("RiverSSAI starter core must bind loopback only");
 if(!Number.isInteger(bindPort)||bindPort<0||bindPort>65535)throw new Error("invalid port");
 const server=createServer();
 server.listen(bindPort,bindHost);
 return server;
}
if(process.argv[1]&&new URL(import.meta.url).pathname===process.argv[1])startServer().once("listening",()=>console.log("RiverSSAI core: http://"+host+":"+port));
