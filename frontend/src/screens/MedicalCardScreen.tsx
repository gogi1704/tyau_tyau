import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Check, Loader2 } from "lucide-react";
import { api } from "../lib/api";
import DogAvatar from "../components/DogAvatar";
import SegmentedToggle from "../components/SegmentedToggle";
import MedicationsTab from "../components/MedicationsTab";
import AiChatTab from "../components/AiChatTab";
import EmptyState from "../components/EmptyState";

type Tab = "meds" | "ai";

export default function MedicalCardScreen() {
  const { data, isLoading } = useQuery({ queryKey: ["profile", "me"], queryFn: api.getMyProfile });
  const profile = data?.dogProfile ?? null;
  const [tab, setTab] = useState<Tab>("meds");

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-ink-300">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <EmptyState
        title="Сначала заполните анкету"
        subtitle="Медицинская карта появится после создания профиля питомца"
        action={
          <Link to="/profile" className="rounded-xl bg-forest-700 px-5 py-2.5 text-sm font-semibold text-white">
            Заполнить профиль
          </Link>
        }
      />
    );
  }

  return (
    <div className="pb-6">
      <Link to="/profile" className="mb-2 inline-flex items-center gap-1.5 px-5 pt-4 text-sm font-medium text-ink-500 dark:text-ink-300">
        <ArrowLeft size={16} /> Назад
      </Link>

      <div className="flex items-center gap-3 px-5 pt-2">
        <DogAvatar photoUrl={profile.photoUrl} size={52} />
        <div>
          <h1 className="text-xl font-extrabold text-ink-900 dark:text-white">Медицинская карта</h1>
          <p className="text-sm text-ink-400">{profile.name}</p>
        </div>
      </div>

      <div className="mt-4 px-5">
        <DogInfoCard
          breed={profile.breed}
          weightKg={profile.weightKg ?? null}
          heightCm={profile.heightCm ?? null}
          medicalNotes={profile.medicalNotes ?? null}
        />
      </div>

      <SegmentedToggle
        className="mx-5 mt-5"
        value={tab}
        onChange={setTab}
        options={[
          { value: "meds", label: "Приёмы" },
          { value: "ai", label: "ИИ-консультант" },
        ]}
      />

      <div className="mt-4 px-5">{tab === "meds" ? <MedicationsTab /> : <AiChatTab profile={profile} />}</div>
    </div>
  );
}

function DogInfoCard({
  breed,
  weightKg,
  heightCm,
  medicalNotes,
}: {
  breed: string;
  weightKg: number | null;
  heightCm: number | null;
  medicalNotes: string | null;
}) {
  const queryClient = useQueryClient();
  const [weight, setWeight] = useState(weightKg ? String(weightKg) : "");
  const [height, setHeight] = useState(heightCm ? String(heightCm) : "");
  const [notes, setNotes] = useState(medicalNotes ?? "");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setWeight(weightKg ? String(weightKg) : "");
    setHeight(heightCm ? String(heightCm) : "");
    setNotes(medicalNotes ?? "");
  }, [weightKg, heightCm, medicalNotes]);

  const saveMutation = useMutation({
    mutationFn: () =>
      api.updateMedicalInfo({
        weightKg: weight.trim() ? Number(weight) : null,
        heightCm: height.trim() ? Number(height) : null,
        medicalNotes: notes.trim() || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", "me"] });
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    },
  });

  return (
    <div className="rounded-2xl bg-white p-4 shadow-soft dark:bg-ink-800">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-ink-400">Порода</span>
      </div>
      <p className="mt-0.5 font-semibold text-ink-900 dark:text-white">{breed}</p>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-400">Вес, кг</span>
          <input
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            type="number"
            min="0"
            step="0.1"
            placeholder="Например, 18"
            className="input"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-400">Рост, см</span>
          <input
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            type="number"
            min="0"
            step="1"
            placeholder="Например, 45"
            className="input"
          />
        </label>
      </div>

      <label className="mt-3 block">
        <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-400">
          Доп. комментарии
        </span>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Аллергии, хронические болезни, особенности характера…"
          className="input min-h-[70px] resize-none"
        />
      </label>

      <button
        type="button"
        onClick={() => saveMutation.mutate()}
        disabled={saveMutation.isPending}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-forest-700 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {saveMutation.isPending ? (
          <Loader2 size={15} className="animate-spin" />
        ) : saved ? (
          <>
            <Check size={15} /> Сохранено
          </>
        ) : (
          "Сохранить"
        )}
      </button>
    </div>
  );
}
