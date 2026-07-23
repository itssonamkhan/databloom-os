"use client";

import { CheckCircle2, FolderKanban, GalleryHorizontalEnd } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import AppLayout from "@/components/layout/AppLayout";
import PortfolioGallery from "@/components/portfolio/PortfolioGallery";
import PortfolioProjectCard from "@/components/portfolio/PortfolioProjectCard";
import StudioFilterToolbar from "@/components/studio/StudioFilterToolbar";
import {
  portfolioProjectCategories,
  portfolioProjectDifficulties,
  portfolioProjects,
  type PortfolioProjectCategory,
} from "@/lib/portfolioProjects";
import {
  getPortfolioProjectSummary,
  loadPortfolioProjectProgress,
  PORTFOLIO_PROJECT_EVENT,
  type PortfolioProjectProgress,
} from "@/lib/portfolioProjectProgress";
import { playClickSound } from "@/lib/sounds";

type StudioView = "projects" | "gallery";

const emptyProgress: PortfolioProjectProgress = {
  version: 1,
  completedProjectIds: [],
  rewardedProjectIds: [],
  reflectionNotes: {},
};

export default function PortfolioProjectStudio() {
  const [view, setView] = useState<StudioView>("projects");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [difficulty, setDifficulty] = useState("All");
  const [progress, setProgress] =
    useState<PortfolioProjectProgress>(emptyProgress);

  useEffect(() => {
    const syncProgress = () => setProgress(loadPortfolioProjectProgress());
    const frame = window.requestAnimationFrame(syncProgress);
    window.addEventListener(PORTFOLIO_PROJECT_EVENT, syncProgress);
    window.addEventListener("storage", syncProgress);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener(PORTFOLIO_PROJECT_EVENT, syncProgress);
      window.removeEventListener("storage", syncProgress);
    };
  }, []);

  const filteredProjects = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return portfolioProjects.filter((project) => {
      const searchable = [
        project.title,
        project.category,
        project.difficulty,
        project.businessScenario,
        project.backgroundStory,
        project.portfolioDescription,
        ...project.skillsRequired,
      ]
        .join(" ")
        .toLocaleLowerCase();
      return (
        (!normalizedQuery || searchable.includes(normalizedQuery)) &&
        (category === "All" || project.category === category) &&
        (difficulty === "All" || project.difficulty === difficulty)
      );
    });
  }, [category, difficulty, query]);

  const completedSet = new Set(progress.completedProjectIds);
  const completedProjects = portfolioProjects.filter((project) =>
    completedSet.has(project.id),
  );
  const summary = getPortfolioProjectSummary(progress);
  const visibleCategories = portfolioProjectCategories.filter((itemCategory) =>
    filteredProjects.some((project) => project.category === itemCategory),
  );

  function changeView(next: StudioView) {
    playClickSound();
    setView(next);
  }

  return (
    <AppLayout>
      <div className="space-y-8 text-[var(--databloom-text-primary)]">
        <header
          data-databloom-glass
          className="rounded-[2rem] border p-7 shadow-lg sm:p-10"
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.16em] text-[var(--databloom-text-accent)]">
                <FolderKanban size={18} />
                From learning to credible proof
              </p>
              <h1 className="mt-3 text-4xl font-black tracking-tight text-[var(--databloom-text-heading)] sm:text-5xl">
                🏆 Portfolio Project Studio
              </h1>
              <p className="mt-4 text-lg leading-8 text-[var(--databloom-text-secondary)]">
                Build practical case studies for resumes, portfolios,
                interviews, internships, and scholarship applications.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <SummaryCard value={summary.completed} label="Completed" />
              <SummaryCard value={`${summary.percentage}%`} label="Progress" />
            </div>
          </div>
        </header>

        <nav
          aria-label="Portfolio Project Studio sections"
          className="flex flex-wrap gap-2 rounded-3xl border border-[var(--databloom-border)] bg-[var(--databloom-card)] p-3 shadow-md"
        >
          <ViewButton
            active={view === "projects"}
            onClick={() => changeView("projects")}
            icon={<FolderKanban size={17} />}
            label="Project Library"
          />
          <ViewButton
            active={view === "gallery"}
            onClick={() => changeView("gallery")}
            icon={<GalleryHorizontalEnd size={17} />}
            label={`Portfolio Gallery (${completedProjects.length})`}
          />
        </nav>

        {view === "gallery" ? (
          <PortfolioGallery projects={completedProjects} />
        ) : (
          <>
            <StudioFilterToolbar
              query={query}
              onQueryChange={setQuery}
              category={category}
              onCategoryChange={setCategory}
              categories={portfolioProjectCategories}
              difficulty={difficulty}
              onDifficultyChange={setDifficulty}
              difficulties={portfolioProjectDifficulties}
              resultCount={filteredProjects.length}
              searchPlaceholder="Search projects, skills, or business scenarios"
              heading="Find your next portfolio project"
            />

            {filteredProjects.length ? (
              <div className="space-y-10">
                {visibleCategories.map((itemCategory) => (
                  <ProjectCategory
                    key={itemCategory}
                    category={itemCategory}
                    projects={filteredProjects.filter(
                      (project) => project.category === itemCategory,
                    )}
                    completedIds={completedSet}
                  />
                ))}
              </div>
            ) : (
              <section
                data-databloom-glass
                className="rounded-3xl border border-dashed p-10 text-center shadow-sm"
              >
                <FolderKanban
                  className="mx-auto text-[var(--databloom-text-accent)]"
                  size={34}
                />
                <h2 className="mt-3 text-2xl font-black text-[var(--databloom-text-heading)]">
                  No projects match those filters.
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    setQuery("");
                    setCategory("All");
                    setDifficulty("All");
                  }}
                  className="mt-5 min-h-11 rounded-2xl bg-[var(--databloom-action)] px-5 font-black text-[var(--databloom-text-on-accent)] shadow-sm"
                >
                  Clear filters
                </button>
              </section>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}

function SummaryCard({
  value,
  label,
}: {
  value: number | string;
  label: string;
}) {
  return (
    <div className="min-w-28 rounded-2xl border border-[var(--databloom-border)] bg-[var(--databloom-card)] px-5 py-4 text-center shadow-sm">
      <p className="text-3xl font-black text-[var(--databloom-text-heading)]">
        {value}
      </p>
      <p className="mt-1 text-xs font-bold text-[var(--databloom-text-secondary)]">
        {label}
      </p>
    </div>
  );
}

function ViewButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`inline-flex min-h-11 items-center gap-2 rounded-2xl border px-5 text-sm font-black transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--databloom-focus)] ${
        active
          ? "border-[var(--databloom-border)] bg-[var(--databloom-accent-soft)] text-[var(--databloom-text-heading)] shadow-sm"
          : "border-transparent bg-transparent text-[var(--databloom-text-secondary)]"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function ProjectCategory({
  category,
  projects,
  completedIds,
}: {
  category: PortfolioProjectCategory;
  projects: typeof portfolioProjects;
  completedIds: Set<string>;
}) {
  const descriptions: Record<PortfolioProjectCategory, string> = {
    Beginner: "Build confidence with focused spreadsheet and reporting projects.",
    Intermediate: "Combine data preparation, analysis, KPIs, and stakeholder decisions.",
    Advanced: "Create governed, decision-ready work for complex business settings.",
    "Real World": "Practice transparent, ethical analysis for public and mission-led contexts.",
  };
  return (
    <section aria-labelledby={`portfolio-${category.replaceAll(" ", "-")}`}>
      <p className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.16em] text-[var(--databloom-text-accent)]">
        <CheckCircle2 size={17} />
        {projects.length} projects
      </p>
      <h2
        id={`portfolio-${category.replaceAll(" ", "-")}`}
        className="mt-1 text-3xl font-black text-[var(--databloom-text-heading)]"
      >
        {category}
      </h2>
      <p className="mt-2 text-[var(--databloom-text-secondary)]">
        {descriptions[category]}
      </p>
      <div className="mt-6 grid gap-6 md:grid-cols-2 2xl:grid-cols-3">
        {projects.map((project) => (
          <PortfolioProjectCard
            key={project.id}
            project={project}
            completed={completedIds.has(project.id)}
          />
        ))}
      </div>
    </section>
  );
}
