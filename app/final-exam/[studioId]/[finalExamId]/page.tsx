import { notFound } from "next/navigation";

import CheckpointExamEngine from "@/components/assessments/CheckpointExamEngine";
import {
  getFinalSkillExamQuestions,
  getStudioFinalSkillExam,
} from "@/lib/checkpointExams";
import { studioAssessmentConfigurations } from "@/lib/studioAssessments";

export function generateStaticParams() {
  return studioAssessmentConfigurations.map((studio) => ({
    studioId: studio.studioId,
    finalExamId: studio.finalExam.id,
  }));
}

export default async function FinalSkillExamPage({
  params,
}: {
  params: Promise<{ studioId: string; finalExamId: string }>;
}) {
  const { studioId, finalExamId } = await params;
  const assessment = getStudioFinalSkillExam(studioId, finalExamId);
  if (!assessment) notFound();

  const questions = getFinalSkillExamQuestions(
    assessment.studio.studioId,
    assessment.finalExam,
  );

  return (
    <CheckpointExamEngine
      kind="final"
      studio={assessment.studio}
      assessment={assessment.finalExam}
      questions={questions}
    />
  );
}
