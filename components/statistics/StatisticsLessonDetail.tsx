"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Heart,
  Lightbulb,
  MessageSquareText,
  NotebookPen,
  Sigma,
  TriangleAlert,
} from "lucide-react";

import CompletionModal from "@/components/dashboard/CompletionModal";
import AppLayout from "@/components/layout/AppLayout";
import CopyCodeButton from "@/components/python/CopyCodeButton";
import { useProgress } from "@/context/ProgressContext";
import { getStatisticsLesson, type StatisticsLesson } from "@/lib/statisticsLessons";
import {
  completeStatisticsLesson,
  getStatisticsNote,
  loadStatisticsProgress,
  saveStatisticsNote,
  STATISTICS_PROGRESS_EVENT,
  toggleStatisticsFavorite,
} from "@/lib/statisticsProgress";
import {
  playClickSound,
  playNotificationSound,
  playXPSound,
} from "@/lib/sounds";
import { incrementStats } from "@/lib/stats";
import { registerStudyDay } from "@/lib/streak";
import { unlockAchievement } from "@/lib/unlockedAchievements";

type NotesStatus = "saved" | "saving" | "error";

export default function StatisticsLessonDetail({
  lesson,
}: {
  lesson: StatisticsLesson;
}) {
  const router = useRouter();
  const { addXP } = useProgress();
  const initialProgress = loadStatisticsProgress();
  const [completed, setCompleted] = useState(() =>
    initialProgress.completedLessonIds.includes(lesson.id),
  );
  const [favorite, setFavorite] = useState(() =>
    initialProgress.favoriteLessonIds.includes(lesson.id),
  );
  const [notes, setNotes] = useState(() => getStatisticsNote(lesson.id));
  const [notesStatus, setNotesStatus] = useState<NotesStatus>("saved");
  const [showCompletion, setShowCompletion] = useState(false);

  useEffect(() => {
    const syncProgress = () => {
      const state = loadStatisticsProgress();
      setCompleted(state.completedLessonIds.includes(lesson.id));
      setFavorite(state.favoriteLessonIds.includes(lesson.id));
    };

    window.addEventListener(STATISTICS_PROGRESS_EVENT, syncProgress);
    window.addEventListener("storage", syncProgress);
    return () => {
      window.removeEventListener(STATISTICS_PROGRESS_EVENT, syncProgress);
      window.removeEventListener("storage", syncProgress);
    };
  }, [lesson.id]);

  useEffect(() => {
    if (notesStatus !== "saving") return;

    const timer = window.setTimeout(() => {
      setNotesStatus(saveStatisticsNote(lesson.id, notes) ? "saved" : "error");
    }, 450);

    return () => window.clearTimeout(timer);
  }, [lesson.id, notes, notesStatus]);

  function handleFavorite() {
    playClickSound();
    const next = toggleStatisticsFavorite(lesson.id);
    const isFavorite = next.favoriteLessonIds.includes(lesson.id);
    setFavorite(isFavorite);
    if (isFavorite) playNotificationSound();
  }

  function markLearned() {
    playClickSound();
    const result = completeStatisticsLesson(lesson.id);
    setCompleted(result.state.completedLessonIds.includes(lesson.id));

    if (!result.newlyCompleted) return;

    addXP(lesson.xpReward);
    incrementStats(1, 15, lesson.xpReward, 0);
    registerStudyDay();
    unlockAchievement("statistics_starter");
    if (result.state.completedLessonIds.length >= 10) {
      unlockAchievement("statistics_practitioner");
    }
    playXPSound();
    setShowCompletion(true);
  }

  return (
    <AppLayout>
      <div className="space-y-7 text-slate-950">
        <Link
          href="/statistics-studio"
          onClick={playClickSound}
          className="inline-flex items-center gap-2 font-bold text-violet-800 transition hover:text-violet-950"
        >
          <ArrowLeft size={18} aria-hidden="true" /> Back to Statistics Studio
        </Link>

        <header className="rounded-3xl border border-white/70 bg-gradient-to-br from-violet-100 via-pink-100 to-sky-100 p-7 shadow-lg sm:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <span className="text-5xl" aria-hidden="true">
                {lesson.icon}
              </span>
              <h1 className="mt-4 text-4xl font-black text-violet-900 sm:text-5xl">
                {lesson.title}
              </h1>
              <p className="mt-4 text-lg leading-8 text-slate-700">
                {lesson.description}
              </p>
              <div className="mt-5 flex flex-wrap gap-2 text-sm font-bold">
                <span className="rounded-full bg-white/85 px-4 py-2 text-violet-900">
                  {lesson.category}
                </span>
                <span className="rounded-full bg-white/85 px-4 py-2 text-pink-900">
                  {lesson.difficulty}
                </span>
                <span className="rounded-full bg-white/85 px-4 py-2 text-emerald-800">
                  +{lesson.xpReward} XP
                </span>
                {completed ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-4 py-2 text-emerald-800">
                    <CheckCircle2 size={16} aria-hidden="true" /> Learned
                  </span>
                ) : null}
              </div>
            </div>

            <button
              type="button"
              onClick={handleFavorite}
              aria-pressed={favorite}
              className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-5 py-3 font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-600 focus-visible:ring-offset-2 ${
                favorite
                  ? "border-pink-300 bg-pink-100 text-pink-800"
                  : "border-violet-200 bg-white text-slate-800 hover:bg-violet-50"
              }`}
            >
              <Heart
                size={19}
                fill={favorite ? "currentColor" : "none"}
                aria-hidden="true"
              />
              {favorite ? "Favorited" : "Favorite"}
            </button>
          </div>
        </header>

        <InfoSection title="Simple explanation" icon={<Lightbulb size={22} />} tone="violet">
          <p className="leading-8 text-slate-700">{lesson.explanation}</p>
        </InfoSection>

        <section className="grid gap-6 lg:grid-cols-2">
          <FormulaSection title="Formula" content={lesson.formula} tone="dark" />
          <FormulaSection title="Practical example" content={lesson.example} tone="light" />
        </section>

        <InfoSection title="Memory trick" icon={<Lightbulb size={22} />} tone="amber">
          <p className="font-semibold leading-8 text-slate-800">{lesson.memoryTrick}</p>
        </InfoSection>

        <section className="grid gap-6 lg:grid-cols-2">
          <ListSection
            title="When to use it"
            items={lesson.whenToUse}
            className="border-emerald-100 bg-emerald-50/70"
          />
          <ListSection
            title="Common mistakes"
            items={lesson.commonMistakes}
            icon={<TriangleAlert size={21} aria-hidden="true" />}
            className="border-rose-100 bg-rose-50/70"
          />
        </section>

        <InfoSection
          title="Interview questions"
          icon={<MessageSquareText size={22} />}
          tone="blue"
        >
          <ul className="space-y-3 text-slate-800">
            {lesson.interviewQuestions.map((question) => (
              <li key={question} className="rounded-2xl bg-blue-50 p-4">
                • {question}
              </li>
            ))}
          </ul>
        </InfoSection>

        <section className="rounded-3xl border border-amber-100 bg-white p-6 shadow-lg sm:p-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-amber-800">
                <NotebookPen size={19} aria-hidden="true" /> Personal notes
              </p>
              <h2 className="mt-1 text-2xl font-black text-slate-950">
                Remember it your way
              </h2>
            </div>
            <p className="text-sm font-semibold text-slate-600" aria-live="polite">
              {notesStatus === "saved"
                ? "Saved locally"
                : notesStatus === "saving"
                  ? "Saving…"
                  : "Couldn’t save locally"}
            </p>
          </div>
          <textarea
            value={notes}
            onChange={(event) => {
              setNotes(event.target.value);
              setNotesStatus("saving");
            }}
            rows={6}
            placeholder="Write examples, questions, or your own memory trick…"
            className="mt-5 w-full rounded-2xl border border-amber-200 bg-amber-50/50 p-4 leading-7 text-slate-950 outline-none placeholder:text-slate-500 focus:border-amber-700 focus:ring-2 focus:ring-amber-200"
          />
        </section>

        {lesson.relatedLessons.length > 0 ? (
          <section>
            <h2 className="text-2xl font-black text-slate-950">Related lessons</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              {lesson.relatedLessons.map((id) => {
                const related = getStatisticsLesson(id);
                return related ? (
                  <Link
                    key={id}
                    href={`/statistics-studio/${id}`}
                    onClick={playClickSound}
                    className="rounded-xl border border-violet-200 bg-white px-4 py-3 font-bold text-violet-900 shadow-sm transition hover:bg-violet-50"
                  >
                    {related.icon} {related.title}
                  </Link>
                ) : null;
              })}
            </div>
          </section>
        ) : null}

        <section className="flex flex-col gap-4 rounded-3xl border border-violet-100 bg-white p-6 shadow-lg sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <h2 className="text-2xl font-black text-slate-950">Ready to apply it?</h2>
            <p className="mt-2 text-slate-700">
              Solve the analyst task, then mark this lesson learned for {lesson.xpReward} XP.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/statistics-studio/${lesson.id}/practice`}
              onClick={playClickSound}
              className="rounded-xl bg-blue-700 px-5 py-3 font-bold text-white transition hover:bg-blue-800"
            >
              Practice
            </Link>
            <button
              type="button"
              onClick={markLearned}
              disabled={completed}
              className="rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-emerald-100 disabled:text-emerald-800"
            >
              {completed ? "Learned" : `Mark Learned · +${lesson.xpReward} XP`}
            </button>
          </div>
        </section>
      </div>

      <CompletionModal
        isOpen={showCompletion}
        projectTitle={`${lesson.title} Statistics lesson`}
        xpEarned={lesson.xpReward}
        celebrationLabel="Statistics lesson learned"
        description={
          <>
            You learned <span className="font-bold text-slate-950">{lesson.title}</span>.
            Your statistical toolkit is growing.
          </>
        }
        continueLabel="Open practice"
        onClose={() => setShowCompletion(false)}
        onContinue={() => {
          setShowCompletion(false);
          router.push(`/statistics-studio/${lesson.id}/practice`);
        }}
      />
    </AppLayout>
  );
}

function FormulaSection({
  title,
  content,
  tone,
}: {
  title: string;
  content: string;
  tone: "dark" | "light";
}) {
  const isDark = tone === "dark";

  return (
    <article
      className={`rounded-3xl border p-6 shadow-lg sm:p-8 ${
        isDark ? "border-slate-800 bg-slate-950" : "border-blue-100 bg-white"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2
          className={`flex items-center gap-2 text-xl font-bold ${
            isDark ? "text-white" : "text-blue-900"
          }`}
        >
          <Sigma size={21} aria-hidden="true" /> {title}
        </h2>
        <CopyCodeButton code={content} label={`Copy ${title.toLowerCase()}`} />
      </div>
      <pre
        className={`mt-5 overflow-x-auto whitespace-pre-wrap rounded-2xl p-5 font-mono text-sm leading-7 ${
          isDark ? "bg-slate-900 text-emerald-200" : "bg-blue-50 text-blue-950"
        }`}
      >
        <code>{content}</code>
      </pre>
    </article>
  );
}

function InfoSection({
  title,
  icon,
  tone,
  children,
}: {
  title: string;
  icon: ReactNode;
  tone: "violet" | "amber" | "blue";
  children: ReactNode;
}) {
  const colors =
    tone === "violet"
      ? "border-violet-100 bg-violet-50/60 text-violet-900"
      : tone === "amber"
        ? "border-amber-100 bg-amber-50/60 text-amber-900"
        : "border-blue-100 bg-white text-blue-900";

  return (
    <section className={`rounded-3xl border p-6 shadow-md sm:p-8 ${colors}`}>
      <h2 className="flex items-center gap-2 text-2xl font-black">
        {icon} {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function ListSection({
  title,
  items,
  className,
  icon,
}: {
  title: string;
  items: string[];
  className: string;
  icon?: ReactNode;
}) {
  return (
    <article className={`rounded-3xl border p-6 shadow-md sm:p-8 ${className}`}>
      <h2 className="flex items-center gap-2 text-2xl font-black text-slate-950">
        {icon} {title}
      </h2>
      <ul className="mt-5 space-y-3 text-slate-800">
        {items.map((item) => (
          <li key={item} className="rounded-2xl bg-white/85 p-4">
            • {item}
          </li>
        ))}
      </ul>
    </article>
  );
}
