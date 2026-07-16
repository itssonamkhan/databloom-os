import {
  certificationCatalog,
  certificationRoadmapStages,
  getCertificationDefinition,
  type CertificationDefinition,
} from "@/lib/certificationData";
import {
  CAREER_HUB_EVENT,
  deleteCertification,
  loadCareerHubState,
  saveCareerHubState,
  saveCertification,
  type CareerHubState,
  type CertificationInput,
  type CertificationRecord,
} from "@/lib/careerHub";
import { unlockAchievement } from "@/lib/unlockedAchievements";

export const CERTIFICATION_HUB_EVENT = CAREER_HUB_EVENT;
export const CERTIFICATION_XP = {
  firstAdded: 20,
  firstRoadmap: 40,
  firstCompleted: 50,
} as const;

export function getCertificationChecklist(definition?: CertificationDefinition) {
  return [
    ...certificationRoadmapStages.map((stage) => ({
      id: `roadmap:${stage.id}`,
      label: stage.title,
      guidance: stage.guidance,
      kind: "roadmap" as const,
    })),
    ...(definition?.practiceChecklist ?? []).map((label, index) => ({
      id: `practice:${index}`,
      label,
      guidance: "Complete this practical check and keep evidence in your notes or portfolio.",
      kind: "practice" as const,
    })),
  ];
}

export function getCertificationScopeId(record: CertificationRecord) {
  return record.catalogId || record.id;
}

export function getCertificationProgress(
  scopeId: string,
  definition = getCertificationDefinition(scopeId),
  state = loadCareerHubState(),
) {
  const items = getCertificationChecklist(definition);
  const completed = new Set(state.certificationChecklist[scopeId] ?? []);
  const completedCount = items.filter((item) => completed.has(item.id)).length;
  return {
    completed: completedCount,
    total: items.length,
    percentage: items.length ? Math.round((completedCount / items.length) * 100) : 0,
    roadmapCompleted: certificationRoadmapStages.every((stage) =>
      completed.has(`roadmap:${stage.id}`),
    ),
  };
}

export function toggleCertificationFavorite(catalogId: string) {
  const state = loadCareerHubState();
  const favorite = state.certificationFavoriteIds.includes(catalogId);
  const next = {
    ...state,
    certificationFavoriteIds: favorite
      ? state.certificationFavoriteIds.filter((id) => id !== catalogId)
      : [...state.certificationFavoriteIds, catalogId],
  };
  return saveCareerHubState(next, "certification-favorite") ? next : state;
}

export function saveCertificationNote(catalogId: string, note: string) {
  const state = loadCareerHubState();
  const next = {
    ...state,
    certificationNotes: { ...state.certificationNotes, [catalogId]: note },
  };
  return saveCareerHubState(next, "certification-note") ? next : state;
}

export function toggleCertificationPreparationStep(scopeId: string, stepId: string) {
  const state = loadCareerHubState();
  const current = state.certificationChecklist[scopeId] ?? [];
  const checked = current.includes(stepId);
  const completed = checked
    ? current.filter((id) => id !== stepId)
    : [...current, stepId];
  const milestones = [...state.certificationRewardedMilestones];
  const roadmapNowComplete = certificationRoadmapStages.every((stage) =>
    completed.includes(`roadmap:${stage.id}`),
  );
  let xpAward = 0;
  if (roadmapNowComplete && !milestones.includes("first-roadmap-completed")) {
    milestones.push("first-roadmap-completed");
    xpAward = CERTIFICATION_XP.firstRoadmap;
  }
  const next: CareerHubState = {
    ...state,
    certificationChecklist: {
      ...state.certificationChecklist,
      [scopeId]: completed,
    },
    certificationRewardedMilestones: milestones,
  };
  const saved = saveCareerHubState(next, "certification-preparation");
  if (saved && roadmapNowComplete) unlockAchievement("certification_ready");
  return {
    state: saved ? next : state,
    checked: saved ? !checked : checked,
    xpAward: saved ? xpAward : 0,
  };
}

export function addCatalogCertificationToTracker(definition: CertificationDefinition) {
  const state = loadCareerHubState();
  const existing = state.certifications.find((item) => item.catalogId === definition.id);
  if (existing) return { saved: true, item: existing, state, xpAward: 0, existing: true };
  const input: CertificationInput = {
    catalogId: definition.id,
    name: definition.name,
    provider: definition.provider,
    status: "Planned",
    targetDate: "",
    startDate: "",
    completionDate: "",
    certificateLink: "",
    credentialId: "",
    notes: "",
  };
  return { ...saveCertification(input), existing: false };
}

export function saveCertificationTrackerRecord(input: CertificationInput, id?: string) {
  return saveCertification(input, id);
}

export function deleteCertificationTrackerRecord(id: string) {
  return deleteCertification(id);
}

export function getCertificationSummary(state = loadCareerHubState()) {
  const planned = state.certifications.filter((item) => item.status === "Planned").length;
  const inProgress = state.certifications.filter((item) =>
    item.status === "In Progress" || item.status === "Exam Scheduled",
  ).length;
  const completed = state.certifications.filter((item) => item.status === "Completed").length;
  const readinessValues = state.certifications.map((item) => {
    const scopeId = getCertificationScopeId(item);
    return getCertificationProgress(scopeId, getCertificationDefinition(item.catalogId), state).percentage;
  });
  const preparationStepsCompleted = Object.values(state.certificationChecklist)
    .reduce((total, ids) => total + ids.length, 0);
  const upcomingTargets = state.certifications
    .filter((item) => item.targetDate && item.status !== "Completed")
    .sort((left, right) => left.targetDate.localeCompare(right.targetDate));
  return {
    tracked: state.certifications.length,
    interested: state.certifications.filter((item) => item.status === "Interested").length,
    planned,
    inProgress,
    completed,
    paused: state.certifications.filter((item) => item.status === "Paused").length,
    preparationStepsCompleted,
    readinessProgress: readinessValues.length
      ? Math.round(readinessValues.reduce((total, value) => total + value, 0) / readinessValues.length)
      : 0,
    upcomingTargets,
    favorites: state.certificationFavoriteIds.length,
    catalogSize: certificationCatalog.length,
  };
}
