import { randomBytes } from "crypto";
import { hashToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const TICKET_TTL_MS = 2 * 60 * 1000;

export async function createPasskeyLoginTicket(input: {
  userId: string;
  portal: string;
  userVerified: boolean;
}) {
  const token = randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + TICKET_TTL_MS);

  await prisma.passkeyLoginTicket.create({
    data: {
      userId: input.userId,
      tokenHash,
      portal: input.portal,
      userVerified: input.userVerified,
      expiresAt,
    },
  });

  return { token, expiresAt };
}

/** Atomically redeem a one-time login ticket (safe under concurrent signIn attempts). */
export async function consumePasskeyLoginTicket(token: string, portal: string) {
  const tokenHash = hashToken(token);
  const now = new Date();

  const claimed = await prisma.passkeyLoginTicket.updateMany({
    where: {
      tokenHash,
      portal,
      usedAt: null,
      expiresAt: { gt: now },
    },
    data: { usedAt: now },
  });

  if (claimed.count !== 1) return null;

  return prisma.passkeyLoginTicket.findUnique({ where: { tokenHash } });
}