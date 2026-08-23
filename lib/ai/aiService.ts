import { askMochi, type MochiAnswer } from "@/lib/mochiBrain";

export type MochiAiResponse = {
  message: string;
  kind: "explanation" | "hint" | "example" | "correction" | "question" | "guidance";
  nextStep?: string;
};

/**
 * Local Mochi adapter for Phase 1. A future provider can replace this seam
 * without coupling the chat UI to provider credentials or transport details.
 */
export function askMochiStudent(question: string): MochiAiResponse {
  const answer: MochiAnswer = askMochi(question);
  if (answer.topic === "general") {
    return {
      kind: "guidance",
      message:
        "Mochi's advanced AI brain is not connected yet, but I'm still learning! Try asking about Excel formulas, SQL basics, Python, dashboards, or data cleaning.",
      nextStep: "Choose one supported topic and ask for a tiny explanation or example.",
    };
  }

  return {
    kind: "explanation",
    message: answer.answer,
    nextStep: `${answer.memory} Example: ${answer.example}`,
  };
}
