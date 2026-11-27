/** I.S.S.A. output headroom utilities (pure model; not a live audio limiter). */
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const finite=x=>Number.isFinite(Number(x));
export function normalizeHeadroomSettings(input={}){
 return {ceilingDb:clamp(finite(input.ceilingDb)?Number(input.ceilingDb):-1,-12,0),
  safetyGainDb:clamp(finite(input.safetyGainDb)?Number(input.safetyGainDb):-3,-24,0),
  peakMode:["sample-peak","estimated-peak"].includes(input.peakMode)?input.peakMode:"sample-peak",
  enabled:input.enabled!==false};
}
export function dbToLinear(db){if(!finite(db))throw new TypeError("dB value must be finite");return Math.pow(10,Number(db)/20);}
export function linearToDb(value){if(!finite(value)||Number(value)<=0)return -Infinity;return 20*Math.log10(Number(value));}
export function estimatePeakAfterGain(peak,input={}){
 const s=normalizeHeadroomSettings(input);
 const p=clamp(finite(peak)?Number(peak):0,0,16);
 if(!s.enabled)return {inputPeak:p,estimatedOutputPeak:p,ceilingLinear:dbToLinear(s.ceilingDb),gainApplied:1,settings:s};
 const fixedGain=dbToLinear(s.safetyGainDb),ceiling=dbToLinear(s.ceilingDb);
 const gain=Math.min(fixedGain, p>0?ceiling/p:fixedGain);
 return {inputPeak:p,estimatedOutputPeak:p*gain,ceilingLinear:ceiling,gainApplied:gain,settings:s};
}
export function assessSummedSourcePeak(sourcePeaks=[]){
 if(!Array.isArray(sourcePeaks))throw new TypeError("sourcePeaks must be an array");
 const valid=sourcePeaks.map(Number).filter(v=>Number.isFinite(v)&&v>=0);
 const worstCase=valid.reduce((sum,v)=>sum+v,0);
 return {sourceCount:valid.length,linearWorstCasePeak:worstCase,worstCaseDb:linearToDb(worstCase),
  warning:worstCase>1?"Summed sources may exceed full scale; reserve headroom or use a real limiter.":null};
}
