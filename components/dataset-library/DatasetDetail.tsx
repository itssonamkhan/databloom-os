"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  Download,
  Eye,
  Heart,
  NotebookPen,
  TableProperties,
} from "lucide-react";

import CompletionModal from "@/components/dashboard/CompletionModal";
import AppLayout from "@/components/layout/AppLayout";
import { useProgress } from "@/context/ProgressContext";
import type { DatasetLibraryItem } from "@/lib/datasetLibrary";
import {
  completeDatasetLibraryItem,
  DATASET_LIBRARY_PROGRESS_EVENT,
  getDatasetLibraryNote,
  loadDatasetLibraryProgress,
  saveDatasetLibraryNote,
  toggleDatasetLibraryFavorite,
} from "@/lib/datasetLibraryProgress";
import {
  playClickSound,
  playNotificationSound,
  playXPSound,
} from "@/lib/sounds";

type NotesStatus = "saved" | "saving" | "error";

export default function DatasetDetail({ dataset }: { dataset: DatasetLibraryItem }) {
  const router = useRouter();
  const { addXP } = useProgress();
  const initialProgress = loadDatasetLibraryProgress();
  const [completed, setCompleted] = useState(() =>
    initialProgress.completedLessonIds.includes(dataset.id),
  );
  const [favorite, setFavorite] = useState(() =>
    initialProgress.favoriteLessonIds.includes(dataset.id),
  );
  const [notes, setNotes] = useState(() => getDatasetLibraryNote(dataset.id));
  const [notesStatus, setNotesStatus] = useState<NotesStatus>("saved");
  const [showCompletion, setShowCompletion] = useState(false);

  useEffect(() => {
    const syncProgress = () => {
      const state = loadDatasetLibraryProgress();
      setCompleted(state.completedLessonIds.includes(dataset.id));
      setFavorite(state.favoriteLessonIds.includes(dataset.id));
    };
    window.addEventListener(DATASET_LIBRARY_PROGRESS_EVENT, syncProgress);
    window.addEventListener("storage", syncProgress);
    return () => {
      window.removeEventListener(DATASET_LIBRARY_PROGRESS_EVENT, syncProgress);
      window.removeEventListener("storage", syncProgress);
    };
  }, [dataset.id]);

  useEffect(() => {
    if (notesStatus !== "saving") return;
    const timer = window.setTimeout(() => {
      setNotesStatus(saveDatasetLibraryNote(dataset.id, notes) ? "saved" : "error");
    }, 450);
    return () => window.clearTimeout(timer);
  }, [dataset.id, notes, notesStatus]);

  function handleFavorite() {
    playClickSound();
    const next = toggleDatasetLibraryFavorite(dataset.id);
    const nextFavorite = next.favoriteLessonIds.includes(dataset.id);
    setFavorite(nextFavorite);
    if (nextFavorite) playNotificationSound();
  }

  function markCompleted() {
    playClickSound();
    const result = completeDatasetLibraryItem(dataset.id);
    setCompleted(result.state.completedLessonIds.includes(dataset.id));
    if (!result.newlyCompleted) return;
    addXP(dataset.xpReward);
    playXPSound();
    setShowCompletion(true);
  }

  return (
    <AppLayout>
      <div className="space-y-7 text-slate-950">
        <Link
          href="/dataset-library"
          onClick={playClickSound}
          className="inline-flex items-center gap-2 font-bold text-purple-800 transition hover:text-purple-950"
        >
          <ArrowLeft size={18} aria-hidden="true" /> Back to Dataset Library
        </Link>

        <header className="rounded-3xl border border-white/70 bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 p-7 shadow-lg sm:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <span className="text-6xl" aria-hidden="true">{dataset.icon}</span>
              <h1 className="mt-4 text-4xl font-black sm:text-5xl">{dataset.name}</h1>
              <p className="mt-4 text-lg leading-8 text-slate-700">
                {dataset.description}
              </p>
              <div className="mt-5 flex flex-wrap gap-2 text-sm font-bold">
                <Badge>{dataset.category}</Badge>
                <Badge>{dataset.difficulty}</Badge>
                <Badge>{dataset.rowCount} rows</Badge>
                <Badge>{dataset.columnCount} columns</Badge>
                <Badge>+{dataset.xpReward} XP</Badge>
                {completed ? <Badge>✓ Completed</Badge> : null}
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleFavorite}
                aria-pressed={favorite}
                className={`inline-flex items-center gap-2 rounded-xl border px-5 py-3 font-bold transition ${
                  favorite
                    ? "border-pink-300 bg-pink-100 text-pink-800"
                    : "border-purple-200 bg-white text-slate-800 hover:bg-purple-50"
                }`}
              >
                <Heart size={19} fill={favorite ? "currentColor" : "none"} aria-hidden="true" />
                {favorite ? "Favorited" : "Favorite"}
              </button>
              <a
                href={dataset.csvPath}
                download
                onClick={playClickSound}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white transition hover:bg-emerald-800"
              >
                <Download size={19} aria-hidden="true" /> Download CSV
              </a>
            </div>
          </div>
        </header>

        <InfoSection title="Business scenario" icon="🏢">
          <p className="text-lg font-semibold leading-8 text-slate-800">
            {dataset.businessScenario}
          </p>
        </InfoSection>

        <section className="rounded-3xl border border-purple-100 bg-white p-6 shadow-lg sm:p-8">
          <h2 className="flex items-center gap-2 text-2xl font-black text-purple-900">
            <TableProperties size={22} aria-hidden="true" /> Column descriptions
          </h2>
          <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-950 text-white">
                <tr>
                  <th scope="col" className="px-4 py-3">Column</th>
                  <th scope="col" className="px-4 py-3">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {dataset.columns.map((column) => (
                  <tr key={column.name}>
                    <th scope="row" className="whitespace-nowrap px-4 py-3 font-black text-purple-900">
                      {column.name}
                    </th>
                    <td className="px-4 py-3 leading-6 text-slate-700">
                      {column.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <ListSection title="Suggested questions" icon="❓" items={dataset.suggestedQuestions} />
          <ListSection title="Suggested dashboards" icon="📊" items={dataset.suggestedDashboards} />
        </section>

        <section className="rounded-3xl border border-sky-100 bg-sky-50/60 p-6 shadow-md sm:p-8">
          <h2 className="text-2xl font-black text-sky-950">Suggested SQL queries</h2>
          <div className="mt-5 space-y-3">
            {dataset.suggestedSQLQueries.map((query) => (
              <pre key={query} className="overflow-x-auto rounded-2xl bg-slate-950 p-4 text-sm leading-7 text-emerald-200">
                <code>{query}</code>
              </pre>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <ListSection title="Power BI visuals" icon="📈" items={dataset.suggestedPowerBIVisuals} />
          <ListSection title="Tableau dashboards" icon="📊" items={dataset.suggestedTableauDashboards} />
          <ListSection title="Python analysis" icon="🐍" items={dataset.suggestedPythonAnalysis} />
        </section>

        <section className="rounded-3xl border border-amber-100 bg-amber-50/60 p-6 shadow-md sm:p-8">
          <h2 className="flex items-center gap-2 text-2xl font-black text-amber-950">
            <BarChart3 size={22} aria-hidden="true" /> Recommended learning
          </h2>
          <p className="mt-3 leading-7 text-slate-700">
            This dataset pairs especially well with {dataset.recommendedStudio.name}.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            {dataset.relatedLessons.map((lesson) => (
              <Link
                key={lesson.title}
                href={lesson.href}
                onClick={playClickSound}
                className="rounded-xl border border-amber-200 bg-white px-4 py-3 font-bold text-amber-950 transition hover:bg-amber-100"
              >
                {lesson.title}
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-purple-100 bg-white p-6 shadow-lg sm:p-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-purple-700">
                <NotebookPen size={19} aria-hidden="true" /> Personal notes
              </p>
              <h2 className="mt-1 text-2xl font-black">Plan your analysis</h2>
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
            placeholder="Write your questions, cleaning plan, formulas, or dashboard idea…"
            className="mt-5 w-full rounded-2xl border border-purple-200 bg-purple-50/50 p-4 leading-7 outline-none placeholder:text-slate-500 focus:border-purple-600 focus:ring-2 focus:ring-purple-200"
          />
        </section>

        <section className="flex flex-col gap-4 rounded-3xl border border-purple-100 bg-white p-6 shadow-lg sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <h2 className="text-2xl font-black">Ready to work with the data?</h2>
            <p className="mt-2 text-slate-700">
              Preview the rows, download the CSV, and mark this dataset completed for {dataset.xpReward} XP.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/dataset-library/${dataset.id}/preview`}
              onClick={playClickSound}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-3 font-bold text-white transition hover:bg-blue-800"
            >
              <Eye size={18} aria-hidden="true" /> Preview data
            </Link>
            <button
              type="button"
              onClick={markCompleted}
              disabled={completed}
              className="inline-flex items-center gap-2 rounded-xl bg-purple-700 px-5 py-3 font-bold text-white transition hover:bg-purple-800 disabled:cursor-not-allowed disabled:bg-purple-100 disabled:text-purple-800"
            >
              <CheckCircle2 size={18} aria-hidden="true" />
              {completed ? "Completed" : `Mark Completed · +${dataset.xpReward} XP`}
            </button>
          </div>
        </section>
      </div>

      <CompletionModal
        isOpen={showCompletion}
        projectTitle={`${dataset.name} dataset`}
        xpEarned={dataset.xpReward}
        celebrationLabel="Dataset analysis complete"
        description={<>You completed <span className="font-bold text-slate-950">{dataset.name}</span>. Your practical data garden is growing.</>}
        continueLabel="Preview dataset"
        onClose={() => setShowCompletion(false)}
        onContinue={() => {
          setShowCompletion(false);
          router.push(`/dataset-library/${dataset.id}/preview`);
        }}
      />
    </AppLayout>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-white/85 px-4 py-2 text-purple-900">{children}</span>;
}

function InfoSection({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-purple-100 bg-white p-6 shadow-md sm:p-8">
      <h2 className="text-2xl font-black text-purple-900">{icon} {title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function ListSection({ title, icon, items }: { title: string; icon: string; items: string[] }) {
  return (
    <section className="rounded-3xl border border-purple-100 bg-white p-6 shadow-md sm:p-8">
      <h2 className="text-xl font-black text-purple-900">{icon} {title}</h2>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item} className="rounded-2xl bg-purple-50 p-4 leading-7 text-slate-800">• {item}</li>
        ))}
      </ul>
    </section>
  );
}
