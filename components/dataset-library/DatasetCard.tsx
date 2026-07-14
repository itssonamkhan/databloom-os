"use client";

import Link from "next/link";
import {
  CheckCircle2,
  Download,
  Eye,
  Heart,
  Rows3,
  TableProperties,
} from "lucide-react";

import type { DatasetLibraryItem } from "@/lib/datasetLibrary";
import { playClickSound } from "@/lib/sounds";

const thumbnailGradients: Record<DatasetLibraryItem["category"], string> = {
  Excel: "from-emerald-200 via-lime-100 to-white",
  SQL: "from-sky-200 via-indigo-100 to-white",
  "Power BI": "from-amber-200 via-yellow-100 to-white",
  Tableau: "from-blue-200 via-cyan-100 to-white",
  Python: "from-emerald-200 via-blue-100 to-white",
  Statistics: "from-rose-200 via-purple-100 to-white",
  "Business Analytics": "from-indigo-200 via-pink-100 to-white",
  Marketing: "from-pink-200 via-orange-100 to-white",
  Finance: "from-amber-200 via-emerald-100 to-white",
  HR: "from-violet-200 via-pink-100 to-white",
  Sales: "from-green-200 via-sky-100 to-white",
  Healthcare: "from-teal-200 via-blue-100 to-white",
  Retail: "from-fuchsia-200 via-amber-100 to-white",
  "Supply Chain": "from-cyan-200 via-emerald-100 to-white",
};

export default function DatasetCard({
  dataset,
  completed,
  favorite,
  onToggleFavorite,
}: {
  dataset: DatasetLibraryItem;
  completed: boolean;
  favorite: boolean;
  onToggleFavorite: (id: string) => void;
}) {
  return (
    <article className="flex min-w-0 flex-col overflow-hidden rounded-3xl border border-white/90 bg-white shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div
        className={`relative min-h-40 overflow-hidden bg-gradient-to-br p-6 ${thumbnailGradients[dataset.category]}`}
      >
        <div className="absolute -right-8 -top-10 size-36 rounded-full bg-white/45" />
        <div className="absolute -bottom-12 -left-8 size-32 rounded-full bg-purple-200/35" />
        <div className="relative flex h-full items-center justify-between gap-4">
          <span className="text-6xl drop-shadow-sm" aria-hidden="true">
            {dataset.icon}
          </span>
          <div className="flex flex-col items-end gap-2 text-xs font-black">
            <span className="rounded-full bg-white/85 px-3 py-1.5 text-slate-800 shadow-sm">
              {dataset.category}
            </span>
            <span className="rounded-full bg-slate-950/80 px-3 py-1.5 text-white">
              {dataset.difficulty}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-2xl font-black text-slate-950">{dataset.name}</h3>
            <p className="mt-2 leading-7 text-slate-700">{dataset.description}</p>
          </div>
          <button
            type="button"
            aria-label={
              favorite
                ? `Remove ${dataset.name} from favorites`
                : `Add ${dataset.name} to favorites`
            }
            aria-pressed={favorite}
            onClick={() => onToggleFavorite(dataset.id)}
            className={`grid size-11 shrink-0 place-items-center rounded-full border transition ${
              favorite
                ? "border-pink-300 bg-pink-100 text-pink-700"
                : "border-purple-100 bg-purple-50 text-purple-700 hover:bg-purple-100"
            }`}
          >
            <Heart size={20} fill={favorite ? "currentColor" : "none"} aria-hidden="true" />
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold">
          <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-3 py-1.5 text-sky-900">
            <Rows3 size={14} aria-hidden="true" /> {dataset.rowCount} rows
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-3 py-1.5 text-violet-900">
            <TableProperties size={14} aria-hidden="true" /> {dataset.columnCount} columns
          </span>
          {completed ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1.5 text-emerald-900">
              <CheckCircle2 size={14} aria-hidden="true" /> Completed
            </span>
          ) : null}
        </div>

        <div className="mt-5">
          <p className="text-xs font-black uppercase tracking-wider text-purple-700">
            Skills practiced
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {dataset.skillsPracticed.map((skill) => (
              <span
                key={skill}
                className="rounded-full border border-purple-100 bg-purple-50 px-3 py-1.5 text-xs font-bold text-slate-800"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        <p className="mt-5 text-sm font-semibold text-slate-700">
          Recommended: {dataset.recommendedStudio.name}
        </p>

        <div className="mt-auto grid gap-2 pt-6 sm:grid-cols-3">
          <Link
            href={`/dataset-library/${dataset.id}`}
            onClick={playClickSound}
            className="rounded-xl bg-purple-700 px-3 py-3 text-center text-sm font-bold text-white transition hover:bg-purple-800"
          >
            Details
          </Link>
          <Link
            href={`/dataset-library/${dataset.id}/preview`}
            onClick={playClickSound}
            className="inline-flex items-center justify-center gap-1 rounded-xl border border-blue-200 bg-blue-50 px-3 py-3 text-sm font-bold text-blue-900 transition hover:bg-blue-100"
          >
            <Eye size={16} aria-hidden="true" /> Preview
          </Link>
          <a
            href={dataset.csvPath}
            download
            onClick={playClickSound}
            className="inline-flex items-center justify-center gap-1 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-3 text-sm font-bold text-emerald-900 transition hover:bg-emerald-100"
          >
            <Download size={16} aria-hidden="true" /> CSV
          </a>
        </div>
      </div>
    </article>
  );
}
