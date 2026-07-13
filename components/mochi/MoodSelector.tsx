"use client";

import { motion } from "framer-motion";

import { MOCHI_MOODS, type MochiMood } from "@/lib/mochi";

type MoodSelectorProps = {
  mood: MochiMood | null;
  onSelect: (mood: MochiMood) => void;
};

export default function MoodSelector({ mood, onSelect }: MoodSelectorProps) {
  return (
    <div>
      <p className="text-sm font-bold text-slate-700">How are you feeling?</p>
      <div className="mt-2 flex flex-wrap gap-2" aria-label="Choose your mood">
        {MOCHI_MOODS.map((option) => {
          const selected = mood === option.id;
          return (
            <motion.button
              key={option.id}
              type="button"
              aria-pressed={selected}
              onClick={() => onSelect(option.id)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.96 }}
              className={`rounded-full border px-3 py-2 text-sm font-semibold shadow-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-500 ${
                selected
                  ? "border-purple-300 bg-purple-600 text-white"
                  : "border-white/80 bg-white/80 text-slate-700 hover:bg-pink-50"
              }`}
            >
              <span aria-hidden="true">{option.emoji}</span> {option.label}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
