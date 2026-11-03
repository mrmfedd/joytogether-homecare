import assert from "node:assert/strict";
import {
  canManageCareers,
  canManageContent,
  canManageLeads,
  canManageSettings,
  canManageUsers,
  canViewLeadContact,
  canViewReports,
} from "../src/lib/permissions";

assert.equal(canManageUsers("SUPER_ADMIN"), true);
assert.equal(canManageUsers("ADMIN"), false);
assert.equal(canManageSettings("ADMIN"), true);
assert.equal(canManageSettings("VIEWER"), false);
assert.equal(canManageLeads("CARE_COORDINATOR"), true);
assert.equal(canManageContent("CONTENT_EDITOR"), true);
assert.equal(canManageCareers("RECRUITER"), true);
assert.equal(canViewReports("VIEWER"), false);
assert.equal(canViewLeadContact("VIEWER"), false);
assert.equal(canViewLeadContact("ADMIN"), true);

console.log("Permission tests passed.");
