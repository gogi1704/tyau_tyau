export type Gender = "MALE" | "FEMALE";
export type AgeGroup = "PUPPY" | "ADULT";
export type Goal = "WALK" | "MATE";
export type DistrictCode =
  | "CENTER"
  | "ZHM"
  | "SZHM"
  | "NAKHICHEVAN"
  | "ALEXANDROVKA"
  | "SELMASH"
  | "VOENVED"
  | "LEVENTSOVKA"
  | "SUVOROVSKY"
  | "KRASNY_AKSAY";

export interface DogProfile {
  id: string;
  name: string;
  breed: string;
  photoUrl: string | null;
  gender: Gender;
  ageGroup: AgeGroup;
  district: DistrictCode;
  goal: Goal;
}

export interface WalkPoint {
  sessionId: string;
  lat: number;
  lng: number;
  expiresAt: string;
  isSelf: boolean;
  dog: Pick<DogProfile, "id" | "name" | "breed" | "photoUrl" | "goal"> & {
    ownerUsername: string | null;
    ownerTelegramId: string;
  };
}

export interface ProfileStats {
  postsCount: number;
  followersCount: number;
  followingCount: number;
}

export interface Post {
  id: string;
  photoUrl: string | null;
  caption: string | null;
  createdAt: string;
  dog: Pick<DogProfile, "id" | "name" | "photoUrl">;
  group: { id: string; name: string; photoUrl: string | null } | null;
}

export interface Group {
  id: string;
  name: string;
  description: string | null;
  photoUrl: string | null;
  createdAt: string;
  membersCount: number;
  isMember: boolean;
  isCreator: boolean;
}

export type PersonSummary = DogProfile & { isFollowedByMe: boolean };

export type FeedScope = "users" | "groups";

export interface PublicProfile {
  dogProfile: DogProfile;
  owner: { username: string | null; telegramId: string };
  stats: ProfileStats;
  isOwn: boolean;
  isFollowedByMe: boolean;
}

export interface MatchInfo {
  id: string;
  createdAt?: string;
  dog: Pick<DogProfile, "id" | "name" | "breed" | "photoUrl"> & { goal?: Goal };
  ownerUsername: string | null;
  ownerTelegramId?: string;
}

export interface Meetup {
  id: string;
  title: string;
  description: string;
  district: DistrictCode;
  placeName: string;
  lat: number;
  lng: number;
  scheduledAt: string;
  chatLink: string | null;
  organizer: Pick<DogProfile, "id" | "name" | "breed" | "photoUrl">;
  participantsCount: number;
  participants: Pick<DogProfile, "id" | "name" | "photoUrl">[];
  isJoined: boolean;
  isOwn: boolean;
}
