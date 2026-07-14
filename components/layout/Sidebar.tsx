"use client";

import {
  Home,
  BookOpen,
  Calendar,
  BarChart3,
  Bot,
  User,
  Database,
  ChartNoAxesCombined,
  Code2,
  RefreshCcw,
  Sigma,
  BriefcaseBusiness,
  FlaskConical,
  MessagesSquare,
} from "lucide-react";

import { useRouter } from "next/navigation";
import { playClickSound } from "@/lib/sounds";


export default function Sidebar() {

  const router = useRouter();


  return (
    <aside
      className="
      w-72
      min-h-screen
      bg-gradient-to-b
      from-purple-100
      via-pink-100
      to-blue-100
      backdrop-blur-xl
      border-r
      border-pink-200
      shadow-xl
      "
    >

      <div className="p-8">

        <h1 className="text-3xl font-bold text-purple-700">
          🌸 DataBloom
        </h1>

        <p className="text-sm text-gray-600 mt-2">
          Excel Learning Universe
        </p>

      </div>



      <nav className="px-5 space-y-3">


        <SidebarButton
          icon={<Home size={20} />}
          text="Dashboard"
          onClick={() => router.push("/")}
        />


        <SidebarButton
          icon={<BookOpen size={20} />}
          text="Formula Studio"
          onClick={() => router.push("/formula-studio")}
        />

        <SidebarButton
          icon={<Database size={20} />}
          text="SQL Studio"
          onClick={() => router.push("/sql-studio")}
        />

        <SidebarButton
          icon={<Code2 size={20} />}
          text="Python Studio"
          onClick={() => router.push("/python-studio")}
        />

        <SidebarButton
          icon={<Sigma size={20} />}
          text="Statistics Studio"
          onClick={() => router.push("/statistics-studio")}
        />

        <SidebarButton
          icon={<ChartNoAxesCombined size={20} />}
          text="Power BI Studio"
          onClick={() => router.push("/power-bi-studio")}
        />

        <SidebarButton
          icon={<RefreshCcw size={20} />}
          text="Power Query Studio"
          onClick={() => router.push("/power-query-studio")}
        />

        <SidebarButton
          icon={<BarChart3 size={20} />}
          text="Tableau Studio"
          onClick={() => router.push("/tableau-studio")}
        />

        <SidebarButton
          icon={<BriefcaseBusiness size={20} />}
          text="Business Analytics Studio"
          onClick={() => router.push("/business-analytics-studio")}
        />

        <SidebarButton
          icon={<Database size={20} />}
          text="Dataset Library"
          onClick={() => router.push("/dataset-library")}
        />

        <SidebarButton
          icon={<FlaskConical size={20} />}
          text="Practice Lab"
          onClick={() => router.push("/practice-lab")}
        />

        <SidebarButton
          icon={<MessagesSquare size={20} />}
          text="Interview Hub"
          onClick={() => router.push("/interview-hub")}
        />


        <SidebarButton
          icon={<Calendar size={20} />}
          text="Planner"
          onClick={() => router.push("/planner")}
        />


        <SidebarButton
          icon={<BarChart3 size={20} />}
          text="Analytics"
          onClick={() => router.push("/analytics")}
        />


        <SidebarButton
          icon={<Bot size={20} />}
          text="Mochi AI"
          onClick={() => router.push("/mochi")}
        />


        <SidebarButton
          icon={<User size={20} />}
          text="Profile"
          onClick={() => router.push("/profile")}
        />


      </nav>


    </aside>
  );
}




function SidebarButton({
  icon,
  text,
  onClick,
}: {
  icon: React.ReactNode;
  text: string;
  onClick: () => void;
}) {


  function handleClick(){

    playClickSound();

    onClick();

  }



  return (

    <button
      onClick={handleClick}
      className="
      w-full
      flex
      items-center
      gap-4
      rounded-2xl
      px-5
      py-4
      text-gray-700
      hover:bg-white/70
      hover:text-purple-700
      transition
      shadow-sm
      "
    >

      {icon}

      <span className="font-medium">
        {text}
      </span>


    </button>

  );
}
