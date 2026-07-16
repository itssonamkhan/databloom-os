"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  Check,
  CheckCircle2,
  Clock3,
  Heart,
  Lightbulb,
  MessageSquareText,
  Play,
  RotateCcw,
  Sparkles,
  Star,
  Target,
  Timer,
  Zap,
} from "lucide-react";

import AppLayout from "@/components/layout/AppLayout";
import StudioFilterToolbar from "@/components/studio/StudioFilterToolbar";
import { useProgress } from "@/context/ProgressContext";
import {
  abandonMockInterview,
  advanceMockInterview,
  completeMockInterview,
  getInterviewSummary,
  getRecommendedInterviewQuestions,
  INTERVIEW_HUB_EVENT,
  loadInterviewHubState,
  markInterviewQuestionLearned,
  recordMockResponse,
  saveInterviewNote,
  startMockInterview,
  toggleInterviewFavorite,
  toggleResumeChecklistItem,
  type ActiveMockInterview,
  type InterviewHubState,
  type MockInterviewHistory,
} from "@/lib/interviewHub";
import {
  getInterviewQuestion,
  interviewCategories,
  interviewDifficulties,
  interviewQuestions,
  resumeReviewSections,
  type InterviewCategory,
  type InterviewDifficulty,
  type InterviewQuestion,
} from "@/lib/interviewQuestions";
import {
  playClickSound,
  playSuccessSound,
  playXPSound,
} from "@/lib/sounds";
import { registerStudyActivity } from "@/lib/studyActivity";

type View = "home" | "question" | "mock" | "complete";

const PAGE_SIZE = 12;

const categoryMeta: Record<
  InterviewCategory,
  { icon: string; className: string; description: string }
> = {
  Excel: { icon: "📗", className: "from-emerald-50 to-lime-100 border-emerald-200", description: "Formulas, lookups, pivots, cleaning, and workbook performance." },
  SQL: { icon: "🗄️", className: "from-sky-50 to-blue-100 border-sky-200", description: "Queries, joins, windows, aggregation, and optimization." },
  Python: { icon: "🐍", className: "from-cyan-50 to-amber-50 border-cyan-200", description: "Python, Pandas, testing, and analytical performance." },
  Statistics: { icon: "📐", className: "from-rose-50 to-fuchsia-100 border-rose-200", description: "Probability, testing, regression, and experiments." },
  "Power BI": { icon: "📊", className: "from-amber-50 to-yellow-100 border-amber-200", description: "Modeling, DAX, security, visual design, and performance." },
  Tableau: { icon: "🎨", className: "from-violet-50 to-sky-100 border-violet-200", description: "Calculations, LODs, dashboards, and workbook tuning." },
  "Power Query": { icon: "🧹", className: "from-teal-50 to-emerald-100 border-teal-200", description: "Imports, types, cleaning, combining data, and M." },
  "Business Analytics": { icon: "💼", className: "from-indigo-50 to-pink-100 border-indigo-200", description: "KPIs, requirements, root causes, cohorts, and storytelling." },
  "HR Interview": { icon: "🤝", className: "from-pink-50 to-rose-100 border-pink-200", description: "Behavioural stories, strengths, conflict, leadership, and salary." },
  "Data Analyst Projects": { icon: "🧭", className: "from-blue-50 to-purple-100 border-blue-200", description: "Scoping, quality, EDA, validation, and delivery." },
  "Resume & Portfolio": { icon: "📄", className: "from-slate-50 to-purple-100 border-slate-200", description: "ATS, portfolio, GitHub, LinkedIn, and project stories." },
};

function emptyState(): InterviewHubState {
  return {
    version: 1,
    learnedQuestionIds: [],
    rewardedQuestionIds: [],
    favoriteQuestionIds: [],
    notes: {},
    practicedAt: {},
    questionRatings: {},
    mockHistory: [],
    activeMock: null,
    checklistCompletedIds: [],
  };
}

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const rest = Math.floor(seconds % 60);
  return `${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
}

export default function InterviewHub() {
  const { addXP } = useProgress();
  const [hydrated, setHydrated] = useState(false);
  const [state, setState] = useState<InterviewHubState>(emptyState);
  const [view, setView] = useState<View>("home");
  const [selectedQuestionId, setSelectedQuestionId] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<InterviewCategory | "All">("All");
  const [difficulty, setDifficulty] = useState<InterviewDifficulty | "All">("All");
  const [page, setPage] = useState(1);
  const [mockCategory, setMockCategory] = useState<InterviewCategory | "All">("All");
  const [mockTopic, setMockTopic] = useState("All");
  const [mockDifficulty, setMockDifficulty] = useState<InterviewDifficulty | "All">("All");
  const [mockCount, setMockCount] = useState(5);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [completion, setCompletion] = useState<MockInterviewHistory | null>(null);

  const sync = useCallback(() => {
    const latest = loadInterviewHubState();
    setState(latest);
    return latest;
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const latest = sync();
      setView(latest.activeMock ? "mock" : "home");
      setHydrated(true);
    });
    window.addEventListener(INTERVIEW_HUB_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener(INTERVIEW_HUB_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [sync]);

  const activeMock = state.activeMock;
  useEffect(() => {
    if (!activeMock || view !== "mock") return;
    const tick = () => {
      const startedAt = new Date(activeMock.startedAt).getTime();
      setElapsedSeconds(Math.max(0, Math.floor((Date.now() - startedAt) / 1000)));
    };
    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, [activeMock, view]);

  const summary = useMemo(() => getInterviewSummary(state), [state]);
  const selectedQuestion = getInterviewQuestion(selectedQuestionId) ?? null;
  const recommended = useMemo(
    () => getRecommendedInterviewQuestions(state).slice(0, 4),
    [state],
  );
  const recentlyPracticed = useMemo(
    () =>
      Object.entries(state.practicedAt)
        .sort(([, left], [, right]) => right.localeCompare(left))
        .map(([id, date]) => ({ question: getInterviewQuestion(id), date }))
        .filter(
          (item): item is { question: InterviewQuestion; date: string } =>
            Boolean(item.question),
        )
        .slice(0, 4),
    [state.practicedAt],
  );
  const savedQuestions = useMemo(
    () =>
      state.favoriteQuestionIds
        .map(getInterviewQuestion)
        .filter((question): question is InterviewQuestion => Boolean(question))
        .slice(0, 4),
    [state.favoriteQuestionIds],
  );
  const filteredQuestions = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    return interviewQuestions.filter(
      (question) =>
        (category === "All" || question.category === category) &&
        (difficulty === "All" || question.difficulty === difficulty) &&
        (!normalized ||
          [question.question, question.topic, question.category].some((value) =>
            value.toLocaleLowerCase().includes(normalized),
          )),
    );
  }, [category, difficulty, query]);
  const pageCount = Math.max(1, Math.ceil(filteredQuestions.length / PAGE_SIZE));
  const visibleQuestions = filteredQuestions.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );
  const mockTopics = useMemo(
    () =>
      Array.from(
        new Set(
          interviewQuestions
            .filter(
              (question) =>
                mockCategory === "All" || question.category === mockCategory,
            )
            .map((question) => question.topic),
        ),
      ).sort(),
    [mockCategory],
  );

  function openQuestion(question: InterviewQuestion) {
    playClickSound();
    setSelectedQuestionId(question.id);
    setView("question");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleMarkLearned(question: InterviewQuestion) {
    playClickSound();
    const result = markInterviewQuestionLearned(question.id);
    if (!result.saved) return;
    if (result.newlyRewarded) {
      addXP(result.xpAward);
      registerStudyActivity({ kind: "lesson", source: `interview-question:${question.id}`, minutes: 1, xp: result.xpAward });
      playXPSound();
    } else {
      playSuccessSound();
    }
    sync();
  }

  function beginMock() {
    playClickSound();
    const started = startMockInterview({
      category: mockCategory,
      topic: mockTopic,
      difficulty: mockDifficulty,
      questionCount: mockCount,
    });
    if (!started) return;
    setCompletion(null);
    setElapsedSeconds(0);
    sync();
    setView("mock");
  }

  function finishMock() {
    const result = completeMockInterview(elapsedSeconds);
    if (!result.completed || !result.entry) return;
    registerStudyActivity({
      kind: "practice",
      source: `mock-interview:${result.entry.id}`,
      minutes: Math.max(1, Math.round(elapsedSeconds / 60)),
      xp: result.entry.xpEarned,
    });
    playSuccessSound();
    setCompletion(result.entry);
    sync();
    setView("complete");
  }

  if (!hydrated) {
    return (
      <AppLayout>
        <div className="grid min-h-[55vh] place-items-center rounded-3xl border border-purple-100 bg-white/75 text-center shadow-lg">
          <div><span className="text-5xl" aria-hidden="true">🎤</span><p className="mt-4 font-black text-purple-800">Preparing Interview Hub…</p></div>
        </div>
      </AppLayout>
    );
  }

  if (view === "question" && selectedQuestion) {
    return (
      <AppLayout>
        <QuestionDetail
          question={selectedQuestion}
          learned={state.learnedQuestionIds.includes(selectedQuestion.id)}
          favorite={state.favoriteQuestionIds.includes(selectedQuestion.id)}
          note={state.notes[selectedQuestion.id] ?? ""}
          onBack={() => { playClickSound(); setView("home"); }}
          onLearn={() => handleMarkLearned(selectedQuestion)}
          onFavorite={() => { playClickSound(); toggleInterviewFavorite(selectedQuestion.id); sync(); }}
          onSaveNote={(note) => { saveInterviewNote(selectedQuestion.id, note); sync(); }}
        />
      </AppLayout>
    );
  }

  const currentMockQuestion = activeMock
    ? getInterviewQuestion(activeMock.questionIds[activeMock.currentIndex]) ?? null
    : null;
  if (view === "mock" && activeMock && currentMockQuestion) {
    return (
      <AppLayout>
        <MockInterviewView
          key={currentMockQuestion.id}
          activeMock={activeMock}
          question={currentMockQuestion}
          elapsedSeconds={elapsedSeconds}
          onRecord={(answer, rating) => {
            const result = recordMockResponse(currentMockQuestion.id, answer, rating);
            if (result.newlyRewarded) {
              addXP(result.xpAward);
              playXPSound();
            } else {
              playSuccessSound();
            }
            sync();
            return result.xpAward;
          }}
          onNext={() => {
            playClickSound();
            if (activeMock.currentIndex >= activeMock.questionIds.length - 1) {
              finishMock();
            } else {
              advanceMockInterview();
              sync();
            }
          }}
          onExit={() => {
            playClickSound();
            abandonMockInterview();
            sync();
            setView("home");
          }}
        />
      </AppLayout>
    );
  }

  if (view === "complete" && completion) {
    return (
      <AppLayout>
        <MockCompletion
          entry={completion}
          onHome={() => { playClickSound(); setView("home"); }}
          onAgain={beginMock}
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
              <p className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-bold text-purple-800 shadow-sm"><Sparkles size={17} aria-hidden="true" /> Interview preparation across eleven paths</p>
              <h1 className="mt-4 text-4xl font-black tracking-tight text-purple-900 sm:text-5xl">🎤 Interview Hub</h1>
              <p className="mt-3 max-w-2xl text-base font-medium leading-7 text-slate-700 sm:text-lg">Build confident answers, rehearse under time pressure, and turn your projects into interview-ready stories.</p>
            </div>
            <div className="grid grid-cols-2 gap-3 rounded-3xl border border-white bg-white/70 p-4 shadow-sm sm:grid-cols-4">
              <HeaderStat value={summary.learned} label="Learned" />
              <HeaderStat value={summary.favorites} label="Saved" />
              <HeaderStat value={summary.sessions} label="Mocks" />
              <HeaderStat value={`${summary.averageScore}%`} label="Score" />
            </div>
          </div>
        </header>

        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <article className="rounded-[2rem] border border-purple-200 bg-gradient-to-br from-purple-50 via-white to-pink-50 p-6 shadow-lg sm:p-8">
            <div className="flex items-start gap-4"><div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-purple-700 text-white"><Timer size={23} /></div><div><p className="text-sm font-black uppercase tracking-[0.16em] text-purple-700">Mock interview</p><h2 className="mt-1 text-3xl font-black">Practice real interview pressure</h2><p className="mt-2 leading-7 text-slate-700">Get a random question set, timed delivery, self-scoring, one-time XP, and a focused feedback summary.</p></div></div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Select label="Topic category" value={mockCategory} onChange={(value) => { setMockCategory(value as InterviewCategory | "All"); setMockTopic("All"); }} options={interviewCategories} />
              <Select label="Topic" value={mockTopic} onChange={setMockTopic} options={mockTopics} />
              <Select label="Difficulty" value={mockDifficulty} onChange={(value) => setMockDifficulty(value as InterviewDifficulty | "All")} options={interviewDifficulties} />
              <Select label="Questions" value={String(mockCount)} onChange={(value) => setMockCount(Number(value))} options={["5", "7", "10"]} includeAll={false} />
            </div>
            <button type="button" onClick={beginMock} className="mt-5 inline-flex min-h-12 items-center gap-2 rounded-2xl bg-purple-700 px-6 font-black text-white shadow-md transition hover:bg-purple-800"><Play size={19} /> Start random mock</button>
          </article>

          <article className="rounded-[2rem] border border-emerald-200 bg-white/85 p-6 shadow-lg sm:p-8">
            <div className="flex items-center gap-3"><div className="grid size-11 place-items-center rounded-2xl bg-emerald-100 text-emerald-700"><BarChart3 size={22} /></div><div><p className="text-sm font-black uppercase tracking-wider text-emerald-700">Progress summary</p><h2 className="text-2xl font-black">Interview readiness</h2></div></div>
            <div className="mt-6 h-4 overflow-hidden rounded-full bg-emerald-100" role="progressbar" aria-label="Interview library progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={summary.progressPercentage}><div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-purple-600" style={{ width: `${summary.progressPercentage}%` }} /></div>
            <p className="mt-3 font-bold text-slate-700">{summary.learned} of {interviewQuestions.length} questions learned · {summary.progressPercentage}%</p>
            <div className="mt-5 grid grid-cols-2 gap-3"><MiniStat label="Mock average" value={`${summary.averageScore}%`} /><MiniStat label="Checklist" value={`${summary.checklistCompleted}/${summary.checklistTotal}`} /></div>
          </article>
        </section>

        <Link
          href="/practice-lab"
          onClick={playClickSound}
          className="group flex min-h-20 flex-col justify-center rounded-[2rem] border border-fuchsia-200 bg-gradient-to-r from-fuchsia-50 via-white to-purple-50 px-6 py-5 shadow-md transition hover:-translate-y-0.5 hover:shadow-lg sm:flex-row sm:items-center sm:justify-between sm:gap-5"
        >
          <span>
            <span className="block text-sm font-black uppercase tracking-[0.16em] text-fuchsia-700">
              Build confidence before the interview
            </span>
            <span className="mt-1 block text-xl font-black text-slate-950">
              Need more practice? Open Practice Lab
            </span>
          </span>
          <span className="mt-3 inline-flex shrink-0 items-center gap-2 font-black text-purple-800 sm:mt-0">
            Start practicing
            <ArrowRight className="transition group-hover:translate-x-1" size={18} aria-hidden="true" />
          </span>
        </Link>

        <Link
          href="/career-hub"
          onClick={playClickSound}
          className="flex min-h-16 items-center justify-between gap-4 rounded-3xl border border-emerald-200 bg-emerald-50/80 px-6 py-4 font-black text-emerald-900 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <span>🌱 Turn interview preparation into a career plan</span>
          <span className="inline-flex items-center gap-2">Open Career Hub <ArrowRight size={17} /></span>
        </Link>

        <Link
          href="/flashcards"
          onClick={playClickSound}
          className="flex min-h-16 items-center justify-between gap-4 rounded-3xl border border-pink-200 bg-pink-50/80 px-6 py-4 font-black text-pink-900 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <span>🧠 Turn interview answers into lasting recall</span>
          <span className="inline-flex items-center gap-2">Open Flashcards <ArrowRight size={17} /></span>
        </Link>

        {state.activeMock ? (
          <section className="rounded-[2rem] border border-sky-200 bg-sky-50 p-6 shadow-md sm:flex sm:items-center sm:justify-between sm:gap-5">
            <div><p className="font-black text-sky-900">Continue mock interview</p><p className="mt-1 text-slate-700">Question {state.activeMock.currentIndex + 1} of {state.activeMock.questionIds.length} · your progress is saved.</p></div>
            <button type="button" onClick={() => { playClickSound(); setView("mock"); }} className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-sky-700 px-5 py-3 font-black text-white sm:mt-0">Continue <ArrowRight size={18} /></button>
          </section>
        ) : null}

        <section className="grid gap-6 xl:grid-cols-3">
          <HomeList title="Recommended questions" eyebrow="Recommended" icon={<Target size={20} />} empty="Recommendations appear here." questions={recommended} state={state} onOpen={openQuestion} />
          <HomeList title="Recently practiced" eyebrow="Recent" icon={<Clock3 size={20} />} empty="Open or learn a question to start your history." questions={recentlyPracticed.map((item) => item.question)} state={state} onOpen={openQuestion} />
          <HomeList title="Saved questions" eyebrow="Favorites" icon={<Heart size={20} />} empty="Favorite questions to build a review list." questions={savedQuestions} state={state} onOpen={openQuestion} />
        </section>

        <section>
          <SectionHeading eyebrow="Interview categories" title="Prepare across every hiring stage" description="Technical, behavioural, project, and career materials in one shared hub." />
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {interviewCategories.map((item) => {
              const meta = categoryMeta[item];
              const total = interviewQuestions.filter((question) => question.category === item).length;
              const learned = interviewQuestions.filter((question) => question.category === item && state.learnedQuestionIds.includes(question.id)).length;
              return <button key={item} type="button" onClick={() => { playClickSound(); setCategory(item); setPage(1); document.getElementById("question-library")?.scrollIntoView({ behavior: "smooth" }); }} className={`rounded-3xl border bg-gradient-to-br p-5 text-left shadow-md transition hover:-translate-y-1 hover:shadow-xl ${meta.className}`}><span className="text-3xl">{meta.icon}</span><h3 className="mt-3 text-xl font-black">{item}</h3><p className="mt-2 min-h-12 text-sm leading-6 text-slate-700">{meta.description}</p><p className="mt-3 text-sm font-black text-purple-800">{learned}/{total} learned</p></button>;
            })}
          </div>
        </section>

        <section id="question-library" className="rounded-[2rem] border border-purple-100 bg-white/80 p-5 shadow-lg sm:p-7">
          <SectionHeading eyebrow="Question library" title={`${interviewQuestions.length} interview questions by topic`} description="Every question includes layered explanations, mistakes, follow-ups, a real interview tip, notes, favorites, and protected XP." />
          <div className="mt-5">
            <StudioFilterToolbar
              query={query}
              onQueryChange={(value) => { setQuery(value); setPage(1); }}
              category={category}
              onCategoryChange={(value) => { setCategory(value as InterviewCategory | "All"); setPage(1); }}
              categories={interviewCategories}
              difficulty={difficulty}
              onDifficultyChange={(value) => { setDifficulty(value as InterviewDifficulty | "All"); setPage(1); }}
              difficulties={interviewDifficulties}
              resultCount={filteredQuestions.length}
              searchPlaceholder="Search questions or topics"
              heading="Find an interview question"
            />
          </div>
          {visibleQuestions.length ? <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{visibleQuestions.map((question) => <QuestionCard key={question.id} question={question} learned={state.learnedQuestionIds.includes(question.id)} favorite={state.favoriteQuestionIds.includes(question.id)} onOpen={() => openQuestion(question)} onFavorite={() => { playClickSound(); toggleInterviewFavorite(question.id); sync(); }} />)}</div> : <EmptyPanel text="No interview questions match these filters." />}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3"><p className="text-sm font-bold text-slate-600">Page {page} of {pageCount}</p><div className="flex gap-2"><button type="button" disabled={page === 1} onClick={() => { setPage((current) => Math.max(1, current - 1)); window.scrollTo({ top: document.getElementById("question-library")?.offsetTop ?? 0, behavior: "smooth" }); }} className="rounded-xl border border-purple-200 bg-white px-4 py-2 font-black text-purple-800 disabled:opacity-40">Previous</button><button type="button" disabled={page === pageCount} onClick={() => { setPage((current) => Math.min(pageCount, current + 1)); window.scrollTo({ top: document.getElementById("question-library")?.offsetTop ?? 0, behavior: "smooth" }); }} className="rounded-xl bg-purple-700 px-4 py-2 font-black text-white disabled:opacity-40">Next</button></div></div>
        </section>

        <section className="rounded-[2rem] border border-amber-100 bg-white/85 p-6 shadow-lg sm:p-8">
          <SectionHeading eyebrow="Resume review" title="Application readiness checklist" description="Complete the ATS, portfolio, GitHub, LinkedIn, and project checks before applying." />
          <div className="mt-6 grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
            {resumeReviewSections.map((section) => <article key={section.id} className="rounded-3xl border border-amber-100 bg-amber-50/50 p-5"><div className="flex items-center gap-3"><span className="text-2xl">{section.icon}</span><h3 className="text-xl font-black">{section.title}</h3></div><div className="mt-4 space-y-3">{section.items.map((label, index) => { const id = `${section.id}-${index + 1}`; const checked = state.checklistCompletedIds.includes(id); return <label key={id} className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white bg-white/75 p-3"><input type="checkbox" checked={checked} onChange={() => { playClickSound(); toggleResumeChecklistItem(id); sync(); }} className="mt-1 size-4 accent-emerald-600" /><span className={`text-sm font-semibold leading-6 ${checked ? "text-slate-500 line-through" : "text-slate-800"}`}>{label}</span></label>; })}</div></article>)}
          </div>
        </section>
      </div>
    </AppLayout>
  );
}

function QuestionDetail({ question, learned, favorite, note, onBack, onLearn, onFavorite, onSaveNote }: { question: InterviewQuestion; learned: boolean; favorite: boolean; note: string; onBack: () => void; onLearn: () => void; onFavorite: () => void; onSaveNote: (note: string) => void }) {
  const [draft, setDraft] = useState(note);
  const [saved, setSaved] = useState("");
  return <div className="space-y-6 text-slate-950"><button type="button" onClick={onBack} className="inline-flex items-center gap-2 font-black text-purple-800"><ArrowLeft size={18} /> Back to Interview Hub</button><header className="rounded-[2rem] border border-white bg-gradient-to-br from-purple-100 via-pink-100 to-sky-100 p-7 shadow-lg sm:p-9"><div className="flex flex-wrap items-start justify-between gap-5"><div className="max-w-4xl"><div className="flex flex-wrap gap-2 text-sm font-bold"><Pill>{question.category}</Pill><Pill>{question.topic}</Pill><Pill>{question.difficulty}</Pill><Pill>+{question.xpReward} XP once</Pill></div><h1 className="mt-5 text-3xl font-black leading-tight sm:text-4xl">{question.question}</h1></div><button type="button" onClick={onFavorite} aria-pressed={favorite} className={`grid size-12 place-items-center rounded-2xl border shadow-sm ${favorite ? "border-pink-300 bg-pink-100 text-pink-700" : "border-white bg-white/80 text-slate-500"}`} aria-label={favorite ? "Remove saved question" : "Save question"}><Heart size={21} fill={favorite ? "currentColor" : "none"} /></button></div><button type="button" onClick={onLearn} className={`mt-6 inline-flex min-h-12 items-center gap-2 rounded-2xl px-6 font-black text-white ${learned ? "bg-emerald-700" : "bg-purple-700"}`}><CheckCircle2 size={19} /> {learned ? "Learned · review again" : `Mark learned · +${question.xpReward} XP`}</button></header><div className="grid gap-6 xl:grid-cols-2"><AnswerPanel icon={<MessageSquareText />} title="Ideal answer" tone="purple"><p>{question.idealAnswer}</p></AnswerPanel><AnswerPanel icon={<BookOpenCheck />} title="Beginner explanation" tone="emerald"><p>{question.beginnerExplanation}</p></AnswerPanel><AnswerPanel icon={<Sparkles />} title="Advanced explanation" tone="blue"><p>{question.advancedExplanation}</p></AnswerPanel><AnswerPanel icon={<Lightbulb />} title="Real interview tip" tone="amber"><p>{question.realInterviewTip}</p></AnswerPanel><AnswerPanel icon={<RotateCcw />} title="Common mistakes" tone="rose"><ul className="list-disc space-y-2 pl-5">{question.commonMistakes.map((item) => <li key={item}>{item}</li>)}</ul></AnswerPanel><AnswerPanel icon={<ArrowRight />} title="Follow-up questions" tone="sky"><ul className="space-y-3">{question.followUpQuestions.map((item) => <li key={item} className="rounded-xl bg-white/70 p-3 font-semibold">{item}</li>)}</ul></AnswerPanel></div><section className="rounded-[2rem] border border-pink-100 bg-white/85 p-6 shadow-md"><label className="block"><span className="mb-2 block font-black">Personal notes</span><textarea value={draft} onChange={(event) => { setDraft(event.target.value); setSaved(""); }} rows={5} placeholder="Save an example, talking point, or revision note…" className="w-full rounded-2xl border border-slate-300 p-4 outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100" /></label><button type="button" onClick={() => { playClickSound(); onSaveNote(draft); setSaved("Note saved on this device."); }} className="mt-3 rounded-xl bg-purple-700 px-5 py-3 font-black text-white">Save note</button><p className="mt-2 min-h-5 text-sm font-bold text-emerald-700" aria-live="polite">{saved}</p></section></div>;
}

function MockInterviewView({ activeMock, question, elapsedSeconds, onRecord, onNext, onExit }: { activeMock: ActiveMockInterview; question: InterviewQuestion; elapsedSeconds: number; onRecord: (answer: string, rating: number) => number; onNext: () => void; onExit: () => void }) {
  const previous = activeMock.responses[question.id];
  const [answer, setAnswer] = useState(previous?.answer ?? "");
  const [revealed, setRevealed] = useState(Boolean(previous));
  const [rating, setRating] = useState(previous?.rating ?? 0);
  const [xpAward, setXPAward] = useState(0);
  const progress = Math.round(((activeMock.currentIndex + (rating ? 1 : 0)) / activeMock.questionIds.length) * 100);
  return <div className="space-y-6 text-slate-950"><div className="flex flex-wrap items-center justify-between gap-4"><button type="button" onClick={onExit} className="inline-flex items-center gap-2 font-black text-purple-800"><ArrowLeft size={18} /> Exit mock</button><div className="flex gap-3"><span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 font-mono font-bold shadow-sm"><Clock3 size={17} /> {formatTime(elapsedSeconds)}</span><span className="rounded-full bg-purple-100 px-4 py-2 text-sm font-black text-purple-800">Question {activeMock.currentIndex + 1}/{activeMock.questionIds.length}</span></div></div><div className="h-3 overflow-hidden rounded-full bg-purple-100" role="progressbar" aria-label="Mock interview progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><div className="h-full rounded-full bg-gradient-to-r from-purple-600 to-pink-500" style={{ width: `${progress}%` }} /></div><header className="rounded-[2rem] border border-white bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 p-7 shadow-lg sm:p-9"><div className="flex flex-wrap gap-2 text-sm font-bold"><Pill>{question.category}</Pill><Pill>{question.topic}</Pill><Pill>{question.difficulty}</Pill></div><p className="mt-5 text-sm font-black uppercase tracking-[0.16em] text-purple-700">Interviewer asks</p><h1 className="mt-2 max-w-4xl text-3xl font-black leading-tight sm:text-4xl">{question.question}</h1></header><section className="rounded-[2rem] border border-purple-100 bg-white p-6 shadow-lg sm:p-8"><label className="block"><span className="mb-3 block font-black">Your answer notes</span><textarea value={answer} disabled={Boolean(rating)} onChange={(event) => setAnswer(event.target.value)} rows={7} placeholder="Outline your answer as if you were speaking…" className="w-full rounded-2xl border-2 border-slate-300 p-5 leading-7 outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 disabled:bg-slate-50" /></label>{!revealed ? <button type="button" onClick={() => { playClickSound(); setRevealed(true); }} className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-purple-700 px-5 py-3 font-black text-white"><BookOpenCheck size={18} /> Reveal ideal answer</button> : <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-5"><p className="font-black text-emerald-900">Ideal answer</p><p className="mt-2 leading-7 text-slate-800">{question.idealAnswer}</p><p className="mt-3 text-sm font-bold text-emerald-800">Tip: {question.realInterviewTip}</p></div>}{revealed && !rating ? <div className="mt-6"><p className="font-black">How strong was your answer?</p><div className="mt-3 flex flex-wrap gap-2">{[1, 2, 3, 4, 5].map((value) => <button key={value} type="button" onClick={() => { playClickSound(); const award = onRecord(answer, value); setRating(value); setXPAward(award); }} className="inline-flex items-center gap-1 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 font-black text-amber-900"><Star size={17} fill={value <= 3 ? "none" : "currentColor"} /> {value}</button>)}</div><p className="mt-2 text-sm text-slate-600">1 = needs structure · 3 = solid · 5 = interview ready</p></div> : null}{rating ? <div role="status" className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-5"><p className="font-black text-blue-900">Recorded: {rating}/5 · {xpAward ? `+${xpAward} XP` : "XP already awarded"}</p><p className="mt-2 leading-7 text-slate-700">{rating >= 4 ? "Strong answer. Keep the same clarity and evidence under time pressure." : rating === 3 ? "Solid foundation. Add a sharper example, decision, or measurable result." : "Review the ideal structure, then rehearse a shorter evidence-backed answer."}</p><button type="button" onClick={onNext} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-3 font-black text-white">{activeMock.currentIndex === activeMock.questionIds.length - 1 ? "Finish mock" : "Next question"}<ArrowRight size={18} /></button></div> : null}</section></div>;
}

function MockCompletion({ entry, onHome, onAgain }: { entry: MockInterviewHistory; onHome: () => void; onAgain: () => void }) { return <div className="mx-auto max-w-4xl space-y-6 text-center"><section className="rounded-[2.5rem] border border-white bg-gradient-to-br from-emerald-100 via-pink-100 to-purple-100 p-8 shadow-xl sm:p-12"><span className="text-6xl">🏆</span><p className="mt-5 text-sm font-black uppercase tracking-[0.2em] text-purple-700">Mock interview complete</p><h1 className="mt-2 text-4xl font-black sm:text-5xl">Interview practice saved</h1><div className="mt-8 grid gap-4 sm:grid-cols-4"><ResultStat icon={<Target />} value={`${entry.score}%`} label="Score" /><ResultStat icon={<MessageSquareText />} value={String(entry.questionCount)} label="Questions" /><ResultStat icon={<Clock3 />} value={formatTime(entry.time)} label="Time" /><ResultStat icon={<Zap />} value={`+${entry.xpEarned}`} label="XP" /></div><p className="mt-7 rounded-2xl bg-white/70 p-5 text-left font-semibold leading-7 text-slate-700">{entry.feedbackSummary}</p></section><div className="flex flex-wrap justify-center gap-3"><button type="button" onClick={onHome} className="inline-flex min-h-12 items-center gap-2 rounded-2xl border border-purple-200 bg-white px-6 font-black text-purple-800"><ArrowLeft size={18} /> Interview home</button><button type="button" onClick={onAgain} className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-purple-700 px-6 font-black text-white">New mock <RotateCcw size={18} /></button></div></div>; }

function HomeList({ title, eyebrow, icon, empty, questions, state, onOpen }: { title: string; eyebrow: string; icon: React.ReactNode; empty: string; questions: InterviewQuestion[]; state: InterviewHubState; onOpen: (question: InterviewQuestion) => void }) { return <article className="rounded-[2rem] border border-purple-100 bg-white/85 p-6 shadow-lg"><div className="flex items-center gap-3"><div className="grid size-10 place-items-center rounded-2xl bg-purple-100 text-purple-700">{icon}</div><div><p className="text-xs font-black uppercase tracking-wider text-purple-700">{eyebrow}</p><h2 className="text-xl font-black">{title}</h2></div></div><div className="mt-5 space-y-3">{questions.length ? questions.map((question) => <button key={question.id} type="button" onClick={() => onOpen(question)} className="flex w-full items-center gap-3 rounded-2xl border border-purple-100 bg-purple-50/50 p-3 text-left transition hover:bg-purple-100"><span className="text-xl">{categoryMeta[question.category].icon}</span><div className="min-w-0 flex-1"><p className="truncate font-black">{question.question}</p><p className="mt-1 text-xs font-semibold text-slate-600">{question.topic} · {question.difficulty}</p></div>{state.learnedQuestionIds.includes(question.id) ? <Check size={17} className="text-emerald-700" /> : <ArrowRight size={17} className="text-purple-700" />}</button>) : <EmptyPanel text={empty} compact />}</div></article>; }

function QuestionCard({ question, learned, favorite, onOpen, onFavorite }: { question: InterviewQuestion; learned: boolean; favorite: boolean; onOpen: () => void; onFavorite: () => void }) { return <article className="flex min-h-64 flex-col rounded-3xl border border-purple-100 bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><div className="flex flex-wrap gap-2 text-xs font-bold"><span className="rounded-full bg-purple-100 px-3 py-1 text-purple-800">{question.topic}</span><span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">{question.difficulty}</span></div><button type="button" onClick={onFavorite} aria-label={favorite ? "Remove saved question" : "Save question"} className="text-pink-600"><Heart size={19} fill={favorite ? "currentColor" : "none"} /></button></div><h3 className="mt-4 flex-1 text-lg font-black leading-7">{question.question}</h3><div className="mt-5 flex items-center justify-between gap-3"><span className={`text-sm font-black ${learned ? "text-emerald-700" : "text-amber-700"}`}>{learned ? "Learned" : `+${question.xpReward} XP`}</span><button type="button" onClick={onOpen} className="rounded-xl bg-purple-700 px-4 py-2 text-sm font-black text-white">Open answer</button></div></article>; }

function AnswerPanel({ icon, title, tone, children }: { icon: React.ReactNode; title: string; tone: "purple" | "emerald" | "blue" | "amber" | "rose" | "sky"; children: React.ReactNode }) { const colors = { purple: "border-purple-100 bg-purple-50/60 text-purple-800", emerald: "border-emerald-100 bg-emerald-50/60 text-emerald-800", blue: "border-blue-100 bg-blue-50/60 text-blue-800", amber: "border-amber-100 bg-amber-50/60 text-amber-800", rose: "border-rose-100 bg-rose-50/60 text-rose-800", sky: "border-sky-100 bg-sky-50/60 text-sky-800" }; return <section className={`rounded-[2rem] border p-6 shadow-sm ${colors[tone]}`}><div className="flex items-center gap-3"><div className="grid size-10 place-items-center rounded-2xl bg-white/80">{icon}</div><h2 className="text-xl font-black">{title}</h2></div><div className="mt-4 leading-7 text-slate-700">{children}</div></section>; }
function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) { return <div><p className="text-sm font-black uppercase tracking-[0.16em] text-purple-700">{eyebrow}</p><h2 className="mt-1 text-3xl font-black">{title}</h2><p className="mt-2 leading-7 text-slate-600">{description}</p></div>; }
function HeaderStat({ value, label }: { value: string | number; label: string }) { return <div className="min-w-20 text-center"><p className="text-2xl font-black text-purple-800">{value}</p><p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p></div>; }
function MiniStat({ label, value }: { label: string; value: string }) { return <div className="rounded-2xl bg-emerald-50 p-4"><p className="text-2xl font-black text-emerald-800">{value}</p><p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p></div>; }
function Pill({ children }: { children: React.ReactNode }) { return <span className="rounded-full bg-white/85 px-3 py-1.5 text-slate-700 shadow-sm">{children}</span>; }
function EmptyPanel({ text, compact = false }: { text: string; compact?: boolean }) { return <div className={`rounded-2xl border border-dashed border-purple-200 bg-purple-50/50 text-center ${compact ? "p-4" : "mt-6 p-10"}`}><p className="font-semibold text-slate-600">{text}</p></div>; }
function Select({ label, value, onChange, options, includeAll = true }: { label: string; value: string; onChange: (value: string) => void; options: readonly string[]; includeAll?: boolean }) { return <label><span className="mb-1.5 block text-xs font-black uppercase tracking-wide text-slate-600">{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} className="min-h-12 w-full rounded-2xl border border-purple-200 bg-white px-4 font-bold outline-none focus:border-purple-500">{includeAll ? <option value="All">All</option> : null}{options.filter((option) => !includeAll || option !== "All").map((option) => <option key={option} value={option}>{option}</option>)}</select></label>; }
function ResultStat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) { return <div className="rounded-3xl border border-white bg-white/75 p-5 shadow-sm"><div className="mx-auto grid size-10 place-items-center rounded-2xl bg-purple-100 text-purple-700">{icon}</div><p className="mt-3 text-2xl font-black">{value}</p><p className="text-sm font-bold text-slate-500">{label}</p></div>; }
