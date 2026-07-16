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

export const DATABLOOM_THEME_ATTRIBUTE = "data-databloom-theme";

export type UserPreferences = {
  userName: string;
  studyBuddy: StudyBuddy;
  customBuddyName: string;
  careerGoal: CareerGoal;
  studyStyle: StudyStyle;
  dailyGoal: DailyGoal;
  theme: UserTheme;
  hasCompletedOnboarding: boolean;
};

const keys = {
  userName: "userName",
  studyBuddy: "studyBuddy",
  customBuddyName: "customBuddyName",
  careerGoal: "careerGoal",
  studyStyle: "studyStyle",
  dailyGoal: "dailyGoal",
  theme: "theme",
  completed: "hasCompletedOnboarding",
} as const;

export const defaultUserPreferences: UserPreferences = {
  userName: "",
  studyBuddy: "Mochi",
  customBuddyName: "",
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

function validTheme(value: string | null) {
  if (value === "Clouds") return "Cloud";
  return validOption(value, themes, defaultUserPreferences.theme);
}

export function applyUserTheme(theme: UserTheme) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute(DATABLOOM_THEME_ATTRIBUTE, theme);
}

export function loadUserPreferences(): UserPreferences {
  if (!canUseStorage()) return { ...defaultUserPreferences };

  try {
    const userName = window.localStorage.getItem(keys.userName)?.trim() ?? "";
    const completionValue = window.localStorage.getItem(keys.completed);

    return {
      userName,
      studyBuddy: validOption(
        window.localStorage.getItem(keys.studyBuddy),
        studyBuddies,
        defaultUserPreferences.studyBuddy,
      ),
      customBuddyName:
        window.localStorage.getItem(keys.customBuddyName)?.trim() ??
        window.localStorage.getItem("buddyName")?.trim() ??
        "",
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
      theme: validTheme(window.localStorage.getItem(keys.theme)),
      hasCompletedOnboarding:
        completionValue === "true" || (completionValue === null && Boolean(userName)),
    };
  } catch {
    return { ...defaultUserPreferences };
  }
}

function dispatchPreferencesUpdate(preferences: UserPreferences) {
  if (typeof window === "undefined") return;
  applyUserTheme(preferences.theme);
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
    customBuddyName: preferences.customBuddyName.trim(),
    hasCompletedOnboarding:
      preferences.hasCompletedOnboarding ?? true,
  };

  if (!normalized.userName) return false;

  try {
    window.localStorage.setItem(keys.userName, normalized.userName);
    window.localStorage.setItem(keys.studyBuddy, normalized.studyBuddy);
    window.localStorage.setItem(
      keys.customBuddyName,
      normalized.customBuddyName.trim(),
    );
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
    window.localStorage.removeItem("buddyName");
    applyUserTheme(defaultUserPreferences.theme);
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

export const buddyPresentation: Record<
  StudyBuddy,
  { emoji: string; description: string }
> = {
  Mochi: { emoji: "🐰", description: "your cheerful study bunny" },
  Maple: { emoji: "🦊", description: "your thoughtful study fox" },
  Luna: { emoji: "🐱", description: "your focused study cat" },
  Boba: { emoji: "🐼", description: "your playful study panda" },
  Poppy: { emoji: "🦦", description: "your curious study otter" },
};

export function getBuddyPresentation(
  preferences: UserPreferences = loadUserPreferences(),
) {
  const selected = buddyPresentation[preferences.studyBuddy];
  return {
    ...selected,
    speciesName: preferences.studyBuddy,
    name: preferences.customBuddyName.trim() || preferences.studyBuddy,
  };
}

export function personalizeBuddyText(
  text: string,
  preferences: UserPreferences = loadUserPreferences(),
) {
  return text.replaceAll("Mochi", getBuddyPresentation(preferences).name);
}

export const careerGoalStudyOrder: Record<CareerGoal, readonly string[]> = {
  "Data Analyst": [
    "excel",
    "statistics",
    "sql",
    "power-query",
    "power-bi",
    "tableau",
    "dashboards",
    "python",
    "business-analytics",
    "datasets",
  ],
  "Business Analyst": [
    "business-analytics",
    "excel",
    "sql",
    "power-bi",
    "dashboards",
    "datasets",
    "statistics",
    "power-query",
    "tableau",
    "python",
  ],
  "Power BI Developer": [
    "power-query",
    "power-bi",
    "dashboards",
    "excel",
    "sql",
    "datasets",
    "business-analytics",
    "statistics",
    "tableau",
    "python",
  ],
  "Excel Expert": [
    "excel",
    "statistics",
    "business-analytics",
    "datasets",
    "power-query",
    "power-bi",
    "dashboards",
    "sql",
    "tableau",
    "python",
  ],
  "Data Scientist": [
    "statistics",
    "python",
    "sql",
    "datasets",
    "excel",
    "business-analytics",
    "power-query",
    "power-bi",
    "tableau",
    "dashboards",
  ],
};
