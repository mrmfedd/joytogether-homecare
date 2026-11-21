-- WebAuthn / FIDO2 passkeys for admin and employee portals (additive).

CREATE TYPE "PasskeyChallengeKind" AS ENUM ('AUTHENTICATION', 'REGISTRATION');

CREATE TABLE "UserPasskey" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "credentialId" TEXT NOT NULL,
  "publicKey" BYTEA NOT NULL,
  "counter" BIGINT NOT NULL DEFAULT 0,
  "transports" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "deviceType" TEXT,
  "backedUp" BOOLEAN NOT NULL DEFAULT false,
  "friendlyName" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastUsedAt" TIMESTAMP(3),
  CONSTRAINT "UserPasskey_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "UserPasskey_credentialId_key" ON "UserPasskey"("credentialId");
CREATE INDEX "UserPasskey_userId_idx" ON "UserPasskey"("userId");

CREATE TABLE "PasskeyChallenge" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "kind" "PasskeyChallengeKind" NOT NULL,
  "challenge" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PasskeyChallenge_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PasskeyChallenge_challenge_key" ON "PasskeyChallenge"("challenge");
CREATE INDEX "PasskeyChallenge_expiresAt_idx" ON "PasskeyChallenge"("expiresAt");

CREATE TABLE "PasskeyLoginTicket" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "portal" TEXT NOT NULL,
  "userVerified" BOOLEAN NOT NULL DEFAULT false,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "usedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PasskeyLoginTicket_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PasskeyLoginTicket_tokenHash_key" ON "PasskeyLoginTicket"("tokenHash");
CREATE INDEX "PasskeyLoginTicket_userId_expiresAt_idx" ON "PasskeyLoginTicket"("userId", "expiresAt");

ALTER TABLE "UserPasskey" ADD CONSTRAINT "UserPasskey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PasskeyChallenge" ADD CONSTRAINT "PasskeyChallenge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PasskeyLoginTicket" ADD CONSTRAINT "PasskeyLoginTicket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;