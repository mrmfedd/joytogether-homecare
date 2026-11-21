import { afterEach, describe, expect, it } from "vitest";
import { decryptPhi, encryptPhi } from "@/lib/patient/phi-crypto";

describe("patient phi crypto", () => {
  afterEach(() => {
    delete process.env.PHI_ENCRYPTION_KEY;
  });

  it("round-trips with encryption key", () => {
    process.env.PHI_ENCRYPTION_KEY = "test-only-demo-key-not-production";
    const cipher = encryptPhi("Demo allergy note");
    expect(cipher).toMatch(/^enc:v1:/);
    expect(decryptPhi(cipher)).toBe("Demo allergy note");
  });

  it("passes through plaintext in non-production without key", () => {
    const text = "dev-only placeholder";
    expect(encryptPhi(text)).toBe(text);
    expect(decryptPhi(text)).toBe(text);
  });
});