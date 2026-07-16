"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  BookOpenCheck,
  ExternalLink,
  NotebookPen,
  Target,
  Wrench,
} from "lucide-react";

import CompletionModal from "@/components/dashboard/CompletionModal";
import DatasetCard from "@/components/dashboard/DatasetCard";
import ProgressCard from "@/components/dashboard/ProgressCard";
import ProjectHeader from "@/components/dashboard/ProjectHeader";
import AppLayout from "@/components/layout/AppLayout";
import { useProgress } from "@/context/ProgressContext";
import type { DashboardProject } from "@/lib/dashboardProjects";
import {
  DASHBOARD_STORAGE_EVENT,
  completeDashboard,
  getDashboardNote,
  isDashboardCompleted,
  isDashboardFavorite,
  saveDashboardNote,
  toggleFavoriteDashboard,
} from "@/lib/dashboardProgress";
import { playClickSound, playNotificationSound, playXPSound } from "@/lib/sounds";
import { registerStudyActivity } from "@/lib/studyActivity";
import { unlockAchievement } from "@/lib/unlockedAchievements";

export default function DashboardProjectDetail({
  project,
}: {
  project: DashboardProject;
}) {
  const router = useRouter();
  const { addXP } = useProgress();
  const [completed, setCompleted] = useState(() =>
    isDashboardCompleted(project.id),
  );
  const [favorite, setFavorite] = useState(() =>
    isDashboardFavorite(project.id),
  );
  const [notes, setNotes] = useState(() => getDashboardNote(project.id));
  const [notesSaved, setNotesSaved] = useState(true);
  const [showCompletion, setShowCompletion] = useState(false);

  useEffect(() => {
    const syncProjectState = () => {
      setCompleted(isDashboardCompleted(project.id));
      setFavorite(isDashboardFavorite(project.id));
    };

    window.addEventListener(DASHBOARD_STORAGE_EVENT, syncProjectState);
    return () => {
      window.removeEventListener(DASHBOARD_STORAGE_EVENT, syncProjectState);
    };
  }, [project.id]);

  useEffect(() => {
    const saveTimer = window.setTimeout(() => {
      saveDashboardNote(project.id, notes);
      setNotesSaved(true);
    }, 450);

    return () => window.clearTimeout(saveTimer);
  }, [notes, project.id]);

  function handleFavorite() {
    playClickSound();
    const updatedFavorites = toggleFavoriteDashboard(project.id);
    const isNowFavorite = updatedFavorites.includes(project.id);
    setFavorite(isNowFavorite);

    if (isNowFavorite) {
      playNotificationSound();
    }
  }

  function handleComplete() {
    if (completed) return;

    const isFirstCompletion = completeDashboard(project.id);
    setCompleted(isDashboardCompleted(project.id));

    if (!isFirstCompletion) return;

    addXP(project.xpReward);
    registerStudyActivity({
      kind: "lesson",
      source: `dashboard:${project.id}`,
      minutes: 30,
      xp: project.xpReward,
    });
    unlockAchievement("dashboard_builder");
    playXPSound();
    setShowCompletion(true);
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        <ProjectHeader
          project={project}
          completed={completed}
          favorite={favorite}
          onToggleFavorite={handleFavorite}
        />

        <section className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
          <article className="rounded-3xl border border-purple-100 bg-white/85 p-6 shadow-lg sm:p-8">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-2xl bg-purple-100 text-purple-800">
                <BookOpenCheck size={22} aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-purple-700">
                  Project overview
                </p>
                <h2 className="text-2xl font-bold text-gray-900">
                  Build a stakeholder-ready dashboard
                </h2>
              </div>
            </div>
            <p className="mt-5 leading-8 text-gray-700">
              Work from the included business dataset, calculate useful KPIs, and
              turn the results into a clear visual story. Use the tutorial when you
              need guidance, then test your conclusions in Dashboard Practice.
            </p>

            <dl className="mt-6 grid gap-4 sm:grid-cols-2">
              <ProjectFact label="Category" value={project.category} />
              <ProjectFact label="Difficulty" value={project.difficulty} />
              <ProjectFact label="Estimated time" value={project.estimatedTime} />
              <ProjectFact label="XP reward" value={`${project.xpReward} XP`} />
            </dl>
          </article>

          <article className="rounded-3xl border border-pink-100 bg-gradient-to-br from-white to-pink-50 p-6 shadow-lg sm:p-8">
            <div className="flex items-center gap-3">
              <Wrench className="text-pink-700" size={23} aria-hidden="true" />
              <h2 className="text-2xl font-bold text-gray-900">Tools you’ll use</h2>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              {project.tools.map((tool) => (
                <span
                  key={tool}
                  className="rounded-full border border-pink-200 bg-white px-4 py-2 font-semibold text-pink-900"
                >
                  {tool}
                </span>
              ))}
            </div>
          </article>
        </section>

        <section className="rounded-3xl border border-emerald-100 bg-white/85 p-6 shadow-lg sm:p-8">
          <div className="flex items-center gap-3">
            <Target className="text-emerald-700" size={24} aria-hidden="true" />
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-emerald-700">
                Learning objectives
              </p>
              <h2 className="text-2xl font-bold text-gray-900">What you’ll practice</h2>
            </div>
          </div>
          <ul className="mt-6 grid gap-4 md:grid-cols-2">
            {project.learningObjectives.map((objective, index) => (
              <li
                key={objective}
                className="flex gap-3 rounded-2xl bg-emerald-50 p-4 text-gray-800"
              >
                <span
                  aria-hidden="true"
                  className="grid size-7 shrink-0 place-items-center rounded-full bg-emerald-700 text-sm font-bold text-white"
                >
                  {index + 1}
                </span>
                <span className="leading-7">{objective}</span>
              </li>
            ))}
          </ul>
        </section>

        <DatasetCard project={project} />

        <section className="grid gap-4 md:grid-cols-2">
          <a
            href={project.tutorialUrl}
            target="_blank"
            rel="noreferrer"
            onClick={playClickSound}
            className="group flex items-center justify-between rounded-3xl bg-pink-700 p-6 font-bold text-white shadow-lg transition hover:bg-pink-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-700"
          >
            <span>
              <span className="block text-sm font-semibold text-pink-100">
                Public YouTube search
              </span>
              <span className="mt-1 block text-xl">Watch tutorial</span>
            </span>
            <ExternalLink className="transition group-hover:-translate-y-1 group-hover:translate-x-1" aria-hidden="true" />
          </a>

          <Link
            href={project.practiceRoute}
            onClick={playClickSound}
            className="group flex items-center justify-between rounded-3xl bg-blue-700 p-6 font-bold text-white shadow-lg transition hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
          >
            <span>
              <span className="block text-sm font-semibold text-blue-100">
                Three analyst questions
              </span>
              <span className="mt-1 block text-xl">Start practice</span>
            </span>
            <ArrowUpRight className="transition group-hover:-translate-y-1 group-hover:translate-x-1" aria-hidden="true" />
          </Link>
        </section>

        <section className="rounded-3xl border border-amber-100 bg-white/85 p-6 shadow-lg sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-amber-800">
                <NotebookPen size={22} aria-hidden="true" />
                <p className="text-sm font-bold uppercase tracking-wider">
                  Personal notes
                </p>
              </div>
              <h2 className="mt-1 text-2xl font-bold text-gray-900">
                Capture your project insights
              </h2>
            </div>
            <p className="text-sm font-semibold text-gray-600" aria-live="polite">
              {notesSaved ? "Saved locally" : "Saving…"}
            </p>
          </div>
          <label className="mt-5 block">
            <span className="sr-only">Personal notes for {project.title}</span>
            <textarea
              value={notes}
              onChange={(event) => {
                setNotes(event.target.value);
                setNotesSaved(false);
              }}
              rows={7}
              placeholder="Write down formulas, chart ideas, KPI definitions, or the story you want your dashboard to tell…"
              className="w-full resize-y rounded-2xl border border-amber-200 bg-amber-50/60 p-4 leading-7 text-gray-900 outline-none transition placeholder:text-gray-500 focus:border-amber-600 focus:ring-2 focus:ring-amber-200"
            />
          </label>
        </section>

        <ProgressCard
          completed={completed}
          xpReward={project.xpReward}
          onComplete={handleComplete}
        />
      </div>

      <CompletionModal
        isOpen={showCompletion}
        projectTitle={project.title}
        xpEarned={project.xpReward}
        onClose={() => setShowCompletion(false)}
        onContinue={() => {
          setShowCompletion(false);
          router.push("/dashboard");
        }}
      />
    </AppLayout>
  );
}

function ProjectFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-purple-50 p-4">
      <dt className="text-sm font-semibold text-gray-600">{label}</dt>
      <dd className="mt-1 font-bold text-purple-900">{value}</dd>
    </div>
  );
}
