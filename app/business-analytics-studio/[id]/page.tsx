import { notFound } from "next/navigation";

import BusinessAnalyticsLessonDetail from "@/components/business-analytics/BusinessAnalyticsLessonDetail";
import {
  businessAnalyticsLessons,
  getBusinessAnalyticsLesson,
} from "@/lib/businessAnalyticsLessons";

export function generateStaticParams() {
  return businessAnalyticsLessons.map((lesson) => ({ id: lesson.id }));
}

export default async function BusinessAnalyticsLessonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lesson = getBusinessAnalyticsLesson(id);
  if (!lesson) notFound();
  return <BusinessAnalyticsLessonDetail key={lesson.id} lesson={lesson} />;
}
