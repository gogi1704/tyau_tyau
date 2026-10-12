import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import TopBar from "../components/TopBar";
import MeetupCard from "../components/MeetupCard";
import EmptyState from "../components/EmptyState";
import { useAppStore } from "../lib/store";

export default function MeetupsScreen() {
  const { data: profileData } = useQuery({ queryKey: ["profile", "me"], queryFn: api.getMyProfile });
  const hasProfile = Boolean(profileData?.dogProfile);
  const { data, isLoading } = useQuery({ queryKey: ["meetups"], queryFn: api.getMeetups });
  const openCreateMeetup = useAppStore((s) => s.openCreateMeetup);
  const meetups = data?.meetups ?? [];

  return (
    <div className="pb-6">
      <TopBar
        title="Встречи"
        subtitle="Локальная афиша прогулок"
        right={
          hasProfile && (
            <button
              onClick={openCreateMeetup}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-forest-700 text-white shadow-soft active:scale-90 transition-transform"
              aria-label="Создать встречу"
            >
              <Plus size={20} />
            </button>
          )
        }
      />

      {!hasProfile ? (
        <EmptyState
          title="Сначала заполните анкету"
          subtitle="Нужен профиль питомца, чтобы участвовать во встречах"
          action={
            <Link to="/profile" className="rounded-xl bg-forest-700 px-5 py-2.5 text-sm font-semibold text-white">
              Заполнить профиль
            </Link>
          }
        />
      ) : isLoading ? (
        <p className="text-center text-sm text-ink-400">Загружаем афишу…</p>
      ) : meetups.length === 0 ? (
        <EmptyState
          title="Встреч пока нет"
          subtitle="Создайте первую — соберите собачников своего района на прогулку"
          action={
            <button
              onClick={openCreateMeetup}
              className="rounded-xl bg-forest-700 px-5 py-2.5 text-sm font-semibold text-white"
            >
              Создать встречу
            </button>
          }
        />
      ) : (
        <div className="space-y-3 px-5">
          {meetups.map((m) => (
            <MeetupCard key={m.id} meetup={m} linkToDetail />
          ))}
        </div>
      )}
    </div>
  );
}
