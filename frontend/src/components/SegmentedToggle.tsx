import { motion } from "framer-motion";

export default function SegmentedToggle<T extends string>({
  value,
  options,
  onChange,
  className = "",
}: {
  value: T;
  options: readonly [{ value: T; label: string }, { value: T; label: string }];
  onChange: (value: T) => void;
  className?: string;
}) {
  const activeIndex = options.findIndex((o) => o.value === value);

  return (
    <div className={`relative grid grid-cols-2 rounded-full bg-ink-100 p-1 dark:bg-ink-800 ${className}`}>
      <motion.div
        className="absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-full bg-forest-700 shadow-soft"
        animate={{ x: activeIndex === 1 ? "100%" : "0%" }}
        transition={{ type: "spring", stiffness: 500, damping: 36 }}
      />
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`relative z-10 rounded-full py-2.5 text-sm font-semibold transition-colors ${
            opt.value === value ? "text-white" : "text-ink-500 dark:text-ink-300"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
