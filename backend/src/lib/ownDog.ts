import { prisma } from "./prisma";

export async function getOwnDogProfile(telegramId: string) {
  const user = await prisma.user.findUnique({
    where: { telegramId },
    include: { dogProfile: true },
  });
  return user?.dogProfile ?? null;
}

export async function getProfileStats(dogId: string) {
  const [postsCount, followersCount, followingCount] = await Promise.all([
    prisma.post.count({ where: { dogProfileId: dogId } }),
    prisma.follow.count({ where: { followingDogId: dogId } }),
    prisma.follow.count({ where: { followerDogId: dogId } }),
  ]);
  return { postsCount, followersCount, followingCount };
}
