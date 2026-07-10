-- CreateEnum
CREATE TYPE "InternshipMode" AS ENUM ('REMOTE', 'HYBRID', 'ONSITE');

-- AlterEnum
ALTER TYPE "ApplicationStatus" ADD VALUE 'SAVED';

-- DropForeignKey
ALTER TABLE "Application" DROP CONSTRAINT "Application_userId_fkey";

-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "notes" TEXT;

-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "about" TEXT,
ADD COLUMN     "headquarters" TEXT,
ADD COLUMN     "industry" TEXT,
ADD COLUMN     "logoUrl" TEXT;

-- AlterTable
ALTER TABLE "Internship" ADD COLUMN     "benefits" TEXT,
ADD COLUMN     "eligibility" TEXT,
ADD COLUMN     "mode" "InternshipMode",
ADD COLUMN     "stipend" TEXT;

-- AlterTable
ALTER TABLE "Resume" ADD COLUMN     "extractedText" TEXT,
ADD COLUMN     "parsingStatus" TEXT NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "StudentProfile" ADD COLUMN     "currentLocation" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "preferredLocation" TEXT;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
