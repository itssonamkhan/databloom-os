import { notFound } from "next/navigation";

import PowerBIPractice from "@/components/power-bi/PowerBIPractice";
import { daxLessons, getDAXLesson } from "@/lib/daxFormulas";
import {
  getPowerBILesson,
  powerBILessons,
  type PowerBILesson,
} from "@/lib/powerBILessons";
import { getStudioCurriculumConfiguration } from "@/lib/studioCurriculum";

const allLessons = [...powerBILessons, ...daxLessons];
const lessonsById = new Map(allLessons.map((lesson) => [lesson.id, lesson]));
const curriculum = getStudioCurriculumConfiguration("power-bi-studio");
const guidedLessons = (curriculum?.modules.flatMap((module) => module.lessonIds) ?? [])
  .map((lessonId) => lessonsById.get(lessonId))
  .filter((lesson): lesson is PowerBILesson => Boolean(lesson));

export function generateStaticParams() {
  return allLessons.map((lesson) => ({ id: lesson.id }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lesson = getPowerBILesson(id) ?? getDAXLesson(id);
  if (!lesson) notFound();

  const index = guidedLessons.findIndex((item) => item.id === id);
  return (
    <PowerBIPractice
      lesson={lesson}
      previousLesson={index > 0 ? guidedLessons[index - 1] : undefined}
      nextLesson={index >= 0 ? guidedLessons[index + 1] : undefined}
    />
  );
}
