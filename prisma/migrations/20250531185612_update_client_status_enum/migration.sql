/*
  Warnings:

  - The values [REPLIED,FOLLOW_UP] on the enum `EmailStatus` will be removed. If these variants are still used in the database, this will fail.
  - The `status` column on the `Client` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `recipient` on the `Email` table. All the data in the column will be lost.
  - The `status` column on the `Email` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `FollowUp` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[email]` on the table `Client` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `Client` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clientId` to the `Email` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "EmailStatus_new" AS ENUM ('DRAFT', 'SENT', 'FAILED');
ALTER TABLE "Email" ALTER COLUMN "status" TYPE "EmailStatus_new" USING ("status"::text::"EmailStatus_new");
ALTER TYPE "EmailStatus" RENAME TO "EmailStatus_old";
ALTER TYPE "EmailStatus_new" RENAME TO "EmailStatus";
DROP TYPE "EmailStatus_old";
COMMIT;

-- AlterEnum
ALTER TYPE "FollowUpStatus" ADD VALUE 'FAILED';

-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "pipedriveId" TEXT,
DROP COLUMN "status",
ADD COLUMN     "status" "ClientStatus" NOT NULL DEFAULT 'NEW';

-- AlterTable
ALTER TABLE "Email" DROP COLUMN "recipient",
ADD COLUMN     "clientId" TEXT NOT NULL,
ALTER COLUMN "sentAt" DROP NOT NULL,
ALTER COLUMN "sentAt" DROP DEFAULT,
DROP COLUMN "status",
ADD COLUMN     "status" "EmailStatus" NOT NULL DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "FollowUp" ADD COLUMN     "sentAt" TIMESTAMP(3),
ALTER COLUMN "content" DROP NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "FollowUpStatus" NOT NULL DEFAULT 'PENDING';

-- CreateIndex
CREATE UNIQUE INDEX "Client_email_key" ON "Client"("email");

-- AddForeignKey
ALTER TABLE "Email" ADD CONSTRAINT "Email_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
