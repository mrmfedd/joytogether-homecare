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

export async function consumePasskeyLoginTicket(token: string, portal: string) {
  const tokenHash = hashToken(token);
  const ticket = await prisma.passkeyLoginTicket.findUnique({ where: { tokenHash } });
  if (!ticket || ticket.usedAt || ticket.expiresAt < new Date()) return null;
  if (ticket.portal !== portal) return null;

  await prisma.passkeyLoginTicket.update({
    where: { id: ticket.id },
    data: { usedAt: new Date() },
  });

  return ticket;
}