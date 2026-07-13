"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { useState, use } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { formulas } from "@/lib/formulas";
console.log("Practice route loaded");

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default function PracticePage({ params }: Props) {

  const { id } = use(params);

  const formula =
    formulas.find((item) => item.id === id);
  const [showAnswer, setShowAnswer] =
    useState(false);

  if (!formula) {
    notFound();
  }

  return (

    <AppLayout>

      <div className="max-w-5xl mx-auto space-y-8">

        <Link
          href={`/formula-studio/${formula.id}`}
          className="
          inline-flex
          rounded-xl
          bg-white
          px-4
          py-2
          shadow
          font-semibold
          text-purple-700
          "
        >
          ← Back to Lesson
        </Link>

        <div
          className="
          rounded-3xl
          bg-gradient-to-br
          from-pink-100
          to-purple-100
          p-8
          shadow-lg
          "
        >

          <h1 className="text-5xl font-bold text-purple-700">
            📝 Practice
          </h1>

          <p className="mt-3 text-xl text-gray-800">
            {formula.name}
          </p>

        </div>

        <div className="rounded-3xl bg-white p-8 shadow-lg">

          <h2 className="text-3xl font-bold text-purple-700">
            Scenario
          </h2>

          <p className="mt-5 text-gray-800 leading-8">
            Imagine you are working as a Data Analyst.
            Which situation below is the best place to use
            <strong> {formula.name}</strong>?
          </p>

          <div className="mt-8 rounded-2xl bg-purple-50 p-6">

            <p className="font-semibold text-purple-700">
              Example Scenario
            </p>

            <p className="mt-3 text-gray-900">
              {formula.example}
            </p>

          </div>

        </div>

        <div className="rounded-3xl bg-yellow-50 p-8 shadow-lg">

          <h2 className="text-3xl font-bold text-yellow-700">
            💡 Hint
          </h2>

          <p className="mt-5 text-gray-900">
            Think about the main purpose of this formula before
            revealing the answer.
          </p>

        </div>

        <button
          onClick={() => setShowAnswer(!showAnswer)}
          className="
          rounded-2xl
          bg-purple-600
          px-6
          py-3
          font-semibold
          text-white
          hover:bg-purple-700
          "
        >
          {showAnswer ? "Hide Answer" : "Show Answer"}
        </button>

        {showAnswer && (

          <div className="rounded-3xl bg-green-100 p-8 shadow-lg">

            <h2 className="text-3xl font-bold text-green-700">
              ✅ Answer
            </h2>

            <p className="mt-5 text-gray-900">
              {formula.purpose}
            </p>

            <div className="mt-6 rounded-2xl bg-white p-5">

              <p className="font-semibold text-purple-700">
                Formula
              </p>

              <p className="mt-2 font-mono text-gray-900">
                {formula.syntax}
              </p>

            </div>

          </div>

        )}

      </div>

    </AppLayout>

  );

}