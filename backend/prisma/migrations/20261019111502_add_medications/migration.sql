-- CreateTable
CREATE TABLE "Medication" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dogProfileId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dosageAmount" REAL NOT NULL,
    "dosageUnit" TEXT NOT NULL,
    "frequencyHours" INTEGER,
    "startAt" DATETIME,
    "reminderEnabled" BOOLEAN NOT NULL DEFAULT false,
    "nextReminderAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Medication_dogProfileId_fkey" FOREIGN KEY ("dogProfileId") REFERENCES "DogProfile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
