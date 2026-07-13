"use client";

import Link from "next/link";
import { CheckCircle2, Heart, Sigma } from "lucide-react";

import type { StatisticsLesson } from "@/lib/statisticsLessons";
import { playClickSound } from "@/lib/sounds";

type StatisticsLessonCardProps = {
  lesson: StatisticsLesson;
  completed: boolean;
  favorite: boolean;
  onToggleFavorite: (id: string) => void;
};

export default function StatisticsLessonCard({
  lesson,
  completed,
  favorite,
  onToggleFavorite,
}: StatisticsLessonCardProps) {
  return (
    <article className="flex h-full flex-col rounded-3xl border border-violet-100 bg-white/90 p-6 shadow-lg transition duration-200 hover:-translate-y-1 hover:shadow-xl">
      <div className="flex items-start justify-between gap-4">
        <span className="grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-violet-100 via-pink-100 to-sky-100 text-3xl">
          {lesson.icon}
        </span>
        {completed ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-800">
            <CheckCircle2 size={15} aria-hidden="true" /> Completed
          </span>
        ) : null}
      </div>

      <h2 className="mt-5 text-2xl font-black text-slate-950">{lesson.title}</h2>
      <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
        <span className="rounded-full bg-violet-100 px-3 py-1.5 text-violet-900">
          {lesson.category}
        </span>
        <span className="rounded-full bg-pink-100 px-3 py-1.5 text-pink-900">
          {lesson.difficulty}
        </span>
      </div>
      <p className="mt-4 flex-1 leading-7 text-slate-700">{lesson.description}</p>

      <div className="mt-5 overflow-hidden rounded-2xl bg-slate-950 p-4">
        <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-violet-200">
          <Sigma size={15} aria-hidden="true" /> Formula preview
        </p>
        <pre className="overflow-hidden whitespace-pre-wrap font-mono text-sm leading-6 text-emerald-200">
          <code className="line-clamp-2">{lesson.formula}</code>
        </pre>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <Link
          href={`/statistics-studio/${lesson.id}`}
          onClick={playClickSound}
          className="rounded-xl bg-violet-700 px-4 py-3 text-center font-bold text-white transition hover:bg-violet-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-700 focus-visible:ring-offset-2"
        >
          Learn
        </Link>
        <Link
          href={`/statistics-studio/${lesson.id}/practice`}
          onClick={playClickSound}
          className="rounded-xl bg-blue-700 px-4 py-3 text-center font-bold text-white transition hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"
        >
          Practice
        </Link>
        <button
          type="button"
          aria-label={`${favorite ? "Remove" : "Add"} ${lesson.title} ${favorite ? "from" : "to"} favorites`}
          aria-pressed={favorite}
          onClick={() => {
            playClickSound();
            onToggleFavorite(lesson.id);
          }}
          className={`col-span-2 inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-3 font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-600 focus-visible:ring-offset-2 ${
            favorite
              ? "border-pink-300 bg-pink-100 text-pink-800"
              : "border-slate-200 bg-white text-slate-700 hover:bg-pink-50"
          }`}
        >
          <Heart size={18} fill={favorite ? "currentColor" : "none"} aria-hidden="true" />
          {favorite ? "Favorited" : "Favorite"}
        </button>
      </div>
    </article>
  );
}
