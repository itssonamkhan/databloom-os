import { ArrowUpRight, CheckCircle2, Clock3, Wrench } from "lucide-react";
import Link from "next/link";

import type { PortfolioProject } from "@/lib/portfolioProjects";
import { playClickSound } from "@/lib/sounds";

export default function PortfolioProjectCard({
  project,
  completed,
}: {
  project: PortfolioProject;
  completed: boolean;
}) {
  return (
    <article
      data-databloom-glass
      className="flex h-full min-w-0 flex-col rounded-3xl border p-5 shadow-md sm:p-6"
    >
      <div className="flex items-start justify-between gap-4">
        <span
          className="grid size-14 shrink-0 place-items-center rounded-2xl border border-[var(--databloom-border)] bg-[var(--databloom-accent-soft)] text-3xl shadow-sm"
          aria-hidden="true"
        >
          {project.icon}
        </span>
        {completed ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--databloom-border)] bg-[var(--databloom-accent-soft)] px-3 py-1.5 text-xs font-black text-[var(--databloom-text-heading)]">
            <CheckCircle2 size={15} />
            Completed
          </span>
        ) : null}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <Badge>{project.category}</Badge>
        <Badge>{project.difficulty}</Badge>
      </div>
      <h3 className="mt-4 text-2xl font-black text-[var(--databloom-text-heading)]">
        {project.title}
      </h3>
      <p className="mt-3 line-clamp-3 leading-7 text-[var(--databloom-text-secondary)]">
        {project.businessScenario}
      </p>

      <div className="mt-5 space-y-3 text-sm text-[var(--databloom-text-secondary)]">
        <p className="flex items-start gap-2.5">
          <Clock3
            className="mt-0.5 shrink-0 text-[var(--databloom-text-accent)]"
            size={17}
          />
          <span>
            <strong className="text-[var(--databloom-text-heading)]">
              Estimated time:
            </strong>{" "}
            {project.estimatedTime}
          </span>
        </p>
        <p className="flex items-start gap-2.5">
          <Wrench
            className="mt-0.5 shrink-0 text-[var(--databloom-text-accent)]"
            size={17}
          />
          <span>
            <strong className="text-[var(--databloom-text-heading)]">
              Skills:
            </strong>{" "}
            {project.skillsRequired.slice(0, 3).join(", ")}
          </span>
        </p>
      </div>

      <div className="mt-auto pt-6">
        <Link
          href={`/portfolio-project-studio/${project.id}`}
          onClick={playClickSound}
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-[var(--databloom-action)] px-5 font-black text-[var(--databloom-text-on-accent)] shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--databloom-focus)]"
        >
          Open project
          <ArrowUpRight size={17} />
        </Link>
      </div>
    </article>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-[var(--databloom-border)] bg-[var(--databloom-accent-soft)] px-3 py-1 text-xs font-black text-[var(--databloom-text-heading)]">
      {children}
    </span>
  );
}
