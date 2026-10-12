import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { api } from "../lib/api";
import DogAvatar from "../components/DogAvatar";
import FollowButton from "../components/FollowButton";
import { DISTRICTS, districtLabel } from "../data/districts";

export default function PeopleScreen() {
  const [district, setDistrict] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["people", district],
    queryFn: () => api.getPeople({ district: district || undefined }),
  });
  const people = data?.dogProfiles ?? [];

  return (
    <div className="pb-6">
      <Link to="/" className="mb-2 inline-flex items-center gap-1.5 px-5 pt-4 text-sm font-medium text-ink-500 dark:text-ink-300">
        <ArrowLeft size={16} /> Назад
      </Link>

      <div className="px-5 pt-2">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink-900 dark:text-white">Пользователи</h1>
        <p className="mt-0.5 text-sm text-ink-400">Подпишитесь, чтобы видеть их посты в ленте</p>
      </div>

      <div className="mt-4 px-5">
        <select value={district} onChange={(e) => setDistrict(e.target.value)} className="input w-auto text-sm">
          <option value="">Любой район</option>
          {DISTRICTS.map((d) => (
            <option key={d.code} value={d.code}>
              {d.label}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <p className="mt-6 text-center text-sm text-ink-400">Загружаем…</p>
      ) : (
        <div className="mt-4 space-y-2.5 px-5">
          {people.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-soft dark:bg-ink-800"
            >
              <Link to={`/dog/${p.id}`} className="flex flex-1 items-center gap-3">
                <DogAvatar photoUrl={p.photoUrl} size={48} />
                <div className="flex-1">
                  <p className="font-semibold text-ink-900 dark:text-white">{p.name}</p>
                  <p className="text-xs text-ink-400">
                    {p.breed} · {districtLabel(p.district)}
                  </p>
                </div>
              </Link>
              <FollowButton dogId={p.id} isFollowing={p.isFollowedByMe} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
