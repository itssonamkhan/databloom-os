import {
  loadUserPreferences,
  type StudyStyle,
} from "@/lib/userPreferences";

export const STUDY_MUSIC_STORAGE_KEY = "databloom-study-music-v1";
export const STUDY_MUSIC_PREFERENCES_EVENT =
  "databloom:study-music-preferences-updated";

export type StudyMusicMood = "Deep Focus" | "Lo-fi" | "Piano";

export type StudyTrackAttribution = {
  status: "pending" | "verified";
  creator: string;
  license: string;
  sourceUrl?: string;
  licenseUrl?: string;
};

export type StudyTrackDuration = {
  seconds: number | null;
  label: string;
};

export type StudyTrack = {
  id: string;
  title: string;
  subtitle: string;
  mood: StudyMusicMood;
  source: string;
  artwork: string;
  duration: StudyTrackDuration;
  attribution: StudyTrackAttribution;
  available: boolean;
};

/**
 * Native-player catalog foundation. Audio files are intentionally unavailable
 * in Phase 1, so the provider will not request these paths until verified
 * assets are added in a later phase.
 */
export const studyTracks = [
  {
    id: "deep-focus",
    title: "Deep Focus",
    subtitle: "Calm instrumentals for concentration",
    mood: "Deep Focus",
    source: "/audio/deep-focus.mp3",
    artwork: "📚",
    duration: {
      seconds: null,
      label: "Duration pending licensed audio",
    },
    attribution: {
      status: "pending",
      creator: "Not yet assigned",
      license: "Verified audio asset pending",
    },
    available: false,
  },
  {
    id: "lofi",
    title: "Lo-fi Beats",
    subtitle: "Soft beats for studying and coding",
    mood: "Lo-fi",
    source: "/audio/lofi.mp3",
    artwork: "🌙",
    duration: {
      seconds: null,
      label: "Duration pending licensed audio",
    },
    attribution: {
      status: "pending",
      creator: "Not yet assigned",
      license: "Verified audio asset pending",
    },
    available: false,
  },
  {
    id: "piano",
    title: "Peaceful Piano",
    subtitle: "Gentle piano for calm study sessions",
    mood: "Piano",
    source: "/audio/peaceful-piano.mp3",
    artwork: "🎹",
    duration: {
      seconds: null,
      label: "Duration pending licensed audio",
    },
    attribution: {
      status: "pending",
      creator: "Not yet assigned",
      license: "Verified audio asset pending",
    },
    available: false,
  },
] as const satisfies readonly StudyTrack[];

export type StudyTrackId = (typeof studyTracks)[number]["id"];

export type StudyMusicPreferences = {
  selectedTrackId: StudyTrackId;
  volume: number;
  muted: boolean;
  repeat: boolean;
};

const preferredTrackByStudyStyle: Record<StudyStyle, StudyTrackId> = {
  Cozy: "deep-focus",
  Rain: "lofi",
  "Night Owl": "lofi",
  Piano: "piano",
  Spotify: "deep-focus",
};

function canUseStorage() {
  return typeof window !== "undefined" && "localStorage" in window;
}

function clampVolume(volume: number) {
  return Math.min(1, Math.max(0, volume));
}

export function isStudyTrackId(value: unknown): value is StudyTrackId {
  return (
    typeof value === "string" &&
    studyTracks.some((track) => track.id === value)
  );
}

export function getStudyTrack(trackId: StudyTrackId) {
  return studyTracks.find((track) => track.id === trackId) ?? studyTracks[0];
}

export function getPreferredStudyTrackId(studyStyle: StudyStyle) {
  return preferredTrackByStudyStyle[studyStyle];
}

export function getDefaultStudyMusicPreferences(): StudyMusicPreferences {
  const studyStyle = loadUserPreferences().studyStyle;

  return {
    selectedTrackId: getPreferredStudyTrackId(studyStyle),
    volume: 0.35,
    muted: false,
    repeat: false,
  };
}

export function loadStudyMusicPreferences(): StudyMusicPreferences {
  const fallback = getDefaultStudyMusicPreferences();
  if (!canUseStorage()) return fallback;

  try {
    const saved = window.localStorage.getItem(STUDY_MUSIC_STORAGE_KEY);
    if (!saved) return fallback;

    const parsed = JSON.parse(saved) as Partial<StudyMusicPreferences>;
    return {
      selectedTrackId: isStudyTrackId(parsed.selectedTrackId)
        ? parsed.selectedTrackId
        : fallback.selectedTrackId,
      volume:
        typeof parsed.volume === "number" && Number.isFinite(parsed.volume)
          ? clampVolume(parsed.volume)
          : fallback.volume,
      muted:
        typeof parsed.muted === "boolean" ? parsed.muted : fallback.muted,
      repeat:
        typeof parsed.repeat === "boolean" ? parsed.repeat : fallback.repeat,
    };
  } catch {
    return fallback;
  }
}

export function saveStudyMusicPreferences(
  preferences: StudyMusicPreferences,
) {
  if (!canUseStorage()) return false;

  const normalized: StudyMusicPreferences = {
    selectedTrackId: isStudyTrackId(preferences.selectedTrackId)
      ? preferences.selectedTrackId
      : studyTracks[0].id,
    volume: clampVolume(preferences.volume),
    muted: Boolean(preferences.muted),
    repeat: Boolean(preferences.repeat),
  };

  try {
    window.localStorage.setItem(
      STUDY_MUSIC_STORAGE_KEY,
      JSON.stringify(normalized),
    );
    window.dispatchEvent(
      new CustomEvent(STUDY_MUSIC_PREFERENCES_EVENT, {
        detail: normalized,
      }),
    );
    return true;
  } catch {
    return false;
  }
}
