import { useState } from "react";
import { Moon, Sun } from "lucide-react";
import { isInsideTelegram, isDarkMode, toggleColorScheme } from "../lib/telegram";

export default function ThemeToggle() {
  const [dark, setDark] = useState(isDarkMode);

  if (isInsideTelegram) return null;

  return (
    <button
      onClick={() => {
        toggleColorScheme();
        setDark(isDarkMode());
      }}
      className="fixed right-3 bottom-24 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-white text-ink-500 shadow-soft active:scale-90 transition-transform dark:bg-ink-800 dark:text-ink-200"
      aria-label="Переключить тему"
      title="Только для локальной проверки — в Telegram тема следует за клиентом"
    >
      {dark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
