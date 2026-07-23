"use client";

import {
  Bookmark,
  Check,
  CheckCircle2,
  Heart,
  Keyboard,
  Lightbulb,
  RotateCcw,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import StudioFilterToolbar from "@/components/studio/StudioFilterToolbar";
import {
  excelProToolkitItems,
  excelShortcutGroups,
  excelToolkitCategories,
  excelToolkitDifficulties,
  getExcelToolkitSearchValues,
  type AnalystSecret,
  type ExcelShortcut,
  type ExcelTrick,
  type ExcelToolkitCategory,
  type ExcelToolkitItem,
  type FormulaAlternative,
  type ProductivityTip,
} from "@/lib/excelProToolkitData";
import {
  EXCEL_PRO_TOOLKIT_EVENT,
  loadExcelProToolkitProgress,
  toggleExcelToolkitFavorite,
  toggleExcelToolkitLearned,
  type ExcelProToolkitProgress,
} from "@/lib/excelProToolkitProgress";
import {
  playClickSound,
  playNotificationSound,
  playSuccessSound,
} from "@/lib/sounds";

const emptyProgress: ExcelProToolkitProgress = {
  version: 1,
  favoriteIds: [],
  learnedIds: [],
};

export default function ExcelProToolkit() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [difficulty, setDifficulty] = useState("All");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [learnedOnly, setLearnedOnly] = useState(false);
  const [progress, setProgress] =
    useState<ExcelProToolkitProgress>(emptyProgress);

  useEffect(() => {
    const syncProgress = () => setProgress(loadExcelProToolkitProgress());
    const frame = window.requestAnimationFrame(syncProgress);
    window.addEventListener(EXCEL_PRO_TOOLKIT_EVENT, syncProgress);
    window.addEventListener("storage", syncProgress);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener(EXCEL_PRO_TOOLKIT_EVENT, syncProgress);
      window.removeEventListener("storage", syncProgress);
    };
  }, []);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return excelProToolkitItems.filter((item) => {
      const matchesSearch =
        !normalizedQuery ||
        getExcelToolkitSearchValues(item).some((value) =>
          value.toLocaleLowerCase().includes(normalizedQuery),
        );
      return (
        matchesSearch &&
        (category === "All" || item.category === category) &&
        (difficulty === "All" || item.difficulty === difficulty) &&
        (!favoritesOnly || progress.favoriteIds.includes(item.id)) &&
        (!learnedOnly || progress.learnedIds.includes(item.id))
      );
    });
  }, [
    category,
    difficulty,
    favoritesOnly,
    learnedOnly,
    progress.favoriteIds,
    progress.learnedIds,
    query,
  ]);

  const visibleCategories = excelToolkitCategories.filter((itemCategory) =>
    filteredItems.some((item) => item.category === itemCategory),
  );

  function handleFavorite(id: string) {
    const wasFavorite = progress.favoriteIds.includes(id);
    const next = toggleExcelToolkitFavorite(id);
    setProgress(next);
    playClickSound();
    if (!wasFavorite && next.favoriteIds.includes(id)) {
      playNotificationSound();
    }
  }

  function handleLearned(id: string) {
    const wasLearned = progress.learnedIds.includes(id);
    const next = toggleExcelToolkitLearned(id);
    setProgress(next);
    playClickSound();
    if (!wasLearned && next.learnedIds.includes(id)) {
      playSuccessSound();
    }
  }

  function clearFilters() {
    playClickSound();
    setQuery("");
    setCategory("All");
    setDifficulty("All");
    setFavoritesOnly(false);
    setLearnedOnly(false);
  }

  return (
    <section aria-labelledby="excel-pro-toolkit-heading" className="space-y-7">
      <header
        data-databloom-glass
        className="rounded-3xl border p-6 shadow-lg sm:p-8"
      >
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.16em] text-[var(--databloom-text-accent)]">
              <WandSparkles size={18} aria-hidden="true" />
              Practical Excel fluency
            </p>
            <h2
              id="excel-pro-toolkit-heading"
              className="mt-2 text-3xl font-black text-[var(--databloom-text-heading)] sm:text-4xl"
            >
              🧰 Excel Pro Toolkit
            </h2>
            <p className="mt-3 leading-7 text-[var(--databloom-text-secondary)]">
              Build faster, cleaner, and more maintainable workbooks with
              shortcuts, practical techniques, balanced formula comparisons,
              and analyst habits.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Summary value={progress.favoriteIds.length} label="Favorites" />
            <Summary value={progress.learnedIds.length} label="Learned" />
          </div>
        </div>
      </header>

      <StudioFilterToolbar
        query={query}
        onQueryChange={setQuery}
        category={category}
        onCategoryChange={setCategory}
        categories={excelToolkitCategories}
        difficulty={difficulty}
        onDifficultyChange={setDifficulty}
        difficulties={excelToolkitDifficulties}
        resultCount={filteredItems.length}
        searchPlaceholder="Search shortcuts, tricks, formulas, or habits"
        heading="Find an Excel technique"
        actions={
          <div className="grid w-full grid-cols-2 gap-2">
            <StateFilter
              active={favoritesOnly}
              label="Favorites"
              icon={<Heart size={17} fill={favoritesOnly ? "currentColor" : "none"} />}
              onClick={() => {
                playClickSound();
                setFavoritesOnly((current) => !current);
              }}
            />
            <StateFilter
              active={learnedOnly}
              label="Learned"
              icon={<CheckCircle2 size={17} />}
              onClick={() => {
                playClickSound();
                setLearnedOnly((current) => !current);
              }}
            />
          </div>
        }
      />

      {filteredItems.length ? (
        <div className="space-y-10">
          {visibleCategories.map((itemCategory) => (
            <ToolkitCategorySection
              key={itemCategory}
              category={itemCategory}
              items={filteredItems.filter(
                (item) => item.category === itemCategory,
              )}
              favoriteIds={progress.favoriteIds}
              learnedIds={progress.learnedIds}
              onFavorite={handleFavorite}
              onLearned={handleLearned}
            />
          ))}
        </div>
      ) : (
        <div
          data-databloom-glass
          className="rounded-3xl border border-dashed p-10 text-center shadow-sm"
        >
          <Sparkles
            className="mx-auto text-[var(--databloom-text-accent)]"
            size={30}
          />
          <h3 className="mt-3 text-xl font-black text-[var(--databloom-text-heading)]">
            No toolkit items match those filters.
          </h3>
          <p className="mt-2 text-[var(--databloom-text-secondary)]">
            Clear the filters to browse all practical Excel resources.
          </p>
          <button
            type="button"
            onClick={clearFilters}
            className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-2xl bg-[var(--databloom-action)] px-5 font-black text-[var(--databloom-text-on-accent)] shadow-sm"
          >
            <RotateCcw size={17} />
            Clear filters
          </button>
        </div>
      )}
    </section>
  );
}

function Summary({ value, label }: { value: number; label: string }) {
  return (
    <div className="min-w-28 rounded-2xl border border-[var(--databloom-border)] bg-[var(--databloom-card)] px-5 py-4 text-center shadow-sm">
      <p className="text-2xl font-black text-[var(--databloom-text-heading)]">
        {value}
      </p>
      <p className="mt-1 text-xs font-bold text-[var(--databloom-text-secondary)]">
        {label}
      </p>
    </div>
  );
}

function StateFilter({
  active,
  label,
  icon,
  onClick,
}: {
  active: boolean;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border px-3 text-sm font-black shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--databloom-focus)] ${
        active
          ? "border-[var(--databloom-border)] bg-[var(--databloom-accent-soft)] text-[var(--databloom-text-heading)]"
          : "border-[var(--databloom-border)] bg-[var(--databloom-card)] text-[var(--databloom-text-secondary)]"
      }`}
    >
      {icon}
      <span className="hidden sm:inline xl:hidden 2xl:inline">{label}</span>
    </button>
  );
}

function ToolkitCategorySection({
  category,
  items,
  favoriteIds,
  learnedIds,
  onFavorite,
  onLearned,
}: {
  category: ExcelToolkitCategory;
  items: ExcelToolkitItem[];
  favoriteIds: string[];
  learnedIds: string[];
  onFavorite: (id: string) => void;
  onLearned: (id: string) => void;
}) {
  const description = {
    "Keyboard Shortcuts": "Windows and Mac commands grouped by the task they accelerate.",
    "Excel Tricks": "Practical techniques for common spreadsheet work.",
    "Formula Alternatives": "Balanced comparisons for choosing a maintainable method.",
    "Productivity Tips": "Short workflows that reduce repetitive work.",
    "Analyst Secrets": "Professional habits for reliable, reviewable workbooks.",
  }[category];

  return (
    <section aria-labelledby={`toolkit-${category.replaceAll(" ", "-")}`}>
      <p className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.16em] text-[var(--databloom-text-accent)]">
        <Sparkles size={17} aria-hidden="true" />
        Excel Pro Toolkit
      </p>
      <h3
        id={`toolkit-${category.replaceAll(" ", "-")}`}
        className="mt-1 text-3xl font-black text-[var(--databloom-text-heading)]"
      >
        {category}
      </h3>
      <p className="mt-2 text-[var(--databloom-text-secondary)]">
        {description}
      </p>

      {category === "Keyboard Shortcuts" ? (
        <div className="mt-6 space-y-8">
          {excelShortcutGroups
            .filter((group) =>
              items.some(
                (item) => item.kind === "shortcut" && item.group === group,
              ),
            )
            .map((group) => (
              <div key={group}>
                <h4 className="flex items-center gap-2 text-xl font-black text-[var(--databloom-text-heading)]">
                  <Keyboard
                    className="text-[var(--databloom-text-accent)]"
                    size={20}
                  />
                  {group}
                </h4>
                <div className="mt-4 grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
                  {items
                    .filter(
                      (item): item is ExcelShortcut =>
                        item.kind === "shortcut" && item.group === group,
                    )
                    .map((item) => (
                      <ShortcutCard
                        key={item.id}
                        item={item}
                        favorite={favoriteIds.includes(item.id)}
                        learned={learnedIds.includes(item.id)}
                        onFavorite={() => onFavorite(item.id)}
                        onLearned={() => onLearned(item.id)}
                      />
                    ))}
                </div>
              </div>
            ))}
        </div>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {items
            .filter(
              (
                item,
              ): item is Exclude<ExcelToolkitItem, ExcelShortcut> =>
                item.kind !== "shortcut",
            )
            .map((item) => (
              <ToolkitCard
                key={item.id}
                item={item}
                favorite={favoriteIds.includes(item.id)}
                learned={learnedIds.includes(item.id)}
                onFavorite={() => onFavorite(item.id)}
                onLearned={() => onLearned(item.id)}
              />
            ))}
        </div>
      )}
    </section>
  );
}

function CardShell({
  item,
  favorite,
  learned,
  onFavorite,
  onLearned,
  children,
}: {
  item: ExcelToolkitItem;
  favorite: boolean;
  learned: boolean;
  onFavorite: () => void;
  onLearned: () => void;
  children: React.ReactNode;
}) {
  return (
    <article
      data-databloom-glass
      className="flex min-w-0 flex-col rounded-3xl border p-5 shadow-md sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap gap-2">
            <Badge>{item.difficulty}</Badge>
            {learned ? <Badge>✓ Learned</Badge> : null}
          </div>
          <h4 className="mt-3 text-xl font-black text-[var(--databloom-text-heading)]">
            {item.title}
          </h4>
        </div>
        <button
          type="button"
          aria-pressed={favorite}
          onClick={onFavorite}
          aria-label={
            favorite ? `Remove ${item.title} from favorites` : `Favorite ${item.title}`
          }
          className="grid size-10 shrink-0 place-items-center rounded-xl border border-[var(--databloom-border)] bg-[var(--databloom-card)] text-[var(--databloom-text-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--databloom-focus)]"
        >
          <Heart size={18} fill={favorite ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="mt-5 flex-1">{children}</div>

      <button
        type="button"
        aria-pressed={learned}
        onClick={onLearned}
        className={`mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl border px-4 text-sm font-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--databloom-focus)] ${
          learned
            ? "border-[var(--databloom-border)] bg-[var(--databloom-accent-soft)] text-[var(--databloom-text-heading)]"
            : "border-[var(--databloom-border)] bg-[var(--databloom-card)] text-[var(--databloom-text-accent)]"
        }`}
      >
        {learned ? <Check size={17} /> : <Bookmark size={17} />}
        {learned ? "Learned" : "Mark as learned"}
      </button>
    </article>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-[var(--databloom-border)] bg-[var(--databloom-accent-soft)] px-3 py-1 text-xs font-black text-[var(--databloom-text-heading)]">
      {children}
    </span>
  );
}

function ShortcutCard({
  item,
  favorite,
  learned,
  onFavorite,
  onLearned,
}: {
  item: ExcelShortcut;
  favorite: boolean;
  learned: boolean;
  onFavorite: () => void;
  onLearned: () => void;
}) {
  return (
    <CardShell
      item={item}
      favorite={favorite}
      learned={learned}
      onFavorite={onFavorite}
      onLearned={onLearned}
    >
      <p className="text-sm leading-6 text-[var(--databloom-text-secondary)]">
        {item.explanation}
      </p>
      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        <ShortcutKeys label="Windows" value={item.windows} />
        <ShortcutKeys label="Mac" value={item.mac} />
      </dl>
      {item.example ? (
        <Detail label="Example" value={item.example} className="mt-4" />
      ) : null}
    </CardShell>
  );
}

function ShortcutKeys({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--databloom-border)] bg-[var(--databloom-accent-soft)] p-3">
      <dt className="text-xs font-black uppercase tracking-wider text-[var(--databloom-text-secondary)]">
        {label}
      </dt>
      <dd className="mt-2">
        <kbd className="break-words font-mono text-sm font-black text-[var(--databloom-text-heading)]">
          {value}
        </kbd>
      </dd>
    </div>
  );
}

function ToolkitCard(props: {
  item: Exclude<ExcelToolkitItem, ExcelShortcut>;
  favorite: boolean;
  learned: boolean;
  onFavorite: () => void;
  onLearned: () => void;
}) {
  const { item, ...cardProps } = props;
  return (
    <CardShell item={item} {...cardProps}>
      {item.kind === "trick" ? <TrickContent item={item} /> : null}
      {item.kind === "comparison" ? <ComparisonContent item={item} /> : null}
      {item.kind === "productivity" ? <ProductivityContent item={item} /> : null}
      {item.kind === "analyst-secret" ? <AnalystSecretContent item={item} /> : null}
    </CardShell>
  );
}

function TrickContent({ item }: { item: ExcelTrick }) {
  return (
    <div className="space-y-4">
      <Detail label="What it does" value={item.whatItDoes} />
      <Detail label="When to use it" value={item.whenToUse} />
      <NumberedSteps steps={item.steps} />
      <Detail label="Example" value={item.example} />
      <Detail label="Common mistake" value={item.commonMistake} />
    </div>
  );
}

function ComparisonContent({ item }: { item: FormulaAlternative }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <FormulaMethod
          label="Traditional method"
          method={item.traditionalMethod}
          formula={item.traditionalFormula}
        />
        <FormulaMethod
          label="Alternative"
          method={item.modernAlternative}
          formula={item.alternativeFormula}
        />
      </div>
      <Detail
        label={`Use ${item.traditionalMethod} when`}
        value={item.useTraditionalWhen}
      />
      <Detail
        label={`Use ${item.modernAlternative} when`}
        value={item.useAlternativeWhen}
      />
      <Detail label="Compatibility" value={item.compatibility} />
      <Detail label="Performance" value={item.performance} />
      <Detail label="Common mistake" value={item.commonMistake} />
    </div>
  );
}

function ProductivityContent({ item }: { item: ProductivityTip }) {
  return (
    <div className="space-y-4">
      <p className="leading-7 text-[var(--databloom-text-secondary)]">
        {item.summary}
      </p>
      <NumberedSteps steps={item.actions} />
      <Detail label="Example" value={item.example} />
    </div>
  );
}

function AnalystSecretContent({ item }: { item: AnalystSecret }) {
  return (
    <div className="space-y-4">
      <Detail label="Professional practice" value={item.practice} />
      <Detail label="Why it matters" value={item.whyItMatters} />
      <div className="rounded-2xl border border-[var(--databloom-border)] bg-[var(--databloom-accent-soft)] p-4">
        <p className="flex items-center gap-2 text-sm font-black text-[var(--databloom-text-heading)]">
          <Lightbulb size={17} />
          Put it into practice
        </p>
        <p className="mt-2 text-sm leading-6 text-[var(--databloom-text-secondary)]">
          {item.action}
        </p>
      </div>
    </div>
  );
}

function FormulaMethod({
  label,
  method,
  formula,
}: {
  label: string;
  method: string;
  formula: string;
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-[var(--databloom-border)] bg-[var(--databloom-accent-soft)] p-4">
      <p className="text-xs font-black uppercase tracking-wider text-[var(--databloom-text-secondary)]">
        {label}
      </p>
      <p className="mt-1 font-black text-[var(--databloom-text-heading)]">
        {method}
      </p>
      <code className="mt-3 block overflow-x-auto whitespace-pre-wrap break-words rounded-xl bg-[var(--databloom-card)] p-3 text-xs font-bold text-[var(--databloom-text-primary)]">
        {formula}
      </code>
    </div>
  );
}

function Detail({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="text-sm font-black text-[var(--databloom-text-heading)]">
        {label}
      </p>
      <p className="mt-1 text-sm leading-6 text-[var(--databloom-text-secondary)]">
        {value}
      </p>
    </div>
  );
}

function NumberedSteps({ steps }: { steps: string[] }) {
  return (
    <div>
      <p className="text-sm font-black text-[var(--databloom-text-heading)]">
        Steps
      </p>
      <ol className="mt-2 space-y-2">
        {steps.map((step, index) => (
          <li
            key={step}
            className="flex gap-3 text-sm leading-6 text-[var(--databloom-text-secondary)]"
          >
            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[var(--databloom-accent-soft)] text-xs font-black text-[var(--databloom-text-heading)]">
              {index + 1}
            </span>
            {step}
          </li>
        ))}
      </ol>
    </div>
  );
}
