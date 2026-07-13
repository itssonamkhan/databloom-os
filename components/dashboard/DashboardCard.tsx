"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Heart,
  Wrench,
} from "lucide-react";
import type { DashboardProject } from "@/lib/dashboardProjects";
import { playClickSound } from "@/lib/sounds";

export type DashboardCardProps = {
  project: DashboardProject;
  completed: boolean;
  favorite: boolean;
  onToggleFavorite: (id: string) => void;
};

export default function DashboardCard({
  project,
  completed,
  favorite,
  onToggleFavorite,
}: DashboardCardProps) {
  function handleFavorite() {
    playClickSound();
    onToggleFavorite(project.id);
  }

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-white/80 bg-white/90 shadow-[0_18px_50px_rgba(109,40,217,0.09)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_60px_rgba(109,40,217,0.14)]">
      <div
        className={`relative border-b border-white/80 bg-gradient-to-br ${project.color} p-6`}
      >
        <div className="flex items-start justify-between gap-4">
          <span
            aria-hidden="true"
            className="grid size-14 shrink-0 place-items-center rounded-2xl bg-white/85 text-3xl shadow-sm"
          >
            {project.icon}
          </span>

          {completed ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800 shadow-sm">
              <CheckCircle2 aria-hidden="true" className="size-4" />
              Completed
            </span>
          ) : null}
        </div>

        <h2 className="mt-5 text-2xl font-bold tracking-tight text-slate-900">
          {project.title}
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-700">
          {project.description}
        </p>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex flex-wrap gap-2" aria-label="Project details">
          <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-bold text-purple-800">
            {project.category}
          </span>
          <span className="rounded-full bg-pink-100 px-3 py-1 text-xs font-bold text-pink-800">
            {project.difficulty}
          </span>
        </div>

        <div className="mt-5 space-y-3 text-sm text-slate-700">
          <div className="flex items-start gap-2.5">
            <Wrench
              aria-hidden="true"
              className="mt-0.5 size-4 shrink-0 text-purple-600"
            />
            <span>
              <span className="font-semibold text-slate-900">Tools:</span>{" "}
              {project.tools.join(", ")}
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <Clock3
              aria-hidden="true"
              className="size-4 shrink-0 text-purple-600"
            />
            <span>
              <span className="font-semibold text-slate-900">Time:</span>{" "}
              {project.estimatedTime}
            </span>
          </div>
        </div>

        <div className="mt-auto flex flex-col gap-3 pt-6 sm:flex-row">
          <Link
            href={`/dashboard/${project.id}`}
            onClick={playClickSound}
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-purple-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600 focus-visible:ring-offset-2 active:scale-[0.98]"
          >
            Explore
            <ArrowUpRight aria-hidden="true" className="size-4" />
          </Link>

          <button
            type="button"
            aria-pressed={favorite}
            aria-label={`${favorite ? "Remove" : "Add"} ${project.title} ${
              favorite ? "from" : "to"
            } favorites`}
            onClick={handleFavorite}
            className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-600 focus-visible:ring-offset-2 active:scale-[0.98] ${
              favorite
                ? "border-pink-300 bg-pink-100 text-pink-800 hover:bg-pink-200"
                : "border-slate-200 bg-white text-slate-700 hover:border-pink-200 hover:bg-pink-50 hover:text-pink-800"
            }`}
          >
            <Heart
              aria-hidden="true"
              className={`size-4 ${favorite ? "fill-current" : ""}`}
            />
            {favorite ? "Favorited" : "Favorite"}
          </button>
        </div>
      </div>
    </article>
  );
}
