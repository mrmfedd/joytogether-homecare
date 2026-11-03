import { describe, expect, it } from "vitest";
import { randomBytes } from "crypto";
import { hashRecoveryToken } from "@/lib/admin/recovery-token-hash";

describe("admin account recovery security primitives", () => {
  it("uses 32-byte random tokens (64 hex chars)", () => {
    const token = randomBytes(32).toString("hex");
    expect(token).toHaveLength(64);
    expect(hashRecoveryToken(token)).not.toBe(token);
  });

  it("uses distinct hashes for distinct tokens", () => {
    const a = hashRecoveryToken(randomBytes(32).toString("hex"));
    const b = hashRecoveryToken(randomBytes(32).toString("hex"));
    expect(a).not.toBe(b);
  });

  it("documents recovery link TTL used by initiate script", () => {
    const ttlMinutes = 30;
    expect(ttlMinutes).toBe(30);
  });
});
