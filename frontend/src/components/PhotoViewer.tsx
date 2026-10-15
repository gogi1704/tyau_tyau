import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

export default function PhotoViewer({ src, onClose }: { src: string; onClose: () => void }) {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[60] bg-black"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <button
          onClick={onClose}
          className="absolute right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm"
          style={{ top: "max(var(--safe-top), 16px)" }}
          aria-label="Закрыть"
        >
          <X size={22} />
        </button>

        <TransformWrapper
          initialScale={1}
          minScale={1}
          maxScale={5}
          doubleClick={{ mode: "toggle" }}
          panning={{ velocityDisabled: true }}
        >
          <TransformComponent wrapperStyle={{ width: "100%", height: "100%" }} contentStyle={{ width: "100%", height: "100%" }}>
            <img src={src} alt="" className="h-screen w-screen object-contain" draggable={false} />
          </TransformComponent>
        </TransformWrapper>
      </motion.div>
    </AnimatePresence>
  );
}
