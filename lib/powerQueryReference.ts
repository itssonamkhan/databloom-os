export type PowerQueryRoadmapStage = {
  id: string;
  title: string;
  icon: string;
  description: string;
  lessonIds: string[];
};

export const powerQueryRoadmap: PowerQueryRoadmapStage[] = [
  {
    id: "foundations",
    title: "1. Query foundations",
    icon: "🌱",
    description: "Understand the editor, preview, steps, load destinations, and query organization.",
    lessonIds: ["power-query-overview", "query-editor-interface", "data-preview", "applied-steps", "load-destinations"],
  },
  {
    id: "connect",
    title: "2. Connect to data",
    icon: "🔌",
    description: "Bring in Excel, CSV, folders, web content, and databases with safe source settings.",
    lessonIds: ["import-excel-workbook", "import-csv-text", "folder-connector", "web-connector", "sql-server-connector"],
  },
  {
    id: "clean",
    title: "3. Clean and transform",
    icon: "🧹",
    description: "Profile quality, fix types, standardize fields, handle errors, and derive useful columns.",
    lessonIds: ["data-profiling", "detect-change-data-types", "handle-nulls", "text-transformations", "custom-column", "group-by"],
  },
  {
    id: "shape",
    title: "4. Combine and shape",
    icon: "🧩",
    description: "Pivot, unpivot, merge, append, fuzzy match, and create maintainable query dependencies.",
    lessonIds: ["unpivot-columns", "merge-queries", "join-kinds", "fuzzy-matching", "append-queries", "query-dependencies"],
  },
  {
    id: "m-language",
    title: "5. Learn M",
    icon: "λ",
    description: "Read let/in queries and build reusable logic with lists, records, tables, and functions.",
    lessonIds: ["m-values-types", "lists", "records", "tables", "let-in", "reusable-m-function"],
  },
  {
    id: "production",
    title: "6. Production performance",
    icon: "⚡",
    description: "Preserve folding, reduce data early, diagnose bottlenecks, and deliver reliable refreshes.",
    lessonIds: ["query-folding", "folding-indicators", "filter-early", "incremental-refresh", "diagnostics-performance"],
  },
  {
    id: "business",
    title: "7. Business and interviews",
    icon: "🎓",
    description: "Apply the workflow to realistic data and explain decisions, validation, and tradeoffs clearly.",
    lessonIds: ["messy-sales-cleaning", "customer-master-cleaning", "monthly-folder-automation", "interview-performance-case", "interview-end-to-end-case"],
  },
];

export type PowerQueryShortcut = {
  group: "Query Editor" | "Data Preview" | "Diagram View";
  action: string;
  windows: string;
  mac: string;
};

// Power Query Online shortcuts from Microsoft Learn. Browser behavior can vary.
export const powerQueryShortcuts: PowerQueryShortcut[] = [
  { group: "Query Editor", action: "Get data", windows: "Ctrl + Alt + D", mac: "Control + Option + D" },
  { group: "Query Editor", action: "Add custom column", windows: "Ctrl + Alt + C", mac: "Command + Option + C" },
  { group: "Query Editor", action: "Choose column", windows: "Ctrl + K", mac: "Command + K" },
  { group: "Query Editor", action: "Advanced Editor", windows: "Ctrl + Shift + M", mac: "Command + Shift + M" },
  { group: "Query Editor", action: "Refresh", windows: "Alt + F5", mac: "Option + F5" },
  { group: "Data Preview", action: "Copy selected cells", windows: "Ctrl + C", mac: "Command + C" },
  { group: "Data Preview", action: "Select all cells", windows: "Ctrl + A", mac: "Command + A" },
  { group: "Data Preview", action: "Select column", windows: "Ctrl + Space", mac: "Control + Space" },
  { group: "Data Preview", action: "Open filter menu", windows: "Alt + Down", mac: "Option + Down" },
  { group: "Diagram View", action: "Expand selected query", windows: "Ctrl + Right", mac: "Command + Right" },
  { group: "Diagram View", action: "Collapse selected query", windows: "Ctrl + Left", mac: "Command + Left" },
  { group: "Diagram View", action: "Highlight related queries", windows: "Ctrl + Alt + R", mac: "Command + Option + R" },
];
