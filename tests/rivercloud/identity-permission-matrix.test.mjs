import test from "node:test";
import assert from "node:assert/strict";
import { hasPermission, RC13_ROLE_POLICY } from "../../infra/rivercloud/rc13-identity.mjs";

test("route permission matrix is explicit and least-privilege scoped", () => {
  const matrix = {
    owner: ["manage_users","manage_projects","approve_jobs","read_audit","read_status","read_jobs"],
    admin: ["manage_users","manage_projects","approve_jobs","read_audit","read_status","read_jobs"],
    operator: ["manage_projects","approve_jobs","read_status","read_jobs"],
    auditor: ["read_audit","read_status"],
    viewer: ["read_status"]
  };
  for (const [role, expected] of Object.entries(matrix)) {
    const actor = { roles:[role] };
    for (const permission of ["manage_users","manage_projects","approve_jobs","read_audit","read_status","read_jobs"]) {
      assert.equal(hasPermission(actor,permission),expected.includes(permission),role+" -> "+permission);
    }
  }
});

test("invalid role and permission are denied", () => {
  assert.equal(hasPermission({roles:["unknown"]},"read_status"),false);
  assert.equal(hasPermission({roles:["viewer"]},"manage_projects"),false);
  assert.equal(hasPermission({roles:["owner"]},"invented_permission"),false);
});
