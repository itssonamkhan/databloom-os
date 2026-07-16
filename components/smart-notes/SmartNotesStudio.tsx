"use client";

import {
  Archive,
  ArrowLeft,
  BookOpen,
  Check,
  ChevronRight,
  Code2,
  FileText,
  FolderPlus,
  Heart,
  List,
  ListChecks,
  ListOrdered,
  Pin,
  Plus,
  Quote,
  Search,
  Sparkles,
  Table2,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import AppLayout from "@/components/layout/AppLayout";
import { useProgress } from "@/context/ProgressContext";
import { playClickSound, playSuccessSound, playXPSound } from "@/lib/sounds";
import {
  createSmartNote,
  createStudyCollection,
  deleteStudyCollection,
  getSmartNotesSummary,
  loadSmartNotesState,
  noteTemplates,
  permanentlyDeleteSmartNote,
  rememberSmartNotesSearch,
  toggleSmartNoteCompleted,
  updateSmartNote,
  viewSmartNote,
  type SmartNote,
  type SmartNotesState,
} from "@/lib/smartNotes";
import { incrementStats } from "@/lib/stats";
import { registerStudyDay } from "@/lib/streak";

type View = "home" | "editor" | "collections" | "trash";

const inputClass = "min-h-11 w-full rounded-2xl border border-purple-100 bg-white/90 px-4 text-sm font-semibold text-slate-800 outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-200";
const buttonFocus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-700";

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Recently" : date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: date.getFullYear() === new Date().getFullYear() ? undefined : "numeric" });
}

function isToday(value: string) {
  const date = new Date(value);
  const today = new Date();
  return date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth() && date.getDate() === today.getDate();
}

function words(value: string) {
  return value.trim() ? value.trim().split(/\s+/).length : 0;
}

export default function SmartNotesStudio() {
  const { addXP } = useProgress();
  const [state, setState] = useState<SmartNotesState>(loadSmartNotesState);
  const [view, setView] = useState<View>("home");
  const [activeId, setActiveId] = useState<string | null>(() => loadSmartNotesState().activeNoteId);
  const [showTemplates, setShowTemplates] = useState(false);
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState("All");
  const [tag, setTag] = useState("All");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [includeArchived, setIncludeArchived] = useState(false);
  const [collectionName, setCollectionName] = useState("");
  const [collectionDescription, setCollectionDescription] = useState("");
  const [notice, setNotice] = useState("");

  const activeNote = state.notes.find((note) => note.id === activeId) ?? null;
  const liveNotes = state.notes.filter((note) => !note.trashed);
  const summary = getSmartNotesSummary(state);
  const subjects = useMemo(() => Array.from(new Set(liveNotes.map((note) => note.subject).filter(Boolean))).sort(), [liveNotes]);
  const tags = useMemo(() => Array.from(new Set(liveNotes.flatMap((note) => note.tags))).sort(), [liveNotes]);

  const filteredNotes = useMemo(() => {
    const search = query.trim().toLowerCase();
    return liveNotes.filter((note) => {
      const haystack = [note.title, note.content, note.category, note.subject, ...note.tags].join(" ").toLowerCase();
      return (!search || haystack.includes(search)) && (subject === "All" || note.subject === subject) && (tag === "All" || note.tags.includes(tag)) && (!favoritesOnly || note.favorite) && (includeArchived ? note.archived : !note.archived);
    }).sort((left, right) => Number(right.pinned) - Number(left.pinned) || right.updatedAt.localeCompare(left.updatedAt));
  }, [favoritesOnly, includeArchived, liveNotes, query, subject, tag]);

  function awardXP(amount: number, message: string) {
    if (!amount) return;
    addXP(amount);
    incrementStats(0, 0, amount, 0);
    registerStudyDay();
    playXPSound();
    setNotice(`${message} +${amount} XP`);
  }

  function openNote(id: string) {
    playClickSound();
    const result = viewSmartNote(id);
    setState(result.state);
    setActiveId(id);
    setView("editor");
  }

  function handleCreate(templateId: string) {
    const result = createSmartNote(templateId);
    setState(result.state);
    setActiveId(result.note.id);
    setShowTemplates(false);
    setView("editor");
    playSuccessSound();
    awardXP(result.xpAward, "First note created!");
  }

  function handleNotePatch(id: string, patch: Partial<SmartNote>) {
    const result = updateSmartNote(id, patch);
    setState(result.state);
  }

  function handleComplete(id: string) {
    const result = toggleSmartNoteCompleted(id);
    setState(result.state);
    if (result.completed) playSuccessSound();
    awardXP(result.xpAward, "First note completed!");
  }

  function handleCollectionCreate(event: React.FormEvent) {
    event.preventDefault();
    const result = createStudyCollection(collectionName, collectionDescription);
    if (!result.collection) return;
    setState(result.state);
    setCollectionName("");
    setCollectionDescription("");
    playSuccessSound();
    awardXP(result.xpAward, "First collection created!");
  }

  function handleSearchSubmit(event: React.FormEvent) {
    event.preventDefault();
    const next = rememberSmartNotesSearch(query);
    setState(next);
  }

  function goHome() {
    setView("home");
    setActiveId(null);
  }

  return (
    <AppLayout>
      <div className="min-w-0 space-y-7 overflow-x-hidden">
        <header className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-gradient-to-br from-violet-100 via-pink-100 to-sky-100 p-6 shadow-lg sm:p-8">
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-white/75 px-4 py-2 text-sm font-black text-purple-800"><Sparkles size={16} /> Your thinking garden</p>
              <h1 className="mt-4 text-4xl font-black tracking-tight text-purple-800 sm:text-5xl">📝 Smart Notes Studio</h1>
              <p className="mt-3 max-w-2xl text-base font-medium leading-7 text-slate-700 sm:text-lg">Capture lessons, ideas, projects, and interview prep in one searchable workspace.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              {view !== "home" ? <button type="button" onClick={goHome} className={`inline-flex min-h-12 items-center gap-2 rounded-2xl bg-white/80 px-5 font-black text-purple-800 shadow-sm ${buttonFocus}`}><ArrowLeft size={18} /> Notes home</button> : null}
              <button type="button" onClick={() => setView("collections")} className={`inline-flex min-h-12 items-center gap-2 rounded-2xl border border-white bg-white/75 px-5 font-black text-emerald-800 shadow-sm ${buttonFocus}`}><BookOpen size={18} /> Collections</button>
              <button type="button" onClick={() => setShowTemplates(true)} className={`inline-flex min-h-12 items-center gap-2 rounded-2xl bg-purple-700 px-5 font-black text-white shadow-md transition hover:bg-purple-800 ${buttonFocus}`}><Plus size={18} /> Create note</button>
            </div>
          </div>
        </header>

        <p className="sr-only" aria-live="polite">{notice}</p>

        {showTemplates ? <TemplatePicker onChoose={handleCreate} onClose={() => setShowTemplates(false)} /> : null}
        {view === "editor" && activeNote ? (
          <NoteEditor key={activeNote.id} note={activeNote} collections={state.collections} onSaved={setState} onAction={handleNotePatch} onComplete={handleComplete} onBack={goHome} />
        ) : view === "collections" ? (
          <CollectionsView state={state} name={collectionName} description={collectionDescription} onName={setCollectionName} onDescription={setCollectionDescription} onSubmit={handleCollectionCreate} onOpen={openNote} onDelete={(id) => setState(deleteStudyCollection(id).state)} />
        ) : view === "trash" ? (
          <TrashView notes={state.notes.filter((note) => note.trashed)} onRestore={(note) => handleNotePatch(note.id, { trashed: false })} onDelete={(id) => { if (window.confirm("Delete this note permanently? This cannot be undone.")) setState(permanentlyDeleteSmartNote(id).state); }} />
        ) : (
          <NotesHome
            state={state}
            summary={summary}
            filteredNotes={filteredNotes}
            query={query}
            subject={subject}
            tag={tag}
            favoritesOnly={favoritesOnly}
            includeArchived={includeArchived}
            subjects={subjects}
            tags={tags}
            onQuery={setQuery}
            onSubject={setSubject}
            onTag={setTag}
            onFavorites={setFavoritesOnly}
            onArchived={setIncludeArchived}
            onSearchSubmit={handleSearchSubmit}
            onOpen={openNote}
            onPatch={handleNotePatch}
            onTrash={() => setView("trash")}
            onRecentSearch={setQuery}
          />
        )}
      </div>
    </AppLayout>
  );
}

function TemplatePicker({ onChoose, onClose }: { onChoose: (id: string) => void; onClose: () => void }) {
  return (
    <section aria-labelledby="template-heading" className="rounded-[2rem] border border-purple-100 bg-white/90 p-6 shadow-lg">
      <div className="flex items-start justify-between gap-4"><div><p className="text-sm font-black uppercase tracking-wider text-purple-500">Start with a structure</p><h2 id="template-heading" className="mt-1 text-2xl font-black text-slate-900">Choose a note template</h2></div><button type="button" onClick={onClose} className={`rounded-xl px-3 py-2 font-bold text-slate-600 hover:bg-slate-100 ${buttonFocus}`}>Close</button></div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {noteTemplates.map((template) => <button key={template.id} type="button" onClick={() => onChoose(template.id)} className={`min-h-36 rounded-3xl border border-purple-100 bg-gradient-to-br from-white to-purple-50 p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md ${buttonFocus}`}><span className="text-3xl">{template.icon}</span><span className="mt-3 block text-lg font-black text-purple-800">{template.name}</span><span className="mt-1 block text-sm leading-6 text-slate-600">{template.description}</span></button>)}
      </div>
    </section>
  );
}

function NotesHome({ state, summary, filteredNotes, query, subject, tag, favoritesOnly, includeArchived, subjects, tags, onQuery, onSubject, onTag, onFavorites, onArchived, onSearchSubmit, onOpen, onPatch, onTrash, onRecentSearch }: {
  state: SmartNotesState; summary: ReturnType<typeof getSmartNotesSummary>; filteredNotes: SmartNote[]; query: string; subject: string; tag: string; favoritesOnly: boolean; includeArchived: boolean; subjects: string[]; tags: string[];
  onQuery: (value: string) => void; onSubject: (value: string) => void; onTag: (value: string) => void; onFavorites: (value: boolean) => void; onArchived: (value: boolean) => void; onSearchSubmit: (event: React.FormEvent) => void; onOpen: (id: string) => void; onPatch: (id: string, patch: Partial<SmartNote>) => void; onTrash: () => void; onRecentSearch: (value: string) => void;
}) {
  const live = state.notes.filter((note) => !note.trashed);
  const continueNote = [...live].filter((note) => !note.completed && !note.archived).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
  const recent = [...live].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 4);
  const recentlyViewed = [...live].sort((a, b) => b.lastViewedAt.localeCompare(a.lastViewedAt)).slice(0, 4);
  const recentlyCreated = [...live].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 4);
  const today = live.filter((note) => isToday(note.createdAt)).slice(0, 4);
  const favorites = live.filter((note) => note.favorite).slice(0, 4);
  const pinned = live.filter((note) => note.pinned).slice(0, 4);
  return (
    <>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5" aria-label="Notes summary">
        <SummaryCard icon="📝" label="Notes created" value={summary.notesCreated} />
        <SummaryCard icon="✅" label="Completed" value={summary.notesCompleted} />
        <SummaryCard icon="⏱️" label="Writing time" value={`${summary.writingMinutes} min`} />
        <SummaryCard icon="📚" label="Collections" value={summary.collections} />
        <SummaryCard icon="❤️" label="Favorites" value={summary.favorites} />
      </section>

      {continueNote ? <section className="rounded-[2rem] border border-white bg-gradient-to-r from-purple-100 via-pink-50 to-sky-100 p-6 shadow-md"><p className="text-sm font-black uppercase tracking-wider text-purple-500">Continue writing</p><div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-2xl font-black text-purple-900">{continueNote.title}</h2><p className="mt-1 text-sm font-medium text-slate-600">Last edited {formatDate(continueNote.updatedAt)} · {words(continueNote.content)} words</p></div><button type="button" onClick={() => onOpen(continueNote.id)} className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-purple-700 px-5 font-black text-white ${buttonFocus}`}>Open note <ChevronRight size={18} /></button></div></section> : null}

      <section aria-labelledby="search-notes-heading" className="rounded-[2rem] border border-white/90 bg-white/80 p-5 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 id="search-notes-heading" className="text-2xl font-black text-slate-900">Find your notes</h2><p className="text-sm text-slate-600">Search every title, paragraph, subject, category, and tag.</p></div><button type="button" onClick={onTrash} className={`inline-flex min-h-11 items-center gap-2 rounded-2xl border border-rose-100 bg-rose-50 px-4 font-bold text-rose-700 ${buttonFocus}`}><Trash2 size={17} /> Trash ({state.notes.filter((note) => note.trashed).length})</button></div>
        <form onSubmit={onSearchSubmit} className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1.7fr)_1fr_1fr]">
          <label className="relative"><span className="sr-only">Search notes</span><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-500" size={18} /><input type="search" value={query} onChange={(event) => onQuery(event.target.value)} placeholder="Search notes…" className={`${inputClass} pl-11`} /></label>
          <label><span className="sr-only">Filter by subject</span><select value={subject} onChange={(event) => onSubject(event.target.value)} className={inputClass}><option>All</option>{subjects.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label><span className="sr-only">Filter by tag</span><select value={tag} onChange={(event) => onTag(event.target.value)} className={inputClass}><option>All</option>{tags.map((item) => <option key={item}>{item}</option>)}</select></label>
          <div className="flex flex-wrap gap-3 lg:col-span-3"><Toggle checked={favoritesOnly} onChange={onFavorites} label="Favorites only" /><Toggle checked={includeArchived} onChange={onArchived} label="Show archived" /><button type="submit" className={`min-h-11 rounded-2xl bg-purple-700 px-5 font-black text-white ${buttonFocus}`}>Save search</button></div>
        </form>
        {state.recentSearches.length ? <div className="mt-4 flex flex-wrap items-center gap-2"><span className="text-xs font-black uppercase tracking-wider text-slate-500">Recent searches</span>{state.recentSearches.map((item) => <button key={item} type="button" onClick={() => onRecentSearch(item)} className={`rounded-full bg-purple-50 px-3 py-1.5 text-xs font-bold text-purple-700 ${buttonFocus}`}>{item}</button>)}</div> : null}
      </section>

      <NoteSection title="Your note library" description={`${filteredNotes.length} matching note${filteredNotes.length === 1 ? "" : "s"}`} notes={filteredNotes} onOpen={onOpen} onPatch={onPatch} empty="No notes match these filters. Try another search or create a fresh note." />
      <div className="grid gap-6 xl:grid-cols-2"><NoteSection title="Recent notes" description="Last edited" notes={recent} onOpen={onOpen} onPatch={onPatch} empty="Your recently edited notes will appear here." /><NoteSection title="Today's notes" description="Created today" notes={today} onOpen={onOpen} onPatch={onPatch} empty="No notes created today yet." /></div>
      <div className="grid gap-6 xl:grid-cols-2"><NoteSection title="Favorite notes" description="Saved for quick access" notes={favorites} onOpen={onOpen} onPatch={onPatch} empty="Favorite a note to keep it close." /><NoteSection title="Pinned notes" description="Always near the top" notes={pinned} onOpen={onOpen} onPatch={onPatch} empty="Pin your most important notes." /></div>
      <section className="rounded-[2rem] border border-white/90 bg-white/70 p-5 shadow-sm" aria-labelledby="recent-activity-heading">
        <h2 id="recent-activity-heading" className="text-2xl font-black text-slate-900">Recent activity</h2>
        <p className="text-sm text-slate-600">Pick up where your thinking last moved.</p>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <ActivityColumn title="Last edited" notes={recent} onOpen={onOpen} empty="No edits yet." />
          <ActivityColumn title="Recently viewed" notes={recentlyViewed} onOpen={onOpen} empty="Viewed notes appear here." />
          <ActivityColumn title="Recently created" notes={recentlyCreated} onOpen={onOpen} empty="Created notes appear here." />
        </div>
      </section>
      <section className="rounded-[2rem] border border-white bg-gradient-to-br from-emerald-50 to-sky-50 p-6 shadow-sm"><p className="text-sm font-black uppercase tracking-wider text-emerald-600">Study collections</p><h2 className="mt-1 text-2xl font-black text-slate-900">Group notes into focused study sets</h2><p className="mt-2 text-sm text-slate-600">{state.collections.length ? `${state.collections.length} collection${state.collections.length === 1 ? "" : "s"} ready` : "Create your first collection for a course, interview, or project."}</p></section>
    </>
  );
}

function NoteSection({ title, description, notes, onOpen, onPatch, empty }: { title: string; description: string; notes: SmartNote[]; onOpen: (id: string) => void; onPatch: (id: string, patch: Partial<SmartNote>) => void; empty: string }) {
  return <section className="rounded-[2rem] border border-white/90 bg-white/70 p-5 shadow-sm"><div><h2 className="text-2xl font-black text-slate-900">{title}</h2><p className="text-sm text-slate-600">{description}</p></div>{notes.length ? <div className="mt-4 grid gap-4 sm:grid-cols-2"><>{notes.map((note) => <NoteCard key={note.id} note={note} onOpen={onOpen} onPatch={onPatch} />)}</></div> : <div className="mt-4 rounded-3xl border border-dashed border-purple-200 bg-purple-50/50 p-7 text-center text-sm font-medium text-slate-600">{empty}</div>}</section>;
}

function NoteCard({ note, onOpen, onPatch }: { note: SmartNote; onOpen: (id: string) => void; onPatch: (id: string, patch: Partial<SmartNote>) => void }) {
  return <article className="group min-w-0 rounded-3xl border border-purple-100 bg-gradient-to-br from-white to-pink-50 p-4 shadow-sm"><div className="flex items-start justify-between gap-2"><button type="button" onClick={() => onOpen(note.id)} className={`min-w-0 flex-1 text-left ${buttonFocus}`}><span className="block truncate text-lg font-black text-purple-900">{note.title || "Untitled note"}</span><span className="mt-1 block text-xs font-bold text-slate-500">{note.subject} · {formatDate(note.updatedAt)}</span></button><div className="flex gap-1"><IconButton label={note.favorite ? "Remove favorite" : "Favorite note"} active={note.favorite} onClick={() => onPatch(note.id, { favorite: !note.favorite })}><Heart size={16} fill={note.favorite ? "currentColor" : "none"} /></IconButton><IconButton label={note.pinned ? "Unpin note" : "Pin note"} active={note.pinned} onClick={() => onPatch(note.id, { pinned: !note.pinned })}><Pin size={16} fill={note.pinned ? "currentColor" : "none"} /></IconButton></div></div><button type="button" onClick={() => onOpen(note.id)} className={`mt-4 block w-full text-left ${buttonFocus}`}><span className="line-clamp-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">{note.content || "A clean page waiting for your ideas."}</span><span className="mt-4 inline-flex items-center gap-1 text-xs font-black text-purple-700">Open note <ChevronRight size={14} /></span></button></article>;
}

function ActivityColumn({ title, notes, onOpen, empty }: { title: string; notes: SmartNote[]; onOpen: (id: string) => void; empty: string }) {
  return <div className="rounded-3xl bg-gradient-to-br from-purple-50 to-sky-50 p-4"><h3 className="font-black text-purple-900">{title}</h3><div className="mt-3 space-y-2">{notes.length ? notes.slice(0, 3).map((note) => <button key={note.id} type="button" onClick={() => onOpen(note.id)} className={`flex min-h-11 w-full items-center justify-between gap-3 rounded-2xl bg-white/85 px-4 text-left text-sm font-bold text-slate-700 shadow-sm ${buttonFocus}`}><span className="truncate">{note.title}</span><ChevronRight size={15} className="shrink-0 text-purple-600" /></button>) : <p className="rounded-2xl border border-dashed border-purple-200 p-4 text-sm text-slate-500">{empty}</p>}</div></div>;
}

function NoteEditor({ note, collections, onSaved, onAction, onComplete, onBack }: { note: SmartNote; collections: SmartNotesState["collections"]; onSaved: (state: SmartNotesState) => void; onAction: (id: string, patch: Partial<SmartNote>) => void; onComplete: (id: string) => void; onBack: () => void }) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [category, setCategory] = useState(note.category);
  const [subject, setSubject] = useState(note.subject);
  const [tags, setTags] = useState(note.tags.join(", "));
  const [collectionId, setCollectionId] = useState(note.collectionId ?? "");
  const [status, setStatus] = useState("All changes saved");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dirtyRef = useRef(false);
  const typingStartedRef = useRef(0);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!dirtyRef.current) return;
      const elapsed = Math.min(60, Math.max(1, Math.round((Date.now() - typingStartedRef.current) / 1000)));
      const result = updateSmartNote(note.id, { title: title.trim() || "Untitled note", content, category: category.trim() || "General", subject: subject.trim() || "General", tags: tags.split(",").map((item) => item.trim()).filter(Boolean), collectionId: collectionId || null }, elapsed);
      onSaved(result.state);
      dirtyRef.current = false;
      typingStartedRef.current = Date.now();
      setStatus(result.saved ? `Saved at ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "Could not save");
    }, 700);
    return () => window.clearTimeout(timer);
  }, [category, collectionId, content, note.id, onSaved, subject, tags, title]);

  function changed(setter: (value: string) => void, value: string) {
    if (!dirtyRef.current) typingStartedRef.current = Date.now();
    dirtyRef.current = true;
    setStatus("Saving…");
    setter(value);
  }

  function insert(before: string, after = "") {
    const input = textareaRef.current;
    const start = input?.selectionStart ?? content.length;
    const end = input?.selectionEnd ?? content.length;
    const next = `${content.slice(0, start)}${before}${content.slice(start, end)}${after}${content.slice(end)}`;
    changed(setContent, next);
    window.setTimeout(() => input?.focus(), 0);
  }

  const wordCount = words(content);
  return (
    <section className="min-w-0 space-y-5" aria-labelledby="editor-title">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-white bg-white/80 p-4 shadow-sm"><button type="button" onClick={onBack} className={`inline-flex min-h-11 items-center gap-2 rounded-2xl px-4 font-black text-purple-800 hover:bg-purple-50 ${buttonFocus}`}><ArrowLeft size={18} /> Back</button><div className="flex flex-wrap gap-2"><button type="button" onClick={() => onAction(note.id, { favorite: !note.favorite })} className={`min-h-11 rounded-2xl px-4 font-bold ${note.favorite ? "bg-pink-100 text-pink-700" : "bg-slate-100 text-slate-700"} ${buttonFocus}`}><Heart className="inline" size={17} fill={note.favorite ? "currentColor" : "none"} /> Favorite</button><button type="button" onClick={() => onAction(note.id, { pinned: !note.pinned })} className={`min-h-11 rounded-2xl px-4 font-bold ${note.pinned ? "bg-purple-100 text-purple-700" : "bg-slate-100 text-slate-700"} ${buttonFocus}`}><Pin className="inline" size={17} /> Pin</button><button type="button" onClick={() => onComplete(note.id)} className={`min-h-11 rounded-2xl px-4 font-bold ${note.completed ? "bg-emerald-100 text-emerald-800" : "bg-emerald-700 text-white"} ${buttonFocus}`}><Check className="inline" size={17} /> {note.completed ? "Completed" : "Mark completed"}</button></div></div>
      <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_19rem]">
        <div className="min-w-0 rounded-[2rem] border border-purple-100 bg-white/90 p-5 shadow-md sm:p-7">
          <label htmlFor="note-title" className="sr-only">Note title</label><input id="note-title" value={title} onChange={(event) => changed(setTitle, event.target.value)} className="w-full border-0 bg-transparent text-3xl font-black text-purple-900 outline-none placeholder:text-purple-300 sm:text-4xl" placeholder="Untitled note" />
          <div className="mt-4 flex flex-wrap gap-2 border-y border-purple-100 py-3" aria-label="Markdown formatting toolbar">
            <FormatButton label="Checklist" onClick={() => insert("- [ ] ")}><ListChecks size={17} /></FormatButton><FormatButton label="Code block" onClick={() => insert("```\n", "\n```")}><Code2 size={17} /></FormatButton><FormatButton label="Table" onClick={() => insert("| Column | Column |\n| --- | --- |\n| Value | Value |\n")}><Table2 size={17} /></FormatButton><FormatButton label="Image placeholder" onClick={() => insert("![Describe image](image-placeholder)\n")}><FileText size={17} /></FormatButton><FormatButton label="Quote" onClick={() => insert("> ")}><Quote size={17} /></FormatButton><FormatButton label="Bulleted list" onClick={() => insert("- ")}><List size={17} /></FormatButton><FormatButton label="Numbered list" onClick={() => insert("1. ")}><ListOrdered size={17} /></FormatButton><FormatButton label="Callout" onClick={() => insert("> [!NOTE]\n> ")}><Sparkles size={17} /></FormatButton>
          </div>
          <label htmlFor="note-content" className="sr-only">Note content with Markdown support</label><textarea ref={textareaRef} id="note-content" value={content} onChange={(event) => changed(setContent, event.target.value)} className="mt-4 min-h-[32rem] w-full resize-y bg-transparent font-mono text-[15px] leading-7 text-slate-800 outline-none" placeholder="Start writing with Markdown…" />
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-purple-100 pt-4 text-sm font-bold text-slate-500"><span aria-live="polite">{status}</span><span>{wordCount} words · {Math.max(1, Math.ceil(wordCount / 200))} min read</span></div>
        </div>
        <aside className="space-y-4">
          <div className="rounded-3xl border border-white bg-white/80 p-5 shadow-sm"><h2 id="editor-title" className="text-lg font-black text-slate-900">Organization</h2><div className="mt-4 space-y-3"><MetaInput label="Category" value={category} onChange={(value) => changed(setCategory, value)} /><MetaInput label="Subject" value={subject} onChange={(value) => changed(setSubject, value)} /><MetaInput label="Tags (comma separated)" value={tags} onChange={(value) => changed(setTags, value)} /><label className="block text-xs font-black text-slate-600">Collection<select value={collectionId} onChange={(event) => changed(setCollectionId, event.target.value)} className={`${inputClass} mt-1`}><option value="">No collection</option>{collections.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label></div></div>
          <div className="rounded-3xl border border-white bg-gradient-to-br from-sky-50 to-purple-50 p-5 shadow-sm"><h3 className="font-black text-slate-900">Markdown preview</h3><p className="mt-1 text-xs text-slate-500">A clean reading view of your Markdown source.</p><pre className="mt-4 max-h-80 overflow-auto whitespace-pre-wrap break-words font-sans text-sm leading-6 text-slate-700">{content || "Your preview will appear here."}</pre></div>
          <div className="rounded-3xl border border-white bg-white/80 p-5 shadow-sm"><p className="text-sm font-black text-slate-900">Flashcards ready for later</p><p className="mt-2 text-sm leading-6 text-slate-600">This note already stores prepared flashcard candidates. Flashcards V2 is intentionally not built yet.</p></div>
          <div className="grid gap-2"><button type="button" onClick={() => onAction(note.id, { archived: !note.archived })} className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-amber-50 font-bold text-amber-800 ${buttonFocus}`}><Archive size={17} /> {note.archived ? "Restore from archive" : "Archive note"}</button><button type="button" onClick={() => { onAction(note.id, { trashed: true }); onBack(); }} className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-rose-50 font-bold text-rose-700 ${buttonFocus}`}><Trash2 size={17} /> Move to trash</button></div>
        </aside>
      </div>
    </section>
  );
}

function CollectionsView({ state, name, description, onName, onDescription, onSubmit, onOpen, onDelete }: { state: SmartNotesState; name: string; description: string; onName: (value: string) => void; onDescription: (value: string) => void; onSubmit: (event: React.FormEvent) => void; onOpen: (id: string) => void; onDelete: (id: string) => void }) {
  return <section className="grid gap-6 xl:grid-cols-[22rem_minmax(0,1fr)]"><form onSubmit={onSubmit} className="h-fit rounded-[2rem] border border-white bg-white/80 p-6 shadow-md"><FolderPlus className="text-emerald-700" /><h2 className="mt-3 text-2xl font-black text-slate-900">New study collection</h2><p className="mt-2 text-sm leading-6 text-slate-600">Group notes for a course, project, or interview goal.</p><div className="mt-5 space-y-3"><MetaInput label="Collection name" value={name} onChange={onName} /><MetaInput label="Description" value={description} onChange={onDescription} /><button type="submit" className={`min-h-11 w-full rounded-2xl bg-emerald-700 px-5 font-black text-white ${buttonFocus}`}>Create collection</button></div></form><div className="space-y-4">{state.collections.length ? state.collections.map((collection) => { const notes = state.notes.filter((note) => note.collectionId === collection.id && !note.trashed); return <article key={collection.id} className="rounded-[2rem] border border-white bg-gradient-to-br from-emerald-50 to-sky-50 p-6 shadow-sm"><div className="flex items-start justify-between gap-4"><div><h2 className="text-2xl font-black text-slate-900">📚 {collection.name}</h2><p className="mt-1 text-sm text-slate-600">{collection.description || `${notes.length} grouped note${notes.length === 1 ? "" : "s"}`}</p></div><button type="button" onClick={() => onDelete(collection.id)} className={`rounded-xl p-2 text-rose-600 hover:bg-rose-100 ${buttonFocus}`} aria-label={`Delete ${collection.name} collection`}><Trash2 size={18} /></button></div><div className="mt-4 grid gap-3 sm:grid-cols-2">{notes.length ? notes.map((note) => <button type="button" key={note.id} onClick={() => onOpen(note.id)} className={`rounded-2xl bg-white/85 p-4 text-left font-black text-purple-800 shadow-sm ${buttonFocus}`}>{note.title}</button>) : <p className="rounded-2xl border border-dashed border-emerald-200 p-5 text-sm text-slate-600">Add notes to this collection from the editor.</p>}</div></article>; }) : <div className="rounded-[2rem] border border-dashed border-purple-200 bg-purple-50/50 p-10 text-center"><p className="text-4xl">📚</p><h2 className="mt-3 text-xl font-black text-slate-900">No collections yet</h2><p className="mt-2 text-sm text-slate-600">Your first focused study set starts here.</p></div>}</div></section>;
}

function TrashView({ notes, onRestore, onDelete }: { notes: SmartNote[]; onRestore: (note: SmartNote) => void; onDelete: (id: string) => void }) {
  return <section className="rounded-[2rem] border border-white bg-white/80 p-6 shadow-md"><h2 className="text-2xl font-black text-slate-900">Trash</h2><p className="mt-1 text-sm text-slate-600">Restore notes or delete them permanently.</p>{notes.length ? <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{notes.map((note) => <article key={note.id} className="rounded-3xl border border-rose-100 bg-rose-50/60 p-5"><h3 className="font-black text-slate-900">{note.title}</h3><p className="mt-1 text-xs text-slate-500">Edited {formatDate(note.updatedAt)}</p><div className="mt-4 flex gap-2"><button type="button" onClick={() => onRestore(note)} className={`rounded-xl bg-white px-3 py-2 text-sm font-bold text-emerald-700 ${buttonFocus}`}>Restore</button><button type="button" onClick={() => onDelete(note.id)} className={`rounded-xl bg-rose-700 px-3 py-2 text-sm font-bold text-white ${buttonFocus}`}>Delete forever</button></div></article>)}</div> : <div className="mt-5 rounded-3xl border border-dashed border-slate-200 p-10 text-center text-sm font-medium text-slate-600">Trash is empty. Your notes are safe and sound.</div>}</section>;
}

function SummaryCard({ icon, label, value }: { icon: string; label: string; value: string | number }) { return <div className="rounded-3xl border border-white bg-white/75 p-5 shadow-sm"><span className="text-2xl">{icon}</span><p className="mt-3 text-2xl font-black text-purple-900">{value}</p><p className="text-xs font-black uppercase tracking-wider text-slate-500">{label}</p></div>; }
function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (value: boolean) => void; label: string }) { return <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-2xl bg-purple-50 px-4 text-sm font-bold text-purple-800"><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="size-4 accent-purple-700" />{label}</label>; }
function IconButton({ label, active, onClick, children }: { label: string; active: boolean; onClick: () => void; children: React.ReactNode }) { return <button type="button" aria-label={label} onClick={onClick} className={`grid size-9 place-items-center rounded-full ${active ? "bg-pink-100 text-pink-700" : "bg-white text-slate-500"} ${buttonFocus}`}>{children}</button>; }
function FormatButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) { return <button type="button" title={label} aria-label={label} onClick={onClick} className={`inline-flex min-h-10 items-center gap-2 rounded-xl bg-purple-50 px-3 text-xs font-black text-purple-800 hover:bg-purple-100 ${buttonFocus}`}>{children}<span className="hidden sm:inline">{label}</span></button>; }
function MetaInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) { return <label className="block text-xs font-black text-slate-600">{label}<input value={value} onChange={(event) => onChange(event.target.value)} className={`${inputClass} mt-1`} /></label>; }
