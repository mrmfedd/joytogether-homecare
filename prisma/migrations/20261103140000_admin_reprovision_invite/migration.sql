-- AlterTable
ALTER TABLE "AdminInvitation" ADD COLUMN IF NOT EXISTS "reprovisionUserId" TEXT;

-- AddForeignKey
ALTER TABLE "AdminInvitation" ADD CONSTRAINT "AdminInvitation_reprovisionUserId_fkey" FOREIGN KEY ("reprovisionUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
