import { notFound } from "next/navigation";

import PythonLessonDetail from "@/components/python/PythonLessonDetail";
import { getPythonLesson, pythonLessons } from "@/lib/pythonLessons";

export function generateStaticParams() {
  return pythonLessons.map((lesson) => ({ id: lesson.id }));
}

export default async function PythonLessonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lesson = getPythonLesson(id);

  if (!lesson) notFound();

  return <PythonLessonDetail key={lesson.id} lesson={lesson} />;
}
