import { createHash } from "node:crypto";

const MAX_TOTAL=100000;
const MAX_PAGE=500;
const ROLES=Object.freeze(["architect","developer","reviewer","security-specialist","data-specialist","tester","documenter","operator","analyst","recovery-specialist"]);
const DOMAINS=Object.freeze(["general","architecture","coding","security","testing","data","operations","documentation","recovery","research","product","commerce","payments","logistics","identity","privacy","accessibility","finance","legal","health","education","analytics","marketing","design","support","translation","hardware","networking","infrastructure","storage","ai-models","automation","governance","risk","quality","customer-service","content","media","game-development","mobile","web","api","cloud","deployment","monitoring","backup","disaster-recovery","supply-chain","compliance","sustainability","security-testing","prompt-engineering","evaluation"]);
const KEYWORDS=Object.freeze([
 {domain:"security",words:["security","secure","protect","privacy","risk","threat"]},
 {domain:"testing",words:["test","verify","quality","qa","validation"]},
 {domain:"coding",words:["code","developer","program","implement","bug","fix"]},
 {domain:"data",words:["database","data","sql","analytics","query"]},
 {domain:"operations",words:["ops","monitor","operations","runbook"]},
 {domain:"deployment",words:["deploy","release","hosting","publish"]},
 {domain:"payments",words:["payment","pay","checkout","money","transaction"]},
 {domain:"logistics",words:["shipping","delivery","courier","tracking"]},
 {domain:"documentation",words:["document","docs","write","manual"]},
 {domain:"recovery",words:["backup","restore","disaster","recovery"]},
 {domain:"research",words:["research","investigate","study"]},
 {domain:"design",words:["design","ui","ux","visual"]},
 {domain:"support",words:["support","help","customer"]},
 {domain:"legal",words:["legal","compliance","regulatory"]},
 {domain:"education",words:["school","learn","training","education"]}
]);
const idFor=index=>"rs-specialist-"+String(index+1).padStart(6,"0");
const hashNumber=value=>Number.parseInt(createHash("sha256").update(String(value)).digest("hex").slice(0,8),16);

/** Virtual catalog: definitions are generated on demand; no specialist processes are created. */
export class SpecialistRegistry {
 constructor({total=MAX_TOTAL}={}) {
  if(!Number.isInteger(total)||total<DOMAINS.length||total>MAX_TOTAL)throw new Error("total must be between domain count and 100000");
  this.total=total;
  this.domains=DOMAINS;
  this.roles=ROLES;
 }
 get(id) {
  if(typeof id!=="string")return null;
  const match=/^rs-specialist-(\d{6})$/.exec(id);
  if(!match)return null;
  const number=Number(match[1]),index=number-1;
  if(number<1||index>=this.total||idFor(index)!==id)return null;
  const domainIndex=index%DOMAINS.length,slot=Math.floor(index/DOMAINS.length),roleIndex=slot%ROLES.length,generation=Math.floor(slot/ROLES.length)+1;
  const role=ROLES[roleIndex],domain=DOMAINS[domainIndex];
  return Object.freeze({id,index:number,role,domain,generation,name:role+" — "+domain+" specialist "+generation,description:"Virtual specialist definition for "+domain+"; activation and execution are disabled.",definitionOnly:true,activeProcess:false,processCount:0,executionEnabled:false,capabilities:Object.freeze(["planning","analysis","review"])});
 }
 list({offset=0,limit=100,domain}={}) {
  if(!Number.isInteger(offset)||offset<0||offset>this.total)throw new Error("offset out of range");
  if(!Number.isInteger(limit)||limit<1||limit>MAX_PAGE)throw new Error("limit must be 1..500");
  if(domain!==undefined&&(!DOMAINS.includes(domain)||typeof domain!=="string"))throw new Error("unknown domain");
  const items=[];
  if(domain===undefined){
   const end=Math.min(this.total,offset+limit);
   for(let index=offset;index<end;index++)items.push(this.get(idFor(index)));
   return Object.freeze({registryVersion:"virtual-1",total:this.total,offset,limit,domain:null,items:Object.freeze(items),activeProcesses:0,executionEnabled:false});
  }
  const domainIndex=DOMAINS.indexOf(domain);
  const count=domainIndex>=this.total?0:Math.floor((this.total-1-domainIndex)/DOMAINS.length)+1;
  if(offset>count)throw new Error("offset out of range");
  const start=domainIndex+offset*DOMAINS.length;
  for(let index=start;index<this.total&&items.length<limit;index+=DOMAINS.length)items.push(this.get(idFor(index)));
  return Object.freeze({registryVersion:"virtual-1",total:count,offset,limit,domain,items:Object.freeze(items),activeProcesses:0,executionEnabled:false});
 }
 inferDomain(goal) {
  if(typeof goal!=="string")return "general";
  const text=goal.toLowerCase();
  for(const entry of KEYWORDS)if(entry.words.some(word=>text.includes(word)))return entry.domain;
  return "general";
 }
 selectForTask({taskId,goal,domain}={}) {
  if(typeof goal!=="string"||!goal.trim())throw new Error("goal required");
  const resolved=domain||this.inferDomain(goal);
  const domainIndex=DOMAINS.indexOf(resolved);
  if(domainIndex<0)throw new Error("unknown domain");
  const count=domainIndex>=this.total?0:Math.floor((this.total-1-domainIndex)/DOMAINS.length)+1;
  if(count<1)throw new Error("domain unavailable in this registry");
  const slot=hashNumber(taskId||goal)%count;
  return this.get(idFor(domainIndex+slot*DOMAINS.length));
 }
}
