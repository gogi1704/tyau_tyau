import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { api } from "../lib/api";
import TopBar from "../components/TopBar";
import DogAvatar from "../components/DogAvatar";
import EmptyState from "../components/EmptyState";
import { openOwnerChat } from "../lib/telegram";

export default function ChatsScreen() {
  const { data: profileData } = useQuery({ queryKey: ["profile", "me"], queryFn: api.getMyProfile });
  const hasProfile = Boolean(profileData?.dogProfile);

  const { data, isLoading } = useQuery({
    queryKey: ["matches"],
    queryFn: api.getMatches,
    enabled: hasProfile,
  });
  const matches = data?.matches ?? [];

  if (!hasProfile) {
    return (
      <EmptyState
        title="Сначала заполните анкету"
        subtitle="Нужен профиль питомца, чтобы видеть совпадения"
        action={
          <Link to="/profile" className="rounded-xl bg-forest-700 px-5 py-2.5 text-sm font-semibold text-white">
            Заполнить профиль
          </Link>
        }
      />
    );
  }

  return (
    <div className="pb-6">
      <TopBar title="Чаты" subtitle="Ваши совпадения из «Дог-Тиндера»" />

      {isLoading ? (
        <p className="text-center text-sm text-ink-400">Загружаем совпадения…</p>
      ) : matches.length === 0 ? (
        <EmptyState
          title="Пока нет совпадений"
          subtitle="Ставьте лайки понравившимся собакам в поиске — взаимные лайки появятся здесь"
          action={
            <Link to="/search" className="rounded-xl bg-forest-700 px-5 py-2.5 text-sm font-semibold text-white">
              К поиску
            </Link>
          }
        />
      ) : (
        <div className="space-y-2.5 px-5">
          {matches.map((m) => (
            <div
              key={m.id}
              className="flex w-full items-center gap-3 rounded-2xl bg-white p-3 shadow-soft dark:bg-ink-800"
            >
              <Link to={`/dog/${m.dog.id}`} className="flex flex-1 items-center gap-3">
                <DogAvatar photoUrl={m.dog.photoUrl} size={48} />
                <div className="flex-1">
                  <p className="font-semibold text-ink-900 dark:text-white">{m.dog.name}</p>
                  <p className="text-xs text-ink-400">{m.dog.breed}</p>
                </div>
              </Link>
              <button
                onClick={() => openOwnerChat(m.ownerUsername, m.ownerTelegramId)}
                aria-label="Написать хозяину"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-forest-100 text-forest-700 active:scale-90 transition-transform dark:bg-forest-500/15 dark:text-forest-300"
              >
                <MessageCircle size={17} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
