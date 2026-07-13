"use client";

import Link from "next/link";
import { CheckCircle2, Code2, Heart } from "lucide-react";

import type { SQLLesson } from "@/lib/sqlLessons";
import { playClickSound } from "@/lib/sounds";

type SQLLessonCardProps = {
  lesson: SQLLesson;
  completed: boolean;
  favorite: boolean;
  onToggleFavorite: (id: string) => void;
};

export default function SQLLessonCard({
  lesson,
  completed,
  favorite,
  onToggleFavorite,
}: SQLLessonCardProps) {
  return (
    <article className="flex h-full flex-col rounded-3xl border border-purple-100 bg-white/90 p-6 shadow-lg transition hover:-translate-y-1 hover:shadow-xl">
      <div className="flex items-start justify-between gap-4">
        <span className="grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 text-3xl">
          {lesson.icon}
        </span>
        {completed && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-800">
            <CheckCircle2 size={15} aria-hidden="true" /> Completed
          </span>
        )}
      </div>

      <h2 className="mt-5 text-2xl font-bold text-gray-950">{lesson.title}</h2>
      <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
        <span className="rounded-full bg-purple-100 px-3 py-1.5 text-purple-800">
          {lesson.category}
        </span>
        <span className="rounded-full bg-pink-100 px-3 py-1.5 text-pink-800">
          {lesson.difficulty}
        </span>
      </div>
      <p className="mt-4 flex-1 leading-7 text-gray-700">{lesson.description}</p>

      <div className="mt-5 overflow-hidden rounded-2xl bg-slate-900 p-4">
        <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-200">
          <Code2 size={15} aria-hidden="true" /> Syntax preview
        </p>
        <code className="line-clamp-2 text-sm text-emerald-200">{lesson.syntax}</code>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <Link
          href={`/sql-studio/${lesson.id}`}
          onClick={playClickSound}
          className="rounded-xl bg-purple-700 px-4 py-3 text-center font-bold text-white transition hover:bg-purple-800"
        >
          Learn
        </Link>
        <Link
          href={`/sql-studio/${lesson.id}/practice`}
          onClick={playClickSound}
          className="rounded-xl bg-blue-700 px-4 py-3 text-center font-bold text-white transition hover:bg-blue-800"
        >
          Practice
        </Link>
        <button
          type="button"
          aria-pressed={favorite}
          onClick={() => {
            playClickSound();
            onToggleFavorite(lesson.id);
          }}
          className={`col-span-2 inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-3 font-bold transition ${
            favorite
              ? "border-pink-300 bg-pink-100 text-pink-800"
              : "border-gray-200 bg-white text-gray-700 hover:bg-pink-50"
          }`}
        >
          <Heart size={18} fill={favorite ? "currentColor" : "none"} aria-hidden="true" />
          {favorite ? "Favorited" : "Favorite"}
        </button>
      </div>
    </article>
  );
}
