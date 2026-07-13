export const STORAGE_KEY = "databloom-os";

export type DataBloomSave = {
  xp: number;

  streak: {
    current: number;
    longest: number;
    lastStudyDate: string | null;
  };

  dailyTasks: unknown[];

  achievements: string[];

  settings: {
    sound: boolean;
    music: boolean;
  };
};

const DEFAULT_DATA: DataBloomSave = {
  xp: 240,

  streak: {
    current: 0,
    longest: 0,
    lastStudyDate: null,
  },

  dailyTasks: [],

  achievements: [],

  settings: {
    sound: true,
    music: true,
  },
};

export function loadData(): DataBloomSave {
  if (typeof window === "undefined") {
    return DEFAULT_DATA;
  }

  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    return DEFAULT_DATA;
  }

  try {
    return {
      ...DEFAULT_DATA,
      ...JSON.parse(saved),
    };
  } catch {
    return DEFAULT_DATA;
  }
}

export function saveData(data: DataBloomSave) {
  if (typeof window === "undefined") return;

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(data)
  );
}

export function updateData(
  updater: (data: DataBloomSave) => DataBloomSave
) {
  const current = loadData();

  const updated = updater(current);

  saveData(updated);

  return updated;
}

export function resetData() {
  if (typeof window === "undefined") return;

  localStorage.removeItem(STORAGE_KEY);
}
