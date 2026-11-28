import { normalizeCreativeBrief, validateExportMetadata, publicationGate } from "./providers/canva-contract.js";

/** Pure orchestration planner: describes work, does not call Canva or storage. */
export function planCreativePipeline(rawBrief, options = {}) {
  const brief = normalizeCreativeBrief(rawBrief);
  const steps = [
    { id:"brief", status:"ready", detail:"Brief validated and normalized." },
    { id:"provider", status: options.canvaAuthorized ? "ready" : "blocked", detail: options.canvaAuthorized ? "Canva authorization marked available by caller." : "Canva authorization required." },
    { id:"design", status:"blocked", detail:"Design creation requires an authorized Canva adapter." },
    { id:"export", status:"blocked", detail:"Export requires supported Canva export API and adapter." },
    { id:"validate", status:"blocked", detail:"Export metadata and asset validation will run after export." },
    { id:"archive", status:"blocked", detail:"RiverSpend storage integration is not yet connected." },
    { id:"publish", status:"blocked", detail:"Publishing requires explicit user approval." },
  ];
  if (options.canvaAuthorized) steps[1].status = "ready";
  return Object.freeze({ brief, steps, canProceedToDesign: Boolean(options.canvaAuthorized), publishAllowed:false });
}

export function validatePipelineAsset(metadata, limits) {
  return validateExportMetadata(metadata, limits);
}
export function checkPipelinePublication(approval) {
  return publicationGate({ approval });
}
