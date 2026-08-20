"use client";

import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { formulas } from "@/lib/formulas";
import {
  formulaPracticeQuestions,
  formulaPracticeSessionKey,
  emitFormulaPracticeAnalyticsEvent,
  getFormulaPracticeAssessmentAlignment,
  getFormulaWorkedExample,
  getProgressiveFormulaPracticeQuestions,
  validateFormulaPracticeAnswer,
} from "@/lib/formulaPracticeQuestions";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default function PracticePage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();
  const formula = formulas.find((item) => item.id === id);
  const [answer, setAnswer] = useState("");
  const [checked, setChecked] = useState(false);
  const [showWorkedExample, setShowWorkedExample] = useState(false);
  const [completedQuestionIds, setCompletedQuestionIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(formulaPracticeSessionKey);
      const parsed: unknown = stored ? JSON.parse(stored) : [];
      if (Array.isArray(parsed)) {
        const validIds = parsed.filter((value): value is string => typeof value === "string");
        const timer = window.setTimeout(() => setCompletedQuestionIds(new Set(validIds)), 0);
        return () => window.clearTimeout(timer);
      }
    } catch {
      // A session-only convenience must never prevent practice from opening.
    }
  }, []);

  useEffect(() => {
    const question = formulaPracticeQuestions.find((item) => item.formulaId === id);
    if (!question) return;
    emitFormulaPracticeAnalyticsEvent({
      action: "practice-started",
      formulaId: id,
      difficulty: question.difficulty,
      questionType: question.type,
    });
  }, [id]);

  if (!formula) {
    notFound();
  }

  const questionsForFormula = formulaPracticeQuestions.filter((item) => item.formulaId === id);
  if (questionsForFormula.length === 0) {
    notFound();
  }

  const progressiveQuestions = getProgressiveFormulaPracticeQuestions(completedQuestionIds);
  const currentQuestion = questionsForFormula[0];
  const currentPosition = progressiveQuestions.findIndex((item) => item.formulaId === id);
  const currentIsUnlocked = currentPosition >= 0;
  const isCorrect = checked && validateFormulaPracticeAnswer(currentQuestion, answer);
  const isSelectionQuestion = [
    "multiple-choice",
    "scenario-selection",
    "formula-comparison",
  ].includes(currentQuestion.type);
  const workedExample = getFormulaWorkedExample(formula.id);
  const assessmentAlignment = getFormulaPracticeAssessmentAlignment(formula.id);
  const nextQuestion = currentPosition >= 0 ? progressiveQuestions[currentPosition + 1] : undefined;
  const previousQuestion = currentPosition > 0 ? progressiveQuestions[currentPosition - 1] : undefined;
  const beginnerCompleted = progressiveQuestions.filter(
    (item) => item.difficulty === "beginner" && completedQuestionIds.has(item.id),
  ).length;
  const intermediateCompleted = progressiveQuestions.filter(
    (item) => item.difficulty === "intermediate" && completedQuestionIds.has(item.id),
  ).length;

  const persistCompleted = (next: Set<string>) => {
    setCompletedQuestionIds(next);
    try {
      sessionStorage.setItem(formulaPracticeSessionKey, JSON.stringify([...next]));
    } catch {
      // Session storage is optional; React state remains the source for this visit.
    }
  };

  const checkAnswer = () => {
    if (!answer.trim() || !currentIsUnlocked) return;
    const correct = validateFormulaPracticeAnswer(currentQuestion, answer);
    emitFormulaPracticeAnalyticsEvent({
      action: "exercise-attempted",
      formulaId: formula.id,
      difficulty: currentQuestion.difficulty,
      questionType: currentQuestion.type,
    });
    emitFormulaPracticeAnalyticsEvent({
      action: "answer-result",
      formulaId: formula.id,
      difficulty: currentQuestion.difficulty,
      questionType: currentQuestion.type,
      result: correct ? "correct" : "incorrect",
    });
    setChecked(true);
    if (correct) {
      const next = new Set(completedQuestionIds);
      const newlyCompleted = !completedQuestionIds.has(currentQuestion.id);
      next.add(currentQuestion.id);
      persistCompleted(next);
      if (newlyCompleted) {
        emitFormulaPracticeAnalyticsEvent({
          action: "practice-completed",
          formulaId: formula.id,
          difficulty: currentQuestion.difficulty,
          questionType: currentQuestion.type,
        });
      }
    }
  };

  const resetQuestion = () => {
    setAnswer("");
    setChecked(false);
    setShowWorkedExample(false);
  };

  const moveToQuestion = (questionId: string | undefined) => {
    if (questionId) {
      router.push(`/formula-studio/${questionId}/practice`);
    }
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-5xl space-y-6">
        <Link
          href={`/formula-studio/${formula.id}`}
          className="inline-flex min-h-11 items-center rounded-xl bg-white px-4 py-2 font-semibold text-purple-700 shadow transition hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-400"
        >
          ← Back to Lesson
        </Link>

        <header className="rounded-3xl bg-gradient-to-br from-pink-100 to-purple-100 p-6 shadow-lg sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-purple-700">
            Formula Studio · {currentIsUnlocked ? `Exercise ${currentPosition + 1} of ${progressiveQuestions.length}` : "Guided practice"}
          </p>
          <h1 className="mt-2 text-3xl font-bold text-purple-700 sm:text-5xl">📝 Practice</h1>
          <p className="mt-3 text-xl text-gray-800">{formula.name}</p>
          <p className="mt-2 break-words text-sm text-gray-700">{formula.purpose}</p>
          {assessmentAlignment && (
            <p className="mt-4 inline-flex max-w-full rounded-full bg-white/70 px-3 py-1 text-sm font-semibold text-purple-800">
              {assessmentAlignment.label}
            </p>
          )}
          <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold text-purple-800">
            <span className="rounded-full bg-white/70 px-3 py-1">Beginner: {beginnerCompleted} completed</span>
            <span className="rounded-full bg-white/70 px-3 py-1">Intermediate: {intermediateCompleted} completed</span>
            <span className="rounded-full bg-white/70 px-3 py-1">Advanced unlocks after 3 intermediate answers</span>
          </div>
        </header>

        {!currentIsUnlocked ? (
          <section className="rounded-3xl border border-purple-100 bg-white p-6 shadow-lg sm:p-8" aria-labelledby="locked-practice">
            <h2 id="locked-practice" className="text-2xl font-bold text-purple-700">Build your practice path first</h2>
            <p className="mt-3 leading-7 text-gray-800">
              This {currentQuestion.difficulty ?? "next"} exercise becomes available as you work through the earlier practice steps.
              Start with an available beginner exercise and return here after the guided unlock requirement is met.
            </p>
            <button
              type="button"
              onClick={() => moveToQuestion(progressiveQuestions[0]?.formulaId)}
              className="mt-5 min-h-11 rounded-2xl bg-purple-600 px-5 py-3 font-semibold text-white shadow transition hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400"
            >
              Start available practice
            </button>
          </section>
        ) : (
          <>
            <section className="rounded-3xl bg-white p-6 shadow-lg sm:p-8" aria-labelledby="practice-prompt">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 id="practice-prompt" className="text-2xl font-bold text-purple-700 sm:text-3xl">
                  {isSelectionQuestion ? "Choose the best answer" : "Write your answer"}
                </h2>
                <span className="rounded-full bg-purple-50 px-3 py-1 text-sm font-semibold text-purple-700">
                  {currentQuestion.difficulty ?? "practice"}
                </span>
              </div>
              <p className="mt-5 break-words leading-8 text-gray-800">{currentQuestion.prompt}</p>

              {isSelectionQuestion && currentQuestion.options ? (
                <fieldset className="mt-6 space-y-3">
                  <legend className="sr-only">Answer options</legend>
                  {currentQuestion.options.map((option) => (
                    <label
                      key={option}
                      className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 transition focus-within:ring-2 focus-within:ring-purple-400 ${
                        answer === option
                          ? "border-purple-300 bg-purple-50 text-purple-900"
                          : "border-purple-100 bg-white text-gray-800 hover:bg-purple-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`answer-${currentQuestion.id}`}
                        value={option}
                        checked={answer === option}
                        onChange={(event) => {
                          setAnswer(event.target.value);
                          setChecked(false);
                        }}
                        className="h-4 w-4 accent-purple-600"
                      />
                      <span className="break-words font-mono text-sm sm:text-base">{option}</span>
                    </label>
                  ))}
                </fieldset>
              ) : (
                <div className="mt-6">
                  <label htmlFor="formula-answer" className="text-sm font-semibold text-gray-800">Your formula or value</label>
                  <input
                    id="formula-answer"
                    value={answer}
                    onChange={(event) => {
                      setAnswer(event.target.value);
                      setChecked(false);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") checkAnswer();
                    }}
                    placeholder="Type your answer"
                    className="mt-2 min-h-11 w-full rounded-2xl border border-purple-100 bg-purple-50/50 px-4 py-3 font-mono text-gray-900 outline-none transition placeholder:text-gray-500 focus:border-purple-400 focus:ring-2 focus:ring-purple-300"
                  />
                </div>
              )}

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={checkAnswer}
                  disabled={!answer.trim()}
                  className="min-h-11 rounded-2xl bg-purple-600 px-5 py-3 font-semibold text-white shadow transition hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Check Answer
                </button>
                {checked && (
                  <button
                    type="button"
                    onClick={resetQuestion}
                    className="min-h-11 rounded-2xl border border-purple-200 bg-white px-5 py-3 font-semibold text-purple-700 transition hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  >
                    Retry
                  </button>
                )}
              </div>

              {checked && (
                <div role="status" className={`mt-6 rounded-2xl border p-5 ${isCorrect ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-rose-200 bg-rose-50 text-rose-900"}`}>
                  <p className="font-bold">{isCorrect ? "✅ Correct" : "Not quite yet"}</p>
                  <p className="mt-2 break-words">{currentQuestion.explanation}</p>
                  {!isCorrect && currentQuestion.acceptedAnswers && <p className="mt-3 break-words text-sm font-medium">Retry with the expected formula or value.</p>}
                </div>
              )}
            </section>

            {workedExample && (
              <section className="rounded-3xl border border-amber-100 bg-amber-50 p-6 shadow-lg sm:p-8" aria-labelledby="worked-example">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 id="worked-example" className="text-2xl font-bold text-amber-800">📚 Worked example</h2>
                  <button
                    type="button"
                    onClick={() => {
                      setShowWorkedExample((visible) => {
                        const nextVisible = !visible;
                        if (nextVisible) {
                          emitFormulaPracticeAnalyticsEvent({
                            action: "worked-example-viewed",
                            formulaId: formula.id,
                            difficulty: currentQuestion.difficulty,
                            questionType: currentQuestion.type,
                          });
                        }
                        return nextVisible;
                      });
                    }}
                    className="min-h-11 rounded-2xl border border-amber-200 bg-white px-4 py-2 font-semibold text-amber-800 transition hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    aria-expanded={showWorkedExample}
                  >
                    {showWorkedExample ? "Hide worked example" : "Show worked example"}
                  </button>
                </div>
                {showWorkedExample && (
                  <div className="mt-5 space-y-4 text-gray-900">
                    <div><p className="font-semibold text-amber-800">Problem</p><p className="mt-1 break-words">{workedExample.problem}</p></div>
                    <div><p className="font-semibold text-amber-800">Relevant concept</p><p className="mt-1 break-words">{workedExample.concept}</p></div>
                    <div><p className="font-semibold text-amber-800">Step-by-step reasoning</p><ol className="mt-1 list-decimal space-y-1 pl-5">{workedExample.steps.map((step) => <li key={step} className="break-words">{step}</li>)}</ol></div>
                    <div><p className="font-semibold text-amber-800">Final answer</p><p className="mt-1 break-words font-mono">{workedExample.finalAnswer}</p></div>
                    <div><p className="font-semibold text-amber-800">Why it works</p><p className="mt-1 break-words">{workedExample.why}.</p></div>
                  </div>
                )}
              </section>
            )}

            <section className="rounded-3xl bg-purple-50 p-6 shadow-lg sm:p-8">
              <h2 className="text-xl font-bold text-purple-700">Formula context</h2>
              <p className="mt-3 break-words text-gray-800">{formula.example}</p>
              <p className="mt-3 break-words font-mono text-sm text-gray-900">{formula.syntax}</p>
            </section>

            <nav className="flex flex-wrap justify-between gap-3" aria-label="Practice exercises">
              <button
                type="button"
                onClick={() => moveToQuestion(previousQuestion?.formulaId)}
                disabled={!previousQuestion}
                className="min-h-11 rounded-2xl border border-purple-200 bg-white px-5 py-3 font-semibold text-purple-700 transition hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                ← Previous
              </button>
              <button
                type="button"
                onClick={() => moveToQuestion(nextQuestion?.formulaId)}
                disabled={!nextQuestion}
                className="min-h-11 rounded-2xl bg-purple-600 px-5 py-3 font-semibold text-white shadow transition hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next Exercise →
              </button>
            </nav>
          </>
        )}
      </div>
    </AppLayout>
  );
}
