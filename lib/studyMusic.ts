import {
  loadUserPreferences,
  type StudyStyle,
} from "@/lib/userPreferences";

export const STUDY_MUSIC_STORAGE_KEY = "databloom-study-music-v1";
export const STUDY_MUSIC_PREFERENCES_EVENT =
  "databloom:study-music-preferences-updated";

export type StudyMusicMood =
  | "Lo-fi"
  | "Piano"
  | "Rain"
  | "Coffee Shop"
  | "Deep Focus";

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

/** Native study tracks bundled with DataBloom OS. */
export const studyTracks = [
  {
    id: "lofi",
    title: "Lo-fi Focus",
    subtitle: "Soft beats for studying and coding",
    mood: "Lo-fi",
    source:
      "/audio/fassounds-satisfying-lofi-for-focus-study-amp-working-242103.mp3",
    artwork: "🎧",
    duration: {
      seconds: 130,
      label: "2:10",
    },
    attribution: {
      status: "pending",
      creator: "Attribution requires verification",
      license: "License requires verification",
    },
    available: true,
  },
  {
    id: "piano",
    title: "Peaceful Piano",
    subtitle: "Gentle piano for calm study sessions",
    mood: "Piano",
    source: "/audio/clavier-music-peaceful-piano-303988.mp3",
    artwork: "🎹",
    duration: {
      seconds: 103,
      label: "1:43",
    },
    attribution: {
      status: "pending",
      creator: "Attribution requires verification",
      license: "License requires verification",
    },
    available: true,
  },
  {
    id: "gentle-rain",
    title: "Gentle Rain",
    subtitle: "Soft rain ambience for calm concentration",
    mood: "Rain",
    source: "/audio/eryliaa-gentle-rain-for-relaxation-and-sleep-337279.mp3",
    artwork: "🌧️",
    duration: {
      seconds: 531,
      label: "8:51",
    },
    attribution: {
      status: "pending",
      creator: "Attribution requires verification",
      license: "License requires verification",
    },
    available: true,
  },
  {
    id: "coffee-shop",
    title: "Coffee Shop",
    subtitle: "Warm lo-fi ambience for cozy study sessions",
    mood: "Coffee Shop",
    source: "/audio/alex-morgan-lofi-coffee-shop-568150.mp3",
    artwork: "☕",
    duration: {
      seconds: 114,
      label: "1:54",
    },
    attribution: {
      status: "pending",
      creator: "Attribution requires verification",
      license: "License requires verification",
    },
    available: true,
  },
  {
    id: "deep-focus",
    title: "Inspiring Focus",
    subtitle: "Uplifting instrumentals for productive focus",
    mood: "Deep Focus",
    source: "/audio/the_mountain-inspiring-focus-137045.mp3",
    artwork: "✨",
    duration: {
      seconds: 151,
      label: "2:31",
    },
    attribution: {
      status: "pending",
      creator: "Attribution requires verification",
      license: "License requires verification",
    },
    available: true,
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
  Cozy: "coffee-shop",
  Rain: "gentle-rain",
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
