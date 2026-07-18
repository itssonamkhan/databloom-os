import { levels } from "@/lib/levels";
import {
  loadUserPreferences,
  type CareerGoal,
} from "@/lib/userPreferences";

export type MochiLevel = {
  level: number;
  name: string;
  heartsNeeded: number;
};

export const MOCHI_LEVELS: MochiLevel[] = [
  { level: 1, name: "🐰 New Friend", heartsNeeded: 0 },
  { level: 2, name: "🌸 Study Buddy", heartsNeeded: 5 },
  { level: 3, name: "✨ Learning Partner", heartsNeeded: 15 },
  { level: 4, name: "👑 DataBloom Companion", heartsNeeded: 35 },
];

export type MochiData = {
  hearts: number;
  level: number;
  interactions: number;
};

export type MochiMood = "happy" | "tired" | "stressed" | "motivated";

export type MochiMission = {
  id: string;
  title: string;
  description: string;
  reward: number;
  href: string;
};

export type MochiAssistantState = {
  version: 2;
  date: string;
  mood: MochiMood | null;
  message: string;
  dailyMotivation: string;
  mission: MochiMission;
  studySuggestion: string;
  gentleReminder: string;
  studyTip: string;
  encouragementIndex: number;
  missionCompleted: boolean;
};

export const MOCHI_MOODS: ReadonlyArray<{
  id: MochiMood;
  emoji: string;
  label: string;
}> = [
  { id: "happy", emoji: "😊", label: "Happy" },
  { id: "tired", emoji: "😴", label: "Tired" },
  { id: "stressed", emoji: "😵", label: "Stressed" },
  { id: "motivated", emoji: "🔥", label: "Motivated" },
];

export const MOCHI_ENCOURAGEMENTS = [
  "A tiny lesson today is still a beautiful bloom.",
  "Your future analyst self is cheering for this next step.",
  "One focused page can change the whole shape of your day.",
  "You do not need perfect energy to make real progress.",
  "Every formula you practice makes the next one feel lighter.",
  "Your data garden grows whenever you choose to begin.",
  "A calm ten minutes of study absolutely counts.",
  "You are building skills that once felt impossible.",
  "Curiosity is your analyst superpower today.",
  "One solved question is one more reason to feel proud.",
  "Slow progress is still progress with roots.",
  "Mochi believes your next click can start something lovely.",
  "You have already learned more than your first-day self knew.",
  "A small review now can create a big aha later.",
  "Your consistency matters more than a perfect study session.",
  "Let today be gentle, focused, and quietly productive.",
  "One concept at a time is how expertise blooms.",
  "Your questions are proof that your thinking is growing.",
  "Even five focused minutes can keep your streak warm.",
  "The next lesson is a fresh chance to surprise yourself.",
  "You are allowed to learn at your own cozy pace.",
  "Every practice answer teaches you something useful.",
  "Small repetitions turn confusing ideas into familiar friends.",
  "A brave beginner step is worth celebrating.",
  "Your effort today is planting confidence for tomorrow.",
  "There is no race here, only your own beautiful progress.",
  "You can make this session simple and still make it meaningful.",
  "Your analytical mind gets stronger each time you use it.",
  "Pick one task, give it your attention, and let that be enough.",
  "A tidy dataset starts with one thoughtful decision.",
  "You are closer to your goal than you were yesterday.",
  "Keep showing up; your skills are noticing.",
  "The best study plan is the one you can kindly begin.",
  "One more example may be the one that makes it click.",
  "Your learning does not have to be loud to be powerful.",
  "Today is a good day to collect one new insight.",
  "Your patience with yourself is part of the skill.",
  "A short session can still earn a very happy checkmark.",
  "You are turning practice into real analyst instincts.",
  "Let one clear goal guide you through the next few minutes.",
  "Your progress deserves kindness, especially on slower days.",
  "Each chart you understand adds a new way to tell a story.",
  "You can pause, breathe, and return with a clearer mind.",
  "Every completed lesson is a petal in your DataBloom journey.",
  "A little momentum can begin with one easy win.",
  "Your next breakthrough may be hiding in a simple practice task.",
  "Learning to analyze data is learning to notice what matters.",
  "Your steady effort is becoming a skill you can trust.",
  "Choose progress that feels possible, then let it bloom.",
  "Mochi saved you a cozy spot for today’s learning.",
  "You bring something valuable to every problem you explore.",
  "The hard parts are where your new skills are taking shape.",
  "One lesson finished is a wonderful plan for today.",
  "You can begin before you feel completely ready.",
  "Every dataset becomes friendlier after the first careful look.",
  "Your focus is a garden; give one idea a little sunlight.",
  "A gentle start can lead to a surprisingly strong finish.",
  "You are not behind; you are learning from exactly where you are.",
  "Today’s small win will make tomorrow’s lesson easier.",
  "Mochi is proud of the care you bring to your learning.",
] as const;

const MOCHI_LEVEL_UP_MESSAGES = [
  "Your learning garden has its first strong roots. Every small step is counting!",
  "That tiny sprout is growing beautifully. Keep following your curiosity!",
  "Your study habits are getting stronger, and this new level proves it!",
  "A brand-new bloom for your collection. Your steady effort is shining!",
  "You are turning practice into real skill, one thoughtful lesson at a time!",
  "Your explorer era is here. New data discoveries are waiting for you!",
  "Your spreadsheet confidence is blooming into something truly powerful!",
  "You are transforming data into stories people can understand. Wonderful work!",
  "You are thinking like an analyst now—curious, careful, and insight-driven!",
  "You reached a major DataBloom milestone. Your whole learning garden is glowing!",
  "Legendary consistency unlocked. You keep showing what patient practice can do!",
  "Your ideas are becoming clear, useful insights. Keep creating with confidence!",
  "Patterns that once felt hidden are becoming your analytical superpower!",
  "Your wisdom is blooming through every question, chart, and decision you explore!",
  "The highest bloom is yours. You built this mastery with courage and consistency!",
] as const;

export function getMochiLevelUpMessage(
  levelName: string,
  buddyName = "Mochi",
) {
  const levelIndex = levels.findIndex((level) => level.name === levelName);
  const message =
    MOCHI_LEVEL_UP_MESSAGES[levelIndex] ??
    "A beautiful new milestone is yours. Keep learning and keep blooming!";

  return `${buddyName} says: ${message}`;
}

const DAILY_MOTIVATIONS = [
  "🌸 Let’s grow one useful data skill today!",
  "✨ A fresh day means a fresh little learning win.",
  "🌱 Your data garden is ready for one more bloom.",
  "🐰 We can make meaningful progress one cozy step at a time.",
  "💗 Show up gently today; consistency will do the rest.",
  "🌷 One focused lesson is more than enough to move forward.",
];

const MISSIONS: MochiMission[] = [
  {
    id: "sql-lesson",
    title: "Finish one SQL lesson",
    description: "Practice one query pattern and save the lesson as learned.",
    reward: 20,
    href: "/sql-studio",
  },
  {
    id: "formula-review",
    title: "Review one Excel formula",
    description: "Choose a formula you want to recall without notes.",
    reward: 20,
    href: "/formula-studio",
  },
  {
    id: "python-lesson",
    title: "Complete one Python lesson",
    description: "Learn one small Pandas or Python concept today.",
    reward: 20,
    href: "/python-studio",
  },
  {
    id: "statistics-practice",
    title: "Try one statistics practice",
    description: "Solve one analyst question and check your reasoning.",
    reward: 20,
    href: "/statistics-studio",
  },
  {
    id: "power-bi-lesson",
    title: "Visit Power BI Studio",
    description: "Explore one reporting or DAX concept for a quick win.",
    reward: 20,
    href: "/power-bi-studio",
  },
  {
    id: "dashboard-practice",
    title: "Polish one dashboard skill",
    description: "Practice turning raw data into a clear visual story.",
    reward: 20,
    href: "/dashboard",
  },
  {
    id: "analytics-checkin",
    title: "Check your learning analytics",
    description: "Notice one growing skill and choose what to study next.",
    reward: 20,
    href: "/analytics",
  },
];

const GOAL_MISSION_IDS: Record<CareerGoal, readonly string[]> = {
  "Data Analyst": ["sql-lesson", "formula-review", "statistics-practice", "dashboard-practice"],
  "Business Analyst": ["formula-review", "dashboard-practice", "analytics-checkin"],
  "Power BI Developer": ["power-bi-lesson", "dashboard-practice", "formula-review"],
  "Excel Expert": ["formula-review", "dashboard-practice", "statistics-practice"],
  "Data Scientist": ["python-lesson", "statistics-practice", "sql-lesson"],
};

const GOAL_STUDY_SUGGESTIONS: Record<CareerGoal, string> = {
  "Data Analyst": "🗃️ Build your core analyst path with one SQL, spreadsheet, or dashboard task.",
  "Business Analyst": "💼 Connect one business question to a metric, formula, or dashboard today.",
  "Power BI Developer": "📊 Focus on one Power Query, DAX, or dashboard-design concept.",
  "Excel Expert": "🧮 Review one useful formula and practise it with a small business example.",
  "Data Scientist": "🐍 Pair one Python or statistics concept with a small dataset.",
};

const MOOD_STUDY_SUGGESTIONS: Record<MochiMood, string> = {
  happy: "😊 Use that bright energy for a short lesson followed by one practice question.",
  tired: "😴 Keep it gentle with five minutes of notes, formulas, or flashcard review.",
  stressed: "🌿 Choose one familiar topic and take a single small step—no big session needed.",
  motivated: "🔥 Channel the momentum into Practice Lab or one focused Studio lesson.",
};

const GENTLE_REMINDERS = [
  "💧 Keep water nearby and relax your shoulders before you begin.",
  "🌿 If a topic feels heavy, shrink the task to just five minutes.",
  "☁️ A break is part of learning when your attention needs to reset.",
  "💗 Your streak supports you; it does not need to pressure you.",
  "🫧 Close extra tabs so your next small task has room to breathe.",
  "🌙 Save a quick note before leaving so tomorrow has an easy start.",
];

const STUDY_TIPS = [
  "💡 After a lesson, write one sentence about when you would use it.",
  "🧠 Try recalling the key idea before rereading your notes.",
  "✍️ Keep examples tiny while learning; complexity can come later.",
  "🔎 When an answer is wrong, compare the steps instead of only the result.",
  "🗣️ Explain the concept aloud as if Mochi were your student.",
  "⏱️ Use a short focus timer and stop with a clear next step.",
  "🧩 Mix review and new learning so your memory gets retrieval practice.",
];

const MOOD_RESPONSES: Record<MochiMood, readonly string[]> = {
  happy: [
    "Your happy energy is blooming! Let’s turn it into one cheerful win.",
    "That smile suits your data garden. Pick something fun to learn next.",
    "I love this bright mood—let’s ride it into a quick lesson.",
  ],
  tired: [
    "You don’t need to push hard today. Let’s choose one soft, tiny task.",
    "Low-energy learning still counts. A five-minute review is enough.",
    "We can keep today cozy: one easy win, then a proper rest.",
  ],
  stressed: [
    "Take one slow breath with me. We’ll focus on only the next small step.",
    "You are safe to go slowly. Let’s make the task smaller, not the pressure bigger.",
    "No need to solve everything at once. One clear question is plenty.",
  ],
  motivated: [
    "That spark is powerful! Let’s channel it into a focused lesson and practice.",
    "Mochi sees the fire—choose your mission and make it bloom.",
    "Let’s use this momentum well: one goal, full focus, happy finish.",
  ],
};

const MOCHI_FRIENDSHIP_KEY = "databloom-mochi-friendship";
const MOCHI_ASSISTANT_KEY = "databloom-mochi-ai-v2";

export const MOCHI_ASSISTANT_UPDATED_EVENT =
  "databloom:mochi-assistant-updated";

const EMPTY_FRIENDSHIP: MochiData = {
  hearts: 0,
  level: 1,
  interactions: 0,
};

function canUseStorage() {
  return typeof window !== "undefined" && "localStorage" in window;
}

export function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function hashString(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function dailyPick<T>(items: readonly T[], date: string, salt: string): T {
  return items[hashString(`${date}:${salt}`) % items.length];
}

function randomEncouragementIndex(previousIndex = -1) {
  if (MOCHI_ENCOURAGEMENTS.length <= 1) return 0;
  let index = Math.floor(Math.random() * MOCHI_ENCOURAGEMENTS.length);
  if (index === previousIndex) {
    index = (index + 1 + Math.floor(Math.random() * (MOCHI_ENCOURAGEMENTS.length - 1))) %
      MOCHI_ENCOURAGEMENTS.length;
  }
  return index;
}

function createAssistantState(
  date: string,
  previousEncouragementIndex = -1,
): MochiAssistantState {
  const encouragementIndex = randomEncouragementIndex(previousEncouragementIndex);
  const careerGoal = loadUserPreferences().careerGoal;
  return {
    version: 2,
    date,
    mood: null,
    message: MOCHI_ENCOURAGEMENTS[encouragementIndex],
    dailyMotivation: dailyPick(DAILY_MOTIVATIONS, date, "motivation"),
    mission: getGoalMission(careerGoal, date),
    studySuggestion: GOAL_STUDY_SUGGESTIONS[careerGoal],
    gentleReminder: dailyPick(GENTLE_REMINDERS, date, "reminder"),
    studyTip: dailyPick(STUDY_TIPS, date, "tip"),
    encouragementIndex,
    missionCompleted: false,
  };
}

function getGoalMission(careerGoal: CareerGoal, date: string) {
  const preferredIds = GOAL_MISSION_IDS[careerGoal];
  const preferredMissions = MISSIONS.filter((mission) => preferredIds.includes(mission.id));
  return dailyPick(preferredMissions.length ? preferredMissions : MISSIONS, date, careerGoal);
}

export function getPersonalizedStudySuggestion(
  mood: MochiMood | null,
  fallback?: string,
) {
  if (mood) return MOOD_STUDY_SUGGESTIONS[mood];
  return fallback ?? GOAL_STUDY_SUGGESTIONS[loadUserPreferences().careerGoal];
}

function isMood(value: unknown): value is MochiMood {
  return MOCHI_MOODS.some((mood) => mood.id === value);
}

function isMission(value: unknown): value is MochiMission {
  if (!value || typeof value !== "object") return false;
  const mission = value as Partial<MochiMission>;
  return (
    typeof mission.id === "string" &&
    typeof mission.title === "string" &&
    typeof mission.description === "string" &&
    typeof mission.reward === "number" &&
    typeof mission.href === "string"
  );
}

function normalizeAssistantState(value: unknown): MochiAssistantState | null {
  if (!value || typeof value !== "object") return null;
  const state = value as Partial<MochiAssistantState>;
  if (
    state.version !== 2 ||
    typeof state.date !== "string" ||
    typeof state.message !== "string" ||
    typeof state.dailyMotivation !== "string" ||
    !isMission(state.mission) ||
    typeof state.studySuggestion !== "string" ||
    typeof state.gentleReminder !== "string" ||
    typeof state.studyTip !== "string" ||
    typeof state.encouragementIndex !== "number" ||
    typeof state.missionCompleted !== "boolean" ||
    (state.mood !== null && !isMood(state.mood))
  ) {
    return null;
  }
  return state as MochiAssistantState;
}

function readStoredAssistantState() {
  if (!canUseStorage()) return null;
  try {
    const saved = window.localStorage.getItem(MOCHI_ASSISTANT_KEY);
    return saved ? normalizeAssistantState(JSON.parse(saved)) : null;
  } catch {
    return null;
  }
}

export function saveMochiAssistantState(state: MochiAssistantState) {
  if (!canUseStorage()) return false;
  try {
    window.localStorage.setItem(MOCHI_ASSISTANT_KEY, JSON.stringify(state));
    window.dispatchEvent(new CustomEvent(MOCHI_ASSISTANT_UPDATED_EVENT));
    return true;
  } catch {
    return false;
  }
}

export function loadMochiAssistantState() {
  const today = getLocalDateKey();
  const stored = readStoredAssistantState();
  if (stored?.date === today) {
    const careerGoal = loadUserPreferences().careerGoal;
    const next = {
      ...stored,
      mission: stored.missionCompleted
        ? stored.mission
        : getGoalMission(careerGoal, today),
      studySuggestion: getPersonalizedStudySuggestion(
        stored.mood,
        GOAL_STUDY_SUGGESTIONS[careerGoal],
      ),
    };

    if (
      next.mission.id !== stored.mission.id ||
      next.studySuggestion !== stored.studySuggestion
    ) {
      saveMochiAssistantState(next);
    }
    return next;
  }

  const next = createAssistantState(today, stored?.encouragementIndex);
  saveMochiAssistantState(next);
  return next;
}

export function resetMochiForNewDay(current: MochiAssistantState) {
  const today = getLocalDateKey();
  if (current.date === today) return current;
  const next = createAssistantState(today, current.encouragementIndex);
  saveMochiAssistantState(next);
  return next;
}

export function applyMochiMood(
  current: MochiAssistantState,
  mood: MochiMood,
) {
  const encouragementIndex = randomEncouragementIndex(current.encouragementIndex);
  const moodResponse = dailyPick(
    MOOD_RESPONSES[mood],
    `${current.date}:${encouragementIndex}`,
    mood,
  );
  const next: MochiAssistantState = {
    ...current,
    mood,
    encouragementIndex,
    message: `${moodResponse} ${MOCHI_ENCOURAGEMENTS[encouragementIndex]}`,
    studySuggestion: getPersonalizedStudySuggestion(mood),
  };
  saveMochiAssistantState(next);
  return next;
}

export function markMochiMissionComplete(current: MochiAssistantState) {
  if (current.missionCompleted) return current;
  const next = { ...current, missionCompleted: true };
  saveMochiAssistantState(next);
  return next;
}

export function getXPEncouragement(xp: number) {
  const nextLevel = levels.find((level) => level.minXP > xp);
  if (!nextLevel) {
    return "You reached the highest bloom—keep learning for the joy of it!";
  }
  const remaining = Math.max(0, nextLevel.minXP - xp);
  return `Only ${remaining.toLocaleString()} XP until ${nextLevel.name}.`;
}

export function loadMochiData(): MochiData {
  if (!canUseStorage()) return { ...EMPTY_FRIENDSHIP };
  try {
    const saved = window.localStorage.getItem(MOCHI_FRIENDSHIP_KEY);
    if (!saved) return { ...EMPTY_FRIENDSHIP };
    const parsed = JSON.parse(saved) as Partial<MochiData>;
    return {
      hearts: typeof parsed.hearts === "number" ? parsed.hearts : 0,
      level: typeof parsed.level === "number" ? parsed.level : 1,
      interactions:
        typeof parsed.interactions === "number" ? parsed.interactions : 0,
    };
  } catch {
    return { ...EMPTY_FRIENDSHIP };
  }
}

export function saveMochiData(data: MochiData) {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(MOCHI_FRIENDSHIP_KEY, JSON.stringify(data));
  } catch {
    // Mochi remains usable if browser storage is unavailable.
  }
}

export function addMochiHeart(amount: number): MochiData {
  const current = loadMochiData();
  const hearts = current.hearts + amount;
  let level = 1;
  for (const item of MOCHI_LEVELS) {
    if (hearts >= item.heartsNeeded) level = item.level;
    else break;
  }
  const next = {
    hearts,
    level,
    interactions: current.interactions + 1,
  };
  saveMochiData(next);
  return next;
}

export function getMochiLevelName(level: number) {
  return (
    MOCHI_LEVELS.find((item) => item.level === level)?.name ?? "🐰 New Friend"
  );
}
