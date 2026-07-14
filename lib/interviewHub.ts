import {
  getInterviewQuestion,
  interviewQuestions,
  resumeChecklistItems,
  type InterviewCategory,
  type InterviewDifficulty,
} from "@/lib/interviewQuestions";
import { unlockAchievement } from "@/lib/unlockedAchievements";

export const INTERVIEW_HUB_STORAGE_KEY = "databloom-interview-hub-v1";
export const INTERVIEW_HUB_EVENT = "databloom:interview-hub-updated";

export type MockResponse = {
  answer: string;
  rating: number;
};

export type ActiveMockInterview = {
  id: string;
  category: InterviewCategory | "All";
  topic: string;
  difficulty: InterviewDifficulty | "All";
  questionIds: string[];
  currentIndex: number;
  responses: Record<string, MockResponse>;
  xpEarned: number;
  startedAt: string;
};

export type MockInterviewHistory = {
  id: string;
  date: string;
  category: string;
  topic: string;
  difficulty: string;
  questionCount: number;
  score: number;
  time: number;
  xpEarned: number;
  feedbackSummary: string;
};

export type InterviewQuestionRating = {
  attempts: number;
  totalRating: number;
};

export type InterviewHubState = {
  version: 1;
  learnedQuestionIds: string[];
  rewardedQuestionIds: string[];
  favoriteQuestionIds: string[];
  notes: Record<string, string>;
  practicedAt: Record<string, string>;
  questionRatings: Record<string, InterviewQuestionRating>;
  mockHistory: MockInterviewHistory[];
  activeMock: ActiveMockInterview | null;
  checklistCompletedIds: string[];
};

const emptyState = (): InterviewHubState => ({
  version: 1,
  learnedQuestionIds: [],
  rewardedQuestionIds: [],
  favoriteQuestionIds: [],
  notes: {},
  practicedAt: {},
  questionRatings: {},
  mockHistory: [],
  activeMock: null,
  checklistCompletedIds: [],
});

function canUseStorage() {
  return typeof window !== "undefined" && "localStorage" in window;
}

function uniqueStrings(value: unknown) {
  return Array.isArray(value)
    ? Array.from(
        new Set(value.filter((item): item is string => typeof item === "string")),
      )
    : [];
}

function nonNegativeNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, value)
    : 0;
}

function stringRecord(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value).filter((entry): entry is [string, string] =>
      typeof entry[1] === "string",
    ),
  );
}

function normalizeRatings(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const ratings: Record<string, InterviewQuestionRating> = {};
  for (const [id, raw] of Object.entries(value)) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) continue;
    const rating = raw as Partial<InterviewQuestionRating>;
    ratings[id] = {
      attempts: nonNegativeNumber(rating.attempts),
      totalRating: nonNegativeNumber(rating.totalRating),
    };
  }
  return ratings;
}

function normalizeResponses(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const responses: Record<string, MockResponse> = {};
  for (const [id, raw] of Object.entries(value)) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) continue;
    const response = raw as Partial<MockResponse>;
    responses[id] = {
      answer: typeof response.answer === "string" ? response.answer : "",
      rating: Math.min(5, Math.max(1, nonNegativeNumber(response.rating))),
    };
  }
  return responses;
}

function normalizeActiveMock(value: unknown): ActiveMockInterview | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const mock = value as Partial<ActiveMockInterview>;
  const questionIds = uniqueStrings(mock.questionIds).filter((id) =>
    Boolean(getInterviewQuestion(id)),
  );
  if (!mock.id || questionIds.length === 0) return null;
  return {
    id: mock.id,
    category:
      typeof mock.category === "string"
        ? (mock.category as InterviewCategory | "All")
        : "All",
    topic: typeof mock.topic === "string" ? mock.topic : "All",
    difficulty:
      typeof mock.difficulty === "string"
        ? (mock.difficulty as InterviewDifficulty | "All")
        : "All",
    questionIds,
    currentIndex: Math.min(
      questionIds.length - 1,
      Math.floor(nonNegativeNumber(mock.currentIndex)),
    ),
    responses: normalizeResponses(mock.responses),
    xpEarned: nonNegativeNumber(mock.xpEarned),
    startedAt:
      typeof mock.startedAt === "string"
        ? mock.startedAt
        : new Date().toISOString(),
  };
}

function normalizeHistory(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .filter(
      (item): item is Record<string, unknown> =>
        Boolean(item) && typeof item === "object" && !Array.isArray(item),
    )
    .map((item) => ({
      id: typeof item.id === "string" ? item.id : createId("mock"),
      date: typeof item.date === "string" ? item.date : new Date().toISOString(),
      category: typeof item.category === "string" ? item.category : "All",
      topic: typeof item.topic === "string" ? item.topic : "All topics",
      difficulty:
        typeof item.difficulty === "string" ? item.difficulty : "Mixed",
      questionCount: nonNegativeNumber(item.questionCount),
      score: Math.min(100, nonNegativeNumber(item.score)),
      time: nonNegativeNumber(item.time),
      xpEarned: nonNegativeNumber(item.xpEarned),
      feedbackSummary:
        typeof item.feedbackSummary === "string"
          ? item.feedbackSummary
          : "Keep practicing concise, evidence-backed answers.",
    }))
    .slice(-100);
}

function normalizeState(value: unknown): InterviewHubState {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return emptyState();
  }
  const state = value as Partial<InterviewHubState>;
  return {
    version: 1,
    learnedQuestionIds: uniqueStrings(state.learnedQuestionIds),
    rewardedQuestionIds: uniqueStrings(state.rewardedQuestionIds),
    favoriteQuestionIds: uniqueStrings(state.favoriteQuestionIds),
    notes: stringRecord(state.notes),
    practicedAt: stringRecord(state.practicedAt),
    questionRatings: normalizeRatings(state.questionRatings),
    mockHistory: normalizeHistory(state.mockHistory),
    activeMock: normalizeActiveMock(state.activeMock),
    checklistCompletedIds: uniqueStrings(state.checklistCompletedIds),
  };
}

export function loadInterviewHubState(): InterviewHubState {
  if (!canUseStorage()) return emptyState();
  try {
    const saved = window.localStorage.getItem(INTERVIEW_HUB_STORAGE_KEY);
    return saved ? normalizeState(JSON.parse(saved)) : emptyState();
  } catch {
    return emptyState();
  }
}

function saveInterviewHubState(state: InterviewHubState, reason: string) {
  if (!canUseStorage()) return false;
  try {
    window.localStorage.setItem(INTERVIEW_HUB_STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(
      new CustomEvent(INTERVIEW_HUB_EVENT, { detail: { reason, state } }),
    );
    return true;
  } catch {
    return false;
  }
}

function createId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function uniqueQuestionIds(ids: string[]) {
  return Array.from(new Set(ids)).filter((id) => Boolean(getInterviewQuestion(id)));
}

function checkLearningAchievements(state: InterviewHubState) {
  if (state.learnedQuestionIds.length >= 1) unlockAchievement("interview_starter");
  if (state.learnedQuestionIds.length >= 50) unlockAchievement("interview_ready");
}

export function markInterviewQuestionLearned(questionId: string) {
  const state = loadInterviewHubState();
  const question = getInterviewQuestion(questionId);
  if (!question) {
    return { saved: false, newlyLearned: false, newlyRewarded: false, xpAward: 0, state };
  }
  const newlyLearned = !state.learnedQuestionIds.includes(questionId);
  const newlyRewarded = !state.rewardedQuestionIds.includes(questionId);
  const next: InterviewHubState = {
    ...state,
    learnedQuestionIds: newlyLearned
      ? [...state.learnedQuestionIds, questionId]
      : state.learnedQuestionIds,
    rewardedQuestionIds: newlyRewarded
      ? [...state.rewardedQuestionIds, questionId]
      : state.rewardedQuestionIds,
    practicedAt: { ...state.practicedAt, [questionId]: new Date().toISOString() },
  };
  const saved = saveInterviewHubState(next, "question-learned");
  if (saved) checkLearningAchievements(next);
  return {
    saved,
    newlyLearned: saved && newlyLearned,
    newlyRewarded: saved && newlyRewarded,
    xpAward: saved && newlyRewarded ? question.xpReward : 0,
    state: saved ? next : state,
  };
}

export function toggleInterviewFavorite(questionId: string) {
  const state = loadInterviewHubState();
  const favoriteQuestionIds = state.favoriteQuestionIds.includes(questionId)
    ? state.favoriteQuestionIds.filter((id) => id !== questionId)
    : [...state.favoriteQuestionIds, questionId];
  const next = { ...state, favoriteQuestionIds };
  return saveInterviewHubState(next, "favorite-updated") ? next : state;
}

export function saveInterviewNote(questionId: string, note: string) {
  const state = loadInterviewHubState();
  const notes = { ...state.notes };
  if (note.trim()) notes[questionId] = note;
  else delete notes[questionId];
  return saveInterviewHubState({ ...state, notes }, "note-updated");
}

export function toggleResumeChecklistItem(itemId: string) {
  const state = loadInterviewHubState();
  if (!resumeChecklistItems.some((item) => item.id === itemId)) return state;
  const checklistCompletedIds = state.checklistCompletedIds.includes(itemId)
    ? state.checklistCompletedIds.filter((id) => id !== itemId)
    : [...state.checklistCompletedIds, itemId];
  const next = { ...state, checklistCompletedIds };
  if (saveInterviewHubState(next, "checklist-updated")) {
    if (checklistCompletedIds.length === resumeChecklistItems.length) {
      unlockAchievement("portfolio_ready");
    }
    return next;
  }
  return state;
}

function shuffled<T>(items: T[]) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[randomIndex]] = [result[randomIndex], result[index]];
  }
  return result;
}

export function startMockInterview(options: {
  category: InterviewCategory | "All";
  topic: string;
  difficulty: InterviewDifficulty | "All";
  questionCount?: number;
}) {
  const state = loadInterviewHubState();
  const pool = interviewQuestions.filter(
    (question) =>
      (options.category === "All" || question.category === options.category) &&
      (options.topic === "All" || question.topic === options.topic) &&
      (options.difficulty === "All" || question.difficulty === options.difficulty),
  );
  if (pool.length === 0) return null;
  const selected = shuffled(pool).slice(0, Math.min(options.questionCount ?? 5, pool.length));
  const activeMock: ActiveMockInterview = {
    id: createId("mock"),
    category: options.category,
    topic: options.topic,
    difficulty: options.difficulty,
    questionIds: selected.map((question) => question.id),
    currentIndex: 0,
    responses: {},
    xpEarned: 0,
    startedAt: new Date().toISOString(),
  };
  return saveInterviewHubState(
    { ...state, activeMock },
    "mock-started",
  )
    ? activeMock
    : null;
}

export function recordMockResponse(
  questionId: string,
  answer: string,
  rating: number,
) {
  const state = loadInterviewHubState();
  const activeMock = state.activeMock;
  const question = getInterviewQuestion(questionId);
  if (!activeMock || !question || !activeMock.questionIds.includes(questionId)) {
    return { saved: false, newlyRewarded: false, xpAward: 0, state };
  }
  const normalizedRating = Math.min(5, Math.max(1, Math.round(rating)));
  const previousResponse = activeMock.responses[questionId];
  const newlyRewarded = !state.rewardedQuestionIds.includes(questionId);
  const ratingHistory = state.questionRatings[questionId] ?? {
    attempts: 0,
    totalRating: 0,
  };
  const xpAward = newlyRewarded ? question.xpReward : 0;
  const nextActiveMock: ActiveMockInterview = {
    ...activeMock,
    responses: {
      ...activeMock.responses,
      [questionId]: { answer: answer.trim(), rating: normalizedRating },
    },
    xpEarned: activeMock.xpEarned + xpAward,
  };
  const next: InterviewHubState = {
    ...state,
    learnedQuestionIds: Array.from(
      new Set([...state.learnedQuestionIds, questionId]),
    ),
    rewardedQuestionIds: newlyRewarded
      ? [...state.rewardedQuestionIds, questionId]
      : state.rewardedQuestionIds,
    practicedAt: { ...state.practicedAt, [questionId]: new Date().toISOString() },
    questionRatings: previousResponse
      ? state.questionRatings
      : {
          ...state.questionRatings,
          [questionId]: {
            attempts: ratingHistory.attempts + 1,
            totalRating: ratingHistory.totalRating + normalizedRating,
          },
        },
    activeMock: nextActiveMock,
  };
  const saved = saveInterviewHubState(next, "mock-response-recorded");
  if (saved) checkLearningAchievements(next);
  return {
    saved,
    newlyRewarded: saved && newlyRewarded,
    xpAward: saved ? xpAward : 0,
    state: saved ? next : state,
  };
}

export function advanceMockInterview() {
  const state = loadInterviewHubState();
  if (!state.activeMock) return null;
  const activeMock = {
    ...state.activeMock,
    currentIndex: Math.min(
      state.activeMock.questionIds.length - 1,
      state.activeMock.currentIndex + 1,
    ),
  };
  return saveInterviewHubState(
    { ...state, activeMock },
    "mock-advanced",
  )
    ? activeMock
    : null;
}

function mockFeedback(activeMock: ActiveMockInterview) {
  const responses = Object.entries(activeMock.responses);
  if (responses.length === 0) return "Complete more answers to build feedback.";
  const weakTopics = Array.from(
    new Set(
      responses
        .filter(([, response]) => response.rating <= 3)
        .map(([id]) => getInterviewQuestion(id)?.topic)
        .filter((topic): topic is string => Boolean(topic)),
    ),
  );
  const average =
    responses.reduce((total, [, response]) => total + response.rating, 0) /
    responses.length;
  const lead =
    average >= 4
      ? "Strong interview readiness: your answers were focused and well supported."
      : average >= 3
        ? "Developing readiness: your core ideas are sound; make examples more specific and measurable."
        : "Keep practicing: structure each answer around a clear idea, evidence, and outcome.";
  return weakTopics.length
    ? `${lead} Review: ${weakTopics.slice(0, 3).join(", ")}.`
    : `${lead} Continue practicing concise delivery under time pressure.`;
}

export function completeMockInterview(elapsedSeconds: number) {
  const state = loadInterviewHubState();
  const activeMock = state.activeMock;
  if (!activeMock) return { completed: false, entry: null, state };
  const responses = Object.values(activeMock.responses);
  const score = responses.length
    ? Math.round(
        (responses.reduce((total, response) => total + response.rating, 0) /
          (responses.length * 5)) *
          100,
      )
    : 0;
  const entry: MockInterviewHistory = {
    id: activeMock.id,
    date: new Date().toISOString(),
    category: activeMock.category,
    topic: activeMock.topic === "All" ? "Mixed topics" : activeMock.topic,
    difficulty: activeMock.difficulty,
    questionCount: activeMock.questionIds.length,
    score,
    time: Math.max(0, Math.round(elapsedSeconds)),
    xpEarned: activeMock.xpEarned,
    feedbackSummary: mockFeedback(activeMock),
  };
  if (state.mockHistory.some((history) => history.id === entry.id)) {
    return { completed: false, entry: null, state };
  }
  const next: InterviewHubState = {
    ...state,
    mockHistory: [...state.mockHistory, entry].slice(-100),
    activeMock: null,
  };
  const saved = saveInterviewHubState(next, "mock-completed");
  if (saved) unlockAchievement("mock_interviewer");
  return { completed: saved, entry: saved ? entry : null, state: saved ? next : state };
}

export function abandonMockInterview() {
  const state = loadInterviewHubState();
  if (!state.activeMock) return true;
  return saveInterviewHubState({ ...state, activeMock: null }, "mock-abandoned");
}

export function getRecommendedInterviewQuestions(
  state = loadInterviewHubState(),
) {
  return [...interviewQuestions].sort((left, right) => {
    const leftRating = state.questionRatings[left.id];
    const rightRating = state.questionRatings[right.id];
    const leftAverage = leftRating
      ? leftRating.totalRating / Math.max(1, leftRating.attempts)
      : 6;
    const rightAverage = rightRating
      ? rightRating.totalRating / Math.max(1, rightRating.attempts)
      : 6;
    if (leftAverage !== rightAverage) return leftAverage - rightAverage;
    const leftLearned = state.learnedQuestionIds.includes(left.id) ? 1 : 0;
    const rightLearned = state.learnedQuestionIds.includes(right.id) ? 1 : 0;
    if (leftLearned !== rightLearned) return leftLearned - rightLearned;
    return left.id.localeCompare(right.id);
  });
}

export function getInterviewSummary(state = loadInterviewHubState()) {
  const sessions = state.mockHistory.length;
  const averageScore = sessions
    ? Math.round(
        state.mockHistory.reduce((total, item) => total + item.score, 0) /
          sessions,
      )
    : 0;
  const checklistTotal = resumeChecklistItems.length;
  return {
    learned: uniqueQuestionIds(state.learnedQuestionIds).length,
    favorites: uniqueQuestionIds(state.favoriteQuestionIds).length,
    sessions,
    averageScore,
    checklistCompleted: state.checklistCompletedIds.filter((id) =>
      resumeChecklistItems.some((item) => item.id === id),
    ).length,
    checklistTotal,
    progressPercentage: Math.round(
      (uniqueQuestionIds(state.learnedQuestionIds).length /
        interviewQuestions.length) *
        100,
    ),
  };
}
