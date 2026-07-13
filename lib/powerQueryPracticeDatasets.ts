import type { PowerQueryCategory } from "@/lib/powerQueryLessons";

export type PowerQueryDatasetDownload = {
  label: string;
  path: string;
};

export type PowerQueryPracticeDataset = {
  id: "messy-sales" | "customers" | "monthly-folder" | "inventory" | "finance";
  title: string;
  description: string;
  task: string;
  downloads: PowerQueryDatasetDownload[];
  columns: readonly string[];
  rows: readonly (readonly string[])[];
};

export const powerQueryPracticeDatasets: PowerQueryPracticeDataset[] = [
  {
    id: "messy-sales",
    title: "Messy sales data",
    description: "Inconsistent dates, region labels, currency text, nulls, duplicates, and invalid quantities.",
    task: "Build a typed, deduplicated order-line table with standardized regions and a calculated profit field.",
    downloads: [{ label: "Download messy sales CSV", path: "/datasets/power-query-messy-sales.csv" }],
    columns: ["OrderID", "OrderDate", "Region", "Revenue", "Cost", "Quantity"],
    rows: [
      ["SO-1001", "05/01/2026", " north ", "₹12,500", "7800", "2"],
      ["SO-1002", "2026-01-07", "WEST", "8400", "", "one"],
      ["SO-1002", "2026-01-07", "WEST", "8400", "5100", "1"],
    ],
  },
  {
    id: "customers",
    title: "Customer records",
    description: "Customer identifiers, names, emails, phones, cities, and duplicate master records that need standardization.",
    task: "Create one trusted customer row per identifier and flag incomplete or invalid contact details.",
    downloads: [{ label: "Download customer CSV", path: "/datasets/power-query-customer-records.csv" }],
    columns: ["CustomerID", "CustomerName", "Email", "Phone", "City", "Status"],
    rows: [
      ["C-001", " aarav stores ", "SALES@AARAV.IN", "+91 98765 41001", "delhi", "Active"],
      ["C001", "Aarav Stores", "sales@aarav.in", "9876541001", "Delhi", "active"],
      ["C-002", "Bloom Retail", "", "+91-99887-22002", "Mumbai", "Inactive"],
    ],
  },
  {
    id: "monthly-folder",
    title: "Monthly folder-combine task",
    description: "Three monthly exports with the same business grain and a small schema change to handle safely.",
    task: "Place the files in one folder, combine them, keep source filename, align the schema, and validate monthly totals.",
    downloads: [
      { label: "January CSV", path: "/datasets/power-query-monthly-sales-jan.csv" },
      { label: "February CSV", path: "/datasets/power-query-monthly-sales-feb.csv" },
      { label: "March CSV", path: "/datasets/power-query-monthly-sales-mar.csv" },
    ],
    columns: ["File", "OrderID", "OrderDate", "Region", "Revenue"],
    rows: [
      ["sales-2026-01.csv", "M-1001", "2026-01-03", "North", "12500"],
      ["sales-2026-02.csv", "M-2001", "2026-02-02", "West", "8900"],
      ["sales-2026-03.csv", "M-3001", "2026-03-08", "South", "15200"],
    ],
  },
  {
    id: "inventory",
    title: "Inventory data",
    description: "Item masters and stock observations with inconsistent SKUs, warehouses, reorder levels, and timestamps.",
    task: "Standardize stock records and identify items below reorder level by warehouse.",
    downloads: [{ label: "Download inventory CSV", path: "/datasets/power-query-inventory.csv" }],
    columns: ["SKU", "Item", "Warehouse", "OnHand", "ReorderLevel", "LastCounted"],
    rows: [
      ["sku-101", "Wireless Mouse", "WH-NORTH", "18", "25", "2026-06-28"],
      ["SKU 102", "Keyboard", "North", "42", "20", "28/06/2026"],
      ["SKU-103", "USB-C Hub", "WH-WEST", "error", "15", ""],
    ],
  },
  {
    id: "finance",
    title: "Finance transactions",
    description: "Ledger rows with signed amounts, mixed date formats, inconsistent accounts, and possible duplicates.",
    task: "Produce a typed transaction table, normalize account codes, classify debit and credit, and flag duplicates.",
    downloads: [{ label: "Download finance CSV", path: "/datasets/power-query-finance-transactions.csv" }],
    columns: ["TransactionID", "Date", "Account", "Description", "Amount", "Currency"],
    rows: [
      ["TX-5001", "2026-06-01", "4000-sales", "Invoice A-101", "125000.00", "INR"],
      ["TX-5002", "02/06/2026", "5100 | Travel", "Client visit", "(8500)", "INR"],
      ["TX-5002", "02/06/2026", "5100 | Travel", "Client visit", "-8500", "INR"],
    ],
  },
];

const categoryDefaults: Record<PowerQueryCategory, PowerQueryPracticeDataset["id"]> = {
  Foundations: "messy-sales",
  "Connections and Imports": "monthly-folder",
  "Cleaning and Transforming": "messy-sales",
  "Combining and Shaping": "customers",
  "M Language and Automation": "inventory",
  "Performance and Integration": "finance",
  "Business Scenarios and Interviews": "messy-sales",
};

export function getPowerQueryPracticeDataset(
  category: PowerQueryCategory,
  lessonId: string,
) {
  let datasetId = categoryDefaults[category];
  if (lessonId.includes("customer")) datasetId = "customers";
  if (lessonId.includes("inventory")) datasetId = "inventory";
  if (lessonId.includes("finance")) datasetId = "finance";
  if (lessonId.includes("folder") || lessonId.includes("monthly")) {
    datasetId = "monthly-folder";
  }
  return powerQueryPracticeDatasets.find((dataset) => dataset.id === datasetId)!;
}
