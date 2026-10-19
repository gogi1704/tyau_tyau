import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Send, Sparkles } from "lucide-react";
import { api } from "../lib/api";
import type { DogProfile } from "../lib/types";

export default function AiChatTab({ profile }: { profile: DogProfile }) {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["ai-chat"], queryFn: api.getAiChat });
  const messages = data?.messages ?? [];
  const enabled = data?.enabled ?? true;

  const [input, setInput] = useState("");
  const [pendingText, setPendingText] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const sendMutation = useMutation({
    mutationFn: (message: string) => api.sendAiChatMessage(message),
    onSuccess: () => {
      setPendingText(null);
      queryClient.invalidateQueries({ queryKey: ["ai-chat"] });
    },
    onError: () => setPendingText(null),
  });

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, pendingText, sendMutation.isPending]);

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || sendMutation.isPending || !enabled) return;
    setPendingText(text);
    setInput("");
    sendMutation.mutate(text);
  }

  return (
    <div className="flex flex-col">
      {!enabled && !isLoading && (
        <p className="mb-3 rounded-xl bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
          ИИ-консультант ещё не настроен администратором приложения.
        </p>
      )}

      <div className="space-y-2.5">
        {isLoading ? (
          <p className="py-6 text-center text-sm text-ink-400">Загружаем…</p>
        ) : messages.length === 0 && !pendingText ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-forest-100 text-forest-700 dark:bg-forest-500/15 dark:text-forest-300">
              <Sparkles size={20} />
            </span>
            <p className="max-w-xs text-sm text-ink-400">
              Спросите что-нибудь о здоровье, питании или уходе за {profile.name} — я учту породу, параметры и приёмы
              препаратов
            </p>
          </div>
        ) : (
          messages.map((m) => <ChatBubble key={m.id} role={m.role} content={m.content} />)
        )}

        {pendingText && <ChatBubble role="user" content={pendingText} />}

        {sendMutation.isPending && (
          <div className="flex items-center gap-1.5 px-1 text-xs text-ink-400">
            <Loader2 size={13} className="animate-spin" /> Печатает…
          </div>
        )}

        {sendMutation.isError && (
          <p className="px-1 text-xs font-medium text-red-500">Не получилось получить ответ. Попробуйте ещё раз.</p>
        )}

        <div ref={endRef} />
      </div>

      <form onSubmit={handleSend} className="sticky bottom-0 mt-4 flex gap-2 bg-[color:var(--tg-bg)] pb-1 pt-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={enabled ? "Спросите про здоровье питомца…" : "ИИ-консультант недоступен"}
          disabled={!enabled}
          className="input flex-1 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={!enabled || !input.trim() || sendMutation.isPending}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-forest-700 text-white disabled:opacity-50"
          aria-label="Отправить"
        >
          <Send size={17} />
        </button>
      </form>
    </div>
  );
}

function ChatBubble({ role, content }: { role: string; content: string }) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
          isUser ? "bg-forest-700 text-white" : "bg-white text-ink-800 shadow-soft dark:bg-ink-800 dark:text-white"
        }`}
      >
        {content}
      </div>
    </div>
  );
}
