import assert from "node:assert/strict";
import {
  canManagePatients,
  canViewPatientDirectory,
} from "../src/lib/patient/permissions";

assert.equal(canManagePatients("ADMIN"), true);
assert.equal(canViewPatientDirectory("VIEWER"), true);
assert.equal(canManagePatients("CONTENT_EDITOR"), false);
console.log("Patient permission script tests passed.");