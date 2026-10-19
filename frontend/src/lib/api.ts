import { getInitData } from "./telegram";
import type {
  AiChatMessage,
  DogProfile,
  FeedScope,
  Group,
  DosageUnit,
  MatchInfo,
  Medication,
  Meetup,
  PersonSummary,
  Post,
  PresenceScope,
  ProfileStats,
  PublicProfile,
  WalkPoint,
} from "./types";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`/api${path}`, {
    ...options,
    headers: {
      ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      "X-Telegram-Init-Data": getInitData(),
      ...options.headers,
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `request_failed_${res.status}`);
  }
  return res.json();
}

export const api = {
  getMyProfile: () =>
    request<{ dogProfile: DogProfile | null; stats: ProfileStats | null }>("/profile/me"),

  saveProfile: (form: FormData) =>
    request<{ dogProfile: DogProfile; created: boolean }>("/profile", { method: "POST", body: form }),

  getDogProfile: (dogId: string) => request<PublicProfile>(`/profile/${dogId}`),

  getPeople: (params: { district?: string } = {}) => {
    const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v) as string[][]);
    return request<{ dogProfiles: PersonSummary[] }>(`/profile?${qs.toString()}`);
  },

  getFeed: (scope: FeedScope) => request<{ posts: Post[] }>(`/posts/feed?scope=${scope}`),

  getDogPosts: (dogId: string) => request<{ posts: Post[] }>(`/posts/dog/${dogId}`),

  getGroupPosts: (groupId: string) => request<{ posts: Post[] }>(`/posts/group/${groupId}`),

  createPost: (form: FormData) => request<{ post: Post }>("/posts", { method: "POST", body: form }),

  deletePost: (id: string) => request<{ ok: true }>(`/posts/${id}`, { method: "DELETE" }),

  viewPost: (id: string) => request<{ viewsCount: number }>(`/posts/${id}/view`, { method: "POST" }),

  follow: (dogId: string) => request<{ ok: true }>(`/follow/${dogId}`, { method: "POST" }),

  unfollow: (dogId: string) => request<{ ok: true }>(`/follow/${dogId}`, { method: "DELETE" }),

  getGroups: () => request<{ groups: Group[] }>("/groups"),

  getGroup: (id: string) => request<{ group: Group }>(`/groups/${id}`),

  createGroup: (form: FormData) => request<{ group: Group }>("/groups", { method: "POST", body: form }),

  joinGroup: (id: string) => request<{ group: Group }>(`/groups/${id}/join`, { method: "POST" }),

  leaveGroup: (id: string) => request<{ group: Group }>(`/groups/${id}/join`, { method: "DELETE" }),

  startPresence: (lat: number, lng: number) =>
    request<{ session: { id: string; expiresAt: string } }>("/presence/start", {
      method: "POST",
      body: JSON.stringify({ lat, lng }),
    }),

  stopPresence: () => request<{ ok: true }>("/presence/stop", { method: "POST" }),

  getActivePresence: (scope: PresenceScope) =>
    request<{ points: WalkPoint[] }>(`/presence/active?scope=${scope}`),

  searchCandidates: (params: { district?: string; breed?: string; goal?: string }) => {
    const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v) as string[][]);
    return request<{ candidates: DogProfile[] }>(`/search?${qs.toString()}`);
  },

  swipe: (targetDogId: string, direction: "like" | "pass") =>
    request<{ match: MatchInfo | null }>("/search/swipe", {
      method: "POST",
      body: JSON.stringify({ targetDogId, direction }),
    }),

  getMatches: () => request<{ matches: MatchInfo[] }>("/search/matches"),

  getMeetups: () => request<{ meetups: Meetup[] }>("/meetups"),

  getMeetup: (id: string) => request<{ meetup: Meetup }>(`/meetups/${id}`),

  createMeetup: (data: {
    title: string;
    description: string;
    district: string;
    placeName: string;
    scheduledAt: string;
    chatLink?: string;
  }) => request<{ meetup: Meetup }>("/meetups", { method: "POST", body: JSON.stringify(data) }),

  joinMeetup: (id: string) => request<{ meetup: Meetup }>(`/meetups/${id}/join`, { method: "POST" }),

  leaveMeetup: (id: string) => request<{ meetup: Meetup }>(`/meetups/${id}/leave`, { method: "POST" }),

  getMedications: () => request<{ medications: Medication[] }>("/medications"),

  addMedication: (data: {
    name: string;
    dosageAmount: number;
    dosageUnit: DosageUnit;
    frequencyHours?: number | null;
    startAt?: string | null;
    reminderEnabled?: boolean;
  }) => request<{ medication: Medication }>("/medications", { method: "POST", body: JSON.stringify(data) }),

  deleteMedication: (id: string) => request<{ ok: true }>(`/medications/${id}`, { method: "DELETE" }),

  updateMedicalInfo: (data: { weightKg: number | null; heightCm: number | null; medicalNotes: string | null }) =>
    request<{ dogProfile: DogProfile }>("/profile/medical", { method: "PATCH", body: JSON.stringify(data) }),

  getAiChat: () => request<{ messages: AiChatMessage[]; enabled: boolean }>("/ai-chat"),

  sendAiChatMessage: (message: string) =>
    request<{ message: AiChatMessage }>("/ai-chat", { method: "POST", body: JSON.stringify({ message }) }),
};
