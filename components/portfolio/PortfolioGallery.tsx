import { FolderOpen } from "lucide-react";

import type { PortfolioProject } from "@/lib/portfolioProjects";

export default function PortfolioGallery({
  projects,
}: {
  projects: PortfolioProject[];
}) {
  if (!projects.length) {
    return (
      <section
        data-databloom-glass
        className="rounded-3xl border border-dashed p-10 text-center shadow-sm"
      >
        <FolderOpen
          className="mx-auto text-[var(--databloom-text-accent)]"
          size={34}
        />
        <h2 className="mt-3 text-2xl font-black text-[var(--databloom-text-heading)]">
          Your portfolio gallery is ready to grow.
        </h2>
        <p className="mx-auto mt-2 max-w-xl leading-7 text-[var(--databloom-text-secondary)]">
          Complete a project to add its badge, skills, portfolio description,
          and resume-ready bullet here.
        </p>
      </section>
    );
  }

  return (
    <section aria-labelledby="portfolio-gallery-heading">
      <p className="text-sm font-black uppercase tracking-[0.16em] text-[var(--databloom-text-accent)]">
        Completed work
      </p>
      <h2
        id="portfolio-gallery-heading"
        className="mt-1 text-3xl font-black text-[var(--databloom-text-heading)]"
      >
        🖼️ Portfolio Gallery
      </h2>
      <p className="mt-2 text-[var(--databloom-text-secondary)]">
        A modular record of completed projects, ready for future export and
        sharing features.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {projects.map((project) => (
          <article
            key={project.id}
            data-databloom-glass
            className="rounded-3xl border p-6 shadow-md"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-4xl" aria-hidden="true">
                  {project.achievementBadge.icon}
                </span>
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-[var(--databloom-text-accent)]">
                    {project.achievementBadge.title}
                  </p>
                  <h3 className="mt-1 text-xl font-black text-[var(--databloom-text-heading)]">
                    {project.title}
                  </h3>
                </div>
              </div>
              <span className="rounded-full border border-[var(--databloom-border)] bg-[var(--databloom-accent-soft)] px-3 py-1 text-xs font-black text-[var(--databloom-text-heading)]">
                {project.difficulty}
              </span>
            </div>
            <div className="mt-5">
              <p className="text-sm font-black text-[var(--databloom-text-heading)]">
                Skills used
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {project.skillsRequired.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full border border-[var(--databloom-border)] bg-[var(--databloom-card)] px-3 py-1 text-xs font-bold text-[var(--databloom-text-secondary)]"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <GalleryDetail
              label="Portfolio description"
              value={project.portfolioDescription}
            />
            <GalleryDetail
              label="Resume bullet"
              value={project.resumeBullet}
            />
            <p className="mt-5 inline-flex rounded-full border border-[var(--databloom-border)] bg-[var(--databloom-accent-soft)] px-3 py-1 text-xs font-black text-[var(--databloom-text-heading)]">
              ✓ Completion saved
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

function GalleryDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="mt-5">
      <p className="text-sm font-black text-[var(--databloom-text-heading)]">
        {label}
      </p>
      <p className="mt-1 text-sm leading-6 text-[var(--databloom-text-secondary)]">
        {value}
      </p>
    </div>
  );
}
