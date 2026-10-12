import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Loader2, Plus, Users } from "lucide-react";
import { api } from "../lib/api";
import GroupJoinButton from "../components/GroupJoinButton";
import PostGrid from "../components/PostGrid";
import PostDetailModal from "../components/PostDetailModal";
import CreatePostModal from "../components/CreatePostModal";
import type { Post } from "../lib/types";

export default function GroupDetailScreen() {
  const { id } = useParams<{ id: string }>();
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [creatingPost, setCreatingPost] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["groups", "detail", id],
    queryFn: () => api.getGroup(id!),
    enabled: Boolean(id),
  });

  const { data: profileData } = useQuery({ queryKey: ["profile", "me"], queryFn: api.getMyProfile });
  const ownDogId = profileData?.dogProfile?.id;

  const { data: postsData } = useQuery({
    queryKey: ["posts", "group", id],
    queryFn: () => api.getGroupPosts(id!),
    enabled: Boolean(id),
  });
  const posts = postsData?.posts ?? [];

  if (isLoading || !data) {
    return (
      <div className="flex h-64 items-center justify-center text-ink-300">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  const { group } = data;

  return (
    <div className="pb-6">
      <Link to="/" className="mb-2 inline-flex items-center gap-1.5 px-5 pt-4 text-sm font-medium text-ink-500 dark:text-ink-300">
        <ArrowLeft size={16} /> Назад
      </Link>

      <div className="flex items-start gap-4 px-5 pt-2">
        {group.photoUrl ? (
          <img src={group.photoUrl} alt="" className="h-16 w-16 rounded-2xl object-cover shadow-soft" />
        ) : (
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-forest-100 text-forest-700 shadow-soft dark:bg-forest-500/15 dark:text-forest-300">
            <Users size={26} />
          </span>
        )}
        <div className="flex-1">
          <h1 className="text-xl font-extrabold text-ink-900 dark:text-white">{group.name}</h1>
          <p className="text-sm text-ink-400">{group.membersCount} участников</p>
        </div>
      </div>

      {group.description && (
        <p className="mt-3 px-5 text-sm text-ink-600 dark:text-ink-200">{group.description}</p>
      )}

      <div className="mt-4 flex gap-2.5 px-5">
        <GroupJoinButton groupId={group.id} isMember={group.isMember} className="flex-1" />
        {group.isMember && (
          <button
            onClick={() => setCreatingPost(true)}
            className="flex items-center justify-center gap-1.5 rounded-full bg-ink-50 px-4 py-2 text-sm font-semibold text-ink-600 dark:bg-ink-800 dark:text-ink-200"
          >
            <Plus size={15} /> Пост
          </button>
        )}
      </div>

      <div className="mt-6">
        {posts.length === 0 ? (
          <p className="px-5 text-center text-sm text-ink-400">В группе пока нет постов</p>
        ) : (
          <PostGrid posts={posts} onSelect={setSelectedPost} />
        )}
      </div>

      {creatingPost && <CreatePostModal groupId={group.id} onClose={() => setCreatingPost(false)} />}
      {selectedPost && (
        <PostDetailModal
          post={selectedPost}
          canDelete={selectedPost.dog.id === ownDogId}
          onClose={() => setSelectedPost(null)}
        />
      )}
    </div>
  );
}
