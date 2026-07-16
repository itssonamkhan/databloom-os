"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Circle,
  Clock3,
  Edit3,
  Plus,
  Repeat2,
  Search,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";

import { useProgress } from "@/context/ProgressContext";
import {
  createPlannerTask,
  deletePlannerTask,
  getPlannerModuleHref,
  getPlannerSummary,
  loadPlannerState,
  localDateKey,
  PLANNER_EVENT,
  plannerModules,
  plannerPriorities,
  plannerRecurrences,
  setPlannerTaskCompletion,
  updatePlannerTask,
  type PlannerPriority,
  type PlannerRecurrence,
  type PlannerState,
  type PlannerTask,
  type PlannerTaskInput,
} from "@/lib/planner";
import { playClickSound, playSuccessSound, playXPSound } from "@/lib/sounds";
import { registerStudyActivity } from "@/lib/studyActivity";

type View = "Today" | "Upcoming" | "Completed";
type StatusFilter = "All" | "Open" | "Completed";

const emptyState: PlannerState = { version: 1, tasks: [], rewardedMilestones: [] };
const emptyForm = (): PlannerTaskInput => ({
  title: "",
  description: "",
  dueDate: localDateKey(),
  dueTime: "",
  priority: "Medium",
  relatedModule: "General Study",
  recurrence: "None",
});

const fieldClass =
  "min-h-12 w-full rounded-2xl border border-purple-200 bg-white/90 px-4 text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-200";

export default function PlannerStudio() {
  const { addXP } = useProgress();
  const [state, setState] = useState<PlannerState>(emptyState);
  const [hydrated, setHydrated] = useState(false);
  const [view, setView] = useState<View>("Today");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("All");
  const [priority, setPriority] = useState<PlannerPriority | "All">("All");
  const [module, setModule] = useState<PlannerTask["relatedModule"] | "All">("All");
  const [form, setForm] = useState<PlannerTaskInput>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  useEffect(() => {
    const sync = () => {
      setState(loadPlannerState());
      setHydrated(true);
    };
    sync();
    window.addEventListener(PLANNER_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(PLANNER_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const summary = useMemo(() => getPlannerSummary(state), [state]);
  const today = localDateKey();
  const filteredTasks = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return state.tasks
      .filter((task) => {
        const matchesView =
          view === "Completed"
            ? task.completed
            : view === "Upcoming"
              ? !task.completed && task.dueDate > today
              : !task.completed && (!task.dueDate || task.dueDate <= today);
        const matchesQuery =
          !normalized ||
          [task.title, task.description, task.relatedModule].some((value) =>
            value.toLowerCase().includes(normalized),
          );
        const matchesStatus =
          status === "All" ||
          (status === "Completed" ? task.completed : !task.completed);
        return (
          matchesView &&
          matchesQuery &&
          matchesStatus &&
          (priority === "All" || task.priority === priority) &&
          (module === "All" || task.relatedModule === module)
        );
      })
      .sort((left, right) => {
        const leftDue = `${left.dueDate || "9999-12-31"}T${left.dueTime || "23:59"}`;
        const rightDue = `${right.dueDate || "9999-12-31"}T${right.dueTime || "23:59"}`;
        return leftDue.localeCompare(rightDue);
      });
  }, [module, priority, query, state.tasks, status, today, view]);

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm());
    setFormOpen(false);
  }

  function submitTask(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.title.trim()) return;
    playClickSound();
    setState(
      editingId
        ? updatePlannerTask(editingId, form)
        : createPlannerTask(form),
    );
    playSuccessSound();
    resetForm();
  }

  function editTask(task: PlannerTask) {
    playClickSound();
    setEditingId(task.id);
    setForm({
      title: task.title,
      description: task.description,
      dueDate: task.dueDate,
      dueTime: task.dueTime,
      priority: task.priority,
      relatedModule: task.relatedModule,
      recurrence: task.recurrence,
    });
    setFormOpen(true);
  }

  function removeTask(task: PlannerTask) {
    if (!window.confirm(`Delete “${task.title}”? This cannot be undone.`)) return;
    playClickSound();
    setState(deletePlannerTask(task.id));
  }

  function toggleTask(task: PlannerTask) {
    playClickSound();
    const result = setPlannerTaskCompletion(task.id, !task.completed);
    setState(result.state);
    if (!result.firstCompletion) return;

    registerStudyActivity({
      kind: "task",
      source: `planner:${task.id}`,
      xp: result.xpAward,
    });
    if (result.xpAward > 0) {
      addXP(result.xpAward);
      playXPSound();
    } else {
      playSuccessSound();
    }
  }

  if (!hydrated) {
    return <div className="grid min-h-[55vh] place-items-center font-black text-purple-800">Loading your planner…</div>;
  }

  return (
    <div className="space-y-7 text-slate-950">
      <header className="rounded-[2rem] border border-white/90 bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 p-7 shadow-lg sm:p-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/85 px-4 py-2 text-sm font-black text-purple-800"><Sparkles size={17} /> Your real study plan</p>
            <h1 className="mt-4 text-4xl font-black text-purple-900 sm:text-5xl">🗓️ Smart Planner</h1>
            <p className="mt-3 text-lg leading-8 text-slate-700">Plan meaningful study work, keep due dates honest, and continue directly into the related Studio.</p>
          </div>
          <button type="button" onClick={() => { playClickSound(); setFormOpen(true); }} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-purple-700 px-6 font-black text-white shadow-md transition hover:bg-purple-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-700"><Plus size={19} /> Create task</button>
        </div>
      </header>

      <section aria-label="Planner summary" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <SummaryCard label="All tasks" value={summary.total} tone="purple" />
        <SummaryCard label="Due today" value={summary.today} tone="pink" />
        <SummaryCard label="Upcoming" value={summary.upcoming} tone="blue" />
        <SummaryCard label="Completed" value={summary.completed} tone="green" />
        <SummaryCard label="Real progress" value={`${summary.progressPercentage}%`} tone="amber" />
      </section>

      {formOpen ? (
        <form onSubmit={submitTask} className="rounded-[2rem] border border-purple-200 bg-white/85 p-6 shadow-lg backdrop-blur-xl sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <div><p className="text-sm font-black uppercase tracking-[0.14em] text-purple-700">{editingId ? "Update plan" : "New plan"}</p><h2 className="mt-1 text-2xl font-black">{editingId ? "Edit study task" : "Create a study task"}</h2></div>
            <button type="button" onClick={resetForm} aria-label="Close task form" className="grid size-11 place-items-center rounded-2xl bg-slate-100 text-slate-700 focus-visible:outline-2 focus-visible:outline-purple-600"><X size={19} /></button>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <Field label="Task title" required value={form.title} onChange={(title) => setForm((current) => ({ ...current, title }))} placeholder="Complete the SQL joins lesson" />
            <Field label="Due date" type="date" value={form.dueDate} onChange={(dueDate) => setForm((current) => ({ ...current, dueDate }))} />
            <Field label="Due time (optional)" type="time" value={form.dueTime} onChange={(dueTime) => setForm((current) => ({ ...current, dueTime }))} />
            <SelectField label="Priority" value={form.priority} options={plannerPriorities} onChange={(value) => setForm((current) => ({ ...current, priority: value as PlannerPriority }))} />
            <SelectField label="Related Studio or module" value={form.relatedModule} options={plannerModules.map((item) => item.label)} onChange={(value) => setForm((current) => ({ ...current, relatedModule: value as PlannerTask["relatedModule"] }))} />
            <SelectField label="Repeat" value={form.recurrence} options={plannerRecurrences} onChange={(value) => setForm((current) => ({ ...current, recurrence: value as PlannerRecurrence }))} />
            <label className="md:col-span-2 xl:col-span-3"><span className="mb-1.5 block text-sm font-black text-slate-700">Description (optional)</span><textarea rows={3} value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} placeholder="Add a small outcome or reminder…" className={`${fieldClass} min-h-28 py-3`} /></label>
          </div>
          <div className="mt-5 flex flex-wrap gap-3"><button type="submit" className="min-h-12 rounded-2xl bg-purple-700 px-6 font-black text-white hover:bg-purple-800">{editingId ? "Save changes" : "Add task"}</button><button type="button" onClick={resetForm} className="min-h-12 rounded-2xl border border-slate-300 bg-white px-6 font-black text-slate-700">Cancel</button></div>
        </form>
      ) : null}

      <section className="rounded-[2rem] border border-purple-100 bg-white/75 p-5 shadow-lg backdrop-blur-xl sm:p-7">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Planner views">
          {(["Today", "Upcoming", "Completed"] as View[]).map((item) => <button key={item} type="button" role="tab" aria-selected={view === item} onClick={() => setView(item)} className={`min-h-11 rounded-2xl px-5 font-black transition focus-visible:outline-2 focus-visible:outline-purple-600 ${view === item ? "bg-purple-700 text-white" : "bg-purple-50 text-purple-800 hover:bg-purple-100"}`}>{item}</button>)}
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <label className="relative"><span className="sr-only">Search planner tasks</span><Search className="absolute left-4 top-3.5 text-purple-500" size={18} /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tasks" className={`${fieldClass} pl-11`} /></label>
          <SelectField label="Status" compact value={status} options={["All", "Open", "Completed"]} onChange={(value) => setStatus(value as StatusFilter)} />
          <SelectField label="Priority" compact value={priority} options={["All", ...plannerPriorities]} onChange={(value) => setPriority(value as PlannerPriority | "All")} />
          <SelectField label="Studio" compact value={module} options={["All", ...plannerModules.map((item) => item.label)]} onChange={(value) => setModule(value as PlannerTask["relatedModule"] | "All")} />
        </div>

        {filteredTasks.length ? (
          <div className="mt-6 space-y-4">{filteredTasks.map((task) => <TaskCard key={task.id} task={task} onToggle={() => toggleTask(task)} onEdit={() => editTask(task)} onDelete={() => removeTask(task)} />)}</div>
        ) : (
          <div className="mt-6 rounded-3xl border border-dashed border-purple-300 bg-purple-50/70 p-10 text-center"><span className="text-5xl" aria-hidden="true">{view === "Completed" ? "🌸" : view === "Upcoming" ? "🗓️" : "✨"}</span><h2 className="mt-4 text-xl font-black">{state.tasks.length ? "No tasks match this view" : "Your planner is ready to bloom"}</h2><p className="mt-2 text-slate-600">{state.tasks.length ? "Adjust the search or filters to see more tasks." : "Create a real study task—your statistics will stay empty until you do."}</p>{!state.tasks.length ? <button type="button" onClick={() => setFormOpen(true)} className="mt-5 rounded-2xl bg-purple-700 px-5 py-3 font-black text-white">Create your first task</button> : null}</div>
        )}
      </section>
    </div>
  );
}

function TaskCard({ task, onToggle, onEdit, onDelete }: { task: PlannerTask; onToggle: () => void; onEdit: () => void; onDelete: () => void }) {
  const overdue = !task.completed && task.dueDate && task.dueDate < localDateKey();
  const priorityTone = task.priority === "High" ? "bg-rose-50 text-rose-800 border-rose-200" : task.priority === "Medium" ? "bg-amber-50 text-amber-800 border-amber-200" : "bg-emerald-50 text-emerald-800 border-emerald-200";
  return <article className={`rounded-3xl border p-5 shadow-sm transition sm:p-6 ${task.completed ? "border-emerald-200 bg-emerald-50/60" : "border-purple-100 bg-white"}`}><div className="flex flex-col gap-4 sm:flex-row sm:items-start"><button type="button" onClick={onToggle} aria-label={task.completed ? `Mark ${task.title} incomplete` : `Complete ${task.title}`} className="grid size-11 shrink-0 place-items-center rounded-2xl bg-purple-50 text-purple-700 focus-visible:outline-2 focus-visible:outline-purple-600">{task.completed ? <CheckCircle2 size={23} /> : <Circle size={23} />}</button><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className={`rounded-full border px-3 py-1 text-xs font-black ${priorityTone}`}>{task.priority}</span><span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-black text-purple-800">{task.relatedModule}</span>{task.recurrence !== "None" ? <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-3 py-1 text-xs font-black text-sky-800"><Repeat2 size={13} /> {task.recurrence}</span> : null}{overdue ? <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-black text-rose-800">Overdue</span> : null}</div><h3 className={`mt-3 text-xl font-black ${task.completed ? "text-slate-600 line-through" : "text-slate-950"}`}>{task.title}</h3>{task.description ? <p className="mt-2 leading-6 text-slate-600">{task.description}</p> : null}<div className="mt-3 flex flex-wrap gap-3 text-sm font-bold text-slate-600">{task.dueDate ? <span className="inline-flex items-center gap-1.5"><CalendarDays size={16} /> {task.dueDate}</span> : <span>No due date</span>}{task.dueTime ? <span className="inline-flex items-center gap-1.5"><Clock3 size={16} /> {task.dueTime}</span> : null}<Link href={getPlannerModuleHref(task.relatedModule)} className="font-black text-purple-800 hover:underline">Open {task.relatedModule} →</Link></div></div><div className="flex shrink-0 gap-2"><button type="button" onClick={onEdit} aria-label={`Edit ${task.title}`} className="grid size-10 place-items-center rounded-xl bg-sky-50 text-sky-800 focus-visible:outline-2 focus-visible:outline-sky-600"><Edit3 size={17} /></button><button type="button" onClick={onDelete} aria-label={`Delete ${task.title}`} className="grid size-10 place-items-center rounded-xl bg-rose-50 text-rose-800 focus-visible:outline-2 focus-visible:outline-rose-600"><Trash2 size={17} /></button></div></div></article>;
}

function SummaryCard({ label, value, tone }: { label: string; value: string | number; tone: "purple" | "pink" | "blue" | "green" | "amber" }) {
  const tones = { purple: "from-purple-50 to-violet-50 text-purple-800", pink: "from-pink-50 to-rose-50 text-pink-800", blue: "from-sky-50 to-blue-50 text-blue-800", green: "from-emerald-50 to-lime-50 text-emerald-800", amber: "from-amber-50 to-yellow-50 text-amber-800" };
  return <article className={`rounded-3xl border border-white bg-gradient-to-br p-5 shadow-md ${tones[tone]}`}><p className="text-sm font-black uppercase tracking-[0.12em] text-slate-600">{label}</p><p className="mt-2 text-3xl font-black">{value}</p></article>;
}

function Field({ label, value, onChange, type = "text", required = false, placeholder = "" }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean; placeholder?: string }) {
  return <label><span className="mb-1.5 block text-sm font-black text-slate-700">{label}</span><input type={type} required={required} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className={fieldClass} /></label>;
}

function SelectField({ label, value, options, onChange, compact = false }: { label: string; value: string; options: readonly string[]; onChange: (value: string) => void; compact?: boolean }) {
  return <label><span className={compact ? "sr-only" : "mb-1.5 block text-sm font-black text-slate-700"}>{label}</span><select aria-label={compact ? label : undefined} value={value} onChange={(event) => onChange(event.target.value)} className={fieldClass}>{options.map((option) => <option key={option}>{option}</option>)}</select></label>;
}
