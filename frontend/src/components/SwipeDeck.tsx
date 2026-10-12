import { useState } from "react";
import { AnimatePresence, motion, PanInfo, Variants } from "framer-motion";
import { Heart, X } from "lucide-react";
import { districtLabel } from "../data/districts";
import type { DogProfile } from "../lib/types";

const SWIPE_THRESHOLD = 90;

const cardVariants: Variants = {
  exit: (direction: "like" | "pass") => ({
    x: direction === "like" ? 400 : -400,
    rotate: direction === "like" ? 20 : -20,
    opacity: 0,
    transition: { duration: 0.35 },
  }),
};

export default function SwipeDeck({
  dogs,
  onSwipe,
}: {
  dogs: DogProfile[];
  onSwipe: (dog: DogProfile, direction: "like" | "pass") => void;
}) {
  const visible = dogs.slice(0, 3);
  const [exitDirection, setExitDirection] = useState<"like" | "pass">("like");

  function triggerSwipe(dog: DogProfile, direction: "like" | "pass") {
    setExitDirection(direction);
    onSwipe(dog, direction);
  }

  function handleDragEnd(dog: DogProfile, info: PanInfo) {
    if (info.offset.x > SWIPE_THRESHOLD) triggerSwipe(dog, "like");
    else if (info.offset.x < -SWIPE_THRESHOLD) triggerSwipe(dog, "pass");
  }

  return (
    <div className="relative mx-auto h-[62vh] w-full max-w-sm">
      <AnimatePresence custom={exitDirection}>
        {visible
          .map((dog, i) => (
            <motion.div
              key={dog.id}
              className="absolute inset-0 cursor-grab active:cursor-grabbing"
              style={{ zIndex: visible.length - i }}
              variants={cardVariants}
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1 - i * 0.03, y: i * 10, opacity: 1 }}
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              drag={i === 0 ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.7}
              onDragEnd={(_e, info) => i === 0 && handleDragEnd(dog, info)}
              whileDrag={{ rotate: 0 }}
            >
              <DogCardFace dog={dog} />
            </motion.div>
          ))
          .reverse()}
      </AnimatePresence>

      {dogs.length > 0 && (
        <div className="absolute -bottom-20 inset-x-0 flex items-center justify-center gap-6">
          <button
            onClick={() => triggerSwipe(dogs[0], "pass")}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-ink-400 shadow-card active:scale-90 transition-transform dark:bg-ink-800 dark:text-ink-300"
            aria-label="Пропустить"
          >
            <X size={26} />
          </button>
          <button
            onClick={() => triggerSwipe(dogs[0], "like")}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-coral-500 text-white shadow-card active:scale-90 transition-transform"
            aria-label="Лайк"
          >
            <Heart size={24} fill="white" />
          </button>
        </div>
      )}
    </div>
  );
}

function DogCardFace({ dog }: { dog: DogProfile }) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-card dark:bg-ink-800">
      <div className="relative h-3/5 w-full bg-gradient-to-br from-coral-200 to-coral-400">
        {dog.photoUrl ? (
          <img src={dog.photoUrl} alt={dog.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-6xl">🐶</div>
        )}
        <span
          className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold text-white ${
            dog.goal === "MATE" ? "bg-sky-500" : "bg-emerald-500"
          }`}
        >
          {dog.goal === "MATE" ? "🔵 Пара для вязки" : "🟢 Прогулки"}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <div className="flex items-center gap-2">
          <h3 className="text-xl font-bold text-ink-900 dark:text-white">{dog.name}</h3>
          <span className="text-sm text-ink-400">
            {dog.ageGroup === "PUPPY" ? "щенок" : "взрослый"} · {dog.gender === "MALE" ? "мальчик" : "девочка"}
          </span>
        </div>
        <p className="text-sm font-medium text-ink-600 dark:text-ink-300">{dog.breed}</p>
        <p className="text-sm text-ink-400">{districtLabel(dog.district)}</p>
      </div>
    </div>
  );
}
