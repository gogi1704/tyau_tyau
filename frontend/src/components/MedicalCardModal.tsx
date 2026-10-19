import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, BellOff, Loader2, Pill, Plus, Trash2, X } from "lucide-react";
import { api } from "../lib/api";
import type { DosageUnit } from "../lib/types";

function unitLabel(amount: number, unit: DosageUnit) {
  if (unit === "GRAMS") return "г";
  return amount === 1 ? "таблетка" : "таблетки";
}

function defaultStartAt() {
  const d = new Date(Date.now() + 60 * 60 * 1000);
  d.setMinutes(0, 0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function MedicalCardModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["medications"], queryFn: api.getMedications });
  const medications = data?.medications ?? [];

  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [dosageAmount, setDosageAmount] = useState("");
  const [dosageUnit, setDosageUnit] = useState<DosageUnit>("TABLETS");
  const [frequencyHours, setFrequencyHours] = useState("");
  const [startAt, setStartAt] = useState(defaultStartAt());
  const [reminderEnabled, setReminderEnabled] = useState(false);

  const hasFrequency = frequencyHours.trim() !== "" && Number(frequencyHours) > 0;

  const addMutation = useMutation({
    mutationFn: () =>
      api.addMedication({
        name: name.trim(),
        dosageAmount: Number(dosageAmount),
        dosageUnit,
        frequencyHours: hasFrequency ? Number(frequencyHours) : null,
        startAt: hasFrequency ? new Date(startAt).toISOString() : null,
        reminderEnabled: hasFrequency && reminderEnabled,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medications"] });
      setName("");
      setDosageAmount("");
      setFrequencyHours("");
      setReminderEnabled(false);
      setStartAt(defaultStartAt());
      setAdding(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteMedication(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["medications"] }),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !dosageAmount || Number(dosageAmount) <= 0) return;
    addMutation.mutate();
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
        <motion.div
          onClick={(e) => e.stopPropagation()}
          className="max-h-[85vh] w-full overflow-y-auto rounded-t-3xl bg-white px-5 pb-8 pt-4 dark:bg-ink-800"
          initial={{ y: 400 }}
          animate={{ y: 0 }}
          exit={{ y: 400 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-ink-900 dark:text-white">Медицинская карта</h2>
            <button type="button" onClick={onClose} className="text-ink-400 dark:text-ink-300">
              <X size={22} />
            </button>
          </div>

          {isLoading ? (
            <p className="py-6 text-center text-sm text-ink-400">Загружаем…</p>
          ) : medications.length === 0 && !adding ? (
            <p className="py-2 text-center text-sm text-ink-400">Препараты пока не добавлены</p>
          ) : (
            <div className="space-y-2.5">
              {medications.map((m) => (
                <div
                  key={m.id}
                  className="flex items-start gap-3 rounded-2xl bg-ink-50 p-3 dark:bg-ink-900"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-forest-100 text-forest-700 dark:bg-forest-500/15 dark:text-forest-300">
                    <Pill size={16} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-ink-900 dark:text-white">{m.name}</p>
                    <p className="text-xs text-ink-400">
                      {m.dosageAmount} {unitLabel(m.dosageAmount, m.dosageUnit)}
                      {m.frequencyHours ? ` · каждые ${m.frequencyHours} ч` : ""}
                    </p>
                    {m.frequencyHours && (
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-ink-400">
                        {m.reminderEnabled ? (
                          <>
                            <Bell size={11} className="text-forest-600 dark:text-forest-300" /> Напоминание за час
                          </>
                        ) : (
                          <>
                            <BellOff size={11} /> Без напоминания
                          </>
                        )}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteMutation.mutate(m.id)}
                    disabled={deleteMutation.isPending}
                    className="text-ink-300 active:scale-90 transition-transform dark:text-ink-500"
                    aria-label="Удалить препарат"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {adding ? (
            <form onSubmit={handleSubmit} className="mt-4 space-y-3 border-t border-ink-100 pt-4 dark:border-ink-700">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Название препарата"
                required
                className="input"
                autoFocus
              />

              <div className="flex gap-2">
                <input
                  value={dosageAmount}
                  onChange={(e) => setDosageAmount(e.target.value)}
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="Доза"
                  required
                  className="input flex-1"
                />
                <div className="flex overflow-hidden rounded-xl border border-ink-100 dark:border-ink-700">
                  {(
                    [
                      ["TABLETS", "Таблетки"],
                      ["GRAMS", "Граммы"],
                    ] as const
                  ).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setDosageUnit(value)}
                      className={`px-3 text-sm font-medium transition-colors ${
                        dosageUnit === value
                          ? "bg-forest-700 text-white"
                          : "bg-white text-ink-500 dark:bg-ink-800 dark:text-ink-300"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <input
                value={frequencyHours}
                onChange={(e) => setFrequencyHours(e.target.value)}
                type="number"
                min="1"
                step="1"
                placeholder="Периодичность, часов (необязательно)"
                className="input"
              />

              {hasFrequency && (
                <>
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-medium text-ink-500 dark:text-ink-300">
                      Первый приём
                    </span>
                    <input
                      value={startAt}
                      onChange={(e) => setStartAt(e.target.value)}
                      type="datetime-local"
                      required
                      className="input"
                    />
                  </label>

                  <label className="flex items-center justify-between rounded-xl bg-ink-50 px-3.5 py-3 dark:bg-ink-900">
                    <span className="flex items-center gap-2 text-sm font-medium text-ink-700 dark:text-ink-100">
                      <Bell size={15} /> Напоминать за час до приёма
                    </span>
                    <input
                      type="checkbox"
                      checked={reminderEnabled}
                      onChange={(e) => setReminderEnabled(e.target.checked)}
                      className="h-5 w-5 accent-forest-700"
                    />
                  </label>
                </>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setAdding(false)}
                  className="flex-1 rounded-xl bg-ink-50 py-2.5 text-sm font-semibold text-ink-500 dark:bg-ink-900 dark:text-ink-300"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={addMutation.isPending}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-forest-700 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {addMutation.isPending && <Loader2 size={15} className="animate-spin" />}
                  Добавить
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-ink-200 py-3 text-sm font-semibold text-ink-500 dark:border-ink-700 dark:text-ink-300"
            >
              <Plus size={17} /> Добавить препарат
            </button>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
