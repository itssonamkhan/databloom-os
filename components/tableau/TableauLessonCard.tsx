"use client";

import Link from "next/link";
import { CheckCircle2, Heart } from "lucide-react";

import type { TableauLesson } from "@/lib/tableauLessons";
import { playClickSound } from "@/lib/sounds";

type TableauLessonCardProps = {
  lesson: TableauLesson;
  completed: boolean;
  favorite: boolean;
  onToggleFavorite: (id: string) => void;
};

export default function TableauLessonCard({
  lesson,
  completed,
  favorite,
  onToggleFavorite,
}: TableauLessonCardProps) {
  return (
    <article className="flex h-full flex-col rounded-3xl border border-blue-100 bg-white/90 p-6 shadow-lg transition duration-200 hover:-translate-y-1 hover:shadow-xl">
      <div className="flex items-start justify-between gap-4">
        <span className="grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-blue-100 via-pink-100 to-orange-100 text-3xl">
          {lesson.icon}
        </span>
        <button
          type="button"
          aria-label={`${favorite ? "Remove" : "Add"} ${lesson.title} ${favorite ? "from" : "to"} favorites`}
          aria-pressed={favorite}
          onClick={() => {
            playClickSound();
            onToggleFavorite(lesson.id);
          }}
          className={`rounded-full p-2 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-600 ${
            favorite
              ? "bg-pink-100 text-pink-700"
              : "bg-slate-100 text-slate-600 hover:bg-pink-50"
          }`}
        >
          <Heart size={20} fill={favorite ? "currentColor" : "none"} aria-hidden="true" />
        </button>
      </div>

      <h3 className="mt-4 text-xl font-black text-slate-950">{lesson.title}</h3>
      <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
        <span className="rounded-full bg-blue-100 px-3 py-1.5 text-blue-900">
          {lesson.category}
        </span>
        <span className="rounded-full bg-orange-100 px-3 py-1.5 text-orange-900">
          {lesson.difficulty}
        </span>
        {completed ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1.5 text-emerald-900">
            <CheckCircle2 size={14} aria-hidden="true" /> Completed
          </span>
        ) : null}
      </div>
      <p className="mt-4 flex-1 leading-7 text-slate-700">{lesson.description}</p>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <Link
          href={`/tableau-studio/${lesson.id}`}
          onClick={playClickSound}
          className="rounded-xl bg-blue-700 px-4 py-3 text-center font-bold text-white transition hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
        >
          Learn
        </Link>
        <Link
          href={`/tableau-studio/${lesson.id}/practice`}
          onClick={playClickSound}
          className="rounded-xl bg-orange-600 px-4 py-3 text-center font-bold text-white transition hover:bg-orange-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
        >
          Practice
        </Link>
      </div>
    </article>
  );
}
