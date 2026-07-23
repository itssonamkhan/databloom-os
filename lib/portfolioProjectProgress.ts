import { getPortfolioProject, portfolioProjects } from "@/lib/portfolioProjects";

export const PORTFOLIO_PROJECT_STORAGE_KEY =
  "databloom-portfolio-projects-v1";
export const PORTFOLIO_PROJECT_EVENT =
  "databloom:portfolio-projects-updated";

export type PortfolioProjectProgress = {
  version: 1;
  completedProjectIds: string[];
  rewardedProjectIds: string[];
  reflectionNotes: Record<string, string>;
};

const emptyProgress = (): PortfolioProjectProgress => ({
  version: 1,
  completedProjectIds: [],
  rewardedProjectIds: [],
  reflectionNotes: {},
});

function uniqueStrings(value: unknown) {
  return Array.isArray(value)
    ? Array.from(
        new Set(
          value.filter((item): item is string => typeof item === "string"),
        ),
      )
    : [];
}

function stringRecord(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value).filter(
      (entry): entry is [string, string] => typeof entry[1] === "string",
    ),
  );
}

function normalizeProgress(value: unknown): PortfolioProjectProgress {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return emptyProgress();
  }
  const progress = value as Partial<PortfolioProjectProgress>;
  return {
    version: 1,
    completedProjectIds: uniqueStrings(progress.completedProjectIds),
    rewardedProjectIds: uniqueStrings(progress.rewardedProjectIds),
    reflectionNotes: stringRecord(progress.reflectionNotes),
  };
}

export function loadPortfolioProjectProgress(): PortfolioProjectProgress {
  if (typeof window === "undefined") return emptyProgress();
  try {
    const stored = window.localStorage.getItem(PORTFOLIO_PROJECT_STORAGE_KEY);
    return stored ? normalizeProgress(JSON.parse(stored)) : emptyProgress();
  } catch {
    return emptyProgress();
  }
}

function savePortfolioProjectProgress(
  progress: PortfolioProjectProgress,
  reason: string,
) {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(
      PORTFOLIO_PROJECT_STORAGE_KEY,
      JSON.stringify(progress),
    );
    window.dispatchEvent(
      new CustomEvent(PORTFOLIO_PROJECT_EVENT, {
        detail: { reason, progress },
      }),
    );
    return true;
  } catch {
    return false;
  }
}

export function completePortfolioProject(id: string) {
  const progress = loadPortfolioProjectProgress();
  const project = getPortfolioProject(id);
  if (!project || progress.completedProjectIds.includes(id)) {
    return { state: progress, newlyCompleted: false, xpAward: 0 };
  }
  const newlyRewarded = !progress.rewardedProjectIds.includes(id);
  const next: PortfolioProjectProgress = {
    ...progress,
    completedProjectIds: [...progress.completedProjectIds, id],
    rewardedProjectIds: newlyRewarded
      ? [...progress.rewardedProjectIds, id]
      : progress.rewardedProjectIds,
  };
  const saved = savePortfolioProjectProgress(next, "project-completed");
  return {
    state: saved ? next : progress,
    newlyCompleted: saved,
    xpAward: saved && newlyRewarded ? project.xpReward : 0,
  };
}

export function getPortfolioReflection(id: string) {
  return loadPortfolioProjectProgress().reflectionNotes[id] ?? "";
}

export function savePortfolioReflection(id: string, note: string) {
  if (!id) return false;
  const progress = loadPortfolioProjectProgress();
  const reflectionNotes = { ...progress.reflectionNotes };
  if (note.trim()) reflectionNotes[id] = note;
  else delete reflectionNotes[id];
  return savePortfolioProjectProgress(
    { ...progress, reflectionNotes },
    "reflection-saved",
  );
}

export function getPortfolioProjectSummary(
  progress = loadPortfolioProjectProgress(),
) {
  const knownIds = new Set(portfolioProjects.map((project) => project.id));
  const completed = progress.completedProjectIds.filter((id) =>
    knownIds.has(id),
  ).length;
  return {
    completed,
    total: portfolioProjects.length,
    percentage: portfolioProjects.length
      ? Math.round((completed / portfolioProjects.length) * 100)
      : 0,
  };
}
