import {
  defaultFlashcardDecks,
  defaultFlashcards,
  type FlashcardDeck,
  type FlashcardDefinition,
  type FlashcardDifficulty,
} from "@/lib/flashcardData";
import { loadSmartNotesState } from "@/lib/smartNotes";
import { unlockAchievement } from "@/lib/unlockedAchievements";

export const FLASHCARDS_STORAGE_KEY = "databloom-flashcards-v1";
export const FLASHCARDS_EVENT = "databloom:flashcards-updated";
export const FLASHCARD_XP_REWARD = 5;

export type ReviewRating = "easy" | "medium" | "hard";

export type FlashcardReview = {
  rating: ReviewRating | null;
  repetitions: number;
  intervalDays: number;
  nextReviewAt: string;
  lastReviewedAt: string | null;
  favorite: boolean;
  notes: string;
  rewarded: boolean;
};

export type FlashcardSession = {
  id: string;
  deckId: string;
  deckTitle: string;
  cardIds: string[];
  currentIndex: number;
  reviewedCardIds: string[];
  correctCount: number;
  startedAt: string;
  xpEarned: number;
};

export type FlashcardHistoryEntry = {
  id: string;
  deckId: string;
  deckTitle: string;
  startedAt: string;
  completedAt: string;
  durationSeconds: number;
  cardsReviewed: number;
  correctCount: number;
  accuracy: number;
  xpEarned: number;
};

export type FlashcardsState = {
  version: 1;
  customDecks: FlashcardDeck[];
  customCards: FlashcardDefinition[];
  reviews: Record<string, FlashcardReview>;
  favoriteDeckIds: string[];
  history: FlashcardHistoryEntry[];
  activeSession: FlashcardSession | null;
  totalXPEarned: number;
};

export type NoteFlashcardCandidate = {
  noteId: string;
  noteTitle: string;
  candidateId: string;
  front: string;
  back: string;
};

const emptyState = (): FlashcardsState => ({
  version: 1,
  customDecks: [],
  customCards: [],
  reviews: {},
  favoriteDeckIds: [],
  history: [],
  activeSession: null,
  totalXPEarned: 0,
});

function canUseStorage() {
  return typeof window !== "undefined" && "localStorage" in window;
}

function record(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function stringValue(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function stringList(value: unknown) {
  return Array.isArray(value)
    ? Array.from(new Set(value.filter((item): item is string => typeof item === "string")))
    : [];
}

function numberValue(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, value)
    : fallback;
}

function isDifficulty(value: unknown): value is FlashcardDifficulty {
  return value === "Beginner" || value === "Intermediate" || value === "Advanced";
}

function isRating(value: unknown): value is ReviewRating {
  return value === "easy" || value === "medium" || value === "hard";
}

function newId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeDeck(value: unknown): FlashcardDeck | null {
  const item = record(value);
  const id = stringValue(item.id);
  const title = stringValue(item.title);
  if (!id || !title) return null;
  const now = new Date().toISOString();
  const createdAt = stringValue(item.createdAt, now);
  return {
    id,
    title,
    description: stringValue(item.description),
    icon: stringValue(item.icon, "🗂️"),
    category: stringValue(item.category, "Custom"),
    difficulty: isDifficulty(item.difficulty) ? item.difficulty : "Beginner",
    custom: true,
    createdAt,
    updatedAt: stringValue(item.updatedAt, createdAt),
  };
}

function normalizeCard(value: unknown): FlashcardDefinition | null {
  const item = record(value);
  const id = stringValue(item.id);
  const deckId = stringValue(item.deckId);
  if (!id || !deckId) return null;
  const now = new Date().toISOString();
  const createdAt = stringValue(item.createdAt, now);
  const front = stringValue(item.front);
  const back = stringValue(item.back);
  return {
    id,
    deckId,
    front,
    back,
    difficulty: isDifficulty(item.difficulty) ? item.difficulty : "Beginner",
    category: stringValue(item.category, "Custom"),
    audio: { text: `${front} ${back}`.trim(), language: "en", ready: true },
    createdAt,
    updatedAt: stringValue(item.updatedAt, createdAt),
  };
}

function normalizeReview(value: unknown): FlashcardReview {
  const item = record(value);
  return {
    rating: isRating(item.rating) ? item.rating : null,
    repetitions: Math.floor(numberValue(item.repetitions)),
    intervalDays: Math.floor(numberValue(item.intervalDays)),
    nextReviewAt: stringValue(item.nextReviewAt, new Date(0).toISOString()),
    lastReviewedAt: typeof item.lastReviewedAt === "string" ? item.lastReviewedAt : null,
    favorite: item.favorite === true,
    notes: stringValue(item.notes),
    rewarded: item.rewarded === true,
  };
}

function normalizeSession(value: unknown): FlashcardSession | null {
  const item = record(value);
  const id = stringValue(item.id);
  const deckId = stringValue(item.deckId);
  const cardIds = stringList(item.cardIds);
  if (!id || !deckId || cardIds.length === 0) return null;
  return {
    id,
    deckId,
    deckTitle: stringValue(item.deckTitle, "Study session"),
    cardIds,
    currentIndex: Math.min(Math.floor(numberValue(item.currentIndex)), cardIds.length - 1),
    reviewedCardIds: stringList(item.reviewedCardIds).filter((cardId) => cardIds.includes(cardId)),
    correctCount: Math.floor(numberValue(item.correctCount)),
    startedAt: stringValue(item.startedAt, new Date().toISOString()),
    xpEarned: Math.floor(numberValue(item.xpEarned)),
  };
}

function normalizeHistory(value: unknown): FlashcardHistoryEntry | null {
  const item = record(value);
  const id = stringValue(item.id);
  if (!id) return null;
  const completedAt = stringValue(item.completedAt, new Date().toISOString());
  return {
    id,
    deckId: stringValue(item.deckId),
    deckTitle: stringValue(item.deckTitle, "Study session"),
    startedAt: stringValue(item.startedAt, completedAt),
    completedAt,
    durationSeconds: Math.floor(numberValue(item.durationSeconds)),
    cardsReviewed: Math.floor(numberValue(item.cardsReviewed)),
    correctCount: Math.floor(numberValue(item.correctCount)),
    accuracy: Math.min(100, Math.round(numberValue(item.accuracy))),
    xpEarned: Math.floor(numberValue(item.xpEarned)),
  };
}

export function loadFlashcardsState(): FlashcardsState {
  if (!canUseStorage()) return emptyState();
  try {
    const raw = window.localStorage.getItem(FLASHCARDS_STORAGE_KEY);
    if (!raw) return emptyState();
    const value = record(JSON.parse(raw));
    const reviews = Object.fromEntries(
      Object.entries(record(value.reviews)).map(([id, review]) => [id, normalizeReview(review)]),
    );
    return {
      version: 1,
      customDecks: Array.isArray(value.customDecks)
        ? value.customDecks.map(normalizeDeck).filter((item): item is FlashcardDeck => Boolean(item))
        : [],
      customCards: Array.isArray(value.customCards)
        ? value.customCards.map(normalizeCard).filter((item): item is FlashcardDefinition => Boolean(item))
        : [],
      reviews,
      favoriteDeckIds: stringList(value.favoriteDeckIds),
      history: Array.isArray(value.history)
        ? value.history.map(normalizeHistory).filter((item): item is FlashcardHistoryEntry => Boolean(item)).slice(0, 100)
        : [],
      activeSession: normalizeSession(value.activeSession),
      totalXPEarned: Math.floor(numberValue(value.totalXPEarned)),
    };
  } catch {
    return emptyState();
  }
}

export function saveFlashcardsState(state: FlashcardsState, reason = "updated") {
  if (!canUseStorage()) return false;
  try {
    window.localStorage.setItem(FLASHCARDS_STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new CustomEvent(FLASHCARDS_EVENT, { detail: { reason } }));
    return true;
  } catch {
    return false;
  }
}

export function getAllFlashcardDecks(state = loadFlashcardsState()) {
  return [...defaultFlashcardDecks, ...state.customDecks];
}

export function getAllFlashcards(state = loadFlashcardsState()) {
  return [...defaultFlashcards, ...state.customCards];
}

export function getDeckCards(deckId: string, state = loadFlashcardsState()) {
  return getAllFlashcards(state).filter((card) => card.deckId === deckId);
}

export function getCardReview(cardId: string, state = loadFlashcardsState()) {
  return state.reviews[cardId] ?? normalizeReview(undefined);
}

export function isFlashcardDue(cardId: string, state = loadFlashcardsState(), now = new Date()) {
  const review = state.reviews[cardId];
  return !review?.lastReviewedAt || Date.parse(review.nextReviewAt) <= now.getTime();
}

export function getDueFlashcards(state = loadFlashcardsState(), now = new Date()) {
  return getAllFlashcards(state).filter((card) => isFlashcardDue(card.id, state, now));
}

function nextInterval(rating: ReviewRating, previous: FlashcardReview) {
  if (rating === "hard") return 1;
  if (rating === "medium") return previous.intervalDays > 0 ? Math.max(3, Math.round(previous.intervalDays * 1.8)) : 3;
  return previous.intervalDays > 0 ? Math.max(7, Math.round(previous.intervalDays * 2.5)) : 7;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next.toISOString();
}

export function startFlashcardSession(deckId: string, cardIds?: string[]) {
  const current = loadFlashcardsState();
  const decks = getAllFlashcardDecks(current);
  const deck = decks.find((item) => item.id === deckId);
  const availableIds = getAllFlashcards(current).map((card) => card.id);
  const selected = (cardIds ?? getDeckCards(deckId, current).map((card) => card.id))
    .filter((id, index, values) => availableIds.includes(id) && values.indexOf(id) === index);
  if (selected.length === 0) return { state: current, session: null };
  const session: FlashcardSession = {
    id: newId("flashcard-session"),
    deckId,
    deckTitle: deck?.title ?? (deckId === "daily-review" ? "Daily Review" : "Study session"),
    cardIds: selected,
    currentIndex: 0,
    reviewedCardIds: [],
    correctCount: 0,
    startedAt: new Date().toISOString(),
    xpEarned: 0,
  };
  const next = { ...current, activeSession: session };
  const saved = saveFlashcardsState(next, "session-started");
  return { state: saved ? next : current, session: saved ? session : null };
}

export function updateFlashcardSessionIndex(index: number) {
  const current = loadFlashcardsState();
  if (!current.activeSession) return current;
  const currentIndex = Math.max(0, Math.min(index, current.activeSession.cardIds.length - 1));
  const next = { ...current, activeSession: { ...current.activeSession, currentIndex } };
  return saveFlashcardsState(next, "session-navigation") ? next : current;
}

export function shuffleFlashcardSession() {
  const current = loadFlashcardsState();
  if (!current.activeSession) return current;
  const cardIds = [...current.activeSession.cardIds];
  for (let index = cardIds.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [cardIds[index], cardIds[swapIndex]] = [cardIds[swapIndex], cardIds[index]];
  }
  const next = { ...current, activeSession: { ...current.activeSession, cardIds, currentIndex: 0 } };
  return saveFlashcardsState(next, "session-shuffled") ? next : current;
}

export function rateFlashcard(cardId: string, rating: ReviewRating) {
  const current = loadFlashcardsState();
  const cardExists = getAllFlashcards(current).some((card) => card.id === cardId);
  if (!cardExists) return { state: current, xpAward: 0, newlyReviewed: false };
  const previous = getCardReview(cardId, current);
  const now = new Date();
  const intervalDays = nextInterval(rating, previous);
  const review: FlashcardReview = {
    ...previous,
    rating,
    repetitions: previous.repetitions + 1,
    intervalDays,
    lastReviewedAt: now.toISOString(),
    nextReviewAt: addDays(now, intervalDays),
    rewarded: true,
  };
  const xpAward = previous.rewarded ? 0 : FLASHCARD_XP_REWARD;
  let activeSession = current.activeSession;
  let newlyReviewed = false;
  if (activeSession?.cardIds.includes(cardId)) {
    newlyReviewed = !activeSession.reviewedCardIds.includes(cardId);
    activeSession = {
      ...activeSession,
      reviewedCardIds: newlyReviewed
        ? [...activeSession.reviewedCardIds, cardId]
        : activeSession.reviewedCardIds,
      correctCount: newlyReviewed && rating !== "hard"
        ? activeSession.correctCount + 1
        : activeSession.correctCount,
      xpEarned: activeSession.xpEarned + xpAward,
    };
  }
  const next = {
    ...current,
    reviews: { ...current.reviews, [cardId]: review },
    activeSession,
    totalXPEarned: current.totalXPEarned + xpAward,
  };
  const saved = saveFlashcardsState(next, "card-reviewed");
  if (saved) unlockAchievement("flashcards_starter");
  return { state: saved ? next : current, xpAward: saved ? xpAward : 0, newlyReviewed: saved && newlyReviewed };
}

export function finishFlashcardSession() {
  const current = loadFlashcardsState();
  const session = current.activeSession;
  if (!session || session.reviewedCardIds.length < session.cardIds.length) {
    return { state: current, entry: null };
  }
  const completedAt = new Date();
  const durationSeconds = Math.max(1, Math.round((completedAt.getTime() - Date.parse(session.startedAt)) / 1000));
  const cardsReviewed = session.reviewedCardIds.length;
  const entry: FlashcardHistoryEntry = {
    id: session.id,
    deckId: session.deckId,
    deckTitle: session.deckTitle,
    startedAt: session.startedAt,
    completedAt: completedAt.toISOString(),
    durationSeconds,
    cardsReviewed,
    correctCount: session.correctCount,
    accuracy: cardsReviewed > 0 ? Math.round((session.correctCount / cardsReviewed) * 100) : 0,
    xpEarned: session.xpEarned,
  };
  const next = { ...current, history: [entry, ...current.history].slice(0, 100), activeSession: null };
  const saved = saveFlashcardsState(next, "session-completed");
  if (saved) unlockAchievement("flashcards_finisher");
  return { state: saved ? next : current, entry: saved ? entry : null };
}

export function abandonFlashcardSession() {
  const current = loadFlashcardsState();
  if (!current.activeSession) return current;
  const next = { ...current, activeSession: null };
  return saveFlashcardsState(next, "session-abandoned") ? next : current;
}

export function toggleFavoriteDeck(deckId: string) {
  const current = loadFlashcardsState();
  const favoriteDeckIds = current.favoriteDeckIds.includes(deckId)
    ? current.favoriteDeckIds.filter((id) => id !== deckId)
    : [...current.favoriteDeckIds, deckId];
  const next = { ...current, favoriteDeckIds };
  return saveFlashcardsState(next, "deck-favorite") ? next : current;
}

export function toggleFavoriteFlashcard(cardId: string) {
  const current = loadFlashcardsState();
  const previous = getCardReview(cardId, current);
  const next = {
    ...current,
    reviews: { ...current.reviews, [cardId]: { ...previous, favorite: !previous.favorite } },
  };
  return saveFlashcardsState(next, "card-favorite") ? next : current;
}

export function saveFlashcardNotes(cardId: string, notes: string) {
  const current = loadFlashcardsState();
  const previous = getCardReview(cardId, current);
  const next = { ...current, reviews: { ...current.reviews, [cardId]: { ...previous, notes } } };
  return saveFlashcardsState(next, "card-notes") ? next : current;
}

export function createCustomDeck(input: {
  title: string;
  description?: string;
  category?: string;
  difficulty?: FlashcardDifficulty;
}) {
  const current = loadFlashcardsState();
  const title = input.title.trim();
  if (!title) return { state: current, deck: null };
  const now = new Date().toISOString();
  const deck: FlashcardDeck = {
    id: newId("custom-deck"),
    title,
    description: input.description?.trim() || "A personal study deck.",
    icon: "🗂️",
    category: input.category?.trim() || "Custom",
    difficulty: input.difficulty ?? "Beginner",
    custom: true,
    createdAt: now,
    updatedAt: now,
  };
  const next = { ...current, customDecks: [deck, ...current.customDecks] };
  const saved = saveFlashcardsState(next, "deck-created");
  return { state: saved ? next : current, deck: saved ? deck : null };
}

export function renameCustomDeck(deckId: string, title: string) {
  const current = loadFlashcardsState();
  const cleanTitle = title.trim();
  if (!cleanTitle) return { state: current, saved: false };
  let found = false;
  const customDecks = current.customDecks.map((deck) => {
    if (deck.id !== deckId) return deck;
    found = true;
    return { ...deck, title: cleanTitle, updatedAt: new Date().toISOString() };
  });
  if (!found) return { state: current, saved: false };
  const next = { ...current, customDecks };
  const saved = saveFlashcardsState(next, "deck-renamed");
  return { state: saved ? next : current, saved };
}

export function deleteCustomDeck(deckId: string) {
  const current = loadFlashcardsState();
  if (!current.customDecks.some((deck) => deck.id === deckId)) return { state: current, saved: false };
  const cardIds = new Set(current.customCards.filter((card) => card.deckId === deckId).map((card) => card.id));
  const next = {
    ...current,
    customDecks: current.customDecks.filter((deck) => deck.id !== deckId),
    customCards: current.customCards.filter((card) => card.deckId !== deckId),
    favoriteDeckIds: current.favoriteDeckIds.filter((id) => id !== deckId),
    activeSession: current.activeSession?.deckId === deckId ? null : current.activeSession,
    reviews: Object.fromEntries(Object.entries(current.reviews).filter(([id]) => !cardIds.has(id))),
  };
  const saved = saveFlashcardsState(next, "deck-deleted");
  return { state: saved ? next : current, saved };
}

export function saveCustomFlashcard(input: {
  id?: string;
  deckId: string;
  front: string;
  back: string;
  difficulty?: FlashcardDifficulty;
}) {
  const current = loadFlashcardsState();
  const deck = current.customDecks.find((item) => item.id === input.deckId);
  const front = input.front.trim();
  const back = input.back.trim();
  if (!deck || !front || !back) return { state: current, card: null };
  const now = new Date().toISOString();
  const existing = input.id ? current.customCards.find((card) => card.id === input.id) : undefined;
  const card: FlashcardDefinition = {
    id: existing?.id ?? newId("custom-card"),
    deckId: deck.id,
    front,
    back,
    difficulty: input.difficulty ?? existing?.difficulty ?? deck.difficulty,
    category: deck.category,
    audio: { text: `${front} ${back}`, language: "en", ready: true },
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  const customCards = existing
    ? current.customCards.map((item) => item.id === card.id ? card : item)
    : [card, ...current.customCards];
  const next = { ...current, customCards };
  const saved = saveFlashcardsState(next, existing ? "card-edited" : "card-created");
  return { state: saved ? next : current, card: saved ? card : null };
}

export function deleteCustomFlashcard(cardId: string) {
  const current = loadFlashcardsState();
  if (!current.customCards.some((card) => card.id === cardId)) return { state: current, saved: false };
  const next = {
    ...current,
    customCards: current.customCards.filter((card) => card.id !== cardId),
    reviews: Object.fromEntries(Object.entries(current.reviews).filter(([id]) => id !== cardId)),
    activeSession: current.activeSession?.cardIds.includes(cardId) ? null : current.activeSession,
  };
  const saved = saveFlashcardsState(next, "card-deleted");
  return { state: saved ? next : current, saved };
}

export function getPreparedNoteFlashcardCandidates(): NoteFlashcardCandidate[] {
  return loadSmartNotesState().notes.flatMap((note) =>
    note.flashcardCandidates.map((candidate) => ({
      noteId: note.id,
      noteTitle: note.title,
      candidateId: candidate.id,
      front: candidate.front,
      back: candidate.back,
    })),
  );
}

export function getFlashcardsSummary(state = loadFlashcardsState()) {
  const cards = getAllFlashcards(state);
  const reviewedIds = Object.entries(state.reviews)
    .filter(([, review]) => Boolean(review.lastReviewedAt))
    .map(([id]) => id)
    .filter((id) => cards.some((card) => card.id === id));
  const totalReviewed = state.history.reduce((sum, entry) => sum + entry.cardsReviewed, 0);
  const totalCorrect = state.history.reduce((sum, entry) => sum + entry.correctCount, 0);
  const studySeconds = state.history.reduce((sum, entry) => sum + entry.durationSeconds, 0);
  const deckIds = new Set(state.history.map((entry) => entry.deckId));
  const dueToday = getDueFlashcards(state).length;
  return {
    totalDecks: getAllFlashcardDecks(state).length,
    customDecks: state.customDecks.length,
    totalCards: cards.length,
    uniqueCardsStudied: reviewedIds.length,
    cardsStudied: totalReviewed,
    decksCompleted: deckIds.size,
    sessions: state.history.length,
    accuracy: totalReviewed > 0 ? Math.round((totalCorrect / totalReviewed) * 100) : 0,
    studySeconds,
    studyMinutes: Math.round(studySeconds / 60),
    xpEarned: state.totalXPEarned,
    dueToday,
    favoriteDecks: state.favoriteDeckIds.length,
    favoriteCards: Object.values(state.reviews).filter((review) => review.favorite).length,
    progressPercentage: cards.length > 0 ? Math.round((reviewedIds.length / cards.length) * 100) : 0,
  };
}
