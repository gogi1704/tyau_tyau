import { Router } from "express";
import { prisma } from "../lib/prisma";
import { telegramAuth } from "../middleware/auth";
import { getOwnDogProfile } from "../lib/ownDog";
import { districtCenter } from "../lib/districts";

const router = Router();

function serializeMeetup(m: any, ownDogId: string | null) {
  return {
    id: m.id,
    title: m.title,
    description: m.description,
    district: m.district,
    placeName: m.placeName,
    lat: m.lat,
    lng: m.lng,
    scheduledAt: m.scheduledAt,
    chatLink: m.chatLink,
    organizer: {
      id: m.organizerDog.id,
      name: m.organizerDog.name,
      breed: m.organizerDog.breed,
      photoUrl: m.organizerDog.photoUrl,
    },
    participantsCount: m.participants.length,
    participants: m.participants.map((p: any) => ({
      id: p.dogProfile.id,
      name: p.dogProfile.name,
      photoUrl: p.dogProfile.photoUrl,
    })),
    isJoined: ownDogId ? m.participants.some((p: any) => p.dogProfileId === ownDogId) : false,
    isOwn: ownDogId ? m.organizerDogId === ownDogId : false,
  };
}

router.get("/", telegramAuth, async (req, res) => {
  const dog = await getOwnDogProfile(req.telegramUser!.id);

  const meetups = await prisma.meetup.findMany({
    where: { scheduledAt: { gte: new Date(Date.now() - 2 * 60 * 60 * 1000) } },
    include: {
      organizerDog: true,
      participants: { include: { dogProfile: true } },
    },
    orderBy: { scheduledAt: "asc" },
  });

  res.json({ meetups: meetups.map((m) => serializeMeetup(m, dog?.id ?? null)) });
});

router.get("/:id", telegramAuth, async (req, res) => {
  const dog = await getOwnDogProfile(req.telegramUser!.id);
  const meetup = await prisma.meetup.findUnique({
    where: { id: req.params.id },
    include: {
      organizerDog: true,
      participants: { include: { dogProfile: true } },
    },
  });
  if (!meetup) return res.status(404).json({ error: "not_found" });
  res.json({ meetup: serializeMeetup(meetup, dog?.id ?? null) });
});

router.post("/", telegramAuth, async (req, res) => {
  const dog = await getOwnDogProfile(req.telegramUser!.id);
  if (!dog) return res.status(400).json({ error: "no_profile" });

  const { title, description, district, placeName, scheduledAt, chatLink } = req.body;
  if (!title || !description || !district || !placeName || !scheduledAt) {
    return res.status(400).json({ error: "missing_fields" });
  }

  const center = districtCenter(district);
  const meetup = await prisma.meetup.create({
    data: {
      organizerDogId: dog.id,
      title,
      description,
      district,
      placeName,
      lat: center.lat,
      lng: center.lng,
      scheduledAt: new Date(scheduledAt),
      chatLink: chatLink || null,
    },
    include: {
      organizerDog: true,
      participants: { include: { dogProfile: true } },
    },
  });

  res.json({ meetup: serializeMeetup(meetup, dog.id) });
});

router.post("/:id/join", telegramAuth, async (req, res) => {
  const dog = await getOwnDogProfile(req.telegramUser!.id);
  if (!dog) return res.status(400).json({ error: "no_profile" });

  await prisma.meetupParticipant.upsert({
    where: { meetupId_dogProfileId: { meetupId: req.params.id, dogProfileId: dog.id } },
    update: {},
    create: { meetupId: req.params.id, dogProfileId: dog.id },
  });

  const meetup = await prisma.meetup.findUnique({
    where: { id: req.params.id },
    include: {
      organizerDog: true,
      participants: { include: { dogProfile: true } },
    },
  });
  if (!meetup) return res.status(404).json({ error: "not_found" });

  res.json({ meetup: serializeMeetup(meetup, dog.id) });
});

router.post("/:id/leave", telegramAuth, async (req, res) => {
  const dog = await getOwnDogProfile(req.telegramUser!.id);
  if (!dog) return res.status(400).json({ error: "no_profile" });

  await prisma.meetupParticipant.deleteMany({
    where: { meetupId: req.params.id, dogProfileId: dog.id },
  });

  const meetup = await prisma.meetup.findUnique({
    where: { id: req.params.id },
    include: {
      organizerDog: true,
      participants: { include: { dogProfile: true } },
    },
  });
  if (!meetup) return res.status(404).json({ error: "not_found" });

  res.json({ meetup: serializeMeetup(meetup, dog.id) });
});

export default router;
