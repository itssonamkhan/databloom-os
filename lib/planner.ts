export const PLANNER_STORAGE_KEY = "databloom-planner-v1";
export const PLANNER_EVENT = "databloom:planner-updated";

export const plannerPriorities = ["Low", "Medium", "High"] as const;
export const plannerRecurrences = ["None", "Daily", "Weekly"] as const;

export const plannerModules = [
  { label: "General Study", href: "/" },
  { label: "Formula Studio", href: "/formula-studio" },
  { label: "Statistics Studio", href: "/statistics-studio" },
  { label: "SQL Studio", href: "/sql-studio" },
  { label: "Power Query Studio", href: "/power-query-studio" },
  { label: "Power BI Studio", href: "/power-bi-studio" },
  { label: "Tableau Studio", href: "/tableau-studio" },
  { label: "Dashboard Studio", href: "/dashboard" },
  { label: "Python Studio", href: "/python-studio" },
  { label: "Business Analytics Studio", href: "/business-analytics-studio" },
  { label: "Dataset Library", href: "/dataset-library" },
  { label: "Practice Lab", href: "/practice-lab" },
  { label: "Smart Notes", href: "/smart-notes" },
  { label: "Flashcards", href: "/flashcards" },
  { label: "Interview Hub", href: "/interview-hub" },
  { label: "Certification Hub", href: "/certification-hub" },
  { label: "Career Hub", href: "/career-hub" },
] as const;

export type PlannerPriority = (typeof plannerPriorities)[number];
export type PlannerRecurrence = (typeof plannerRecurrences)[number];
export type PlannerModule = (typeof plannerModules)[number]["label"];

export type PlannerTask = {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  dueTime: string;
  priority: PlannerPriority;
  relatedModule: PlannerModule;
  recurrence: PlannerRecurrence;
  completed: boolean;
  everCompleted: boolean;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  seriesId: string;
};

export type PlannerTaskInput = Pick<
  PlannerTask,
  | "title"
  | "description"
  | "dueDate"
  | "dueTime"
  | "priority"
  | "relatedModule"
  | "recurrence"
>;

export type PlannerState = {
  version: 1;
  tasks: PlannerTask[];
  rewardedMilestones: string[];
};

export type PlannerSummary = {
  total: number;
  completed: number;
  today: number;
  upcoming: number;
  overdue: number;
  progressPercentage: number;
};

const EMPTY_STATE: PlannerState = {
  version: 1,
  tasks: [],
  rewardedMilestones: [],
};

const milestoneRewards = [
  { id: "first-task-completed", count: 1, xp: 25 },
  { id: "five-tasks-completed", count: 5, xp: 50 },
  { id: "ten-tasks-completed", count: 10, xp: 75 },
] as const;

function canUseStorage() {
  return typeof window !== "undefined" && "localStorage" in window;
}

function strings(value: unknown): string[] {
  return Array.isArray(value)
    ? Array.from(new Set(value.filter((item): item is string => typeof item === "string")))
    : [];
}

function isPriority(value: unknown): value is PlannerPriority {
  return plannerPriorities.some((item) => item === value);
}

function isRecurrence(value: unknown): value is PlannerRecurrence {
  return plannerRecurrences.some((item) => item === value);
}

function isModule(value: unknown): value is PlannerModule {
  return plannerModules.some((item) => item.label === value);
}

function normalizeTask(value: unknown): PlannerTask | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const task = value as Partial<PlannerTask>;
  if (typeof task.id !== "string" || typeof task.title !== "string") return null;

  const createdAt = typeof task.createdAt === "string" ? task.createdAt : new Date().toISOString();
  return {
    id: task.id,
    title: task.title.trim(),
    description: typeof task.description === "string" ? task.description : "",
    dueDate: typeof task.dueDate === "string" ? task.dueDate : "",
    dueTime: typeof task.dueTime === "string" ? task.dueTime : "",
    priority: isPriority(task.priority) ? task.priority : "Medium",
    relatedModule: isModule(task.relatedModule) ? task.relatedModule : "General Study",
    recurrence: isRecurrence(task.recurrence) ? task.recurrence : "None",
    completed: task.completed === true,
    everCompleted: task.everCompleted === true || task.completed === true,
    createdAt,
    updatedAt: typeof task.updatedAt === "string" ? task.updatedAt : createdAt,
    completedAt: typeof task.completedAt === "string" ? task.completedAt : null,
    seriesId: typeof task.seriesId === "string" ? task.seriesId : task.id,
  };
}

function normalizeState(value: unknown): PlannerState {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { ...EMPTY_STATE, tasks: [], rewardedMilestones: [] };
  }
  const state = value as Partial<PlannerState>;
  return {
    version: 1,
    tasks: Array.isArray(state.tasks)
      ? state.tasks.map(normalizeTask).filter((task): task is PlannerTask => Boolean(task))
      : [],
    rewardedMilestones: strings(state.rewardedMilestones),
  };
}

export function localDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function createId(prefix = "task") {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function dispatchPlannerUpdate(state: PlannerState) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(PLANNER_EVENT, { detail: state }));
}

export function loadPlannerState(): PlannerState {
  if (!canUseStorage()) return { ...EMPTY_STATE, tasks: [], rewardedMilestones: [] };
  try {
    const stored = window.localStorage.getItem(PLANNER_STORAGE_KEY);
    return stored ? normalizeState(JSON.parse(stored)) : { ...EMPTY_STATE, tasks: [], rewardedMilestones: [] };
  } catch {
    return { ...EMPTY_STATE, tasks: [], rewardedMilestones: [] };
  }
}

export function savePlannerState(state: PlannerState): boolean {
  if (!canUseStorage()) return false;
  try {
    window.localStorage.setItem(PLANNER_STORAGE_KEY, JSON.stringify(state));
    dispatchPlannerUpdate(state);
    return true;
  } catch {
    return false;
  }
}

export function createPlannerTask(input: PlannerTaskInput): PlannerState {
  const state = loadPlannerState();
  const now = new Date().toISOString();
  const id = createId();
  const task: PlannerTask = {
    ...input,
    title: input.title.trim(),
    description: input.description.trim(),
    id,
    completed: false,
    everCompleted: false,
    createdAt: now,
    updatedAt: now,
    completedAt: null,
    seriesId: id,
  };
  const next = { ...state, tasks: [task, ...state.tasks] };
  return savePlannerState(next) ? next : state;
}

export function updatePlannerTask(id: string, input: PlannerTaskInput): PlannerState {
  const state = loadPlannerState();
  const next = {
    ...state,
    tasks: state.tasks.map((task) =>
      task.id === id
        ? {
            ...task,
            ...input,
            title: input.title.trim(),
            description: input.description.trim(),
            updatedAt: new Date().toISOString(),
          }
        : task,
    ),
  };
  return savePlannerState(next) ? next : state;
}

export function deletePlannerTask(id: string): PlannerState {
  const state = loadPlannerState();
  const next = { ...state, tasks: state.tasks.filter((task) => task.id !== id) };
  return savePlannerState(next) ? next : state;
}

function nextRecurringDate(task: PlannerTask): string {
  const base = task.dueDate ? new Date(`${task.dueDate}T12:00:00`) : new Date();
  base.setDate(base.getDate() + (task.recurrence === "Weekly" ? 7 : 1));
  return localDateKey(base);
}

export function setPlannerTaskCompletion(
  id: string,
  completed: boolean,
): { state: PlannerState; firstCompletion: boolean; xpAward: number } {
  const state = loadPlannerState();
  const current = state.tasks.find((task) => task.id === id);
  if (!current || current.completed === completed) {
    return { state, firstCompletion: false, xpAward: 0 };
  }

  const firstCompletion = completed && !current.everCompleted;
  const now = new Date().toISOString();
  let tasks = state.tasks.map((task) =>
    task.id === id
      ? {
          ...task,
          completed,
          everCompleted: task.everCompleted || completed,
          completedAt: completed ? now : null,
          updatedAt: now,
        }
      : task,
  );

  if (firstCompletion && current.recurrence !== "None") {
    const dueDate = nextRecurringDate(current);
    const alreadyCreated = tasks.some(
      (task) => task.seriesId === current.seriesId && task.dueDate === dueDate,
    );
    if (!alreadyCreated) {
      const recurringId = createId("recurring");
      tasks = [
        {
          ...current,
          id: recurringId,
          dueDate,
          completed: false,
          everCompleted: false,
          createdAt: now,
          updatedAt: now,
          completedAt: null,
        },
        ...tasks,
      ];
    }
  }

  let rewardedMilestones = state.rewardedMilestones;
  let xpAward = 0;
  if (firstCompletion) {
    const completedEver = tasks.filter((task) => task.everCompleted).length;
    for (const milestone of milestoneRewards) {
      if (
        completedEver >= milestone.count &&
        !rewardedMilestones.includes(milestone.id)
      ) {
        rewardedMilestones = [...rewardedMilestones, milestone.id];
        xpAward += milestone.xp;
      }
    }
  }

  const next = { ...state, tasks, rewardedMilestones };
  return savePlannerState(next)
    ? { state: next, firstCompletion, xpAward }
    : { state, firstCompletion: false, xpAward: 0 };
}

export function getPlannerSummary(state = loadPlannerState()): PlannerSummary {
  const today = localDateKey();
  const completed = state.tasks.filter((task) => task.completed).length;
  const active = state.tasks.filter((task) => !task.completed);
  return {
    total: state.tasks.length,
    completed,
    today: active.filter((task) => !task.dueDate || task.dueDate === today).length,
    upcoming: active.filter((task) => task.dueDate > today).length,
    overdue: active.filter((task) => task.dueDate && task.dueDate < today).length,
    progressPercentage: state.tasks.length
      ? Math.round((completed / state.tasks.length) * 100)
      : 0,
  };
}

export function getPlannerModuleHref(module: PlannerModule): string {
  return plannerModules.find((item) => item.label === module)?.href ?? "/";
}
