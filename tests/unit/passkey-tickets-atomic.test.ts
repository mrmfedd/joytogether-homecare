import { beforeEach, describe, expect, it, vi } from "vitest";

const { updateMany, findUnique } = vi.hoisted(() => ({
  updateMany: vi.fn(),
  findUnique: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    passkeyLoginTicket: { updateMany, findUnique },
  },
}));

vi.mock("@/lib/auth", () => ({
  hashToken: (t: string) => `hash:${t}`,
}));

import { consumePasskeyLoginTicket } from "@/lib/passkeys/tickets";

describe("passkey login tickets", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redeems exactly once when updateMany count is 1", async () => {
    updateMany.mockResolvedValue({ count: 1 });
    findUnique.mockResolvedValue({
      userId: "u1",
      portal: "admin",
      userVerified: true,
      tokenHash: "hash:tok",
    });
    const ticket = await consumePasskeyLoginTicket("tok", "admin");
    expect(ticket?.userId).toBe("u1");
    expect(updateMany).toHaveBeenCalledTimes(1);
  });

  it("rejects concurrent or replay redemption when count is 0", async () => {
    updateMany.mockResolvedValue({ count: 0 });
    const ticket = await consumePasskeyLoginTicket("tok", "admin");
    expect(ticket).toBeNull();
    expect(findUnique).not.toHaveBeenCalled();
  });

  it("rejects wrong portal via updateMany filter", async () => {
    updateMany.mockResolvedValue({ count: 0 });
    await expect(consumePasskeyLoginTicket("tok", "employee")).resolves.toBeNull();
    expect(updateMany.mock.calls[0][0].where.portal).toBe("employee");
  });
});