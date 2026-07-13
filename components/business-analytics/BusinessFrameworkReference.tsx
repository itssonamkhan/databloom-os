import Link from "next/link";

import { businessCaseStudies, businessFrameworks } from "@/lib/businessAnalyticsReference";

export default function BusinessFrameworkReference() {
  return (
    <section aria-labelledby="business-frameworks-heading" className="space-y-6">
      <div>
        <p className="text-sm font-bold uppercase tracking-wider text-indigo-700">Decision toolkit</p>
        <h2 id="business-frameworks-heading" className="mt-1 text-3xl font-black text-slate-950">Business framework reference</h2>
        <p className="mt-2 text-slate-700">Open a concise framework lesson when you need structure for a real analysis or interview.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {businessFrameworks.map((framework) => (
          <Link key={framework.name} href={`/business-analytics-studio/${framework.lessonId}`} className="rounded-3xl border border-indigo-100 bg-white/85 p-5 shadow-md transition hover:-translate-y-1 hover:shadow-lg">
            <span className="text-3xl" aria-hidden="true">{framework.icon}</span>
            <h3 className="mt-3 text-lg font-black text-slate-950">{framework.name}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-700">{framework.purpose}</p>
          </Link>
        ))}
      </div>
      <div>
        <h3 className="text-2xl font-black text-slate-950">Practical case studies</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {businessCaseStudies.map((caseStudy) => (
            <Link key={caseStudy.industry} href={`/business-analytics-studio/${caseStudy.lessonId}`} className="rounded-2xl border border-amber-100 bg-amber-50/60 p-4 shadow-sm transition hover:bg-amber-50">
              <span className="text-2xl" aria-hidden="true">{caseStudy.icon}</span>
              <p className="mt-2 font-black text-slate-950">{caseStudy.industry}</p>
              <p className="mt-1 text-sm leading-6 text-slate-700">{caseStudy.question}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
