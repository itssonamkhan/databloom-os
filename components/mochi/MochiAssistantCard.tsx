"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { useProgress } from "@/context/ProgressContext";
import { useMochiAssistant } from "@/hooks/useMochiAssistant";
import { getXPEncouragement, type MochiMood } from "@/lib/mochi";
import { playClickSound } from "@/lib/sounds";

import MochiMascot from "./MochiMascot";
import MoodSelector from "./MoodSelector";

type MochiAssistantCardProps = {
  compact?: boolean;
};

type DailyItemProps = {
  label: string;
  text: string;
  tone: string;
  wide?: boolean;
};

function DailyItem({ label, text, tone, wide = false }: DailyItemProps) {
  return (
    <motion.div
      layout
      className={`rounded-2xl border border-white/70 p-4 shadow-sm ${tone} ${
        wide ? "sm:col-span-2" : ""
      }`}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <p className="text-xs font-black uppercase tracking-[0.13em] text-slate-600">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold leading-6 text-slate-800">{text}</p>
    </motion.div>
  );
}

export default function MochiAssistantCard({
  compact = false,
}: MochiAssistantCardProps) {
  const { xp } = useProgress();
  const { assistant, selectMood } = useMochiAssistant();
  const reduceMotion = useReducedMotion();

  const handleMood = (mood: MochiMood) => {
    playClickSound();
    selectMood(mood);
  };

  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={`overflow-hidden rounded-3xl border border-pink-200/60 bg-white/50 shadow-lg backdrop-blur-xl ${
        compact ? "p-5" : "p-6 sm:p-8"
      }`}
      aria-labelledby="mochi-assistant-title"
    >
      <div className={`flex ${compact ? "flex-col" : "flex-col lg:flex-row"} gap-5`}>
        <div className={`flex ${compact ? "items-center" : "items-center lg:w-[38%] lg:flex-col lg:items-start"} gap-4`}>
          <MochiMascot compact={compact} />

          <div className="min-w-0 flex-1">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-pink-600">
              Your daily study buddy
            </p>
            <h2 id="mochi-assistant-title" className={`${compact ? "text-xl" : "text-3xl"} mt-1 font-black text-purple-800`}>
              Mochi AI 2.0
            </h2>
            <p className="mt-1 text-sm text-slate-600">Fresh blooms for {assistant.date}</p>
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="rounded-2xl border border-pink-200/70 bg-gradient-to-br from-pink-100 via-white to-purple-100 p-4 shadow-sm">
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={`${assistant.mood ?? "daily"}-${assistant.encouragementIndex}`}
                initial={reduceMotion ? false : { opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -5 }}
                transition={{ duration: 0.25 }}
                className="font-semibold leading-7 text-slate-800"
                aria-live="polite"
              >
                {assistant.message}
              </motion.p>
            </AnimatePresence>
          </div>

          <div className="mt-4">
            <MoodSelector mood={assistant.mood} onSelect={handleMood} />
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <DailyItem
          label="Daily Motivation"
          text={assistant.dailyMotivation}
          tone="bg-pink-100/80"
        />
        <DailyItem
          label="Today's Mission"
          text={`🎯 ${assistant.mission.title} · +${assistant.mission.reward} XP`}
          tone="bg-amber-100/80"
        />
        <DailyItem
          label="Study Suggestion"
          text={assistant.studySuggestion}
          tone="bg-blue-100/80"
        />
        <DailyItem
          label="Gentle Reminder"
          text={assistant.gentleReminder}
          tone="bg-purple-100/80"
        />
        <DailyItem
          label="Study Tip"
          text={assistant.studyTip}
          tone="bg-emerald-100/80"
          wide
        />
      </div>

      <div className="mt-4 flex flex-col gap-2 rounded-2xl border border-purple-200/70 bg-purple-100/80 px-4 py-3 text-sm font-bold text-purple-800 sm:flex-row sm:items-center sm:justify-between">
        <span>🌸 Current XP: {xp.toLocaleString()}</span>
        <span>✨ {getXPEncouragement(xp)}</span>
      </div>
    </motion.section>
  );
}
