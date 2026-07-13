import { notFound } from "next/navigation";

import BusinessAnalyticsPractice from "@/components/business-analytics/BusinessAnalyticsPractice";
import {
  businessAnalyticsLessons,
  getBusinessAnalyticsLesson,
  getNextBusinessAnalyticsLesson,
} from "@/lib/businessAnalyticsLessons";

export function generateStaticParams() {
  return businessAnalyticsLessons.map((lesson) => ({ id: lesson.id }));
}

export default async function BusinessAnalyticsPracticePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lesson = getBusinessAnalyticsLesson(id);
  if (!lesson) notFound();
  return (
    <BusinessAnalyticsPractice
      key={lesson.id}
      lesson={lesson}
      nextLesson={getNextBusinessAnalyticsLesson(id)}
    />
  );
}
