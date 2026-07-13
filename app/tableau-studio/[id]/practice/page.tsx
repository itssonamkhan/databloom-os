import { notFound } from "next/navigation";

import TableauPractice from "@/components/tableau/TableauPractice";
import {
  getNextTableauLesson,
  getTableauLesson,
  tableauLessons,
} from "@/lib/tableauLessons";

export function generateStaticParams() {
  return tableauLessons.map((lesson) => ({ id: lesson.id }));
}

export default async function TableauPracticePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lesson = getTableauLesson(id);
  if (!lesson) notFound();
  return (
    <TableauPractice
      key={lesson.id}
      lesson={lesson}
      nextLesson={getNextTableauLesson(id)}
    />
  );
}
