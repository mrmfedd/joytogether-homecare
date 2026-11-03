-- CreateTable
CREATE TABLE "AdminAccountRecoveryToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminAccountRecoveryToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminAccountRecoveryToken_tokenHash_key" ON "AdminAccountRecoveryToken"("tokenHash");

-- CreateIndex
CREATE INDEX "AdminAccountRecoveryToken_userId_idx" ON "AdminAccountRecoveryToken"("userId");

-- AddForeignKey
ALTER TABLE "AdminAccountRecoveryToken" ADD CONSTRAINT "AdminAccountRecoveryToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
