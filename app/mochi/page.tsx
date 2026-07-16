"use client";

import { useState } from "react";

import AppLayout from "@/components/layout/AppLayout";
import MochiAssistantCard from "@/components/mochi/MochiAssistantCard";
import MochiMascot from "@/components/mochi/MochiMascot";
import {
  addMochiHeart,
  getMochiLevelName,
  loadMochiData,
} from "@/lib/mochi";
import { askMochi, type MochiAnswer } from "@/lib/mochiBrain";
import { playClickSound } from "@/lib/sounds";
import { unlockAchievement } from "@/lib/unlockedAchievements";

export default function MochiPage() {
  const [mochi, setMochi] = useState(() => loadMochiData());
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<MochiAnswer | null>(null);

  function handleAsk() {
    if (!question.trim()) return;

    playClickSound();
    setAnswer(askMochi(question));
    const nextMochi = addMochiHeart(1);
    setMochi(nextMochi);
    if (nextMochi.interactions >= 1) unlockAchievement("mochi_friend");
    setQuestion("");
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <header className="rounded-3xl bg-gradient-to-br from-pink-100 to-purple-100 p-8 shadow-lg">
          <div className="flex flex-col items-center text-center">
            <MochiMascot />
            <h1 className="mt-3 text-4xl font-bold text-purple-700">Mochi AI</h1>
            <p className="mt-2 text-gray-600">
              Your cozy Excel &amp; Data Analytics teacher 🌸
            </p>
          </div>
        </header>

        <div className="grid gap-5 md:grid-cols-3">
          <InfoCard title="❤️ Hearts" value={mochi.hearts} />
          <InfoCard title="🌸 Level" value={getMochiLevelName(mochi.level)} />
          <InfoCard title="💬 Chats" value={mochi.interactions} />
        </div>

        <MochiAssistantCard />

        <section className="rounded-3xl bg-white/70 p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-purple-700">Ask Mochi 🐰</h2>
          <textarea
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            onKeyDown={(event) => {
              if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
                handleAsk();
              }
            }}
            placeholder="Example: Explain XLOOKUP"
            className="mt-5 w-full rounded-2xl border border-purple-200 bg-white p-4 text-gray-800 placeholder:text-gray-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-500"
            rows={4}
          />
          <button
            type="button"
            onClick={handleAsk}
            className="mt-4 rounded-2xl bg-purple-600 px-6 py-3 font-bold text-white transition-colors hover:bg-purple-700"
          >
            🐰 Ask Mochi
          </button>
        </section>

        {answer && (
          <section className="space-y-4 rounded-3xl bg-white/70 p-6 shadow-lg" aria-live="polite">
            <h2 className="text-xl font-bold text-purple-700">🌸 Mochi says:</h2>
            <p className="font-medium text-gray-800">{answer.answer}</p>

            <div className="rounded-2xl bg-pink-100 p-4">
              <strong>🧠 Remember:</strong>
              <p className="mt-1 text-gray-800">{answer.memory}</p>
            </div>

            <div className="rounded-2xl bg-blue-100 p-4">
              <strong>📊 Example:</strong>
              <p className="mt-1 text-gray-800">{answer.example}</p>
            </div>
          </section>
        )}
      </div>
    </AppLayout>
  );
}

function InfoCard({
  title,
  value,
}: {
  title: string;
  value: string | number;
}) {
  return (
    <div className="rounded-3xl bg-white/70 p-5 shadow">
      <p className="text-gray-600">{title}</p>
      <h3 className="mt-2 text-xl font-bold text-purple-700">{value}</h3>
    </div>
  );
}
