-- AlterTable
ALTER TABLE "DogProfile" ADD COLUMN "heightCm" REAL;
ALTER TABLE "DogProfile" ADD COLUMN "medicalNotes" TEXT;
ALTER TABLE "DogProfile" ADD COLUMN "weightKg" REAL;

-- CreateTable
CREATE TABLE "AiChatMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dogProfileId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AiChatMessage_dogProfileId_fkey" FOREIGN KEY ("dogProfileId") REFERENCES "DogProfile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
