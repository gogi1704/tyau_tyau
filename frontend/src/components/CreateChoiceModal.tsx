import { AnimatePresence, motion } from "framer-motion";
import { CalendarHeart, Users, X } from "lucide-react";
import { useAppStore } from "../lib/store";

export default function CreateChoiceModal() {
  const open = useAppStore((s) => s.createChoiceOpen);
  const close = useAppStore((s) => s.closeCreateChoice);
  const openCreateMeetup = useAppStore((s) => s.openCreateMeetup);
  const openCreateGroup = useAppStore((s) => s.openCreateGroup);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end bg-black/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={close}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            className="w-full rounded-t-3xl bg-white px-5 pb-8 pt-4 dark:bg-ink-800"
            initial={{ y: 300 }}
            animate={{ y: 0 }}
            exit={{ y: 300 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-ink-900 dark:text-white">Что создать?</h2>
              <button type="button" onClick={close} className="text-ink-400 dark:text-ink-300">
                <X size={22} />
              </button>
            </div>

            <div className="space-y-2.5">
              <button
                onClick={openCreateMeetup}
                className="flex w-full items-center gap-3 rounded-2xl bg-ink-50 p-4 text-left active:scale-[0.98] transition-transform dark:bg-ink-700"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-coral-100 text-coral-600 dark:bg-coral-500/15 dark:text-coral-300">
                  <CalendarHeart size={20} />
                </span>
                <span>
                  <span className="block font-semibold text-ink-900 dark:text-white">Новая встреча</span>
                  <span className="block text-xs text-ink-400">Созвать соседей на прогулку</span>
                </span>
              </button>

              <button
                onClick={openCreateGroup}
                className="flex w-full items-center gap-3 rounded-2xl bg-ink-50 p-4 text-left active:scale-[0.98] transition-transform dark:bg-ink-700"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-forest-100 text-forest-700 dark:bg-forest-500/15 dark:text-forest-300">
                  <Users size={20} />
                </span>
                <span>
                  <span className="block font-semibold text-ink-900 dark:text-white">Новая группа</span>
                  <span className="block text-xs text-ink-400">Сообщество по интересам или району</span>
                </span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
