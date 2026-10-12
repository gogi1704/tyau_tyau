import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Loader2, MessageCircle } from "lucide-react";
import { api } from "../lib/api";
import DogAvatar from "../components/DogAvatar";
import FollowButton from "../components/FollowButton";
import PostGrid from "../components/PostGrid";
import PostDetailModal from "../components/PostDetailModal";
import { districtLabel } from "../data/districts";
import { openOwnerChat } from "../lib/telegram";
import type { Post } from "../lib/types";

export default function PublicProfileScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["profile", "dog", id],
    queryFn: () => api.getDogProfile(id!),
    enabled: Boolean(id),
  });

  useEffect(() => {
    if (data?.isOwn) navigate("/profile", { replace: true });
  }, [data?.isOwn, navigate]);

  const { data: postsData } = useQuery({
    queryKey: ["posts", "dog", id],
    queryFn: () => api.getDogPosts(id!),
    enabled: Boolean(id) && !data?.isOwn,
  });
  const posts = postsData?.posts ?? [];

  if (isLoading || !data || data.isOwn) {
    return (
      <div className="flex h-64 items-center justify-center text-ink-300">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  const { dogProfile, owner, stats, isFollowedByMe } = data;

  return (
    <div className="pb-6">
      <Link to="/" className="mb-2 inline-flex items-center gap-1.5 px-5 pt-4 text-sm font-medium text-ink-500 dark:text-ink-300">
        <ArrowLeft size={16} /> Назад
      </Link>

      <div className="flex items-start justify-between px-5 pt-2">
        <div className="flex items-center gap-4">
          <DogAvatar photoUrl={dogProfile.photoUrl} size={72} className="shadow-soft" />
          <div>
            <h1 className="text-xl font-extrabold text-ink-900 dark:text-white">{dogProfile.name}</h1>
            <p className="text-sm text-ink-400">
              {dogProfile.breed} · {districtLabel(dogProfile.district)}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-around rounded-2xl bg-white py-3 mx-5 shadow-soft dark:bg-ink-800">
        <Stat value={stats.postsCount} label="Посты" />
        <Divider />
        <Stat value={stats.followersCount} label="Подписчики" />
        <Divider />
        <Stat value={stats.followingCount} label="Подписки" />
      </div>

      <div className="mt-4 flex gap-2.5 px-5">
        <FollowButton dogId={dogProfile.id} isFollowing={isFollowedByMe} className="flex-1" />
        <button
          onClick={() => openOwnerChat(owner.username, owner.telegramId)}
          className="flex items-center justify-center gap-1.5 rounded-full bg-ink-50 px-4 py-2 text-sm font-semibold text-ink-600 dark:bg-ink-800 dark:text-ink-200"
        >
          <MessageCircle size={15} /> Написать
        </button>
      </div>

      <div className="mt-6">
        {posts.length === 0 ? (
          <p className="px-5 text-center text-sm text-ink-400">Здесь пока нет постов</p>
        ) : (
          <PostGrid posts={posts} onSelect={setSelectedPost} />
        )}
      </div>

      {selectedPost && (
        <PostDetailModal post={selectedPost} canDelete={false} onClose={() => setSelectedPost(null)} />
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
