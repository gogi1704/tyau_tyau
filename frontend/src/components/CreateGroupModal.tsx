import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Camera, Loader2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";

export default function CreateGroupModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const mutation = useMutation({
    mutationFn: () => {
      const form = new FormData();
      form.set("name", name.trim());
      if (description.trim()) form.set("description", description.trim());
      if (photoFile) form.set("photo", photoFile);
      return api.createGroup(form);
    },
    onSuccess: ({ group }) => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      onClose();
      navigate(`/groups/${group.id}`);
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
    if (!name.trim()) return;
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
            <h2 className="text-lg font-bold text-ink-900 dark:text-white">Новая группа</h2>
            <button type="button" onClick={onClose} className="text-ink-400 dark:text-ink-300">
              <X size={22} />
            </button>
          </div>

          <div className="space-y-4">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex h-32 w-full items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-ink-200 bg-ink-50 dark:border-ink-700 dark:bg-ink-900"
            >
              {photoPreview ? (
                <img src={photoPreview} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="flex flex-col items-center gap-1.5 text-ink-400">
                  <Camera size={22} />
                  <span className="text-sm font-medium">Фото группы (необязательно)</span>
                </span>
              )}
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Например: Собачники Левенцовки"
              required
              className="input"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="О чём группа, кого ждёте…"
              className="input min-h-[90px] resize-none"
            />

            <button
              type="submit"
              disabled={mutation.isPending}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-forest-700 py-3.5 text-base font-semibold text-white shadow-soft disabled:opacity-60"
            >
              {mutation.isPending && <Loader2 size={18} className="animate-spin" />}
              Создать группу
            </button>
          </div>
        </motion.form>
      </motion.div>
    </AnimatePresence>
  );
}
