"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Heart,
  Lightbulb,
  MessageSquareText,
  NotebookPen,
  TriangleAlert,
} from "lucide-react";

import CompletionModal from "@/components/dashboard/CompletionModal";
import AppLayout from "@/components/layout/AppLayout";
import { useProgress } from "@/context/ProgressContext";
import { getTableauLesson, type TableauLesson } from "@/lib/tableauLessons";
import {
  completeTableauLesson,
  getTableauNote,
  loadTableauProgress,
  saveTableauNote,
  TABLEAU_PROGRESS_EVENT,
  toggleTableauFavorite,
} from "@/lib/tableauProgress";
import {
  playClickSound,
  playNotificationSound,
  playXPSound,
} from "@/lib/sounds";

type NotesStatus = "saved" | "saving" | "error";

export default function TableauLessonDetail({ lesson }: { lesson: TableauLesson }) {
  const router = useRouter();
  const { addXP } = useProgress();
  const initialProgress = loadTableauProgress();
  const [completed, setCompleted] = useState(() =>
    initialProgress.completedLessonIds.includes(lesson.id),
  );
  const [favorite, setFavorite] = useState(() =>
    initialProgress.favoriteLessonIds.includes(lesson.id),
  );
  const [notes, setNotes] = useState(() => getTableauNote(lesson.id));
  const [notesStatus, setNotesStatus] = useState<NotesStatus>("saved");
  const [showCompletion, setShowCompletion] = useState(false);

  useEffect(() => {
    const syncProgress = () => {
      const state = loadTableauProgress();
      setCompleted(state.completedLessonIds.includes(lesson.id));
      setFavorite(state.favoriteLessonIds.includes(lesson.id));
    };
    window.addEventListener(TABLEAU_PROGRESS_EVENT, syncProgress);
    window.addEventListener("storage", syncProgress);
    return () => {
      window.removeEventListener(TABLEAU_PROGRESS_EVENT, syncProgress);
      window.removeEventListener("storage", syncProgress);
    };
  }, [lesson.id]);

  useEffect(() => {
    if (notesStatus !== "saving") return;
    const timer = window.setTimeout(() => {
      setNotesStatus(saveTableauNote(lesson.id, notes) ? "saved" : "error");
    }, 450);
    return () => window.clearTimeout(timer);
  }, [lesson.id, notes, notesStatus]);

  function handleFavorite() {
    playClickSound();
    const next = toggleTableauFavorite(lesson.id);
    const nextFavorite = next.favoriteLessonIds.includes(lesson.id);
    setFavorite(nextFavorite);
    if (nextFavorite) playNotificationSound();
  }

  function markLearned() {
    playClickSound();
    const result = completeTableauLesson(lesson.id);
    setCompleted(result.state.completedLessonIds.includes(lesson.id));
    if (!result.newlyCompleted) return;

    addXP(lesson.xpReward);
    playXPSound();
    setShowCompletion(true);
  }

  return (
    <AppLayout>
      <div className="space-y-7 text-slate-950">
        <Link
          href="/tableau-studio"
          onClick={playClickSound}
          className="inline-flex items-center gap-2 font-bold text-blue-800 transition hover:text-blue-950"
        >
          <ArrowLeft size={18} aria-hidden="true" /> Back to Tableau Studio
        </Link>

        <header className="rounded-3xl border border-white/70 bg-gradient-to-br from-blue-100 via-pink-100 to-orange-100 p-7 shadow-lg sm:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <span className="text-5xl" aria-hidden="true">{lesson.icon}</span>
              <h1 className="mt-4 text-4xl font-black sm:text-5xl">{lesson.title}</h1>
              <p className="mt-4 text-lg leading-8 text-slate-700">{lesson.description}</p>
              <div className="mt-5 flex flex-wrap gap-2 text-sm font-bold">
                <Badge tone="blue">{lesson.category}</Badge>
                <Badge tone="orange">{lesson.difficulty}</Badge>
                <Badge tone="green">+{lesson.xpReward} XP</Badge>
                {completed ? (
                  <Badge tone="green">
                    <CheckCircle2 className="mr-1 inline" size={16} aria-hidden="true" /> Learned
                  </Badge>
                ) : null}
              </div>
            </div>

            <button
              type="button"
              onClick={handleFavorite}
              aria-pressed={favorite}
              className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-5 py-3 font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-600 ${
                favorite
                  ? "border-pink-300 bg-pink-100 text-pink-800"
                  : "border-blue-200 bg-white text-slate-800 hover:bg-blue-50"
              }`}
            >
              <Heart size={19} fill={favorite ? "currentColor" : "none"} aria-hidden="true" />
              {favorite ? "Favorited" : "Favorite"}
            </button>
          </div>
        </header>

        <InfoSection title="Simple explanation" icon={<Lightbulb size={22} />} tone="blue">
          <p className="leading-8 text-slate-700">{lesson.explanation}</p>
        </InfoSection>

        <InfoSection title="Step-by-step guide" icon={<span aria-hidden="true">🪜</span>} tone="orange">
          <ol className="space-y-3">
            {lesson.steps.map((step, index) => (
              <li key={step} className="rounded-2xl bg-orange-50 p-4 leading-7 text-slate-800">
                <strong className="text-orange-800">{index + 1}.</strong> {step}
              </li>
            ))}
          </ol>
        </InfoSection>

        <section className="grid gap-6 lg:grid-cols-2">
          <InfoSection title="Practical example" icon={<span aria-hidden="true">📊</span>} tone="blue">
            <p className="rounded-2xl bg-slate-950 p-5 font-mono text-sm leading-7 text-emerald-200">
              {lesson.example}
            </p>
          </InfoSection>
          <InfoSection title="Memory trick" icon={<Lightbulb size={22} />} tone="orange">
            <p className="font-semibold leading-8 text-slate-800">{lesson.memoryTrick}</p>
          </InfoSection>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <ListSection title="When to use it" items={lesson.whenToUse} />
          <ListSection title="Common mistakes" items={lesson.commonMistakes} warning />
        </section>

        <InfoSection
          title="Interview questions"
          icon={<MessageSquareText size={22} />}
          tone="blue"
        >
          <ul className="space-y-3">
            {lesson.interviewQuestions.map((question) => (
              <li key={question} className="rounded-2xl bg-blue-50 p-4 leading-7 text-slate-800">
                • {question}
              </li>
            ))}
          </ul>
        </InfoSection>

        <section className="rounded-3xl border border-orange-100 bg-white p-6 shadow-lg sm:p-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-orange-700">
                <NotebookPen size={19} aria-hidden="true" /> Personal notes
              </p>
              <h2 className="mt-1 text-2xl font-black">Remember it your way</h2>
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
            placeholder="Write your own Tableau example, checklist, or interview note…"
            className="mt-5 w-full rounded-2xl border border-orange-200 bg-orange-50/50 p-4 leading-7 outline-none placeholder:text-slate-500 focus:border-orange-600 focus:ring-2 focus:ring-orange-200"
          />
        </section>

        {lesson.relatedLessons.length > 0 ? (
          <section>
            <h2 className="text-2xl font-black">Related lessons</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              {lesson.relatedLessons.map((id) => {
                const related = getTableauLesson(id);
                return related ? (
                  <Link
                    key={id}
                    href={`/tableau-studio/${id}`}
                    onClick={playClickSound}
                    className="rounded-xl border border-blue-200 bg-white px-4 py-3 font-bold text-blue-900 shadow-sm transition hover:bg-blue-50"
                  >
                    {related.icon} {related.title}
                  </Link>
                ) : null;
              })}
            </div>
          </section>
        ) : null}

        <section className="flex flex-col gap-4 rounded-3xl border border-blue-100 bg-white p-6 shadow-lg sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <h2 className="text-2xl font-black">Ready to apply it?</h2>
            <p className="mt-2 text-slate-700">
              Try the Tableau scenario, then mark this lesson learned for {lesson.xpReward} XP.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/tableau-studio/${lesson.id}/practice`}
              onClick={playClickSound}
              className="rounded-xl bg-orange-600 px-5 py-3 font-bold text-white transition hover:bg-orange-700"
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
        projectTitle={`${lesson.title} Tableau lesson`}
        xpEarned={lesson.xpReward}
        celebrationLabel="Tableau lesson learned"
        description={
          <>
            You learned <span className="font-bold text-slate-950">{lesson.title}</span>.
            Your visual analytics skills are blooming.
          </>
        }
        continueLabel="Open practice"
        onClose={() => setShowCompletion(false)}
        onContinue={() => {
          setShowCompletion(false);
          router.push(`/tableau-studio/${lesson.id}/practice`);
        }}
      />
    </AppLayout>
  );
}

function Badge({
  tone,
  children,
}: {
  tone: "blue" | "orange" | "green";
  children: React.ReactNode;
}) {
  const colors =
    tone === "blue"
      ? "text-blue-900"
      : tone === "orange"
        ? "text-orange-900"
        : "text-emerald-800";
  return <span className={`rounded-full bg-white/85 px-4 py-2 ${colors}`}>{children}</span>;
}

function InfoSection({
  title,
  icon,
  tone,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  tone: "blue" | "orange";
  children: React.ReactNode;
}) {
  return (
    <section
      className={`rounded-3xl border p-6 shadow-md sm:p-8 ${
        tone === "blue"
          ? "border-blue-100 bg-white"
          : "border-orange-100 bg-orange-50/60"
      }`}
    >
      <h2 className={`flex items-center gap-2 text-2xl font-black ${tone === "blue" ? "text-blue-900" : "text-orange-900"}`}>
        {icon} {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function ListSection({
  title,
  items,
  warning = false,
}: {
  title: string;
  items: string[];
  warning?: boolean;
}) {
  return (
    <section className={`rounded-3xl border p-6 shadow-md sm:p-8 ${warning ? "border-rose-100 bg-rose-50/60" : "border-emerald-100 bg-emerald-50/60"}`}>
      <h2 className="flex items-center gap-2 text-2xl font-black">
        {warning ? <TriangleAlert size={22} className="text-rose-600" aria-hidden="true" /> : <CheckCircle2 size={22} className="text-emerald-600" aria-hidden="true" />}
        {title}
      </h2>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item} className="rounded-2xl bg-white/80 p-4 leading-7 text-slate-800">• {item}</li>
        ))}
      </ul>
    </section>
  );
}
