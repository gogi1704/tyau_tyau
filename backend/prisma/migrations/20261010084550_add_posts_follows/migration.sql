-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dogProfileId" TEXT NOT NULL,
    "photoUrl" TEXT,
    "caption" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Post_dogProfileId_fkey" FOREIGN KEY ("dogProfileId") REFERENCES "DogProfile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Follow" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "followerDogId" TEXT NOT NULL,
    "followingDogId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Follow_followerDogId_fkey" FOREIGN KEY ("followerDogId") REFERENCES "DogProfile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Follow_followingDogId_fkey" FOREIGN KEY ("followingDogId") REFERENCES "DogProfile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Post_createdAt_idx" ON "Post"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Follow_followerDogId_followingDogId_key" ON "Follow"("followerDogId", "followingDogId");
