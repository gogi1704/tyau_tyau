import type { ReactNode } from "react";

export default function EmptyState({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-8 py-16 text-center">
      <svg width="88" height="88" viewBox="0 0 88 88" fill="none" className="mb-4 opacity-80">
        <circle cx="44" cy="44" r="44" fill="#FFE4D7" />
        <path
          d="M44 50c-9 0-16 5-16 11 0 2.2 1.8 4 4 4h24c2.2 0 4-1.8 4-4 0-6-7-11-16-11Z"
          fill="#FF7F4D"
        />
        <ellipse cx="33" cy="36" rx="5.5" ry="7" fill="#FF7F4D" />
        <ellipse cx="55" cy="36" rx="5.5" ry="7" fill="#FF7F4D" />
        <ellipse cx="44" cy="44" rx="8" ry="7" fill="#FF7F4D" />
      </svg>
      <p className="text-base font-semibold text-ink-700 dark:text-ink-100">{title}</p>
      {subtitle && <p className="mt-1.5 max-w-xs text-sm text-ink-400">{subtitle}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
