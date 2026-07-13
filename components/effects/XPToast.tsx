"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

type XPToastProps = {
  xp: number;
  onClose: () => void;
};

export default function XPToast({
  xp,
  onClose,
}: XPToastProps) {
  useEffect(() => {
    const timer = window.setTimeout(() => {
      onClose();
    }, 2600);

    return () => {
      window.clearTimeout(timer);
    };
  }, [onClose]);

  return (
    <motion.div
      role="status"
      aria-live="polite"
      initial={{
        opacity: 0,
        y: -18,
        scale: 0.9,
        rotate: -2,
      }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
        rotate: 0,
      }}
      exit={{
        opacity: 0,
        y: -10,
        scale: 0.96,
      }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 18,
      }}
      className="
        fixed
        right-6
        top-24
        z-[1100]
        w-[min(22rem,calc(100vw-3rem))]
        overflow-hidden
        rounded-[1.75rem]
        border
        border-white/90
        bg-gradient-to-br
        from-pink-100
        via-purple-100
        to-amber-100
        p-1
        shadow-[0_20px_55px_rgba(126,34,206,0.25)]
      "
    >
      <div
        className="
          relative
          overflow-hidden
          rounded-[1.5rem]
          bg-white/80
          px-5
          py-4
          backdrop-blur-xl
        "
      >
        <div
          aria-hidden="true"
          className="
            absolute
            -left-5
            -top-5
            h-20
            w-20
            rounded-full
            bg-pink-200/50
            blur-2xl
          "
        />

        <div
          aria-hidden="true"
          className="
            absolute
            -bottom-7
            -right-5
            h-24
            w-24
            rounded-full
            bg-purple-200/50
            blur-2xl
          "
        />

        <motion.span
          aria-hidden="true"
          className="absolute right-4 top-3 text-lg"
          animate={{
            rotate: [0, 12, -8, 0],
            scale: [1, 1.18, 1],
          }}
          transition={{
            duration: 1.4,
            repeat: Infinity,
            repeatDelay: 0.8,
          }}
        >
          🌸
        </motion.span>

        <div className="relative flex items-center gap-4">
          <motion.div
            aria-hidden="true"
            className="
              grid
              size-12
              shrink-0
              place-items-center
              rounded-2xl
              bg-gradient-to-br
              from-purple-600
              via-fuchsia-500
              to-pink-500
              text-white
              shadow-lg
            "
            animate={{
              y: [0, -3, 0],
            }}
            transition={{
              duration: 1.1,
              repeat: Infinity,
            }}
          >
            <Sparkles className="size-6" />
          </motion.div>

          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-purple-500">
              Little win unlocked
            </p>

            <p className="mt-1 text-2xl font-black text-slate-900">
              +{xp} XP
            </p>

            <p className="mt-1 text-sm font-semibold text-slate-600">
              Your learning garden just bloomed ✨
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}