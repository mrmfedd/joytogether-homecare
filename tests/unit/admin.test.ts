import { describe, expect, it } from "vitest";
import { consultationSchema } from "@/lib/validation/consultation";
import { canManageUsers, canViewLeadContact } from "@/lib/permissions";

describe("consultationSchema", () => {
  it("accepts valid marketing inquiry payload", () => {
    const parsed = consultationSchema.safeParse({
      fullName: "Jane Doe",
      email: "jane@example.com",
      phone: "8135551212",
      careType: "Private Duty",
      source: "homepage",
      consent: true,
    });
    expect(parsed.success).toBe(true);
  });

  it("allows honeypot field for silent bot handling", () => {
    const parsed = consultationSchema.safeParse({
      fullName: "Jane Doe",
      email: "jane@example.com",
      phone: "8135551212",
      careType: "Other",
      consent: true,
      website: "",
    });
    expect(parsed.success).toBe(true);
  });
});

describe("permissions", () => {
  it("restricts user admin to SUPER_ADMIN", () => {
    expect(canManageUsers("SUPER_ADMIN")).toBe(true);
    expect(canManageUsers("ADMIN")).toBe(false);
  });

  it("masks lead contact from VIEWER", () => {
    expect(canViewLeadContact("VIEWER")).toBe(false);
    expect(canViewLeadContact("ADMIN")).toBe(true);
  });
});
