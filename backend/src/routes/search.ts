import { Router } from "express";
import { prisma } from "../lib/prisma";
import { telegramAuth } from "../middleware/auth";
import { getOwnDogProfile } from "../lib/ownDog";
import { sendMatchNotification } from "../bot";

const router = Router();

router.get("/", telegramAuth, async (req, res) => {
  const dog = await getOwnDogProfile(req.telegramUser!.id);
  if (!dog) return res.status(400).json({ error: "no_profile" });

  const district = typeof req.query.district === "string" ? req.query.district : undefined;
  const breed = typeof req.query.breed === "string" ? req.query.breed : undefined;
  const goal = typeof req.query.goal === "string" ? req.query.goal : dog.goal;

  const swiped = await prisma.like.findMany({
    where: { fromDogId: dog.id },
    select: { toDogId: true },
  });
  const swipedIds = swiped.map((s) => s.toDogId);

  const candidates = await prisma.dogProfile.findMany({
    where: {
      id: { notIn: [dog.id, ...swipedIds] },
      goal,
      ...(district ? { district } : {}),
      ...(breed ? { breed } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  res.json({ candidates });
});

router.post("/swipe", telegramAuth, async (req, res) => {
  const dog = await getOwnDogProfile(req.telegramUser!.id);
  if (!dog) return res.status(400).json({ error: "no_profile" });

  const { targetDogId, direction } = req.body as { targetDogId: string; direction: "like" | "pass" };
  if (!targetDogId || (direction !== "like" && direction !== "pass")) {
    return res.status(400).json({ error: "invalid_body" });
  }

  if (direction === "pass") {
    await prisma.like.deleteMany({ where: { fromDogId: dog.id, toDogId: targetDogId } });
    return res.json({ match: null });
  }

  await prisma.like.upsert({
    where: { fromDogId_toDogId: { fromDogId: dog.id, toDogId: targetDogId } },
    update: {},
    create: { fromDogId: dog.id, toDogId: targetDogId },
  });

  const mutualLike = await prisma.like.findUnique({
    where: { fromDogId_toDogId: { fromDogId: targetDogId, toDogId: dog.id } },
  });

  if (!mutualLike) {
    return res.json({ match: null });
  }

  const [dogAId, dogBId] = [dog.id, targetDogId].sort();
  const match = await prisma.match.upsert({
    where: { dogAId_dogBId: { dogAId, dogBId } },
    update: {},
    create: { dogAId, dogBId },
    include: {
      dogA: { include: { user: true } },
      dogB: { include: { user: true } },
    },
  });

  await sendMatchNotification(match.dogA.user.telegramId, match.dogA.name, match.dogB.name);
  await sendMatchNotification(match.dogB.user.telegramId, match.dogB.name, match.dogA.name);

  const otherDog = match.dogAId === dog.id ? match.dogB : match.dogA;
  res.json({
    match: {
      id: match.id,
      dog: {
        id: otherDog.id,
        name: otherDog.name,
        breed: otherDog.breed,
        photoUrl: otherDog.photoUrl,
      },
      ownerUsername: otherDog.user.username,
    },
  });
});

router.get("/matches", telegramAuth, async (req, res) => {
  const dog = await getOwnDogProfile(req.telegramUser!.id);
  if (!dog) return res.status(400).json({ error: "no_profile" });

  const matches = await prisma.match.findMany({
    where: { OR: [{ dogAId: dog.id }, { dogBId: dog.id }] },
    include: {
      dogA: { include: { user: true } },
      dogB: { include: { user: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  res.json({
    matches: matches.map((m) => {
      const other = m.dogAId === dog.id ? m.dogB : m.dogA;
      return {
        id: m.id,
        createdAt: m.createdAt,
        dog: {
          id: other.id,
          name: other.name,
          breed: other.breed,
          photoUrl: other.photoUrl,
          goal: other.goal,
        },
        ownerUsername: other.user.username,
        ownerTelegramId: other.user.telegramId,
      };
    }),
  });
});

export default router;
