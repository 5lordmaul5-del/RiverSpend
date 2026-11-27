/**
 * I.S.S.A. Sphere integration pipeline — orchestration of supplied model data.
 * Not connected to a live audio stream, sensor, DSP graph or physical device.
 */
import { createSphereIntelSnapshot } from "./issa-sphere-audio-intelligence.js";
import { sphereTargetFromSource, normalizeSphereConfig } from "./issa-sphere-ambient.js";
import { assessSphereMotion, limitSphereStep, normalizeSphereSafety } from "./issa-sphere-motion-safety.js";

export function runSpherePipeline(input={}){
 const config=normalizeSphereConfig(input.config??{});
 const safety=normalizeSphereSafety(input.safety??{});
 const sources=Array.isArray(input.sources)?input.sources:[];
 const now=Number.isFinite(Number(input.now))?Number(input.now):0;
 const intelligence=createSphereIntelSnapshot(sources,input.intelligence??{},input.previousFocusId??null);
 const selected=sources.find(s=>String(s?.id??"")===String(intelligence.focusId??""));
 const virtualTarget=selected?sphereTargetFromSource(selected,config):{yaw:config.yaw,pitch:config.pitch,active:false};
 const assessment=assessSphereMotion(input.currentOrientation??{},{
   active:virtualTarget.active===true,azimuth:virtualTarget.yaw,elevation:virtualTarget.pitch,
   timestamp:selected?.timestamp??now},safety,now);
 const nextOrientation=assessment.allowed?limitSphereStep(input.currentOrientation??{},assessment.target,safety,input.dt??1/60):
   {yaw:Number(input.currentOrientation?.yaw??config.yaw),pitch:Number(input.currentOrientation?.pitch??config.pitch),moving:false};
 return {schemaVersion:1,pipeline:"ISSA_SPHERE_PIPELINE",focusId:intelligence.focusId,
  intelligence,virtualTarget,assessment,nextOrientation,
  status:assessment.allowed?"virtual-target-accepted":"virtual-hold",
  disclaimer:"Orchestration of model data only; no live audio analysis, rendering, sensor or physical actuation."};
}
