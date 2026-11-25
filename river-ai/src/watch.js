// RiverWatch: local bounded in-memory event observation and alert classification.
// No process/network probing, automatic remediation or execution.
const ALLOWED=["core","identity","guard","audit","memory","knowledge","provider","tasks","tools","control"];
const MAX_EVENTS=200, MAX_FIELD=160;
const SEVERITY=["info","warning","critical"];
function safeText(v){return typeof v==="string"?v.slice(0,MAX_FIELD):"";}
export function classifyWatchEvent(input={}){
 const component=ALLOWED.includes(input.component)?input.component:"core";
 const severity=SEVERITY.includes(input.severity)?input.severity:"info";
 const type=safeText(input.type||"status");
 const message=safeText(input.message||"");
 return Object.freeze({component,severity,type,message, timestamp:typeof input.timestamp==="string"?input.timestamp:new Date().toISOString()});
}
export class RiverWatch{
 #events=[];
 #alerts=[];
 record(input){
  const event=classifyWatchEvent(input);this.#events.push(event);
  if(this.#events.length>MAX_EVENTS)this.#events.shift();
  if(event.severity==="warning"||event.severity==="critical"){
   const alert=Object.freeze({event,acknowledged:false});
   this.#alerts.push(alert);if(this.#alerts.length>MAX_EVENTS)this.#alerts.shift();
  }
  return event;
 }
 events({limit=MAX_EVENTS}={}){const n=Math.max(0,Math.min(MAX_EVENTS,Number.isFinite(limit)?Math.floor(limit):MAX_EVENTS));return this.#events.slice(-n);}
 alerts({unacknowledgedOnly=false}={}){return this.#alerts.filter(a=>!unacknowledgedOnly||!a.acknowledged);}
 acknowledge(index){
  if(!Number.isInteger(index)||index<0||index>=this.#alerts.length)return false;
  const a=this.#alerts[index];this.#alerts[index]=Object.freeze({...a,acknowledged:true});return true;
 }
 summary(){return Object.freeze({eventCount:this.#events.length,alertCount:this.#alerts.length,unacknowledged:this.#alerts.filter(a=>!a.acknowledged).length,critical:this.#alerts.filter(a=>a.event.severity==="critical"&&!a.acknowledged).length,warning:this.#alerts.filter(a=>a.event.severity==="warning"&&!a.acknowledged).length});}
 clear(){this.#events=[];this.#alerts=[];}
}
