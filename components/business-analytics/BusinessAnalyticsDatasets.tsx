"use client";

import { Download, Files } from "lucide-react";

import { businessAnalyticsDatasets } from "@/lib/businessAnalyticsDatasets";
import { playClickSound } from "@/lib/sounds";

export default function BusinessAnalyticsDatasets() {
  return (
    <section aria-labelledby="business-analytics-datasets-heading">
      <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-indigo-700"><Files size={18} aria-hidden="true" /> Case-study data</p>
      <h2 id="business-analytics-datasets-heading" className="mt-1 text-3xl font-black text-slate-950">Downloadable datasets</h2>
      <p className="mt-2 text-slate-700">Practice framing, calculations, driver analysis, and recommendations with realistic business data.</p>
      <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {businessAnalyticsDatasets.map((dataset) => (
          <article key={dataset.id} className="flex flex-col rounded-3xl border border-indigo-100 bg-white/85 p-5 shadow-md">
            <h3 className="text-lg font-black text-slate-950">{dataset.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-700">{dataset.description}</p>
            <p className="mt-3 flex-1 rounded-2xl bg-indigo-50 p-3 text-sm font-semibold leading-6 text-indigo-950">{dataset.task}</p>
            <a href={dataset.downloadPath} download onClick={playClickSound} className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-800"><Download size={16} aria-hidden="true" /> Download CSV</a>
          </article>
        ))}
      </div>
    </section>
  );
}
