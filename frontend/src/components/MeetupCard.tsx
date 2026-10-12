import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { CalendarDays, MapPin, Share2, Users } from "lucide-react";
import { api } from "../lib/api";
import DogAvatar from "./DogAvatar";
import { districtLabel } from "../data/districts";
import { shareUrl, haptic } from "../lib/telegram";
import type { Meetup } from "../lib/types";

const formatter = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
  hour: "2-digit",
  minute: "2-digit",
});

export default function MeetupCard({ meetup, linkToDetail }: { meetup: Meetup; linkToDetail?: boolean }) {
  const queryClient = useQueryClient();

  const joinMutation = useMutation({
    mutationFn: () => (meetup.isJoined ? api.leaveMeetup(meetup.id) : api.joinMeetup(meetup.id)),
    onSuccess: () => {
      haptic("medium");
      queryClient.invalidateQueries({ queryKey: ["meetups"] });
    },
  });

  function handleShare() {
    const botUsername = import.meta.env.VITE_BOT_USERNAME as string | undefined;
    const link = botUsername
      ? `https://t.me/${botUsername}?startapp=meetup_${meetup.id}`
      : window.location.href;
    shareUrl(link, `🐾 ${meetup.title} — ${formatter.format(new Date(meetup.scheduledAt))}, ${meetup.placeName}`);
  }

  return (
    <div className="rounded-3xl bg-white p-4 shadow-soft dark:bg-ink-800">
      <div className="flex items-center gap-2 text-xs font-medium text-forest-700 dark:text-forest-300">
        <CalendarDays size={14} />
        {formatter.format(new Date(meetup.scheduledAt))}
      </div>

      {linkToDetail ? (
        <Link to={`/meetups/${meetup.id}`} className="mt-1.5 block">
          <h3 className="text-lg font-bold text-ink-900 dark:text-white">{meetup.title}</h3>
        </Link>
      ) : (
        <h3 className="mt-1.5 text-lg font-bold text-ink-900 dark:text-white">{meetup.title}</h3>
      )}
      <p className="mt-1 text-sm text-ink-500 line-clamp-2 dark:text-ink-300">{meetup.description}</p>

      <div className="mt-2 flex items-center gap-1.5 text-xs text-ink-400">
        <MapPin size={13} />
        {meetup.placeName} · {districtLabel(meetup.district)}
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            <Link to={`/dog/${meetup.organizer.id}`}>
              <DogAvatar
                photoUrl={meetup.organizer.photoUrl}
                size={28}
                className="border-2 border-white dark:border-ink-800"
              />
            </Link>
            {meetup.participants.slice(0, 3).map((p) => (
              <Link key={p.id} to={`/dog/${p.id}`}>
                <DogAvatar photoUrl={p.photoUrl} size={28} className="border-2 border-white dark:border-ink-800" />
              </Link>
            ))}
          </div>
          <span className="flex items-center gap-1 text-xs text-ink-400">
            <Users size={13} /> {meetup.participantsCount + 1}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-ink-50 text-ink-500 active:scale-90 transition-transform dark:bg-ink-700 dark:text-ink-300"
            aria-label="Позвать друзей"
          >
            <Share2 size={15} />
          </button>
          {!meetup.isOwn && (
            <button
              onClick={() => joinMutation.mutate()}
              disabled={joinMutation.isPending}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                meetup.isJoined
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                  : "bg-forest-700 text-white"
              }`}
            >
              {meetup.isJoined ? "Я иду ✓" : "Я пойду"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
