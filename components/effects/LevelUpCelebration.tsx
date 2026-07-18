"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import MochiMascot from "@/components/mochi/MochiMascot";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { getMochiLevelUpMessage } from "@/lib/mochi";
import { playLevelUpSound } from "@/lib/sounds";
import { getBuddyPresentation } from "@/lib/userPreferences";

type LevelSnapshot = {
  name: string;
  minXP: number;
  badge: string;
};

export type LevelUpCelebrationDetails = {
  previousLevel: LevelSnapshot;
  newLevel: LevelSnapshot;
  currentXP: number;
};

type LevelUpCelebrationProps = {
  celebration: LevelUpCelebrationDetails | null;
  onClose: () => void;
  soundEnabled?: boolean;
};

const SPARKLES = [
  { symbol: "✦", left: "9%", top: "15%", delay: 0 },
  { symbol: "✨", left: "82%", top: "12%", delay: 0.35 },
  { symbol: "🌸", left: "4%", top: "66%", delay: 0.65 },
  { symbol: "✧", left: "89%", top: "61%", delay: 0.2 },
  { symbol: "⭐", left: "20%", top: "85%", delay: 0.8 },
  { symbol: "✦", left: "76%", top: "87%", delay: 0.5 },
] as const;

export default function LevelUpCelebration({
  celebration,
  onClose,
  soundEnabled = true,
}: LevelUpCelebrationProps) {
  const preferences = useUserPreferences();
  const buddy = getBuddyPresentation(preferences);
  const reduceMotion = useReducedMotion();
  const continueButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!celebration) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    continueButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [celebration, onClose]);

  useEffect(() => {
    if (!celebration || !soundEnabled) return;
    playLevelUpSound();
  }, [celebration, soundEnabled]);

  return (
    <AnimatePresence>
      {celebration ? (
        <motion.div
          className="fixed inset-0 z-[1400] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.2 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose();
          }}
        >
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-labelledby="level-up-title"
            aria-describedby="level-up-description"
            className="relative max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto rounded-[2rem] border border-white/90 bg-white/85 p-5 shadow-[0_30px_100px_rgba(88,28,135,0.30)] backdrop-blur-2xl sm:p-8"
            initial={
              reduceMotion
                ? { opacity: 0 }
                : { opacity: 0, scale: 0.92, y: 24 }
            }
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={
              reduceMotion
                ? { opacity: 0 }
                : { opacity: 0, scale: 0.96, y: 12 }
            }
            transition={{ duration: reduceMotion ? 0 : 0.32, ease: "easeOut" }}
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 overflow-hidden rounded-[2rem]"
            >
              <div className="absolute -left-16 -top-20 size-52 rounded-full bg-pink-200/60 blur-3xl" />
              <div className="absolute -bottom-20 -right-12 size-56 rounded-full bg-purple-200/60 blur-3xl" />
              {SPARKLES.map((sparkle) => (
                <motion.span
                  key={`${sparkle.symbol}-${sparkle.left}`}
                  className="absolute text-lg text-purple-500/80"
                  style={{ left: sparkle.left, top: sparkle.top }}
                  animate={
                    reduceMotion
                      ? undefined
                      : { y: [0, -8, 0], opacity: [0.45, 1, 0.45] }
                  }
                  transition={{
                    duration: 2.8,
                    delay: sparkle.delay,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  {sparkle.symbol}
                </motion.span>
              ))}
            </div>

            <div className="relative text-center">
              <motion.div
                aria-hidden="true"
                className="mx-auto grid size-20 place-items-center rounded-[1.75rem] border border-white bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 text-5xl shadow-[0_16px_45px_rgba(168,85,247,0.24)]"
                animate={
                  reduceMotion
                    ? undefined
                    : {
                        scale: [1, 1.05, 1],
                        boxShadow: [
                          "0 16px 45px rgba(168,85,247,0.18)",
                          "0 18px 55px rgba(236,72,153,0.30)",
                          "0 16px 45px rgba(168,85,247,0.18)",
                        ],
                      }
                }
                transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
              >
                🎉
              </motion.div>

              <p className="mt-4 text-xs font-black uppercase tracking-[0.24em] text-purple-600">
                New milestone
              </p>
              <h2
                id="level-up-title"
                className="mt-1 text-3xl font-black text-slate-900 sm:text-4xl"
              >
                Level Up!
              </h2>
              <p id="level-up-description" className="mt-2 text-sm text-slate-600">
                Your steady learning has unlocked a beautiful new bloom.
              </p>

              <div className="mt-6 grid grid-cols-[1fr_auto_1fr] items-stretch gap-2 sm:gap-3">
                <div className="min-w-0 rounded-2xl border border-slate-200/80 bg-white/70 p-3">
                  <p className="text-[0.68rem] font-black uppercase tracking-wider text-slate-500">
                    Previous
                  </p>
                  <p className="mt-1 break-words text-sm font-bold text-slate-700">
                    {celebration.previousLevel.name}
                  </p>
                </div>
                <span
                  aria-hidden="true"
                  className="self-center text-xl font-black text-purple-500"
                >
                  →
                </span>
                <div className="min-w-0 rounded-2xl border border-purple-200 bg-gradient-to-br from-pink-50 to-purple-100 p-3 shadow-sm">
                  <p className="text-[0.68rem] font-black uppercase tracking-wider text-purple-600">
                    New level
                  </p>
                  <p className="mt-1 break-words text-sm font-black text-purple-900">
                    {celebration.newLevel.name}
                  </p>
                </div>
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-blue-100 bg-blue-50/80 p-3 text-left">
                  <p className="text-xs font-bold text-blue-700">Current XP</p>
                  <p className="mt-1 text-xl font-black text-slate-900">
                    {celebration.currentXP.toLocaleString()} XP
                  </p>
                </div>
                <div className="rounded-2xl border border-amber-100 bg-amber-50/80 p-3 text-left">
                  <p className="text-xs font-bold text-amber-700">Level badge</p>
                  <p className="mt-1 text-base font-black text-slate-900">
                    {celebration.newLevel.badge}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-3 rounded-2xl border border-purple-100 bg-purple-50/80 p-4 text-left">
                <MochiMascot
                  compact
                  buddy={preferences.studyBuddy}
                  buddyName={buddy.name}
                />
                <div className="min-w-0">
                  <p className="text-sm font-black text-purple-800">
                    {buddy.emoji} A note from {buddy.name}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-700">
                    {getMochiLevelUpMessage(
                      celebration.newLevel.name,
                      buddy.name,
                    )}
                  </p>
                </div>
              </div>

              <button
                ref={continueButtonRef}
                type="button"
                onClick={onClose}
                className="mt-5 w-full rounded-2xl bg-gradient-to-r from-purple-600 to-pink-500 px-5 py-3.5 text-sm font-black text-white shadow-[0_12px_30px_rgba(147,51,234,0.25)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(147,51,234,0.32)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-purple-300 active:translate-y-0 motion-reduce:transform-none"
              >
                Continue Learning
              </button>
            </div>
          </motion.section>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
