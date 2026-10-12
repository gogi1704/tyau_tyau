-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "telegramId" TEXT NOT NULL,
    "username" TEXT,
    "firstName" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "DogProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "breed" TEXT NOT NULL,
    "photoUrl" TEXT,
    "gender" TEXT NOT NULL,
    "ageGroup" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "goal" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DogProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WalkSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dogProfileId" TEXT NOT NULL,
    "lat" REAL NOT NULL,
    "lng" REAL NOT NULL,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME NOT NULL,
    CONSTRAINT "WalkSession_dogProfileId_fkey" FOREIGN KEY ("dogProfileId") REFERENCES "DogProfile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Like" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fromDogId" TEXT NOT NULL,
    "toDogId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Like_fromDogId_fkey" FOREIGN KEY ("fromDogId") REFERENCES "DogProfile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Like_toDogId_fkey" FOREIGN KEY ("toDogId") REFERENCES "DogProfile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Match" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dogAId" TEXT NOT NULL,
    "dogBId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Match_dogAId_fkey" FOREIGN KEY ("dogAId") REFERENCES "DogProfile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Match_dogBId_fkey" FOREIGN KEY ("dogBId") REFERENCES "DogProfile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Meetup" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizerDogId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "placeName" TEXT NOT NULL,
    "lat" REAL NOT NULL,
    "lng" REAL NOT NULL,
    "scheduledAt" DATETIME NOT NULL,
    "chatLink" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Meetup_organizerDogId_fkey" FOREIGN KEY ("organizerDogId") REFERENCES "DogProfile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MeetupParticipant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "meetupId" TEXT NOT NULL,
    "dogProfileId" TEXT NOT NULL,
    "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MeetupParticipant_meetupId_fkey" FOREIGN KEY ("meetupId") REFERENCES "Meetup" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MeetupParticipant_dogProfileId_fkey" FOREIGN KEY ("dogProfileId") REFERENCES "DogProfile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_telegramId_key" ON "User"("telegramId");

-- CreateIndex
CREATE UNIQUE INDEX "DogProfile_userId_key" ON "DogProfile"("userId");

-- CreateIndex
CREATE INDEX "WalkSession_expiresAt_idx" ON "WalkSession"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "Like_fromDogId_toDogId_key" ON "Like"("fromDogId", "toDogId");

-- CreateIndex
CREATE UNIQUE INDEX "Match_dogAId_dogBId_key" ON "Match"("dogAId", "dogBId");

-- CreateIndex
CREATE UNIQUE INDEX "MeetupParticipant_meetupId_dogProfileId_key" ON "MeetupParticipant"("meetupId", "dogProfileId");
