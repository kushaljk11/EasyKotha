-- AlterTable
ALTER TABLE "PaymentTransaction" ADD COLUMN     "adminReleaseApproved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "adminReleaseAt" TIMESTAMP(3),
ADD COLUMN     "adminReleasedBy" INTEGER,
ADD COLUMN     "customerDetails" JSONB,
ADD COLUMN     "landlordEmail" TEXT,
ADD COLUMN     "landlordId" INTEGER,
ADD COLUMN     "landlordName" TEXT,
ADD COLUMN     "tenantEmail" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "tenantName" TEXT NOT NULL DEFAULT '',
ALTER COLUMN "customerName" SET DEFAULT '',
ALTER COLUMN "customerEmail" SET DEFAULT '',
ALTER COLUMN "customerPhone" SET DEFAULT '';

-- CreateIndex
CREATE INDEX "PaymentTransaction_landlordId_idx" ON "PaymentTransaction"("landlordId");

-- CreateIndex
CREATE INDEX "PaymentTransaction_adminReleasedBy_idx" ON "PaymentTransaction"("adminReleasedBy");

-- CreateIndex
CREATE INDEX "PaymentTransaction_status_adminReleaseApproved_idx" ON "PaymentTransaction"("status", "adminReleaseApproved");

-- CreateIndex
CREATE INDEX "PaymentTransaction_createdAt_idx" ON "PaymentTransaction"("createdAt");

-- AddForeignKey
ALTER TABLE "PaymentTransaction" ADD CONSTRAINT "PaymentTransaction_landlordId_fkey" FOREIGN KEY ("landlordId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentTransaction" ADD CONSTRAINT "PaymentTransaction_adminReleasedBy_fkey" FOREIGN KEY ("adminReleasedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
