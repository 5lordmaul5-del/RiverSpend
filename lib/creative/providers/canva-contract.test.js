import test from "node:test";
import assert from "node:assert/strict";
import { normalizeCreativeBrief, validateExportMetadata, publicationGate } from "./canva-contract.js";

test("brief requires core fields and trims strings", () => {
  assert.throws(() => normalizeCreativeBrief({}), TypeError);
  const b = normalizeCreativeBrief({title:" Banner ", purpose:" Campaign ", format:" 16:9 ", requiredText:[" RS Spons ",""], constraints:[" aqua "]});
  assert.equal(b.title, "Banner");
  assert.deepEqual(b.requiredText, ["RS Spons"]);
  assert.equal(b.provider, "canva");
});

test("export metadata validation rejects bad types, sizes, dimensions and path names", () => {
  assert.equal(validateExportMetadata({mimeType:"image/png",sizeBytes:1024,width:800,height:600,filename:"banner.png"}).ok, true);
  assert.equal(validateExportMetadata({mimeType:"application/octet-stream",sizeBytes:0,width:-1,height:0,filename:"../x"}).ok, false);
});

test("publication is blocked without explicit approval", () => {
  assert.equal(publicationGate().allowed, false);
  assert.equal(publicationGate({approval:"explicit-user-approval"}).allowed, true);
});
