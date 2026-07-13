import type { TableauCategory } from "@/lib/tableauLessons";

export type TableauPracticeDataset = {
  title: string;
  description: string;
  downloadPath: string;
  columns: readonly string[];
  rows: readonly (readonly string[])[];
};

const datasets: Record<TableauCategory, TableauPracticeDataset> = {
  "Tableau Foundations": {
    title: "Retail sales dataset",
    description: "Order-level sales records for workspace, field-role, formatting, and validation practice.",
    downloadPath: "/datasets/tableau-retail-sales.csv",
    columns: ["Order ID", "Order Date", "Region", "Category", "Sales", "Profit"],
    rows: [
      ["TB-1001", "2026-01-05", "North", "Technology", "2500", "620"],
      ["TB-1002", "2026-01-12", "West", "Furniture", "675", "-85"],
      ["TB-1003", "2026-02-03", "South", "Office Supplies", "980", "210"],
      ["TB-1004", "2026-02-18", "East", "Technology", "1440", "390"],
    ],
  },
  "Data Connections and Modeling": {
    title: "Orders and customers dataset",
    description: "Keys, grains, returns, and customer attributes for relationship, join, union, and cleanup practice.",
    downloadPath: "/datasets/tableau-orders-customers.csv",
    columns: ["Order ID", "Customer ID", "Customer", "Region", "Returned", "Sales"],
    rows: [
      ["TB-2001", "CU-101", "Aarav Stores", "North", "No", "1850"],
      ["TB-2002", "CU-102", "Bloom Retail", "West", "Yes", "720"],
      ["TB-2003", "CU-101", "Aarav Stores", "North", "No", "940"],
      ["TB-2004", "CU-103", "Cedar Goods", "South", "No", "1320"],
    ],
  },
  "Visual Analysis": {
    title: "Customer performance dataset",
    description: "Customer-level measures and targets for comparison, distribution, relationship, and chart-selection practice.",
    downloadPath: "/datasets/tableau-customer-performance.csv",
    columns: ["Customer", "Segment", "Orders", "Sales", "Profit", "Target Sales"],
    rows: [
      ["Aarav Stores", "Corporate", "18", "12400", "2480", "11000"],
      ["Bloom Retail", "Consumer", "12", "7900", "950", "8500"],
      ["Cedar Goods", "Home Office", "22", "15600", "3120", "14000"],
      ["Dawn Market", "Consumer", "9", "5100", "-340", "7000"],
    ],
  },
  Calculations: {
    title: "Transaction calculations dataset",
    description: "Row-level values, dates, codes, and nulls for calculated fields, LODs, and table-calculation practice.",
    downloadPath: "/datasets/tableau-transactions.csv",
    columns: ["Transaction ID", "Order Date", "Region Code", "Sales", "Cost", "Discount"],
    rows: [
      ["TX-3001", "2026-03-02", "IN-N", "1200", "760", "0.05"],
      ["TX-3002", "2026-03-05", "IN-W", "850", "690", "0.10"],
      ["TX-3003", "2026-03-09", "IN-S", "1600", "1010", ""],
      ["TX-3004", "2026-03-14", "IN-E", "430", "510", "0.00"],
    ],
  },
  "Interactive Analytics": {
    title: "Campaign analysis dataset",
    description: "Campaign, channel, and performance measures for filters, parameters, sets, trends, and forecasting practice.",
    downloadPath: "/datasets/tableau-campaign-analysis.csv",
    columns: ["Campaign", "Channel", "Month", "Spend", "Leads", "Revenue"],
    rows: [
      ["Spring Bloom", "Search", "2026-01", "4200", "310", "18400"],
      ["Spring Bloom", "Social", "2026-01", "2800", "205", "11300"],
      ["Growth Week", "Email", "2026-02", "1400", "260", "9600"],
      ["Growth Week", "Search", "2026-02", "5100", "355", "22100"],
    ],
  },
  "Dashboards and Stories": {
    title: "Dashboard engagement dataset",
    description: "View usage and device records for dashboard layout, interaction, accessibility, and story practice.",
    downloadPath: "/datasets/tableau-dashboard-engagement.csv",
    columns: ["Dashboard", "Device", "Views", "Avg Load Seconds", "Filter Uses", "Exports"],
    rows: [
      ["Executive Overview", "Desktop", "4200", "2.4", "1680", "310"],
      ["Executive Overview", "Phone", "1750", "3.1", "540", "88"],
      ["Sales Detail", "Desktop", "2980", "4.8", "2140", "460"],
      ["Sales Detail", "Tablet", "820", "4.2", "510", "75"],
    ],
  },
  "Performance and Publishing": {
    title: "Workbook operations dataset",
    description: "Refresh, load, ownership, and audience records for performance, publishing, and governance practice.",
    downloadPath: "/datasets/tableau-workbook-operations.csv",
    columns: ["Workbook", "Owner", "Rows", "Load Seconds", "Refresh Status", "Viewers"],
    rows: [
      ["Sales Pulse", "Anika", "1250000", "3.2", "Success", "180"],
      ["Margin Detail", "Rohan", "8400000", "9.8", "Success", "64"],
      ["Inventory Risk", "Meera", "2950000", "6.1", "Failed", "92"],
      ["Customer Growth", "Kabir", "610000", "2.7", "Success", "145"],
    ],
  },
  "Interview Preparation": {
    title: "Tableau case-study dataset",
    description: "Business KPIs and quality flags for requirements, validation, storytelling, and interview practice.",
    downloadPath: "/datasets/tableau-interview-case.csv",
    columns: ["Region", "Revenue", "Target", "Margin", "Missing Customer IDs", "Last Refresh"],
    rows: [
      ["North", "420000", "400000", "0.18", "0", "2026-07-12"],
      ["West", "365000", "390000", "0.11", "14", "2026-07-12"],
      ["South", "448000", "430000", "0.20", "2", "2026-07-11"],
      ["East", "310000", "360000", "0.08", "0", "2026-07-12"],
    ],
  },
};

export function getTableauPracticeDataset(category: TableauCategory) {
  return datasets[category];
}
