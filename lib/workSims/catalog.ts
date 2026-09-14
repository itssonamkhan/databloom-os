export const WORK_SIM_CATALOG = {
  "retail-profit-crisis-v1": {
    datasetVersion: "retail-profit-crisis-v1",
    maximumScore: 100,
    stages: {
      brief: 0,
      "data-audit": 10,
      "kpi-diagnosis": 25,
      "sql-diagnosis": 30,
      "excel-analysis": 20,
      "dashboard-plan": 10,
      "executive-summary": 5,
    },
  },
} as const;

export type WorkSimId = keyof typeof WORK_SIM_CATALOG;
export type WorkSimStageId = keyof (typeof WORK_SIM_CATALOG)[WorkSimId]["stages"];

export type WorkSimPublicStage = {
  id: WorkSimStageId;
  title: string;
  description: string;
  maximumScore: number;
};

export type WorkSimPublicCatalogueItem = {
  id: WorkSimId;
  title: string;
  label: string;
  company: string;
  datasetVersion: string;
  maximumScore: number;
  estimatedTime: string;
  skills: string[];
  summary: string;
  stages: readonly WorkSimPublicStage[];
  datasetFiles: readonly { label: string; file: string; path: string; rowCount: number }[];
  dataDictionaryPath: string;
  kpis: readonly { name: string; definition: string }[];
};

const RETAIL_STAGES: readonly WorkSimPublicStage[] = [
  { id: "brief", title: "Manager brief", description: "Read the assignment, context, and expected business outcome.", maximumScore: 0 },
  { id: "data-audit", title: "Data audit", description: "Check the tables, relationships, and intentional data-quality issues.", maximumScore: 10 },
  { id: "kpi-diagnosis", title: "KPI diagnosis", description: "Define the core revenue, cost, margin, return, and delivery measures.", maximumScore: 25 },
  { id: "sql-diagnosis", title: "SQL diagnosis", description: "Use SQL to investigate profitability drivers across the related tables.", maximumScore: 30 },
  { id: "excel-analysis", title: "Excel analysis", description: "Build a clear spreadsheet analysis that supports the investigation.", maximumScore: 20 },
  { id: "dashboard-plan", title: "Dashboard plan", description: "Plan decision-ready visuals and the questions each one answers.", maximumScore: 10 },
  { id: "executive-summary", title: "Executive summary", description: "Summarize findings and practical recommendations for management.", maximumScore: 5 },
];

export const WORK_SIM_PUBLIC_CATALOGUE: readonly WorkSimPublicCatalogueItem[] = [
  {
    id: "retail-profit-crisis-v1",
    title: "Revenue Up, Profit Down",
    label: "Data Analyst WorkSim",
    company: "DataBloom Retail Co.",
    datasetVersion: "retail-profit-crisis-v1",
    maximumScore: 100,
    estimatedTime: "60–90 minutes",
    summary: "Revenue is rising, but profitability is weakening. Investigate the business data and prepare a clear recommendation.",
    skills: ["Data cleaning", "KPI analysis", "Profitability", "Returns", "Delivery costs", "Business recommendations"],
    stages: RETAIL_STAGES,
    datasetFiles: [
      { label: "Orders", file: "orders.csv", path: "/datasets/work-sims/retail-profit-crisis-v1/orders.csv", rowCount: 1200 },
      { label: "Order items", file: "order_items.csv", path: "/datasets/work-sims/retail-profit-crisis-v1/order_items.csv", rowCount: 2600 },
      { label: "Products", file: "products.csv", path: "/datasets/work-sims/retail-profit-crisis-v1/products.csv", rowCount: 60 },
      { label: "Customers", file: "customers.csv", path: "/datasets/work-sims/retail-profit-crisis-v1/customers.csv", rowCount: 700 },
      { label: "Returns and refunds", file: "returns_refunds.csv", path: "/datasets/work-sims/retail-profit-crisis-v1/returns_refunds.csv", rowCount: 200 },
      { label: "Shipments", file: "shipments.csv", path: "/datasets/work-sims/retail-profit-crisis-v1/shipments.csv", rowCount: 1150 },
    ],
    dataDictionaryPath: "/datasets/work-sims/retail-profit-crisis-v1/data-dictionary.md",
    kpis: [
      { name: "Net revenue", definition: "Item revenue plus shipping fees charged, minus refunds." },
      { name: "Contribution profit", definition: "Net revenue after cost of goods, packaging, delivery, and return-shipping costs." },
      { name: "Contribution margin", definition: "Contribution profit divided by net revenue." },
      { name: "Return rate", definition: "Returned quantity divided by delivered item quantity." },
      { name: "Late-delivery rate", definition: "Late shipments divided by all shipments." },
    ],
  },
] as const;

export function isWorkSimId(value: string): value is WorkSimId {
  return Object.prototype.hasOwnProperty.call(WORK_SIM_CATALOG, value);
}

export function getWorkSimCatalogueItem(id: string): WorkSimPublicCatalogueItem | null {
  return WORK_SIM_PUBLIC_CATALOGUE.find((simulation) => simulation.id === id) ?? null;
}
