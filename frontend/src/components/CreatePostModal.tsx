import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Camera, Loader2, X } from "lucide-react";
import { api } from "../lib/api";

export default function CreatePostModal({ onClose, groupId }: { onClose: () => void; groupId?: string }) {
  const queryClient = useQueryClient();
  const [caption, setCaption] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const mutation = useMutation({
    mutationFn: () => {
      const form = new FormData();
      if (caption.trim()) form.set("caption", caption.trim());
      if (photoFile) form.set("photo", photoFile);
      if (groupId) form.set("groupId", groupId);
      return api.createPost(form);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      onClose();
    },
  });

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!caption.trim() && !photoFile) return;
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
            <h2 className="text-lg font-bold text-ink-900 dark:text-white">Новый пост</h2>
            <button type="button" onClick={onClose} className="text-ink-400 dark:text-ink-300">
              <X size={22} />
            </button>
          </div>

          <div className="space-y-4">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex h-44 w-full items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-ink-200 bg-ink-50 dark:border-ink-700 dark:bg-ink-900"
            >
              {photoPreview ? (
                <img src={photoPreview} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="flex flex-col items-center gap-1.5 text-ink-400">
                  <Camera size={24} />
                  <span className="text-sm font-medium">Добавить фото</span>
                </span>
              )}
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />

            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Расскажите, что у вас нового…"
              className="input min-h-[90px] resize-none"
            />

            {mutation.isError && (
              <p className="text-center text-sm font-medium text-red-600 dark:text-red-400">
                Не получилось опубликовать. Добавьте фото или текст и попробуйте снова.
              </p>
            )}

            <button
              type="submit"
              disabled={mutation.isPending}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-forest-700 py-3.5 text-base font-semibold text-white shadow-soft disabled:opacity-60"
            >
              {mutation.isPending && <Loader2 size={18} className="animate-spin" />}
              Опубликовать
            </button>
          </div>
        </motion.form>
      </motion.div>
    </AnimatePresence>
  );
}
