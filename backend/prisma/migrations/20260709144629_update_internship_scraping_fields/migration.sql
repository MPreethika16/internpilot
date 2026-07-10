/*
  Warnings:

  - A unique constraint covering the columns `[sourcePlatform,externalId]` on the table `Internship` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "InternshipStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'REMOVED');

-- AlterTable
ALTER TABLE "Internship" ADD COLUMN     "applicationDeadline" TIMESTAMP(3),
ADD COLUMN     "externalId" TEXT,
ADD COLUMN     "lastScrapedAt" TIMESTAMP(3),
ADD COLUMN     "sourcePlatform" TEXT,
ADD COLUMN     "sourceUrl" TEXT,
ADD COLUMN     "status" "InternshipStatus" NOT NULL DEFAULT 'ACTIVE',
ALTER COLUMN "location" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Internship_sourcePlatform_externalId_key" ON "Internship"("sourcePlatform", "externalId");
