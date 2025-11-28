-- CreateEnum
CREATE TYPE "UserTier" AS ENUM ('FREE', 'HOBBY', 'PRO', 'ENTERPRISE');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "tier" "UserTier" NOT NULL DEFAULT 'FREE';
