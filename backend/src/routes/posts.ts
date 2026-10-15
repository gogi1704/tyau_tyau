import { Router } from "express";
import { prisma } from "../lib/prisma";
import { telegramAuth } from "../middleware/auth";
import { upload } from "../lib/upload";
import { getOwnDogProfile } from "../lib/ownDog";

const router = Router();

function serializePost(p: any) {
  return {
    id: p.id,
    photoUrl: p.photoUrl,
    caption: p.caption,
    viewsCount: p.viewsCount,
    createdAt: p.createdAt,
    dog: { id: p.dogProfile.id, name: p.dogProfile.name, photoUrl: p.dogProfile.photoUrl },
    group: p.group ? { id: p.group.id, name: p.group.name, photoUrl: p.group.photoUrl } : null,
  };
}

router.get("/feed", telegramAuth, async (req, res) => {
  const dog = await getOwnDogProfile(req.telegramUser!.id);
  if (!dog) return res.status(400).json({ error: "no_profile" });

  const scope = req.query.scope === "groups" ? "groups" : "users";

  if (scope === "groups") {
    const memberships = await prisma.groupMember.findMany({
      where: { dogProfileId: dog.id },
      select: { groupId: true },
    });
    const groupIds = memberships.map((m) => m.groupId);

    const posts = groupIds.length
      ? await prisma.post.findMany({
          where: { groupId: { in: groupIds } },
          include: { dogProfile: true, group: true },
          orderBy: { createdAt: "desc" },
          take: 60,
        })
      : [];

    return res.json({ posts: posts.map(serializePost) });
  }

  const following = await prisma.follow.findMany({
    where: { followerDogId: dog.id },
    select: { followingDogId: true },
  });
  const followingIds = following.map((f) => f.followingDogId);

  const posts = await prisma.post.findMany({
    where: { groupId: null, dogProfileId: { in: [...followingIds, dog.id] } },
    include: { dogProfile: true, group: true },
    orderBy: { createdAt: "desc" },
    take: 60,
  });

  res.json({ posts: posts.map(serializePost) });
});

router.get("/dog/:dogId", telegramAuth, async (req, res) => {
  const posts = await prisma.post.findMany({
    where: { dogProfileId: req.params.dogId },
    include: { dogProfile: true, group: true },
    orderBy: { createdAt: "desc" },
    take: 60,
  });
  res.json({ posts: posts.map(serializePost) });
});

router.get("/group/:groupId", telegramAuth, async (req, res) => {
  const posts = await prisma.post.findMany({
    where: { groupId: req.params.groupId },
    include: { dogProfile: true, group: true },
    orderBy: { createdAt: "desc" },
    take: 60,
  });
  res.json({ posts: posts.map(serializePost) });
});

router.post("/", telegramAuth, upload.single("photo"), async (req, res) => {
  const dog = await getOwnDogProfile(req.telegramUser!.id);
  if (!dog) return res.status(400).json({ error: "no_profile" });

  const caption = typeof req.body.caption === "string" ? req.body.caption.trim() : "";
  const photoUrl = req.file ? `/uploads/${req.file.filename}` : null;
  const groupId = typeof req.body.groupId === "string" && req.body.groupId ? req.body.groupId : null;

  if (!caption && !photoUrl) {
    return res.status(400).json({ error: "empty_post" });
  }

  if (groupId) {
    const membership = await prisma.groupMember.findUnique({
      where: { groupId_dogProfileId: { groupId, dogProfileId: dog.id } },
    });
    if (!membership) return res.status(403).json({ error: "not_a_member" });
  }

  const post = await prisma.post.create({
    data: { dogProfileId: dog.id, caption: caption || null, photoUrl, groupId },
    include: { dogProfile: true, group: true },
  });

  res.json({ post: serializePost(post) });
});

router.post("/:id/view", telegramAuth, async (req, res) => {
  try {
    const post = await prisma.post.update({
      where: { id: req.params.id },
      data: { viewsCount: { increment: 1 } },
      select: { viewsCount: true },
    });
    res.json({ viewsCount: post.viewsCount });
  } catch {
    res.status(404).json({ error: "not_found" });
  }
});

router.delete("/:id", telegramAuth, async (req, res) => {
  const dog = await getOwnDogProfile(req.telegramUser!.id);
  if (!dog) return res.status(400).json({ error: "no_profile" });

  const post = await prisma.post.findUnique({ where: { id: req.params.id } });
  if (!post || post.dogProfileId !== dog.id) {
    return res.status(404).json({ error: "not_found" });
  }

  await prisma.post.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

export default router;
