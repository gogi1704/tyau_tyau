import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MoreHorizontal, Pencil, Stethoscope } from "lucide-react";

export default function ProfileMenu({ onEdit, onMedical }: { onEdit: () => void; onMedical: () => void }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-ink-50 text-ink-600 active:scale-90 transition-transform dark:bg-ink-800 dark:text-ink-200"
        aria-label="Меню профиля"
      >
        <MoreHorizontal size={20} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              className="absolute right-0 top-12 z-50 w-56 overflow-hidden rounded-2xl bg-white py-1.5 shadow-card dark:bg-ink-800"
              initial={{ opacity: 0, scale: 0.95, y: -6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -6 }}
              transition={{ duration: 0.15 }}
            >
              <button
                onClick={() => {
                  setOpen(false);
                  onEdit();
                }}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm font-medium text-ink-700 hover:bg-ink-50 dark:text-ink-100 dark:hover:bg-ink-700"
              >
                <Pencil size={16} /> Редактировать анкету
              </button>
              <button
                onClick={() => {
                  setOpen(false);
                  onMedical();
                }}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm font-medium text-ink-700 hover:bg-ink-50 dark:text-ink-100 dark:hover:bg-ink-700"
              >
                <Stethoscope size={16} /> Медицинская карта
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
