"use client";

import { getLearnedFormulas } from "@/lib/learnedFormulas";
import Link from "next/link";
import {
  getFavorites,
  toggleFavorite,
} from "@/lib/favorites";
import { useEffect, useMemo, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import StudioCheckpointCards from "@/components/assessments/StudioCheckpointCards";
import StudioFilterToolbar from "@/components/studio/StudioFilterToolbar";
import { formulas } from "@/lib/formulas";

const categories = [
  ...Array.from(
    new Set(
      formulas.map((formula) => formula.category)
    )
  ),
];
const difficulties = Array.from(
  new Set(formulas.map((formula) => formula.difficulty)),
);

export default function FormulaStudio() {
  const [search, setSearch] = useState("");

const [selectedCategory, setSelectedCategory] =
  useState("All");

const [selectedDifficulty, setSelectedDifficulty] =
  useState("All");

const [favorites, setFavorites] =
  useState<string[]>([]);

const [learnedFormulas, setLearnedFormulas] =
  useState<string[]>([]);


useEffect(() => {

  setFavorites(
    getFavorites()
  );

  setLearnedFormulas(
    getLearnedFormulas()
  );

}, []);
  const filteredFormulas = useMemo(() => {
    return formulas.filter((formula) => {
      const matchesSearch =
        formula.name.toLowerCase().includes(search.toLowerCase()) ||
        formula.category.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
  selectedCategory === "All" ||
  formula.category === selectedCategory;

      const matchesDifficulty =
        selectedDifficulty === "All" ||
        formula.difficulty === selectedDifficulty;

      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [search, selectedCategory, selectedDifficulty]);

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="rounded-3xl bg-gradient-to-br from-purple-100 to-pink-100 p-8 shadow-lg">
          <h1 className="text-5xl font-bold text-purple-700">
            📚 Excel Formula Library
          </h1>

          <p className="mt-3 text-xl text-gray-800">
            Learn Excel formulas in a simple and memorable way 🌸
          </p>

          <p className="mt-3 font-semibold text-gray-800">
            Total formulas : {formulas.length}
          </p>
        </div>

        <StudioFilterToolbar
          query={search}
          onQueryChange={setSearch}
          category={selectedCategory}
          onCategoryChange={setSelectedCategory}
          categories={categories}
          difficulty={selectedDifficulty}
          onDifficultyChange={setSelectedDifficulty}
          difficulties={difficulties}
          resultCount={filteredFormulas.length}
          searchPlaceholder="Search formulas or categories"
        />

        <StudioCheckpointCards studioId="formula-studio" />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredFormulas.map((formula) => (
            <div
              key={formula.id}
              className="rounded-3xl bg-white p-6 shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-purple-700">
                  {formula.name}
                </h2>
                {learnedFormulas.includes(formula.id) && (
  <span
    className="
    mt-2
    inline-block
    rounded-full
    bg-green-100
    px-3
    py-1
    text-sm
    font-semibold
    text-green-700
    "
  >
    ✅ Learned
  </span>
)}

                <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
                  {formula.difficulty}
                </span>
              </div>

              <p className="mt-3 inline-block rounded-full bg-pink-100 px-3 py-1 text-sm font-semibold text-pink-700">
                {formula.category}
              </p>

              <div className="mt-5 rounded-2xl bg-purple-50 p-4">
                <p className="font-semibold text-purple-700">Syntax</p>

                <p className="mt-2 break-words font-mono text-gray-900">
                  {formula.syntax}
                </p>
              </div>

              <div className="mt-5">
                <p className="font-semibold text-gray-900">Purpose</p>

                <p className="mt-2 text-gray-800">
                  {formula.purpose}
                </p>
              </div>

              <div className="mt-5">
                <p className="font-semibold text-gray-900">Example</p>

                <p className="mt-2 text-gray-800">
                  {formula.example}
                </p>
              </div>

              <div className="mt-5 rounded-2xl bg-pink-100 p-4">
                <p className="font-semibold text-pink-700">
                  🧠 Memory Trick
                </p>

                <p className="mt-2 text-gray-900">
                  {formula.memory}
                </p>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3">
  <Link
    href={`/formula-studio/${formula.id}`}
    className="rounded-xl bg-purple-600 py-2 text-center font-semibold text-white hover:bg-purple-700"
  >
    📖 Learn
  </Link>

  <Link
  href={`/formula-studio/${formula.id}/practice`}
  className="
  rounded-xl
  bg-pink-500
  py-2
  text-center
  font-semibold
  text-white
  hover:bg-pink-600
  "
>
  📝 Practice
</Link>

  <button
  onClick={() => {
    const updated = toggleFavorite(formula.id);
    setFavorites(updated);
  }}
  className="rounded-xl bg-blue-500 py-2 font-semibold text-white hover:bg-blue-600"
>
  {favorites.includes(formula.id)
    ? "💙 Saved"
    : "⭐ Favorite"}
</button>
</div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
