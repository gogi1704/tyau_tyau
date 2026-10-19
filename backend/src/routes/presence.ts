import { Router } from "express";
import { prisma } from "../lib/prisma";
import { telegramAuth } from "../middleware/auth";
import { getOwnDogProfile } from "../lib/ownDog";

const router = Router();
const SESSION_MINUTES = 60;

router.post("/start", telegramAuth, async (req, res) => {
  const dog = await getOwnDogProfile(req.telegramUser!.id);
  if (!dog) return res.status(400).json({ error: "no_profile" });

  const { lat, lng } = req.body;
  if (typeof lat !== "number" || typeof lng !== "number") {
    return res.status(400).json({ error: "invalid_coordinates" });
  }

  const expiresAt = new Date(Date.now() + SESSION_MINUTES * 60 * 1000);
  const session = await prisma.walkSession.create({
    data: { dogProfileId: dog.id, lat, lng, expiresAt },
  });

  res.json({ session });
});

router.post("/stop", telegramAuth, async (req, res) => {
  const dog = await getOwnDogProfile(req.telegramUser!.id);
  if (!dog) return res.status(400).json({ error: "no_profile" });

  await prisma.walkSession.updateMany({
    where: { dogProfileId: dog.id, expiresAt: { gt: new Date() } },
    data: { expiresAt: new Date() },
  });

  res.json({ ok: true });
});

router.get("/active", telegramAuth, async (req, res) => {
  const dog = await getOwnDogProfile(req.telegramUser!.id);
  const scope = req.query.scope === "friends" ? "friends" : "all";

  let allowedDogIds: Set<string> | null = null;
  if (scope === "friends") {
    if (!dog) return res.json({ points: [] });
    const follows = await prisma.follow.findMany({
      where: { followerDogId: dog.id },
      select: { followingDogId: true },
    });
    allowedDogIds = new Set([dog.id, ...follows.map((f) => f.followingDogId)]);
  }

  const sessions = await prisma.walkSession.findMany({
    where: { expiresAt: { gt: new Date() } },
    include: { dogProfile: { include: { user: true } } },
    orderBy: { startedAt: "desc" },
  });

  const seen = new Set<string>();
  const points = [];
  for (const s of sessions) {
    if (seen.has(s.dogProfileId)) continue;
    if (allowedDogIds && !allowedDogIds.has(s.dogProfileId)) continue;
    seen.add(s.dogProfileId);
    points.push({
      sessionId: s.id,
      lat: s.lat,
      lng: s.lng,
      expiresAt: s.expiresAt,
      isSelf: dog ? s.dogProfileId === dog.id : false,
      dog: {
        id: s.dogProfile.id,
        name: s.dogProfile.name,
        breed: s.dogProfile.breed,
        photoUrl: s.dogProfile.photoUrl,
        goal: s.dogProfile.goal,
        ownerUsername: s.dogProfile.user.username,
        ownerTelegramId: s.dogProfile.user.telegramId,
      },
    });
  }

  res.json({ points });
});

export default router;
