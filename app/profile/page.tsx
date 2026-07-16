"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import PersonalizationSettings from "@/components/profile/PersonalizationSettings";
import AppLayout from "@/components/layout/AppLayout";
import { useProgress } from "@/context/ProgressContext";
import { getFavorites } from "@/lib/favorites";
import { formulas, type Formula } from "@/lib/formulas";
import { getLearnedFormulas } from "@/lib/learnedFormulas";
import {
  getMochiLevelName,
  loadMochiData,
  type MochiData,
} from "@/lib/mochi";
import {
  loadTodayStats,
  type DailyStats,
} from "@/lib/stats";
import {
  getPracticeSummary,
  loadPracticeLabState,
  PRACTICE_LAB_EVENT,
} from "@/lib/practiceLab";
import {
  getInterviewSummary,
  INTERVIEW_HUB_EVENT,
  loadInterviewHubState,
} from "@/lib/interviewHub";
import {
  CAREER_HUB_EVENT,
  getCareerSummary,
  loadCareerHubState,
} from "@/lib/careerHub";
import {
  loadStreak,
  type StreakData,
} from "@/lib/streak";
import { loadUnlockedAchievements } from "@/lib/unlockedAchievements";
import { playClickSound } from "@/lib/sounds";
import {
  getSmartNotesSummary,
  loadSmartNotesState,
  SMART_NOTES_EVENT,
} from "@/lib/smartNotes";
import {
  FLASHCARDS_EVENT,
  getFlashcardsSummary,
  loadFlashcardsState,
} from "@/lib/flashcards";
import { getCertificationSummary } from "@/lib/certificationHub";
import { loadAnalyticsSnapshot, type StudioProgress } from "@/lib/analytics";
import { ANALYTICS_UPDATED_EVENT } from "@/lib/analyticsHistory";
import {
  getPlannerSummary,
  loadPlannerState,
  PLANNER_EVENT,
  type PlannerSummary,
} from "@/lib/planner";

export default function ProfilePage() {
  const { xp, currentLevelName } = useProgress();

  const [streak, setStreak] =
    useState<StreakData | null>(null);

  const [mochi, setMochi] =
    useState<MochiData | null>(null);

  const [stats, setStats] =
    useState<DailyStats | null>(null);

  const [badges, setBadges] =
    useState<string[]>([]);

  const [completedFormulas, setCompletedFormulas] =
    useState(0);

  const [favoriteFormulas, setFavoriteFormulas] =
    useState<Formula[]>([]);

  const [practiceSummary, setPracticeSummary] = useState(() =>
    getPracticeSummary(loadPracticeLabState()),
  );
  const [interviewSummary, setInterviewSummary] = useState(() =>
    getInterviewSummary(loadInterviewHubState()),
  );
  const [careerSummary, setCareerSummary] = useState(() =>
    getCareerSummary(loadCareerHubState()),
  );
  const [notesSummary, setNotesSummary] = useState(() =>
    getSmartNotesSummary(loadSmartNotesState()),
  );
  const [flashcardsSummary, setFlashcardsSummary] = useState(() =>
    getFlashcardsSummary(loadFlashcardsState()),
  );
  const [certificationSummary, setCertificationSummary] = useState(() =>
    getCertificationSummary(loadCareerHubState()),
  );
  const [studioProgress, setStudioProgress] = useState<StudioProgress[]>([]);
  const [plannerSummary, setPlannerSummary] = useState<PlannerSummary>(() =>
    getPlannerSummary(loadPlannerState()),
  );

  useEffect(() => {
    function loadProfileData() {
      setStreak(loadStreak());
      setMochi(loadMochiData());
      setStats(loadTodayStats());
      setBadges(loadUnlockedAchievements());
      setPracticeSummary(getPracticeSummary(loadPracticeLabState()));
      setInterviewSummary(getInterviewSummary(loadInterviewHubState()));
      setCareerSummary(getCareerSummary(loadCareerHubState()));
      setNotesSummary(getSmartNotesSummary(loadSmartNotesState()));
      setFlashcardsSummary(getFlashcardsSummary(loadFlashcardsState()));
      setCertificationSummary(getCertificationSummary(loadCareerHubState()));
      setStudioProgress(loadAnalyticsSnapshot().studioProgress);
      setPlannerSummary(getPlannerSummary(loadPlannerState()));

      const favoriteIds = getFavorites();

      setFavoriteFormulas(
        formulas.filter((formula) =>
          favoriteIds.includes(formula.id)
        )
      );

      setCompletedFormulas(
        getLearnedFormulas().length
      );
    }

    loadProfileData();

    window.addEventListener(
      "favoritesUpdated",
      loadProfileData
    );

    window.addEventListener(
      "storage",
      loadProfileData
    );
    window.addEventListener(
      PRACTICE_LAB_EVENT,
      loadProfileData
    );
    window.addEventListener(
      INTERVIEW_HUB_EVENT,
      loadProfileData
    );
    window.addEventListener(
      CAREER_HUB_EVENT,
      loadProfileData
    );
    window.addEventListener(
      SMART_NOTES_EVENT,
      loadProfileData
    );
    window.addEventListener(
      FLASHCARDS_EVENT,
      loadProfileData
    );
    window.addEventListener(ANALYTICS_UPDATED_EVENT, loadProfileData);
    window.addEventListener(PLANNER_EVENT, loadProfileData);

    return () => {
      window.removeEventListener(
        "favoritesUpdated",
        loadProfileData
      );

      window.removeEventListener(
        "storage",
        loadProfileData
      );
      window.removeEventListener(
        PRACTICE_LAB_EVENT,
        loadProfileData
      );
      window.removeEventListener(
        INTERVIEW_HUB_EVENT,
        loadProfileData
      );
      window.removeEventListener(
        CAREER_HUB_EVENT,
        loadProfileData
      );
      window.removeEventListener(
        SMART_NOTES_EVENT,
        loadProfileData
      );
      window.removeEventListener(
        FLASHCARDS_EVENT,
        loadProfileData
      );
      window.removeEventListener(ANALYTICS_UPDATED_EVENT, loadProfileData);
      window.removeEventListener(PLANNER_EVENT, loadProfileData);
    };
  }, []);

  const formulaProgress = useMemo(() => {
    if (formulas.length === 0) {
      return 0;
    }

    return Math.min(
      100,
      Math.round(
        (completedFormulas / formulas.length) *
          100
      )
    );
  }, [completedFormulas]);

  const mochiFriendship = mochi
    ? getMochiLevelName(mochi.level)
    : "Loading...";

  const currentStreak =
    streak?.current ?? 0;

  return (
    <AppLayout>
    <div className="relative min-h-screen overflow-hidden rounded-[2rem] bg-gradient-to-br from-rose-50 via-purple-50 to-sky-50 px-4 py-8 sm:px-6 lg:px-10">
      <BackgroundDecorations />

      <div className="relative z-10 mx-auto max-w-6xl space-y-7">
        <section className="relative overflow-hidden rounded-[2.25rem] border border-white/90 bg-white/70 p-6 shadow-[0_24px_70px_rgba(126,34,206,0.14)] backdrop-blur-xl sm:p-9">
          <div
            aria-hidden="true"
            className="absolute -right-10 -top-12 size-48 rounded-full bg-pink-200/40 blur-3xl"
          />

          <div
            aria-hidden="true"
            className="absolute -bottom-20 left-1/3 size-52 rounded-full bg-purple-200/35 blur-3xl"
          />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-5">
              <div className="relative grid size-24 shrink-0 place-items-center rounded-[2rem] border-4 border-white bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200 text-5xl shadow-[0_16px_35px_rgba(147,51,234,0.20)]">
                🐰

                <span
                  aria-hidden="true"
                  className="absolute -right-2 -top-3 text-2xl"
                >
                  ✨
                </span>

                <span
                  aria-hidden="true"
                  className="absolute -bottom-2 -left-3 text-xl"
                >
                  🌸
                </span>
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-purple-500">
                  My bloom profile
                </p>

                <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
                  Your cozy learning space
                </h1>

                <p className="mt-3 max-w-xl text-base leading-7 text-slate-600">
                  Personalize your journey, celebrate
                  your progress, and keep growing one
                  little bloom at a time.
                </p>
              </div>
            </div>

            <div className="rotate-1 rounded-3xl border border-purple-100 bg-white/80 px-5 py-4 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                Current bloom
              </p>

              <p className="mt-2 text-lg font-black text-purple-700">
                {currentLevelName}
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-600">
                {xp.toLocaleString()} XP collected ✨
              </p>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden rounded-[2.25rem] border border-purple-100/80 bg-white/65 p-4 shadow-[0_22px_65px_rgba(126,34,206,0.10)] backdrop-blur-xl sm:p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 px-2 pt-2">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-purple-500">
                Personalization
              </p>

              <h2 className="mt-1 text-2xl font-black text-slate-900">
                Make DataBloom feel like home
              </h2>

              <p className="mt-1 text-sm text-slate-600">
                Update the choices you made during
                your first welcome.
              </p>
            </div>

            <span className="rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-700">
              Saved on this device 🌱
            </span>
          </div>

          <div className="rounded-[1.75rem] border border-white bg-gradient-to-br from-white/95 via-pink-50/70 to-purple-50/75 p-2 shadow-inner sm:p-4">
            <PersonalizationSettings />
          </div>
        </section>

        <section>
          <SectionHeading
            eyebrow="Your progress garden"
            title="Everything you’ve grown"
            description="A quick look at your learning journey so far."
          />

          <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            <ProfileCard
              emoji="🌱"
              label="Current level"
              value={currentLevelName}
              background="from-emerald-50 to-lime-50"
            />

            <ProfileCard
              emoji="✨"
              label="Total experience"
              value={`${xp.toLocaleString()} XP`}
              background="from-amber-50 to-yellow-50"
            />

            <ProfileCard
              emoji="🔥"
              label="Study streak"
              value={`${currentStreak} ${
                currentStreak === 1
                  ? "Day"
                  : "Days"
              }`}
              background="from-orange-50 to-rose-50"
            />

            <ProfileCard
              emoji="🐰"
              label="Mochi friendship"
              value={mochiFriendship}
              background="from-pink-50 to-purple-50"
            />

            <ProfileCard
              emoji="🏆"
              label="Achievements"
              value={`${badges.length} Unlocked`}
              background="from-purple-50 to-blue-50"
            />

          </div>
        </section>

        <section>
          <SectionHeading
            eyebrow="Learning systems"
            title="Progress across DataBloom"
            description="Every card reads the existing source of truth and opens the module it represents."
          />
          <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {studioProgress.map((studio) => (
              <ProgressLink key={studio.id} href={studio.href} emoji={studio.icon} label={studio.name} value={`${studio.completed} of ${studio.total} · ${studio.percentage}%`} background="from-purple-50 to-sky-50" />
            ))}
            <ProgressLink href="/practice-lab" emoji="🧪" label="Practice Lab" value={`${practiceSummary.averageAccuracy}% accuracy · ${practiceSummary.sessions} sessions`} background="from-fuchsia-50 to-sky-50" />
            <ProgressLink href="/interview-hub" emoji="🎤" label="Interview Hub" value={`${interviewSummary.learned} learned · ${interviewSummary.sessions} mocks`} background="from-violet-50 to-pink-50" />
            <ProgressLink href="/career-hub" emoji="🌱" label="Career Hub" value={`${careerSummary.readiness}% ready · ${careerSummary.applications} applications`} background="from-emerald-50 to-sky-50" />
            <ProgressLink href="/smart-notes" emoji="📝" label="Smart Notes" value={`${notesSummary.notesCreated} notes · ${notesSummary.collections} collections`} background="from-violet-50 to-sky-50" />
            <ProgressLink href="/flashcards" emoji="🧠" label="Flashcards" value={`${flashcardsSummary.uniqueCardsStudied} studied · ${flashcardsSummary.dueToday} due`} background="from-pink-50 to-purple-50" />
            <ProgressLink href="/certification-hub" emoji="🏅" label="Certification Hub" value={`${certificationSummary.readinessProgress}% ready · ${certificationSummary.tracked} tracked`} background="from-amber-50 to-purple-50" />
            <ProgressLink href="/planner" emoji="🗓️" label="Planner" value={`${plannerSummary.completed} of ${plannerSummary.total} complete · ${plannerSummary.progressPercentage}%`} background="from-blue-50 to-purple-50" />
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/90 bg-white/70 p-6 shadow-[0_20px_55px_rgba(76,29,149,0.10)] backdrop-blur-xl sm:p-7">
            <div
              aria-hidden="true"
              className="absolute -right-8 -top-8 size-32 rounded-full bg-blue-100/70 blur-3xl"
            />

            <div className="relative">
              <SectionHeading
                eyebrow="Today’s little wins"
                title="Today’s learning"
                description="Small steps still count as real progress."
              />

              <div className="mt-6 grid grid-cols-3 gap-3 sm:gap-4">
                <StatBox
                  emoji="📚"
                  title="Lessons"
                  value={stats?.lessons ?? 0}
                  color="bg-pink-50 text-pink-700"
                />

                <StatBox
                  emoji="⏳"
                  title="Minutes"
                  value={stats?.minutes ?? 0}
                  color="bg-purple-50 text-purple-700"
                />

                <StatBox
                  emoji="🎯"
                  title="Goals"
                  value={
                    stats?.goalsCompleted ?? 0
                  }
                  color="bg-blue-50 text-blue-700"
                />
              </div>

              <div className="mt-6 rotate-[-0.5deg] rounded-2xl border border-purple-100 bg-gradient-to-r from-purple-50 via-pink-50 to-yellow-50 p-4">
                <p className="text-sm font-bold text-slate-700">
                  🌸 Every lesson, minute, and goal
                  adds something new to your garden.
                </p>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[2rem] border border-white/90 bg-gradient-to-br from-purple-100/80 via-pink-50 to-blue-100/75 p-6 shadow-[0_20px_55px_rgba(76,29,149,0.10)] sm:p-7">
            <span
              aria-hidden="true"
              className="absolute right-5 top-4 text-4xl"
            >
              🐇
            </span>

            <p className="text-xs font-black uppercase tracking-[0.2em] text-purple-500">
              Mochi note
            </p>

            <h2 className="mt-2 max-w-sm text-2xl font-black text-slate-900">
              Your learning garden is looking lovely
            </h2>

            <p className="mt-4 max-w-md leading-7 text-slate-600">
              You are currently a{" "}
              <span className="font-black text-purple-700">
                {currentLevelName}
              </span>
              . Keep completing lessons and challenges
              to unlock your next bloom.
            </p>

            <Link
              href="/mochi"
              className="mt-6 inline-flex rounded-2xl bg-purple-600 px-5 py-3 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-purple-700"
            >
              Visit Mochi AI →
            </Link>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[2rem] border border-white/90 bg-white/70 p-6 shadow-[0_20px_55px_rgba(76,29,149,0.10)] backdrop-blur-xl sm:p-7">
            <SectionHeading
              eyebrow="Saved for later"
              title="❤️ Favorite formulas"
              description="Your personal collection of useful Excel formulas."
            />

            {favoriteFormulas.length === 0 ? (
              <div className="mt-6 rounded-3xl border border-dashed border-purple-200 bg-purple-50/60 px-6 py-9 text-center">
                <p className="text-4xl">📖</p>

                <p className="mt-3 font-black text-slate-800">
                  Your formula shelf is empty
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Save formulas from Formula Studio
                  and they will appear here.
                </p>

                <Link
                  href="/formula-studio"
                  className="mt-5 inline-flex rounded-xl bg-white px-4 py-2 text-sm font-bold text-purple-700 shadow-sm transition hover:bg-purple-100"
                >
                  Explore formulas
                </Link>
              </div>
            ) : (
              <div className="mt-6 grid gap-3">
                {favoriteFormulas
                  .slice(0, 6)
                  .map((formula, index) => (
                    <Link
                      key={formula.id}
                      href={`/formula-studio/${formula.id}`}
                      className={`group flex items-center justify-between gap-4 rounded-2xl border border-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                        index % 3 === 0
                          ? "bg-pink-50"
                          : index % 3 === 1
                            ? "bg-purple-50"
                            : "bg-blue-50"
                      }`}
                    >
                      <div className="min-w-0">
                        <h3 className="truncate font-black text-purple-800">
                          {formula.name}
                        </h3>

                        <p className="mt-1 text-sm text-slate-600">
                          {formula.category}
                        </p>
                      </div>

                      <span className="shrink-0 text-lg transition group-hover:translate-x-1">
                        →
                      </span>
                    </Link>
                  ))}

                {favoriteFormulas.length > 6 ? (
                  <Link
                    href="/formula-studio"
                    className="mt-1 text-center text-sm font-bold text-purple-700 hover:text-purple-900"
                  >
                    View all saved formulas →
                  </Link>
                ) : null}
              </div>
            )}
          </div>

          <div className="rounded-[2rem] border border-white/90 bg-white/70 p-6 shadow-[0_20px_55px_rgba(76,29,149,0.10)] backdrop-blur-xl sm:p-7">
            <SectionHeading
              eyebrow="Formula garden"
              title="📚 Formula progress"
              description="See how much of your Excel formula library you’ve explored."
            />

            <div className="mt-7 rounded-3xl bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-5">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-600">
                    Completed formulas
                  </p>

                  <p className="mt-2 text-4xl font-black text-purple-700">
                    {completedFormulas}
                    <span className="text-lg text-slate-400">
                      /{formulas.length}
                    </span>
                  </p>
                </div>

                <div className="rounded-2xl bg-white px-4 py-3 text-center shadow-sm">
                  <p className="text-2xl font-black text-purple-700">
                    {formulaProgress}%
                  </p>

                  <p className="text-xs font-bold text-slate-500">
                    Complete
                  </p>
                </div>
              </div>

              <div className="mt-6 h-4 overflow-hidden rounded-full border border-white bg-white/80 shadow-inner">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500 transition-all duration-700"
                  style={{
                    width: `${formulaProgress}%`,
                  }}
                />
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-600">
                  {formulaProgress === 100
                    ? "Your formula garden is fully blooming! 🌸"
                    : "Keep learning to grow your formula garden 🌱"}
                </p>

                <Link
                  href="/formula-studio"
                  className="rounded-xl bg-purple-600 px-4 py-2 text-sm font-black text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-purple-700"
                >
                  Continue learning
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
    </AppLayout>
  );
}

function BackgroundDecorations() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <span className="absolute left-[4%] top-20 text-3xl opacity-60">
        🌸
      </span>

      <span className="absolute right-[7%] top-32 text-2xl opacity-50">
        ✨
      </span>

      <span className="absolute left-[8%] top-[48%] text-2xl opacity-40">
        🌷
      </span>

      <span className="absolute right-[5%] top-[60%] text-3xl opacity-40">
        ☁️
      </span>

      <span className="absolute bottom-24 left-[12%] text-3xl opacity-40">
        🦋
      </span>

      <span className="absolute bottom-16 right-[10%] text-2xl opacity-50">
        🌱
      </span>

      <div className="absolute -left-32 top-1/3 size-80 rounded-full bg-pink-200/20 blur-3xl" />

      <div className="absolute -right-32 top-1/4 size-96 rounded-full bg-purple-200/20 blur-3xl" />
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.2em] text-purple-500">
        {eyebrow}
      </p>

      <h2 className="mt-1 text-2xl font-black text-slate-900">
        {title}
      </h2>

      <p className="mt-1 text-sm leading-6 text-slate-600">
        {description}
      </p>
    </div>
  );
}

function ProfileCard({
  emoji,
  label,
  value,
  background,
}: {
  emoji: string;
  label: string;
  value: string;
  background: string;
}) {
  return (
    <article
      className={`
        relative
        overflow-hidden
        rounded-[1.75rem]
        border
        border-white/90
        bg-gradient-to-br
        ${background}
        p-5
        shadow-[0_14px_35px_rgba(76,29,149,0.09)]
        transition
        hover:-translate-y-1
        hover:shadow-[0_20px_45px_rgba(76,29,149,0.14)]
      `}
    >
      <span
        aria-hidden="true"
        className="absolute -right-2 -top-3 text-5xl opacity-15"
      >
        {emoji}
      </span>

      <div className="relative">
        <span className="text-2xl">{emoji}</span>

        <p className="mt-4 text-xs font-black uppercase tracking-[0.13em] text-slate-500">
          {label}
        </p>

        <h3 className="mt-2 break-words text-lg font-black text-purple-800">
          {value}
        </h3>
      </div>
    </article>
  );
}

function ProgressLink({ href, emoji, label, value, background }: { href: string; emoji: string; label: string; value: string; background: string }) {
  return (
    <Link href={href} onClick={playClickSound} className="block rounded-[1.75rem] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-700">
      <ProfileCard emoji={emoji} label={label} value={value} background={background} />
    </Link>
  );
}

function StatBox({
  emoji,
  title,
  value,
  color,
}: {
  emoji: string;
  title: string;
  value: number;
  color: string;
}) {
  return (
    <div
      className={`
        rounded-[1.5rem]
        border
        border-white
        p-4
        text-center
        shadow-sm
        ${color}
      `}
    >
      <p className="text-xl" aria-hidden="true">
        {emoji}
      </p>

      <p className="mt-2 text-3xl font-black">
        {value}
      </p>

      <p className="mt-1 text-xs font-bold uppercase tracking-wide opacity-75">
        {title}
      </p>
    </div>
  );
}
