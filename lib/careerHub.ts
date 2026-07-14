import {
  allCareerCompletionIds,
  careerChecklistItems,
  careerGuides,
  careerRoadmaps,
  careerSections,
  type CareerSection,
} from "@/lib/careerHubData";
import { unlockAchievement } from "@/lib/unlockedAchievements";

export const CAREER_HUB_STORAGE_KEY = "databloom-career-hub-v1";
export const CAREER_HUB_EVENT = "databloom:career-hub-updated";

export const internshipStatuses = ["Interested", "Applied", "Assessment", "Interview", "Offer", "Rejected", "Withdrawn"] as const;
export const jobStatuses = ["Wishlist", "Applied", "Assessment", "Interviewing", "Offer", "Rejected"] as const;
export const certificationStatuses = ["Planned", "In progress", "Completed"] as const;

export type ApplicationKind = "internship" | "job";
export type ApplicationRecord = {
  id: string;
  kind: ApplicationKind;
  company: string;
  role: string;
  workType: string;
  location: string;
  applicationLink: string;
  dateApplied: string;
  deadline: string;
  status: string;
  interviewStage: string;
  notes: string;
  followUpDate: string;
  createdAt: string;
  updatedAt: string;
};

export type CertificationRecord = {
  id: string;
  name: string;
  provider: string;
  status: (typeof certificationStatuses)[number];
  startDate: string;
  completionDate: string;
  certificateLink: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type CareerHubState = {
  version: 1;
  completedIds: string[];
  rewardedIds: string[];
  applications: ApplicationRecord[];
  certifications: CertificationRecord[];
  favoriteCompanyIds: string[];
  companyNotes: Record<string, string>;
  lastSection: CareerSection;
};

function emptyState(): CareerHubState {
  return {
    version: 1,
    completedIds: [],
    rewardedIds: [],
    applications: [],
    certifications: [],
    favoriteCompanyIds: [],
    companyNotes: {},
    lastSection: "home",
  };
}

function canUseStorage() {
  return typeof window !== "undefined" && "localStorage" in window;
}

function strings(value: unknown) {
  if (!Array.isArray(value)) return [];
  return Array.from(new Set(value.filter((item): item is string => typeof item === "string")));
}

function text(value: unknown) {
  return typeof value === "string" ? value : "";
}

function record(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function validApplication(value: unknown): ApplicationRecord | null {
  const item = record(value);
  const kind = item.kind === "internship" || item.kind === "job" ? item.kind : null;
  if (!kind || !text(item.id) || !text(item.company) || !text(item.role)) return null;
  return {
    id: text(item.id), kind, company: text(item.company), role: text(item.role),
    workType: text(item.workType), location: text(item.location), applicationLink: text(item.applicationLink),
    dateApplied: text(item.dateApplied), deadline: text(item.deadline), status: text(item.status),
    interviewStage: text(item.interviewStage), notes: text(item.notes), followUpDate: text(item.followUpDate),
    createdAt: text(item.createdAt), updatedAt: text(item.updatedAt),
  };
}

function validCertification(value: unknown): CertificationRecord | null {
  const item = record(value);
  const status = certificationStatuses.includes(item.status as CertificationRecord["status"])
    ? (item.status as CertificationRecord["status"])
    : "Planned";
  if (!text(item.id) || !text(item.name)) return null;
  return {
    id: text(item.id), name: text(item.name), provider: text(item.provider), status,
    startDate: text(item.startDate), completionDate: text(item.completionDate),
    certificateLink: text(item.certificateLink), notes: text(item.notes),
    createdAt: text(item.createdAt), updatedAt: text(item.updatedAt),
  };
}

export function loadCareerHubState(): CareerHubState {
  if (!canUseStorage()) return emptyState();
  try {
    const stored = window.localStorage.getItem(CAREER_HUB_STORAGE_KEY);
    if (!stored) return emptyState();
    const value = record(JSON.parse(stored));
    const notes = record(value.companyNotes);
    const lastSection = careerSections.includes(value.lastSection as CareerSection)
      ? (value.lastSection as CareerSection)
      : "home";
    return {
      version: 1,
      completedIds: strings(value.completedIds),
      rewardedIds: strings(value.rewardedIds),
      applications: Array.isArray(value.applications)
        ? value.applications.map(validApplication).filter((item): item is ApplicationRecord => Boolean(item))
        : [],
      certifications: Array.isArray(value.certifications)
        ? value.certifications.map(validCertification).filter((item): item is CertificationRecord => Boolean(item))
        : [],
      favoriteCompanyIds: strings(value.favoriteCompanyIds),
      companyNotes: Object.fromEntries(Object.entries(notes).filter((entry): entry is [string, string] => typeof entry[1] === "string")),
      lastSection,
    };
  } catch {
    return emptyState();
  }
}

export function saveCareerHubState(state: CareerHubState, reason = "updated") {
  if (!canUseStorage()) return false;
  try {
    window.localStorage.setItem(CAREER_HUB_STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new CustomEvent(CAREER_HUB_EVENT, { detail: { reason } }));
    return true;
  } catch {
    return false;
  }
}

export function setCareerSection(section: CareerSection) {
  const state = loadCareerHubState();
  const next = { ...state, lastSection: section };
  saveCareerHubState(next, "section");
  return next;
}

export function toggleCareerCompletion(id: string) {
  const state = loadCareerHubState();
  const completed = state.completedIds.includes(id);
  const newlyRewarded = !completed && !state.rewardedIds.includes(id);
  const next: CareerHubState = {
    ...state,
    completedIds: completed ? state.completedIds.filter((item) => item !== id) : [...state.completedIds, id],
    rewardedIds: newlyRewarded ? [...state.rewardedIds, id] : state.rewardedIds,
  };
  const saved = saveCareerHubState(next, "completion");
  if (saved && !completed) {
    if (next.completedIds.length === 1) unlockAchievement("career_starter");
    if (getCareerSummary(next).readiness === 100) unlockAchievement("career_ready");
  }
  return { state: saved ? next : state, completed: !completed && saved, xpAward: saved && newlyRewarded ? 10 : 0 };
}

function newId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export type ApplicationInput = Omit<ApplicationRecord, "id" | "createdAt" | "updatedAt">;

export function saveApplication(input: ApplicationInput, id?: string) {
  const state = loadCareerHubState();
  const now = new Date().toISOString();
  const existing = id ? state.applications.find((item) => item.id === id) : undefined;
  const item: ApplicationRecord = {
    ...input,
    id: existing?.id ?? newId(input.kind),
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  const applications = existing
    ? state.applications.map((current) => current.id === existing.id ? item : current)
    : [item, ...state.applications];
  const next = { ...state, applications };
  const saved = saveCareerHubState(next, existing ? "application-edited" : "application-added");
  if (saved && !existing) unlockAchievement("career_tracker");
  return { saved, item, state: saved ? next : state };
}

export function deleteApplication(id: string) {
  const state = loadCareerHubState();
  const next = { ...state, applications: state.applications.filter((item) => item.id !== id) };
  const changed = next.applications.length !== state.applications.length;
  return changed && saveCareerHubState(next, "application-deleted");
}

export type CertificationInput = Omit<CertificationRecord, "id" | "createdAt" | "updatedAt">;

export function saveCertification(input: CertificationInput, id?: string) {
  const state = loadCareerHubState();
  const now = new Date().toISOString();
  const existing = id ? state.certifications.find((item) => item.id === id) : undefined;
  const item: CertificationRecord = {
    ...input,
    id: existing?.id ?? newId("cert"),
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  const certifications = existing
    ? state.certifications.map((current) => current.id === existing.id ? item : current)
    : [item, ...state.certifications];
  const next = { ...state, certifications };
  return { saved: saveCareerHubState(next, existing ? "certification-edited" : "certification-added"), item, state: next };
}

export function deleteCertification(id: string) {
  const state = loadCareerHubState();
  const next = { ...state, certifications: state.certifications.filter((item) => item.id !== id) };
  const changed = next.certifications.length !== state.certifications.length;
  return changed && saveCareerHubState(next, "certification-deleted");
}

export function toggleFavoriteCompany(slug: string) {
  const state = loadCareerHubState();
  const favorite = state.favoriteCompanyIds.includes(slug);
  const next = {
    ...state,
    favoriteCompanyIds: favorite
      ? state.favoriteCompanyIds.filter((item) => item !== slug)
      : [...state.favoriteCompanyIds, slug],
  };
  saveCareerHubState(next, "company-favorite");
  return next;
}

export function saveCompanyNote(slug: string, note: string) {
  const state = loadCareerHubState();
  const next = { ...state, companyNotes: { ...state.companyNotes, [slug]: note } };
  saveCareerHubState(next, "company-note");
  return next;
}

function percent(completed: number, total: number) {
  return total ? Math.round((completed / total) * 100) : 0;
}

export function getCareerSummary(state = loadCareerHubState()) {
  const careerDone = careerChecklistItems.filter((item) => state.completedIds.includes(item.id)).length;
  const guideProgress = Object.fromEntries(careerGuides.map((guide) => {
    const done = guide.checklist.filter((item) => state.completedIds.includes(item.id)).length;
    return [guide.id, percent(done, guide.checklist.length)];
  })) as Record<(typeof careerGuides)[number]["id"], number>;
  const roadmapSteps = careerRoadmaps.flatMap((roadmap) => roadmap.steps);
  const roadmapDone = roadmapSteps.filter((step) => state.completedIds.includes(step.id)).length;
  const completedKnown = allCareerCompletionIds.filter((id) => state.completedIds.includes(id)).length;
  return {
    readiness: percent(careerDone, careerChecklistItems.length),
    careerCompleted: careerDone,
    careerTotal: careerChecklistItems.length,
    guideProgress,
    roadmapProgress: percent(roadmapDone, roadmapSteps.length),
    completedTasks: completedKnown,
    applications: state.applications.length,
    internships: state.applications.filter((item) => item.kind === "internship").length,
    jobs: state.applications.filter((item) => item.kind === "job").length,
    certifications: state.certifications.length,
    completedCertifications: state.certifications.filter((item) => item.status === "Completed").length,
  };
}

export function getRecommendedCareerAction(state = loadCareerHubState()) {
  const item = careerChecklistItems.find((candidate) => !state.completedIds.includes(candidate.id));
  return item
    ? { label: item.label, detail: `${item.category} · complete this readiness check`, section: "checklist" as CareerSection }
    : { label: "Review your active applications", detail: "Your readiness checklist is complete", section: "jobs" as CareerSection };
}
