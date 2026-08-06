"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  getStudyTrack,
  isStudyTrackId,
  loadStudyMusicPreferences,
  saveStudyMusicPreferences,
  STUDY_MUSIC_STORAGE_KEY,
  studyTracks,
  type StudyMusicPreferences,
  type StudyTrackId,
} from "@/lib/studyMusic";

type StudyMusicPlayerState = StudyMusicPreferences & {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  error: string | null;
};

type StudyMusicContextValue = StudyMusicPlayerState & {
  tracks: typeof studyTracks;
  selectedTrack: (typeof studyTracks)[number];
  selectTrack: (trackId: StudyTrackId) => void;
  play: () => Promise<void>;
  pause: () => void;
  next: () => Promise<void>;
  previous: () => Promise<void>;
  seek: (seconds: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleRepeat: () => void;
};

const StudyMusicContext = createContext<StudyMusicContextValue | undefined>(
  undefined,
);

function createInitialState(): StudyMusicPlayerState {
  const preferences = loadStudyMusicPreferences();
  const selectedTrack = getStudyTrack(preferences.selectedTrackId);

  return {
    ...preferences,
    currentTime: 0,
    duration: selectedTrack.duration.seconds ?? 0,
    isPlaying: false,
    error: null,
  };
}

function clampVolume(volume: number) {
  return Math.min(1, Math.max(0, volume));
}

export function StudyMusicProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, setState] = useState(createInitialState);
  const stateRef = useRef(state);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const replaceState = useCallback((nextState: StudyMusicPlayerState) => {
    stateRef.current = nextState;
    setState(nextState);
  }, []);

  const updateState = useCallback(
    (updater: (current: StudyMusicPlayerState) => StudyMusicPlayerState) => {
      replaceState(updater(stateRef.current));
    },
    [replaceState],
  );

  const persistPreferences = useCallback((next: StudyMusicPlayerState) => {
    saveStudyMusicPreferences({
      selectedTrackId: next.selectedTrackId,
      volume: next.volume,
      muted: next.muted,
      repeat: next.repeat,
    });
  }, []);

  const prepareAudioForTrack = useCallback(
    (trackId: StudyTrackId, shouldResume: boolean) => {
      const audio = audioRef.current;
      const track = getStudyTrack(trackId);
      if (!audio) return Promise.resolve();

      audio.pause();
      audio.removeAttribute("src");
      audio.load();

      if (!track.available) {
        updateState((current) => ({
          ...current,
          currentTime: 0,
          duration: track.duration.seconds ?? 0,
          isPlaying: false,
          error: shouldResume
            ? "Native study audio will be available after licensed tracks are added."
            : null,
        }));
        return Promise.resolve();
      }

      audio.src = track.source;
      audio.currentTime = 0;

      if (!shouldResume) return Promise.resolve();

      return audio.play().catch(() => {
        updateState((current) => ({
          ...current,
          isPlaying: false,
          error: "Press play to start this track.",
        }));
      });
    },
    [updateState],
  );

  const selectTrack = useCallback(
    (trackId: StudyTrackId) => {
      if (!isStudyTrackId(trackId)) return;
      const shouldResume = audioRef.current?.paused === false;
      const track = getStudyTrack(trackId);
      const nextState = {
        ...stateRef.current,
        selectedTrackId: trackId,
        currentTime: 0,
        duration: track.duration.seconds ?? 0,
        isPlaying: false,
        error: null,
      };

      replaceState(nextState);
      persistPreferences(nextState);
      void prepareAudioForTrack(trackId, shouldResume);
    },
    [persistPreferences, prepareAudioForTrack, replaceState],
  );

  const play = useCallback(async () => {
    const audio = audioRef.current;
    const track = getStudyTrack(stateRef.current.selectedTrackId);
    if (!audio) return;

    if (!track.available) {
      updateState((current) => ({
        ...current,
        isPlaying: false,
        error: "Native study audio will be available after licensed tracks are added.",
      }));
      return;
    }

    if (!audio.src) audio.src = track.source;

    try {
      await audio.play();
    } catch {
      updateState((current) => ({
        ...current,
        isPlaying: false,
        error: "Press play to start this track.",
      }));
    }
  }, [updateState]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const changeTrack = useCallback(
    async (direction: 1 | -1) => {
      const currentIndex = studyTracks.findIndex(
        (track) => track.id === stateRef.current.selectedTrackId,
      );
      const nextIndex =
        (currentIndex + direction + studyTracks.length) % studyTracks.length;
      const nextTrack = studyTracks[nextIndex];
      const shouldResume = audioRef.current?.paused === false;
      const nextState = {
        ...stateRef.current,
        selectedTrackId: nextTrack.id,
        currentTime: 0,
        duration: nextTrack.duration.seconds ?? 0,
        isPlaying: false,
        error: null,
      };

      replaceState(nextState);
      persistPreferences(nextState);
      await prepareAudioForTrack(nextTrack.id, shouldResume);
    },
    [persistPreferences, prepareAudioForTrack, replaceState],
  );

  const next = useCallback(() => changeTrack(1), [changeTrack]);
  const previous = useCallback(() => changeTrack(-1), [changeTrack]);

  const seek = useCallback(
    (seconds: number) => {
      const audio = audioRef.current;
      const maximum =
        Number.isFinite(audio?.duration) && audio && audio.duration > 0
          ? audio.duration
          : stateRef.current.duration;
      const nextTime = Math.min(Math.max(0, seconds), Math.max(0, maximum));

      if (audio?.src) audio.currentTime = nextTime;
      updateState((current) => ({ ...current, currentTime: nextTime }));
    },
    [updateState],
  );

  const setVolume = useCallback(
    (volume: number) => {
      const nextVolume = clampVolume(volume);
      const nextState = { ...stateRef.current, volume: nextVolume };
      if (audioRef.current) audioRef.current.volume = nextVolume;
      replaceState(nextState);
      persistPreferences(nextState);
    },
    [persistPreferences, replaceState],
  );

  const toggleMute = useCallback(() => {
    const nextState = { ...stateRef.current, muted: !stateRef.current.muted };
    if (audioRef.current) audioRef.current.muted = nextState.muted;
    replaceState(nextState);
    persistPreferences(nextState);
  }, [persistPreferences, replaceState]);

  const toggleRepeat = useCallback(() => {
    const nextState = { ...stateRef.current, repeat: !stateRef.current.repeat };
    if (audioRef.current) audioRef.current.loop = nextState.repeat;
    replaceState(nextState);
    persistPreferences(nextState);
  }, [persistPreferences, replaceState]);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = "metadata";
    audio.volume = stateRef.current.volume;
    audio.muted = stateRef.current.muted;
    audio.loop = stateRef.current.repeat;
    audioRef.current = audio;

    const handlePlay = () => {
      updateState((current) => ({ ...current, isPlaying: true, error: null }));
    };
    const handlePause = () => {
      updateState((current) => ({ ...current, isPlaying: false }));
    };
    const handleTimeUpdate = () => {
      updateState((current) => ({
        ...current,
        currentTime: audio.currentTime,
      }));
    };
    const handleMetadata = () => {
      updateState((current) => ({
        ...current,
        duration: Number.isFinite(audio.duration) ? audio.duration : 0,
      }));
    };
    const handleEnded = () => {
      updateState((current) => ({
        ...current,
        currentTime: current.duration,
        isPlaying: false,
      }));
    };
    const handleError = () => {
      updateState((current) => ({
        ...current,
        isPlaying: false,
        error: "This study track could not be loaded.",
      }));
    };

    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleMetadata);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    return () => {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleMetadata);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
      audioRef.current = null;
    };
  }, [updateState]);

  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key !== STUDY_MUSIC_STORAGE_KEY) return;
      const preferences = loadStudyMusicPreferences();
      const track = getStudyTrack(preferences.selectedTrackId);
      const audio = audioRef.current;

      if (audio) {
        audio.pause();
        audio.removeAttribute("src");
        audio.load();
        audio.volume = preferences.volume;
        audio.muted = preferences.muted;
        audio.loop = preferences.repeat;
      }

      replaceState({
        ...preferences,
        currentTime: 0,
        duration: track.duration.seconds ?? 0,
        isPlaying: false,
        error: null,
      });
    }

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [replaceState]);

  const value = useMemo<StudyMusicContextValue>(
    () => ({
      ...state,
      tracks: studyTracks,
      selectedTrack: getStudyTrack(state.selectedTrackId),
      selectTrack,
      play,
      pause,
      next,
      previous,
      seek,
      setVolume,
      toggleMute,
      toggleRepeat,
    }),
    [
      state,
      selectTrack,
      play,
      pause,
      next,
      previous,
      seek,
      setVolume,
      toggleMute,
      toggleRepeat,
    ],
  );

  return (
    <StudyMusicContext.Provider value={value}>
      {children}
    </StudyMusicContext.Provider>
  );
}

export function useStudyMusic() {
  const context = useContext(StudyMusicContext);
  if (!context) {
    throw new Error("useStudyMusic must be used inside StudyMusicProvider");
  }
  return context;
}
