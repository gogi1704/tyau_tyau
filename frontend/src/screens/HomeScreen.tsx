import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Flame, CalendarHeart } from "lucide-react";
import { api } from "../lib/api";
import PostCard from "../components/PostCard";
import PostDetailModal from "../components/PostDetailModal";
import EmptyState from "../components/EmptyState";
import type { FeedScope, Post } from "../lib/types";

export default function HomeScreen() {
  const [scope, setScope] = useState<FeedScope>("users");
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const { data: profileData } = useQuery({ queryKey: ["profile", "me"], queryFn: api.getMyProfile });
  const hasProfile = Boolean(profileData?.dogProfile);
  const ownDogId = profileData?.dogProfile?.id;

  const { data, isLoading } = useQuery({
    queryKey: ["posts", "feed", scope],
    queryFn: () => api.getFeed(scope),
    enabled: hasProfile,
  });
  const posts = data?.posts ?? [];

  return (
    <div className="pb-6">
      <div className="px-5 pt-5">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink-900 dark:text-white">Привет! 👋</h1>
        <p className="mt-0.5 text-sm text-ink-400">Готовы к новым прогулкам?</p>
      </div>

      {!hasProfile ? (
        <EmptyState
          title="Сначала заполните анкету"
          subtitle="Это займёт меньше минуты — и откроется вся прогулочная жизнь Ростова"
          action={
            <Link to="/profile" className="rounded-xl bg-forest-700 px-5 py-2.5 text-sm font-semibold text-white">
              Заполнить профиль
            </Link>
          }
        />
      ) : (
        <>
          <div className="mt-4 flex gap-2 px-5">
            <button
              onClick={() => setScope("users")}
              className={`flex-1 rounded-full py-2 text-sm font-semibold transition-colors ${
                scope === "users" ? "bg-forest-700 text-white" : "bg-white text-ink-500 dark:bg-ink-800 dark:text-ink-300"
              }`}
            >
              Пользователи
            </button>
            <button
              onClick={() => setScope("groups")}
              className={`flex-1 rounded-full py-2 text-sm font-semibold transition-colors ${
                scope === "groups" ? "bg-forest-700 text-white" : "bg-white text-ink-500 dark:bg-ink-800 dark:text-ink-300"
              }`}
            >
              Группы
            </button>
          </div>

          <div className="mt-3 flex gap-4 px-5 text-sm">
            <Link to="/search" className="flex items-center gap-1.5 font-medium text-ink-500 dark:text-ink-300">
              <Flame size={15} /> Поиск
            </Link>
            <Link to="/meetups" className="flex items-center gap-1.5 font-medium text-ink-500 dark:text-ink-300">
              <CalendarHeart size={15} /> Встречи
            </Link>
          </div>

          <div className="mt-5 px-5">
            {isLoading ? (
              <p className="text-center text-sm text-ink-400">Загружаем ленту…</p>
            ) : posts.length === 0 ? (
              scope === "users" ? (
                <EmptyState
                  title="Лента пуста"
                  subtitle="Подпишитесь на интересных собак, чтобы видеть их посты здесь"
                  action={
                    <Link to="/people" className="rounded-xl bg-forest-700 px-5 py-2.5 text-sm font-semibold text-white">
                      Найти пользователей
                    </Link>
                  }
                />
              ) : (
                <EmptyState
                  title="Вы пока не в группах"
                  subtitle="Вступите в группу или создайте свою — посты появятся здесь"
                  action={
                    <Link to="/groups" className="rounded-xl bg-forest-700 px-5 py-2.5 text-sm font-semibold text-white">
                      Найти группы
                    </Link>
                  }
                />
              )
            ) : (
              <div className="space-y-3">
                {posts.map((p) => (
                  <PostCard key={p.id} post={p} onClick={() => setSelectedPost(p)} />
                ))}
              </div>
            )}
          </div>
        </>
      )}

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
