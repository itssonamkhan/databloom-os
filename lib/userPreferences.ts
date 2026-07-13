export const USER_PREFERENCES_EVENT =
  "databloom:user-preferences-updated";

export const studyBuddies = ["Mochi", "Maple", "Luna", "Boba", "Poppy"] as const;
export const careerGoals = [
  "Data Analyst",
  "Business Analyst",
  "Power BI Developer",
  "Excel Expert",
  "Data Scientist",
] as const;
export const studyStyles = ["Cozy", "Rain", "Night Owl", "Piano", "Spotify"] as const;
export const dailyGoals = ["15", "30", "45", "60", "90+"] as const;
export const themes = ["Sakura", "Cloud", "Night", "Coffee House", "Kawaii"] as const;

export type StudyBuddy = (typeof studyBuddies)[number];
export type CareerGoal = (typeof careerGoals)[number];
export type StudyStyle = (typeof studyStyles)[number];
export type DailyGoal = (typeof dailyGoals)[number];
export type UserTheme = (typeof themes)[number];

export type UserPreferences = {
  userName: string;
  studyBuddy: StudyBuddy;
  careerGoal: CareerGoal;
  studyStyle: StudyStyle;
  dailyGoal: DailyGoal;
  theme: UserTheme;
  hasCompletedOnboarding: boolean;
};

const keys = {
  userName: "userName",
  studyBuddy: "studyBuddy",
  careerGoal: "careerGoal",
  studyStyle: "studyStyle",
  dailyGoal: "dailyGoal",
  theme: "theme",
  completed: "hasCompletedOnboarding",
} as const;

export const defaultUserPreferences: UserPreferences = {
  userName: "",
  studyBuddy: "Mochi",
  careerGoal: "Data Analyst",
  studyStyle: "Cozy",
  dailyGoal: "30",
  theme: "Sakura",
  hasCompletedOnboarding: false,
};

function canUseStorage() {
  return typeof window !== "undefined" && "localStorage" in window;
}

function validOption<T extends string>(
  value: string | null,
  options: readonly T[],
  fallback: T,
) {
  return value && options.includes(value as T) ? (value as T) : fallback;
}

export function loadUserPreferences(): UserPreferences {
  if (!canUseStorage()) return { ...defaultUserPreferences };

  try {
    return {
      userName: window.localStorage.getItem(keys.userName)?.trim() ?? "",
      studyBuddy: validOption(
        window.localStorage.getItem(keys.studyBuddy),
        studyBuddies,
        defaultUserPreferences.studyBuddy,
      ),
      careerGoal: validOption(
        window.localStorage.getItem(keys.careerGoal),
        careerGoals,
        defaultUserPreferences.careerGoal,
      ),
      studyStyle: validOption(
        window.localStorage.getItem(keys.studyStyle),
        studyStyles,
        defaultUserPreferences.studyStyle,
      ),
      dailyGoal: validOption(
        window.localStorage.getItem(keys.dailyGoal),
        dailyGoals,
        defaultUserPreferences.dailyGoal,
      ),
      theme: validOption(
        window.localStorage.getItem(keys.theme),
        themes,
        defaultUserPreferences.theme,
      ),
      hasCompletedOnboarding:
        window.localStorage.getItem(keys.completed) === "true",
    };
  } catch {
    return { ...defaultUserPreferences };
  }
}

function dispatchPreferencesUpdate(preferences: UserPreferences) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(USER_PREFERENCES_EVENT, { detail: preferences }),
  );
}

export function saveUserPreferences(
  preferences: Omit<UserPreferences, "hasCompletedOnboarding"> & {
    hasCompletedOnboarding?: boolean;
  },
) {
  if (!canUseStorage()) return false;

  const normalized: UserPreferences = {
    ...preferences,
    userName: preferences.userName.trim(),
    hasCompletedOnboarding:
      preferences.hasCompletedOnboarding ?? true,
  };

  if (!normalized.userName) return false;

  try {
    window.localStorage.setItem(keys.userName, normalized.userName);
    window.localStorage.setItem(keys.studyBuddy, normalized.studyBuddy);
    window.localStorage.setItem(keys.careerGoal, normalized.careerGoal);
    window.localStorage.setItem(keys.studyStyle, normalized.studyStyle);
    window.localStorage.setItem(keys.dailyGoal, normalized.dailyGoal);
    window.localStorage.setItem(keys.theme, normalized.theme);
    window.localStorage.setItem(
      keys.completed,
      String(normalized.hasCompletedOnboarding),
    );
    dispatchPreferencesUpdate(normalized);
    return true;
  } catch {
    return false;
  }
}

export function hasCompletedOnboarding() {
  return loadUserPreferences().hasCompletedOnboarding;
}

export function resetOnboarding() {
  if (!canUseStorage()) return false;
  try {
    Object.values(keys).forEach((key) => window.localStorage.removeItem(key));
    dispatchPreferencesUpdate({ ...defaultUserPreferences });
    return true;
  } catch {
    return false;
  }
}

export function getTimeGreeting(date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
}
