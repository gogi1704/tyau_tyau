import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, X } from "lucide-react";
import { api } from "../lib/api";
import { DISTRICTS } from "../data/districts";
import type { DistrictCode } from "../lib/types";

export default function CreateMeetupModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [district, setDistrict] = useState<DistrictCode>(DISTRICTS[0].code);
  const [placeName, setPlaceName] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [chatLink, setChatLink] = useState("");

  const mutation = useMutation({
    mutationFn: () =>
      api.createMeetup({
        title: title.trim(),
        description: description.trim(),
        district,
        placeName: placeName.trim(),
        scheduledAt,
        chatLink: chatLink.trim() || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meetups"] });
      onClose();
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !placeName.trim() || !scheduledAt) return;
    mutation.mutate();
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-end bg-black/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.form
          onSubmit={handleSubmit}
          onClick={(e) => e.stopPropagation()}
          className="max-h-[85vh] w-full overflow-y-auto rounded-t-3xl bg-white px-5 pb-8 pt-4 dark:bg-ink-800"
          initial={{ y: 400 }}
          animate={{ y: 0 }}
          exit={{ y: 400 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-ink-900 dark:text-white">Новая встреча</h2>
            <button type="button" onClick={onClose} className="text-ink-400 dark:text-ink-300">
              <X size={22} />
            </button>
          </div>

          <div className="space-y-4">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Например: Собираем мопсов"
              className="input"
              required
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Расскажите подробнее, кого ждёте и чем займётесь"
              className="input min-h-[90px] resize-none"
              required
            />
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value as DistrictCode)}
              className="input"
            >
              {DISTRICTS.map((d) => (
                <option key={d.code} value={d.code}>
                  {d.label}
                </option>
              ))}
            </select>
            <input
              value={placeName}
              onChange={(e) => setPlaceName(e.target.value)}
              placeholder="Место, например: парк Плевен, у фонтана"
              className="input"
              required
            />
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="input"
              required
            />
            <input
              value={chatLink}
              onChange={(e) => setChatLink(e.target.value)}
              placeholder="Ссылка на чат встречи (необязательно)"
              className="input"
            />

            {mutation.isError && (
              <p className="text-center text-sm font-medium text-red-600 dark:text-red-400">
                Сначала заполните анкету питомца на вкладке «Профиль».
              </p>
            )}

            <button
              type="submit"
              disabled={mutation.isPending}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-forest-700 py-3.5 text-base font-semibold text-white shadow-soft disabled:opacity-60"
            >
              {mutation.isPending && <Loader2 size={18} className="animate-spin" />}
              Создать встречу
            </button>
          </div>
        </motion.form>
      </motion.div>
    </AnimatePresence>
  );
}
