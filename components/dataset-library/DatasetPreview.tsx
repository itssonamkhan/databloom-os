"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowDownAZ,
  ArrowLeft,
  ArrowUpAZ,
  ChevronLeft,
  ChevronRight,
  Download,
  Search,
} from "lucide-react";

import AppLayout from "@/components/layout/AppLayout";
import { parseCSV, type ParsedCSV } from "@/lib/csv";
import type { DatasetLibraryItem } from "@/lib/datasetLibrary";
import { playClickSound } from "@/lib/sounds";

const PAGE_SIZE = 5;

export default function DatasetPreview({ dataset }: { dataset: DatasetLibraryItem }) {
  const [data, setData] = useState<ParsedCSV>({ columns: [], rows: [] });
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [query, setQuery] = useState("");
  const [filterColumn, setFilterColumn] = useState("All");
  const [filterValue, setFilterValue] = useState("");
  const [sortColumn, setSortColumn] = useState("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const controller = new AbortController();
    fetch(dataset.csvPath, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Dataset download failed");
        return response.text();
      })
      .then((value) => {
        setData(parseCSV(value));
        setStatus("ready");
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setStatus("error");
      });
    return () => controller.abort();
  }, [dataset.csvPath]);

  const visibleRows = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    const normalizedFilter = filterValue.trim().toLocaleLowerCase();
    const filterIndex = data.columns.indexOf(filterColumn);
    const sortIndex = data.columns.indexOf(sortColumn);

    const rows = data.rows.filter((row) => {
      const matchesSearch =
        !normalizedQuery ||
        row.some((value) => value.toLocaleLowerCase().includes(normalizedQuery));
      const matchesFilter =
        !normalizedFilter ||
        filterColumn === "All" ||
        (filterIndex >= 0 &&
          (row[filterIndex] ?? "").toLocaleLowerCase().includes(normalizedFilter));
      return matchesSearch && matchesFilter;
    });

    if (sortIndex < 0) return rows;
    return [...rows].sort((left, right) => {
      const leftValue = left[sortIndex] ?? "";
      const rightValue = right[sortIndex] ?? "";
      const leftNumber = Number(leftValue);
      const rightNumber = Number(rightValue);
      const comparison =
        Number.isFinite(leftNumber) && Number.isFinite(rightNumber)
          ? leftNumber - rightNumber
          : leftValue.localeCompare(rightValue, undefined, {
              numeric: true,
              sensitivity: "base",
            });
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [data.columns, data.rows, filterColumn, filterValue, query, sortColumn, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(visibleRows.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = visibleRows.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  function updateAndReset(update: () => void) {
    update();
    setPage(1);
  }

  return (
    <AppLayout>
      <div className="space-y-7 text-slate-950">
        <Link
          href={`/dataset-library/${dataset.id}`}
          onClick={playClickSound}
          className="inline-flex items-center gap-2 font-bold text-purple-800 transition hover:text-purple-950"
        >
          <ArrowLeft size={18} aria-hidden="true" /> Back to dataset details
        </Link>

        <header className="rounded-3xl border border-white/70 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 p-7 shadow-lg sm:p-10">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="font-bold text-purple-900">Interactive CSV preview</p>
              <h1 className="mt-2 text-4xl font-black sm:text-5xl">
                {dataset.icon} {dataset.name}
              </h1>
              <p className="mt-4 leading-7 text-slate-700">
                Search every row, filter one column, sort the table, and move between pages before downloading the CSV.
              </p>
            </div>
            <a
              href={dataset.csvPath}
              download
              onClick={playClickSound}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white transition hover:bg-emerald-800"
            >
              <Download size={19} aria-hidden="true" /> Download CSV
            </a>
          </div>
        </header>

        <section className="rounded-3xl border border-purple-100 bg-white p-5 shadow-lg sm:p-7">
          <h2 className="text-2xl font-black">Preview controls</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-bold text-slate-800">Search rows</span>
              <span className="relative block">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-700" size={18} aria-hidden="true" />
                <input
                  type="search"
                  value={query}
                  onChange={(event) =>
                    updateAndReset(() => setQuery(event.target.value))
                  }
                  placeholder="Search every column"
                  className="min-h-11 w-full rounded-xl border border-purple-200 bg-purple-50/60 py-2 pl-10 pr-3 text-sm font-semibold outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-200"
                />
              </span>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-bold text-slate-800">Filter column</span>
              <select
                value={filterColumn}
                onChange={(event) =>
                  updateAndReset(() => setFilterColumn(event.target.value))
                }
                className="min-h-11 w-full rounded-xl border border-purple-200 bg-purple-50/60 px-3 text-sm font-bold outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-200"
              >
                <option value="All">All columns</option>
                {data.columns.map((column) => (
                  <option key={column} value={column}>{column}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-bold text-slate-800">Filter value</span>
              <input
                type="text"
                value={filterValue}
                onChange={(event) =>
                  updateAndReset(() => setFilterValue(event.target.value))
                }
                placeholder="Contains…"
                disabled={filterColumn === "All"}
                className="min-h-11 w-full rounded-xl border border-purple-200 bg-purple-50/60 px-3 text-sm font-semibold outline-none placeholder:text-slate-500 focus:border-purple-600 focus:ring-2 focus:ring-purple-200 disabled:cursor-not-allowed disabled:bg-slate-100"
              />
            </label>

            <div>
              <label className="block">
                <span className="mb-1.5 block text-sm font-bold text-slate-800">Sort column</span>
                <select
                  value={sortColumn}
                  onChange={(event) =>
                    updateAndReset(() => setSortColumn(event.target.value))
                  }
                  className="min-h-11 w-full rounded-xl border border-purple-200 bg-purple-50/60 px-3 text-sm font-bold outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-200"
                >
                  <option value="">Original order</option>
                  {data.columns.map((column) => (
                    <option key={column} value={column}>{column}</option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                disabled={!sortColumn}
                onClick={() => {
                  playClickSound();
                  setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
                  setPage(1);
                }}
                className="mt-2 inline-flex items-center gap-2 rounded-lg border border-purple-200 bg-white px-3 py-2 text-xs font-bold text-purple-900 disabled:cursor-not-allowed disabled:text-slate-400"
              >
                {sortDirection === "asc" ? <ArrowDownAZ size={16} aria-hidden="true" /> : <ArrowUpAZ size={16} aria-hidden="true" />}
                {sortDirection === "asc" ? "Ascending" : "Descending"}
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-purple-100 bg-white p-5 shadow-lg sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-black">Table preview</h2>
              <p className="mt-1 text-sm font-semibold text-slate-600">
                {visibleRows.length} matching rows · page {safePage} of {totalPages}
              </p>
            </div>
          </div>

          {status === "loading" ? (
            <p className="mt-6 rounded-2xl bg-blue-50 p-5 font-semibold text-blue-900" role="status">Loading CSV preview…</p>
          ) : status === "error" ? (
            <p className="mt-6 rounded-2xl bg-rose-50 p-5 font-semibold text-rose-900" role="alert">The preview could not be loaded. The CSV download remains available above.</p>
          ) : (
            <>
              <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200">
                <table className="min-w-full text-left text-sm">
                  <caption className="sr-only">Preview of {dataset.name}</caption>
                  <thead className="bg-slate-950 text-white">
                    <tr>
                      {data.columns.map((column) => (
                        <th key={column} scope="col" className="whitespace-nowrap px-4 py-3">{column}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {pageRows.map((row, rowIndex) => (
                      <tr key={`${safePage}-${rowIndex}`}>
                        {data.columns.map((column, columnIndex) => (
                          <td key={`${column}-${rowIndex}`} className="whitespace-nowrap px-4 py-3 text-slate-700">
                            {row[columnIndex] ?? ""}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {pageRows.length === 0 ? (
                <p className="mt-4 rounded-2xl bg-purple-50 p-5 text-center font-bold text-purple-900">No rows match the current search and filter.</p>
              ) : null}
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  disabled={safePage <= 1}
                  onClick={() => {
                    playClickSound();
                    setPage((current) => Math.max(1, current - 1));
                  }}
                  className="inline-flex items-center gap-2 rounded-xl border border-purple-200 bg-purple-50 px-4 py-3 font-bold text-purple-900 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  <ChevronLeft size={18} aria-hidden="true" /> Previous
                </button>
                <span className="font-bold text-slate-700">Page {safePage} of {totalPages}</span>
                <button
                  type="button"
                  disabled={safePage >= totalPages}
                  onClick={() => {
                    playClickSound();
                    setPage((current) => Math.min(totalPages, current + 1));
                  }}
                  className="inline-flex items-center gap-2 rounded-xl border border-purple-200 bg-purple-50 px-4 py-3 font-bold text-purple-900 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  Next <ChevronRight size={18} aria-hidden="true" />
                </button>
              </div>
            </>
          )}
        </section>
      </div>
    </AppLayout>
  );
}
