import { Router } from "express";
import { prisma } from "../lib/prisma";
import { telegramAuth } from "../middleware/auth";
import { upload } from "../lib/upload";
import { getOwnDogProfile, getProfileStats } from "../lib/ownDog";

const router = Router();

async function findOrCreateUser(telegramId: string, username?: string, firstName?: string) {
  return prisma.user.upsert({
    where: { telegramId },
    update: { username, firstName },
    create: { telegramId, username, firstName },
  });
}

router.get("/me", telegramAuth, async (req, res) => {
  const tgUser = req.telegramUser!;
  const user = await prisma.user.findUnique({
    where: { telegramId: tgUser.id },
    include: { dogProfile: true },
  });
  const dogProfile = user?.dogProfile ?? null;
  const stats = dogProfile ? await getProfileStats(dogProfile.id) : null;
  res.json({ dogProfile, stats });
});

router.get("/", telegramAuth, async (req, res) => {
  const ownDog = await getOwnDogProfile(req.telegramUser!.id);
  const district = typeof req.query.district === "string" ? req.query.district : undefined;

  const dogs = await prisma.dogProfile.findMany({
    where: {
      ...(ownDog ? { id: { not: ownDog.id } } : {}),
      ...(district ? { district } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 60,
  });

  const followingIds = ownDog
    ? new Set(
        (await prisma.follow.findMany({ where: { followerDogId: ownDog.id }, select: { followingDogId: true } })).map(
          (f) => f.followingDogId,
        ),
      )
    : new Set<string>();

  res.json({
    dogProfiles: dogs.map((d) => ({
      id: d.id,
      name: d.name,
      breed: d.breed,
      photoUrl: d.photoUrl,
      gender: d.gender,
      ageGroup: d.ageGroup,
      district: d.district,
      goal: d.goal,
      isFollowedByMe: followingIds.has(d.id),
    })),
  });
});

router.post("/", telegramAuth, upload.single("photo"), async (req, res) => {
  const tgUser = req.telegramUser!;
  const { name, breed, gender, ageGroup, district, goal } = req.body;

  if (!name || !breed || !gender || !ageGroup || !district || !goal) {
    return res.status(400).json({ error: "missing_fields" });
  }

  const user = await findOrCreateUser(tgUser.id, tgUser.username, tgUser.firstName);
  const photoUrl = req.file ? `/uploads/${req.file.filename}` : undefined;

  const existing = await prisma.dogProfile.findUnique({ where: { userId: user.id } });

  const dogProfile = await prisma.dogProfile.upsert({
    where: { userId: user.id },
    update: {
      name,
      breed,
      gender,
      ageGroup,
      district,
      goal,
      ...(photoUrl ? { photoUrl } : {}),
    },
    create: {
      userId: user.id,
      name,
      breed,
      gender,
      ageGroup,
      district,
      goal,
      photoUrl: photoUrl ?? null,
    },
  });

  res.json({ dogProfile, created: !existing });
});

router.get("/:dogId", telegramAuth, async (req, res) => {
  const dogProfile = await prisma.dogProfile.findUnique({
    where: { id: req.params.dogId },
    include: { user: true },
  });
  if (!dogProfile) return res.status(404).json({ error: "not_found" });

  const ownDog = await getOwnDogProfile(req.telegramUser!.id);
  const isOwn = ownDog?.id === dogProfile.id;
  const stats = await getProfileStats(dogProfile.id);
  const isFollowedByMe = ownDog
    ? Boolean(
        await prisma.follow.findUnique({
          where: { followerDogId_followingDogId: { followerDogId: ownDog.id, followingDogId: dogProfile.id } },
        }),
      )
    : false;

  res.json({
    dogProfile: {
      id: dogProfile.id,
      name: dogProfile.name,
      breed: dogProfile.breed,
      photoUrl: dogProfile.photoUrl,
      gender: dogProfile.gender,
      ageGroup: dogProfile.ageGroup,
      district: dogProfile.district,
      goal: dogProfile.goal,
    },
    owner: {
      username: dogProfile.user.username ?? null,
      telegramId: dogProfile.user.telegramId,
    },
    stats,
    isOwn,
    isFollowedByMe,
  });
});

export default router;
