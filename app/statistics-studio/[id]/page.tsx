import { notFound } from "next/navigation";

import StatisticsLessonDetail from "@/components/statistics/StatisticsLessonDetail";
import {
  getStatisticsLesson,
  statisticsLessons,
} from "@/lib/statisticsLessons";

export function generateStaticParams() {
  return statisticsLessons.map((lesson) => ({ id: lesson.id }));
}

export default async function StatisticsLessonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lesson = getStatisticsLesson(id);

  if (!lesson) notFound();

  return <StatisticsLessonDetail key={lesson.id} lesson={lesson} />;
}
