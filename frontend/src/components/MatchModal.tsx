import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { useAppStore } from "../lib/store";
import DogAvatar from "./DogAvatar";
import { openOwnerChat, hapticNotification } from "../lib/telegram";

const CONFETTI = ["🎉", "🐾", "💛", "🐾", "✨", "🐾"];

export default function MatchModal() {
  const match = useAppStore((s) => s.matchModal);
  const clearMatch = useAppStore((s) => s.clearMatch);

  return (
    <AnimatePresence>
      {match && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onAnimationComplete={() => hapticNotification("success")}
        >
          <motion.div
            className="relative w-full max-w-xs overflow-hidden rounded-3xl bg-white p-6 text-center shadow-card dark:bg-ink-800"
            initial={{ scale: 0.8, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
          >
            {CONFETTI.map((emoji, i) => (
              <motion.span
                key={i}
                className="absolute text-xl"
                style={{ left: `${10 + i * 15}%`, top: "-10%" }}
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 220, opacity: [0, 1, 1, 0] }}
                transition={{ duration: 1.8, delay: i * 0.08, ease: "easeIn" }}
              >
                {emoji}
              </motion.span>
            ))}

            <h2 className="text-xl font-extrabold text-ink-900 dark:text-white">Это мэтч! 🎉</h2>
            <p className="mt-1 text-sm text-ink-400">
              Вы и {match.dog.name} понравились друг другу
            </p>

            <div className="my-5 flex justify-center">
              <DogAvatar photoUrl={match.dog.photoUrl} size={88} className="shadow-soft" />
            </div>

            <div className="space-y-2.5">
              <button
                onClick={() => {
                  openOwnerChat(match.ownerUsername, match.ownerTelegramId);
                  clearMatch();
                }}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-forest-700 py-3 text-sm font-semibold text-white"
              >
                <MessageCircle size={16} /> Написать хозяину
              </button>
              <button
                onClick={clearMatch}
                className="w-full rounded-2xl bg-ink-50 py-3 text-sm font-semibold text-ink-500 dark:bg-ink-700 dark:text-ink-200"
              >
                Продолжить смотреть
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
