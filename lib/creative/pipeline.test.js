import test from "node:test";
import assert from "node:assert/strict";
import { planCreativePipeline, validatePipelineAsset, checkPipelinePublication } from "./pipeline.js";

const brief={title:"RS Spons campaign",purpose:"Marketplace promo",format:"1920x600",requiredText:["RS Spons"],constraints:["RiverSpend aqua and gold"]};

test("pipeline planner is fail-closed without provider authorization",()=>{
 const p=planCreativePipeline(brief);
 assert.equal(p.canProceedToDesign,false);
 assert.equal(p.publishAllowed,false);
 assert.equal(p.steps.find(s=>s.id==="provider").status,"blocked");
 assert.equal(p.steps.find(s=>s.id==="publish").status,"blocked");
});
test("planner indicates authorized provider but still blocks downstream live actions",()=>{
 const p=planCreativePipeline(brief,{canvaAuthorized:true});
 assert.equal(p.canProceedToDesign,true);
 assert.equal(p.steps.find(s=>s.id==="provider").status,"ready");
 assert.equal(p.steps.find(s=>s.id==="design").status,"blocked");
 assert.equal(p.publishAllowed,false);
});
test("asset validation wrapper and approval gate",()=>{
 assert.equal(validatePipelineAsset({mimeType:"image/png",sizeBytes:4096,width:1920,height:600,filename:"rs-spons.png"}).ok,true);
 assert.equal(checkPipelinePublication().allowed,false);
});
