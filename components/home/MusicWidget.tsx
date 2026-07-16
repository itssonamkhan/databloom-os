"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import type { StudyStyle } from "@/lib/userPreferences";

type SpotifyMood = {
  id: string;
  name: string;
  subtitle: string;
  emoji: string;
  playlistId: string;
  spotifyUrl: string;
  gradient: string;
};

const moods: SpotifyMood[] = [
  {
    id: "deep-focus",
    name: "Deep Focus",
    subtitle: "Calm instrumentals for concentration",
    emoji: "📚",
    playlistId: "37i9dQZF1DWZeKCadgRdKQ",
    spotifyUrl:
      "https://open.spotify.com/playlist/37i9dQZF1DWZeKCadgRdKQ",
    gradient:
      "from-purple-100 via-pink-50 to-blue-100",
  },
  {
    id: "lofi",
    name: "Lo-fi Beats",
    subtitle: "Soft beats for studying and coding",
    emoji: "🌙",
    playlistId: "37i9dQZF1DWWQRwui0ExPn",
    spotifyUrl:
      "https://open.spotify.com/playlist/37i9dQZF1DWWQRwui0ExPn",
    gradient:
      "from-blue-100 via-purple-50 to-pink-100",
  },
  {
    id: "piano",
    name: "Peaceful Piano",
    subtitle: "Gentle piano for calm study sessions",
    emoji: "🎹",
    playlistId: "37i9dQZF1DX4sWSpwq3LiO",
    spotifyUrl:
      "https://open.spotify.com/playlist/37i9dQZF1DX4sWSpwq3LiO",
    gradient:
      "from-pink-100 via-rose-50 to-purple-100",
  },
];

const FAVORITES_KEY =
  "databloom-spotify-favorite-moods";

const FOCUS_STATS_KEY =
  "databloom-focus-sessions";

const preferredMoodByStudyStyle: Record<StudyStyle, SpotifyMood["id"]> = {
  Cozy: "deep-focus",
  Rain: "lofi",
  "Night Owl": "lofi",
  Piano: "piano",
  Spotify: "deep-focus",
};

export default function MusicWidget() {
  const preferences = useUserPreferences();
  const [selectedMoodId, setSelectedMoodId] =
    useState(moods[0].id);

  const [favoriteMoodIds, setFavoriteMoodIds] =
    useState<string[]>([]);

  const [timerSeconds, setTimerSeconds] =
    useState(25 * 60);

  const [timerRunning, setTimerRunning] =
    useState(false);

  const [completedSessions, setCompletedSessions] =
    useState(0);

  const timerRef =
    useRef<ReturnType<typeof setInterval> | null>(
      null
    );

  const selectedMood =
    moods.find(
      (mood) => mood.id === selectedMoodId
    ) ?? moods[0];

  const isFavorite =
    favoriteMoodIds.includes(selectedMood.id);

  useEffect(() => {
    try {
      const savedFavorites =
        localStorage.getItem(FAVORITES_KEY);

      if (savedFavorites) {
        const parsed = JSON.parse(savedFavorites);

        if (Array.isArray(parsed)) {
          setFavoriteMoodIds(parsed);
        }
      }

      const savedSessions =
        localStorage.getItem(FOCUS_STATS_KEY);

      if (savedSessions) {
        const parsed = Number(savedSessions);

        if (Number.isFinite(parsed)) {
          setCompletedSessions(parsed);
        }
      }
    } catch {
      setFavoriteMoodIds([]);
      setCompletedSessions(0);
    }
  }, []);

  useEffect(() => {
    setSelectedMoodId(preferredMoodByStudyStyle[preferences.studyStyle]);
  }, [preferences.studyStyle]);

  useEffect(() => {
    if (!timerRunning) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      return;
    }

    timerRef.current = setInterval(() => {
      setTimerSeconds((currentSeconds) => {
        if (currentSeconds <= 1) {
          setTimerRunning(false);

          const nextCompleted =
            completedSessions + 1;

          setCompletedSessions(nextCompleted);

          localStorage.setItem(
            FOCUS_STATS_KEY,
            String(nextCompleted)
          );

          playCompletionTone();

          return 0;
        }

        return currentSeconds - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [timerRunning, completedSessions]);

  function toggleFavorite() {
    const updated = isFavorite
      ? favoriteMoodIds.filter(
          (id) => id !== selectedMood.id
        )
      : [...favoriteMoodIds, selectedMood.id];

    setFavoriteMoodIds(updated);

    localStorage.setItem(
      FAVORITES_KEY,
      JSON.stringify(updated)
    );
  }

  function toggleTimer() {
    if (timerSeconds === 0) {
      setTimerSeconds(25 * 60);
    }

    setTimerRunning((current) => !current);
  }

  function resetTimer() {
    setTimerRunning(false);
    setTimerSeconds(25 * 60);
  }

  function setTimerDuration(minutes: number) {
    setTimerRunning(false);
    setTimerSeconds(minutes * 60);
  }

  function openSpotify() {
    window.open(
      selectedMood.spotifyUrl,
      "_blank",
      "noopener,noreferrer"
    );
  }

  function playCompletionTone() {
    try {
      const context = new AudioContext();

      const frequencies = [
        523.25,
        659.25,
        783.99,
      ];

      frequencies.forEach(
        (frequency, index) => {
          const oscillator =
            context.createOscillator();

          const gain =
            context.createGain();

          const startTime =
            context.currentTime + index * 0.12;

          oscillator.type = "sine";

          oscillator.frequency.setValueAtTime(
            frequency,
            startTime
          );

          gain.gain.setValueAtTime(
            0.09,
            startTime
          );

          gain.gain.exponentialRampToValueAtTime(
            0.001,
            startTime + 0.35
          );

          oscillator.connect(gain);
          gain.connect(context.destination);

          oscillator.start(startTime);
          oscillator.stop(startTime + 0.35);
        }
      );

      setTimeout(() => {
        void context.close();
      }, 1000);
    } catch {
      // The timer still works if audio is unavailable.
    }
  }

  function formatTimer(seconds: number) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(
      2,
      "0"
    )}:${String(remainingSeconds).padStart(
      2,
      "0"
    )}`;
  }

  const timerTotal =
    timerSeconds > 25 * 60
      ? 50 * 60
      : timerSeconds > 10 * 60
        ? 25 * 60
        : 10 * 60;

  const elapsedPercentage =
    timerTotal > 0
      ? Math.min(
          100,
          Math.max(
            0,
            ((timerTotal - timerSeconds) /
              timerTotal) *
              100
          )
        )
      : 0;

  return (
    <section
      id="study-mode"
      className={`
        rounded-3xl
        border
        border-purple-200
        bg-gradient-to-br
        ${selectedMood.gradient}
        p-6
        shadow-lg
        transition-all
        duration-500
      `}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-purple-500">
            Cozy focus hub
          </p>

          <h2 className="mt-2 text-2xl font-bold text-gray-900">
            🎧 Study Mode
          </h2>

          <p className="mt-1 text-sm text-gray-700">
            {preferences.studyStyle} preference · music powered by Spotify.
          </p>
        </div>

        <div className="rounded-2xl bg-white/70 px-4 py-3 text-center shadow-sm">
          <p className="text-2xl">
            {selectedMood.emoji}
          </p>

          <p className="mt-1 text-xs font-bold text-purple-700">
            {selectedMood.name}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {moods.map((mood) => {
          const active =
            selectedMoodId === mood.id;

          return (
            <button
              key={mood.id}
              type="button"
              onClick={() =>
                setSelectedMoodId(mood.id)
              }
              className={`
                rounded-2xl
                border
                p-3
                text-left
                transition
                hover:-translate-y-0.5
                ${
                  active
                    ? "border-purple-500 bg-purple-600 text-white shadow-md"
                    : "border-white/80 bg-white/70 text-gray-800 hover:bg-white"
                }
              `}
            >
              <span className="text-xl">
                {mood.emoji}
              </span>

              <span className="mt-1 block text-sm font-bold">
                {mood.name}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border border-white/80 bg-white shadow-md">
        <iframe
          key={selectedMood.playlistId}
          title={`${selectedMood.name} Spotify player`}
          src={`https://open.spotify.com/embed/playlist/${selectedMood.playlistId}?utm_source=generator&theme=0`}
          width="100%"
          height="152"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          className="block w-full border-0"
        />
      </div>

      <div className="mt-4 rounded-2xl bg-white/75 p-4 shadow-sm backdrop-blur">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-bold text-gray-900">
              {selectedMood.emoji}{" "}
              {selectedMood.name}
            </p>

            <p className="mt-1 text-sm text-gray-600">
              {selectedMood.subtitle}
            </p>
          </div>

          <button
            type="button"
            onClick={toggleFavorite}
            className="rounded-full bg-pink-100 px-3 py-2 text-xl transition hover:scale-110 hover:bg-pink-200"
            aria-label={
              isFavorite
                ? "Remove from favorites"
                : "Add to favorites"
            }
          >
            {isFavorite ? "💗" : "🤍"}
          </button>
        </div>

        <button
          type="button"
          onClick={openSpotify}
          className="mt-4 w-full rounded-xl bg-green-600 px-4 py-3 font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-green-700"
        >
          Open playlist in Spotify
        </button>
      </div>

      <div className="mt-5 rounded-2xl bg-white/75 p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-gray-600">
              🍅 Focus Timer
            </p>

            <p className="mt-1 text-4xl font-bold text-purple-700">
              {formatTimer(timerSeconds)}
            </p>

            <p className="mt-1 text-xs text-gray-600">
              {completedSessions} focus sessions completed
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={toggleTimer}
              className="rounded-xl bg-purple-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-purple-700"
            >
              {timerRunning ? "Pause" : "Start"}
            </button>

            <button
              type="button"
              onClick={resetTimer}
              className="rounded-xl bg-purple-100 px-5 py-3 text-sm font-bold text-purple-700 transition hover:bg-purple-200"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="mt-4 h-3 overflow-hidden rounded-full bg-purple-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
            style={{
              width: `${elapsedPercentage}%`,
            }}
          />
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setTimerDuration(10)}
            className="rounded-xl bg-blue-50 px-3 py-2 text-sm font-bold text-blue-700 transition hover:bg-blue-100"
          >
            10 min
          </button>

          <button
            type="button"
            onClick={() => setTimerDuration(25)}
            className="rounded-xl bg-pink-50 px-3 py-2 text-sm font-bold text-pink-700 transition hover:bg-pink-100"
          >
            25 min
          </button>

          <button
            type="button"
            onClick={() => setTimerDuration(50)}
            className="rounded-xl bg-purple-50 px-3 py-2 text-sm font-bold text-purple-700 transition hover:bg-purple-100"
          >
            50 min
          </button>
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-gray-600">
        Use the play control inside the Spotify player.
      </p>
    </section>
  );
}
