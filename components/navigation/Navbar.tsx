"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bell,
  Flame,
  Home,
  Music2,
  Search,
  UserRound,
  X,
} from "lucide-react";

import { playClickSound } from "@/lib/sounds";
import { useProgress } from "@/context/ProgressContext";

type SearchItem = {
  title: string;
  description: string;
  href: string;
  icon: string;
  keywords: string[];
};

const searchItems: SearchItem[] = [
  {
    title: "Home",
    description: "Return to your DataBloom dashboard",
    href: "/",
    icon: "🏠",
    keywords: ["home", "dashboard", "main"],
  },
  {
    title: "Formula Studio",
    description: "Learn and practise Excel formulas",
    href: "/formula-studio",
    icon: "📚",
    keywords: ["excel", "formula", "functions"],
  },
  {
    title: "SQL Studio",
    description: "Learn SQL queries and database concepts",
    href: "/sql-studio",
    icon: "🗄️",
    keywords: ["sql", "database", "queries"],
  },
  {
    title: "Power BI Studio",
    description: "Learn dashboards, modelling, and DAX",
    href: "/power-bi-studio",
    icon: "📊",
    keywords: ["power bi", "dax", "dashboard"],
  },
  {
    title: "Power Query Studio",
    description: "Learn data cleaning, M, and refreshable transformations",
    href: "/power-query-studio",
    icon: "🧹",
    keywords: ["power query", "m language", "etl", "data cleaning", "merge", "append"],
  },
  {
    title: "Python Studio",
    description: "Learn Python, Pandas, NumPy, and charts",
    href: "/python-studio",
    icon: "🐍",
    keywords: ["python", "pandas", "numpy"],
  },
  {
    title: "Statistics Studio",
    description: "Learn statistics for data analysis",
    href: "/statistics-studio",
    icon: "📈",
    keywords: ["statistics", "probability", "regression"],
  },
  {
    title: "Tableau Studio",
    description: "Learn Tableau visual analytics and dashboards",
    href: "/tableau-studio",
    icon: "📊",
    keywords: ["tableau", "visual analytics", "dashboard", "lod"],
  },
  {
    title: "Business Analytics Studio",
    description: "Learn metrics, business decisions, frameworks, and case studies",
    href: "/business-analytics-studio",
    icon: "💼",
    keywords: [
      "business analytics",
      "metrics",
      "kpi",
      "case study",
      "decision",
      "customer analytics",
    ],
  },
  {
    title: "Dashboard Studio",
    description: "Build practical analyst projects",
    href: "/dashboard",
    icon: "🎨",
    keywords: ["projects", "dashboard", "sales", "finance", "hr"],
  },
  {
    title: "Practice Lab",
    description: "Practise with datasets and challenges",
    href: "/practice",
    icon: "🧪",
    keywords: ["practice", "quiz", "dataset"],
  },
  {
    title: "Planner",
    description: "Plan your daily learning goals",
    href: "/planner",
    icon: "🗓️",
    keywords: ["planner", "tasks", "goals"],
  },
  {
    title: "Analytics",
    description: "View your learning progress",
    href: "/analytics",
    icon: "📉",
    keywords: ["analytics", "progress", "stats"],
  },
  {
    title: "Mochi AI",
    description: "Open your study companion",
    href: "/mochi",
    icon: "🐰",
    keywords: ["mochi", "ai", "assistant"],
  },
  {
    title: "Achievements",
    description: "View badges and milestones",
    href: "/achievements",
    icon: "🏆",
    keywords: ["achievements", "badges", "rewards"],
  },
  {
    title: "Profile",
    description: "View your XP, streak, and saved progress",
    href: "/profile",
    icon: "👤",
    keywords: ["profile", "xp", "streak"],
  },
];

export default function Navbar() {
  const router = useRouter();
  const { xp } = useProgress();

  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [streak, setStreak] = useState(0);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const possibleKeys = [
        "databloom_streak",
        "databloom-streak",
        "currentStreak",
        "streak",
      ];

      for (const key of possibleKeys) {
        const stored = localStorage.getItem(key);

        if (!stored) continue;

        const parsed = JSON.parse(stored);

        if (typeof parsed === "number") {
          setStreak(parsed);
          return;
        }

        if (
          parsed &&
          typeof parsed === "object" &&
          typeof parsed.currentStreak === "number"
        ) {
          setStreak(parsed.currentStreak);
          return;
        }

        if (
          parsed &&
          typeof parsed === "object" &&
          typeof parsed.streak === "number"
        ) {
          setStreak(parsed.streak);
          return;
        }
      }
    } catch {
      setStreak(0);
    }
  }, []);

  useEffect(() => {
    if (!searchOpen) return;

    window.setTimeout(() => {
      searchInputRef.current?.focus();
    }, 50);
  }, [searchOpen]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
        setNotificationsOpen(false);
      }

      if (event.key === "Escape") {
        setSearchOpen(false);
        setNotificationsOpen(false);
      }
    }

    function handleClickOutside(event: MouseEvent) {
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target as Node)
      ) {
        setNotificationsOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return searchItems;
    }

    return searchItems.filter((item) => {
      const searchableText = [
        item.title,
        item.description,
        ...item.keywords,
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(normalizedQuery);
    });
  }, [query]);

  function navigateTo(href: string) {
    playClickSound();
    setSearchOpen(false);
    setNotificationsOpen(false);
    setQuery("");
    router.push(href);
  }

  function openStudyMusic() {
    playClickSound();

    if (window.location.pathname !== "/") {
      router.push("/");

      window.setTimeout(() => {
        document
          .getElementById("study-mode")
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 700);

      return;
    }

    document
      .getElementById("study-mode")
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  return (
    <>
      <nav className="relative flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/80 bg-white/80 px-5 py-4 shadow-lg backdrop-blur-md sm:px-7">
        <div className="flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 text-2xl shadow-sm">
            🌸
          </div>

          <div>
            <p className="text-lg font-black text-purple-700">
              DataBloom OS
            </p>

            <p className="text-xs font-semibold text-gray-500">
              Your cozy data learning space
            </p>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-end gap-2 sm:gap-3">
          <Link
            href="/"
            onClick={playClickSound}
            className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-purple-100 px-4 py-2 text-sm font-bold text-purple-700 transition hover:-translate-y-0.5 hover:bg-purple-200"
          >
            <Home className="size-4" />
            <span className="hidden sm:inline">Home</span>
          </Link>

          <button
            type="button"
            onClick={() => {
              playClickSound();
              setSearchOpen(true);
              setNotificationsOpen(false);
            }}
            className="hidden min-h-10 items-center gap-2 rounded-xl border border-purple-100 bg-white px-4 py-2 text-sm font-semibold text-gray-600 transition hover:-translate-y-0.5 hover:bg-purple-50 lg:inline-flex"
          >
            <Search className="size-4" />
            Search
            <span className="rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500">
              ⌘K
            </span>
          </button>

          <button
            type="button"
            onClick={openStudyMusic}
            className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-pink-100 px-3 py-2 text-sm font-bold text-pink-700 transition hover:-translate-y-0.5 hover:bg-pink-200"
          >
            <Music2 className="size-4" />
            <span className="hidden xl:inline">Study Music</span>
          </button>

          <Link
            href="/achievements"
            onClick={playClickSound}
            className="hidden min-h-10 items-center gap-2 rounded-xl bg-orange-50 px-3 py-2 text-sm font-bold text-orange-700 transition hover:-translate-y-0.5 hover:bg-orange-100 md:flex"
          >
            <Flame className="size-4" />
            {streak} {streak === 1 ? "day" : "days"}
          </Link>

          <Link
            href="/profile"
            onClick={playClickSound}
            className="min-h-10 rounded-xl bg-yellow-50 px-3 py-2 text-sm font-black text-yellow-700 transition hover:-translate-y-0.5 hover:bg-yellow-100"
          >
            ⭐ {xp} XP
          </Link>

          <div ref={notificationsRef} className="relative">
            <button
              type="button"
              onClick={() => {
                playClickSound();
                setNotificationsOpen((current) => !current);
                setSearchOpen(false);
              }}
              className="relative grid size-10 place-items-center rounded-xl bg-blue-50 text-blue-700 transition hover:-translate-y-0.5 hover:bg-blue-100"
              aria-label="Open notifications"
              aria-expanded={notificationsOpen}
            >
              <Bell className="size-4" />

              <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-pink-500 ring-2 ring-white" />
            </button>

            {notificationsOpen ? (
              <div className="absolute right-0 top-12 z-[200] w-80 rounded-3xl border border-purple-100 bg-white p-4 shadow-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-black text-gray-900">Notifications</p>
                    <p className="text-xs text-gray-500">
                      Your latest DataBloom updates
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setNotificationsOpen(false)}
                    className="grid size-8 place-items-center rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200"
                    aria-label="Close notifications"
                  >
                    <X className="size-4" />
                  </button>
                </div>

                <div className="mt-4 space-y-3">
                  <button
                    type="button"
                    onClick={() => navigateTo("/planner")}
                    className="w-full rounded-2xl bg-pink-50 p-3 text-left transition hover:bg-pink-100"
                  >
                    <p className="text-sm font-bold text-gray-900">
                      🌸 Today&apos;s learning plan
                    </p>
                    <p className="mt-1 text-xs text-gray-600">
                      Review your goals and continue your journey.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => navigateTo("/achievements")}
                    className="w-full rounded-2xl bg-purple-50 p-3 text-left transition hover:bg-purple-100"
                  >
                    <p className="text-sm font-bold text-gray-900">
                      🏆 Achievement progress
                    </p>
                    <p className="mt-1 text-xs text-gray-600">
                      Check your unlocked badges and rewards.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => navigateTo("/practice")}
                    className="w-full rounded-2xl bg-blue-50 p-3 text-left transition hover:bg-blue-100"
                  >
                    <p className="text-sm font-bold text-gray-900">
                      🧪 Practice reminder
                    </p>
                    <p className="mt-1 text-xs text-gray-600">
                      Complete one practice task to keep blooming.
                    </p>
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          <Link
            href="/profile"
            onClick={playClickSound}
            className="grid size-10 place-items-center rounded-xl bg-purple-600 text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-purple-700"
            aria-label="Open profile"
          >
            <UserRound className="size-4" />
          </Link>
        </div>
      </nav>

      {searchOpen ? (
        <div
          className="fixed inset-0 z-[1200] flex items-start justify-center bg-slate-950/45 px-4 pt-24 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSearchOpen(false);
            }
          }}
        >
          <div className="w-full max-w-2xl overflow-hidden rounded-[2rem] border border-white/80 bg-white shadow-[0_30px_100px_rgba(30,41,59,0.35)]">
            <div className="flex items-center gap-3 border-b border-purple-100 px-5 py-4">
              <Search className="size-5 text-purple-600" />

              <input
                ref={searchInputRef}
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search studios, practice, planner, Mochi..."
                className="min-w-0 flex-1 bg-transparent text-base font-semibold text-gray-900 outline-none placeholder:text-gray-400"
              />

              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="grid size-9 place-items-center rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200"
                aria-label="Close search"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-3">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <button
                    key={item.href}
                    type="button"
                    onClick={() => navigateTo(item.href)}
                    className="flex w-full items-center gap-4 rounded-2xl p-4 text-left transition hover:bg-purple-50"
                  >
                    <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-pink-100 to-purple-100 text-xl">
                      {item.icon}
                    </span>

                    <span>
                      <span className="block font-black text-gray-900">
                        {item.title}
                      </span>

                      <span className="mt-1 block text-sm text-gray-600">
                        {item.description}
                      </span>
                    </span>
                  </button>
                ))
              ) : (
                <div className="px-5 py-12 text-center">
                  <p className="text-3xl">🌱</p>
                  <p className="mt-3 font-black text-gray-900">
                    Nothing found
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Try searching for Excel, SQL, Python, or Planner.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
