import { AnimatePresence, motion } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Trash2, X } from "lucide-react";
import { api } from "../lib/api";
import DogAvatar from "./DogAvatar";
import type { Post } from "../lib/types";

const formatter = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });

export default function PostDetailModal({
  post,
  canDelete,
  onClose,
}: {
  post: Post;
  canDelete: boolean;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: () => api.deletePost(post.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      onClose();
    },
  });

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-card dark:bg-ink-800"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {post.photoUrl && <img src={post.photoUrl} alt="" className="max-h-[50vh] w-full object-cover" />}

          <div className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <DogAvatar photoUrl={post.dog.photoUrl} size={32} />
                <div>
                  <p className="text-sm font-semibold text-ink-900 dark:text-white">{post.dog.name}</p>
                  <p className="text-xs text-ink-400">{formatter.format(new Date(post.createdAt))}</p>
                </div>
              </div>
              <button onClick={onClose} className="text-ink-400 dark:text-ink-300">
                <X size={20} />
              </button>
            </div>

            {post.caption && <p className="mt-3 text-sm text-ink-700 dark:text-ink-200">{post.caption}</p>}

            {canDelete && (
              <button
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 py-2.5 text-sm font-semibold text-red-600 disabled:opacity-60 dark:bg-red-500/10 dark:text-red-400"
              >
                {deleteMutation.isPending ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                Удалить пост
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
