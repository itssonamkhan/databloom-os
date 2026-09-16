import "server-only";

import { RETAIL_PROFIT_CRISIS_ANSWER_FIXTURE } from "@/lib/server/workSims/retailProfitCrisisAnswerFixture";
import {
  parseRetailProfitCrisisAnswers,
  RETAIL_PROFIT_CRISIS_STAGE_MAXIMUMS,
  scoreRetailProfitCrisisAnswers,
} from "./retailProfitCrisisScoringCore.mjs";

type RetailStageId = keyof typeof RETAIL_PROFIT_CRISIS_STAGE_MAXIMUMS;

type ScoredSubmission = {
  stageId: RetailStageId;
  score: number;
  maximumScore: number;
};

function requireEntry<T>(entry: T | undefined): T {
  if (!entry) throw new Error("Retail Profit Crisis fixture is incomplete.");
  return entry;
}

const firstMonth = requireEntry(RETAIL_PROFIT_CRISIS_ANSWER_FIXTURE.monthlyTrend[0]);
const lastMonth = requireEntry(RETAIL_PROFIT_CRISIS_ANSWER_FIXTURE.monthlyTrend.at(-1));
const eastDelivery = requireEntry(
  RETAIL_PROFIT_CRISIS_ANSWER_FIXTURE.deliveryAndLatenessAnalysis.find((entry) => entry.region === "East"),
);
const lowestDiscountBand = requireEntry(
  [...RETAIL_PROFIT_CRISIS_ANSWER_FIXTURE.discountBandAnalysis]
    .sort((left, right) => left.contributionProfit - right.contributionProfit)[0],
);
const leadingLossSku = requireEntry(RETAIL_PROFIT_CRISIS_ANSWER_FIXTURE.lossMakingSkus[0]);

const DISCOUNT_BAND_IDS: Record<string, "zero-nine" | "ten-nineteen" | "twenty-twentynine" | "thirty-plus"> = {
  "0-9%": "zero-nine",
  "10-19%": "ten-nineteen",
  "20-29%": "twenty-twentynine",
  "30%+": "thirty-plus",
};

const SERVER_ONLY_EXPECTED_ANSWERS = Object.freeze({
  brief: {},
  "data-audit": {
    relationshipPath: "orders-items-products",
    qualityActions: ["normalise-category", "normalise-return-reason"],
  },
  "kpi-diagnosis": {
    netRevenueInr: RETAIL_PROFIT_CRISIS_ANSWER_FIXTURE.overallKpis.netRevenue,
    contributionMarginRate: RETAIL_PROFIT_CRISIS_ANSWER_FIXTURE.overallKpis.contributionMargin,
    profitDriver: "cost-pressure",
    currencyTolerance: RETAIL_PROFIT_CRISIS_ANSWER_FIXTURE.validationTolerances.currencyInr,
    rateTolerance: RETAIL_PROFIT_CRISIS_ANSWER_FIXTURE.validationTolerances.rate,
  },
  "sql-diagnosis": {
    lossCategory: leadingLossSku.category.toLowerCase(),
    lowestProfitDiscountBand: requireEntry(DISCOUNT_BAND_IDS[lowestDiscountBand.discountBand]),
    eastDeliveryCostInr: eastDelivery.deliveryCost,
    currencyTolerance: RETAIL_PROFIT_CRISIS_ANSWER_FIXTURE.validationTolerances.currencyInr,
  },
  "excel-analysis": {
    revenueTrend: lastMonth.netRevenue > firstMonth.netRevenue ? "increased" : "decreased",
    marginTrend: lastMonth.contributionMargin < firstMonth.contributionMargin ? "decreased" : "increased",
  },
  "dashboard-plan": {
    visuals: ["category-profit", "monthly-trend", "regional-delivery"],
  },
  "executive-summary": {
    priorityAction: "review-electronics-discounts",
    supportingFindings: ["discount-loss", "east-cost"],
  },
});

export function scoreRetailProfitCrisisSubmission(stageId: string, answers: unknown): ScoredSubmission | null {
  if (!Object.prototype.hasOwnProperty.call(RETAIL_PROFIT_CRISIS_STAGE_MAXIMUMS, stageId)) return null;
  const typedStageId = stageId as RetailStageId;
  const parsedAnswers = parseRetailProfitCrisisAnswers(
    typedStageId,
    answers,
  ) as Record<string, unknown> | null;
  if (!parsedAnswers) return null;
  const score = scoreRetailProfitCrisisAnswers(
    typedStageId,
    parsedAnswers,
    SERVER_ONLY_EXPECTED_ANSWERS[typedStageId],
  );
  const maximumScore = RETAIL_PROFIT_CRISIS_STAGE_MAXIMUMS[typedStageId];
  if (score === null || !Number.isInteger(score) || score < 0 || score > maximumScore) return null;
  return { stageId: typedStageId, score, maximumScore };
}
