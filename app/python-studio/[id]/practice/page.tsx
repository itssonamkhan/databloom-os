import { notFound } from "next/navigation";

import PythonPractice from "@/components/python/PythonPractice";
import {
  getNextPythonLesson,
  getPythonLesson,
  pythonLessons,
} from "@/lib/pythonLessons";

export function generateStaticParams() {
  return pythonLessons.map((lesson) => ({ id: lesson.id }));
}

export default async function PythonPracticePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lesson = getPythonLesson(id);

  if (!lesson) notFound();

  return (
    <PythonPractice
      key={lesson.id}
      lesson={lesson}
      nextLesson={getNextPythonLesson(id)}
    />
  );
}
