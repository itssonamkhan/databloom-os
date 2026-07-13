import { notFound } from "next/navigation";

import StatisticsPractice from "@/components/statistics/StatisticsPractice";
import {
  getNextStatisticsLesson,
  getStatisticsLesson,
  statisticsLessons,
} from "@/lib/statisticsLessons";

export function generateStaticParams() {
  return statisticsLessons.map((lesson) => ({ id: lesson.id }));
}

export default async function StatisticsPracticePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lesson = getStatisticsLesson(id);

  if (!lesson) notFound();

  return (
    <StatisticsPractice
      key={lesson.id}
      lesson={lesson}
      nextLesson={getNextStatisticsLesson(id)}
    />
  );
}
