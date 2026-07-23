"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpenCheck,
  Check,
  Clock3,
  Database,
  FileText,
  HelpCircle,
  Lightbulb,
  MessageSquareText,
  Target,
  Wrench,
} from "lucide-react";
import { useEffect, useState } from "react";

import CompletionModal from "@/components/dashboard/CompletionModal";
import AppLayout from "@/components/layout/AppLayout";
import { useProgress } from "@/context/ProgressContext";
import { getDatasetLibraryItem } from "@/lib/datasetLibrary";
import type { PortfolioProject } from "@/lib/portfolioProjects";
import {
  completePortfolioProject,
  getPortfolioReflection,
  loadPortfolioProjectProgress,
  PORTFOLIO_PROJECT_EVENT,
  savePortfolioReflection,
} from "@/lib/portfolioProjectProgress";
import { playClickSound, playXPSound } from "@/lib/sounds";
import { registerStudyActivity } from "@/lib/studyActivity";

export default function PortfolioProjectDetail({
  project,
}: {
  project: PortfolioProject;
}) {
  const router = useRouter();
  const { addXP } = useProgress();
  const dataset = getDatasetLibraryItem(project.dataset.libraryId);
  const [completed, setCompleted] = useState(false);
  const [reflection, setReflection] = useState("");
  const [ready, setReady] = useState(false);
  const [reflectionSaved, setReflectionSaved] = useState(true);
  const [showCompletion, setShowCompletion] = useState(false);

  useEffect(() => {
    const syncProgress = () => {
      const progress = loadPortfolioProjectProgress();
      setCompleted(progress.completedProjectIds.includes(project.id));
    };
    const frame = window.requestAnimationFrame(() => {
      syncProgress();
      setReflection(getPortfolioReflection(project.id));
      setReady(true);
    });
    window.addEventListener(PORTFOLIO_PROJECT_EVENT, syncProgress);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener(PORTFOLIO_PROJECT_EVENT, syncProgress);
    };
  }, [project.id]);

  useEffect(() => {
    if (!ready) return;
    const timer = window.setTimeout(() => {
      savePortfolioReflection(project.id, reflection);
      setReflectionSaved(true);
    }, 450);
    return () => window.clearTimeout(timer);
  }, [project.id, ready, reflection]);

  function handleComplete() {
    if (completed) return;
    playClickSound();
    const result = completePortfolioProject(project.id);
    setCompleted(result.state.completedProjectIds.includes(project.id));
    if (!result.newlyCompleted) return;
    if (result.xpAward) {
      addXP(result.xpAward);
      registerStudyActivity({
        kind: "study",
        source: `portfolio-project:${project.id}`,
        minutes: 60,
        xp: result.xpAward,
      });
      playXPSound();
    }
    setShowCompletion(true);
  }

  return (
    <AppLayout>
      <div className="space-y-7 text-[var(--databloom-text-primary)]">
        <header
          data-databloom-glass
          className="rounded-[2rem] border p-7 shadow-lg sm:p-10"
        >
          <Link
            href="/portfolio-project-studio"
            onClick={playClickSound}
            className="inline-flex items-center gap-2 text-sm font-black text-[var(--databloom-text-accent)]"
          >
            <ArrowLeft size={17} />
            Portfolio Project Studio
          </Link>
          <div className="mt-5 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="flex flex-wrap gap-2">
                <Badge>{project.category}</Badge>
                <Badge>{project.difficulty}</Badge>
                {completed ? <Badge>✓ Completed</Badge> : null}
              </div>
              <h1 className="mt-4 text-4xl font-black tracking-tight text-[var(--databloom-text-heading)] sm:text-5xl">
                {project.icon} {project.title}
              </h1>
              <p className="mt-4 text-lg leading-8 text-[var(--databloom-text-secondary)]">
                {project.businessScenario}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Fact
                icon={<Clock3 size={18} />}
                label="Estimated"
                value={project.estimatedTime}
              />
              <Fact
                icon={<Target size={18} />}
                label="Reward"
                value={`${project.xpReward} XP`}
              />
            </div>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <ContentCard
            icon={<BookOpenCheck size={21} />}
            eyebrow="Overview"
            title="Background story"
          >
            <p className="leading-8 text-[var(--databloom-text-secondary)]">
              {project.backgroundStory}
            </p>
          </ContentCard>

          <ContentCard
            icon={<Wrench size={21} />}
            eyebrow="Required skills"
            title="Tools and techniques"
          >
            <div className="flex flex-wrap gap-2">
              {project.skillsRequired.map((skill) => (
                <Badge key={skill}>{skill}</Badge>
              ))}
            </div>
          </ContentCard>
        </div>

        <ContentCard
          icon={<Target size={21} />}
          eyebrow="Learning objectives"
          title="What you will demonstrate"
        >
          <Checklist items={project.learningObjectives} />
        </ContentCard>

        <ContentCard
          icon={<Database size={21} />}
          eyebrow="Dataset information"
          title={dataset?.name ?? "Practice dataset"}
        >
          <p className="leading-7 text-[var(--databloom-text-secondary)]">
            {project.dataset.usage}
          </p>
          {dataset ? (
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <MiniFact label="Format" value="CSV" />
              <MiniFact label="Rows" value={dataset.rowCount.toLocaleString()} />
              <MiniFact label="Columns" value={String(dataset.columnCount)} />
            </div>
          ) : null}
          <div className="mt-5">
            <p className="text-sm font-black text-[var(--databloom-text-heading)]">
              Focus fields
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {project.dataset.focusFields.map((field) => (
                <Badge key={field}>{field}</Badge>
              ))}
            </div>
          </div>
          {dataset ? (
            <Link
              href={`/dataset-library/${dataset.id}`}
              onClick={playClickSound}
              className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-2xl border border-[var(--databloom-border)] bg-[var(--databloom-accent-soft)] px-5 font-black text-[var(--databloom-text-heading)]"
            >
              <Database size={17} />
              Open dataset
            </Link>
          ) : null}
        </ContentCard>

        <div className="grid gap-6 xl:grid-cols-[0.7fr_1.3fr]">
          <ContentCard
            icon={<Lightbulb size={21} />}
            eyebrow="Guided hints"
            title="Use these only when needed"
          >
            <Checklist items={project.guidedHints ?? []} />
          </ContentCard>
          <ContentCard
            icon={<Check size={21} />}
            eyebrow="Guided solution"
            title="A practical walkthrough"
          >
            <NumberedList items={project.solutionWalkthrough} />
          </ContentCard>
        </div>

        <ContentCard
          icon={<HelpCircle size={21} />}
          eyebrow="Reflection"
          title="Explain your choices"
        >
          <ul className="grid gap-3 md:grid-cols-3">
            {project.reflectionQuestions.map((question) => (
              <li
                key={question}
                className="rounded-2xl border border-[var(--databloom-border)] bg-[var(--databloom-accent-soft)] p-4 text-sm font-semibold leading-6 text-[var(--databloom-text-secondary)]"
              >
                {question}
              </li>
            ))}
          </ul>
          <label className="mt-5 block">
            <span className="flex flex-wrap items-center justify-between gap-2 text-sm font-black text-[var(--databloom-text-heading)]">
              Personal reflection notes
              <span
                className="font-semibold text-[var(--databloom-text-muted)]"
                aria-live="polite"
              >
                {reflectionSaved ? "Saved locally" : "Saving…"}
              </span>
            </span>
            <textarea
              value={reflection}
              onChange={(event) => {
                setReflection(event.target.value);
                setReflectionSaved(false);
              }}
              rows={7}
              placeholder="Record your assumptions, validation checks, decisions, and what you would improve…"
              className="mt-2 w-full resize-y rounded-2xl border border-[var(--databloom-border)] bg-[var(--databloom-input)] p-4 leading-7 text-[var(--databloom-text-primary)] outline-none placeholder:text-[var(--databloom-text-muted)] focus:border-[var(--databloom-focus)] focus:ring-2 focus:ring-[var(--databloom-focus)]"
            />
          </label>
        </ContentCard>

        <div className="grid gap-6 lg:grid-cols-2">
          <ContentCard
            icon={<FileText size={21} />}
            eyebrow="Portfolio and resume"
            title="Describe the evidence"
          >
            <CopyBlock
              label="Portfolio description"
              value={project.portfolioDescription}
            />
            <CopyBlock label="Resume bullet" value={project.resumeBullet} />
          </ContentCard>
          <ContentCard
            icon={<MessageSquareText size={21} />}
            eyebrow="Interview preparation"
            title="Be ready to explain your work"
          >
            <NumberedList items={project.interviewQuestions} />
          </ContentCard>
        </div>

        <section
          data-databloom-glass
          className="rounded-[2rem] border p-6 shadow-lg sm:p-8"
        >
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-4xl" aria-hidden="true">
                {project.achievementBadge.icon}
              </p>
              <h2 className="mt-2 text-2xl font-black text-[var(--databloom-text-heading)]">
                {completed
                  ? project.achievementBadge.title
                  : "Ready to add this project to your gallery?"}
              </h2>
              <p className="mt-2 text-[var(--databloom-text-secondary)]">
                {completed
                  ? "Completion is saved. This project now appears in your Portfolio Gallery and Resume Builder suggestions."
                  : `Mark complete when you have built, validated, reflected on, and documented the project. First completion awards ${project.xpReward} XP.`}
              </p>
            </div>
            <button
              type="button"
              onClick={handleComplete}
              disabled={completed}
              className="min-h-12 shrink-0 rounded-2xl bg-[var(--databloom-action)] px-6 font-black text-[var(--databloom-text-on-accent)] shadow-md disabled:cursor-not-allowed disabled:bg-[var(--databloom-accent-soft)] disabled:text-[var(--databloom-text-muted)]"
            >
              {completed ? "Project completed" : "Mark project complete"}
            </button>
          </div>
        </section>
      </div>

      <CompletionModal
        isOpen={showCompletion}
        projectTitle={project.title}
        xpEarned={project.xpReward}
        onClose={() => setShowCompletion(false)}
        onContinue={() => {
          setShowCompletion(false);
          router.push("/portfolio-project-studio");
        }}
      />
    </AppLayout>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-[var(--databloom-border)] bg-[var(--databloom-accent-soft)] px-3 py-1 text-xs font-black text-[var(--databloom-text-heading)]">
      {children}
    </span>
  );
}

function Fact({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-28 rounded-2xl border border-[var(--databloom-border)] bg-[var(--databloom-card)] p-4 shadow-sm">
      <p className="flex items-center gap-2 text-[var(--databloom-text-accent)]">
        {icon}
        <span className="text-xs font-black uppercase tracking-wider">
          {label}
        </span>
      </p>
      <p className="mt-2 font-black text-[var(--databloom-text-heading)]">
        {value}
      </p>
    </div>
  );
}

function ContentCard({
  icon,
  eyebrow,
  title,
  children,
}: {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      data-databloom-glass
      className="rounded-[2rem] border p-6 shadow-md sm:p-8"
    >
      <div className="flex items-center gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl border border-[var(--databloom-border)] bg-[var(--databloom-accent-soft)] text-[var(--databloom-text-accent)]">
          {icon}
        </span>
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-[var(--databloom-text-accent)]">
            {eyebrow}
          </p>
          <h2 className="mt-1 text-2xl font-black text-[var(--databloom-text-heading)]">
            {title}
          </h2>
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function MiniFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--databloom-border)] bg-[var(--databloom-accent-soft)] p-4">
      <p className="text-xs font-black uppercase tracking-wider text-[var(--databloom-text-muted)]">
        {label}
      </p>
      <p className="mt-1 font-black text-[var(--databloom-text-heading)]">
        {value}
      </p>
    </div>
  );
}

function Checklist({ items }: { items: string[] }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li
          key={item}
          className="flex items-start gap-3 leading-7 text-[var(--databloom-text-secondary)]"
        >
          <span className="mt-1 grid size-5 shrink-0 place-items-center rounded-full bg-[var(--databloom-accent-soft)] text-[var(--databloom-text-accent)]">
            <Check size={13} />
          </span>
          {item}
        </li>
      ))}
    </ul>
  );
}

function NumberedList({ items }: { items: string[] }) {
  return (
    <ol className="space-y-3">
      {items.map((item, index) => (
        <li
          key={item}
          className="flex items-start gap-3 leading-7 text-[var(--databloom-text-secondary)]"
        >
          <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-[var(--databloom-accent-soft)] text-xs font-black text-[var(--databloom-text-heading)]">
            {index + 1}
          </span>
          {item}
        </li>
      ))}
    </ol>
  );
}

function CopyBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="mt-4 first:mt-0 rounded-2xl border border-[var(--databloom-border)] bg-[var(--databloom-accent-soft)] p-4">
      <p className="text-sm font-black text-[var(--databloom-text-heading)]">
        {label}
      </p>
      <p className="mt-2 text-sm leading-6 text-[var(--databloom-text-secondary)]">
        {value}
      </p>
    </div>
  );
}
