import type { WorkSimStageId } from "@/lib/workSims/catalog";

type Choice = { id: string; label: string };

type SingleSelectQuestion = {
  id: string;
  type: "single_select";
  prompt: string;
  choices: readonly Choice[];
};

type MultiSelectQuestion = {
  id: string;
  type: "multi_select";
  prompt: string;
  choices: readonly Choice[];
  minimumSelections: number;
  maximumSelections: number;
};

type NumericQuestion = {
  id: string;
  type: "numeric";
  prompt: string;
  minimum: number;
  maximum: number;
  unit: string;
};

type BooleanQuestion = {
  id: string;
  type: "boolean";
  prompt: string;
};

export type RetailProfitCrisisAssignment = {
  simulationId: "retail-profit-crisis-v1";
  stageId: WorkSimStageId;
  title: string;
  instructions: string;
  maximumScore: number;
  questions: readonly (
    | SingleSelectQuestion
    | MultiSelectQuestion
    | NumericQuestion
    | BooleanQuestion
  )[];
};

const DATA_QUALITY_CHOICES = [
  { id: "normalise-category", label: "Normalise category casing and trailing whitespace before grouping." },
  { id: "blank-coupon", label: "Treat every blank coupon code as an error and remove its order." },
  { id: "delete-bulk-order", label: "Delete the bulk order because it is an outlier." },
  { id: "normalise-return-reason", label: "Normalise return-reason casing and trailing whitespace before grouping." },
] as const;

export const RETAIL_PROFIT_CRISIS_ASSIGNMENTS: readonly RetailProfitCrisisAssignment[] = [
  {
    simulationId: "retail-profit-crisis-v1",
    stageId: "brief",
    title: "Manager brief",
    instructions: "Confirm that you understand the assignment before working with the data.",
    maximumScore: 0,
    questions: [
      {
        id: "confirmed",
        type: "boolean",
        prompt: "I understand that I must investigate growing revenue alongside weakening profitability.",
      },
    ],
  },
  {
    simulationId: "retail-profit-crisis-v1",
    stageId: "data-audit",
    title: "Data audit",
    instructions: "Identify the core relationship path and the data preparation choices that preserve valid business records.",
    maximumScore: 10,
    questions: [
      {
        id: "relationshipPath",
        type: "single_select",
        prompt: "Which table relationship path is the most useful starting point for item-level profitability analysis?",
        choices: [
          { id: "orders-items-products", label: "Orders → order items → products" },
          { id: "orders-products-customers", label: "Orders → products → customers" },
          { id: "customers-returns-shipments", label: "Customers → returns and refunds → shipments" },
        ],
      },
      {
        id: "qualityActions",
        type: "multi_select",
        prompt: "Select the data-quality actions that should be taken before grouped analysis.",
        choices: DATA_QUALITY_CHOICES,
        minimumSelections: 1,
        maximumSelections: 4,
      },
    ],
  },
  {
    simulationId: "retail-profit-crisis-v1",
    stageId: "kpi-diagnosis",
    title: "KPI diagnosis",
    instructions: "Calculate the headline KPIs from the full dataset and identify the commercial pressure behind the story.",
    maximumScore: 25,
    questions: [
      {
        id: "netRevenueInr",
        type: "numeric",
        prompt: "What is total net revenue? Enter the value in INR to two decimal places.",
        minimum: 0,
        maximum: 10_000_000,
        unit: "INR",
      },
      {
        id: "contributionMarginPercent",
        type: "numeric",
        prompt: "What is overall contribution margin? Enter the percentage, for example 4.2 for 4.2%.",
        minimum: -100,
        maximum: 100,
        unit: "%",
      },
      {
        id: "profitDriver",
        type: "single_select",
        prompt: "Which combination best explains why profit pressure can grow even as revenue rises?",
        choices: [
          { id: "cost-pressure", label: "Higher discounts, refunds, fulfilment costs, and cost of goods can outpace revenue growth." },
          { id: "order-count", label: "More orders always increase contribution margin by the same rate." },
          { id: "delivery-speed", label: "A faster delivery date automatically increases gross margin." },
        ],
      },
    ],
  },
  {
    simulationId: "retail-profit-crisis-v1",
    stageId: "sql-diagnosis",
    title: "SQL diagnosis",
    instructions: "Use grouped SQL analysis to identify the loss-making category, discount pressure, and regional delivery-cost signal.",
    maximumScore: 30,
    questions: [
      {
        id: "lossCategory",
        type: "single_select",
        prompt: "Which category is contributing the strongest loss signal?",
        choices: [
          { id: "electronics", label: "Electronics" },
          { id: "essentials", label: "Essentials" },
          { id: "fashion", label: "Fashion" },
          { id: "beauty", label: "Beauty" },
        ],
      },
      {
        id: "lowestProfitDiscountBand",
        type: "single_select",
        prompt: "Which discount band has the weakest contribution-profit result?",
        choices: [
          { id: "zero-nine", label: "0–9%" },
          { id: "ten-nineteen", label: "10–19%" },
          { id: "twenty-twentynine", label: "20–29%" },
          { id: "thirty-plus", label: "30%+" },
        ],
      },
      {
        id: "eastDeliveryCostInr",
        type: "numeric",
        prompt: "What is East-region delivery cost? Enter the value in INR to two decimal places.",
        minimum: 0,
        maximum: 1_000_000,
        unit: "INR",
      },
    ],
  },
  {
    simulationId: "retail-profit-crisis-v1",
    stageId: "excel-analysis",
    title: "Excel analysis",
    instructions: "Use a monthly spreadsheet summary to validate the direction of revenue and contribution-margin performance.",
    maximumScore: 20,
    questions: [
      {
        id: "revenueTrend",
        type: "single_select",
        prompt: "Across the six-month period, what happens to net revenue?",
        choices: [
          { id: "increased", label: "It increases." },
          { id: "decreased", label: "It decreases." },
          { id: "flat", label: "It stays broadly flat." },
        ],
      },
      {
        id: "marginTrend",
        type: "single_select",
        prompt: "Across the same period, what happens to contribution margin?",
        choices: [
          { id: "increased", label: "It increases." },
          { id: "decreased", label: "It decreases." },
          { id: "flat", label: "It stays broadly flat." },
        ],
      },
    ],
  },
  {
    simulationId: "retail-profit-crisis-v1",
    stageId: "dashboard-plan",
    title: "Dashboard plan",
    instructions: "Choose the visuals that would help management monitor the commercial and operational drivers of profit.",
    maximumScore: 10,
    questions: [
      {
        id: "visuals",
        type: "multi_select",
        prompt: "Select the three visuals that should be in the first management view.",
        choices: [
          { id: "monthly-trend", label: "Monthly net-revenue and contribution-margin trend" },
          { id: "category-profit", label: "Contribution profit by category" },
          { id: "regional-delivery", label: "Delivery cost and late-delivery rate by region" },
          { id: "raw-order-list", label: "A raw list of every order without aggregation" },
        ],
        minimumSelections: 1,
        maximumSelections: 3,
      },
    ],
  },
  {
    simulationId: "retail-profit-crisis-v1",
    stageId: "executive-summary",
    title: "Executive summary",
    instructions: "Prioritise an action and cite the evidence that makes it urgent for management.",
    maximumScore: 5,
    questions: [
      {
        id: "priorityAction",
        type: "single_select",
        prompt: "Which action is the strongest first recommendation?",
        choices: [
          { id: "review-electronics-discounts", label: "Review high-discount Electronics SKUs before expanding promotions." },
          { id: "remove-all-coupons", label: "Remove all coupon codes from every order immediately." },
          { id: "hide-return-data", label: "Exclude return data from the management view." },
        ],
      },
      {
        id: "supportingFindings",
        type: "multi_select",
        prompt: "Select the evidence that supports the recommendation.",
        choices: [
          { id: "discount-loss", label: "The 30%+ discount band has negative contribution profit." },
          { id: "east-cost", label: "East has the highest delivery cost per shipment." },
          { id: "bulk-order", label: "The single legitimate bulk order should be deleted." },
        ],
        minimumSelections: 1,
        maximumSelections: 3,
      },
    ],
  },
] as const;

export function getRetailProfitCrisisAssignment(stageId: string): RetailProfitCrisisAssignment | null {
  return RETAIL_PROFIT_CRISIS_ASSIGNMENTS.find((assignment) => assignment.stageId === stageId) ?? null;
}
