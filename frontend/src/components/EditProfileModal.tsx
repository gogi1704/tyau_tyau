import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import ProfileForm from "./ProfileForm";
import type { DogProfile } from "../lib/types";

export default function EditProfileModal({ profile, onClose }: { profile: DogProfile; onClose: () => void }) {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-end bg-black/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          className="max-h-[90vh] w-full overflow-y-auto rounded-t-3xl bg-white px-5 pb-8 pt-4 dark:bg-ink-800"
          initial={{ y: 500 }}
          animate={{ y: 0 }}
          exit={{ y: 500 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-ink-900 dark:text-white">Редактировать анкету</h2>
            <button type="button" onClick={onClose} className="text-ink-400 dark:text-ink-300">
              <X size={22} />
            </button>
          </div>

          <ProfileForm profile={profile} onSaved={onClose} />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
