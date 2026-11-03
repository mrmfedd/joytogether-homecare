import { describe, expect, it } from "vitest";
import { generateSecret, generateSync } from "otplib";
import { verifyMfaCode } from "@/lib/mfa";

describe("verifyMfaCode", () => {
  it("accepts a current TOTP and rejects an invalid code", () => {
    const secret = generateSecret();
    const token = generateSync({ secret });
    expect(verifyMfaCode(secret, token)).toBe(true);
    expect(verifyMfaCode(secret, "000000")).toBe(false);
  });
});
