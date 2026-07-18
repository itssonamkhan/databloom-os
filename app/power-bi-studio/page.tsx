"use client";
import {useEffect,useMemo,useState} from "react"; import {BarChart3,Download,Sparkles} from "lucide-react";
import AppLayout from "@/components/layout/AppLayout"; import StudioCheckpointCards from "@/components/assessments/StudioCheckpointCards"; import PowerBILessonCard from "@/components/power-bi/PowerBILessonCard";
import StudioFilterToolbar from "@/components/studio/StudioFilterToolbar";
import {powerBICategories,powerBIDifficulties,powerBILessons} from "@/lib/powerBILessons"; import {daxCategories,daxLessons} from "@/lib/daxFormulas";
import {calculatePowerBIProgress,loadPowerBIProgress,POWER_BI_PROGRESS_EVENT,togglePowerBIFavorite,type PowerBIProgressState} from "@/lib/powerBIProgress"; import {playClickSound,playNotificationSound} from "@/lib/sounds";
export default function PowerBIStudio(){const [search,setSearch]=useState("");const [category,setCategory]=useState("All");const [difficulty,setDifficulty]=useState("All");const [daxSearch,setDaxSearch]=useState("");const [daxCategory,setDaxCategory]=useState("All");const [daxDifficulty,setDaxDifficulty]=useState("All");const [state,setState]=useState<PowerBIProgressState>(()=>loadPowerBIProgress());
 useEffect(()=>{const sync=()=>setState(loadPowerBIProgress());window.addEventListener(POWER_BI_PROGRESS_EVENT,sync);window.addEventListener("storage",sync);return()=>{window.removeEventListener(POWER_BI_PROGRESS_EVENT,sync);window.removeEventListener("storage",sync)}},[]);
 const filtered=useMemo(()=>powerBILessons.filter(x=>(!search||`${x.title} ${x.description} ${x.category}`.toLowerCase().includes(search.toLowerCase()))&&(category==="All"||x.category===category)&&(difficulty==="All"||x.difficulty===difficulty)),[search,category,difficulty]);
 const filteredDax=useMemo(()=>daxLessons.filter(x=>(!daxSearch||`${x.title} ${x.description} ${x.category}`.toLowerCase().includes(daxSearch.toLowerCase()))&&(daxCategory==="All"||x.category===`DAX · ${daxCategory}`)&&(daxDifficulty==="All"||x.difficulty===daxDifficulty)),[daxSearch,daxCategory,daxDifficulty]);
 const completed=state.completedLessonIds.length+state.completedDAXIds.length,total=powerBILessons.length+daxLessons.length,percent=calculatePowerBIProgress(completed,total);const toggle=(id:string)=>{const next=togglePowerBIFavorite(id);if(next.favoriteIds.includes(id)&&!state.favoriteIds.includes(id))playNotificationSound();setState(next)};
 return <AppLayout><div className="space-y-9 text-slate-950"><header className="rounded-3xl border border-white/70 bg-gradient-to-br from-amber-100 via-pink-100 to-purple-100 p-7 shadow-lg sm:p-10"><div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"><div className="max-w-3xl"><p className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-bold text-amber-900"><BarChart3 size={18}/> Business intelligence skills</p><h1 className="mt-4 text-4xl font-black text-amber-800 sm:text-5xl">📊 Power BI Studio</h1><p className="mt-4 text-lg leading-8 text-slate-700">Build clean models, meaningful visuals, thoughtful dashboards, and a strong DAX foundation.</p></div><a href="/datasets/power-bi-sales-practice.csv" download onClick={playClickSound} className="inline-flex items-center gap-2 rounded-2xl bg-amber-700 px-5 py-4 font-bold text-white"><Download size={19}/> Download Practice Dataset</a></div></header>
 <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[["Total lessons",total],["Completed",completed],["Favorites",state.favoriteIds.length],["Progress",`${percent}%`]].map(([label,value])=><div key={label} className="rounded-3xl border border-amber-100 bg-white p-6 shadow-md"><p className="font-semibold text-slate-700">{label}</p><p className="mt-2 text-3xl font-black text-amber-800">{value}</p></div>)}</section>
 <section className="rounded-3xl border border-amber-100 bg-white p-6 shadow-md"><div className="flex justify-between font-bold"><span>Your Power BI journey</span><span>{percent}%</span></div><div className="mt-4 h-4 overflow-hidden rounded-full bg-amber-100" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}><div className="h-full bg-gradient-to-r from-amber-500 to-purple-600 transition-[width]" style={{width:`${percent}%`}}/></div></section>
 <StudioCheckpointCards studioId="power-bi-studio" />
 <LessonSection title="Power BI lessons" count={filtered.length} search={search} setSearch={setSearch} category={category} setCategory={setCategory} difficulty={difficulty} setDifficulty={setDifficulty} categories={powerBICategories} difficulties={powerBIDifficulties}>{filtered.map(x=><PowerBILessonCard key={x.id} lesson={x} completed={state.completedLessonIds.includes(x.id)} favorite={state.favoriteIds.includes(x.id)} onToggleFavorite={toggle}/>)}</LessonSection>
 <LessonSection title="DAX foundation" count={filteredDax.length} search={daxSearch} setSearch={setDaxSearch} category={daxCategory} setCategory={setDaxCategory} difficulty={daxDifficulty} setDifficulty={setDaxDifficulty} categories={daxCategories} difficulties={powerBIDifficulties}>{filteredDax.map(x=><PowerBILessonCard key={x.id} lesson={x} completed={state.completedDAXIds.includes(x.id)} favorite={state.favoriteIds.includes(x.id)} onToggleFavorite={toggle}/>)}</LessonSection></div></AppLayout>}
function LessonSection({
  title,
  count,
  search,
  setSearch,
  category,
  setCategory,
  difficulty,
  setDifficulty,
  categories,
  difficulties,
  children,
}: {
  title: string;
  count: number;
  search: string;
  setSearch: (value: string) => void;
  category: string;
  setCategory: (value: string) => void;
  difficulty: string;
  setDifficulty: (value: string) => void;
  categories: string[];
  difficulties: readonly string[];
  children: React.ReactNode;
}) {
  return (
    <section>
      <div>
        <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-amber-800">
          <Sparkles size={17} aria-hidden="true" /> Learn by doing
        </p>
        <h2 className="mt-1 text-3xl font-black">{title}</h2>
      </div>
      <div className="mt-4">
        <StudioFilterToolbar
          query={search}
          onQueryChange={setSearch}
          category={category}
          onCategoryChange={setCategory}
          categories={categories}
          difficulty={difficulty}
          onDifficultyChange={setDifficulty}
          difficulties={difficulties}
          resultCount={count}
          searchPlaceholder={`Search ${title}`}
        />
      </div>
      <div className="mt-7 grid gap-6 md:grid-cols-2 2xl:grid-cols-3">{children}</div>
      {count === 0 && (
        <p className="mt-6 rounded-2xl bg-amber-50 p-8 text-center font-bold">
          No lessons match those filters.
        </p>
      )}
    </section>
  );
}
