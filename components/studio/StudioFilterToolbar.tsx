"use client";

import { ChevronDown, Search, Sparkles } from "lucide-react";
import { useId, type ReactNode } from "react";

export type StudioFilterToolbarProps = {
  query: string;
  onQueryChange: (query: string) => void;
  category: string;
  onCategoryChange: (category: string) => void;
  categories: readonly string[];
  difficulty: string;
  onDifficultyChange: (difficulty: string) => void;
  difficulties: readonly string[];
  resultCount: number;
  searchPlaceholder: string;
  actions?: ReactNode;
};

export default function StudioFilterToolbar({
  query,
  onQueryChange,
  category,
  onCategoryChange,
  categories,
  difficulty,
  onDifficultyChange,
  difficulties,
  resultCount,
  searchPlaceholder,
  actions,
}: StudioFilterToolbarProps) {
  const id = useId();
  const searchId = `${id}-search`;
  const categoryId = `${id}-category`;
  const difficultyId = `${id}-difficulty`;
  const controlGrid = actions
    ? "xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_auto]"
    : "xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)]";

  return (
    <div className="rounded-[26px] border border-white/90 bg-gradient-to-br from-pink-100/90 via-violet-100/85 to-sky-100/90 p-4 text-slate-950 shadow-[0_16px_36px_-22px_rgba(88,28,135,0.55)] ring-1 ring-purple-200/70 sm:p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-full bg-white/75 text-purple-700 shadow-sm">
            <Sparkles size={16} aria-hidden="true" />
          </span>
          <h3 className="text-base font-black text-slate-950 sm:text-lg">
            Find your next lesson
          </h3>
        </div>
        <span
          className="rounded-full border border-white/90 bg-white/70 px-3 py-1 text-xs font-bold text-purple-900 shadow-sm"
          aria-live="polite"
        >
          {resultCount} {resultCount === 1 ? "result" : "results"}
        </span>
      </div>

      <div className={`grid min-w-0 gap-3 sm:grid-cols-2 ${controlGrid}`}>
        <label className="block min-w-0" htmlFor={searchId}>
          <span className="mb-1.5 block text-xs font-bold text-slate-800">Search</span>
          <span className="relative block">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-purple-700"
              size={18}
              aria-hidden="true"
            />
            <input
              id={searchId}
              type="search"
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder={searchPlaceholder}
              className="min-h-11 w-full rounded-full border border-white/95 bg-white/75 py-2 pl-11 pr-4 text-sm font-semibold text-slate-950 shadow-sm outline-none transition placeholder:text-slate-600 hover:bg-white/90 focus:border-purple-500 focus:bg-white focus:ring-2 focus:ring-purple-300"
            />
          </span>
        </label>

        <FilterSelect
          id={categoryId}
          label="Category"
          value={category}
          onChange={onCategoryChange}
          allLabel="All categories"
          options={categories}
        />

        <FilterSelect
          id={difficultyId}
          label="Difficulty"
          value={difficulty}
          onChange={onDifficultyChange}
          allLabel="All difficulties"
          options={difficulties}
        />

        {actions ? (
          <div className="flex min-w-0 items-end sm:col-span-2 xl:col-span-1">
            {actions}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function FilterSelect({
  id,
  label,
  value,
  onChange,
  allLabel,
  options,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  allLabel: string;
  options: readonly string[];
}) {
  return (
    <label className="block min-w-0" htmlFor={id}>
      <span className="mb-1.5 block text-xs font-bold text-slate-800">{label}</span>
      <span className="relative block">
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="min-h-11 w-full appearance-none rounded-2xl border border-white/95 bg-white/65 py-2 pl-3.5 pr-10 text-sm font-bold text-slate-950 shadow-sm outline-none transition hover:border-purple-200 hover:bg-white/90 focus:border-purple-500 focus:bg-white focus:ring-2 focus:ring-purple-300"
        >
          <option value="All">{allLabel}</option>
          {options
            .filter((option) => option !== "All")
            .map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-purple-700"
          size={17}
          strokeWidth={2.5}
          aria-hidden="true"
        />
      </span>
    </label>
  );
}
