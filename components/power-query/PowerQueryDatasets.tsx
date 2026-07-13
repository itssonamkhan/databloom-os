"use client";

import { Download, Files } from "lucide-react";

import { powerQueryPracticeDatasets } from "@/lib/powerQueryPracticeDatasets";
import { playClickSound } from "@/lib/sounds";

export default function PowerQueryDatasets() {
  return (
    <section aria-labelledby="power-query-datasets-heading">
      <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-teal-700">
        <Files size={18} aria-hidden="true" /> Practice files
      </p>
      <h2 id="power-query-datasets-heading" className="mt-1 text-3xl font-black text-slate-950">
        Downloadable datasets
      </h2>
      <p className="mt-2 text-slate-700">
        Clean realistic source files in Excel, Power BI Desktop, or another Power Query experience.
      </p>

      <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {powerQueryPracticeDatasets.map((dataset) => (
          <article
            key={dataset.id}
            className="flex flex-col rounded-3xl border border-teal-100 bg-white/85 p-5 shadow-md"
          >
            <h3 className="text-lg font-black text-slate-950">{dataset.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-700">{dataset.description}</p>
            <p className="mt-3 flex-1 rounded-2xl bg-teal-50 p-3 text-sm font-semibold leading-6 text-teal-950">
              {dataset.task}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {dataset.downloads.map((download) => (
                <a
                  key={download.path}
                  href={download.path}
                  download
                  onClick={playClickSound}
                  className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-teal-800"
                >
                  <Download size={16} aria-hidden="true" /> {download.label}
                </a>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
