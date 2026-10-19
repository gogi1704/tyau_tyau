import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Plus } from "lucide-react";
import { api } from "../lib/api";
import TopBar from "../components/TopBar";
import DogAvatar from "../components/DogAvatar";
import ProfileForm from "../components/ProfileForm";
import ProfileMenu from "../components/ProfileMenu";
import EditProfileModal from "../components/EditProfileModal";
import MedicalCardModal from "../components/MedicalCardModal";
import CreatePostModal from "../components/CreatePostModal";
import PostCard from "../components/PostCard";
import PostDetailModal from "../components/PostDetailModal";
import { districtLabel } from "../data/districts";
import type { Post } from "../lib/types";

export default function ProfileScreen() {
  const { data, isLoading } = useQuery({ queryKey: ["profile", "me"], queryFn: api.getMyProfile });
  const profile = data?.dogProfile ?? null;
  const stats = data?.stats ?? null;

  const [editing, setEditing] = useState(false);
  const [medicalOpen, setMedicalOpen] = useState(false);
  const [creatingPost, setCreatingPost] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const { data: postsData } = useQuery({
    queryKey: ["posts", "dog", profile?.id],
    queryFn: () => api.getDogPosts(profile!.id),
    enabled: Boolean(profile),
  });
  const posts = postsData?.posts ?? [];

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-ink-300">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="pb-6">
        <TopBar title="Давайте познакомимся 🐾" subtitle="Регистрация в 3 клика" />
        <div className="px-5">
          <ProfileForm profile={null} />
        </div>
      </div>
    );
  }

  return (
    <div className="pb-6">
      <div className="flex items-start justify-between px-5 pt-5">
        <div className="flex items-center gap-4">
          <DogAvatar photoUrl={profile.photoUrl} size={72} className="shadow-soft" />
          <div>
            <h1 className="text-xl font-extrabold text-ink-900 dark:text-white">{profile.name}</h1>
            <p className="text-sm text-ink-400">
              {profile.breed} · {districtLabel(profile.district)}
            </p>
          </div>
        </div>
        <ProfileMenu onEdit={() => setEditing(true)} onMedical={() => setMedicalOpen(true)} />
      </div>

      {stats && (
        <div className="mt-5 flex items-center justify-around rounded-2xl bg-white py-3 mx-5 shadow-soft dark:bg-ink-800">
          <Stat value={stats.postsCount} label="Посты" />
          <Divider />
          <Stat value={stats.followersCount} label="Подписчики" />
          <Divider />
          <Stat value={stats.followingCount} label="Подписки" />
        </div>
      )}

      <div className="mt-4 px-5">
        <button
          onClick={() => setCreatingPost(true)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-forest-700 py-3 text-sm font-semibold text-white shadow-soft active:scale-[0.98] transition-transform"
        >
          <Plus size={17} /> Добавить пост
        </button>
      </div>

      <div className="mt-6 px-5">
        {posts.length === 0 ? (
          <p className="text-center text-sm text-ink-400">Пока нет постов — поделитесь первым моментом</p>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} onClick={() => setSelectedPost(post)} />
            ))}
          </div>
        )}
      </div>

      {editing && <EditProfileModal profile={profile} onClose={() => setEditing(false)} />}
      {medicalOpen && <MedicalCardModal onClose={() => setMedicalOpen(false)} />}
      {creatingPost && <CreatePostModal onClose={() => setCreatingPost(false)} />}
      {selectedPost && (
        <PostDetailModal post={selectedPost} canDelete onClose={() => setSelectedPost(null)} />
      )}
    </div>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-lg font-extrabold text-ink-900 dark:text-white">{value}</span>
      <span className="text-xs text-ink-400">{label}</span>
    </div>
  );
}

function Divider() {
  return <span className="h-8 w-px bg-ink-100 dark:bg-ink-700" />;
}
