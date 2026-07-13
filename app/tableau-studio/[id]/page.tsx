import { notFound } from "next/navigation";

import TableauLessonDetail from "@/components/tableau/TableauLessonDetail";
import { getTableauLesson, tableauLessons } from "@/lib/tableauLessons";

export function generateStaticParams() {
  return tableauLessons.map((lesson) => ({ id: lesson.id }));
}

export default async function TableauLessonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lesson = getTableauLesson(id);
  if (!lesson) notFound();
  return <TableauLessonDetail key={lesson.id} lesson={lesson} />;
}
