"use client";

import Link from "next/link";
import { CheckCircle2, Heart, Timer } from "lucide-react";

import type { DashboardProject } from "@/lib/dashboardProjects";

type ProjectHeaderProps = {
  project: DashboardProject;
  completed: boolean;
  favorite: boolean;
  onToggleFavorite: () => void;
};

export default function ProjectHeader({
  project,
  completed,
  favorite,
  onToggleFavorite,
}: ProjectHeaderProps) {
  return (
    <div className="space-y-5">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 font-semibold text-purple-700 transition hover:text-purple-900"
      >
        <span aria-hidden="true">←</span>
        Back to Dashboard Studio
      </Link>

      <header className="rounded-3xl border border-white/70 bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 p-7 shadow-lg sm:p-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-5xl" aria-hidden="true">
                {project.icon}
              </span>
              {completed && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-sm font-bold text-emerald-800">
                  <CheckCircle2 size={16} aria-hidden="true" />
                  Completed
                </span>
              )}
            </div>

            <h1 className="mt-5 text-4xl font-bold text-purple-800 sm:text-5xl">
              {project.title}
            </h1>
            <p className="mt-4 text-lg leading-8 text-gray-700">
              {project.description}
            </p>
          </div>

          <button
            type="button"
            onClick={onToggleFavorite}
            aria-pressed={favorite}
            className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border px-5 py-3 font-bold shadow-sm transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-700 ${
              favorite
                ? "border-pink-300 bg-pink-100 text-pink-800"
                : "border-purple-200 bg-white/80 text-purple-800 hover:bg-purple-50"
            }`}
          >
            <Heart
              size={20}
              fill={favorite ? "currentColor" : "none"}
              aria-hidden="true"
            />
            {favorite ? "Favorited" : "Add to favorites"}
          </button>
        </div>

        <div className="mt-7 flex flex-wrap gap-3 text-sm font-semibold text-gray-800">
          <span className="rounded-full bg-white/80 px-4 py-2">
            {project.category}
          </span>
          <span className="rounded-full bg-white/80 px-4 py-2">
            {project.difficulty}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2">
            <Timer size={16} aria-hidden="true" />
            {project.estimatedTime}
          </span>
        </div>
      </header>
    </div>
  );
}
