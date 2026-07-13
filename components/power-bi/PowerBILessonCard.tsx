"use client";
import Link from "next/link";
import { CheckCircle2, Heart } from "lucide-react";
import type { PowerBILesson } from "@/lib/powerBILessons";
import { playClickSound } from "@/lib/sounds";
export default function PowerBILessonCard({lesson,completed,favorite,onToggleFavorite}:{lesson:PowerBILesson;completed:boolean;favorite:boolean;onToggleFavorite:(id:string)=>void}){
 return <article className="flex flex-col rounded-3xl border border-amber-200 bg-white p-6 shadow-md transition hover:-translate-y-1 hover:shadow-lg">
  <div className="flex items-start justify-between gap-3"><span className="text-4xl">{lesson.icon}</span><button type="button" aria-label={`${favorite?"Remove":"Add"} ${lesson.title} ${favorite?"from":"to"} favorites`} aria-pressed={favorite} onClick={()=>onToggleFavorite(lesson.id)} className={`rounded-full p-2 ${favorite?"bg-pink-100 text-pink-700":"bg-slate-100 text-slate-600"}`}><Heart size={20} fill={favorite?"currentColor":"none"}/></button></div>
  <h3 className="mt-4 text-xl font-black text-slate-950">{lesson.title}</h3><div className="mt-3 flex flex-wrap gap-2 text-xs font-bold"><span className="rounded-full bg-amber-100 px-3 py-1 text-amber-900">{lesson.category}</span><span className="rounded-full bg-purple-100 px-3 py-1 text-purple-900">{lesson.difficulty}</span>{completed&&<span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-emerald-900"><CheckCircle2 size={14}/> Completed</span>}</div>
  <p className="mt-4 flex-1 leading-7 text-slate-700">{lesson.description}</p><div className="mt-5 flex gap-2"><Link href={`/power-bi-studio/${lesson.id}`} onClick={playClickSound} className="flex-1 rounded-xl bg-amber-600 px-4 py-3 text-center font-bold text-white hover:bg-amber-700">Learn</Link><Link href={`/power-bi-studio/${lesson.id}/practice`} onClick={playClickSound} className="flex-1 rounded-xl bg-purple-700 px-4 py-3 text-center font-bold text-white hover:bg-purple-800">Practice</Link></div>
 </article>
}
