import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, type PanInfo, type Variants } from "framer-motion";
import { CalendarDays, Dog, Heart } from "lucide-react";
import { api } from "../lib/api";
import { haptic } from "../lib/telegram";
import PostCard from "../components/PostCard";
import PostDetailModal from "../components/PostDetailModal";
import EmptyState from "../components/EmptyState";
import SegmentedToggle from "../components/SegmentedToggle";
import type { FeedScope, Post } from "../lib/types";

function TyauLogo() {
  return (
    <div className="flex h-10 items-center rounded-2xl bg-forest-700 px-4 shadow-soft">
      <span
        className="text-lg leading-none tracking-wide text-white"
        style={{
          fontFamily: "'Baloo 2', cursive",
          fontWeight: 700,
          textShadow: "0 1.5px 0 rgba(0,0,0,0.22)",
        }}
      >
        Тяу-Тяу
      </span>
    </div>
  );
}

function MatchIcon() {
  return (
    <span className="relative flex h-5 w-5 items-center justify-center">
      <Heart size={13} className="absolute -top-1 fill-rose-400 text-rose-400" />
      <span className="mt-2 flex items-center">
        <Dog size={13} strokeWidth={2.2} className="relative z-10" />
        <Dog size={13} strokeWidth={2.2} className="relative z-10 -ml-1 scale-x-[-1]" />
      </span>
    </span>
  );
}

function MeetupIcon() {
  return (
    <span className="relative flex h-5 w-5 items-center justify-center">
      <CalendarDays size={18} strokeWidth={2.1} />
      <Dog
        size={11}
        strokeWidth={2.4}
        className="absolute -bottom-1 -right-1.5 rounded-full bg-white text-forest-700 dark:bg-ink-800 dark:text-forest-300"
      />
    </span>
  );
}

const slideVariants: Variants = {
  enter: (dir: number) => ({ x: dir > 0 ? 36 : -36, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -36 : 36, opacity: 0 }),
};

export default function HomeScreen() {
  const [scope, setScope] = useState<FeedScope>("users");
  const [direction, setDirection] = useState(0);
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

  function switchScope(next: FeedScope) {
    if (next === scope) return;
    setDirection(next === "groups" ? 1 : -1);
    setScope(next);
    haptic("light");
  }

  function handlePanEnd(_: unknown, info: PanInfo) {
    if (info.offset.x < -50) switchScope("groups");
    else if (info.offset.x > 50) switchScope("users");
  }

  return (
    <div className="pb-6">
      <div className="flex items-center justify-between px-5 pt-5">
        <TyauLogo />
        <div className="flex items-center gap-2">
          <Link
            to="/search"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-soft dark:bg-ink-800"
            aria-label="Поиск пары"
          >
            <MatchIcon />
          </Link>
          <Link
            to="/meetups"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-soft dark:bg-ink-800"
            aria-label="Встречи"
          >
            <MeetupIcon />
          </Link>
        </div>
      </div>

      {!hasProfile ? (
        <div className="mt-4">
          <EmptyState
            title="Сначала заполните анкету"
            subtitle="Это займёт меньше минуты — и откроется вся прогулочная жизнь Ростова"
            action={
              <Link to="/profile" className="rounded-xl bg-forest-700 px-5 py-2.5 text-sm font-semibold text-white">
                Заполнить профиль
              </Link>
            }
          />
        </div>
      ) : (
        <>
          <SegmentedToggle
            className="mx-5 mt-5"
            value={scope}
            onChange={switchScope}
            options={[
              { value: "users", label: "Пользователи" },
              { value: "groups", label: "Группы" },
            ]}
          />

          <motion.div className="mt-5 overflow-hidden px-5" onPanEnd={handlePanEnd}>
            <AnimatePresence mode="wait" custom={direction} initial={false}>
              <motion.div
                key={scope}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.22, ease: "easeOut" }}
              >
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
              </motion.div>
            </AnimatePresence>
          </motion.div>
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
