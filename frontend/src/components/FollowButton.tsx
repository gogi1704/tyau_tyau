import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { api } from "../lib/api";
import { haptic } from "../lib/telegram";

export default function FollowButton({
  dogId,
  isFollowing,
  className = "",
}: {
  dogId: string;
  isFollowing: boolean;
  className?: string;
}) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => (isFollowing ? api.unfollow(dogId) : api.follow(dogId)),
    onSuccess: () => {
      haptic("light");
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        mutation.mutate();
      }}
      disabled={mutation.isPending}
      className={`flex items-center justify-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-60 ${
        isFollowing
          ? "bg-ink-50 text-ink-600 dark:bg-ink-700 dark:text-ink-200"
          : "bg-forest-700 text-white"
      } ${className}`}
    >
      {mutation.isPending && <Loader2 size={14} className="animate-spin" />}
      {isFollowing ? "Вы подписаны" : "Подписаться"}
    </button>
  );
}
