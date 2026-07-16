"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  AudioLines,
  Check,
  Clock3,
  Edit3,
  Heart,
  Plus,
  Search,
  Shuffle,
  Sparkles,
  Star,
  Trash2,
  X,
} from "lucide-react";

import AppLayout from "@/components/layout/AppLayout";
import { useProgress } from "@/context/ProgressContext";
import {
  abandonFlashcardSession,
  createCustomDeck,
  deleteCustomDeck,
  deleteCustomFlashcard,
  finishFlashcardSession,
  FLASHCARDS_EVENT,
  getAllFlashcardDecks,
  getAllFlashcards,
  getCardReview,
  getDeckCards,
  getDueFlashcards,
  getFlashcardsSummary,
  getPreparedNoteFlashcardCandidates,
  isFlashcardDue,
  loadFlashcardsState,
  rateFlashcard,
  renameCustomDeck,
  saveCustomFlashcard,
  saveFlashcardNotes,
  shuffleFlashcardSession,
  startFlashcardSession,
  toggleFavoriteDeck,
  toggleFavoriteFlashcard,
  updateFlashcardSessionIndex,
  type FlashcardHistoryEntry,
  type FlashcardsState,
  type ReviewRating,
} from "@/lib/flashcards";
import type {
  FlashcardDeck,
  FlashcardDefinition,
  FlashcardDifficulty,
} from "@/lib/flashcardData";
import { playClickSound, playSuccessSound, playXPSound } from "@/lib/sounds";
import { incrementStats } from "@/lib/stats";
import { registerStudyDay } from "@/lib/streak";

type View = "home" | "deck" | "study" | "complete" | "custom";

const difficultyOptions: Array<"All" | FlashcardDifficulty> = [
  "All",
  "Beginner",
  "Intermediate",
  "Advanced",
];

function formatTimer(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
}

function formatReviewDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not scheduled";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default function FlashcardsStudio() {
  const { addXP } = useProgress();
  const [state, setState] = useState<FlashcardsState>(() => loadFlashcardsState());
  const [view, setView] = useState<View>("home");
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [difficulty, setDifficulty] = useState<"All" | FlashcardDifficulty>("All");
  const [flipped, setFlipped] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [lastEntry, setLastEntry] = useState<FlashcardHistoryEntry | null>(null);

  function sync() {
    setState(loadFlashcardsState());
  }

  useEffect(() => {
    const frame = window.requestAnimationFrame(sync);
    window.addEventListener(FLASHCARDS_EVENT, sync);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener(FLASHCARDS_EVENT, sync);
    };
  }, []);

  useEffect(() => {
    if (view !== "study" || !state.activeSession) return;
    const startedAt = Date.parse(state.activeSession.startedAt);
    const update = () => setElapsedSeconds(Math.max(0, Math.floor((Date.now() - startedAt) / 1000)));
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [state.activeSession, view]);

  const decks = useMemo(() => getAllFlashcardDecks(state), [state]);
  const cards = useMemo(() => getAllFlashcards(state), [state]);
  const summary = useMemo(() => getFlashcardsSummary(state), [state]);
  const dueCards = useMemo(() => getDueFlashcards(state), [state]);
  const categories = useMemo(() => ["All", ...Array.from(new Set(decks.map((deck) => deck.category)))], [decks]);
  const filteredDecks = useMemo(() => {
    const query = search.trim().toLowerCase();
    return decks.filter((deck) => {
      const matchesText = !query || `${deck.title} ${deck.description} ${deck.category}`.toLowerCase().includes(query);
      const matchesCategory = category === "All" || deck.category === category;
      const matchesDifficulty = difficulty === "All" || deck.difficulty === difficulty;
      return matchesText && matchesCategory && matchesDifficulty;
    });
  }, [category, decks, difficulty, search]);
  const selectedDeck = decks.find((deck) => deck.id === selectedDeckId) ?? null;
  const selectedCards = selectedDeck ? getDeckCards(selectedDeck.id, state) : [];
  const recentDecks = state.history
    .map((entry) => decks.find((deck) => deck.id === entry.deckId))
    .filter((deck, index, values): deck is FlashcardDeck => {
      if (!deck) return false;
      return values.findIndex((item) => item?.id === deck.id) === index;
    })
    .slice(0, 3);
  const favoriteDecks = decks.filter((deck) => state.favoriteDeckIds.includes(deck.id));
  const recommendedDecks = [...decks]
    .sort((left, right) => {
      const leftDue = getDeckCards(left.id, state).filter((card) => isFlashcardDue(card.id, state)).length;
      const rightDue = getDeckCards(right.id, state).filter((card) => isFlashcardDue(card.id, state)).length;
      return rightDue - leftDue;
    })
    .slice(0, 3);

  function openDeck(deckId: string) {
    playClickSound();
    setSelectedDeckId(deckId);
    setView("deck");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function beginSession(deckId: string, cardIds?: string[]) {
    playClickSound();
    const result = startFlashcardSession(deckId, cardIds);
    setState(result.state);
    if (result.session) {
      setSelectedDeckId(deckId === "daily-review" ? null : deckId);
      setFlipped(false);
      setElapsedSeconds(0);
      setView("study");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function continueSession() {
    if (!state.activeSession) return;
    playClickSound();
    setFlipped(false);
    setView("study");
  }

  function handleRating(rating: ReviewRating) {
    const session = state.activeSession;
    if (!session) return;
    const cardId = session.cardIds[session.currentIndex];
    const result = rateFlashcard(cardId, rating);
    setState(result.state);
    registerStudyDay();
    if (result.xpAward > 0) {
      addXP(result.xpAward);
      incrementStats(0, 0, result.xpAward, 0);
      playXPSound();
    } else {
      playClickSound();
    }
    const updatedSession = result.state.activeSession;
    if (!updatedSession) return;
    if (updatedSession.reviewedCardIds.length >= updatedSession.cardIds.length) {
      const completed = finishFlashcardSession();
      setState(completed.state);
      if (completed.entry) {
        incrementStats(0, Math.max(1, Math.round(completed.entry.durationSeconds / 60)), 0, 0);
        playSuccessSound();
        setLastEntry(completed.entry);
        setView("complete");
      }
      return;
    }
    const nextIndex = updatedSession.cardIds.findIndex(
      (id, index) => index > updatedSession.currentIndex && !updatedSession.reviewedCardIds.includes(id),
    );
    const fallbackIndex = updatedSession.cardIds.findIndex((id) => !updatedSession.reviewedCardIds.includes(id));
    const nextState = updateFlashcardSessionIndex(nextIndex >= 0 ? nextIndex : fallbackIndex);
    setState(nextState);
    setFlipped(false);
  }

  function moveCard(delta: number) {
    const session = state.activeSession;
    if (!session) return;
    playClickSound();
    setState(updateFlashcardSessionIndex(session.currentIndex + delta));
    setFlipped(false);
  }

  function shuffle() {
    playClickSound();
    setState(shuffleFlashcardSession());
    setFlipped(false);
  }

  function exitSession() {
    playClickSound();
    setState(abandonFlashcardSession());
    setView(selectedDeckId ? "deck" : "home");
  }

  if (view === "study" && state.activeSession) {
    const session = state.activeSession;
    const card = cards.find((item) => item.id === session.cardIds[session.currentIndex]);
    if (card) {
      return (
        <AppLayout>
          <StudySession
            key={card.id}
            state={state}
            card={card}
            elapsedSeconds={elapsedSeconds}
            flipped={flipped}
            setFlipped={setFlipped}
            onRate={handleRating}
            onMove={moveCard}
            onShuffle={shuffle}
            onExit={exitSession}
            onFavorite={() => setState(toggleFavoriteFlashcard(card.id))}
            onNotes={(notes) => setState(saveFlashcardNotes(card.id, notes))}
          />
        </AppLayout>
      );
    }
  }

  if (view === "complete" && lastEntry) {
    return (
      <AppLayout>
        <CompletionView
          entry={lastEntry}
          onHome={() => {
            setView("home");
            setLastEntry(null);
          }}
          onNext={() => {
            const nextDeck = recommendedDecks.find((deck) => deck.id !== lastEntry.deckId) ?? recommendedDecks[0];
            if (nextDeck) openDeck(nextDeck.id);
            else setView("home");
          }}
        />
      </AppLayout>
    );
  }

  if (view === "custom") {
    return (
      <AppLayout>
        <CustomDeckManager
          state={state}
          onState={setState}
          onBack={() => setView("home")}
          onOpenDeck={openDeck}
        />
      </AppLayout>
    );
  }

  if (view === "deck" && selectedDeck) {
    return (
      <AppLayout>
        <DeckView
          deck={selectedDeck}
          cards={selectedCards}
          state={state}
          onBack={() => setView("home")}
          onStart={() => beginSession(selectedDeck.id)}
          onFavorite={() => setState(toggleFavoriteDeck(selectedDeck.id))}
          onManage={() => setView("custom")}
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-w-0 space-y-8 text-slate-950">
        <header className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-gradient-to-br from-purple-100 via-pink-100 to-sky-100 p-7 shadow-lg sm:p-10">
          <div className="pointer-events-none absolute -right-16 -top-20 size-64 rounded-full bg-white/50 blur-3xl" aria-hidden="true" />
          <div className="relative flex flex-col gap-7 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-bold text-purple-800 shadow-sm">
                <Sparkles size={17} /> Recall a little, remember a lot
              </p>
              <h1 className="mt-4 text-4xl font-black tracking-tight text-purple-900 sm:text-5xl">🧠 Flashcards Studio</h1>
              <p className="mt-3 max-w-2xl text-base font-medium leading-7 text-slate-700 sm:text-lg">
                Review analyst concepts with local spaced repetition, focused decks, and rewards that can only be earned once per card.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 rounded-3xl border border-white bg-white/75 p-4 shadow-sm sm:grid-cols-4">
              <HeaderStat value={summary.uniqueCardsStudied} label="Studied" />
              <HeaderStat value={summary.dueToday} label="Due today" />
              <HeaderStat value={`${summary.accuracy}%`} label="Accuracy" />
              <HeaderStat value={`${summary.xpEarned} XP`} label="Earned" />
            </div>
          </div>
        </header>

        <section className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
          <ActionCard
            icon="▶️"
            title="Continue Studying"
            description={state.activeSession ? `${state.activeSession.deckTitle} · ${state.activeSession.reviewedCardIds.length}/${state.activeSession.cardIds.length} reviewed` : "No paused session yet. Start any deck when you are ready."}
            action={state.activeSession ? "Resume session" : "Choose a deck"}
            disabled={!state.activeSession}
            onClick={state.activeSession ? continueSession : undefined}
          />
          <ActionCard
            icon="☀️"
            title="Daily Review"
            description={dueCards.length ? `${dueCards.length} cards are due. Today’s focused set contains up to 10.` : "You are caught up. New reviews will appear on their scheduled date."}
            action={dueCards.length ? "Review due cards" : "All caught up"}
            disabled={!dueCards.length}
            onClick={dueCards.length ? () => beginSession("daily-review", dueCards.slice(0, 10).map((card) => card.id)) : undefined}
          />
          <article className="rounded-[2rem] border border-amber-200 bg-amber-50/80 p-6 shadow-md">
            <p className="text-sm font-black uppercase tracking-[0.15em] text-amber-800">Progress summary</p>
            <p className="mt-3 text-3xl font-black text-amber-950">{summary.progressPercentage}% explored</p>
            <p className="mt-2 leading-7 text-slate-700">{summary.cardsStudied} reviews · {summary.decksCompleted} decks completed · {summary.studyMinutes} study minutes</p>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-white" role="progressbar" aria-label="Flashcards explored" aria-valuemin={0} aria-valuemax={100} aria-valuenow={summary.progressPercentage}>
              <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-pink-500" style={{ width: `${summary.progressPercentage}%` }} />
            </div>
          </article>
        </section>

        <section className="rounded-[2rem] border border-purple-100 bg-white/80 p-5 shadow-md sm:p-6">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_220px_auto]">
            <label className="relative min-w-0">
              <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-purple-500" size={19} />
              <span className="sr-only">Search decks</span>
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search decks, categories, or topics" className="min-h-12 w-full rounded-2xl border border-purple-200 bg-purple-50/60 pl-11 pr-4 font-semibold outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200" />
            </label>
            <label>
              <span className="sr-only">Category</span>
              <select value={category} onChange={(event) => setCategory(event.target.value)} className="min-h-12 w-full rounded-2xl border border-purple-200 bg-white px-4 font-bold text-slate-700">
                {categories.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
            <label>
              <span className="sr-only">Difficulty</span>
              <select value={difficulty} onChange={(event) => setDifficulty(event.target.value as "All" | FlashcardDifficulty)} className="min-h-12 w-full rounded-2xl border border-purple-200 bg-white px-4 font-bold text-slate-700">
                {difficultyOptions.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
            <button type="button" onClick={() => { playClickSound(); setView("custom"); }} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-purple-700 px-5 font-black text-white shadow-sm transition hover:bg-purple-800">
              <Plus size={18} /> Custom deck
            </button>
          </div>
        </section>

        {recentDecks.length ? <DeckSection title="Recently studied" subtitle="Return to your latest completed sessions." decks={recentDecks} state={state} onOpen={openDeck} /> : null}
        {favoriteDecks.length ? <DeckSection title="Favorite decks" subtitle="Your saved study shelf." decks={favoriteDecks} state={state} onOpen={openDeck} /> : null}
        <DeckSection title="Recommended decks" subtitle="Decks with the most due or unseen cards." decks={recommendedDecks} state={state} onOpen={openDeck} />
        <DeckSection title="All decks" subtitle={`${filteredDecks.length} deck${filteredDecks.length === 1 ? "" : "s"} match your filters.`} decks={filteredDecks} state={state} onOpen={openDeck} empty="No decks match these filters." />

        <section className="grid gap-5 lg:grid-cols-2">
          <article className="rounded-[2rem] border border-violet-200 bg-gradient-to-br from-violet-50 to-sky-50 p-6 shadow-md">
            <p className="text-sm font-black uppercase tracking-[0.15em] text-violet-700">Smart Notes handoff</p>
            <h2 className="mt-2 text-2xl font-black">📝 {getPreparedNoteFlashcardCandidates().length} prepared candidates</h2>
            <p className="mt-2 leading-7 text-slate-700">Smart Notes already stores structured front-and-back candidates. Automatic generation remains intentionally off for V1.</p>
            <Link href="/smart-notes" onClick={playClickSound} className="mt-5 inline-flex min-h-11 items-center rounded-2xl bg-violet-700 px-5 font-black text-white">Open Smart Notes</Link>
          </article>
          <article className="rounded-[2rem] border border-pink-200 bg-pink-50/80 p-6 shadow-md">
            <p className="text-sm font-black uppercase tracking-[0.15em] text-pink-700">How scheduling works</p>
            <h2 className="mt-2 text-2xl font-black">Easy · Medium · Hard</h2>
            <p className="mt-2 leading-7 text-slate-700">Hard returns tomorrow, Medium starts at three days, and Easy starts at seven. Repeated successful reviews lengthen the interval locally.</p>
          </article>
        </section>
      </div>
    </AppLayout>
  );
}

function HeaderStat({ value, label }: { value: string | number; label: string }) {
  return <div className="min-w-0 rounded-2xl bg-white/80 px-3 py-3 text-center"><p className="truncate text-xl font-black text-purple-800">{value}</p><p className="mt-1 text-xs font-bold text-slate-600">{label}</p></div>;
}

function ActionCard({ icon, title, description, action, onClick, disabled }: { icon: string; title: string; description: string; action: string; onClick?: () => void; disabled?: boolean }) {
  return <article className="rounded-[2rem] border border-purple-200 bg-gradient-to-br from-white via-purple-50 to-pink-50 p-6 shadow-md">
    <span className="text-3xl">{icon}</span><h2 className="mt-3 text-2xl font-black">{title}</h2><p className="mt-2 min-h-14 leading-7 text-slate-700">{description}</p>
    <button type="button" onClick={onClick} disabled={disabled} className="mt-5 min-h-11 rounded-2xl bg-purple-700 px-5 font-black text-white disabled:cursor-not-allowed disabled:bg-slate-300">{action}</button>
  </article>;
}

function DeckSection({ title, subtitle, decks, state, onOpen, empty }: { title: string; subtitle: string; decks: FlashcardDeck[]; state: FlashcardsState; onOpen: (id: string) => void; empty?: string }) {
  return <section>
    <div><h2 className="text-2xl font-black">{title}</h2><p className="mt-1 text-sm font-semibold text-slate-600">{subtitle}</p></div>
    {decks.length ? <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{decks.map((deck) => <DeckCard key={deck.id} deck={deck} state={state} onOpen={onOpen} />)}</div> : <div className="mt-5 rounded-3xl border border-dashed border-purple-200 bg-white/60 p-9 text-center font-bold text-slate-600">{empty ?? "Nothing here yet."}</div>}
  </section>;
}

function DeckCard({ deck, state, onOpen }: { deck: FlashcardDeck; state: FlashcardsState; onOpen: (id: string) => void }) {
  const cards = getDeckCards(deck.id, state);
  const reviewed = cards.filter((card) => getCardReview(card.id, state).lastReviewedAt).length;
  const due = cards.filter((card) => isFlashcardDue(card.id, state)).length;
  return <button type="button" onClick={() => onOpen(deck.id)} className="group min-w-0 rounded-[2rem] border border-white/90 bg-white/85 p-6 text-left shadow-md transition hover:-translate-y-1 hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-700">
    <div className="flex items-start justify-between gap-3"><span className="text-4xl">{deck.icon}</span><div className="flex gap-2">{deck.custom ? <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-black text-sky-700">Custom</span> : null}{state.favoriteDeckIds.includes(deck.id) ? <Star size={18} className="fill-pink-500 text-pink-500" /> : null}</div></div>
    <h3 className="mt-4 truncate text-xl font-black text-slate-950">{deck.title}</h3><p className="mt-2 line-clamp-2 min-h-12 text-sm leading-6 text-slate-600">{deck.description}</p>
    <div className="mt-5 flex flex-wrap gap-2 text-xs font-black"><span className="rounded-full bg-purple-100 px-3 py-1 text-purple-800">{cards.length} cards</span><span className="rounded-full bg-amber-100 px-3 py-1 text-amber-800">{due} due</span><span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-800">{reviewed} studied</span></div>
    <div className="mt-5 flex items-center justify-between text-sm font-black text-purple-700"><span>{deck.difficulty}</span><span className="transition group-hover:translate-x-1">Open →</span></div>
  </button>;
}

function DeckView({ deck, cards, state, onBack, onStart, onFavorite, onManage }: { deck: FlashcardDeck; cards: FlashcardDefinition[]; state: FlashcardsState; onBack: () => void; onStart: () => void; onFavorite: () => void; onManage: () => void }) {
  const due = cards.filter((card) => isFlashcardDue(card.id, state)).length;
  const reviewed = cards.filter((card) => getCardReview(card.id, state).lastReviewedAt).length;
  return <div className="space-y-7">
    <button type="button" onClick={onBack} className="inline-flex min-h-11 items-center gap-2 rounded-2xl bg-white px-4 font-black text-purple-800 shadow-sm"><ArrowLeft size={18} /> All decks</button>
    <header className="rounded-[2rem] border border-white bg-gradient-to-br from-purple-100 via-pink-100 to-sky-100 p-7 shadow-lg sm:p-10">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"><div><span className="text-5xl">{deck.icon}</span><h1 className="mt-4 text-4xl font-black text-purple-900">{deck.title}</h1><p className="mt-3 max-w-2xl text-lg leading-8 text-slate-700">{deck.description}</p></div><div className="flex flex-wrap gap-3"><button type="button" onClick={onFavorite} className="inline-flex min-h-12 items-center gap-2 rounded-2xl border border-pink-200 bg-white px-5 font-black text-pink-700"><Heart size={18} className={state.favoriteDeckIds.includes(deck.id) ? "fill-pink-500" : ""} /> Favorite</button>{deck.custom ? <button type="button" onClick={onManage} className="inline-flex min-h-12 items-center gap-2 rounded-2xl border border-sky-200 bg-white px-5 font-black text-sky-700"><Edit3 size={18} /> Manage</button> : null}<button type="button" onClick={onStart} disabled={!cards.length} className="min-h-12 rounded-2xl bg-purple-700 px-6 font-black text-white disabled:bg-slate-300">Start study session</button></div></div>
    </header>
    <section className="grid gap-4 sm:grid-cols-3"><Metric label="Cards" value={cards.length} /><Metric label="Due today" value={due} /><Metric label="Studied" value={reviewed} /></section>
    <section><h2 className="text-2xl font-black">Cards in this deck</h2>{cards.length ? <div className="mt-5 grid gap-4 lg:grid-cols-2">{cards.map((card) => { const review = getCardReview(card.id, state); return <article key={card.id} className="rounded-3xl border border-purple-100 bg-white/80 p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><h3 className="font-black text-slate-900">{card.front}</h3>{review.favorite ? <Heart size={17} className="fill-pink-500 text-pink-500" /> : null}</div><p className="mt-3 text-sm leading-6 text-slate-600">{card.back}</p><div className="mt-4 flex flex-wrap gap-2 text-xs font-black"><span className="rounded-full bg-purple-100 px-3 py-1 text-purple-700">{card.difficulty}</span><span className="rounded-full bg-amber-100 px-3 py-1 text-amber-800">{review.lastReviewedAt ? `Next: ${formatReviewDate(review.nextReviewAt)}` : "New"}</span></div></article>; })}</div> : <div className="mt-5 rounded-3xl border border-dashed border-purple-200 bg-white/60 p-10 text-center font-bold text-slate-600">This custom deck is empty. Open Manage to add its first card.</div>}</section>
  </div>;
}

function Metric({ label, value }: { label: string; value: number | string }) { return <article className="rounded-3xl border border-white bg-white/80 p-5 text-center shadow-md"><p className="text-3xl font-black text-purple-800">{value}</p><p className="mt-1 text-sm font-bold text-slate-600">{label}</p></article>; }

function StudySession({ state, card, elapsedSeconds, flipped, setFlipped, onRate, onMove, onShuffle, onExit, onFavorite, onNotes }: { state: FlashcardsState; card: FlashcardDefinition; elapsedSeconds: number; flipped: boolean; setFlipped: (value: boolean) => void; onRate: (rating: ReviewRating) => void; onMove: (delta: number) => void; onShuffle: () => void; onExit: () => void; onFavorite: () => void; onNotes: (notes: string) => void }) {
  const session = state.activeSession!;
  const review = getCardReview(card.id, state);
  const [notes, setNotes] = useState(review.notes);
  return <div className="mx-auto max-w-5xl space-y-6">
    <header className="flex flex-col gap-4 rounded-3xl border border-white bg-white/80 p-5 shadow-md sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-black uppercase tracking-[0.14em] text-purple-600">{session.deckTitle}</p><h1 className="mt-1 text-2xl font-black">Card {session.currentIndex + 1} of {session.cardIds.length}</h1></div><div className="flex flex-wrap items-center gap-3"><span className="inline-flex min-h-11 items-center gap-2 rounded-2xl bg-purple-100 px-4 font-black text-purple-800"><Clock3 size={18} /> {formatTimer(elapsedSeconds)}</span><span className="rounded-2xl bg-emerald-100 px-4 py-3 font-black text-emerald-800">{session.reviewedCardIds.length} reviewed</span><button type="button" onClick={onExit} className="grid size-11 place-items-center rounded-2xl bg-slate-100 text-slate-700" aria-label="End session"><X size={20} /></button></div></header>
    <div className="h-[390px] [perspective:1200px] sm:h-[430px]">
      <button type="button" onClick={() => { playClickSound(); setFlipped(!flipped); }} className="relative size-full rounded-[2.25rem] text-left shadow-xl outline-none transition-transform duration-500 [transform-style:preserve-3d] focus-visible:ring-4 focus-visible:ring-purple-300" style={{ transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }} aria-label={flipped ? "Show question" : "Show answer"}>
        <div className="absolute inset-0 flex flex-col items-center justify-center rounded-[2.25rem] border border-purple-200 bg-gradient-to-br from-white via-purple-50 to-pink-50 p-8 text-center [backface-visibility:hidden]"><p className="text-sm font-black uppercase tracking-[0.18em] text-purple-600">Front · tap to flip</p><p className="mt-6 max-w-2xl text-2xl font-black leading-relaxed text-slate-950 sm:text-4xl">{card.front}</p><span className="mt-8 rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-600 shadow-sm">{card.category} · {card.difficulty}</span></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center rounded-[2.25rem] border border-sky-200 bg-gradient-to-br from-sky-50 via-white to-emerald-50 p-8 text-center [backface-visibility:hidden] [transform:rotateY(180deg)]"><p className="text-sm font-black uppercase tracking-[0.18em] text-sky-700">Back · answer</p><p className="mt-6 max-w-3xl text-xl font-bold leading-9 text-slate-900 sm:text-3xl">{card.back}</p><span className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-600 shadow-sm"><AudioLines size={16} /> Audio-ready data</span></div>
      </button>
    </div>
    <div className="flex flex-wrap justify-center gap-3"><button type="button" onClick={() => onMove(-1)} disabled={session.currentIndex === 0} className="inline-flex min-h-11 items-center gap-2 rounded-2xl border border-purple-200 bg-white px-4 font-black text-purple-800 disabled:opacity-40"><ArrowLeft size={18} /> Previous</button><button type="button" onClick={onShuffle} className="inline-flex min-h-11 items-center gap-2 rounded-2xl border border-purple-200 bg-white px-4 font-black text-purple-800"><Shuffle size={18} /> Shuffle</button><button type="button" onClick={onFavorite} className="inline-flex min-h-11 items-center gap-2 rounded-2xl border border-pink-200 bg-white px-4 font-black text-pink-700"><Heart size={18} className={review.favorite ? "fill-pink-500" : ""} /> Favorite</button><button type="button" onClick={() => onMove(1)} disabled={session.currentIndex >= session.cardIds.length - 1} className="inline-flex min-h-11 items-center gap-2 rounded-2xl border border-purple-200 bg-white px-4 font-black text-purple-800 disabled:opacity-40">Next <ArrowRight size={18} /></button></div>
    <section className="rounded-3xl border border-white bg-white/80 p-5 shadow-md"><h2 className="text-lg font-black">How well did you recall it?</h2><p className="mt-1 text-sm text-slate-600">Rating schedules the next review. XP is awarded only the first time this card is rated.</p><div className="mt-4 grid gap-3 sm:grid-cols-3"><RatingButton label="Hard" detail="Review tomorrow" tone="bg-rose-600 hover:bg-rose-700" onClick={() => onRate("hard")} /><RatingButton label="Medium" detail="Review in 3+ days" tone="bg-amber-600 hover:bg-amber-700" onClick={() => onRate("medium")} /><RatingButton label="Easy" detail="Review in 7+ days" tone="bg-emerald-600 hover:bg-emerald-700" onClick={() => onRate("easy")} /></div>{review.rewarded ? <p className="mt-3 text-sm font-bold text-slate-500">This card’s one-time XP has already been secured.</p> : <p className="mt-3 text-sm font-bold text-purple-700">First review reward: +5 XP</p>}</section>
    <section className="rounded-3xl border border-violet-100 bg-violet-50/70 p-5"><label className="font-black text-violet-900">Personal notes<textarea value={notes} onChange={(event) => setNotes(event.target.value)} onBlur={() => onNotes(notes)} placeholder="Add a memory cue or example. Saved locally on blur." className="mt-3 min-h-28 w-full resize-y rounded-2xl border border-violet-200 bg-white p-4 font-medium outline-none focus:border-violet-500" /></label></section>
  </div>;
}

function RatingButton({ label, detail, tone, onClick }: { label: string; detail: string; tone: string; onClick: () => void }) { return <button type="button" onClick={onClick} className={`min-h-16 rounded-2xl px-4 text-left font-black text-white shadow-sm transition ${tone}`}><span className="block">{label}</span><span className="block text-xs font-semibold opacity-90">{detail}</span></button>; }

function CompletionView({ entry, onHome, onNext }: { entry: FlashcardHistoryEntry; onHome: () => void; onNext: () => void }) {
  return <div className="mx-auto max-w-3xl rounded-[2.5rem] border border-white bg-gradient-to-br from-purple-100 via-pink-100 to-sky-100 p-8 text-center shadow-xl sm:p-12"><div className="text-7xl" aria-hidden="true">🎉</div><p className="mt-5 text-sm font-black uppercase tracking-[0.18em] text-purple-700">Session complete</p><h1 className="mt-2 text-4xl font-black text-purple-950">{entry.deckTitle} is blooming</h1><p className="mt-3 text-lg text-slate-700">Your review history and next dates are safely stored on this device.</p><div className="mt-8 grid gap-4 sm:grid-cols-4"><Metric label="Reviewed" value={entry.cardsReviewed} /><Metric label="Accuracy" value={`${entry.accuracy}%`} /><Metric label="Time" value={formatTimer(entry.durationSeconds)} /><Metric label="XP" value={`+${entry.xpEarned}`} /></div><div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"><button type="button" onClick={onHome} className="min-h-12 rounded-2xl border border-purple-200 bg-white px-6 font-black text-purple-800">Back to Flashcards</button><button type="button" onClick={onNext} className="min-h-12 rounded-2xl bg-purple-700 px-6 font-black text-white">Next recommended deck</button></div></div>;
}

function CustomDeckManager({ state, onState, onBack, onOpenDeck }: { state: FlashcardsState; onState: (state: FlashcardsState) => void; onBack: () => void; onOpenDeck: (id: string) => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState<FlashcardDifficulty>("Beginner");
  const [activeDeckId, setActiveDeckId] = useState(state.customDecks[0]?.id ?? "");
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [cardDifficulty, setCardDifficulty] = useState<FlashcardDifficulty>("Beginner");
  const [editingCardId, setEditingCardId] = useState<string | undefined>();
  const activeDeck = state.customDecks.find((deck) => deck.id === activeDeckId);
  const activeCards = activeDeck ? getDeckCards(activeDeck.id, state) : [];

  function createDeck(event: React.FormEvent) {
    event.preventDefault();
    const result = createCustomDeck({ title, description, difficulty });
    onState(result.state);
    if (result.deck) { playSuccessSound(); setActiveDeckId(result.deck.id); setTitle(""); setDescription(""); }
  }
  function saveCard(event: React.FormEvent) {
    event.preventDefault();
    if (!activeDeck) return;
    const result = saveCustomFlashcard({ id: editingCardId, deckId: activeDeck.id, front, back, difficulty: cardDifficulty });
    onState(result.state);
    if (result.card) { playSuccessSound(); setFront(""); setBack(""); setEditingCardId(undefined); }
  }
  function editCard(card: FlashcardDefinition) { setEditingCardId(card.id); setFront(card.front); setBack(card.back); setCardDifficulty(card.difficulty); }

  return <div className="space-y-7">
    <button type="button" onClick={onBack} className="inline-flex min-h-11 items-center gap-2 rounded-2xl bg-white px-4 font-black text-purple-800 shadow-sm"><ArrowLeft size={18} /> Flashcards home</button>
    <header className="rounded-[2rem] border border-white bg-gradient-to-br from-purple-100 via-pink-100 to-sky-100 p-7 shadow-lg"><h1 className="text-4xl font-black text-purple-900">🗂️ Custom decks</h1><p className="mt-3 text-lg text-slate-700">Create, rename, delete, and edit your own locally stored study material.</p></header>
    <section className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
      <form onSubmit={createDeck} className="rounded-[2rem] border border-purple-100 bg-white/80 p-6 shadow-md"><h2 className="text-2xl font-black">Create a deck</h2><div className="mt-5 space-y-4"><Field label="Deck title" value={title} onChange={setTitle} required /><Field label="Description" value={description} onChange={setDescription} /><label className="block font-black text-slate-700">Difficulty<select value={difficulty} onChange={(event) => setDifficulty(event.target.value as FlashcardDifficulty)} className="mt-2 min-h-12 w-full rounded-2xl border border-purple-200 bg-white px-4">{difficultyOptions.slice(1).map((item) => <option key={item}>{item}</option>)}</select></label><button type="submit" className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-purple-700 px-5 font-black text-white"><Plus size={18} /> Create deck</button></div></form>
      <section className="rounded-[2rem] border border-purple-100 bg-white/80 p-6 shadow-md"><h2 className="text-2xl font-black">Your decks</h2>{state.customDecks.length ? <div className="mt-5 grid gap-3">{state.customDecks.map((deck) => <article key={deck.id} className={`rounded-2xl border p-4 ${activeDeckId === deck.id ? "border-purple-400 bg-purple-50" : "border-slate-200 bg-white"}`}><button type="button" onClick={() => setActiveDeckId(deck.id)} className="w-full text-left"><p className="font-black">{deck.title}</p><p className="mt-1 text-sm text-slate-600">{getDeckCards(deck.id, state).length} cards · {deck.difficulty}</p></button><div className="mt-3 flex flex-wrap gap-2"><button type="button" onClick={() => { const next = window.prompt("Rename deck", deck.title); if (next) onState(renameCustomDeck(deck.id, next).state); }} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-sky-100 px-3 text-sm font-black text-sky-800"><Edit3 size={15} /> Rename</button><button type="button" onClick={() => onOpenDeck(deck.id)} className="min-h-10 rounded-xl bg-purple-100 px-3 text-sm font-black text-purple-800">Open</button><button type="button" onClick={() => { if (window.confirm(`Delete ${deck.title} and all its cards?`)) { const result = deleteCustomDeck(deck.id); onState(result.state); if (activeDeckId === deck.id) setActiveDeckId(result.state.customDecks[0]?.id ?? ""); } }} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-rose-100 px-3 text-sm font-black text-rose-800"><Trash2 size={15} /> Delete</button></div></article>)}</div> : <p className="mt-5 rounded-2xl border border-dashed border-purple-200 p-8 text-center font-bold text-slate-600">Create your first personal deck.</p>}</section>
    </section>
    {activeDeck ? <section className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]"><form onSubmit={saveCard} className="rounded-[2rem] border border-sky-100 bg-sky-50/70 p-6 shadow-md"><h2 className="text-2xl font-black">{editingCardId ? "Edit card" : `Add to ${activeDeck.title}`}</h2><div className="mt-5 space-y-4"><TextArea label="Front" value={front} onChange={setFront} required /><TextArea label="Back" value={back} onChange={setBack} required /><label className="block font-black text-slate-700">Difficulty<select value={cardDifficulty} onChange={(event) => setCardDifficulty(event.target.value as FlashcardDifficulty)} className="mt-2 min-h-12 w-full rounded-2xl border border-sky-200 bg-white px-4">{difficultyOptions.slice(1).map((item) => <option key={item}>{item}</option>)}</select></label><div className="flex flex-wrap gap-3"><button type="submit" className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-sky-700 px-5 font-black text-white"><Check size={18} /> {editingCardId ? "Save changes" : "Add card"}</button>{editingCardId ? <button type="button" onClick={() => { setEditingCardId(undefined); setFront(""); setBack(""); }} className="min-h-12 rounded-2xl bg-white px-5 font-black text-slate-700">Cancel</button> : null}</div></div></form><section className="rounded-[2rem] border border-sky-100 bg-white/80 p-6 shadow-md"><h2 className="text-2xl font-black">Cards</h2>{activeCards.length ? <div className="mt-5 space-y-3">{activeCards.map((card) => <article key={card.id} className="rounded-2xl border border-slate-200 p-4"><p className="font-black">{card.front}</p><p className="mt-2 text-sm leading-6 text-slate-600">{card.back}</p><div className="mt-3 flex gap-2"><button type="button" onClick={() => editCard(card)} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-sky-100 px-3 text-sm font-black text-sky-800"><Edit3 size={15} /> Edit</button><button type="button" onClick={() => { if (window.confirm("Delete this card?")) onState(deleteCustomFlashcard(card.id).state); }} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-rose-100 px-3 text-sm font-black text-rose-800"><Trash2 size={15} /> Delete</button></div></article>)}</div> : <p className="mt-5 rounded-2xl border border-dashed border-sky-200 p-8 text-center font-bold text-slate-600">Add the first card to this deck.</p>}</section></section> : null}
  </div>;
}

function Field({ label, value, onChange, required }: { label: string; value: string; onChange: (value: string) => void; required?: boolean }) { return <label className="block font-black text-slate-700">{label}<input value={value} onChange={(event) => onChange(event.target.value)} required={required} className="mt-2 min-h-12 w-full rounded-2xl border border-purple-200 bg-white px-4 font-medium outline-none focus:border-purple-500" /></label>; }
function TextArea({ label, value, onChange, required }: { label: string; value: string; onChange: (value: string) => void; required?: boolean }) { return <label className="block font-black text-slate-700">{label}<textarea value={value} onChange={(event) => onChange(event.target.value)} required={required} className="mt-2 min-h-28 w-full resize-y rounded-2xl border border-sky-200 bg-white p-4 font-medium outline-none focus:border-sky-500" /></label>; }
