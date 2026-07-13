import { notFound } from "next/navigation";

import SQLPractice from "@/components/sql/SQLPractice";
import { getNextSQLLesson, getSQLLesson, sqlLessons } from "@/lib/sqlLessons";

export function generateStaticParams() {
  return sqlLessons.map((lesson) => ({ id: lesson.id }));
}

export default async function SQLPracticePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lesson = getSQLLesson(id);
  if (!lesson) notFound();
  return <SQLPractice key={lesson.id} lesson={lesson} nextLesson={getNextSQLLesson(id)} />;
}
