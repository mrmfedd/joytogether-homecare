import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from "@simplewebauthn/server";
import { isoBase64URL } from "@simplewebauthn/server/helpers";
import type {
  AuthenticationResponseJSON,
  AuthenticatorTransportFuture,
  PublicKeyCredentialDescriptorFuture,
  RegistrationResponseJSON,
} from "@simplewebauthn/types";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit";
import { getWebAuthnConfig } from "@/lib/passkeys/config";
import { createPasskeyLoginTicket } from "@/lib/passkeys/tickets";

const CHALLENGE_TTL_MS = 5 * 60 * 1000;

async function storeChallenge(kind: "AUTHENTICATION" | "REGISTRATION", challenge: string, userId?: string) {
  await prisma.passkeyChallenge.create({
    data: {
      kind,
      challenge,
      userId,
      expiresAt: new Date(Date.now() + CHALLENGE_TTL_MS),
    },
  });
}

/** Consume challenge once (replay protection). */
async function takeChallenge(challenge: string) {
  return prisma.$transaction(async (tx) => {
    const row = await tx.passkeyChallenge.findUnique({ where: { challenge } });
    if (!row || row.expiresAt < new Date()) return null;
    await tx.passkeyChallenge.delete({ where: { id: row.id } });
    return row;
  });
}

function portalAllowsUser(portal: string, role: string) {
  if (portal === "employee") return role === "EMPLOYEE";
  if (portal === "admin") return role !== "EMPLOYEE";
  return false;
}

export async function createPasskeyAuthenticationOptions(input: { email?: string; portal: string }) {
  const { rpID, rpName } = getWebAuthnConfig();
  let allowCredentials: PublicKeyCredentialDescriptorFuture[] | undefined;

  let userId: string | undefined;
  if (input.email?.trim()) {
    const email = input.email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, active: true, role: true },
    });
    if (!user?.active || !portalAllowsUser(input.portal, user.role)) {
      throw new Error("No passkeys for this account");
    }
    userId = user.id;
    const passkeys = await prisma.userPasskey.findMany({
      where: { userId: user.id },
      select: { credentialId: true, transports: true },
    });
    if (passkeys.length === 0) throw new Error("No passkeys registered");
    allowCredentials = passkeys.map((p) => ({
      id: isoBase64URL.toBuffer(p.credentialId),
      type: "public-key" as const,
      transports: p.transports as AuthenticatorTransportFuture[],
    }));
  }

  const options = await generateAuthenticationOptions({
    rpID,
    timeout: 60_000,
    allowCredentials,
    userVerification: "required",
  });

  await storeChallenge("AUTHENTICATION", options.challenge, userId);
  return { options, rpName, origin: getWebAuthnConfig().origin };
}

export async function verifyPasskeyAuthentication(input: {
  response: AuthenticationResponseJSON;
  portal: string;
}) {
  const { origin, rpID } = getWebAuthnConfig();
  const clientData = JSON.parse(
    Buffer.from(input.response.response.clientDataJSON, "base64url").toString("utf8"),
  ) as { challenge?: string };
  const challengeRow = clientData.challenge ? await takeChallenge(clientData.challenge) : null;
  if (!challengeRow) throw new Error("Challenge expired");

  const credentialId = input.response.id;
  const passkey = await prisma.userPasskey.findUnique({
    where: { credentialId },
    include: { user: true },
  });
  if (!passkey?.user.active) throw new Error("Invalid credential");
  if (!portalAllowsUser(input.portal, passkey.user.role)) throw new Error("Portal mismatch");

  const verification = await verifyAuthenticationResponse({
    response: input.response,
    expectedChallenge: challengeRow.challenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
    authenticator: {
      credentialID: isoBase64URL.toBuffer(passkey.credentialId),
      credentialPublicKey: new Uint8Array(passkey.publicKey),
      counter: Number(passkey.counter),
      transports: passkey.transports as AuthenticatorTransportFuture[],
    },
    requireUserVerification: true,
  });

  if (!verification.verified) throw new Error("Verification failed");

  await prisma.userPasskey.update({
    where: { id: passkey.id },
    data: {
      counter: BigInt(verification.authenticationInfo.newCounter),
      lastUsedAt: new Date(),
    },
  });

  await writeAuditLog({
    userId: passkey.userId,
    action: "LOGIN",
    entity: "UserPasskey",
    entityId: passkey.id,
    meta: { method: "passkey", portal: input.portal },
  });

  const ticket = await createPasskeyLoginTicket({
    userId: passkey.userId,
    portal: input.portal,
    userVerified: verification.authenticationInfo.userVerified,
  });

  return { ticket: ticket.token, userVerified: verification.authenticationInfo.userVerified };
}

export async function createPasskeyRegistrationOptions(userId: string, email: string) {
  const { rpID, rpName } = getWebAuthnConfig();
  const existing = await prisma.userPasskey.findMany({
    where: { userId },
    select: { credentialId: true, transports: true },
  });

  const options = await generateRegistrationOptions({
    rpName,
    rpID,
    userName: email,
    userID: userId,
    userDisplayName: email,
    timeout: 120_000,
    attestationType: "none",
    excludeCredentials: existing.map((p) => ({
      id: isoBase64URL.toBuffer(p.credentialId),
      type: "public-key" as const,
      transports: p.transports as AuthenticatorTransportFuture[],
    })),
    authenticatorSelection: {
      residentKey: "preferred",
      userVerification: "required",
    },
  });

  await storeChallenge("REGISTRATION", options.challenge, userId);
  return { options, origin: getWebAuthnConfig().origin };
}

export async function verifyPasskeyRegistration(input: {
  userId: string;
  response: RegistrationResponseJSON;
  friendlyName?: string;
}) {
  const { origin, rpID } = getWebAuthnConfig();
  const clientData = JSON.parse(Buffer.from(input.response.response.clientDataJSON, "base64url").toString());
  const challengeRow = await takeChallenge(clientData.challenge);
  if (!challengeRow || challengeRow.userId !== input.userId) throw new Error("Challenge invalid");

  const verification = await verifyRegistrationResponse({
    response: input.response,
    expectedChallenge: challengeRow.challenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
    requireUserVerification: true,
  });

  if (!verification.verified || !verification.registrationInfo) throw new Error("Registration failed");

  const info = verification.registrationInfo;
  const credentialId = isoBase64URL.fromBuffer(info.credentialID);

  await prisma.userPasskey.create({
    data: {
      userId: input.userId,
      credentialId,
      publicKey: Buffer.from(info.credentialPublicKey),
      counter: BigInt(info.counter),
      transports: input.response.response.transports ?? [],
      deviceType: info.credentialDeviceType,
      backedUp: info.credentialBackedUp,
      friendlyName: input.friendlyName?.trim() || "Passkey",
    },
  });

  await writeAuditLog({
    userId: input.userId,
    action: "CREATE",
    entity: "UserPasskey",
    meta: { backedUp: info.credentialBackedUp },
  });
}

export async function deleteUserPasskey(userId: string, passkeyId: string) {
  const row = await prisma.userPasskey.findFirst({ where: { id: passkeyId, userId } });
  if (!row) throw new Error("Not found");
  await prisma.userPasskey.delete({ where: { id: passkeyId } });
  await writeAuditLog({ userId, action: "DELETE", entity: "UserPasskey", entityId: passkeyId });
}