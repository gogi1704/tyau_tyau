interface TelegramWebApp {
  initData: string;
  initDataUnsafe: { start_param?: string; user?: { id: number; username?: string; first_name?: string } };
  themeParams: Record<string, string>;
  colorScheme: "light" | "dark";
  ready: () => void;
  expand: () => void;
  setHeaderColor?: (color: string) => void;
  setBackgroundColor?: (color: string) => void;
  openTelegramLink: (url: string) => void;
  openLink: (url: string) => void;
  HapticFeedback?: {
    impactOccurred: (style: "light" | "medium" | "heavy" | "rigid" | "soft") => void;
    notificationOccurred: (type: "error" | "success" | "warning") => void;
  };
  onEvent: (event: string, cb: () => void) => void;
}

declare global {
  interface Window {
    Telegram?: { WebApp: TelegramWebApp };
  }
}

const webApp = typeof window !== "undefined" ? window.Telegram?.WebApp : undefined;

export const isInsideTelegram = Boolean(webApp?.initData);

const THEME_STORAGE_KEY = "tyau-tyau-theme";

export function initTelegram() {
  if (isInsideTelegram && webApp) {
    webApp.ready();
    webApp.expand();
    applyThemeFromTelegram();
    webApp.onEvent("themeChanged", applyThemeFromTelegram);
    return;
  }

  // Вне Telegram (локальная разработка в обычном браузере): смотрим на
  // сохранённый ручной выбор темы, иначе — на системную тему устройства.
  applyColorScheme(getStoredScheme() ?? systemPrefersDark());
  window.matchMedia?.("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
    if (!getStoredScheme()) applyColorScheme(e.matches);
  });
}

function applyThemeFromTelegram() {
  if (!webApp) return;
  const p = webApp.themeParams;
  const root = document.documentElement;
  if (p.bg_color) root.style.setProperty("--tg-bg", p.bg_color);
  if (p.text_color) root.style.setProperty("--tg-text", p.text_color);
  if (p.hint_color) root.style.setProperty("--tg-hint", p.hint_color);
  if (p.secondary_bg_color) root.style.setProperty("--tg-secondary-bg", p.secondary_bg_color);
  root.classList.toggle("dark", webApp.colorScheme === "dark");
}

function systemPrefersDark(): boolean {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches;
}

function getStoredScheme(): boolean | null {
  const v = typeof window !== "undefined" ? window.localStorage.getItem(THEME_STORAGE_KEY) : null;
  return v === null ? null : v === "dark";
}

function applyColorScheme(isDark: boolean) {
  document.documentElement.classList.toggle("dark", isDark);
}

/** Только для локальной разработки вне Telegram — внутри Telegram тема следует за клиентом пользователя. */
export function toggleColorScheme() {
  const isDark = document.documentElement.classList.contains("dark");
  const next = !isDark;
  window.localStorage.setItem(THEME_STORAGE_KEY, next ? "dark" : "light");
  applyColorScheme(next);
}

export function isDarkMode(): boolean {
  return document.documentElement.classList.contains("dark");
}

export function getInitData(): string {
  return webApp?.initData ?? "";
}

export function getStartParam(): string | undefined {
  return webApp?.initDataUnsafe?.start_param;
}

export function haptic(style: "light" | "medium" | "heavy" = "light") {
  webApp?.HapticFeedback?.impactOccurred(style);
}

export function hapticNotification(type: "error" | "success" | "warning") {
  webApp?.HapticFeedback?.notificationOccurred(type);
}

export function openTelegramLink(url: string) {
  if (webApp) {
    webApp.openTelegramLink(url);
  } else {
    window.open(url, "_blank");
  }
}

export function shareUrl(url: string, text: string) {
  openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`);
}

export function openOwnerChat(username?: string | null, telegramId?: string) {
  if (username) {
    openTelegramLink(`https://t.me/${username}`);
  } else if (telegramId) {
    openTelegramLink(`tg://user?id=${telegramId}`);
  }
}
