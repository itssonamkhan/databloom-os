import { notFound } from "next/navigation";

import SQLLessonDetail from "@/components/sql/SQLLessonDetail";
import { getSQLLesson, sqlLessons } from "@/lib/sqlLessons";

export function generateStaticParams() {
  return sqlLessons.map((lesson) => ({ id: lesson.id }));
}

export default async function SQLLessonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lesson = getSQLLesson(id);
  if (!lesson) notFound();
  return <SQLLessonDetail key={lesson.id} lesson={lesson} />;
}
