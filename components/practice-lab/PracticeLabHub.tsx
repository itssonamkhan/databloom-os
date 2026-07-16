"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  BarChart3,
  CheckCircle2,
  Clock3,
  Flame,
  GripVertical,
  Heart,
  Lightbulb,
  Play,
  RotateCcw,
  Search,
  Sparkles,
  Target,
  Timer,
  Zap,
} from "lucide-react";

import AppLayout from "@/components/layout/AppLayout";
import { useProgress } from "@/context/ProgressContext";
import {
  abandonPracticeSession,
  advancePracticeSession,
  completePracticeSession,
  getOrCreateDailyChallenge,
  getPracticeSummary,
  getRecommendedQuestions,
  getWeakTopicInsights,
  loadPracticeLabState,
  PRACTICE_LAB_EVENT,
  recordPracticeAttempt,
  savePracticeNote,
  startDailyChallenge,
  startPracticeSession,
  togglePracticeFavorite,
  type ActivePracticeSession,
  type PracticeHistoryEntry,
  type PracticeLabState,
} from "@/lib/practiceLab";
import {
  getQuestionById,
  isPracticeAnswerCorrect,
  practiceCategories,
  practiceDifficulties,
  practiceQuestions,
  type PracticeAnswer,
  type PracticeCategory,
  type PracticeDifficulty,
  type PracticeQuestion,
} from "@/lib/practiceLabQuestions";
import {
  playClickSound,
  playNotificationSound,
  playSuccessSound,
  playXPSound,
} from "@/lib/sounds";
import { registerStudyActivity } from "@/lib/studyActivity";
import { unlockAchievement } from "@/lib/unlockedAchievements";

type View = "home" | "session" | "complete";
type Feedback = { correct: boolean; message: string } | null;

const categoryMeta: Record<
  PracticeCategory,
  { icon: string; description: string; className: string }
> = {
  Excel: {
    icon: "📗",
    description: "Formulas, lookups, logic, and clean spreadsheet workflows.",
    className: "from-emerald-50 to-lime-100 border-emerald-200",
  },
  SQL: {
    icon: "🗄️",
    description: "Queries, joins, grouping, and reliable clause structure.",
    className: "from-sky-50 to-blue-100 border-sky-200",
  },
  Python: {
    icon: "🐍",
    description: "Pandas code, filtering, aggregation, and analysis flow.",
    className: "from-cyan-50 to-amber-50 border-cyan-200",
  },
  Statistics: {
    icon: "📐",
    description: "Descriptive statistics, testing, and core concepts.",
    className: "from-rose-50 to-fuchsia-100 border-rose-200",
  },
  "Power BI": {
    icon: "📊",
    description: "DAX, data modeling, and dashboard interpretation.",
    className: "from-amber-50 to-yellow-100 border-amber-200",
  },
  Tableau: {
    icon: "🎨",
    description: "Visual analytics, shelves, LODs, and dashboard insights.",
    className: "from-violet-50 to-sky-100 border-violet-200",
  },
  "Power Query": {
    icon: "🧹",
    description: "Refreshable transformations, M, merge, and append.",
    className: "from-teal-50 to-emerald-100 border-teal-200",
  },
  "Business Analytics": {
    icon: "💼",
    description: "KPIs, business cases, retention, and decision-making.",
    className: "from-indigo-50 to-pink-100 border-indigo-200",
  },
};

const categoryStudioRoutes: Record<PracticeCategory, string> = {
  Excel: "/formula-studio",
  SQL: "/sql-studio",
  Python: "/python-studio",
  Statistics: "/statistics-studio",
  "Power BI": "/power-bi-studio",
  Tableau: "/tableau-studio",
  "Power Query": "/power-query-studio",
  "Business Analytics": "/business-analytics-studio",
};

function emptyState(): PracticeLabState {
  return {
    version: 1,
    completedQuestionIds: [],
    rewardedQuestionIds: [],
    favoriteQuestionIds: [],
    notes: {},
    completedAt: {},
    performance: {},
    history: [],
    activeSession: null,
    dailyChallenges: {},
  };
}

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

function answerForQuestion(question: PracticeQuestion): PracticeAnswer {
  if (question.type === "Drag & Drop Ordering") {
    return [...(question.orderItems ?? [])].reverse();
  }
  if (question.type === "Match the Columns") return {};
  return "";
}

function updatePracticeAchievements(state: PracticeLabState, entry: PracticeHistoryEntry) {
  unlockAchievement("practice_starter");
  if (entry.accuracy === 100) unlockAchievement("practice_perfect");
  const completedCategories = new Set(
    state.completedQuestionIds
      .map(getQuestionById)
      .filter((question): question is PracticeQuestion => Boolean(question))
      .map((question) => question.category),
  );
  if (completedCategories.size >= 4) unlockAchievement("practice_explorer");
}

export default function PracticeLabHub() {
  const { addXP } = useProgress();
  const [hydrated, setHydrated] = useState(false);
  const [state, setState] = useState<PracticeLabState>(emptyState);
  const [view, setView] = useState<View>("home");
  const [dailyQuestion, setDailyQuestion] = useState<PracticeQuestion | null>(null);
  const [category, setCategory] = useState<PracticeCategory | "All">("All");
  const [difficulty, setDifficulty] = useState<PracticeDifficulty | "All">("All");
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState<PracticeAnswer>("");
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [showHint, setShowHint] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [completion, setCompletion] = useState<PracticeHistoryEntry | null>(null);
  const [note, setNote] = useState("");
  const [noteStatus, setNoteStatus] = useState("");
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const sync = useCallback(() => {
    const latest = loadPracticeLabState();
    setState(latest);
    return latest;
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const latest = sync();
      setDailyQuestion(getOrCreateDailyChallenge());
      setView(latest.activeSession ? "session" : "home");
      setHydrated(true);
    });

    window.addEventListener(PRACTICE_LAB_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener(PRACTICE_LAB_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [sync]);

  const session = state.activeSession;
  const currentQuestion = session
    ? getQuestionById(session.questionIds[session.currentIndex]) ?? null
    : null;

  useEffect(() => {
    if (!currentQuestion) return;
    const frame = window.requestAnimationFrame(() => {
      setAnswer(answerForQuestion(currentQuestion));
      setFeedback(null);
      setShowHint(false);
      setNote(state.notes[currentQuestion.id] ?? "");
      setNoteStatus("");
    });
    return () => window.cancelAnimationFrame(frame);
  }, [currentQuestion?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!session || view !== "session") return;
    const tick = () => {
      const started = new Date(session.startedAt).getTime();
      setElapsedSeconds(Math.max(0, Math.floor((Date.now() - started) / 1000)));
    };
    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, [session, view]);

  const summary = useMemo(() => getPracticeSummary(state), [state]);
  const recommended = useMemo(
    () => getRecommendedQuestions(state).slice(0, 4),
    [state],
  );
  const weakTopics = useMemo(
    () => getWeakTopicInsights(state).slice(0, 5),
    [state],
  );
  const recentQuestions = useMemo(
    () =>
      Object.entries(state.completedAt)
        .sort(([, left], [, right]) => right.localeCompare(left))
        .map(([id, completedAt]) => ({ question: getQuestionById(id), completedAt }))
        .filter(
          (item): item is { question: PracticeQuestion; completedAt: string } =>
            Boolean(item.question),
        )
        .slice(0, 5),
    [state.completedAt],
  );
  const filteredQuestions = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return practiceQuestions.filter(
      (question) =>
        (category === "All" || question.category === category) &&
        (difficulty === "All" || question.difficulty === difficulty) &&
        (!normalizedQuery ||
          [
            question.title,
            question.topic,
            question.category,
            question.type,
            question.prompt,
          ].some((value) => value.toLocaleLowerCase().includes(normalizedQuery))),
    );
  }, [category, difficulty, query]);

  function beginSession(options?: {
    category?: PracticeCategory | "All";
    difficulty?: PracticeDifficulty | "All";
    kind?: ActivePracticeSession["kind"];
    questionIds?: string[];
    topic?: string;
  }) {
    playClickSound();
    const started = startPracticeSession({
      category: options?.category ?? category,
      difficulty: options?.difficulty ?? difficulty,
      timerEnabled,
      kind: options?.kind,
      questionIds: options?.questionIds,
      topic: options?.topic,
    });
    if (!started) return;
    sync();
    setCompletion(null);
    setElapsedSeconds(0);
    setView("session");
  }

  function beginDaily() {
    if (!dailyQuestion) return;
    playClickSound();
    const started = startDailyChallenge(dailyQuestion.id, timerEnabled);
    if (!started) return;
    sync();
    setCompletion(null);
    setElapsedSeconds(0);
    setView("session");
  }

  function handleCheckAnswer() {
    if (!currentQuestion || !session) return;
    playClickSound();
    const correct = isPracticeAnswerCorrect(currentQuestion, answer);
    const result = recordPracticeAttempt(currentQuestion.id, correct);
    if (!result.saved) return;
    sync();

    if (!correct) {
      playNotificationSound();
      setFeedback({
        correct: false,
        message: "Not quite yet. Review the explanation, adjust your answer, and retry.",
      });
      return;
    }

    playSuccessSound();
    if (result.newlyRewarded) {
      addXP(result.xpAward);
      playXPSound();
    }
    setFeedback({
      correct: true,
      message: result.newlyRewarded
        ? `Correct — ${result.xpAward} XP added for this challenge.`
        : "Correct. You already earned this challenge's XP, so it was not added again.",
    });
  }

  function finishSession() {
    const result = completePracticeSession(elapsedSeconds);
    if (!result.completed || !result.entry) return;
    registerStudyActivity({
      kind: "practice",
      source: `practice-lab-session:${result.entry.id}`,
      minutes: Math.max(1, Math.round(elapsedSeconds / 60)),
      xp: result.entry.xpEarned,
    });
    updatePracticeAchievements(result.state, result.entry);
    playSuccessSound();
    setCompletion(result.entry);
    sync();
    setView("complete");
  }

  function handleNext() {
    if (!session) return;
    playClickSound();
    if (session.currentIndex >= session.questionIds.length - 1) {
      finishSession();
      return;
    }
    advancePracticeSession();
    sync();
  }

  function leaveSession() {
    playClickSound();
    abandonPracticeSession();
    sync();
    setView("home");
  }

  function saveNote() {
    if (!currentQuestion) return;
    playClickSound();
    const saved = savePracticeNote(currentQuestion.id, note);
    setNoteStatus(saved ? "Note saved on this device." : "Note could not be saved.");
    sync();
  }

  if (!hydrated) {
    return (
      <AppLayout>
        <div className="grid min-h-[55vh] place-items-center rounded-3xl border border-purple-100 bg-white/70 text-center shadow-lg">
          <div>
            <span className="text-5xl" aria-hidden="true">🧪</span>
            <p className="mt-4 font-black text-purple-800">Preparing your Practice Lab…</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (view === "session" && session && currentQuestion) {
    return (
      <AppLayout>
        <PracticeSession
          session={session}
          question={currentQuestion}
          answer={answer}
          setAnswer={setAnswer}
          feedback={feedback}
          showHint={showHint}
          setShowHint={setShowHint}
          elapsedSeconds={elapsedSeconds}
          favorite={state.favoriteQuestionIds.includes(currentQuestion.id)}
          note={note}
          setNote={setNote}
          noteStatus={noteStatus}
          onSaveNote={saveNote}
          onToggleFavorite={() => {
            playClickSound();
            togglePracticeFavorite(currentQuestion.id);
            sync();
          }}
          onCheck={handleCheckAnswer}
          onNext={handleNext}
          onLeave={leaveSession}
          draggedIndex={draggedIndex}
          setDraggedIndex={setDraggedIndex}
        />
      </AppLayout>
    );
  }

  if (view === "complete" && completion) {
    return (
      <AppLayout>
        <CompletionView
          entry={completion}
          onHome={() => {
            playClickSound();
            setView("home");
          }}
          onNext={() =>
            beginSession({
              kind: "recommended",
              questionIds: getRecommendedQuestions(state)
                .slice(0, 5)
                .map((question) => question.id),
              topic: "Recommended Practice",
            })
          }
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-8 text-slate-950">
        <header className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-gradient-to-br from-purple-100 via-pink-100 to-sky-100 p-7 shadow-lg sm:p-10">
          <div className="pointer-events-none absolute -right-16 -top-20 size-64 rounded-full bg-white/50 blur-3xl" aria-hidden="true" />
          <div className="relative flex flex-col gap-7 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-bold text-purple-800 shadow-sm">
                <Sparkles size={17} aria-hidden="true" /> Adaptive practice across eight skills
              </p>
              <h1 className="mt-4 text-4xl font-black tracking-tight text-purple-900 sm:text-5xl">🧪 Practice Lab</h1>
              <p className="mt-3 max-w-2xl text-base font-medium leading-7 text-slate-700 sm:text-lg">
                Strengthen weak topics, get instant feedback, and turn every retry into durable analyst skill.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 rounded-3xl border border-white bg-white/70 p-4 shadow-sm backdrop-blur-sm">
              <HeaderStat value={summary.completedQuestions} label="Solved" />
              <HeaderStat value={`${summary.averageAccuracy}%`} label="Accuracy" />
              <HeaderStat value={summary.totalXP} label="Lab XP" />
            </div>
          </div>
        </header>

        <section className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
          <article className="rounded-[2rem] border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-pink-50 p-6 shadow-lg sm:p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.16em] text-amber-800">
                  <Flame size={18} aria-hidden="true" /> Daily Challenge
                </p>
                <h2 className="mt-3 text-3xl font-black">{dailyQuestion?.title ?? "Preparing today's challenge"}</h2>
                <p className="mt-3 max-w-2xl leading-7 text-slate-700">
                  {dailyQuestion?.prompt ?? "Your deterministic challenge is selected from the topics you have studied."}
                </p>
                {dailyQuestion ? (
                  <div className="mt-4 flex flex-wrap gap-2 text-sm font-bold">
                    <Pill>{dailyQuestion.category}</Pill>
                    <Pill>{dailyQuestion.type}</Pill>
                    <Pill>+{dailyQuestion.xpReward} XP once</Pill>
                  </div>
                ) : null}
              </div>
              <button type="button" onClick={beginDaily} disabled={!dailyQuestion} className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-2xl bg-amber-700 px-6 py-3 font-black text-white shadow-md transition hover:-translate-y-0.5 hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-50">
                <Play size={19} aria-hidden="true" /> Start daily
              </button>
            </div>
          </article>

          <article className="rounded-[2rem] border border-purple-200 bg-white/85 p-6 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="grid size-11 place-items-center rounded-2xl bg-purple-100 text-purple-800"><Zap size={22} aria-hidden="true" /></div>
              <div><p className="text-sm font-bold uppercase tracking-wider text-purple-700">XP rewards</p><h2 className="text-2xl font-black">Protected once</h2></div>
            </div>
            <p className="mt-4 leading-7 text-slate-700">Each challenge awards 15–30 XP only on its first correct completion. Replays still improve history and recommendations without adding XP again.</p>
          </article>
        </section>

        <Link
          href="/interview-hub"
          onClick={playClickSound}
          className="group flex flex-col gap-5 rounded-[2rem] border border-pink-200 bg-gradient-to-br from-pink-50 via-white to-purple-50 p-6 shadow-lg transition hover:-translate-y-1 hover:shadow-xl sm:flex-row sm:items-center sm:justify-between sm:p-8"
        >
          <div className="flex items-start gap-4">
            <span
              className="grid size-12 shrink-0 place-items-center rounded-2xl bg-purple-700 text-2xl shadow-sm"
              aria-hidden="true"
            >
              🎯
            </span>
            <div>
              <p className="text-sm font-black uppercase tracking-[0.16em] text-pink-700">
                Ready for the next step?
              </p>
              <h2 className="mt-1 text-2xl font-black text-slate-950">
                Practice technical and HR interviews
              </h2>
              <p className="mt-2 leading-7 text-slate-700">
                Continue in Interview Hub with 500+ guided questions, saved answers, and timed mock interviews.
              </p>
            </div>
          </div>
          <span className="inline-flex shrink-0 items-center gap-2 font-black text-purple-800">
            Open Interview Hub
            <ArrowRight className="transition group-hover:translate-x-1" size={18} aria-hidden="true" />
          </span>
        </Link>

        <Link
          href="/career-hub"
          onClick={playClickSound}
          className="flex min-h-16 items-center justify-between gap-4 rounded-3xl border border-emerald-200 bg-emerald-50/80 px-6 py-4 font-black text-emerald-900 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <span>🌱 Practice with a target role and application plan</span>
          <span className="inline-flex items-center gap-2">Open Career Hub <ArrowRight size={17} /></span>
        </Link>

        {state.activeSession ? (
          <section className="rounded-[2rem] border border-sky-200 bg-sky-50 p-6 shadow-md sm:flex sm:items-center sm:justify-between sm:gap-5">
            <div>
              <p className="font-black text-sky-900">Continue Practice</p>
              <h2 className="mt-1 text-2xl font-black">{state.activeSession.topic}</h2>
              <p className="mt-2 text-slate-700">Question {state.activeSession.currentIndex + 1} of {state.activeSession.questionIds.length} · your place is saved.</p>
            </div>
            <button type="button" onClick={() => { playClickSound(); setView("session"); }} className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-sky-700 px-5 py-3 font-black text-white sm:mt-0">
              Continue <ArrowRight size={18} aria-hidden="true" />
            </button>
          </section>
        ) : null}

        <section className="rounded-[2rem] border border-purple-100 bg-white/80 p-5 shadow-lg sm:p-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.16em] text-purple-700">Build a session</p>
              <h2 className="mt-1 text-3xl font-black">Choose your practice focus</h2>
            </div>
            <label className="inline-flex cursor-pointer items-center gap-3 rounded-2xl border border-purple-200 bg-purple-50 px-4 py-3 font-bold text-purple-900">
              <input type="checkbox" checked={timerEnabled} onChange={(event) => setTimerEnabled(event.target.checked)} className="size-4 accent-purple-700" />
              <Timer size={18} aria-hidden="true" /> Show session timer
            </label>
          </div>

          <div className="mt-6 grid gap-3 lg:grid-cols-[1fr_0.65fr_0.65fr_auto]">
            <label className="relative block">
              <span className="sr-only">Search practice</span>
              <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={19} aria-hidden="true" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search questions, topics, or types" className="min-h-12 w-full rounded-2xl border border-slate-300 bg-white pl-11 pr-4 font-medium outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100" />
            </label>
            <label>
              <span className="sr-only">Category</span>
              <select value={category} onChange={(event) => setCategory(event.target.value as PracticeCategory | "All")} className="min-h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 font-bold outline-none focus:border-purple-500">
                <option>All</option>{practiceCategories.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
            <label>
              <span className="sr-only">Difficulty</span>
              <select value={difficulty} onChange={(event) => setDifficulty(event.target.value as PracticeDifficulty | "All")} className="min-h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 font-bold outline-none focus:border-purple-500">
                <option>All</option>{practiceDifficulties.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
            <button type="button" onClick={() => beginSession()} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-purple-700 px-6 font-black text-white shadow-sm transition hover:bg-purple-800">
              Start session <ArrowRight size={18} aria-hidden="true" />
            </button>
          </div>

          {query.trim() ? (
            <div className="mt-6">
              <p className="mb-3 font-bold text-slate-700">{filteredQuestions.length} matching challenges</p>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filteredQuestions.map((question) => (
                  <QuestionCard key={question.id} question={question} completed={state.completedQuestionIds.includes(question.id)} favorite={state.favoriteQuestionIds.includes(question.id)} onFavorite={() => { togglePracticeFavorite(question.id); sync(); }} onStart={() => beginSession({ category: question.category, difficulty: "All", questionIds: [question.id], topic: question.topic })} />
                ))}
              </div>
            </div>
          ) : null}
        </section>

        <section aria-labelledby="categories-heading">
          <SectionHeading eyebrow="Unified Practice Hub" title="Practice every analyst skill" description="Eight focused paths, one shared progress and reward system." />
          <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {practiceCategories.map((item) => {
              const meta = categoryMeta[item];
              const count = practiceQuestions.filter((question) => question.category === item).length;
              const completed = practiceQuestions.filter((question) => question.category === item && state.completedQuestionIds.includes(question.id)).length;
              return (
                <button key={item} type="button" onClick={() => beginSession({ category: item, difficulty, topic: item })} className={`group flex min-h-64 flex-col rounded-3xl border bg-gradient-to-br p-6 text-left shadow-md transition hover:-translate-y-1 hover:shadow-xl ${meta.className}`}>
                  <span className="text-4xl" aria-hidden="true">{meta.icon}</span>
                  <h3 className="mt-4 text-2xl font-black">{item} Practice</h3>
                  <p className="mt-2 flex-1 leading-6 text-slate-700">{meta.description}</p>
                  <div className="mt-4 flex items-center justify-between gap-3 text-sm font-bold"><span>{completed}/{count} solved</span><span className="inline-flex items-center gap-1 text-purple-800">Practice <ArrowRight size={16} /></span></div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="rounded-[2rem] border border-sky-100 bg-white/80 p-5 shadow-md sm:p-7">
          <SectionHeading eyebrow="Review before practice" title="Open the matching learning Studio" description="Use the original lesson paths when a practice topic needs a refresher." />
          <div className="mt-5 flex flex-wrap gap-3">
            {practiceCategories.map((item) => (
              <Link
                key={item}
                href={categoryStudioRoutes[item]}
                onClick={playClickSound}
                className="inline-flex min-h-11 items-center gap-2 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-black text-sky-900 transition hover:bg-sky-100"
              >
                <span aria-hidden="true">{categoryMeta[item].icon}</span>
                {item} Studio
              </Link>
            ))}
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-[2rem] border border-pink-100 bg-white/85 p-6 shadow-lg">
            <SectionHeading eyebrow="Recommended Practice" title="Best next challenges" description="Ranked from your learning history, retries, and unfinished work." />
            <div className="mt-5 grid gap-3">
              {recommended.map((question) => (
                <CompactQuestion key={question.id} question={question} badge={state.completedQuestionIds.includes(question.id) ? "Review" : "Recommended"} onStart={() => beginSession({ category: question.category, difficulty: "All", kind: "recommended", questionIds: [question.id], topic: `Recommended · ${question.topic}` })} />
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-rose-100 bg-white/85 p-6 shadow-lg">
            <SectionHeading eyebrow="Weak Topics" title="Turn gaps into strengths" description="Lower-accuracy topics rise automatically as you practice." />
            <div className="mt-5 space-y-3">
              {weakTopics.length ? weakTopics.map((insight) => (
                <button key={`${insight.category}-${insight.topic}`} type="button" onClick={() => beginSession({ category: insight.category, difficulty: "All", kind: "weak-topic", questionIds: practiceQuestions.filter((question) => question.category === insight.category && question.topic === insight.topic).map((question) => question.id), topic: `Weak topic · ${insight.topic}` })} className="flex w-full items-center justify-between gap-4 rounded-2xl border border-rose-100 bg-rose-50/60 p-4 text-left transition hover:bg-rose-100">
                  <div><p className="font-black">{insight.topic}</p><p className="mt-1 text-sm text-slate-600">{insight.category} · {insight.attempts ? `${insight.attempts} attempts` : "Ready to reinforce"}</p></div>
                  <span className="rounded-full bg-white px-3 py-1 text-sm font-black text-rose-800">{insight.attempts ? `${insight.accuracy}%` : "Start"}</span>
                </button>
              )) : <EmptyPanel icon="🌱" text="Complete a challenge and weak-topic recommendations will adapt to your answers." />}
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-[2rem] border border-emerald-100 bg-white/85 p-6 shadow-lg">
            <SectionHeading eyebrow="Recently Completed" title="Your latest wins" description="Every correct challenge persists on this device." />
            <div className="mt-5 space-y-3">
              {recentQuestions.length ? recentQuestions.map(({ question, completedAt }) => (
                <div key={question.id} className="flex items-center gap-3 rounded-2xl bg-emerald-50 p-4">
                  <CheckCircle2 className="shrink-0 text-emerald-700" size={21} aria-hidden="true" />
                  <div className="min-w-0"><p className="truncate font-black">{question.title}</p><p className="text-sm text-slate-600">{question.category} · {new Date(completedAt).toLocaleDateString()}</p></div>
                </div>
              )) : <EmptyPanel icon="✅" text="Your completed challenges will appear here." />}
            </div>
          </div>

          <div className="rounded-[2rem] border border-blue-100 bg-white/85 p-6 shadow-lg">
            <SectionHeading eyebrow="Practice History" title="Sessions, scores, and accuracy" description="Score, time, topic, date, and earned XP stay available after refresh." />
            <HistoryTable history={state.history} />
          </div>
        </section>
      </div>
    </AppLayout>
  );
}

function PracticeSession({ session, question, answer, setAnswer, feedback, showHint, setShowHint, elapsedSeconds, favorite, note, setNote, noteStatus, onSaveNote, onToggleFavorite, onCheck, onNext, onLeave, draggedIndex, setDraggedIndex }: {
  session: ActivePracticeSession;
  question: PracticeQuestion;
  answer: PracticeAnswer;
  setAnswer: (answer: PracticeAnswer) => void;
  feedback: Feedback;
  showHint: boolean;
  setShowHint: (value: boolean) => void;
  elapsedSeconds: number;
  favorite: boolean;
  note: string;
  setNote: (value: string) => void;
  noteStatus: string;
  onSaveNote: () => void;
  onToggleFavorite: () => void;
  onCheck: () => void;
  onNext: () => void;
  onLeave: () => void;
  draggedIndex: number | null;
  setDraggedIndex: (index: number | null) => void;
}) {
  const progress = Math.round(((session.currentIndex + (feedback?.correct ? 1 : 0)) / session.questionIds.length) * 100);
  return (
    <div className="space-y-6 text-slate-950">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button type="button" onClick={onLeave} className="inline-flex items-center gap-2 font-black text-purple-800"><ArrowLeft size={18} aria-hidden="true" /> Exit session</button>
        <div className="flex items-center gap-3">
          {session.timerEnabled ? <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 font-mono font-bold shadow-sm"><Clock3 size={17} aria-hidden="true" /> {formatDuration(elapsedSeconds)}</span> : null}
          <span className="rounded-full bg-purple-100 px-4 py-2 text-sm font-black text-purple-800">Question {session.currentIndex + 1}/{session.questionIds.length}</span>
        </div>
      </div>

      <div className="h-3 overflow-hidden rounded-full bg-purple-100" role="progressbar" aria-label="Session progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><div className="h-full rounded-full bg-gradient-to-r from-purple-600 to-pink-500 transition-[width]" style={{ width: `${progress}%` }} /></div>

      <header className="rounded-[2rem] border border-white bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 p-7 shadow-lg sm:p-9">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="max-w-3xl">
            <div className="flex flex-wrap gap-2 text-sm font-bold"><Pill>{question.category}</Pill><Pill>{question.difficulty}</Pill><Pill>{question.type}</Pill><Pill>+{question.xpReward} XP once</Pill></div>
            <h1 className="mt-5 text-3xl font-black sm:text-4xl">{categoryMeta[question.category].icon} {question.title}</h1>
            <p className="mt-4 text-lg font-medium leading-8 text-slate-700">{question.prompt}</p>
          </div>
          <button type="button" onClick={onToggleFavorite} aria-pressed={favorite} className={`grid size-12 place-items-center rounded-2xl border shadow-sm transition ${favorite ? "border-pink-300 bg-pink-100 text-pink-700" : "border-white bg-white/80 text-slate-500 hover:text-pink-700"}`} aria-label={favorite ? "Remove from favorites" : "Add to favorites"}><Heart size={21} fill={favorite ? "currentColor" : "none"} /></button>
        </div>
      </header>

      <section className="rounded-[2rem] border border-purple-100 bg-white p-6 shadow-lg sm:p-8">
        {question.context ? <div className="mb-6 rounded-2xl border border-blue-100 bg-blue-50 p-5"><p className="text-sm font-black uppercase tracking-wider text-blue-800">Dashboard / case context</p><p className="mt-2 font-semibold leading-7 text-slate-800">{question.context}</p></div> : null}
        <QuestionInput question={question} answer={answer} setAnswer={setAnswer} disabled={feedback?.correct === true} draggedIndex={draggedIndex} setDraggedIndex={setDraggedIndex} />
        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" onClick={onCheck} disabled={feedback?.correct === true} className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-purple-700 px-6 font-black text-white transition hover:bg-purple-800 disabled:cursor-not-allowed disabled:bg-emerald-600"><CheckCircle2 size={19} aria-hidden="true" /> {feedback?.correct ? "Correct" : "Check answer"}</button>
          <button type="button" onClick={() => { playClickSound(); setShowHint(!showHint); }} className="inline-flex min-h-12 items-center gap-2 rounded-2xl border border-amber-300 bg-amber-50 px-5 font-black text-amber-900"><Lightbulb size={19} aria-hidden="true" /> {showHint ? "Hide hint" : "Hint"}</button>
          {!feedback?.correct ? <button type="button" onClick={() => setAnswer(answerForQuestion(question))} className="inline-flex min-h-12 items-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 font-black text-slate-700"><RotateCcw size={18} aria-hidden="true" /> Reset</button> : null}
        </div>
        {showHint ? <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-5 leading-7 text-amber-950"><strong>Hint:</strong> {question.hint}</div> : null}
        {feedback ? <div role="status" aria-live="polite" className={`mt-5 rounded-2xl border p-5 ${feedback.correct ? "border-emerald-300 bg-emerald-50 text-emerald-950" : "border-rose-300 bg-rose-50 text-rose-950"}`}><p className="font-black">{feedback.message}</p><p className="mt-2 leading-7"><strong>Explanation:</strong> {question.explanation}</p>{feedback.correct ? <button type="button" onClick={onNext} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 font-black text-white">{session.currentIndex === session.questionIds.length - 1 ? "View results" : "Next challenge"}<ArrowRight size={18} aria-hidden="true" /></button> : <p className="mt-3 font-bold">Edit your answer above and check again.</p>}</div> : null}
      </section>

      <section className="rounded-[2rem] border border-pink-100 bg-white/85 p-6 shadow-md">
        <div className="flex flex-col gap-4 md:flex-row md:items-end">
          <label className="block flex-1"><span className="mb-2 block font-black">Practice note</span><textarea value={note} onChange={(event) => setNote(event.target.value)} rows={3} placeholder="Save a takeaway, formula, or reminder…" className="w-full rounded-2xl border border-slate-300 p-4 outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100" /></label>
          <button type="button" onClick={onSaveNote} className="min-h-12 rounded-2xl border border-purple-200 bg-purple-50 px-5 font-black text-purple-800">Save note</button>
        </div>
        <p className="mt-2 min-h-5 text-sm font-semibold text-emerald-700" aria-live="polite">{noteStatus}</p>
      </section>
    </div>
  );
}

function QuestionInput({ question, answer, setAnswer, disabled, draggedIndex, setDraggedIndex }: { question: PracticeQuestion; answer: PracticeAnswer; setAnswer: (answer: PracticeAnswer) => void; disabled: boolean; draggedIndex: number | null; setDraggedIndex: (index: number | null) => void }) {
  if (question.type === "Match the Columns") {
    const matches = !Array.isArray(answer) && typeof answer === "object" ? answer : {};
    const rightOptions = question.pairs?.map((pair) => pair.right) ?? [];
    return <div><p className="mb-4 font-black">Match each item</p><div className="space-y-3">{question.pairs?.map((pair) => <div key={pair.left} className="grid items-center gap-3 rounded-2xl border border-purple-100 bg-purple-50/40 p-4 sm:grid-cols-[0.8fr_auto_1.2fr]"><span className="font-black">{pair.left}</span><ArrowRight className="hidden text-purple-500 sm:block" size={18} aria-hidden="true" /><select disabled={disabled} value={matches[pair.left] ?? ""} onChange={(event) => setAnswer({ ...matches, [pair.left]: event.target.value })} className="min-h-11 rounded-xl border border-slate-300 bg-white px-3 font-semibold"><option value="">Choose a match</option>{rightOptions.map((option) => <option key={option}>{option}</option>)}</select></div>)}</div></div>;
  }

  if (question.type === "Drag & Drop Ordering") {
    const items = Array.isArray(answer) ? answer : [];
    function move(from: number, to: number) {
      if (to < 0 || to >= items.length) return;
      const next = [...items];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      setAnswer(next);
    }
    return <div><p className="mb-4 font-black">Drag to reorder <span className="font-medium text-slate-500">(or use the arrow buttons)</span></p><ol className="space-y-3">{items.map((item, index) => <li key={item} draggable={!disabled} onDragStart={() => setDraggedIndex(index)} onDragOver={(event) => event.preventDefault()} onDrop={() => { if (draggedIndex !== null) move(draggedIndex, index); setDraggedIndex(null); }} className="flex items-center gap-3 rounded-2xl border border-purple-200 bg-purple-50 p-4 shadow-sm"><GripVertical className="shrink-0 cursor-grab text-purple-500" size={20} aria-hidden="true" /><span className="grid size-8 shrink-0 place-items-center rounded-full bg-purple-700 font-black text-white">{index + 1}</span><span className="flex-1 font-bold">{item}</span><button type="button" disabled={disabled || index === 0} onClick={() => move(index, index - 1)} className="grid size-9 place-items-center rounded-xl bg-white text-purple-800 disabled:opacity-30" aria-label={`Move ${item} up`}><ArrowUp size={17} /></button><button type="button" disabled={disabled || index === items.length - 1} onClick={() => move(index, index + 1)} className="grid size-9 place-items-center rounded-xl bg-white text-purple-800 disabled:opacity-30" aria-label={`Move ${item} down`}><ArrowDown size={17} /></button></li>)}</ol></div>;
  }

  if (question.options) {
    const selected = typeof answer === "string" ? answer : "";
    return <fieldset className="space-y-3"><legend className="mb-4 font-black">Choose the strongest answer</legend>{question.options.map((option) => <label key={option} className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${selected === option ? "border-purple-500 bg-purple-50" : "border-slate-200 hover:bg-purple-50/50"}`}><input type="radio" disabled={disabled} checked={selected === option} onChange={() => setAnswer(option)} className="mt-1 size-4 accent-purple-700" /><span className="font-semibold leading-7">{option}</span></label>)}</fieldset>;
  }

  const value = typeof answer === "string" ? answer : "";
  const code = question.type === "SQL Query" || question.type === "Python Coding";
  return <label className="block"><span className="mb-3 block font-black">{question.type === "Formula Writing" ? "Your formula" : code ? "Your code" : "Your answer"}</span>{code ? <textarea disabled={disabled} value={value} onChange={(event) => setAnswer(event.target.value)} rows={7} spellCheck={false} placeholder={question.type === "SQL Query" ? "SELECT ..." : "# Write Python code"} className="w-full rounded-2xl border-2 border-slate-700 bg-slate-950 p-5 font-mono text-sm leading-7 text-emerald-200 outline-none focus:border-purple-500" /> : <input disabled={disabled} value={value} onChange={(event) => setAnswer(event.target.value)} placeholder={question.type === "Formula Writing" ? "=..." : "Type the missing answer"} className="min-h-14 w-full rounded-2xl border-2 border-slate-300 px-5 font-mono font-semibold outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100" />}</label>;
}

function CompletionView({ entry, onHome, onNext }: { entry: PracticeHistoryEntry; onHome: () => void; onNext: () => void }) {
  return <div className="mx-auto max-w-4xl space-y-6 text-center"><section className="relative overflow-hidden rounded-[2.5rem] border border-white bg-gradient-to-br from-emerald-100 via-pink-100 to-purple-100 p-8 shadow-xl sm:p-12"><span className="text-6xl" aria-hidden="true">🏆</span><p className="mt-5 text-sm font-black uppercase tracking-[0.2em] text-purple-700">Session complete</p><h1 className="mt-2 text-4xl font-black sm:text-5xl">Beautiful work!</h1><p className="mx-auto mt-4 max-w-xl text-lg leading-8 text-slate-700">Your result is saved, recommendations are updated, and earned XP has been protected from repeat rewards.</p><div className="mt-8 grid gap-4 sm:grid-cols-4"><ResultStat icon={<Target />} value={`${entry.score}/${entry.questionCount}`} label="Score" /><ResultStat icon={<BarChart3 />} value={`${entry.accuracy}%`} label="Accuracy" /><ResultStat icon={<Clock3 />} value={formatDuration(entry.time)} label="Time" /><ResultStat icon={<Zap />} value={`+${entry.xpEarned}`} label="XP earned" /></div></section><div className="flex flex-wrap justify-center gap-3"><button type="button" onClick={onHome} className="inline-flex min-h-12 items-center gap-2 rounded-2xl border border-purple-200 bg-white px-6 font-black text-purple-800"><ArrowLeft size={18} /> Practice home</button><button type="button" onClick={onNext} className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-purple-700 px-6 font-black text-white">Next challenge <ArrowRight size={18} /></button></div></div>;
}

function QuestionCard({ question, completed, favorite, onFavorite, onStart }: { question: PracticeQuestion; completed: boolean; favorite: boolean; onFavorite: () => void; onStart: () => void }) {
  return <article className="rounded-3xl border border-purple-100 bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><span className="text-3xl" aria-hidden="true">{categoryMeta[question.category].icon}</span><button type="button" onClick={onFavorite} aria-label={favorite ? "Remove favorite" : "Add favorite"} className="text-pink-600"><Heart size={19} fill={favorite ? "currentColor" : "none"} /></button></div><h3 className="mt-3 text-lg font-black">{question.title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{question.topic} · {question.type}</p><div className="mt-4 flex items-center justify-between gap-3"><span className={`text-sm font-black ${completed ? "text-emerald-700" : "text-amber-700"}`}>{completed ? "Completed" : `+${question.xpReward} XP`}</span><button type="button" onClick={onStart} className="rounded-xl bg-purple-700 px-4 py-2 text-sm font-black text-white">Start</button></div></article>;
}

function CompactQuestion({ question, badge, onStart }: { question: PracticeQuestion; badge: string; onStart: () => void }) {
  return <button type="button" onClick={onStart} className="flex w-full items-center gap-4 rounded-2xl border border-pink-100 bg-pink-50/50 p-4 text-left transition hover:bg-pink-100"><span className="text-2xl" aria-hidden="true">{categoryMeta[question.category].icon}</span><div className="min-w-0 flex-1"><p className="truncate font-black">{question.title}</p><p className="mt-1 text-sm text-slate-600">{question.category} · {question.topic}</p></div><span className="rounded-full bg-white px-3 py-1 text-xs font-black text-purple-800">{badge}</span></button>;
}

function HistoryTable({ history }: { history: PracticeHistoryEntry[] }) {
  if (!history.length) return <div className="mt-5"><EmptyPanel icon="📈" text="Complete your first session to begin practice history." /></div>;
  return <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200"><table className="min-w-full text-left text-sm"><thead className="bg-slate-900 text-white"><tr>{["Date", "Topic", "Score", "Accuracy", "Time", "XP"].map((heading) => <th key={heading} className="whitespace-nowrap px-4 py-3">{heading}</th>)}</tr></thead><tbody className="divide-y divide-slate-200">{[...history].reverse().slice(0, 8).map((entry) => <tr key={entry.id}><td className="whitespace-nowrap px-4 py-3">{new Date(entry.date).toLocaleDateString()}</td><td className="min-w-40 px-4 py-3 font-bold">{entry.topic}</td><td className="whitespace-nowrap px-4 py-3">{entry.score}/{entry.questionCount}</td><td className="whitespace-nowrap px-4 py-3">{entry.accuracy}%</td><td className="whitespace-nowrap px-4 py-3">{formatDuration(entry.time)}</td><td className="whitespace-nowrap px-4 py-3 font-black text-purple-800">+{entry.xpEarned}</td></tr>)}</tbody></table></div>;
}

function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) { return <div><p className="text-sm font-black uppercase tracking-[0.16em] text-purple-700">{eyebrow}</p><h2 className="mt-1 text-3xl font-black">{title}</h2><p className="mt-2 leading-7 text-slate-600">{description}</p></div>; }
function HeaderStat({ value, label }: { value: string | number; label: string }) { return <div className="min-w-20 text-center"><p className="text-2xl font-black text-purple-800">{value}</p><p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p></div>; }
function Pill({ children }: { children: React.ReactNode }) { return <span className="rounded-full bg-white/85 px-3 py-1.5 text-slate-700 shadow-sm">{children}</span>; }
function EmptyPanel({ icon, text }: { icon: string; text: string }) { return <div className="rounded-2xl border border-dashed border-purple-200 bg-purple-50/50 p-6 text-center"><span className="text-3xl" aria-hidden="true">{icon}</span><p className="mt-2 font-semibold leading-6 text-slate-600">{text}</p></div>; }
function ResultStat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) { return <div className="rounded-3xl border border-white bg-white/75 p-5 shadow-sm"><div className="mx-auto grid size-10 place-items-center rounded-2xl bg-purple-100 text-purple-700">{icon}</div><p className="mt-3 text-2xl font-black">{value}</p><p className="text-sm font-bold text-slate-500">{label}</p></div>; }
