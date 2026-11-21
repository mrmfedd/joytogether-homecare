import { describe, expect, it } from "vitest";
import { safePortalCallbackUrl } from "@/lib/auth/portal-callback";

describe("safePortalCallbackUrl", () => {
  it("keeps employee paths only for employee portal", () => {
    expect(safePortalCallbackUrl("/employee/schedule", "employee")).toBe("/employee/schedule");
    expect(safePortalCallbackUrl("/admin/leads", "employee")).toBe("/employee");
  });

  it("keeps admin paths only for admin portal", () => {
    expect(safePortalCallbackUrl("/admin/reports", "admin")).toBe("/admin/reports");
    expect(safePortalCallbackUrl("/employee", "admin")).toBe("/admin");
  });
});