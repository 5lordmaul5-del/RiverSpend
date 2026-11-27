/** RiverCloud metadata-only snapshot foundation. */
export function createProjectSnapshot(input = {}) {
  const projectId = String(input.projectId || "").trim();
  const projectName = String(input.projectName || "").trim();
  if (!projectId || !projectName) throw new TypeError("projectId and projectName are required");
  const items = (Array.isArray(input.items) ? input.items : []).map(item => ({
    path: String(item.path || "").trim(), kind: String(item.kind || "file"),
    version: String(item.version || "unknown"), checksum: item.checksum ? String(item.checksum) : null
  })).filter(item => item.path);
  return Object.freeze({ schema:"rivercloud.snapshot.v1", projectId, projectName,
    createdAt: input.createdAt || new Date().toISOString(), items, itemCount:items.length });
}
export function validateProjectSnapshot(snapshot) {
  const errors=[];
  if (!snapshot || typeof snapshot !== "object") return {valid:false,errors:["snapshot must be an object"]};
  if (snapshot.schema !== "rivercloud.snapshot.v1") errors.push("unsupported schema");
  if (!snapshot.projectId) errors.push("projectId is required");
  if (!snapshot.projectName) errors.push("projectName is required");
  if (!Array.isArray(snapshot.items)) errors.push("items must be an array");
  else snapshot.items.forEach((item,i)=>{if (!item || !item.path) errors.push(`items[${i}].path is required`);});
  if (snapshot.itemCount !== snapshot.items?.length) errors.push("itemCount does not match items");
  return {valid:errors.length===0,errors};
}