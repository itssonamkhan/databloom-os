import { notFound } from "next/navigation";

import PowerQueryPractice from "@/components/power-query/PowerQueryPractice";
import {
  getNextPowerQueryLesson,
  getPowerQueryLesson,
  powerQueryLessons,
} from "@/lib/powerQueryLessons";

export function generateStaticParams() {
  return powerQueryLessons.map((lesson) => ({ id: lesson.id }));
}

export default async function PowerQueryPracticePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lesson = getPowerQueryLesson(id);
  if (!lesson) notFound();
  return (
    <PowerQueryPractice
      key={lesson.id}
      lesson={lesson}
      nextLesson={getNextPowerQueryLesson(id)}
    />
  );
}
