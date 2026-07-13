import type { BusinessAnalyticsCategory } from "@/lib/businessAnalyticsLessons";

export type BusinessAnalyticsDataset = {
  id: "sales" | "retention" | "funnel" | "inventory" | "attrition" | "variance";
  title: string;
  description: string;
  task: string;
  downloadPath: string;
  columns: readonly string[];
  rows: readonly (readonly string[])[];
};

export const businessAnalyticsDatasets: BusinessAnalyticsDataset[] = [
  {
    id: "sales",
    title: "Sales performance",
    description: "Monthly seller and region results with targets, pipeline, wins, discounts, revenue, and gross profit.",
    task: "Explain target variance and recommend where sales leadership should focus next month.",
    downloadPath: "/datasets/business-analytics-sales-performance.csv",
    columns: ["Month", "Region", "Seller", "Target", "Revenue", "Gross Profit"],
    rows: [
      ["2026-04", "North", "Aarav", "1250000", "1180000", "354000"],
      ["2026-04", "West", "Meera", "1100000", "1265000", "417450"],
      ["2026-05", "South", "Kabir", "950000", "812000", "227360"],
    ],
  },
  {
    id: "retention",
    title: "Customer retention",
    description: "Subscription cohorts with acquisition channel, plan, activity, churn, revenue, and support history.",
    task: "Compare retention cohorts, identify the highest-risk segment, and propose a measurable intervention.",
    downloadPath: "/datasets/business-analytics-customer-retention.csv",
    columns: ["CustomerID", "Cohort", "Channel", "Plan", "Months Active", "Churned"],
    rows: [
      ["CU-1001", "2026-01", "Organic", "Pro", "6", "No"],
      ["CU-1002", "2026-01", "Paid Search", "Starter", "2", "Yes"],
      ["CU-1003", "2026-02", "Partner", "Pro", "5", "No"],
    ],
  },
  {
    id: "funnel",
    title: "Marketing funnel",
    description: "Campaign spend and user movement from impression through qualified lead, purchase, and revenue.",
    task: "Locate the most important funnel leak and recommend a campaign allocation test.",
    downloadPath: "/datasets/business-analytics-marketing-funnel.csv",
    columns: ["Campaign", "Channel", "Spend", "Visitors", "Leads", "Purchases"],
    rows: [
      ["Summer Growth", "Search", "420000", "38000", "4200", "620"],
      ["Summer Growth", "Social", "280000", "51000", "3100", "310"],
      ["Winback", "Email", "85000", "12000", "2400", "540"],
    ],
  },
  {
    id: "inventory",
    title: "Inventory performance",
    description: "SKU demand, stock, reorder levels, lead times, stockouts, turns, and gross margin by location.",
    task: "Prioritize replenishment and identify excess working capital without reducing service level.",
    downloadPath: "/datasets/business-analytics-inventory-performance.csv",
    columns: ["SKU", "Category", "Warehouse", "On Hand", "Monthly Demand", "Lead Days"],
    rows: [
      ["SKU-101", "Accessories", "North", "18", "42", "12"],
      ["SKU-102", "Displays", "West", "126", "20", "35"],
      ["SKU-103", "Networking", "South", "8", "36", "21"],
    ],
  },
  {
    id: "attrition",
    title: "Employee attrition",
    description: "Anonymized employee role, tenure, compensation, engagement, overtime, promotion, and exit outcomes.",
    task: "Identify attrition patterns, distinguish risk indicators from causes, and design an ethical follow-up.",
    downloadPath: "/datasets/business-analytics-employee-attrition.csv",
    columns: ["EmployeeID", "Department", "Tenure", "Engagement", "Overtime", "Attrition"],
    rows: [
      ["E-1001", "Sales", "1.4", "2", "Frequent", "Yes"],
      ["E-1002", "Finance", "6.8", "4", "Rare", "No"],
      ["E-1003", "Operations", "3.1", "3", "Sometimes", "No"],
    ],
  },
  {
    id: "variance",
    title: "Financial variance",
    description: "Department budgets, forecasts, actual revenue and costs, drivers, and accountable owners.",
    task: "Explain material favorable and unfavorable variances and prepare an executive action summary.",
    downloadPath: "/datasets/business-analytics-financial-variance.csv",
    columns: ["Month", "Department", "Account", "Budget", "Forecast", "Actual"],
    rows: [
      ["2026-06", "Sales", "Revenue", "5200000", "5050000", "4920000"],
      ["2026-06", "Marketing", "Campaign Cost", "680000", "720000", "765000"],
      ["2026-06", "Operations", "Freight", "410000", "445000", "438000"],
    ],
  },
];

const categoryDefaults: Record<BusinessAnalyticsCategory, BusinessAnalyticsDataset["id"]> = {
  "Foundations and Problem Framing": "sales",
  "Metrics and Financial Performance": "variance",
  "Customer, Sales, and Marketing": "funnel",
  "Operations and People": "inventory",
  "Forecasting and Decision Science": "variance",
  "Strategy and Communication": "sales",
  "Case Studies and Interviews": "sales",
};

export function getBusinessAnalyticsDataset(
  category: BusinessAnalyticsCategory,
  lessonId: string,
) {
  let datasetId = categoryDefaults[category];
  if (lessonId.includes("retention") || lessonId.includes("churn") || lessonId.includes("saas")) datasetId = "retention";
  if (lessonId.includes("marketing") || lessonId.includes("funnel") || lessonId.includes("conversion")) datasetId = "funnel";
  if (lessonId.includes("inventory") || lessonId.includes("supply") || lessonId.includes("retail")) datasetId = "inventory";
  if (lessonId.includes("employee") || lessonId.includes("attrition") || lessonId.includes("hr")) datasetId = "attrition";
  if (lessonId.includes("financial") || lessonId.includes("variance") || lessonId.includes("break-even")) datasetId = "variance";
  return businessAnalyticsDatasets.find((dataset) => dataset.id === datasetId)!;
}
