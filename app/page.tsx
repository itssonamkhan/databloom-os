import Sidebar from "@/components/layout/Sidebar";
import FeatureCard from "@/components/cards/FeatureCard";
import Navbar from "@/components/navigation/Navbar";

import WelcomeHero from "@/components/home/WelcomeHero";
import ProgressPanel from "@/components/home/ProgressPanel";
import DailyGoals from "@/components/home/DailyGoals";
import MochiWidget from "@/components/home/MochiWidget";
import MusicWidget from "@/components/home/MusicWidget";
import StudyStats from "@/components/home/StudyStats";
import MochiMission from "@/components/home/MochiMission";
import FormulaChallenge from "@/components/home/FormulaChallenge";
import Achievements from "@/components/home/Achievements";
import StreakCard from "@/components/home/StreakCard";

export default function Home() {
  return (
    <main className="flex min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">

      <Sidebar />

      <div className="min-w-0 flex-1 px-4 pb-6 pt-20 sm:px-6 lg:p-10">

        <Navbar />

        <div className="max-w-7xl mx-auto">

          <div className="mt-10">

            <h1 className="text-5xl font-bold text-purple-700">
              🌸 DataBloom OS
            </h1>

            <p className="mt-3 text-gray-600 text-xl">
              Your cozy digital study companion for becoming a Data Analyst.
            </p>

          </div>


          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">


            <FeatureCard
              title="Mochi AI"
              description="Your personal AI Study Buddy"
              icon="🐰"
              href="/mochi"
              color="border-pink-200 hover:bg-pink-50"
            />


            <FeatureCard
              title="Formula Studio"
              description="Master 500+ Excel formulas"
              icon="📚"
              href="/formula-studio"
              color="border-purple-200 hover:bg-purple-50"
            />

            <FeatureCard
              title="SQL Studio"
              description="Master queries, joins, databases, and practical SQL analysis"
              icon="🗄️"
              href="/sql-studio"
              color="border-sky-200 hover:bg-sky-50"
            />


            <FeatureCard
              title="Dashboard Studio"
              description="Create beautiful dashboards"
              icon="📊"
              href="/dashboard"
              color="border-blue-200 hover:bg-blue-50"
            />

            <FeatureCard
              title="Power BI Studio"
              description="Model data, design reports, and learn DAX"
              icon="📊"
              href="/power-bi-studio"
              color="border-amber-200 hover:bg-amber-50"
            />

            <FeatureCard
              title="Power Query Studio"
              description="Clean, combine, and automate data preparation with M"
              icon="🧹"
              href="/power-query-studio"
              color="border-teal-200 hover:bg-teal-50"
            />

            <FeatureCard
              title="Python Studio"
              description="Learn Python, NumPy, Pandas, and visualization"
              icon="🐍"
              href="/python-studio"
              color="border-emerald-200 hover:bg-emerald-50"
            />

            <FeatureCard
              title="Statistics Studio"
              description="Master probability, inference, regression, and experiments"
              icon="📐"
              href="/statistics-studio"
              color="border-rose-200 hover:bg-rose-50"
            />

            <FeatureCard
              title="Tableau Studio"
              description="Build visual analytics, dashboards, and Tableau expertise"
              icon="📊"
              href="/tableau-studio"
              color="border-blue-200 hover:bg-blue-50"
            />

            <FeatureCard
              title="Business Analytics Studio"
              description="Turn metrics, business frameworks, and case studies into decisions"
              icon="💼"
              href="/business-analytics-studio"
              color="border-indigo-200 hover:bg-indigo-50"
            />

            <FeatureCard
              title="Dataset Library"
              description="Preview and download 42 realistic datasets for hands-on practice"
              icon="🗂️"
              href="/dataset-library"
              color="border-violet-200 hover:bg-violet-50"
            />

            <FeatureCard
              title="Practice Lab"
              description="Practice everything you've learned with quizzes, challenges, and XP."
              icon="🧩"
              href="/practice-lab"
              color="border-fuchsia-200 hover:bg-fuchsia-50"
            />

            <FeatureCard
              title="Interview Hub"
              description="Practice 500+ technical and HR interview questions"
              icon="🎯"
              href="/interview-hub"
              color="border-pink-200 hover:bg-pink-50"
            />

            <FeatureCard
              title="Career Hub"
              description="Build roadmaps, career materials, and a focused application pipeline"
              icon="🌱"
              href="/career-hub"
              color="border-emerald-200 hover:bg-emerald-50"
            />

            <FeatureCard
              title="Smart Notes Studio"
              description="Write, organize, and revisit searchable study notes"
              icon="📝"
              href="/smart-notes"
              color="border-violet-200 hover:bg-violet-50"
            />

            <FeatureCard
              title="Flashcards Studio"
              description="Build lasting recall with decks, daily review, and spaced repetition"
              icon="🧠"
              href="/flashcards"
              color="border-pink-200 hover:bg-pink-50"
            />


          </div>



          <div className="mt-12 space-y-8">


            <WelcomeHero />



            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              <ProgressPanel />

              <StudyStats />

              <StreakCard />

            </div>



            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <DailyGoals />

              <MochiWidget />

            </div>



            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <MusicWidget />

              <MochiMission />

            </div>



            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <FormulaChallenge />

              <Achievements />

            </div>



          </div>


        </div>


      </div>


    </main>
  );
}
