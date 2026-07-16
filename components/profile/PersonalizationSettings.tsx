"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  RotateCcw,
  Save,
  Sparkles,
} from "lucide-react";

import {
  applyUserTheme,
  careerGoals,
  dailyGoals,
  loadUserPreferences,
  resetOnboarding,
  saveUserPreferences,
  studyBuddies,
  studyStyles,
  themes,
  USER_PREFERENCES_EVENT,
  type CareerGoal,
  type DailyGoal,
  type StudyBuddy,
  type StudyStyle,
  type UserPreferences,
  type UserTheme,
} from "@/lib/userPreferences";

import {
  playClickSound,
  playSuccessSound,
} from "@/lib/sounds";
import { useMochiAssistant } from "@/hooks/useMochiAssistant";
import MoodSelector from "@/components/mochi/MoodSelector";

type SaveStatus = "idle" | "saved" | "error";

const buddyDetails: Record<
  string,
  {
    emoji: string;
    description: string;
    background: string;
  }
> = {
  Mochi: {
    emoji: "🐰",
    description: "Soft, cheerful, and motivating",
    background: "from-pink-100 to-purple-100",
  },
  Maple: {
    emoji: "🦊",
    description: "Calm, thoughtful, and encouraging",
    background: "from-orange-100 to-amber-100",
  },
  Luna: {
    emoji: "🐱",
    description: "Gentle, elegant, and focused",
    background: "from-purple-100 to-blue-100",
  },
  Boba: {
    emoji: "🐼",
    description: "Funny, playful, and energetic",
    background: "from-slate-100 to-purple-100",
  },
  Poppy: {
    emoji: "🦦",
    description: "Cute, curious, and adventurous",
    background: "from-blue-100 to-cyan-100",
  },
};

const careerGoalDetails: Record<
  string,
  {
    emoji: string;
    description: string;
  }
> = {
  "Data Analyst": {
    emoji: "📊",
    description: "Work with data, insights, and business decisions",
  },
  "Business Analyst": {
    emoji: "💼",
    description: "Connect business problems with practical solutions",
  },
  "Power BI Developer": {
    emoji: "📈",
    description: "Create dashboards, reports, and data models",
  },
  "Excel Expert": {
    emoji: "📗",
    description: "Master formulas, analysis, and spreadsheets",
  },
  "Data Scientist": {
    emoji: "🤖",
    description: "Explore Python, statistics, and machine learning",
  },
};

const studyStyleDetails: Record<
  string,
  {
    emoji: string;
    description: string;
  }
> = {
  Cozy: {
    emoji: "☕",
    description: "Gentle sessions with a warm and calm atmosphere",
  },
  Rain: {
    emoji: "🌧️",
    description: "Quiet focus with soft rainy-day energy",
  },
  "Night Owl": {
    emoji: "🌙",
    description: "Late-night learning with peaceful concentration",
  },
  Piano: {
    emoji: "🎹",
    description: "Instrumental focus with a calm rhythm",
  },
  Spotify: {
    emoji: "🎵",
    description: "Learn with your favourite playlists nearby",
  },
};

const themeDetails: Record<
  string,
  {
    emoji: string;
    swatch: string;
    description: string;
  }
> = {
  Sakura: {
    emoji: "🌸",
    swatch: "from-pink-200 via-rose-100 to-purple-200",
    description: "Soft pink blossoms and lavender accents",
  },
  Cloud: {
    emoji: "☁️",
    swatch: "from-blue-100 via-white to-purple-100",
    description: "Light, airy, and peaceful",
  },
  Night: {
    emoji: "🌙",
    swatch: "from-indigo-500 via-purple-500 to-slate-700",
    description: "Dreamy evening colours and deeper tones",
  },
  "Coffee House": {
    emoji: "☕",
    swatch: "from-amber-200 via-orange-100 to-stone-200",
    description: "Warm café colours for cozy study sessions",
  },
  Kawaii: {
    emoji: "🧸",
    swatch: "from-pink-200 via-yellow-100 to-blue-200",
    description: "Playful pastel colours and cute energy",
  },
};

export default function PersonalizationSettings() {
  const router = useRouter();
  const { assistant, selectMood } = useMochiAssistant();

  const [preferences, setPreferences] =
    useState<UserPreferences>(() =>
      loadUserPreferences()
    );

  const [status, setStatus] =
    useState<SaveStatus>("idle");

  useEffect(() => {
    const syncPreferences = () => {
      setPreferences(loadUserPreferences());
    };

    window.addEventListener(
      USER_PREFERENCES_EVENT,
      syncPreferences
    );

    window.addEventListener(
      "storage",
      syncPreferences
    );

    return () => {
      window.removeEventListener(
        USER_PREFERENCES_EVENT,
        syncPreferences
      );

      window.removeEventListener(
        "storage",
        syncPreferences
      );
    };
  }, []);

  function updatePreferences(
    updates: Partial<UserPreferences>
  ) {
    playClickSound();

    setPreferences((current) => ({
      ...current,
      ...updates,
    }));

    if (updates.theme) applyUserTheme(updates.theme);

    setStatus("idle");
  }

  function saveSettings(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    playClickSound();

    const saved = saveUserPreferences({
      ...preferences,
      userName: preferences.userName.trim(),
      hasCompletedOnboarding: true,
    });

    setStatus(saved ? "saved" : "error");

    if (saved) {
      playSuccessSound();
    }
  }

  function resetExperience() {
    const confirmed = window.confirm(
      "Reset your DataBloom personalization and show onboarding again? Your XP and learning progress will stay safe."
    );

    if (!confirmed) {
      return;
    }

    playClickSound();

    if (resetOnboarding()) {
      router.replace("/onboarding");
    } else {
      setStatus("error");
    }
  }

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/90 bg-gradient-to-br from-white/90 via-pink-50/70 to-purple-50/80 p-5 shadow-[0_18px_45px_rgba(126,34,206,0.1)] sm:p-7">
      <div
        aria-hidden="true"
        className="absolute -right-12 -top-14 size-44 rounded-full bg-pink-200/35 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="absolute -bottom-16 left-1/3 size-48 rounded-full bg-purple-200/30 blur-3xl"
      />

      <div className="relative">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-purple-600">
              <Sparkles
                size={16}
                aria-hidden="true"
              />
              Study preferences
            </p>

            <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900">
              Edit your cozy study space
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Choose the details that make DataBloom
              feel more personal, motivating, and
              comfortable for you.
            </p>
          </div>

          <div
            aria-live="polite"
            className={`rounded-full border px-4 py-2 text-xs font-bold ${
              status === "saved"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : status === "error"
                  ? "border-rose-200 bg-rose-50 text-rose-700"
                  : "border-purple-100 bg-white/80 text-slate-600"
            }`}
          >
            {status === "saved"
              ? "Changes saved 🌸"
              : status === "error"
                ? "Could not save changes"
                : "Saved on this device 🌱"}
          </div>
        </div>

        <form
          onSubmit={saveSettings}
          className="mt-8 space-y-8"
        >
          <SettingSection
            eyebrow="Your bloom card"
            title="What should we call you?"
            description="This name appears in greetings and across your profile."
          >
            <div className="relative max-w-xl">
              <span
                aria-hidden="true"
                className="absolute left-4 top-1/2 -translate-y-1/2 text-xl"
              >
                🌷
              </span>

              <input
                value={preferences.userName}
                onChange={(event) => {
                  setPreferences((current) => ({
                    ...current,
                    userName: event.target.value,
                  }));

                  setStatus("idle");
                }}
                maxLength={40}
                required
                placeholder="Write your name"
                className="min-h-14 w-full rounded-2xl border border-pink-200 bg-white/90 py-3 pl-12 pr-4 text-base font-bold text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-purple-400 focus:ring-4 focus:ring-purple-100"
              />
            </div>
          </SettingSection>

          <SettingSection
            eyebrow="Study companion"
            title="Choose your buddy"
            description="Your buddy will encourage you throughout your learning journey."
          >
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              {studyBuddies.map((buddy) => {
                const selected =
                  preferences.studyBuddy === buddy;

                const details =
                  buddyDetails[buddy] ?? {
                    emoji: "🐰",
                    description:
                      "Your supportive study companion",
                    background:
                      "from-pink-100 to-purple-100",
                  };

                return (
                  <SelectionCard
                    key={buddy}
                    selected={selected}
                    onClick={() =>
                      updatePreferences({
                        studyBuddy:
                          buddy as StudyBuddy,
                      })
                    }
                    ariaLabel={`Choose ${buddy} as your study buddy`}
                  >
                    <div
                      className={`mx-auto grid size-16 place-items-center rounded-2xl bg-gradient-to-br text-4xl shadow-sm ${details.background}`}
                    >
                      {details.emoji}
                    </div>

                    <p className="mt-3 text-center text-base font-black text-slate-900">
                      {buddy}
                    </p>

                    <p className="mt-1 text-center text-xs leading-5 text-slate-600">
                      {details.description}
                    </p>
                  </SelectionCard>
                );
              })}
            </div>

            <label className="mt-5 block max-w-xl">
              <span className="mb-2 block text-sm font-bold text-slate-700">
                Custom buddy name <span className="font-medium text-slate-500">(optional)</span>
              </span>
              <input
                value={preferences.customBuddyName}
                onChange={(event) => {
                  setPreferences((current) => ({
                    ...current,
                    customBuddyName: event.target.value,
                  }));
                  setStatus("idle");
                }}
                maxLength={30}
                placeholder={`Keep ${preferences.studyBuddy} or choose a nickname`}
                className="min-h-14 w-full rounded-2xl border border-purple-200 bg-white/90 px-4 text-base font-bold text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-purple-400 focus:ring-4 focus:ring-purple-100"
              />
            </label>
          </SettingSection>

          <SettingSection
            eyebrow="Dream destination"
            title="What are you working toward?"
            description="This helps DataBloom shape future recommendations around your goal."
          >
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {careerGoals.map((goal) => {
                const selected =
                  preferences.careerGoal === goal;

                const details =
                  careerGoalDetails[goal] ?? {
                    emoji: "🎯",
                    description:
                      "Build valuable data and business skills",
                  };

                return (
                  <SelectionCard
                    key={goal}
                    selected={selected}
                    onClick={() =>
                      updatePreferences({
                        careerGoal:
                          goal as CareerGoal,
                      })
                    }
                    ariaLabel={`Choose ${goal} as your career goal`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 text-2xl">
                        {details.emoji}
                      </div>

                      <div>
                        <p className="font-black text-slate-900">
                          {goal}
                        </p>

                        <p className="mt-1 text-sm leading-5 text-slate-600">
                          {details.description}
                        </p>
                      </div>
                    </div>
                  </SelectionCard>
                );
              })}
            </div>
          </SettingSection>

          <SettingSection
            eyebrow="Today’s check-in"
            title="How are you feeling?"
            description="Your saved mood appears on Home and adjusts the study suggestion from your buddy."
          >
            <MoodSelector mood={assistant.mood} onSelect={selectMood} />
          </SettingSection>

          <SettingSection
            eyebrow="Learning mood"
            title="How do you like to study?"
            description="Choose the atmosphere that makes learning feel easiest for you."
          >
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              {studyStyles.map((style) => {
                const selected =
                  preferences.studyStyle === style;

                const details =
                  studyStyleDetails[style] ?? {
                    emoji: "✨",
                    description:
                      "A study style that fits your routine",
                  };

                return (
                  <SelectionCard
                    key={style}
                    selected={selected}
                    onClick={() =>
                      updatePreferences({
                        studyStyle:
                          style as StudyStyle,
                      })
                    }
                    ariaLabel={`Choose ${style} study style`}
                  >
                    <p className="text-3xl">
                      {details.emoji}
                    </p>

                    <p className="mt-3 font-black text-slate-900">
                      {style}
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-600">
                      {details.description}
                    </p>
                  </SelectionCard>
                );
              })}
            </div>
          </SettingSection>

          <SettingSection
            eyebrow="Daily rhythm"
            title="Set your daily learning goal"
            description="Choose a target that feels realistic enough to maintain."
          >
            <div className="flex flex-wrap gap-3">
              {dailyGoals.map((goal) => {
                const selected =
                  preferences.dailyGoal === goal;

                return (
                  <button
                    key={goal}
                    type="button"
                    onClick={() =>
                      updatePreferences({
                        dailyGoal:
                          goal as DailyGoal,
                      })
                    }
                    className={`relative min-w-28 rounded-2xl border px-5 py-4 text-center transition hover:-translate-y-0.5 ${
                      selected
                        ? "border-purple-500 bg-gradient-to-br from-purple-600 to-pink-500 text-white shadow-[0_12px_25px_rgba(147,51,234,0.24)]"
                        : "border-purple-100 bg-white/85 text-slate-700 shadow-sm hover:border-purple-200 hover:bg-purple-50"
                    }`}
                    aria-pressed={selected}
                  >
                    {selected ? (
                      <span className="absolute right-2 top-2 grid size-5 place-items-center rounded-full bg-white text-purple-600">
                        <Check size={13} />
                      </span>
                    ) : null}

                    <span className="block text-xl font-black">
                      {goal}
                    </span>

                    <span
                      className={`mt-1 block text-xs font-bold ${
                        selected
                          ? "text-white/85"
                          : "text-slate-500"
                      }`}
                    >
                      minutes
                    </span>
                  </button>
                );
              })}
            </div>
          </SettingSection>

          <SettingSection
            eyebrow="Your visual world"
            title="Choose your favourite theme"
            description="Pick the colour mood you want DataBloom to grow into."
          >
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              {themes.map((theme) => {
                const selected =
                  preferences.theme === theme;

                const details =
                  themeDetails[theme] ?? {
                    emoji: "🌸",
                    swatch:
                      "from-pink-200 to-purple-200",
                    description:
                      "A soft pastel DataBloom theme",
                  };

                return (
                  <button
                    key={theme}
                    type="button"
                    onClick={() =>
                      updatePreferences({
                        theme:
                          theme as UserTheme,
                      })
                    }
                    aria-pressed={selected}
                    className={`relative overflow-hidden rounded-[1.6rem] border bg-white/85 p-3 text-left transition hover:-translate-y-1 hover:shadow-lg ${
                      selected
                        ? "border-purple-500 ring-4 ring-purple-100"
                        : "border-white shadow-sm"
                    }`}
                  >
                    {selected ? (
                      <span className="absolute right-3 top-3 z-10 grid size-7 place-items-center rounded-full bg-purple-600 text-white shadow-md">
                        <Check size={15} />
                      </span>
                    ) : null}

                    <div
                      className={`h-24 rounded-[1.2rem] bg-gradient-to-br ${details.swatch}`}
                    >
                      <div className="flex h-full items-center justify-center text-4xl">
                        {details.emoji}
                      </div>
                    </div>

                    <p className="mt-3 font-black text-slate-900">
                      {theme}
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-600">
                      {details.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </SettingSection>

          <div className="flex flex-col gap-4 rounded-[1.75rem] border border-white bg-white/70 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div>
              <p className="font-black text-slate-900">
                Ready to save your cozy space?
              </p>

              <p className="mt-1 text-sm text-slate-600">
                Your XP and learning progress remain safe.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={resetExperience}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-3 text-sm font-black text-rose-700 transition hover:-translate-y-0.5 hover:bg-rose-100"
              >
                <RotateCcw
                  size={18}
                  aria-hidden="true"
                />
                Start onboarding again
              </button>

              <button
                type="submit"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 via-fuchsia-500 to-pink-500 px-6 py-3 text-sm font-black text-white shadow-[0_12px_25px_rgba(192,38,211,0.24)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_30px_rgba(192,38,211,0.3)]"
              >
                <Save
                  size={18}
                  aria-hidden="true"
                />
                Save my cozy space
              </button>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}

function SettingSection({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[1.75rem] border border-white/90 bg-white/60 p-5 shadow-sm backdrop-blur-sm sm:p-6">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-pink-500">
          {eyebrow}
        </p>

        <h3 className="mt-1 text-xl font-black text-slate-900">
          {title}
        </h3>

        <p className="mt-1 text-sm leading-6 text-slate-600">
          {description}
        </p>
      </div>

      <div className="mt-5">{children}</div>
    </section>
  );
}

function SelectionCard({
  selected,
  onClick,
  ariaLabel,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  ariaLabel: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      aria-pressed={selected}
      className={`relative rounded-[1.5rem] border p-4 text-left transition hover:-translate-y-1 hover:shadow-lg ${
        selected
          ? "border-purple-500 bg-gradient-to-br from-purple-50 via-pink-50 to-white ring-4 ring-purple-100 shadow-md"
          : "border-white bg-white/80 shadow-sm hover:border-purple-200"
      }`}
    >
      {selected ? (
        <span className="absolute right-3 top-3 grid size-7 place-items-center rounded-full bg-purple-600 text-white shadow-md">
          <Check size={15} />
        </span>
      ) : null}

      {children}
    </button>
  );
}
