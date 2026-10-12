import { NavLink } from "react-router-dom";
import { Home, MapPin, Plus, MessageCircle, User } from "lucide-react";
import { haptic } from "../lib/telegram";
import { useAppStore } from "../lib/store";

const LEFT_TABS = [
  { to: "/", label: "Главная", icon: Home },
  { to: "/map", label: "Карта", icon: MapPin },
];

const RIGHT_TABS = [
  { to: "/chats", label: "Чаты", icon: MessageCircle },
  { to: "/profile", label: "Профиль", icon: User },
];

const itemClasses = (isActive: boolean) =>
  `flex flex-1 flex-col items-center gap-1 rounded-2xl py-1.5 text-[11px] font-medium transition-colors ${
    isActive ? "text-forest-700 dark:text-forest-300" : "text-ink-400 dark:text-ink-500"
  }`;

const iconWrapClasses = (isActive: boolean) =>
  `flex h-9 w-9 items-center justify-center rounded-xl transition-all ${
    isActive
      ? "bg-forest-100 text-forest-700 dark:bg-forest-500/15 dark:text-forest-300"
      : "text-ink-400 dark:text-ink-500"
  }`;

const createIconClasses =
  "flex h-9 w-9 items-center justify-center rounded-xl bg-ink-50 text-ink-500 dark:bg-ink-800 dark:text-ink-300";

function NavItem({ to, label, icon: Icon }: { to: string; label: string; icon: typeof Home }) {
  return (
    <NavLink to={to} onClick={() => haptic("light")} className={({ isActive }) => itemClasses(isActive)}>
      {({ isActive }) => (
        <>
          <span className={iconWrapClasses(isActive)}>
            <Icon size={20} strokeWidth={isActive ? 2.4 : 2} />
          </span>
          {label}
        </>
      )}
    </NavLink>
  );
}

export default function BottomNav() {
  const openCreateChoice = useAppStore((s) => s.openCreateChoice);

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-black/5 bg-white/90 backdrop-blur-lg dark:bg-ink-900/90 dark:border-white/5"
      style={{ paddingBottom: "max(var(--safe-bottom), 10px)" }}
    >
      <div className="mx-auto flex max-w-md items-stretch justify-between px-3 pt-2">
        {LEFT_TABS.map((tab) => (
          <NavItem key={tab.to} {...tab} />
        ))}

        <button
          type="button"
          onClick={() => {
            haptic("medium");
            openCreateChoice();
          }}
          className={itemClasses(false)}
          aria-label="Создать"
        >
          <span className={createIconClasses}>
            <Plus size={20} strokeWidth={2} />
          </span>
          Создать
        </button>

        {RIGHT_TABS.map((tab) => (
          <NavItem key={tab.to} {...tab} />
        ))}
      </div>
    </nav>
  );
}
