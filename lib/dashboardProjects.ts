export type DashboardProjectId = "sales" | "finance" | "hr";

export type DashboardCategory = "Excel" | "Power BI";

export type DashboardDifficulty = "Beginner" | "Intermediate";

export type DashboardDatasetCell = string | number;

export type DashboardDatasetPreview = {
  columns: string[];
  rows: DashboardDatasetCell[][];
};

export type DashboardProject = {
  id: DashboardProjectId;
  title: string;
  icon: string;
  description: string;
  category: DashboardCategory;
  difficulty: DashboardDifficulty;
  tools: string[];
  estimatedTime: string;
  xpReward: number;
  learningObjectives: string[];
  datasetFile: string;
  tutorialUrl: string;
  practiceRoute: string;
  color: string;
  datasetPreview: DashboardDatasetPreview;
};

export const dashboardProjects: DashboardProject[] = [
  {
    id: "sales",
    title: "Sales Dashboard",
    icon: "📊",
    description:
      "Analyze regional revenue, product performance, and sales trends to uncover practical growth opportunities.",
    category: "Excel",
    difficulty: "Beginner",
    tools: ["Excel", "Pivot Tables", "Charts"],
    estimatedTime: "45–60 min",
    xpReward: 100,
    learningObjectives: [
      "Calculate total revenue and average order value.",
      "Compare sales performance across regions and products.",
      "Build a monthly sales trend with clear business labels.",
      "Summarize the most important sales insight for a stakeholder.",
    ],
    datasetFile: "/datasets/sales-dashboard.csv",
    tutorialUrl:
      "https://www.youtube.com/results?search_query=excel+sales+dashboard+tutorial",
    practiceRoute: "/practice/sales",
    color: "from-pink-100 to-purple-100",
    datasetPreview: {
      columns: [
        "Order Date",
        "Region",
        "Salesperson",
        "Product",
        "Units Sold",
        "Unit Price",
        "Revenue",
      ],
      rows: [
        ["2026-01-05", "North", "Aisha Khan", "Analytics Pro", 8, 125, 1000],
        ["2026-01-12", "West", "Rohan Mehta", "Data Starter", 15, 75, 1125],
        ["2026-02-03", "South", "Meera Iyer", "Analytics Pro", 11, 125, 1375],
        ["2026-02-18", "East", "Arjun Das", "Team Insights", 6, 180, 1080],
        ["2026-03-08", "North", "Aisha Khan", "Team Insights", 9, 180, 1620],
      ],
    },
  },
  {
    id: "finance",
    title: "Finance Dashboard",
    icon: "💰",
    description:
      "Track budgets, operating expenses, profit, and variance so leaders can make confident financial decisions.",
    category: "Excel",
    difficulty: "Intermediate",
    tools: ["Excel", "Formulas", "Conditional Formatting"],
    estimatedTime: "60–75 min",
    xpReward: 125,
    learningObjectives: [
      "Calculate budget variance for every department.",
      "Track profit and profit margin over time.",
      "Highlight departments that are over budget.",
      "Present a concise monthly financial health summary.",
    ],
    datasetFile: "/datasets/finance-dashboard.csv",
    tutorialUrl:
      "https://www.youtube.com/results?search_query=excel+finance+dashboard+tutorial",
    practiceRoute: "/practice/finance",
    color: "from-green-100 to-emerald-100",
    datasetPreview: {
      columns: [
        "Month",
        "Department",
        "Budget",
        "Actual Expense",
        "Revenue",
        "Profit",
      ],
      rows: [
        ["2026-01", "Sales", 42000, 40500, 68000, 27500],
        ["2026-01", "Marketing", 26000, 27800, 39000, 11200],
        ["2026-01", "Operations", 35000, 33200, 48500, 15300],
        ["2026-02", "Sales", 44000, 43100, 72500, 29400],
        ["2026-02", "Marketing", 27000, 26300, 41500, 15200],
      ],
    },
  },
  {
    id: "hr",
    title: "HR Dashboard",
    icon: "👥",
    description:
      "Explore workforce composition, engagement, performance, and retention signals across the organization.",
    category: "Power BI",
    difficulty: "Intermediate",
    tools: ["Power BI", "Power Query", "DAX"],
    estimatedTime: "60–75 min",
    xpReward: 150,
    learningObjectives: [
      "Summarize headcount by department and location.",
      "Compare engagement and performance across teams.",
      "Calculate active employee and attrition rates.",
      "Identify workforce patterns that deserve HR attention.",
    ],
    datasetFile: "/datasets/hr-dashboard.csv",
    tutorialUrl:
      "https://www.youtube.com/results?search_query=power+bi+hr+dashboard+tutorial",
    practiceRoute: "/practice/hr",
    color: "from-blue-100 to-cyan-100",
    datasetPreview: {
      columns: [
        "Employee ID",
        "Department",
        "Role",
        "Location",
        "Hire Date",
        "Annual Salary",
        "Performance Rating",
        "Engagement Score",
        "Status",
      ],
      rows: [
        ["E1001", "Sales", "Account Executive", "Delhi", "2021-04-12", 920000, 4, 86, "Active"],
        ["E1002", "Engineering", "Data Engineer", "Bengaluru", "2020-08-24", 1350000, 5, 91, "Active"],
        ["E1003", "Marketing", "Content Strategist", "Mumbai", "2022-01-17", 780000, 3, 74, "Active"],
        ["E1004", "Operations", "Operations Analyst", "Pune", "2019-11-04", 840000, 4, 82, "Active"],
        ["E1005", "Sales", "Sales Analyst", "Delhi", "2023-06-19", 720000, 3, 68, "Exited"],
      ],
    },
  },
];

export const dashboardCategories: DashboardCategory[] = Array.from(
  new Set(dashboardProjects.map((project) => project.category)),
);

export const dashboardDifficulties: DashboardDifficulty[] = Array.from(
  new Set(dashboardProjects.map((project) => project.difficulty)),
);

export function getDashboardProject(id: string): DashboardProject | undefined {
  return dashboardProjects.find((project) => project.id === id);
}
