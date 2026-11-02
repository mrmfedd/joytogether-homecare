import { describe, expect, it } from "vitest";
import { employeeMeetsOfferRequirements, rangesOverlap } from "@/lib/workforce/shifts";

describe("rangesOverlap", () => {
  it("detects overlapping intervals", () => {
    const a0 = new Date("2026-01-01T09:00:00Z");
    const a1 = new Date("2026-01-01T17:00:00Z");
    const b0 = new Date("2026-01-01T16:00:00Z");
    const b1 = new Date("2026-01-01T20:00:00Z");
    expect(rangesOverlap(a0, a1, b0, b1)).toBe(true);
  });

  it("returns false for adjacent non-overlapping intervals", () => {
    const a0 = new Date("2026-01-01T09:00:00Z");
    const a1 = new Date("2026-01-01T17:00:00Z");
    const b0 = new Date("2026-01-01T17:00:00Z");
    const b1 = new Date("2026-01-01T20:00:00Z");
    expect(rangesOverlap(a0, a1, b0, b1)).toBe(false);
  });
});

describe("employeeMeetsOfferRequirements", () => {
  const creds = [{ name: "CNA License", expiresAt: new Date("2027-01-01") }];

  it("requires matching classification when specified", () => {
    expect(employeeMeetsOfferRequirements("RN", creds, "CNA", null)).toBe(false);
    expect(employeeMeetsOfferRequirements("CNA", creds, "CNA", null)).toBe(true);
  });

  it("requires valid credential name when specified", () => {
    expect(employeeMeetsOfferRequirements("CNA", creds, null, "BLS")).toBe(false);
    expect(employeeMeetsOfferRequirements("CNA", creds, null, "CNA License")).toBe(true);
  });

  it("passes when no requirements", () => {
    expect(employeeMeetsOfferRequirements("CAREGIVER", [], null, null)).toBe(true);
  });
});
