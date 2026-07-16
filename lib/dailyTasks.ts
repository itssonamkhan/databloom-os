const TASKS_KEY = "databloom-daily-tasks";
const DATE_KEY = "databloom-daily-date";

export type DailyTask = {
  text: string;
  xp: number;
  done: boolean;
};

export const dailyTasks: Omit<DailyTask, "done">[] = [
  {
    text: "📚 Learn one Excel formula",
    xp: 20,
  },
  {
    text: "🧮 Practice 10 formula questions",
    xp: 20,
  },
  {
    text: "📊 Create one small dashboard",
    xp: 30,
  },
  {
    text: "🎨 Practice Excel formatting",
    xp: 20,
  },
  {
    text: "🔍 Explore one data concept",
    xp: 20,
  },
  {
    text: "✨ Ask your AI buddy one learning question",
    xp: 20,
  },
  {
    text: "📝 Write today's learning notes",
    xp: 10,
  },
  {
    text: "🎯 Complete one challenge",
    xp: 30,
  },
];

function todayKey() {
  return new Date().toDateString();
}

export function getTodayTasks(): DailyTask[] {
  if (typeof window === "undefined") {
    return dailyTasks.slice(0, 4).map((task) => ({
      ...task,
      done: false,
    }));
  }

  const savedDate = localStorage.getItem(DATE_KEY);
  const today = todayKey();

  if (savedDate === today) {
    const saved = localStorage.getItem(TASKS_KEY);

    if (saved) {
      return JSON.parse(saved) as DailyTask[];
    }
  }

  const shuffled = [...dailyTasks].sort(() => Math.random() - 0.5);

  const tasks = shuffled.slice(0, 4).map((task) => ({
    ...task,
    done: false,
  }));

  localStorage.setItem(DATE_KEY, today);
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));

  return tasks;
}

export function saveTodayTasks(tasks: DailyTask[]) {
  if (typeof window === "undefined") return;

  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

export function areTodayDailyGoalsComplete(): boolean {
  if (typeof window === "undefined") return false;
  if (window.localStorage.getItem(DATE_KEY) !== todayKey()) return false;

  try {
    const saved = window.localStorage.getItem(TASKS_KEY);
    const tasks: unknown = saved ? JSON.parse(saved) : [];
    return (
      Array.isArray(tasks) &&
      tasks.length > 0 &&
      tasks.every(
        (task) =>
          Boolean(task) &&
          typeof task === "object" &&
          !Array.isArray(task) &&
          (task as Partial<DailyTask>).done === true,
      )
    );
  } catch {
    return false;
  }
}
