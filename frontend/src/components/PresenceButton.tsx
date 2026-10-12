import { useEffect, useState } from "react";
import { Radar, Loader2, Square } from "lucide-react";

export default function PresenceButton({
  isWalking,
  expiresAt,
  pending,
  onStart,
  onStop,
}: {
  isWalking: boolean;
  expiresAt?: string;
  pending: boolean;
  onStart: () => void;
  onStop: () => void;
}) {
  const [minutesLeft, setMinutesLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!isWalking || !expiresAt) {
      setMinutesLeft(null);
      return;
    }
    const update = () => {
      const diff = new Date(expiresAt).getTime() - Date.now();
      setMinutesLeft(Math.max(0, Math.round(diff / 60000)));
    };
    update();
    const timer = setInterval(update, 30000);
    return () => clearInterval(timer);
  }, [isWalking, expiresAt]);

  if (isWalking) {
    return (
      <button
        onClick={onStop}
        disabled={pending}
        className="flex items-center gap-2.5 rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-card active:scale-95 transition-transform disabled:opacity-60"
      >
        <span className="relative flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/70" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-white" />
        </span>
        На прогулке · ~{minutesLeft} мин
        {pending ? <Loader2 size={15} className="animate-spin" /> : <Square size={13} />}
      </button>
    );
  }

  return (
    <button
      onClick={onStart}
      disabled={pending}
      className="flex items-center gap-2.5 rounded-full bg-forest-700 px-5 py-3 text-sm font-semibold text-white shadow-card active:scale-95 transition-transform disabled:opacity-60"
    >
      {pending ? <Loader2 size={17} className="animate-spin" /> : <Radar size={17} />}
      Я на прогулке
    </button>
  );
}
