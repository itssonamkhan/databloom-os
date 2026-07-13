import {notFound} from "next/navigation";import PowerBILessonDetail from "@/components/power-bi/PowerBILessonDetail";import {getPowerBILesson,powerBILessons} from "@/lib/powerBILessons";import {daxLessons,getDAXLesson} from "@/lib/daxFormulas";
export function generateStaticParams(){return [...powerBILessons,...daxLessons].map(x=>({id:x.id}))}
export default async function Page({params}:{params:Promise<{id:string}>}){const {id}=await params;const lesson=getPowerBILesson(id)??getDAXLesson(id);if(!lesson)notFound();return <PowerBILessonDetail lesson={lesson}/>}
