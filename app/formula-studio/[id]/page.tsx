"use client";

import {
  getLearnedFormulas,
  markFormulaLearned,
} from "@/lib/learnedFormulas";
import { useProgress } from "@/context/ProgressContext";
import Link from "next/link";
import { notFound } from "next/navigation";
import { use, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { formulas } from "@/lib/formulas";
import { registerStudyActivity } from "@/lib/studyActivity";
import { unlockAchievement } from "@/lib/unlockedAchievements";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default function FormulaDetails({
  params,
}: Props) {

  const { id } = use(params);
  const { addXP } = useProgress();
  const [learned, setLearned] = useState(() =>
    getLearnedFormulas().includes(id),
  );

  const formula =
    formulas.find(
      (item) => item.id === id
    );

  if (!formula) {
    notFound();
  }


  return (

    <AppLayout>

      <div className="max-w-5xl mx-auto space-y-8">


        <Link
          href="/formula-studio"
          className="
          inline-flex
          rounded-xl
          bg-white
          px-4
          py-2
          shadow
          font-semibold
          text-purple-700
          hover:bg-purple-50
          "
        >
          ← Back to Formula Library
        </Link>




        <div
          className="
          rounded-3xl
          bg-gradient-to-br
          from-purple-100
          to-pink-100
          p-8
          shadow-lg
          "
        >

          <h1
            className="
            text-5xl
            font-bold
            text-purple-700
            "
          >
            {formula.name}
          </h1>


          <p
            className="
            mt-3
            text-xl
            text-gray-800
            "
          >
            {formula.category}
          </p>


          <span
            className="
            inline-block
            mt-4
            rounded-full
            bg-purple-600
            px-4
            py-2
            text-white
            font-semibold
            "
          >
            {formula.difficulty}
          </span>

        </div>





        <div
          className="
          rounded-3xl
          bg-white
          p-8
          shadow-lg
          "
        >

          <h2
            className="
            text-3xl
            font-bold
            text-purple-700
            "
          >
            🎯 Purpose
          </h2>


          <p
            className="
            mt-4
            text-gray-800
            leading-8
            "
          >
            {formula.purpose}
          </p>


        </div>





        <div
          className="
          rounded-3xl
          bg-purple-50
          p-8
          shadow-lg
          "
        >

          <h2
            className="
            text-3xl
            font-bold
            text-purple-700
            "
          >
            📌 Syntax
          </h2>


          <div
            className="
            mt-5
            rounded-2xl
            bg-white
            p-5
            font-mono
            text-gray-900
            "
          >
            {formula.syntax}
          </div>

        </div>
                <div
          className="
          rounded-3xl
          bg-white
          p-8
          shadow-lg
          "
        >

          <h2
            className="
            text-3xl
            font-bold
            text-purple-700
            "
          >
            🧩 Arguments
          </h2>


          <ul className="mt-5 space-y-3">

            {formula.arguments.map(
              (argument,index)=>(
                <li
                  key={index}
                  className="
                  text-gray-800
                  "
                >
                  • {argument}
                </li>
              )
            )}

          </ul>


        </div>






        <div
          className="
          rounded-3xl
          bg-white
          p-8
          shadow-lg
          "
        >

          <h2
            className="
            text-3xl
            font-bold
            text-purple-700
            "
          >
            🪜 How To Use
          </h2>


          <div className="mt-5 space-y-4">

            {formula.howToUse.map(
              (step,index)=>(
                <p
                  key={index}
                  className="text-gray-800"
                >
                  {index + 1}. {step}
                </p>
              )
            )}

          </div>


        </div>







        <div
          className="
          rounded-3xl
          bg-green-50
          p-8
          shadow-lg
          "
        >

          <h2
            className="
            text-3xl
            font-bold
            text-green-700
            "
          >
            ✅ When To Use
          </h2>


          <ul className="mt-5 space-y-3">

            {formula.whenToUse.map(
              (item,index)=>(
                <li
                  key={index}
                  className="text-gray-800"
                >
                  ✔ {item}
                </li>
              )
            )}

          </ul>


        </div>







        <div
          className="
          rounded-3xl
          bg-red-50
          p-8
          shadow-lg
          "
        >

          <h2
            className="
            text-3xl
            font-bold
            text-red-600
            "
          >
            ⚠ Avoid When
          </h2>


          <p
            className="
            mt-4
            text-gray-800
            "
          >
            {formula.avoidWhen}
          </p>


        </div>
                <div
          className="
          rounded-3xl
          bg-blue-50
          p-8
          shadow-lg
          "
        >

          <h2
            className="
            text-3xl
            font-bold
            text-blue-700
            "
          >
            💼 Real Data Analyst Example
          </h2>


          <p
            className="
            mt-5
            text-gray-800
            leading-8
            "
          >
            {formula.example}
          </p>


        </div>







        <div
          className="
          rounded-3xl
          bg-pink-100
          p-8
          shadow-lg
          "
        >

          <h2
            className="
            text-3xl
            font-bold
            text-pink-700
            "
          >
            🧠 Memory Trick
          </h2>


          <p
            className="
            mt-5
            text-gray-900
            text-lg
            "
          >
            {formula.memory}
          </p>


        </div>







        <div
          className="
          rounded-3xl
          bg-white
          p-8
          shadow-lg
          "
        >

          <h2
            className="
            text-3xl
            font-bold
            text-purple-700
            "
          >
            🎤 Interview Questions
          </h2>


          <ul className="mt-5 space-y-3">

            {formula.interviewQuestions.map(
              (question,index)=>(
                <li
                  key={index}
                  className="text-gray-800"
                >
                  💬 {question}
                </li>
              )
            )}

          </ul>


        </div>







        <div
          className="
          rounded-3xl
          bg-yellow-50
          p-8
          shadow-lg
          "
        >

          <h2
            className="
            text-3xl
            font-bold
            text-yellow-700
            "
          >
            📝 Flashcard
          </h2>


          <div className="mt-6 grid gap-6 md:grid-cols-2">


            <div
              className="
              rounded-2xl
              bg-white
              p-6
              shadow
              "
            >

              <p className="text-sm font-semibold text-gray-500">
                FRONT
              </p>

              <p className="mt-4 text-xl text-gray-900">
                {formula.flashcard.front}
              </p>

            </div>



            <div
              className="
              rounded-2xl
              bg-white
              p-6
              shadow
              "
            >

              <p className="text-sm font-semibold text-gray-500">
                BACK
              </p>

              <p className="mt-4 text-xl text-gray-900">
                {formula.flashcard.back}
              </p>

            </div>


          </div>


        </div>
                <div
          className="
          rounded-3xl
          bg-gradient-to-br
          from-green-100
          to-emerald-100
          p-8
          shadow-lg
          "
        >

          <h2
            className="
            text-3xl
            font-bold
            text-green-700
            "
          >
            🎯 Complete Learning
          </h2>


          <p className="mt-4 text-gray-800">
            Finish learning this formula and add it to your progress.
          </p>


          <div className="mt-6 flex flex-wrap gap-4">

           <button
 onClick={() => {

  if (!getLearnedFormulas().includes(formula.id)) {

    markFormulaLearned(formula.id);

    addXP(20);

    registerStudyActivity({
      kind: "lesson",
      source: `formula:${formula.id}`,
      minutes: 10,
      xp: 20,
    });

    unlockAchievement("first_formula");

    setLearned(true);

  }

}}
  className="
  rounded-2xl
  bg-green-600
  px-6
  py-3
  font-semibold
  text-white
  hover:bg-green-700
  "
>
  {learned
    ? "✅ Learned +20 XP"
    : "✅ Mark Learned (+20 XP)"}
</button>


            <Link
              href={`/formula-studio/${formula.id}/practice`}
              className="
              rounded-2xl
              bg-pink-500
              px-6
              py-3
              font-semibold
              text-white
              hover:bg-pink-600
              "
            >
              📝 Practice Again
            </Link>


          </div>


        </div>



      </div>

    </AppLayout>

  );

}
