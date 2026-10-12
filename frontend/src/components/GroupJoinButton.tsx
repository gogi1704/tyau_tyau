import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { api } from "../lib/api";
import { haptic } from "../lib/telegram";

export default function GroupJoinButton({
  groupId,
  isMember,
  className = "",
}: {
  groupId: string;
  isMember: boolean;
  className?: string;
}) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => (isMember ? api.leaveGroup(groupId) : api.joinGroup(groupId)),
    onSuccess: () => {
      haptic("light");
      queryClient.invalidateQueries({ queryKey: ["groups"] });
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
        isMember ? "bg-ink-50 text-ink-600 dark:bg-ink-700 dark:text-ink-200" : "bg-forest-700 text-white"
      } ${className}`}
    >
      {mutation.isPending && <Loader2 size={14} className="animate-spin" />}
      {isMember ? "Вы участник" : "Вступить"}
    </button>
  );
}
