"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Sparkles } from "lucide-react";

import {
  careerGoals,
  buddyPresentation,
  dailyGoals,
  loadUserPreferences,
  persistUserTheme,
  saveUserPreferences,
  studyBuddies,
  studyStyles,
  themes,
  type UserTheme,
  type UserPreferences,
} from "@/lib/userPreferences";
import {
  applyMochiMood,
  loadMochiAssistantState,
  MOCHI_MOODS,
  type MochiMood,
} from "@/lib/mochi";
import {
  playClickSound,
  playSuccessSound,
} from "@/lib/sounds";

type OnboardingPreferences = Omit<
  UserPreferences,
  "hasCompletedOnboarding"
>;

const styleIcons: Record<OnboardingPreferences["studyStyle"], string> = {
  Cozy: "☕",
  Rain: "🌧",
  "Night Owl": "🌙",
  Piano: "🎹",
  Spotify: "🎵",
};

const themeIcons: Record<OnboardingPreferences["theme"], string> = {
  Sakura: "🌸",
  Cloud: "☁",
  Night: "🌙",
  "Coffee House": "☕",
  Kawaii: "🧸",
};

const petalPositions = [6, 14, 23, 34, 46, 58, 69, 78, 88, 95];

export default function OnboardingFlow() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [screen, setScreen] = useState(0);
  const [saveError, setSaveError] = useState(false);
  const [mood, setMood] = useState<MochiMood | null>(
    () => loadMochiAssistantState().mood,
  );
  const [preferences, setPreferences] = useState<OnboardingPreferences>(() => {
    const storedPreferences = loadUserPreferences();
    return {
      userName: storedPreferences.userName,
      studyBuddy: storedPreferences.studyBuddy,
      customBuddyName: storedPreferences.customBuddyName,
      careerGoal: storedPreferences.careerGoal,
      studyStyle: storedPreferences.studyStyle,
      dailyGoal: storedPreferences.dailyGoal,
      theme: storedPreferences.theme,
    };
  });

  function updatePreference<K extends keyof OnboardingPreferences>(
    key: K,
    value: OnboardingPreferences[K],
  ) {
    setPreferences((current) => ({ ...current, [key]: value }));
    if (key === "theme") persistUserTheme(value as UserTheme);
    playClickSound();
  }

  function nextScreen() {
    playClickSound();
    setScreen((current) => Math.min(6, current + 1));
  }

  function previousScreen() {
    playClickSound();
    setScreen((current) => Math.max(0, current - 1));
  }

  function finishOnboarding() {
    setSaveError(false);
    const saved = saveUserPreferences({
      ...preferences,
      hasCompletedOnboarding: true,
    });

    if (!saved) {
      setSaveError(true);
      return;
    }

    if (mood) {
      applyMochiMood(loadMochiAssistantState(), mood);
    }

    playSuccessSound();
    router.replace("/");
  }

  const canContinueName = preferences.userName.trim().length > 0;

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-pink-100 via-purple-100 to-sky-100 px-5 py-8 text-slate-950 sm:px-8">
      <motion.div
        aria-hidden="true"
        className="absolute -left-24 -top-24 size-96 rounded-full bg-pink-300/35 blur-3xl"
        animate={reduceMotion ? undefined : { scale: [1, 1.2, 1], x: [0, 55, 0], y: [0, 35, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden="true"
        className="absolute -bottom-28 -right-20 size-[28rem] rounded-full bg-sky-300/35 blur-3xl"
        animate={reduceMotion ? undefined : { scale: [1.1, 0.95, 1.1], x: [0, -45, 0], y: [0, -30, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      {!reduceMotion &&
        petalPositions.map((left, index) => (
          <motion.span
            key={left}
            aria-hidden="true"
            className="pointer-events-none absolute top-[-4rem] text-2xl opacity-70"
            style={{ left: `${left}%` }}
            animate={{
              y: [0, 980],
              x: [0, index % 2 === 0 ? 55 : -45, 10],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 11 + (index % 4) * 2,
              delay: index * 0.7,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            {index % 3 === 0 ? "🌸" : "🌷"}
          </motion.span>
        ))}

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl flex-col">
        <div className="flex items-center justify-between gap-4">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/65 px-4 py-2 text-sm font-bold text-purple-800 shadow-sm backdrop-blur-xl">
            <Sparkles size={16} aria-hidden="true" /> DataBloom OS
          </p>
          <p className="rounded-full bg-white/65 px-4 py-2 text-sm font-semibold text-slate-700 backdrop-blur-xl">
            {screen + 1} / 7
          </p>
        </div>

        <div className="mt-5 flex gap-2" aria-label={`Onboarding step ${screen + 1} of 7`}>
          {Array.from({ length: 7 }, (_, index) => (
            <div
              key={index}
              className={`h-2 flex-1 rounded-full transition-colors ${
                index <= screen
                  ? "bg-gradient-to-r from-purple-500 to-pink-500"
                  : "bg-white/70"
              }`}
            />
          ))}
        </div>

        <section className="my-auto py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={screen}
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -18, scale: 0.98 }}
              transition={{ duration: reduceMotion ? 0 : 0.3 }}
              className="mx-auto max-w-4xl rounded-[2rem] border border-white/80 bg-white/65 p-6 shadow-[0_28px_90px_rgba(88,28,135,0.14)] backdrop-blur-2xl sm:p-10"
            >
              {screen === 0 && (
                <div className="py-8 text-center sm:py-14">
                  <motion.div
                    className="text-7xl"
                    animate={reduceMotion ? undefined : { rotate: [-4, 5, -4], scale: [1, 1.08, 1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    aria-hidden="true"
                  >
                    🌸
                  </motion.div>
                  <h1 className="mt-6 text-4xl font-black tracking-tight text-purple-800 sm:text-6xl">
                    🌸 Welcome to DataBloom OS
                  </h1>
                  <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-700 sm:text-xl">
                    Your cozy study companion for becoming a Data Analyst.
                  </p>
                  <button
                    type="button"
                    onClick={nextScreen}
                    className="databloom-brand-cta mt-9 inline-flex min-h-14 items-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 px-7 py-4 text-lg font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-purple-700"
                  >
                    Begin Your Journey <ArrowRight size={20} aria-hidden="true" />
                  </button>
                </div>
              )}

              {screen === 1 && (
                <StepLayout
                  icon="🐰"
                  title="What should your study buddy call you?"
                  subtitle="Choose the name that will make DataBloom feel like your own cozy corner."
                >
                  <label className="mx-auto mt-7 block max-w-xl">
                    <span className="sr-only">Your name</span>
                    <input
                      autoFocus
                      value={preferences.userName}
                      onChange={(event) =>
                        setPreferences((current) => ({
                          ...current,
                          userName: event.target.value,
                        }))
                      }
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && canContinueName) nextScreen();
                      }}
                      maxLength={40}
                      placeholder="Enter your name"
                      className="min-h-16 w-full rounded-2xl border-2 border-purple-200 bg-white/90 px-5 text-center text-xl font-bold text-slate-950 outline-none placeholder:text-slate-400 focus:border-purple-600 focus:ring-4 focus:ring-purple-100"
                    />
                  </label>
                </StepLayout>
              )}

              {screen === 2 && (
                <StepLayout icon="💞" title="Choose your study buddy" subtitle="Pick the little companion who will cheer for every lesson and streak.">
                  <OptionGrid>
                    {studyBuddies.map((buddy) => (
                      <OptionButton key={buddy} icon={buddyPresentation[buddy].emoji} label={buddy} selected={preferences.studyBuddy === buddy} onClick={() => updatePreference("studyBuddy", buddy)} />
                    ))}
                  </OptionGrid>
                  <label className="mx-auto mt-5 block max-w-xl">
                    <span className="mb-2 block text-sm font-bold text-slate-700">
                      Custom buddy name <span className="font-medium text-slate-500">(optional)</span>
                    </span>
                    <input
                      value={preferences.customBuddyName}
                      onChange={(event) =>
                        setPreferences((current) => ({
                          ...current,
                          customBuddyName: event.target.value,
                        }))
                      }
                      maxLength={30}
                      placeholder={`Keep ${preferences.studyBuddy} or choose a nickname`}
                      className="min-h-12 w-full rounded-2xl border-2 border-purple-200 bg-white/90 px-4 text-slate-950 outline-none placeholder:text-slate-400 focus:border-purple-600 focus:ring-4 focus:ring-purple-100"
                    />
                  </label>
                </StepLayout>
              )}

              {screen === 3 && (
                <StepLayout icon="🎯" title="What are you growing toward?" subtitle="Your career goal helps DataBloom keep your journey meaningful.">
                  <OptionGrid>
                    {careerGoals.map((goal) => (
                      <OptionButton key={goal} icon="🌱" label={goal} selected={preferences.careerGoal === goal} onClick={() => updatePreference("careerGoal", goal)} />
                    ))}
                  </OptionGrid>
                </StepLayout>
              )}

              {screen === 4 && (
                <StepLayout icon="✨" title="Choose your study style" subtitle="What kind of atmosphere helps you settle in and focus?">
                  <OptionGrid>
                    {studyStyles.map((style) => (
                      <OptionButton key={style} icon={styleIcons[style]} label={style} selected={preferences.studyStyle === style} onClick={() => updatePreference("studyStyle", style)} />
                    ))}
                  </OptionGrid>
                </StepLayout>
              )}

              {screen === 5 && (
                <StepLayout icon="⏰" title="Set a daily goal" subtitle="How many focused minutes would feel encouraging and realistic?">
                  <OptionGrid>
                    {dailyGoals.map((goal) => (
                      <OptionButton key={goal} icon="🌸" label={`${goal} minutes`} selected={preferences.dailyGoal === goal} onClick={() => updatePreference("dailyGoal", goal)} />
                    ))}
                  </OptionGrid>
                </StepLayout>
              )}

              {screen === 6 && (
                <StepLayout icon="🎨" title="Choose your theme" subtitle="Pick the mood you want DataBloom to remember for you.">
                  <div className="mx-auto mt-7 max-w-3xl rounded-2xl border border-white/90 bg-white/70 p-4">
                    <p className="text-center text-sm font-bold text-slate-700">How are you feeling today?</p>
                    <div className="mt-3 flex flex-wrap justify-center gap-2" aria-label="Choose your mood">
                      {MOCHI_MOODS.map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          aria-pressed={mood === option.id}
                          onClick={() => {
                            setMood(option.id);
                            playClickSound();
                          }}
                          className={`rounded-full border px-4 py-2 text-sm font-bold transition ${
                            mood === option.id
                              ? "border-purple-500 bg-purple-600 text-white"
                              : "border-purple-100 bg-white text-slate-700 hover:bg-purple-50"
                          }`}
                        >
                          {option.emoji} {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <OptionGrid>
                    {themes.map((theme) => (
                      <OptionButton key={theme} icon={themeIcons[theme]} label={theme} selected={preferences.theme === theme} onClick={() => updatePreference("theme", theme)} />
                    ))}
                  </OptionGrid>
                  {saveError && (
                    <p role="alert" className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-center font-semibold text-rose-800">
                      DataBloom could not save your choices. Check browser storage permissions and try again.
                    </p>
                  )}
                </StepLayout>
              )}

              {screen > 0 && (
                <div className="mt-8 flex items-center justify-between gap-4 border-t border-white/80 pt-6">
                  <button type="button" onClick={previousScreen} className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-purple-200 bg-white/80 px-5 py-3 font-bold text-purple-800 transition hover:bg-purple-50">
                    <ArrowLeft size={18} aria-hidden="true" /> Back
                  </button>
                  {screen < 6 ? (
                    <button type="button" onClick={nextScreen} disabled={screen === 1 && !canContinueName} className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-purple-700 px-6 py-3 font-bold text-white transition hover:bg-purple-800 disabled:cursor-not-allowed disabled:bg-purple-200 disabled:text-purple-500">
                      Continue <ArrowRight size={18} aria-hidden="true" />
                    </button>
                  ) : (
                    <button type="button" onClick={finishOnboarding} className="databloom-brand-cta inline-flex min-h-12 items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 font-bold text-white shadow-md transition hover:shadow-lg">
                      Enter DataBloom OS <Check size={18} aria-hidden="true" />
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </section>
      </div>
    </main>
  );
}

function StepLayout({ icon, title, subtitle, children }: { icon: string; title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-center">
        <span className="text-5xl" aria-hidden="true">{icon}</span>
        <h1 className="mt-4 text-3xl font-black text-purple-800 sm:text-4xl">{title}</h1>
        <p className="mx-auto mt-3 max-w-2xl leading-7 text-slate-700">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

function OptionGrid({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto mt-7 grid max-w-3xl gap-3 sm:grid-cols-2 lg:grid-cols-3">{children}</div>;
}

function OptionButton({ icon, label, selected, onClick }: { icon: string; label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`relative flex min-h-28 flex-col items-center justify-center rounded-2xl border-2 p-4 font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-700 ${
        selected
          ? "border-purple-500 bg-gradient-to-br from-purple-100 to-pink-100 text-purple-950 shadow-md"
          : "border-white/90 bg-white/75 text-slate-800 shadow-sm hover:border-purple-200 hover:bg-white"
      }`}
    >
      {selected && <span className="absolute right-3 top-3 grid size-6 place-items-center rounded-full bg-purple-700 text-white"><Check size={14} aria-hidden="true" /></span>}
      <span className="text-3xl" aria-hidden="true">{icon}</span>
      <span className="mt-2">{label}</span>
    </button>
  );
}
