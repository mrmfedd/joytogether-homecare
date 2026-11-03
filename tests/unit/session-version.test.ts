import { describe, expect, it } from "vitest";
import { isJwtSessionValid } from "@/lib/auth/session-version";

describe("JWT sessionVersion enforcement", () => {
  it("accepts matching version for active user", () => {
    expect(isJwtSessionValid({ active: true, dbSessionVersion: 2, tokenSessionVersion: 2 })).toBe(true);
  });

  it("rejects stale JWT after recovery increments sessionVersion", () => {
    expect(isJwtSessionValid({ active: true, dbSessionVersion: 3, tokenSessionVersion: 2 })).toBe(false);
  });

  it("rejects inactive accounts", () => {
    expect(isJwtSessionValid({ active: false, dbSessionVersion: 0, tokenSessionVersion: 0 })).toBe(false);
  });

  it("treats missing token version as 0", () => {
    expect(isJwtSessionValid({ active: true, dbSessionVersion: 1, tokenSessionVersion: undefined })).toBe(false);
  });
});
