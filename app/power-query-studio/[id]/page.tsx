import { notFound } from "next/navigation";

import PowerQueryLessonDetail from "@/components/power-query/PowerQueryLessonDetail";
import { getPowerQueryLesson, powerQueryLessons } from "@/lib/powerQueryLessons";

export function generateStaticParams() {
  return powerQueryLessons.map((lesson) => ({ id: lesson.id }));
}

export default async function PowerQueryLessonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lesson = getPowerQueryLesson(id);
  if (!lesson) notFound();
  return <PowerQueryLessonDetail key={lesson.id} lesson={lesson} />;
}
