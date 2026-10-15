// Стабильный "случайный" пастельный фон для текстовых постов: один и тот же
// пост всегда получает один и тот же цвет (хэш по id), а разные посты —
// визуально разные оттенки. Светлая/тёмная версия через dark: — не JS.
const PASTELS = [
  "bg-rose-50 dark:bg-rose-500/10",
  "bg-amber-50 dark:bg-amber-500/10",
  "bg-emerald-50 dark:bg-emerald-500/10",
  "bg-sky-50 dark:bg-sky-500/10",
  "bg-violet-50 dark:bg-violet-500/10",
  "bg-pink-50 dark:bg-pink-500/10",
  "bg-teal-50 dark:bg-teal-500/10",
  "bg-orange-50 dark:bg-orange-500/10",
];

export function pastelBgClass(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return PASTELS[hash % PASTELS.length];
}
