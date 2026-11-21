import { describe, expect, it } from "vitest";
import {
  adminMustEnrollSecondFactor,
  passkeyLoginSatisfiesTotpRequirement,
  roleRequiresSecondFactor,
} from "@/lib/passkeys/mfa-policy";

describe("passkey MFA policy", () => {
  it("requires second factor roles", () => {
    expect(roleRequiresSecondFactor("ADMIN")).toBe(true);
    expect(roleRequiresSecondFactor("EMPLOYEE")).toBe(true);
    expect(roleRequiresSecondFactor("VIEWER")).toBe(false);
  });

  it("passkey login satisfies TOTP when user verified with passkeys on file", () => {
    expect(
      passkeyLoginSatisfiesTotpRequirement({ role: "ADMIN", userVerified: true, hasPasskeys: true }),
    ).toBe(true);
    expect(
      passkeyLoginSatisfiesTotpRequirement({ role: "ADMIN", userVerified: false, hasPasskeys: true }),
    ).toBe(false);
  });

  it("adminMustEnrollSecondFactor returns false when MFA enabled", async () => {
    await expect(adminMustEnrollSecondFactor("x", "ADMIN", true)).resolves.toBe(false);
  });
});