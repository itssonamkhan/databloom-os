"use client";

import { useCallback, useState } from "react";

import { askMochiStudent, type MochiAiResponse } from "@/lib/ai/aiService";

export type MochiChatAnswer = MochiAiResponse;

export function useMochiChat() {
  const [answer, setAnswer] = useState<MochiChatAnswer | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const ask = useCallback(async (message: string) => {
    setLoading(true);
    setError(null);

    try {
      setAnswer(askMochiStudent(message));
      return true;
    } catch {
      setError("Mochi could not answer right now. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return { answer, error, loading, ask };
}
