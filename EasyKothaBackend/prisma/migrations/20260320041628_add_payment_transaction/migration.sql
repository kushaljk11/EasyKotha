-- CreateEnum
CREATE TYPE "PaymentGateway" AS ENUM ('ESEWA', 'KHALTI');

-- CreateEnum
CREATE TYPE "PaymentTransactionStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');

-- CreateTable
CREATE TABLE "PaymentTransaction" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "paymentGateway" "PaymentGateway" NOT NULL,
    "status" "PaymentTransactionStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PaymentTransaction_productId_key" ON "PaymentTransaction"("productId");

-- CreateIndex
CREATE INDEX "PaymentTransaction_userId_idx" ON "PaymentTransaction"("userId");

-- CreateIndex
CREATE INDEX "PaymentTransaction_status_idx" ON "PaymentTransaction"("status");

-- CreateIndex
CREATE INDEX "PaymentTransaction_paymentGateway_idx" ON "PaymentTransaction"("paymentGateway");

-- AddForeignKey
ALTER TABLE "PaymentTransaction" ADD CONSTRAINT "PaymentTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
