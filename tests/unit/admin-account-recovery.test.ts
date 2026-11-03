import { describe, expect, it } from "vitest";
import { hashRecoveryToken } from "@/lib/admin/recovery-token-hash";

describe("admin account recovery tokens", () => {
  it("hashes tokens without exposing raw values", () => {
    const h1 = hashRecoveryToken("abc");
    const h2 = hashRecoveryToken("abc");
    expect(h1).toBe(h2);
    expect(h1).not.toBe("abc");
    expect(h1.length).toBe(64);
  });
});
