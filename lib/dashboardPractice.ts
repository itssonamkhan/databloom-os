export type PracticeProjectId = "sales" | "finance" | "hr";

type NumberAnswer = {
  kind: "number";
  value: number;
  tolerance?: number;
};

type TextAnswer = {
  kind: "text";
  accepted: readonly string[];
};

export type PracticeTask = {
  id: string;
  title: string;
  prompt: string;
  hint: string;
  answerPlaceholder: string;
  xpReward: number;
  answer: NumberAnswer | TextAnswer;
};

export type PracticeProject = {
  id: PracticeProjectId;
  title: string;
  icon: string;
  description: string;
  focus: string;
  practiceRoute: `/practice/${PracticeProjectId}`;
  cardClassName: string;
  dataset: {
    name: string;
    columns: readonly string[];
    rows: readonly (readonly string[])[];
  };
  tasks: readonly [PracticeTask, PracticeTask, PracticeTask];
};

export const practiceProjects: readonly PracticeProject[] = [
  {
    id: "sales",
    title: "Sales Analysis",
    icon: "📊",
    description:
      "Turn order-level sales data into clear revenue and product insights.",
    focus: "Revenue, regions, and products",
    practiceRoute: "/practice/sales",
    cardClassName:
      "border-pink-200 bg-gradient-to-br from-pink-50 via-white to-purple-50",
    dataset: {
      name: "June sales orders",
      columns: ["Order date", "Region", "Product", "Units", "Unit price"],
      rows: [
        ["03 Jun 2026", "North", "Analytics Template", "8", "$75"],
        ["05 Jun 2026", "West", "Excel Course", "12", "$45"],
        ["08 Jun 2026", "South", "Dashboard Setup", "5", "$120"],
        ["11 Jun 2026", "East", "Excel Course", "10", "$45"],
        ["15 Jun 2026", "West", "Analytics Template", "6", "$75"],
      ],
    },
    tasks: [
      {
        id: "total-revenue",
        title: "Calculate total revenue",
        prompt:
          "What is the total revenue across all five orders? Enter the amount in dollars.",
        hint: "For each row, multiply Units by Unit price, then add the five results.",
        answerPlaceholder: "Example: 2,500",
        xpReward: 20,
        answer: { kind: "number", value: 2640, tolerance: 0.01 },
      },
      {
        id: "top-region",
        title: "Find the strongest region",
        prompt: "Which region generated the highest total revenue?",
        hint: "Calculate revenue per row, then group and sum those values by Region.",
        answerPlaceholder: "Enter a region",
        xpReward: 20,
        answer: { kind: "text", accepted: ["West", "West region"] },
      },
      {
        id: "excel-course-units",
        title: "Measure product demand",
        prompt: "How many total units of the Excel Course were sold?",
        hint: "Filter the Product column to Excel Course and add the matching Units values.",
        answerPlaceholder: "Enter total units",
        xpReward: 20,
        answer: { kind: "number", value: 22 },
      },
    ],
  },
  {
    id: "finance",
    title: "Finance Analysis",
    icon: "💰",
    description:
      "Review a compact profit-and-loss dataset and identify business performance signals.",
    focus: "Profit, margins, and expenses",
    practiceRoute: "/practice/finance",
    cardClassName:
      "border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-cyan-50",
    dataset: {
      name: "Monthly profit and loss",
      columns: ["Month", "Revenue", "Operating expenses", "Net profit"],
      rows: [
        ["January", "$18,500", "$12,600", "$5,900"],
        ["February", "$20,200", "$13,900", "$6,300"],
        ["March", "$22,400", "$15,100", "$7,300"],
        ["April", "$21,800", "$14,700", "$7,100"],
        ["May", "$24,100", "$16,200", "$7,900"],
      ],
    },
    tasks: [
      {
        id: "total-profit",
        title: "Calculate total net profit",
        prompt: "What is the total net profit for January through May?",
        hint: "Add all five values in the Net profit column.",
        answerPlaceholder: "Enter the amount",
        xpReward: 20,
        answer: { kind: "number", value: 34500, tolerance: 0.01 },
      },
      {
        id: "best-margin-month",
        title: "Compare profit margins",
        prompt: "Which month had the highest net profit margin?",
        hint: "For each month, divide Net profit by Revenue and compare the percentages.",
        answerPlaceholder: "Enter a month",
        xpReward: 20,
        answer: { kind: "text", accepted: ["May", "May 2026"] },
      },
      {
        id: "average-expenses",
        title: "Find average expenses",
        prompt: "What were the average monthly operating expenses?",
        hint: "Add the five Operating expenses values, then divide by five.",
        answerPlaceholder: "Enter the amount",
        xpReward: 20,
        answer: { kind: "number", value: 14500, tolerance: 0.01 },
      },
    ],
  },
  {
    id: "hr",
    title: "HR Analysis",
    icon: "👥",
    description:
      "Explore workforce data to answer questions about tenure, engagement, and payroll.",
    focus: "Tenure, satisfaction, and payroll",
    practiceRoute: "/practice/hr",
    cardClassName:
      "border-blue-200 bg-gradient-to-br from-blue-50 via-white to-indigo-50",
    dataset: {
      name: "Employee snapshot",
      columns: [
        "Employee",
        "Department",
        "Tenure (years)",
        "Satisfaction",
        "Monthly salary",
      ],
      rows: [
        ["Aisha", "Sales", "3", "4.6", "$6,200"],
        ["Ben", "Finance", "5", "4.1", "$7,100"],
        ["Carla", "Sales", "2", "3.7", "$5,800"],
        ["Dev", "People Operations", "6", "4.8", "$7,600"],
        ["Elena", "Finance", "4", "4.3", "$6,900"],
      ],
    },
    tasks: [
      {
        id: "average-tenure",
        title: "Calculate average tenure",
        prompt: "What is the average employee tenure in years?",
        hint: "Add the five tenure values and divide the result by five employees.",
        answerPlaceholder: "Enter years",
        xpReward: 20,
        answer: { kind: "number", value: 4, tolerance: 0.01 },
      },
      {
        id: "top-satisfaction-department",
        title: "Compare team satisfaction",
        prompt: "Which department has the highest average satisfaction score?",
        hint: "Group employees by Department, then average the Satisfaction values in each group.",
        answerPlaceholder: "Enter a department",
        xpReward: 20,
        answer: {
          kind: "text",
          accepted: [
            "People Operations",
            "People Ops",
            "People",
            "HR",
            "Human Resources",
          ],
        },
      },
      {
        id: "monthly-payroll",
        title: "Calculate monthly payroll",
        prompt: "What is the total monthly payroll for these five employees?",
        hint: "Add every value in the Monthly salary column.",
        answerPlaceholder: "Enter the amount",
        xpReward: 20,
        answer: { kind: "number", value: 33600, tolerance: 0.01 },
      },
    ],
  },
] as const;

export function getPracticeProject(id: PracticeProjectId) {
  return practiceProjects.find((project) => project.id === id)!;
}

function normalizeText(value: string) {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function parseNumericAnswer(value: string) {
  const cleaned = value.replace(/,/g, "").replace(/[^0-9.+-]/g, "");

  if (!cleaned) return null;

  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

export function isPracticeAnswerCorrect(task: PracticeTask, value: string) {
  if (!value.trim()) return false;

  if (task.answer.kind === "text") {
    const normalizedValue = normalizeText(value);
    return task.answer.accepted.some(
      (acceptedAnswer) => normalizeText(acceptedAnswer) === normalizedValue,
    );
  }

  const numericValue = parseNumericAnswer(value);
  if (numericValue === null) return false;

  return (
    Math.abs(numericValue - task.answer.value) <=
    (task.answer.tolerance ?? 0.01)
  );
}

export const DASHBOARD_PRACTICE_STORAGE_KEY =
  "databloom-dashboard-practice-v1";
export const DASHBOARD_PRACTICE_EVENT = "databloom:dashboard-practice";

export type DashboardPracticeState = {
  completedTaskIds: string[];
  rewardedTaskIds: string[];
};

const EMPTY_PRACTICE_STATE: DashboardPracticeState = {
  completedTaskIds: [],
  rewardedTaskIds: [],
};

function uniqueStrings(value: unknown) {
  if (!Array.isArray(value)) return [];

  return Array.from(
    new Set(value.filter((item): item is string => typeof item === "string")),
  );
}

function normalizePracticeState(value: unknown): DashboardPracticeState {
  if (!value || typeof value !== "object") {
    return { ...EMPTY_PRACTICE_STATE };
  }

  const state = value as Partial<DashboardPracticeState>;

  return {
    completedTaskIds: uniqueStrings(state.completedTaskIds),
    rewardedTaskIds: uniqueStrings(state.rewardedTaskIds),
  };
}

export function getPracticeTaskKey(
  projectId: PracticeProjectId,
  taskId: string,
) {
  return `${projectId}:${taskId}`;
}

export function loadDashboardPracticeState(): DashboardPracticeState {
  if (typeof window === "undefined") {
    return { ...EMPTY_PRACTICE_STATE };
  }

  try {
    const savedState = window.localStorage.getItem(
      DASHBOARD_PRACTICE_STORAGE_KEY,
    );

    if (!savedState) return { ...EMPTY_PRACTICE_STATE };

    return normalizePracticeState(JSON.parse(savedState));
  } catch {
    return { ...EMPTY_PRACTICE_STATE };
  }
}

function saveDashboardPracticeState(state: DashboardPracticeState) {
  if (typeof window === "undefined") return false;

  try {
    window.localStorage.setItem(
      DASHBOARD_PRACTICE_STORAGE_KEY,
      JSON.stringify(state),
    );
    window.dispatchEvent(
      new CustomEvent(DASHBOARD_PRACTICE_EVENT, { detail: state }),
    );
    return true;
  } catch {
    return false;
  }
}

export type PracticeTaskCompletionResult = {
  saved: boolean;
  newlyCompleted: boolean;
  newlyRewarded: boolean;
  state: DashboardPracticeState;
};

export function completePracticeTask(
  projectId: PracticeProjectId,
  taskId: string,
): PracticeTaskCompletionResult {
  const currentState = loadDashboardPracticeState();
  const taskKey = getPracticeTaskKey(projectId, taskId);
  const newlyCompleted = !currentState.completedTaskIds.includes(taskKey);
  const newlyRewarded = !currentState.rewardedTaskIds.includes(taskKey);

  if (!newlyCompleted && !newlyRewarded) {
    return {
      saved: true,
      newlyCompleted: false,
      newlyRewarded: false,
      state: currentState,
    };
  }

  const nextState: DashboardPracticeState = {
    completedTaskIds: newlyCompleted
      ? [...currentState.completedTaskIds, taskKey]
      : currentState.completedTaskIds,
    rewardedTaskIds: newlyRewarded
      ? [...currentState.rewardedTaskIds, taskKey]
      : currentState.rewardedTaskIds,
  };

  if (!saveDashboardPracticeState(nextState)) {
    return {
      saved: false,
      newlyCompleted: false,
      newlyRewarded: false,
      state: currentState,
    };
  }

  return {
    saved: true,
    newlyCompleted,
    newlyRewarded,
    state: nextState,
  };
}
