import { Router } from "express";
import { prisma } from "../lib/prisma";
import { telegramAuth } from "../middleware/auth";
import { upload } from "../lib/upload";
import { getOwnDogProfile } from "../lib/ownDog";

const router = Router();

async function serializeGroup(g: any, ownDogId: string | null) {
  const membersCount = await prisma.groupMember.count({ where: { groupId: g.id } });
  const isMember = ownDogId
    ? Boolean(await prisma.groupMember.findUnique({ where: { groupId_dogProfileId: { groupId: g.id, dogProfileId: ownDogId } } }))
    : false;
  return {
    id: g.id,
    name: g.name,
    description: g.description,
    photoUrl: g.photoUrl,
    createdAt: g.createdAt,
    membersCount,
    isMember,
    isCreator: ownDogId ? g.creatorDogId === ownDogId : false,
  };
}

router.get("/", telegramAuth, async (req, res) => {
  const dog = await getOwnDogProfile(req.telegramUser!.id);
  const groups = await prisma.group.findMany({ orderBy: { createdAt: "desc" }, take: 60 });
  const serialized = await Promise.all(groups.map((g) => serializeGroup(g, dog?.id ?? null)));
  res.json({ groups: serialized });
});

router.get("/:id", telegramAuth, async (req, res) => {
  const dog = await getOwnDogProfile(req.telegramUser!.id);
  const group = await prisma.group.findUnique({ where: { id: req.params.id } });
  if (!group) return res.status(404).json({ error: "not_found" });
  res.json({ group: await serializeGroup(group, dog?.id ?? null) });
});

router.post("/", telegramAuth, upload.single("photo"), async (req, res) => {
  const dog = await getOwnDogProfile(req.telegramUser!.id);
  if (!dog) return res.status(400).json({ error: "no_profile" });

  const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
  const description = typeof req.body.description === "string" ? req.body.description.trim() : "";
  if (!name) return res.status(400).json({ error: "missing_name" });

  const photoUrl = req.file ? `/uploads/${req.file.filename}` : null;

  const group = await prisma.group.create({
    data: { name, description: description || null, photoUrl, creatorDogId: dog.id },
  });
  await prisma.groupMember.create({ data: { groupId: group.id, dogProfileId: dog.id } });

  res.json({ group: await serializeGroup(group, dog.id) });
});

router.post("/:id/join", telegramAuth, async (req, res) => {
  const dog = await getOwnDogProfile(req.telegramUser!.id);
  if (!dog) return res.status(400).json({ error: "no_profile" });

  const group = await prisma.group.findUnique({ where: { id: req.params.id } });
  if (!group) return res.status(404).json({ error: "not_found" });

  await prisma.groupMember.upsert({
    where: { groupId_dogProfileId: { groupId: group.id, dogProfileId: dog.id } },
    update: {},
    create: { groupId: group.id, dogProfileId: dog.id },
  });

  res.json({ group: await serializeGroup(group, dog.id) });
});

router.delete("/:id/join", telegramAuth, async (req, res) => {
  const dog = await getOwnDogProfile(req.telegramUser!.id);
  if (!dog) return res.status(400).json({ error: "no_profile" });

  const group = await prisma.group.findUnique({ where: { id: req.params.id } });
  if (!group) return res.status(404).json({ error: "not_found" });

  await prisma.groupMember.deleteMany({ where: { groupId: group.id, dogProfileId: dog.id } });

  res.json({ group: await serializeGroup(group, dog.id) });
});

export default router;
