import { Router } from "express";
import { prisma } from "../lib/prisma";
import { telegramAuth } from "../middleware/auth";
import { getOwnDogProfile } from "../lib/ownDog";

const router = Router();

router.post("/:dogId", telegramAuth, async (req, res) => {
  const dog = await getOwnDogProfile(req.telegramUser!.id);
  if (!dog) return res.status(400).json({ error: "no_profile" });
  if (dog.id === req.params.dogId) return res.status(400).json({ error: "cannot_follow_self" });

  await prisma.follow.upsert({
    where: { followerDogId_followingDogId: { followerDogId: dog.id, followingDogId: req.params.dogId } },
    update: {},
    create: { followerDogId: dog.id, followingDogId: req.params.dogId },
  });

  res.json({ ok: true });
});

router.delete("/:dogId", telegramAuth, async (req, res) => {
  const dog = await getOwnDogProfile(req.telegramUser!.id);
  if (!dog) return res.status(400).json({ error: "no_profile" });

  await prisma.follow.deleteMany({
    where: { followerDogId: dog.id, followingDogId: req.params.dogId },
  });

  res.json({ ok: true });
});

export default router;
