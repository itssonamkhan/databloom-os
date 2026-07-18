import { notFound } from "next/navigation";

import CheckpointExamEngine from "@/components/assessments/CheckpointExamEngine";
import {
  getCheckpointQuestions,
  getStudioCheckpoint,
} from "@/lib/checkpointExams";
import { studioAssessmentConfigurations } from "@/lib/studioAssessments";

export function generateStaticParams() {
  return studioAssessmentConfigurations.flatMap((studio) =>
    studio.checkpoints.map((checkpoint) => ({
      studioId: studio.studioId,
      checkpointId: checkpoint.id,
    })),
  );
}

export default async function CheckpointPage({
  params,
}: {
  params: Promise<{ studioId: string; checkpointId: string }>;
}) {
  const { studioId, checkpointId } = await params;
  const assessment = getStudioCheckpoint(studioId, checkpointId);
  if (!assessment) notFound();

  const questions = getCheckpointQuestions(
    assessment.studio.studioId,
    assessment.checkpoint,
  );

  return (
    <CheckpointExamEngine
      studio={assessment.studio}
      checkpoint={assessment.checkpoint}
      questions={questions}
    />
  );
}
