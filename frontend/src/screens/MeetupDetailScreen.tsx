import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { api } from "../lib/api";
import MeetupCard from "../components/MeetupCard";
import DogAvatar from "../components/DogAvatar";
import { openTelegramLink } from "../lib/telegram";

export default function MeetupDetailScreen() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useQuery({
    queryKey: ["meetup", id],
    queryFn: () => api.getMeetup(id!),
    enabled: Boolean(id),
  });

  if (isLoading || !data) {
    return <p className="px-5 py-10 text-center text-sm text-ink-400">Загружаем встречу…</p>;
  }

  const { meetup } = data;

  return (
    <div className="px-5 pb-6">
      <Link
        to="/meetups"
        className="mb-3 inline-flex items-center gap-1.5 pt-4 text-sm font-medium text-ink-500 dark:text-ink-300"
      >
        <ArrowLeft size={16} /> К афише
      </Link>

      <MeetupCard meetup={meetup} />

      {meetup.chatLink && (
        <button
          onClick={() => openTelegramLink(meetup.chatLink!)}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-ink-800 py-3 text-sm font-semibold text-white"
        >
          <ExternalLink size={16} /> Перейти в чат встречи
        </button>
      )}

      {meetup.participants.length > 0 && (
        <div className="mt-6">
          <h3 className="mb-3 text-sm font-semibold text-ink-500 dark:text-ink-300">Участники</h3>
          <div className="space-y-2.5">
            {[meetup.organizer, ...meetup.participants].map((p, i) => (
              <div
                key={`${p.id}-${i}`}
                className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-soft dark:bg-ink-800"
              >
                <DogAvatar photoUrl={p.photoUrl} size={40} />
                <p className="font-medium text-ink-800 dark:text-white">
                  {p.name}
                  {i === 0 && <span className="ml-2 text-xs font-normal text-forest-600">организатор</span>}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
