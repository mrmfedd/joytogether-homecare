import { describe, expect, it } from "vitest";
import { formatPatientPublicId } from "@/lib/patient/public-id";
import {
  canEmployeeAccessPatientPortal,
  canManagePatients,
  canViewPatientDirectory,
  isFieldCareEmployee,
} from "@/lib/patient/permissions";

describe("patient permissions", () => {
  it("grants patient administration to office coordinator roles", () => {
    expect(canManagePatients("CARE_COORDINATOR")).toBe(true);
    expect(canManagePatients("VIEWER")).toBe(false);
    expect(canManagePatients("EMPLOYEE")).toBe(false);
  });

  it("allows directory read for viewer", () => {
    expect(canViewPatientDirectory("VIEWER")).toBe(true);
    expect(canViewPatientDirectory("RECRUITER")).toBe(false);
  });

  it("limits employee portal patient access to EMPLOYEE role", () => {
    expect(canEmployeeAccessPatientPortal("EMPLOYEE")).toBe(true);
    expect(canEmployeeAccessPatientPortal("ADMIN")).toBe(false);
  });

  it("recognizes field care classifications", () => {
    expect(isFieldCareEmployee("CAREGIVER")).toBe(true);
    expect(isFieldCareEmployee("SCHEDULER")).toBe(false);
  });

  it("formats stable public patient ids", () => {
    expect(formatPatientPublicId(1, 2026)).toBe("JT-2026-00001");
  });
});