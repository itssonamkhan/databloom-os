"use client";

import {
  Award,
  BarChart3,
  BookOpen,
  Bot,
  BriefcaseBusiness,
  Calendar,
  ChartNoAxesCombined,
  Code2,
  Compass,
  Database,
  FlaskConical,
  GraduationCap,
  Headphones,
  Home,
  LayoutDashboard,
  Layers3,
  Menu,
  MessagesSquare,
  NotebookPen,
  RefreshCcw,
  Sigma,
  User,
  X,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { playClickSound } from "@/lib/sounds";

type NavItem = { text: string; href: string; icon: LucideIcon };

const navigationGroups: Array<{ label: string; items: NavItem[] }> = [
  { label: "Overview", items: [{ text: "Home", href: "/", icon: Home }] },
  {
    label: "Learning studios",
    items: [
      { text: "Formula Studio", href: "/formula-studio", icon: BookOpen },
      { text: "SQL Studio", href: "/sql-studio", icon: Database },
      { text: "Python Studio", href: "/python-studio", icon: Code2 },
      { text: "Statistics Studio", href: "/statistics-studio", icon: Sigma },
      { text: "Power BI Studio", href: "/power-bi-studio", icon: ChartNoAxesCombined },
      { text: "Power Query Studio", href: "/power-query-studio", icon: RefreshCcw },
      { text: "Tableau Studio", href: "/tableau-studio", icon: BarChart3 },
      { text: "Business Analytics Studio", href: "/business-analytics-studio", icon: BriefcaseBusiness },
      { text: "Dashboard Studio", href: "/dashboard", icon: LayoutDashboard },
      { text: "Dataset Library", href: "/dataset-library", icon: Database },
    ],
  },
  {
    label: "Practice and career",
    items: [
      { text: "Practice Lab", href: "/practice-lab", icon: FlaskConical },
      { text: "Interview Hub", href: "/interview-hub", icon: MessagesSquare },
      { text: "Career Hub", href: "/career-hub", icon: Compass },
      { text: "Smart Notes", href: "/smart-notes", icon: NotebookPen },
      { text: "Flashcards", href: "/flashcards", icon: Layers3 },
      { text: "Certification Hub", href: "/certification-hub", icon: GraduationCap },
    ],
  },
  {
    label: "Your workspace",
    items: [
      { text: "Planner", href: "/planner", icon: Calendar },
      { text: "Analytics", href: "/analytics", icon: BarChart3 },
      { text: "Study Mode", href: "/#study-mode", icon: Headphones },
      { text: "Achievements", href: "/achievements", icon: Award },
      { text: "Mochi AI", href: "/mochi", icon: Bot },
      { text: "Profile", href: "/profile", icon: User },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleNavigate() {
    playClickSound();
    setMobileOpen(false);
  }

  function isActive(href: string) {
    if (href.includes("#")) return false;
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setMobileOpen((current) => !current)}
        className="fixed left-4 top-4 z-[70] grid size-11 place-items-center rounded-2xl bg-purple-700 text-white shadow-lg lg:hidden"
        aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
        aria-expanded={mobileOpen}
      >
        {mobileOpen ? <X size={21} /> : <Menu size={21} />}
      </button>

      {mobileOpen ? (
        <button
          type="button"
          aria-label="Close navigation overlay"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/35 backdrop-blur-sm lg:hidden"
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 h-dvh w-72 overflow-y-auto border-r border-pink-200 bg-gradient-to-b from-purple-100 via-pink-100 to-blue-100 shadow-xl transition-transform lg:static lg:h-screen lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="px-7 pb-5 pt-20 lg:pt-8">
          <h1 className="text-3xl font-bold text-purple-700">🌸 DataBloom</h1>
          <p className="mt-2 text-sm text-gray-600">Excel Learning Universe</p>
        </div>

        <nav className="space-y-6 px-4 pb-8" aria-label="Primary navigation">
          {navigationGroups.map((group) => (
            <div key={group.label}>
              <p className="mb-2 px-3 text-[11px] font-black uppercase tracking-[0.16em] text-purple-500">
                {group.label}
              </p>
              <div className="space-y-1.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={handleNavigate}
                      aria-current={isActive(item.href) ? "page" : undefined}
                      className={`flex min-h-11 w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition ${isActive(item.href) ? "bg-white text-purple-800 shadow-md" : "text-gray-700 hover:bg-white/70 hover:text-purple-700"}`}
                    >
                      <Icon size={19} aria-hidden="true" />
                      <span className="font-semibold">{item.text}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
