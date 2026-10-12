import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import TopBar from "../components/TopBar";
import SwipeDeck from "../components/SwipeDeck";
import EmptyState from "../components/EmptyState";
import { DISTRICTS } from "../data/districts";
import { BREEDS } from "../data/breeds";
import { useAppStore } from "../lib/store";
import { hapticNotification } from "../lib/telegram";
import type { DogProfile } from "../lib/types";

export default function SearchScreen() {
  const queryClient = useQueryClient();
  const { data: profileData } = useQuery({ queryKey: ["profile", "me"], queryFn: api.getMyProfile });
  const hasProfile = Boolean(profileData?.dogProfile);

  const [district, setDistrict] = useState("");
  const [breed, setBreed] = useState("");
  const [goal, setGoal] = useState("");

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["search", district, breed, goal],
    queryFn: () => api.searchCandidates({ district, breed, goal }),
    enabled: hasProfile,
  });

  const [deck, setDeck] = useState<DogProfile[]>([]);
  const showMatch = useAppStore((s) => s.showMatch);

  useEffect(() => {
    setDeck(data?.candidates ?? []);
  }, [data]);

  async function handleSwipe(dog: DogProfile, direction: "like" | "pass") {
    setDeck((prev) => prev.filter((d) => d.id !== dog.id));
    try {
      const { match } = await api.swipe(dog.id, direction);
      if (match) {
        hapticNotification("success");
        showMatch(match);
        queryClient.invalidateQueries({ queryKey: ["matches"] });
      }
    } catch {
      // свайп не критичен — просто покажем карточку снова при следующем обновлении
    }
  }

  if (!hasProfile) {
    return (
      <EmptyState
        title="Сначала заполните анкету"
        subtitle="Нужен профиль питомца, чтобы искать компанию"
        action={
          <Link to="/profile" className="rounded-xl bg-forest-700 px-5 py-2.5 text-sm font-semibold text-white">
            Заполнить профиль
          </Link>
        }
      />
    );
  }

  return (
    <div className="pb-10">
      <TopBar title="Дог-Тиндер" subtitle="Свайпай вправо — если понравилась" />

      <div className="mb-5 flex gap-2 overflow-x-auto px-5 no-scrollbar">
        <select value={goal} onChange={(e) => setGoal(e.target.value)} className="input w-auto shrink-0 text-sm">
          <option value="">Любая цель</option>
          <option value="WALK">🟢 Прогулки</option>
          <option value="MATE">🔵 Вязка</option>
        </select>
        <select
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
          className="input w-auto shrink-0 text-sm"
        >
          <option value="">Любой район</option>
          {DISTRICTS.map((d) => (
            <option key={d.code} value={d.code}>
              {d.label}
            </option>
          ))}
        </select>
        <select value={breed} onChange={(e) => setBreed(e.target.value)} className="input w-auto shrink-0 text-sm">
          <option value="">Любая порода</option>
          {BREEDS.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <p className="text-center text-sm text-ink-400">Загружаем анкеты…</p>
      ) : deck.length === 0 ? (
        <EmptyState
          title="Анкеты закончились"
          subtitle="Попробуйте изменить фильтры или возвращайтесь позже — появятся новые собаки"
          action={
            <button
              onClick={() => refetch()}
              className="rounded-xl bg-forest-700 px-5 py-2.5 text-sm font-semibold text-white"
            >
              Обновить
            </button>
          }
        />
      ) : (
        <SwipeDeck dogs={deck} onSwipe={handleSwipe} />
      )}
    </div>
  );
}
