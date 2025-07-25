-- AlterTable
ALTER TABLE "users" ADD COLUMN     "hasSetPassword" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "password" TEXT;
