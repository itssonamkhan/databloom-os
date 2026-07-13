import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import { getBusinessAnalyticsLesson } from "@/lib/businessAnalyticsLessons";
import { businessAnalyticsRoadmap } from "@/lib/businessAnalyticsReference";

export default function BusinessAnalyticsRoadmap({ completedLessonIds }: { completedLessonIds: string[] }) {
  return (
    <section aria-labelledby="business-analytics-roadmap-heading">
      <p className="text-sm font-bold uppercase tracking-wider text-indigo-700">Guided path</p>
      <h2 id="business-analytics-roadmap-heading" className="mt-1 text-3xl font-black text-slate-950">Learning roadmap</h2>
      <p className="mt-2 text-slate-700">Move from framing and measurement through decisions, communication, and complete business cases.</p>
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {businessAnalyticsRoadmap.map((stage) => {
          const completedCount = stage.lessonIds.filter((id) => completedLessonIds.includes(id)).length;
          const complete = completedCount === stage.lessonIds.length;
          const nextId = stage.lessonIds.find((id) => !completedLessonIds.includes(id)) ?? stage.lessonIds[0];
          const nextLesson = getBusinessAnalyticsLesson(nextId);
          return (
            <article key={stage.id} className="flex flex-col rounded-3xl border border-indigo-100 bg-white/85 p-5 shadow-md">
              <div className="flex items-start justify-between gap-3">
                <span className="text-3xl" aria-hidden="true">{stage.icon}</span>
                {complete ? <CheckCircle2 className="text-emerald-600" size={22} aria-label="Stage complete" /> : <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-800">{completedCount}/{stage.lessonIds.length}</span>}
              </div>
              <h3 className="mt-4 text-lg font-black text-slate-950">{stage.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-6 text-slate-700">{stage.description}</p>
              {nextLesson ? <Link href={`/business-analytics-studio/${nextLesson.id}`} className="mt-4 rounded-xl bg-indigo-50 px-4 py-3 text-center text-sm font-bold text-indigo-800 transition hover:bg-indigo-100">{complete ? "Review stage" : `Next: ${nextLesson.title}`}</Link> : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
