import { unlockAchievement } from "@/lib/unlockedAchievements";

export const SMART_NOTES_STORAGE_KEY = "databloom-smart-notes-v1";
export const SMART_NOTES_EVENT = "databloom:smart-notes-updated";

export type FlashcardCandidate = {
  id: string;
  front: string;
  back: string;
  source: "note" | "manual";
};

export type SmartNote = {
  id: string;
  title: string;
  content: string;
  category: string;
  subject: string;
  tags: string[];
  collectionId: string | null;
  favorite: boolean;
  pinned: boolean;
  archived: boolean;
  trashed: boolean;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  lastViewedAt: string;
  writingSeconds: number;
  flashcardCandidates: FlashcardCandidate[];
};

export type StudyCollection = {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
};

export type SmartNotesState = {
  version: 1;
  notes: SmartNote[];
  collections: StudyCollection[];
  recentSearches: string[];
  rewardedMilestones: string[];
  activeNoteId: string | null;
};

export type NoteTemplate = {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: string;
  content: string;
};

export const noteTemplates: NoteTemplate[] = [
  { id: "lecture", name: "Lecture Notes", icon: "🎓", description: "Capture concepts, examples, and questions.", category: "Learning", content: "# Lecture topic\n\n## Key ideas\n- \n\n## Examples\n\n## Questions to revisit\n- [ ] " },
  { id: "formula", name: "Formula Notes", icon: "➗", description: "Record syntax, inputs, and worked examples.", category: "Formula", content: "# Formula\n\n**Syntax:** `=FORMULA()`\n\n| Input | Meaning |\n| --- | --- |\n|  |  |\n\n> [!TIP]\n> Add a worked example here." },
  { id: "cheat-sheet", name: "Cheat Sheet", icon: "⚡", description: "Build a compact quick-reference page.", category: "Reference", content: "# Cheat Sheet\n\n## Must remember\n- \n\n## Shortcuts\n- \n\n## Common mistakes\n- " },
  { id: "revision", name: "Revision Sheet", icon: "🔁", description: "Summarize a topic before practice.", category: "Revision", content: "# Revision topic\n\n## In one sentence\n\n## Key points\n1. \n2. \n3. \n\n## Self-check\n- [ ] I can explain this without notes\n- [ ] I can solve an example" },
  { id: "project", name: "Project Notes", icon: "📊", description: "Track a data project from question to insight.", category: "Project", content: "# Project\n\n## Business question\n\n## Data and approach\n\n## Findings\n\n## Next steps\n- [ ] " },
  { id: "interview", name: "Interview Notes", icon: "🎤", description: "Prepare stories, answers, and follow-ups.", category: "Interview", content: "# Interview preparation\n\n## Question\n\n## Answer outline\n\n## Evidence / example\n\n> [!NOTE]\n> Keep the answer concise and specific." },
  { id: "meeting", name: "Meeting Notes", icon: "🤝", description: "Capture decisions and action items.", category: "Meeting", content: "# Meeting\n\n## Agenda\n- \n\n## Notes\n\n## Decisions\n- \n\n## Actions\n- [ ] " },
  { id: "blank", name: "Blank", icon: "📝", description: "Start with a clean page.", category: "General", content: "" },
];

const emptyState = (): SmartNotesState => ({
  version: 1,
  notes: [],
  collections: [],
  recentSearches: [],
  rewardedMilestones: [],
  activeNoteId: null,
});

function canUseStorage() {
  return typeof window !== "undefined" && "localStorage" in window;
}

function record(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function text(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function strings(value: unknown) {
  return Array.isArray(value)
    ? Array.from(new Set(value.filter((item): item is string => typeof item === "string")))
    : [];
}

function normalizeNote(value: unknown): SmartNote | null {
  const item = record(value);
  const id = text(item.id);
  if (!id) return null;
  const createdAt = text(item.createdAt, new Date().toISOString());
  return {
    id,
    title: text(item.title, "Untitled note"),
    content: text(item.content),
    category: text(item.category, "General"),
    subject: text(item.subject, "General"),
    tags: strings(item.tags),
    collectionId: typeof item.collectionId === "string" ? item.collectionId : null,
    favorite: item.favorite === true,
    pinned: item.pinned === true,
    archived: item.archived === true,
    trashed: item.trashed === true,
    completed: item.completed === true,
    createdAt,
    updatedAt: text(item.updatedAt, createdAt),
    lastViewedAt: text(item.lastViewedAt, createdAt),
    writingSeconds: typeof item.writingSeconds === "number" ? Math.max(0, item.writingSeconds) : 0,
    flashcardCandidates: Array.isArray(item.flashcardCandidates)
      ? item.flashcardCandidates.map((candidate) => {
          const card = record(candidate);
          return { id: text(card.id), front: text(card.front), back: text(card.back), source: card.source === "manual" ? "manual" as const : "note" as const };
        }).filter((card) => card.id)
      : [],
  };
}

function normalizeCollection(value: unknown): StudyCollection | null {
  const item = record(value);
  const id = text(item.id);
  const name = text(item.name);
  if (!id || !name) return null;
  const createdAt = text(item.createdAt, new Date().toISOString());
  return { id, name, description: text(item.description), createdAt, updatedAt: text(item.updatedAt, createdAt) };
}

export function loadSmartNotesState(): SmartNotesState {
  if (!canUseStorage()) return emptyState();
  try {
    const raw = window.localStorage.getItem(SMART_NOTES_STORAGE_KEY);
    if (!raw) return emptyState();
    const value = record(JSON.parse(raw));
    return {
      version: 1,
      notes: Array.isArray(value.notes) ? value.notes.map(normalizeNote).filter((item): item is SmartNote => Boolean(item)) : [],
      collections: Array.isArray(value.collections) ? value.collections.map(normalizeCollection).filter((item): item is StudyCollection => Boolean(item)) : [],
      recentSearches: strings(value.recentSearches).slice(0, 6),
      rewardedMilestones: strings(value.rewardedMilestones),
      activeNoteId: typeof value.activeNoteId === "string" ? value.activeNoteId : null,
    };
  } catch {
    return emptyState();
  }
}

export function saveSmartNotesState(state: SmartNotesState, reason = "updated") {
  if (!canUseStorage()) return false;
  try {
    window.localStorage.setItem(SMART_NOTES_STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new CustomEvent(SMART_NOTES_EVENT, { detail: { reason } }));
    return true;
  } catch {
    return false;
  }
}

function newId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function reward(state: SmartNotesState, milestone: string, xp: number) {
  if (state.rewardedMilestones.includes(milestone)) return { state, xpAward: 0 };
  return { state: { ...state, rewardedMilestones: [...state.rewardedMilestones, milestone] }, xpAward: xp };
}

export function createSmartNote(templateId = "blank") {
  const current = loadSmartNotesState();
  const template = noteTemplates.find((item) => item.id === templateId) ?? noteTemplates.at(-1)!;
  const now = new Date().toISOString();
  const note: SmartNote = {
    id: newId("note"), title: template.name === "Blank" ? "Untitled note" : template.name,
    content: template.content, category: template.category, subject: "General", tags: [], collectionId: null,
    favorite: false, pinned: false, archived: false, trashed: false, completed: false,
    createdAt: now, updatedAt: now, lastViewedAt: now, writingSeconds: 0, flashcardCandidates: [],
  };
  const rewarded = reward({ ...current, notes: [note, ...current.notes], activeNoteId: note.id }, "first-note-created", 15);
  const saved = saveSmartNotesState(rewarded.state, "note-created");
  if (saved) unlockAchievement("notes_starter");
  return { state: saved ? rewarded.state : current, note, xpAward: saved ? rewarded.xpAward : 0 };
}

export function updateSmartNote(id: string, patch: Partial<Omit<SmartNote, "id" | "createdAt">>, writingSecondsDelta = 0) {
  const current = loadSmartNotesState();
  const now = new Date().toISOString();
  let found = false;
  const notes = current.notes.map((note) => {
    if (note.id !== id) return note;
    found = true;
    return { ...note, ...patch, id: note.id, createdAt: note.createdAt, updatedAt: now, writingSeconds: note.writingSeconds + Math.max(0, writingSecondsDelta) };
  });
  if (!found) return { state: current, saved: false };
  const next = { ...current, notes, activeNoteId: id };
  const saved = saveSmartNotesState(next, "note-saved");
  return { state: saved ? next : current, saved };
}

export function viewSmartNote(id: string) {
  return updateSmartNote(id, { lastViewedAt: new Date().toISOString() });
}

export function toggleSmartNoteCompleted(id: string) {
  const current = loadSmartNotesState();
  const note = current.notes.find((item) => item.id === id);
  if (!note) return { state: current, completed: false, xpAward: 0 };
  const completed = !note.completed;
  const notes = current.notes.map((item) => item.id === id ? { ...item, completed, updatedAt: new Date().toISOString() } : item);
  const rewarded = completed ? reward({ ...current, notes }, "first-note-completed", 20) : { state: { ...current, notes }, xpAward: 0 };
  const saved = saveSmartNotesState(rewarded.state, "note-completion");
  if (saved && completed) unlockAchievement("notes_finisher");
  return { state: saved ? rewarded.state : current, completed: saved && completed, xpAward: saved ? rewarded.xpAward : 0 };
}

export function createStudyCollection(name: string, description = "") {
  const current = loadSmartNotesState();
  const cleanName = name.trim();
  if (!cleanName) return { state: current, collection: null, xpAward: 0 };
  const now = new Date().toISOString();
  const collection: StudyCollection = { id: newId("collection"), name: cleanName, description: description.trim(), createdAt: now, updatedAt: now };
  const rewarded = reward({ ...current, collections: [collection, ...current.collections] }, "first-collection-created", 15);
  const saved = saveSmartNotesState(rewarded.state, "collection-created");
  if (saved) unlockAchievement("notes_collector");
  return { state: saved ? rewarded.state : current, collection: saved ? collection : null, xpAward: saved ? rewarded.xpAward : 0 };
}

export function deleteStudyCollection(id: string) {
  const current = loadSmartNotesState();
  const next = { ...current, collections: current.collections.filter((item) => item.id !== id), notes: current.notes.map((note) => note.collectionId === id ? { ...note, collectionId: null } : note) };
  const saved = next.collections.length !== current.collections.length && saveSmartNotesState(next, "collection-deleted");
  return { state: saved ? next : current, saved };
}

export function permanentlyDeleteSmartNote(id: string) {
  const current = loadSmartNotesState();
  const next = { ...current, notes: current.notes.filter((item) => item.id !== id), activeNoteId: current.activeNoteId === id ? null : current.activeNoteId };
  const saved = next.notes.length !== current.notes.length && saveSmartNotesState(next, "note-deleted");
  return { state: saved ? next : current, saved };
}

export function rememberSmartNotesSearch(query: string) {
  const current = loadSmartNotesState();
  const clean = query.trim();
  if (!clean) return current;
  const next = { ...current, recentSearches: [clean, ...current.recentSearches.filter((item) => item.toLowerCase() !== clean.toLowerCase())].slice(0, 6) };
  saveSmartNotesState(next, "search");
  return next;
}

export function getSmartNotesSummary(state = loadSmartNotesState()) {
  const notes = state.notes.filter((note) => !note.trashed);
  const writingSeconds = notes.reduce((total, note) => total + note.writingSeconds, 0);
  const completed = notes.filter((note) => note.completed).length;
  return {
    notesCreated: notes.length,
    notesCompleted: completed,
    writingSeconds,
    writingMinutes: Math.round(writingSeconds / 60),
    collections: state.collections.length,
    favorites: notes.filter((note) => note.favorite).length,
    pinned: notes.filter((note) => note.pinned).length,
    progressPercentage: notes.length ? Math.round((completed / notes.length) * 100) : 0,
  };
}
