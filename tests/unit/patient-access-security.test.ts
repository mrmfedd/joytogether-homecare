import { describe, expect, it, vi, beforeEach } from "vitest";
import { PatientAccessDeniedError } from "@/lib/patient/access";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    patientAssignment: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/prisma";
import { assertPatientAccess, employeeHasActivePatientAssignment } from "@/lib/patient/access";

describe("patient access security", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("denies office roles without directory permission", async () => {
    await expect(
      assertPatientAccess({ kind: "admin", userId: "u1", role: "RECRUITER" }, "patient-1"),
    ).rejects.toBeInstanceOf(PatientAccessDeniedError);
  });

  it("allows office roles with directory permission", async () => {
    await expect(
      assertPatientAccess({ kind: "admin", userId: "u1", role: "ADMIN" }, "patient-1"),
    ).resolves.toEqual({ mode: "office" });
  });

  it("denies employees without active assignment", async () => {
    vi.mocked(prisma.patientAssignment.findFirst).mockResolvedValue(null);
    await expect(
      assertPatientAccess({ kind: "employee", userId: "e1", profileId: "p1", role: "EMPLOYEE" }, "patient-1"),
    ).rejects.toBeInstanceOf(PatientAccessDeniedError);
  });

  it("allows employees with active assignment", async () => {
    vi.mocked(prisma.patientAssignment.findFirst).mockResolvedValue({ id: "a1" } as never);
    await expect(
      assertPatientAccess({ kind: "employee", userId: "e1", profileId: "p1", role: "EMPLOYEE" }, "patient-1"),
    ).resolves.toEqual({ mode: "assignment" });
  });

  it("employeeHasActivePatientAssignment reflects database row", async () => {
    vi.mocked(prisma.patientAssignment.findFirst).mockResolvedValue({ id: "a2" } as never);
    await expect(employeeHasActivePatientAssignment("profile", "patient")).resolves.toBe(true);
  });
});