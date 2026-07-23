"use client";

import Link from "next/link";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Check,
  FileDown,
  Lightbulb,
  Plus,
  Save,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import AppLayout from "@/components/layout/AppLayout";
import { achievements as achievementDefinitions } from "@/lib/achievements";
import { loadAnalyticsSnapshot } from "@/lib/analytics";
import { loadCareerHubState } from "@/lib/careerHub";
import { careerGuides } from "@/lib/careerHubData";
import { getCompletedDashboards } from "@/lib/dashboardProgress";
import { dashboardProjects } from "@/lib/dashboardProjects";
import {
  createEmptyResume,
  createResumeAchievement,
  createResumeCertification,
  createResumeEducation,
  createResumeExperience,
  createResumeLink,
  createResumeProject,
  getResumeStrength,
  loadResume,
  saveResume,
  type ResumeAchievement,
  type ResumeCertification,
  type ResumeDocument,
  type ResumeEducation,
  type ResumeExperience,
  type ResumeLink,
  type ResumeProject,
  type ResumeSectionId,
} from "@/lib/resumeBuilder";
import { playClickSound, playSuccessSound } from "@/lib/sounds";
import { loadUnlockedAchievements } from "@/lib/unlockedAchievements";
import { useUserPreferences } from "@/hooks/useUserPreferences";

type View = "builder" | "guide";

type ResumeSuggestions = {
  skills: string[];
  projects: Array<{
    id: string;
    name: string;
    tools: string;
    bullets: string;
  }>;
  achievements: Array<{ id: string; title: string; details: string }>;
  certifications: Array<{
    id: string;
    name: string;
    provider: string;
    date: string;
    credentialLink: string;
  }>;
};

const sectionLabels: Record<ResumeSectionId, string> = {
  summary: "Professional summary",
  skills: "Skills",
  experience: "Experience",
  projects: "Projects",
  education: "Education",
  certifications: "Certifications",
  achievements: "Achievements",
  links: "Links",
};

const emptySuggestions: ResumeSuggestions = {
  skills: [],
  projects: [],
  achievements: [],
  certifications: [],
};

function loadSuggestions(): ResumeSuggestions {
  const snapshot = loadAnalyticsSnapshot();
  const completedProjectIds = new Set(getCompletedDashboards());
  const unlocked = new Set(loadUnlockedAchievements());
  const careerState = loadCareerHubState();

  return {
    skills: snapshot.studioProgress
      .filter(
        (studio) =>
          studio.total > 0 &&
          studio.completed >= studio.total &&
          studio.id !== "dashboards",
      )
      .map((studio) => studio.name.replace(" Studio", "")),
    projects: dashboardProjects
      .filter((project) => completedProjectIds.has(project.id))
      .map((project) => ({
        id: project.id,
        name: project.title,
        tools: project.tools.join(", "),
        bullets: [
          project.description,
          ...project.learningObjectives.slice(0, 2),
        ].join("\n"),
      })),
    achievements: achievementDefinitions
      .filter((achievement) => unlocked.has(achievement.id))
      .map((achievement) => ({
        id: achievement.id,
        title: achievement.title,
        details: achievement.description,
      })),
    certifications: careerState.certifications
      .filter((certification) => certification.status === "Completed")
      .map((certification) => ({
        id: certification.id,
        name: certification.name,
        provider: certification.provider,
        date: certification.completionDate,
        credentialLink: certification.certificateLink,
      })),
  };
}

export default function ResumeBuilder() {
  const preferences = useUserPreferences();
  const [view, setView] = useState<View>("builder");
  const [resume, setResume] = useState<ResumeDocument>(createEmptyResume);
  const [suggestions, setSuggestions] =
    useState<ResumeSuggestions>(emptySuggestions);
  const [ready, setReady] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setResume(loadResume());
      setSuggestions(loadSuggestions());
      setReady(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const timeout = window.setTimeout(() => {
      saveResume({ ...resume, updatedAt: new Date().toISOString() });
    }, 500);
    return () => window.clearTimeout(timeout);
  }, [ready, resume]);

  const strength = useMemo(() => getResumeStrength(resume), [resume]);

  function update(patch: Partial<ResumeDocument>) {
    setSaveMessage("");
    setResume((current) => ({ ...current, ...patch }));
  }

  function saveNow() {
    playClickSound();
    const saved = saveResume({
      ...resume,
      updatedAt: new Date().toISOString(),
    });
    setSaveMessage(saved ? "Saved on this device" : "Unable to save");
    if (saved) playSuccessSound();
  }

  function moveSection(section: ResumeSectionId, direction: -1 | 1) {
    const index = resume.sectionOrder.indexOf(section);
    const target = index + direction;
    if (target < 0 || target >= resume.sectionOrder.length) return;
    const order = [...resume.sectionOrder];
    [order[index], order[target]] = [order[target], order[index]];
    update({ sectionOrder: order });
  }

  function addSkill(skill: string) {
    const normalized = skill.trim();
    if (
      !normalized ||
      resume.skills.some(
        (current) => current.toLowerCase() === normalized.toLowerCase(),
      )
    ) {
      return;
    }
    update({ skills: [...resume.skills, normalized] });
  }

  function addSuggestedProject(suggestion: ResumeSuggestions["projects"][number]) {
    if (resume.projects.some((item) => item.name === suggestion.name)) return;
    update({
      projects: [
        ...resume.projects,
        { ...createResumeProject(), ...suggestion },
      ],
    });
  }

  function addSuggestedAchievement(
    suggestion: ResumeSuggestions["achievements"][number],
  ) {
    if (resume.achievements.some((item) => item.title === suggestion.title)) return;
    update({
      achievements: [
        ...resume.achievements,
        { ...createResumeAchievement(), ...suggestion },
      ],
    });
  }

  function addSuggestedCertification(
    suggestion: ResumeSuggestions["certifications"][number],
  ) {
    if (
      resume.certifications.some((item) => item.name === suggestion.name)
    ) {
      return;
    }
    update({
      certifications: [
        ...resume.certifications,
        { ...createResumeCertification(), ...suggestion },
      ],
    });
  }

  return (
    <AppLayout>
      <div className="space-y-7 text-slate-950">
        <header className="rounded-[2rem] border border-white/80 bg-gradient-to-br from-purple-100 via-pink-100 to-sky-100 p-6 shadow-lg sm:p-9">
          <Link
            href="/career-hub"
            className="inline-flex items-center gap-2 text-sm font-black text-purple-800"
          >
            <ArrowLeft size={17} />
            Career Hub
          </Link>
          <div className="mt-5 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.16em] text-purple-700">
                Career toolkit
              </p>
              <h1 className="mt-2 text-4xl font-black tracking-tight text-purple-950 sm:text-5xl">
                📄 Resume Builder
              </h1>
              <p className="mt-3 max-w-3xl font-medium leading-7 text-slate-700">
                Create one clean, ATS-friendly resume and improve it with
                evidence-led guidance. Your draft stays on this device.
              </p>
            </div>
            {view === "builder" ? (
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={saveNow}
                  className="inline-flex min-h-12 items-center gap-2 rounded-2xl border border-purple-200 bg-white/85 px-5 font-black text-purple-800 shadow-sm"
                >
                  <Save size={18} />
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-gradient-to-r from-purple-700 to-pink-600 px-5 font-black text-white shadow-md"
                >
                  <FileDown size={18} />
                  Print / Save PDF
                </button>
              </div>
            ) : null}
          </div>
          {saveMessage ? (
            <p className="mt-3 text-sm font-bold text-purple-800" role="status">
              {saveMessage}
            </p>
          ) : null}
        </header>

        <nav
          aria-label="Resume sections"
          className="flex flex-wrap gap-2 rounded-[2rem] border border-purple-100 bg-white/80 p-3 shadow-md"
        >
          {(["builder", "guide"] as View[]).map((item) => (
            <button
              key={item}
              type="button"
              aria-current={view === item ? "page" : undefined}
              onClick={() => {
                playClickSound();
                setView(item);
              }}
              className={`min-h-11 rounded-2xl px-5 text-sm font-black transition ${
                view === item
                  ? "bg-purple-700 text-white shadow-sm"
                  : "text-slate-700 hover:bg-purple-50 hover:text-purple-800"
              }`}
            >
              {item === "builder" ? "Resume Builder" : "Resume Guide"}
            </button>
          ))}
        </nav>

        {view === "guide" ? (
          <ResumeGuide />
        ) : (
          <div className="space-y-6">
            <ResumeStrengthPanel strength={strength} />
            <ResumeSuggestionsPanel
              suggestions={suggestions}
              resume={resume}
              userName={preferences.userName}
              onUseName={() =>
                update({
                  personal: {
                    ...resume.personal,
                    fullName: preferences.userName,
                  },
                })
              }
              onAddSkill={addSkill}
              onAddProject={addSuggestedProject}
              onAddAchievement={addSuggestedAchievement}
              onAddCertification={addSuggestedCertification}
            />

            <div className="grid min-w-0 gap-7 xl:grid-cols-[minmax(0,1.05fr)_minmax(26rem,0.95fr)]">
              <div className="min-w-0 space-y-5" data-resume-ui>
                <PersonalEditor
                  resume={resume}
                  onChange={(personal) => update({ personal })}
                />
                <SectionOrder
                  order={resume.sectionOrder}
                  onMove={moveSection}
                />
                {resume.sectionOrder.map((section) => (
                  <div key={section}>
                    {section === "summary" ? (
                      <SummaryEditor
                        value={resume.summary}
                        onChange={(summary) => update({ summary })}
                      />
                    ) : null}
                    {section === "skills" ? (
                      <SkillsEditor
                        skills={resume.skills}
                        onChange={(skills) => update({ skills })}
                      />
                    ) : null}
                    {section === "experience" ? (
                      <ExperienceEditor
                        items={resume.experience}
                        onChange={(experience) => update({ experience })}
                      />
                    ) : null}
                    {section === "projects" ? (
                      <ProjectsEditor
                        items={resume.projects}
                        onChange={(projects) => update({ projects })}
                      />
                    ) : null}
                    {section === "education" ? (
                      <EducationEditor
                        items={resume.education}
                        onChange={(education) => update({ education })}
                      />
                    ) : null}
                    {section === "certifications" ? (
                      <CertificationsEditor
                        items={resume.certifications}
                        onChange={(certifications) => update({ certifications })}
                      />
                    ) : null}
                    {section === "achievements" ? (
                      <AchievementsEditor
                        items={resume.achievements}
                        onChange={(achievements) => update({ achievements })}
                      />
                    ) : null}
                    {section === "links" ? (
                      <LinksEditor
                        items={resume.links}
                        onChange={(links) => update({ links })}
                      />
                    ) : null}
                  </div>
                ))}
              </div>

              <aside className="min-w-0 xl:sticky xl:top-6 xl:self-start">
                <p className="mb-3 text-sm font-black uppercase tracking-[0.16em] text-purple-700">
                  Live ATS preview
                </p>
                <ResumePreview resume={resume} ready={ready} />
              </aside>
            </div>
          </div>
        )}
      </div>
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          [data-resume-preview],
          [data-resume-preview] * {
            visibility: visible !important;
          }
          [data-resume-preview] {
            position: absolute !important;
            inset: 0 auto auto 0 !important;
            width: 100% !important;
            min-height: 100vh !important;
            border: 0 !important;
            border-radius: 0 !important;
            box-shadow: none !important;
          }
        }
      `}</style>
    </AppLayout>
  );
}

function EditorCard({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[2rem] border border-purple-100 bg-white/85 p-5 shadow-md sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-purple-950">{title}</h2>
          {description ? (
            <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
          ) : null}
        </div>
        {action}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block text-sm font-bold text-slate-700">
      {label}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-2 min-h-11 w-full rounded-2xl border border-purple-100 bg-white/90 px-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-200"
      />
    </label>
  );
}

function TextareaField({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <label className="block text-sm font-bold text-slate-700">
      {label}
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="mt-2 w-full resize-y rounded-2xl border border-purple-100 bg-white/90 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-200"
      />
    </label>
  );
}

function AddButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex min-h-10 items-center gap-2 rounded-2xl border border-purple-200 bg-purple-50 px-4 text-sm font-black text-purple-800"
    >
      <Plus size={16} />
      {label}
    </button>
  );
}

function RemoveButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="grid size-10 shrink-0 place-items-center rounded-xl border border-rose-200 bg-rose-50 text-rose-700"
    >
      <Trash2 size={16} />
    </button>
  );
}

function EntryCard({
  title,
  onRemove,
  children,
}: {
  title: string;
  onRemove: () => void;
  children: React.ReactNode;
}) {
  return (
    <article className="rounded-3xl border border-purple-100 bg-purple-50/40 p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="font-black text-purple-900">{title}</h3>
        <RemoveButton onClick={onRemove} label={`Remove ${title}`} />
      </div>
      {children}
    </article>
  );
}

function PersonalEditor({
  resume,
  onChange,
}: {
  resume: ResumeDocument;
  onChange: (personal: ResumeDocument["personal"]) => void;
}) {
  const personal = resume.personal;
  const set = (key: keyof typeof personal, value: string) =>
    onChange({ ...personal, [key]: value });
  return (
    <EditorCard
      title="Personal details"
      description="Keep contact information concise and selectable for ATS parsing."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" value={personal.fullName} onChange={(value) => set("fullName", value)} />
        <Field label="Professional headline" value={personal.headline} onChange={(value) => set("headline", value)} placeholder="Data Analyst" />
        <Field label="Email" type="email" value={personal.email} onChange={(value) => set("email", value)} />
        <Field label="Phone" type="tel" value={personal.phone} onChange={(value) => set("phone", value)} />
        <Field label="Location" value={personal.location} onChange={(value) => set("location", value)} />
      </div>
    </EditorCard>
  );
}

function SectionOrder({
  order,
  onMove,
}: {
  order: ResumeSectionId[];
  onMove: (section: ResumeSectionId, direction: -1 | 1) => void;
}) {
  return (
    <EditorCard
      title="Section order"
      description="Move sections to match the role while keeping personal details first."
    >
      <ol className="grid gap-2 sm:grid-cols-2">
        {order.map((section, index) => (
          <li
            key={section}
            className="flex min-h-12 items-center justify-between gap-3 rounded-2xl border border-purple-100 bg-white px-4"
          >
            <span className="font-bold text-slate-700">
              {index + 1}. {sectionLabels[section]}
            </span>
            <span className="flex gap-1">
              <button
                type="button"
                onClick={() => onMove(section, -1)}
                disabled={index === 0}
                aria-label={`Move ${sectionLabels[section]} up`}
                className="grid size-8 place-items-center rounded-lg text-purple-700 disabled:text-slate-300"
              >
                <ArrowUp size={15} />
              </button>
              <button
                type="button"
                onClick={() => onMove(section, 1)}
                disabled={index === order.length - 1}
                aria-label={`Move ${sectionLabels[section]} down`}
                className="grid size-8 place-items-center rounded-lg text-purple-700 disabled:text-slate-300"
              >
                <ArrowDown size={15} />
              </button>
            </span>
          </li>
        ))}
      </ol>
    </EditorCard>
  );
}

function SummaryEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <EditorCard title="Professional summary">
      <TextareaField
        label="Summary"
        value={value}
        onChange={onChange}
        placeholder="Target role, strongest relevant skills, and one credible proof point."
      />
    </EditorCard>
  );
}

function SkillsEditor({
  skills,
  onChange,
}: {
  skills: string[];
  onChange: (skills: string[]) => void;
}) {
  return (
    <EditorCard
      title="Skills"
      action={<AddButton label="Add skill" onClick={() => onChange([...skills, ""])} />}
    >
      {skills.length ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {skills.map((skill, index) => (
            <div key={`${index}-${skill}`} className="flex gap-2">
              <input
                aria-label={`Skill ${index + 1}`}
                value={skill}
                onChange={(event) =>
                  onChange(
                    skills.map((item, itemIndex) =>
                      itemIndex === index ? event.target.value : item,
                    ),
                  )
                }
                className="min-h-11 min-w-0 flex-1 rounded-2xl border border-purple-100 bg-white px-4 text-slate-900 outline-none focus:ring-2 focus:ring-purple-200"
              />
              <RemoveButton
                label={`Remove skill ${index + 1}`}
                onClick={() =>
                  onChange(skills.filter((_, itemIndex) => itemIndex !== index))
                }
              />
            </div>
          ))}
        </div>
      ) : (
        <EmptyEditorState message="Add the skills you can confidently explain and support with evidence." />
      )}
    </EditorCard>
  );
}

function ExperienceEditor({
  items,
  onChange,
}: {
  items: ResumeExperience[];
  onChange: (items: ResumeExperience[]) => void;
}) {
  const updateItem = (id: string, patch: Partial<ResumeExperience>) =>
    onChange(items.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  return (
    <EditorCard title="Experience" action={<AddButton label="Add experience" onClick={() => onChange([...items, createResumeExperience()])} />}>
      <div className="space-y-4">
        {items.map((item, index) => (
          <EntryCard key={item.id} title={`Experience ${index + 1}`} onRemove={() => onChange(items.filter((current) => current.id !== item.id))}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Organization" value={item.organization} onChange={(value) => updateItem(item.id, { organization: value })} />
              <Field label="Role" value={item.role} onChange={(value) => updateItem(item.id, { role: value })} />
              <Field label="Location" value={item.location} onChange={(value) => updateItem(item.id, { location: value })} />
              <Field label="Start date" value={item.startDate} onChange={(value) => updateItem(item.id, { startDate: value })} placeholder="Jan 2025" />
              <Field label="End date" value={item.endDate} onChange={(value) => updateItem(item.id, { endDate: value })} placeholder="Present" />
            </div>
            <div className="mt-4">
              <TextareaField label="Achievement bullets (one per line)" value={item.bullets} onChange={(value) => updateItem(item.id, { bullets: value })} />
            </div>
          </EntryCard>
        ))}
        {!items.length ? <EmptyEditorState message="Add internships, jobs, volunteering, freelance work, or relevant leadership." /> : null}
      </div>
    </EditorCard>
  );
}

function ProjectsEditor({
  items,
  onChange,
}: {
  items: ResumeProject[];
  onChange: (items: ResumeProject[]) => void;
}) {
  const updateItem = (id: string, patch: Partial<ResumeProject>) =>
    onChange(items.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  return (
    <EditorCard title="Projects" action={<AddButton label="Add project" onClick={() => onChange([...items, createResumeProject()])} />}>
      <div className="space-y-4">
        {items.map((item, index) => (
          <EntryCard key={item.id} title={`Project ${index + 1}`} onRemove={() => onChange(items.filter((current) => current.id !== item.id))}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Project name" value={item.name} onChange={(value) => updateItem(item.id, { name: value })} />
              <Field label="Tools" value={item.tools} onChange={(value) => updateItem(item.id, { tools: value })} placeholder="SQL, Power BI" />
              <Field label="Project link" type="url" value={item.link} onChange={(value) => updateItem(item.id, { link: value })} />
            </div>
            <div className="mt-4">
              <TextareaField label="Project bullets (one per line)" value={item.bullets} onChange={(value) => updateItem(item.id, { bullets: value })} />
            </div>
          </EntryCard>
        ))}
        {!items.length ? <EmptyEditorState message="Add projects that show a business question, method, and outcome." /> : null}
      </div>
    </EditorCard>
  );
}

function EducationEditor({
  items,
  onChange,
}: {
  items: ResumeEducation[];
  onChange: (items: ResumeEducation[]) => void;
}) {
  const updateItem = (id: string, patch: Partial<ResumeEducation>) =>
    onChange(items.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  return (
    <EditorCard title="Education" action={<AddButton label="Add education" onClick={() => onChange([...items, createResumeEducation()])} />}>
      <div className="space-y-4">
        {items.map((item, index) => (
          <EntryCard key={item.id} title={`Education ${index + 1}`} onRemove={() => onChange(items.filter((current) => current.id !== item.id))}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Institution" value={item.institution} onChange={(value) => updateItem(item.id, { institution: value })} />
              <Field label="Qualification" value={item.qualification} onChange={(value) => updateItem(item.id, { qualification: value })} />
              <Field label="Field of study" value={item.field} onChange={(value) => updateItem(item.id, { field: value })} />
              <Field label="Location" value={item.location} onChange={(value) => updateItem(item.id, { location: value })} />
              <Field label="Start date" value={item.startDate} onChange={(value) => updateItem(item.id, { startDate: value })} />
              <Field label="End date" value={item.endDate} onChange={(value) => updateItem(item.id, { endDate: value })} />
            </div>
            <div className="mt-4">
              <TextareaField label="Relevant details" value={item.details} onChange={(value) => updateItem(item.id, { details: value })} rows={3} />
            </div>
          </EntryCard>
        ))}
        {!items.length ? <EmptyEditorState message="Add your most relevant education, coursework, or training." /> : null}
      </div>
    </EditorCard>
  );
}

function CertificationsEditor({
  items,
  onChange,
}: {
  items: ResumeCertification[];
  onChange: (items: ResumeCertification[]) => void;
}) {
  const updateItem = (id: string, patch: Partial<ResumeCertification>) =>
    onChange(items.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  return (
    <EditorCard title="Certifications" action={<AddButton label="Add certification" onClick={() => onChange([...items, createResumeCertification()])} />}>
      <div className="space-y-4">
        {items.map((item, index) => (
          <EntryCard key={item.id} title={`Certification ${index + 1}`} onRemove={() => onChange(items.filter((current) => current.id !== item.id))}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Certification" value={item.name} onChange={(value) => updateItem(item.id, { name: value })} />
              <Field label="Provider" value={item.provider} onChange={(value) => updateItem(item.id, { provider: value })} />
              <Field label="Completion date" value={item.date} onChange={(value) => updateItem(item.id, { date: value })} />
              <Field label="Credential link" type="url" value={item.credentialLink} onChange={(value) => updateItem(item.id, { credentialLink: value })} />
            </div>
          </EntryCard>
        ))}
        {!items.length ? <EmptyEditorState message="Add completed, relevant credentials only." /> : null}
      </div>
    </EditorCard>
  );
}

function AchievementsEditor({
  items,
  onChange,
}: {
  items: ResumeAchievement[];
  onChange: (items: ResumeAchievement[]) => void;
}) {
  const updateItem = (id: string, patch: Partial<ResumeAchievement>) =>
    onChange(items.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  return (
    <EditorCard title="Achievements" action={<AddButton label="Add achievement" onClick={() => onChange([...items, createResumeAchievement()])} />}>
      <div className="space-y-4">
        {items.map((item, index) => (
          <EntryCard key={item.id} title={`Achievement ${index + 1}`} onRemove={() => onChange(items.filter((current) => current.id !== item.id))}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Achievement" value={item.title} onChange={(value) => updateItem(item.id, { title: value })} />
              <Field label="Date" value={item.date} onChange={(value) => updateItem(item.id, { date: value })} />
            </div>
            <div className="mt-4">
              <TextareaField label="Evidence or context" value={item.details} onChange={(value) => updateItem(item.id, { details: value })} rows={3} />
            </div>
          </EntryCard>
        ))}
        {!items.length ? <EmptyEditorState message="Add relevant awards, leadership, competitions, or measurable milestones." /> : null}
      </div>
    </EditorCard>
  );
}

function LinksEditor({
  items,
  onChange,
}: {
  items: ResumeLink[];
  onChange: (items: ResumeLink[]) => void;
}) {
  const updateItem = (id: string, patch: Partial<ResumeLink>) =>
    onChange(items.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  return (
    <EditorCard title="Links" description="LinkedIn and GitHub are included by default." action={<AddButton label="Add link" onClick={() => onChange([...items, createResumeLink()])} />}>
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={item.id} className="grid gap-3 rounded-3xl border border-purple-100 bg-purple-50/40 p-4 sm:grid-cols-[0.4fr_1fr_auto] sm:items-end">
            <Field label="Label" value={item.label} onChange={(value) => updateItem(item.id, { label: value })} />
            <Field label="URL" type="url" value={item.url} onChange={(value) => updateItem(item.id, { url: value })} />
            <RemoveButton label={`Remove link ${index + 1}`} onClick={() => onChange(items.filter((current) => current.id !== item.id))} />
          </div>
        ))}
      </div>
    </EditorCard>
  );
}

function EmptyEditorState({ message }: { message: string }) {
  return (
    <p className="rounded-2xl border border-dashed border-purple-200 bg-purple-50/50 p-4 text-sm font-medium leading-6 text-slate-600">
      {message}
    </p>
  );
}

function ResumeStrengthPanel({
  strength,
}: {
  strength: ReturnType<typeof getResumeStrength>;
}) {
  return (
    <section className="rounded-[2rem] border border-emerald-100 bg-white/85 p-5 shadow-md sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.16em] text-emerald-700">
            Completeness only
          </p>
          <h2 className="mt-1 text-2xl font-black">Resume Strength</h2>
          <p className="mt-2 text-sm text-slate-600">
            This checks filled sections, not ATS approval or job outcomes.
          </p>
        </div>
        <p className="text-3xl font-black text-emerald-700">
          {strength.percentage}%
        </p>
      </div>
      <div className="mt-4 h-3 overflow-hidden rounded-full bg-emerald-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
          style={{ width: `${strength.percentage}%` }}
        />
      </div>
      <ul className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {strength.items.map((item) => (
          <li
            key={item.id}
            className={`flex items-center gap-2 rounded-2xl border p-3 text-sm font-bold ${
              item.complete
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-slate-200 bg-white text-slate-600"
            }`}
          >
            <span
              className={`grid size-5 shrink-0 place-items-center rounded-full ${
                item.complete ? "bg-emerald-600 text-white" : "bg-slate-200"
              }`}
            >
              {item.complete ? <Check size={13} /> : null}
            </span>
            {item.label}
          </li>
        ))}
      </ul>
    </section>
  );
}

function ResumeSuggestionsPanel({
  suggestions,
  resume,
  userName,
  onUseName,
  onAddSkill,
  onAddProject,
  onAddAchievement,
  onAddCertification,
}: {
  suggestions: ResumeSuggestions;
  resume: ResumeDocument;
  userName: string;
  onUseName: () => void;
  onAddSkill: (skill: string) => void;
  onAddProject: (item: ResumeSuggestions["projects"][number]) => void;
  onAddAchievement: (item: ResumeSuggestions["achievements"][number]) => void;
  onAddCertification: (
    item: ResumeSuggestions["certifications"][number],
  ) => void;
}) {
  const hasSuggestions =
    Boolean(userName && !resume.personal.fullName) ||
    suggestions.skills.length > 0 ||
    suggestions.projects.length > 0 ||
    suggestions.achievements.length > 0 ||
    suggestions.certifications.length > 0;

  if (!hasSuggestions) return null;

  return (
    <section className="rounded-[2rem] border border-amber-200 bg-amber-50/80 p-5 shadow-md sm:p-6">
      <div className="flex items-start gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-white text-amber-700 shadow-sm">
          <Sparkles size={20} />
        </span>
        <div>
          <h2 className="text-xl font-black text-amber-950">
            Suggestions from your DataBloom progress
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-700">
            Nothing is inserted automatically. Choose only the evidence you
            want to include, then edit it for the role.
          </p>
        </div>
      </div>
      <div className="mt-5 space-y-4">
        {userName && !resume.personal.fullName ? (
          <SuggestionGroup title="Profile">
            <SuggestionButton label={`Use name: ${userName}`} onClick={onUseName} />
          </SuggestionGroup>
        ) : null}
        {suggestions.skills.length ? (
          <SuggestionGroup title="Completed studio skills">
            {suggestions.skills.map((skill) => (
              <SuggestionButton
                key={skill}
                label={`Add ${skill}`}
                onClick={() => onAddSkill(skill)}
                disabled={resume.skills.some(
                  (current) => current.toLowerCase() === skill.toLowerCase(),
                )}
              />
            ))}
          </SuggestionGroup>
        ) : null}
        {suggestions.projects.length ? (
          <SuggestionGroup title="Completed projects">
            {suggestions.projects.map((project) => (
              <SuggestionButton
                key={project.id}
                label={`Add ${project.name}`}
                onClick={() => onAddProject(project)}
                disabled={resume.projects.some((item) => item.name === project.name)}
              />
            ))}
          </SuggestionGroup>
        ) : null}
        {suggestions.achievements.length ? (
          <SuggestionGroup title="Unlocked achievements">
            {suggestions.achievements.map((achievement) => (
              <SuggestionButton
                key={achievement.id}
                label={`Add ${achievement.title}`}
                onClick={() => onAddAchievement(achievement)}
                disabled={resume.achievements.some(
                  (item) => item.title === achievement.title,
                )}
              />
            ))}
          </SuggestionGroup>
        ) : null}
        {suggestions.certifications.length ? (
          <SuggestionGroup title="Completed certifications">
            {suggestions.certifications.map((certification) => (
              <SuggestionButton
                key={certification.id}
                label={`Add ${certification.name}`}
                onClick={() => onAddCertification(certification)}
                disabled={resume.certifications.some(
                  (item) => item.name === certification.name,
                )}
              />
            ))}
          </SuggestionGroup>
        ) : null}
      </div>
    </section>
  );
}

function SuggestionGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-black uppercase tracking-wider text-amber-900">
        {title}
      </p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function SuggestionButton({
  label,
  onClick,
  disabled = false,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-2xl border border-amber-200 bg-white px-4 py-2 text-sm font-black text-amber-900 disabled:cursor-not-allowed disabled:bg-emerald-50 disabled:text-emerald-700"
    >
      {disabled ? "Added" : label}
    </button>
  );
}

function ResumePreview({
  resume,
  ready,
}: {
  resume: ResumeDocument;
  ready: boolean;
}) {
  if (!ready) {
    return (
      <div className="min-h-[34rem] animate-pulse rounded-[2rem] border border-white bg-white/75 shadow-lg" />
    );
  }

  const hasContent =
    resume.personal.fullName ||
    resume.personal.headline ||
    resume.personal.email ||
    resume.personal.phone ||
    resume.personal.location ||
    resume.summary ||
    resume.skills.some(Boolean) ||
    resume.education.some(
      (item) => item.institution || item.qualification || item.field,
    ) ||
    resume.experience.some(
      (item) => item.organization || item.role || item.bullets,
    ) ||
    resume.projects.some((item) => item.name || item.tools || item.bullets) ||
    resume.certifications.some((item) => item.name || item.provider) ||
    resume.achievements.some((item) => item.title || item.details) ||
    resume.links.some((item) => item.url);

  return (
    <article
      data-resume-preview
      className="min-h-[44rem] overflow-hidden break-words rounded-[2rem] border border-slate-200 bg-white p-6 text-slate-950 shadow-xl sm:p-9"
    >
      <header className="border-b-2 border-slate-900 pb-4 text-center">
        <h2 className="text-3xl font-black tracking-tight">
          {resume.personal.fullName || "Your Name"}
        </h2>
        <p className="mt-1 font-bold text-slate-700">
          {resume.personal.headline || "Professional Headline"}
        </p>
        <p className="mt-2 text-xs leading-5 text-slate-600">
          {[
            resume.personal.email,
            resume.personal.phone,
            resume.personal.location,
          ]
            .filter(Boolean)
            .join(" • ") || "email@example.com • Phone • Location"}
        </p>
        {resume.links.some((link) => link.url) ? (
          <p className="mt-1 text-xs leading-5 text-slate-600">
            {resume.links
              .filter((link) => link.url)
              .map((link) => `${link.label}: ${link.url}`)
              .join(" • ")}
          </p>
        ) : null}
      </header>

      {!hasContent ? (
        <div className="grid min-h-[30rem] place-items-center text-center">
          <div>
            <p className="text-4xl">📄</p>
            <p className="mt-3 font-bold text-slate-700">
              Your ATS-friendly preview will appear here.
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-5 space-y-5">
          {resume.sectionOrder.map((section) => (
            <PreviewSection key={section} resume={resume} section={section} />
          ))}
        </div>
      )}
    </article>
  );
}

function PreviewSection({
  resume,
  section,
}: {
  resume: ResumeDocument;
  section: ResumeSectionId;
}) {
  if (section === "summary") {
    return resume.summary.trim() ? (
      <PreviewBlock title="Professional Summary">
        <p className="text-sm leading-6">{resume.summary}</p>
      </PreviewBlock>
    ) : null;
  }
  if (section === "skills") {
    const skills = resume.skills.filter((skill) => skill.trim());
    return skills.length ? (
      <PreviewBlock title="Skills">
        <p className="text-sm leading-6">{skills.join(" • ")}</p>
      </PreviewBlock>
    ) : null;
  }
  if (section === "experience") {
    const items = resume.experience.filter(
      (item) => item.organization.trim() || item.role.trim(),
    );
    return items.length ? (
      <PreviewBlock title="Experience">
        {items.map((item) => (
          <PreviewDetailedEntry
            key={item.id}
            title={item.role}
            subtitle={[item.organization, item.location].filter(Boolean).join(", ")}
            date={[item.startDate, item.endDate].filter(Boolean).join(" – ")}
            bullets={item.bullets}
          />
        ))}
      </PreviewBlock>
    ) : null;
  }
  if (section === "projects") {
    const items = resume.projects.filter((item) => item.name.trim());
    return items.length ? (
      <PreviewBlock title="Projects">
        {items.map((item) => (
          <PreviewDetailedEntry
            key={item.id}
            title={item.name}
            subtitle={item.tools}
            date={item.link}
            bullets={item.bullets}
          />
        ))}
      </PreviewBlock>
    ) : null;
  }
  if (section === "education") {
    const items = resume.education.filter(
      (item) => item.institution.trim() || item.qualification.trim(),
    );
    return items.length ? (
      <PreviewBlock title="Education">
        {items.map((item) => (
          <PreviewDetailedEntry
            key={item.id}
            title={[item.qualification, item.field].filter(Boolean).join(" in ")}
            subtitle={[item.institution, item.location].filter(Boolean).join(", ")}
            date={[item.startDate, item.endDate].filter(Boolean).join(" – ")}
            bullets={item.details}
          />
        ))}
      </PreviewBlock>
    ) : null;
  }
  if (section === "certifications") {
    const items = resume.certifications.filter((item) => item.name.trim());
    return items.length ? (
      <PreviewBlock title="Certifications">
        {items.map((item) => (
          <PreviewSimpleEntry
            key={item.id}
            title={item.name}
            detail={[item.provider, item.date, item.credentialLink]
              .filter(Boolean)
              .join(" • ")}
          />
        ))}
      </PreviewBlock>
    ) : null;
  }
  if (section === "achievements") {
    const items = resume.achievements.filter((item) => item.title.trim());
    return items.length ? (
      <PreviewBlock title="Achievements">
        {items.map((item) => (
          <PreviewSimpleEntry
            key={item.id}
            title={item.title}
            detail={[item.date, item.details].filter(Boolean).join(" • ")}
          />
        ))}
      </PreviewBlock>
    ) : null;
  }
  return null;
}

function PreviewBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="border-b border-slate-400 pb-1 text-sm font-black uppercase tracking-[0.12em]">
        {title}
      </h3>
      <div className="mt-2 space-y-3">{children}</div>
    </section>
  );
}

function PreviewDetailedEntry({
  title,
  subtitle,
  date,
  bullets,
}: {
  title: string;
  subtitle: string;
  date: string;
  bullets: string;
}) {
  const lines = bullets
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  return (
    <article>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-black">{title}</p>
          {subtitle ? <p className="text-xs font-semibold">{subtitle}</p> : null}
        </div>
        {date ? <p className="text-right text-xs text-slate-600">{date}</p> : null}
      </div>
      {lines.length ? (
        <ul className="mt-1 list-disc space-y-1 pl-5 text-xs leading-5">
          {lines.map((line, index) => (
            <li key={`${index}-${line}`}>{line}</li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}

function PreviewSimpleEntry({
  title,
  detail,
}: {
  title: string;
  detail: string;
}) {
  return (
    <div className="text-sm">
      <span className="font-black">{title}</span>
      {detail ? <span className="text-slate-600"> — {detail}</span> : null}
    </div>
  );
}

function ResumeGuide() {
  const guide = careerGuides.find((item) => item.id === "resume")!;
  const projectExamples = [
    "Analyzed 12 months of sales data in SQL and Power BI, identifying two underperforming regions and presenting inventory recommendations.",
    "Automated a recurring Excel report with Power Query, reducing manual preparation steps and improving refresh consistency.",
    "Built a customer-retention dashboard with documented metric definitions, data-quality checks, and stakeholder-focused insights.",
  ];

  return (
    <section className="space-y-6">
      <header className="rounded-[2rem] border border-white bg-gradient-to-br from-purple-100 via-white to-pink-100 p-7 shadow-lg">
        <div className="flex items-start gap-4">
          <span className="text-5xl">{guide.icon}</span>
          <div>
            <p className="text-sm font-black uppercase tracking-[0.16em] text-purple-700">
              Practical guidance
            </p>
            <h2 className="mt-1 text-3xl font-black">{guide.title}</h2>
            <p className="mt-2 max-w-3xl leading-7 text-slate-700">
              {guide.intro} This guidance improves clarity and completeness; it
              does not guarantee ATS approval or hiring outcomes.
            </p>
          </div>
        </div>
      </header>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {guide.sections.map((section) => (
          <article
            key={section.title}
            className="rounded-[2rem] border border-purple-100 bg-white/85 p-6 shadow-md"
          >
            <h3 className="text-xl font-black text-purple-950">
              {section.title}
            </h3>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700">
              {section.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </article>
        ))}
        <article className="rounded-[2rem] border border-amber-200 bg-amber-50/80 p-6 shadow-md">
          <h3 className="flex items-center gap-2 text-xl font-black text-amber-950">
            <Lightbulb size={20} />
            Project bullet examples
          </h3>
          <ul className="mt-4 list-disc space-y-3 pl-5 text-sm leading-6 text-slate-700">
            {projectExamples.map((example) => (
              <li key={example}>{example}</li>
            ))}
          </ul>
        </article>
      </div>

      <article className="rounded-[2rem] border border-emerald-100 bg-white/85 p-6 shadow-md">
        <h3 className="text-2xl font-black">Final resume checklist</h3>
        <p className="mt-2 text-sm text-slate-600">
          Use the Career Hub checklist to track these items and earn its
          existing one-time progress rewards.
        </p>
        <ul className="mt-5 grid gap-3 md:grid-cols-2">
          {guide.checklist.map((item) => (
            <li
              key={item.id}
              className="flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 text-sm font-semibold leading-6 text-slate-700"
            >
              <Check className="mt-0.5 shrink-0 text-emerald-700" size={17} />
              {item.label}
            </li>
          ))}
        </ul>
        <Link
          href="/career-hub"
          className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-2xl border border-purple-200 bg-purple-50 px-5 font-black text-purple-800"
        >
          Open Career Hub checklist
        </Link>
      </article>
    </section>
  );
}
