"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  buddyPresentation,
  type StudyBuddy,
} from "@/lib/userPreferences";

type MochiMascotProps = {
  compact?: boolean;
  buddy?: StudyBuddy;
  buddyName?: string;
};

export default function MochiMascot({
  compact = false,
  buddy = "Mochi",
  buddyName,
}: MochiMascotProps) {
  const reduceMotion = useReducedMotion();
  const size = compact ? "h-24 w-24" : "h-32 w-32";
  const visibleName = buddyName || buddy;

  if (buddy !== "Mochi") {
    return (
      <motion.div
        aria-label={`${visibleName}, your ${buddy} study buddy`}
        className={`grid shrink-0 place-items-center rounded-[2rem] border-2 border-white/90 bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 text-6xl shadow-[0_10px_30px_rgba(126,34,206,0.14)] ${size}`}
        animate={reduceMotion ? undefined : { y: [0, -7, 0] }}
        transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
        role="img"
      >
        <span aria-hidden="true">{buddyPresentation[buddy].emoji}</span>
      </motion.div>
    );
  }

  return (
    <motion.div
      aria-label={`${visibleName} the study bunny`}
      className={`relative shrink-0 ${size}`}
      animate={reduceMotion ? undefined : { y: [0, -7, 0] }}
      transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
      role="img"
    >
      <motion.span
        aria-hidden="true"
        className="absolute left-0 top-6 text-lg text-yellow-400"
        animate={reduceMotion ? undefined : { opacity: [0.25, 1, 0.25], scale: [0.8, 1.2, 0.8], rotate: [0, 18, 0] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      >
        ✦
      </motion.span>
      <motion.span
        aria-hidden="true"
        className="absolute right-0 top-2 text-sm text-pink-400"
        animate={reduceMotion ? undefined : { opacity: [1, 0.3, 1], scale: [1, 0.75, 1] }}
        transition={{ duration: 3.1, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
      >
        ✨
      </motion.span>
      <motion.span
        aria-hidden="true"
        className="absolute bottom-1 right-2 text-base text-purple-400"
        animate={reduceMotion ? undefined : { opacity: [0.3, 1, 0.3], y: [2, -3, 2] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 1.1 }}
      >
        ✦
      </motion.span>

      <div className="absolute left-[24%] top-[4%] h-[47%] w-[24%] -rotate-6 rounded-full border-2 border-pink-100 bg-white shadow-sm">
        <div className="mx-auto mt-2 h-[72%] w-[45%] rounded-full bg-pink-100" />
      </div>
      <div className="absolute right-[24%] top-[4%] h-[47%] w-[24%] rotate-6 rounded-full border-2 border-pink-100 bg-white shadow-sm">
        <div className="mx-auto mt-2 h-[72%] w-[45%] rounded-full bg-pink-100" />
      </div>

      <div className="absolute bottom-[5%] left-[13%] h-[68%] w-[74%] rounded-[48%] border-2 border-pink-100 bg-white shadow-[0_10px_30px_rgba(219,39,119,0.14)]">
        <div className="absolute left-[18%] top-[51%] h-[15%] w-[21%] rounded-full bg-pink-100/80" />
        <div className="absolute right-[18%] top-[51%] h-[15%] w-[21%] rounded-full bg-pink-100/80" />

        <motion.span
          className="absolute left-[27%] top-[35%] h-[13%] w-[9%] rounded-full bg-slate-800"
          animate={reduceMotion ? undefined : { scaleY: [1, 1, 0.08, 1, 1] }}
          transition={{ duration: 4.8, repeat: Infinity, times: [0, 0.84, 0.88, 0.92, 1] }}
        />
        <motion.span
          className="absolute right-[27%] top-[35%] h-[13%] w-[9%] rounded-full bg-slate-800"
          animate={reduceMotion ? undefined : { scaleY: [1, 1, 0.08, 1, 1] }}
          transition={{ duration: 4.8, repeat: Infinity, times: [0, 0.84, 0.88, 0.92, 1] }}
        />

        <div className="absolute left-1/2 top-[52%] h-[9%] w-[11%] -translate-x-1/2 rotate-45 rounded-[45%] bg-pink-400" />
        <div className="absolute left-1/2 top-[62%] h-[8%] w-[19%] -translate-x-1/2 rounded-b-full border-b-2 border-pink-500" />
      </div>
    </motion.div>
  );
}
