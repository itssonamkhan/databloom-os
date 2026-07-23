import FeatureCard from "@/components/cards/FeatureCard";
import Achievements from "@/components/home/Achievements";
import DailyGoals from "@/components/home/DailyGoals";
import FormulaChallenge from "@/components/home/FormulaChallenge";
import HomeJourneyRecommendation from "@/components/home/HomeJourneyRecommendation";
import MochiMission from "@/components/home/MochiMission";
import MochiWidget from "@/components/home/MochiWidget";
import MusicWidget from "@/components/home/MusicWidget";
import ProgressPanel from "@/components/home/ProgressPanel";
import StreakCard from "@/components/home/StreakCard";
import StudyStats from "@/components/home/StudyStats";
import WelcomeHero from "@/components/home/WelcomeHero";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/navigation/Navbar";

type JourneyCard = {
  title: string;
  description: string;
  icon: string;
  href: string;
  color: string;
};

const journeySections: Array<{
  stage: string;
  title: string;
  description: string;
  cards: JourneyCard[];
}> = [
  {
    stage: "Stage 1 · Start here",
    title: "Build your analyst foundation",
    description: "Begin with spreadsheet logic, statistical thinking, and the language analysts use to query data.",
    cards: [
      { title: "Formula Studio", description: "Explore a growing library of practical Excel formulas", icon: "📚", href: "/formula-studio", color: "border-purple-200 hover:bg-purple-50" },
      { title: "Statistics Studio", description: "Master probability, inference, regression, and experiments", icon: "📐", href: "/statistics-studio", color: "border-rose-200 hover:bg-rose-50" },
      { title: "SQL Studio", description: "Master queries, joins, databases, and practical SQL analysis", icon: "🗄️", href: "/sql-studio", color: "border-sky-200 hover:bg-sky-50" },
      { title: "AI Study Buddy", description: "Ask your selected study companion for a gentle explanation when you get stuck", icon: "✨", href: "/mochi", color: "border-pink-200 hover:bg-pink-50" },
    ],
  },
  {
    stage: "Stage 2 · Prepare and visualize data",
    title: "Turn raw data into clear visual stories",
    description: "Clean reliable inputs, model them thoughtfully, and communicate the result through dashboards.",
    cards: [
      { title: "Power Query Studio", description: "Clean, combine, and automate data preparation with M", icon: "🧹", href: "/power-query-studio", color: "border-teal-200 hover:bg-teal-50" },
      { title: "Power BI Studio", description: "Model data, design reports, and learn DAX", icon: "📊", href: "/power-bi-studio", color: "border-amber-200 hover:bg-amber-50" },
      { title: "Tableau Studio", description: "Build visual analytics, dashboards, and Tableau expertise", icon: "📊", href: "/tableau-studio", color: "border-blue-200 hover:bg-blue-50" },
      { title: "Dashboard Studio", description: "Create stakeholder-ready portfolio dashboards", icon: "🎨", href: "/dashboard", color: "border-blue-200 hover:bg-blue-50" },
    ],
  },
  {
    stage: "Stage 3 · Analyse with code and business thinking",
    title: "Move from outputs to useful decisions",
    description: "Use code for repeatable analysis, frame business questions, and work with realistic datasets.",
    cards: [
      { title: "Python Studio", description: "Learn Python, NumPy, Pandas, and visualization", icon: "🐍", href: "/python-studio", color: "border-emerald-200 hover:bg-emerald-50" },
      { title: "Business Analytics Studio", description: "Turn metrics, frameworks, and case studies into decisions", icon: "💼", href: "/business-analytics-studio", color: "border-indigo-200 hover:bg-indigo-50" },
      { title: "Dataset Library", description: "Preview and download 42 realistic datasets for hands-on practice", icon: "🗂️", href: "/dataset-library", color: "border-violet-200 hover:bg-violet-50" },
    ],
  },
  {
    stage: "Stage 4 · Practise and revise",
    title: "Make your learning stick",
    description: "Test weak topics, capture what matters, and revisit knowledge with spaced repetition.",
    cards: [
      { title: "Practice Lab", description: "Practise everything you have learned with quizzes, challenges, and XP", icon: "🧩", href: "/practice-lab", color: "border-fuchsia-200 hover:bg-fuchsia-50" },
      { title: "Smart Notes Studio", description: "Write, organize, and revisit searchable study notes", icon: "📝", href: "/smart-notes", color: "border-violet-200 hover:bg-violet-50" },
      { title: "Flashcards Studio", description: "Build lasting recall with decks, daily review, and spaced repetition", icon: "🧠", href: "/flashcards", color: "border-pink-200 hover:bg-pink-50" },
    ],
  },
  {
    stage: "Stage 5 · Prove your skills and prepare for work",
    title: "Turn learning into career evidence",
    description: "Rehearse interviews, plan useful credentials, and build a focused path into analyst work.",
    cards: [
      { title: "Interview Hub", description: "Practice 500+ technical and HR interview questions", icon: "🎯", href: "/interview-hub", color: "border-pink-200 hover:bg-pink-50" },
      { title: "Certification Hub", description: "Compare certification paths, plan preparation, and track readiness", icon: "🏅", href: "/certification-hub", color: "border-amber-200 hover:bg-amber-50" },
      { title: "Career Hub", description: "Build roadmaps, career materials, and a focused application pipeline", icon: "🌱", href: "/career-hub", color: "border-emerald-200 hover:bg-emerald-50" },
    ],
  },
];

export default function Home() {
  return (
    <main className="flex min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <Sidebar />
      <div className="min-w-0 flex-1 px-4 pb-6 pt-20 sm:px-6 lg:p-10">
        <Navbar />
        <div className="mx-auto max-w-7xl">
          <WelcomeHero />

          <div className="mt-10">
            <h1 className="text-5xl font-bold text-purple-700">🌸 DataBloom OS</h1>
            <p className="mt-3 text-xl text-gray-600">Your cozy digital study companion for becoming a Data Analyst.</p>
            <HomeJourneyRecommendation />
          </div>

          <div className="mt-12 space-y-12">
            {journeySections.map((section, index) => (
              <section key={section.stage} aria-labelledby={`journey-stage-${index}`}>
                <p className="text-sm font-black uppercase tracking-[0.16em] text-purple-600">{section.stage}</p>
                <h2 id={`journey-stage-${index}`} className="mt-2 text-3xl font-black text-slate-950">{section.title}</h2>
                <p className="mt-2 max-w-3xl leading-7 text-slate-600">{section.description}</p>
                {index === 0 ? (
                  <div className="mt-5 rounded-3xl border border-purple-100 bg-white/70 p-5 shadow-sm backdrop-blur-xl">
                    <p className="font-black text-purple-800">Beginner Journey · Learning Roadmap</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">Start with Formula Studio, add Statistics, then use SQL to work confidently with structured data. Modules stay open, so you can move at your own pace.</p>
                  </div>
                ) : null}
                <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {section.cards.map((card) => <FeatureCard key={card.title} {...card} />)}
                </div>
              </section>
            ))}
          </div>

          <div className="mt-14 space-y-8">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3"><ProgressPanel /><StudyStats /><StreakCard /></div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2"><DailyGoals /><MochiWidget /></div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2"><MusicWidget /><MochiMission /></div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2"><FormulaChallenge /><Achievements /></div>
          </div>
        </div>
      </div>
    </main>
  );
}
