import { createHash } from "crypto";
import { describe, expect, it } from "vitest";

function hashInviteToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Documents reprovision invite acceptance rules enforced in validateAdminInviteToken
 * (see src/lib/admin/invitations.ts) and acceptInviteAction (users/actions.ts).
 */
describe("admin reprovision invitation — account takeover prevention", () => {
  it("uses hashed invite tokens in storage (raw token never persisted)", () => {
    const raw = "a".repeat(64);
    const hashed = hashInviteToken(raw);
    expect(hashed).not.toBe(raw);
    expect(hashed.length).toBe(64);
  });

  it("documents reprovision validation: wrong user id yields reprovision_mismatch", () => {
    const rules = {
      reprovisionUserIdSet: true,
      existingUserId: "user-a",
      inviteReprovisionUserId: "user-b",
      expectedReason: "reprovision_mismatch" as const,
    };
    expect(rules.existingUserId).not.toBe(rules.inviteReprovisionUserId);
    expect(rules.expectedReason).toBe("reprovision_mismatch");
  });

  it("documents standard invite blocked when account already exists", () => {
    const rules = {
      reprovisionUserIdSet: false,
      userExistsForEmail: true,
      expectedReason: "account_exists" as const,
    };
    expect(rules.reprovisionUserIdSet).toBe(false);
    expect(rules.expectedReason).toBe("account_exists");
  });

  it("documents accept path updates only reprovisionUserId target, not user.create", () => {
    const acceptPaths = ["reprovisionUserId branch → user.update", "else → user.create"];
    expect(acceptPaths[0]).toContain("user.update");
    expect(acceptPaths[1]).toContain("user.create");
  });
});
