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
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects honeypot submissions with website field content", () => {
    const parsed = consultationSchema.safeParse({
      fullName: "Bot",
      email: "bot@example.com",
      phone: "1",
      careType: "Other",
      website: "http://spam",
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.website).toBeTruthy();
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
