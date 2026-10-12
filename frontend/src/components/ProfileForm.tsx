import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Camera, Check, Loader2 } from "lucide-react";
import { api } from "../lib/api";
import { DISTRICTS } from "../data/districts";
import { BREEDS } from "../data/breeds";
import DogAvatar from "./DogAvatar";
import { hapticNotification } from "../lib/telegram";
import type { AgeGroup, DogProfile, Gender, Goal } from "../lib/types";

export default function ProfileForm({ profile, onSaved }: { profile: DogProfile | null; onSaved?: () => void }) {
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [breed, setBreed] = useState(BREEDS[0]);
  const [gender, setGender] = useState<Gender>("MALE");
  const [ageGroup, setAgeGroup] = useState<AgeGroup>("ADULT");
  const [district, setDistrict] = useState(DISTRICTS[0].code);
  const [goal, setGoal] = useState<Goal>("WALK");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setBreed(profile.breed);
      setGender(profile.gender);
      setAgeGroup(profile.ageGroup);
      setDistrict(profile.district);
      setGoal(profile.goal);
    }
  }, [profile]);

  const saveMutation = useMutation({
    mutationFn: (form: FormData) => api.saveProfile(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      hapticNotification("success");
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
      onSaved?.();
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
    const form = new FormData();
    form.set("name", name.trim());
    form.set("breed", breed);
    form.set("gender", gender);
    form.set("ageGroup", ageGroup);
    form.set("district", district);
    form.set("goal", goal);
    if (photoFile) form.set("photo", photoFile);
    saveMutation.mutate(form);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="relative active:scale-95 transition-transform"
        >
          <DogAvatar photoUrl={photoPreview ?? profile?.photoUrl} size={104} className="shadow-card" />
          <span className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full bg-forest-700 text-white shadow-soft">
            <Camera size={16} />
          </span>
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
        <p className="text-xs text-ink-400">Фото из галереи</p>
      </div>

      <Field label="Кличка">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Например, Боня"
          required
          className="input"
        />
      </Field>

      <Field label="Порода">
        <select value={breed} onChange={(e) => setBreed(e.target.value)} className="input">
          {BREEDS.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Пол">
          <div className="flex overflow-hidden rounded-xl border border-ink-100 dark:border-ink-700">
            {(
              [
                ["MALE", "Мальчик"],
                ["FEMALE", "Девочка"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setGender(value)}
                className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                  gender === value
                    ? "bg-forest-700 text-white"
                    : "bg-white text-ink-500 dark:bg-ink-800 dark:text-ink-300"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Возраст">
          <div className="flex overflow-hidden rounded-xl border border-ink-100 dark:border-ink-700">
            {(
              [
                ["PUPPY", "Щенок"],
                ["ADULT", "Взрослый"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setAgeGroup(value)}
                className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                  ageGroup === value
                    ? "bg-forest-700 text-white"
                    : "bg-white text-ink-500 dark:bg-ink-800 dark:text-ink-300"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </Field>
      </div>

      <Field label="Район Ростова">
        <select value={district} onChange={(e) => setDistrict(e.target.value as any)} className="input">
          {DISTRICTS.map((d) => (
            <option key={d.code} value={d.code}>
              {d.label}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Цель">
        <div className="flex gap-3">
          <GoalButton
            active={goal === "WALK"}
            color="emerald"
            label="🟢 Ищу компанию для прогулок"
            onClick={() => setGoal("WALK")}
          />
          <GoalButton
            active={goal === "MATE"}
            color="sky"
            label="🔵 Ищу пару для вязки"
            onClick={() => setGoal("MATE")}
          />
        </div>
      </Field>

      <button
        type="submit"
        disabled={saveMutation.isPending}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-forest-700 py-3.5 text-base font-semibold text-white shadow-soft transition-transform active:scale-[0.98] disabled:opacity-60"
      >
        {saveMutation.isPending ? (
          <Loader2 size={18} className="animate-spin" />
        ) : saved ? (
          <>
            <Check size={18} /> Сохранено
          </>
        ) : (
          "Сохранить анкету"
        )}
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink-500 dark:text-ink-300">{label}</span>
      {children}
    </label>
  );
}

function GoalButton({
  active,
  label,
  color,
  onClick,
}: {
  active: boolean;
  label: string;
  color: "emerald" | "sky";
  onClick: () => void;
}) {
  const activeClasses =
    color === "emerald"
      ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-300"
      : "border-sky-500 bg-sky-50 dark:bg-sky-500/10 dark:text-sky-300";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-2xl border-2 px-3 py-3 text-left text-sm font-medium leading-snug transition-colors ${
        active
          ? activeClasses
          : "border-ink-100 bg-white text-ink-500 dark:border-ink-700 dark:bg-ink-800 dark:text-ink-300"
      }`}
    >
      {label}
    </button>
  );
}
