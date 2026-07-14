export const practiceCategories = [
  "Excel",
  "SQL",
  "Python",
  "Statistics",
  "Power BI",
  "Tableau",
  "Power Query",
  "Business Analytics",
] as const;

export const practiceDifficulties = [
  "Beginner",
  "Intermediate",
  "Advanced",
] as const;

export const practiceQuestionTypes = [
  "Multiple Choice",
  "Fill in the Blank",
  "Formula Writing",
  "SQL Query",
  "Python Coding",
  "Match the Columns",
  "Drag & Drop Ordering",
  "Dashboard Interpretation",
  "Business Case Questions",
] as const;

export type PracticeCategory = (typeof practiceCategories)[number];
export type PracticeDifficulty = (typeof practiceDifficulties)[number];
export type PracticeQuestionType = (typeof practiceQuestionTypes)[number];
export type PracticeAnswer = string | string[] | Record<string, string>;

export type PracticeQuestion = {
  id: string;
  category: PracticeCategory;
  topic: string;
  title: string;
  prompt: string;
  type: PracticeQuestionType;
  difficulty: PracticeDifficulty;
  xpReward: number;
  hint: string;
  explanation: string;
  options?: string[];
  acceptedAnswers?: string[];
  correctAnswer?: string;
  pairs?: Array<{ left: string; right: string }>;
  orderItems?: string[];
  context?: string;
};

export const practiceQuestions: PracticeQuestion[] = [
  {
    id: "excel-if-formula",
    category: "Excel",
    topic: "Logical formulas",
    title: "Flag high-value orders",
    prompt: 'Write a formula that returns "High" when B2 is at least 1000 and "Standard" otherwise.',
    type: "Formula Writing",
    difficulty: "Beginner",
    xpReward: 15,
    hint: "Use IF with a greater-than-or-equal comparison.",
    explanation: "IF evaluates the test first, then returns the second or third argument.",
    acceptedAnswers: ['=IF(B2>=1000,"High","Standard")', "=IF(B2>=1000,'High','Standard')"],
  },
  {
    id: "excel-xlookup-blank",
    category: "Excel",
    topic: "Lookup formulas",
    title: "Complete the lookup",
    prompt: "Fill in the function name: =____(A2, Products[ID], Products[Price], \"Missing\")",
    type: "Fill in the Blank",
    difficulty: "Intermediate",
    xpReward: 20,
    hint: "This modern lookup searches one range and returns from another.",
    explanation: "XLOOKUP supports an explicit not-found result and does not require a column index.",
    acceptedAnswers: ["XLOOKUP"],
  },
  {
    id: "excel-cleaning-order",
    category: "Excel",
    topic: "Data cleaning",
    title: "Prepare a clean sales column",
    prompt: "Drag the steps into a safe data-cleaning order.",
    type: "Drag & Drop Ordering",
    difficulty: "Intermediate",
    xpReward: 20,
    hint: "Preserve the raw values before transforming them.",
    explanation: "A backup enables recovery; whitespace and types should be standardized before validation.",
    orderItems: ["Duplicate the raw column", "Trim extra spaces", "Convert to the correct data type", "Check for errors"],
  },
  {
    id: "sql-region-aggregate",
    category: "SQL",
    topic: "Aggregation",
    title: "Revenue by region",
    prompt: "Write a query that returns region and SUM(revenue) as total_revenue from sales, grouped by region.",
    type: "SQL Query",
    difficulty: "Intermediate",
    xpReward: 25,
    hint: "SELECT the group, aggregate revenue, then GROUP BY the same group.",
    explanation: "Every selected non-aggregate column must appear in GROUP BY.",
    acceptedAnswers: ["SELECT region, SUM(revenue) AS total_revenue FROM sales GROUP BY region", "SELECT region,SUM(revenue) total_revenue FROM sales GROUP BY region"],
  },
  {
    id: "sql-left-join",
    category: "SQL",
    topic: "Joins",
    title: "Keep every customer",
    prompt: "Which join keeps all customers even when they have no matching order?",
    type: "Multiple Choice",
    difficulty: "Beginner",
    xpReward: 15,
    hint: "The customers table is on the left side of the join.",
    explanation: "LEFT JOIN retains every row from the left table and adds matches from the right.",
    options: ["INNER JOIN", "LEFT JOIN", "CROSS JOIN", "SELF JOIN"],
    correctAnswer: "LEFT JOIN",
  },
  {
    id: "sql-query-order",
    category: "SQL",
    topic: "Query structure",
    title: "Build the query in order",
    prompt: "Arrange the SQL clauses in their written order.",
    type: "Drag & Drop Ordering",
    difficulty: "Beginner",
    xpReward: 15,
    hint: "Start with what to return, then where it comes from.",
    explanation: "The common written order is SELECT, FROM, WHERE, GROUP BY, HAVING, ORDER BY.",
    orderItems: ["SELECT", "FROM", "WHERE", "GROUP BY", "HAVING", "ORDER BY"],
  },
  {
    id: "python-filter-revenue",
    category: "Python",
    topic: "Pandas filtering",
    title: "Filter large orders",
    prompt: "Write Pandas code that filters df to rows where revenue is greater than 1000.",
    type: "Python Coding",
    difficulty: "Beginner",
    xpReward: 20,
    hint: "Put a Boolean Series inside df square brackets.",
    explanation: "Boolean indexing keeps rows whose condition evaluates to True.",
    acceptedAnswers: ['df[df["revenue"] > 1000]', "df[df['revenue'] > 1000]", "df.loc[df['revenue'] > 1000]", 'df.loc[df["revenue"] > 1000]'],
  },
  {
    id: "python-groupby-blank",
    category: "Python",
    topic: "Pandas aggregation",
    title: "Complete the aggregation",
    prompt: 'Fill in the method: df.____("region")["revenue"].sum()',
    type: "Fill in the Blank",
    difficulty: "Beginner",
    xpReward: 15,
    hint: "This method splits rows into labeled groups.",
    explanation: "groupby creates groups before the selected revenue column is summed.",
    acceptedAnswers: ["groupby"],
  },
  {
    id: "python-analysis-order",
    category: "Python",
    topic: "Analysis workflow",
    title: "Order a reliable notebook workflow",
    prompt: "Drag the notebook stages into a sensible order.",
    type: "Drag & Drop Ordering",
    difficulty: "Intermediate",
    xpReward: 20,
    hint: "Inspect before cleaning, and validate before communicating.",
    explanation: "Early inspection guides cleaning, while validation protects the final result.",
    orderItems: ["Load the dataset", "Inspect shape and data types", "Clean missing or invalid values", "Analyze and validate", "Communicate the result"],
  },
  {
    id: "stats-median-choice",
    category: "Statistics",
    topic: "Descriptive statistics",
    title: "Choose a robust center",
    prompt: "A salary dataset contains several extreme executive salaries. Which measure best represents a typical salary?",
    type: "Multiple Choice",
    difficulty: "Beginner",
    xpReward: 15,
    hint: "Choose the measure least affected by extreme values.",
    explanation: "The median depends on rank, so a few extreme salaries do not pull it upward like the mean.",
    options: ["Mean", "Median", "Range", "Variance"],
    correctAnswer: "Median",
  },
  {
    id: "stats-pvalue-blank",
    category: "Statistics",
    topic: "Hypothesis testing",
    title: "Interpret significance",
    prompt: "At α = 0.05, a p-value of 0.02 means we ____ the null hypothesis.",
    type: "Fill in the Blank",
    difficulty: "Intermediate",
    xpReward: 20,
    hint: "Compare the p-value with alpha.",
    explanation: "Because 0.02 is below 0.05, the result is statistically significant at that threshold.",
    acceptedAnswers: ["reject", "reject the", "reject the null hypothesis"],
  },
  {
    id: "stats-term-match",
    category: "Statistics",
    topic: "Core concepts",
    title: "Match each concept",
    prompt: "Match the statistical term to its meaning.",
    type: "Match the Columns",
    difficulty: "Intermediate",
    xpReward: 20,
    hint: "Think about center, spread, and linear movement.",
    explanation: "Mean describes center, standard deviation describes spread, and correlation describes linear association.",
    pairs: [
      { left: "Mean", right: "Arithmetic average" },
      { left: "Standard deviation", right: "Typical spread around the mean" },
      { left: "Correlation", right: "Strength and direction of linear association" },
    ],
  },
  {
    id: "powerbi-margin-card",
    category: "Power BI",
    topic: "Dashboard interpretation",
    title: "Read a margin warning",
    prompt: "Revenue is up 12%, but profit is down 4% and discount rate rose from 6% to 14%. What is the strongest interpretation?",
    type: "Dashboard Interpretation",
    difficulty: "Intermediate",
    xpReward: 20,
    hint: "Separate growth in sales from growth in profitability.",
    explanation: "Higher discounts can grow revenue while compressing profit, so margin deserves investigation.",
    context: "KPI cards: Revenue +12% · Profit −4% · Discount rate 14% (was 6%)",
    options: ["Performance improved on every measure", "Discounting may be eroding margin", "Revenue must be incorrect", "Profit decline is unrelated to pricing"],
    correctAnswer: "Discounting may be eroding margin",
  },
  {
    id: "powerbi-star-schema",
    category: "Power BI",
    topic: "Data modeling",
    title: "Choose the model shape",
    prompt: "Which model usually gives the clearest filtering path for a sales report?",
    type: "Multiple Choice",
    difficulty: "Intermediate",
    xpReward: 20,
    hint: "Put measurable events in the center and descriptive entities around them.",
    explanation: "A star schema keeps facts and dimensions distinct, making relationships and measures easier to reason about.",
    options: ["One wide table for every source", "A star schema", "Many-to-many links everywhere", "Disconnected lookup tables"],
    correctAnswer: "A star schema",
  },
  {
    id: "powerbi-margin-dax",
    category: "Power BI",
    topic: "DAX measures",
    title: "Write a margin measure",
    prompt: "Write a DAX measure named Profit Margin that safely divides [Profit] by [Revenue].",
    type: "Formula Writing",
    difficulty: "Advanced",
    xpReward: 30,
    hint: "DIVIDE handles a zero denominator more safely than the / operator.",
    explanation: "DIVIDE returns blank or an alternate result when the denominator is zero.",
    acceptedAnswers: ["Profit Margin = DIVIDE([Profit], [Revenue])", "Profit Margin=DIVIDE([Profit],[Revenue])"],
  },
  {
    id: "tableau-regional-view",
    category: "Tableau",
    topic: "Visual analytics",
    title: "Interpret the regional view",
    prompt: "West has the highest sales but the lowest profit ratio. Which next view would best help explain why?",
    type: "Dashboard Interpretation",
    difficulty: "Intermediate",
    xpReward: 20,
    hint: "Break the region into dimensions linked to price and cost.",
    explanation: "Category and discount detail can reveal which products or pricing choices depress the ratio.",
    context: "Region summary: West sales ₹4.2M · profit ratio 3%; North sales ₹3.1M · profit ratio 14%",
    options: ["A blank dashboard", "Profit ratio by category and discount within West", "Only total company sales", "A map without measures"],
    correctAnswer: "Profit ratio by category and discount within West",
  },
  {
    id: "tableau-shelf-match",
    category: "Tableau",
    topic: "Building views",
    title: "Match Tableau controls",
    prompt: "Match each control with its main job.",
    type: "Match the Columns",
    difficulty: "Beginner",
    xpReward: 15,
    hint: "Rows and Columns set structure; Marks controls encoding.",
    explanation: "Shelves position fields, Marks changes visual encoding, and Filters limits included data.",
    pairs: [
      { left: "Rows shelf", right: "Creates vertical headers or axes" },
      { left: "Marks card", right: "Controls color, size, label, and detail" },
      { left: "Filters shelf", right: "Limits data included in the view" },
    ],
  },
  {
    id: "tableau-lod-choice",
    category: "Tableau",
    topic: "Level of detail",
    title: "Fix customer-level totals",
    prompt: "Which expression computes sales per customer independently of the dimensions currently in the view?",
    type: "Multiple Choice",
    difficulty: "Advanced",
    xpReward: 30,
    hint: "Use a FIXED level of detail expression.",
    explanation: "FIXED evaluates at the declared dimension level rather than the view's current dimensionality.",
    options: ["{ FIXED [Customer] : SUM([Sales]) }", "WINDOW_SUM([Sales])", "SUM([Sales]) / COUNT([Sales])", "ATTR([Customer])"],
    correctAnswer: "{ FIXED [Customer] : SUM([Sales]) }",
  },
  {
    id: "powerquery-clean-order",
    category: "Power Query",
    topic: "Transformation workflow",
    title: "Order a refreshable query",
    prompt: "Drag the transformation steps into a dependable order.",
    type: "Drag & Drop Ordering",
    difficulty: "Intermediate",
    xpReward: 20,
    hint: "Promote structure before assigning final data types.",
    explanation: "Navigation and headers establish shape; cleaning precedes final typing and loading.",
    orderItems: ["Connect to the source", "Choose the table or sheet", "Promote headers", "Clean invalid values", "Set data types", "Load the result"],
  },
  {
    id: "powerquery-operation-match",
    category: "Power Query",
    topic: "Combining data",
    title: "Match combine operations",
    prompt: "Match each operation to the result it produces.",
    type: "Match the Columns",
    difficulty: "Intermediate",
    xpReward: 20,
    hint: "One combines by key; the other stacks similarly shaped tables.",
    explanation: "Merge joins columns using keys, Append stacks rows, and Group By summarizes groups.",
    pairs: [
      { left: "Merge", right: "Join columns using matching keys" },
      { left: "Append", right: "Stack rows from compatible tables" },
      { left: "Group By", right: "Aggregate rows into summaries" },
    ],
  },
  {
    id: "powerquery-language-blank",
    category: "Power Query",
    topic: "M language",
    title: "Name the query language",
    prompt: "Power Query transformations are expressed in the ____ language.",
    type: "Fill in the Blank",
    difficulty: "Beginner",
    xpReward: 15,
    hint: "It is a single-letter name.",
    explanation: "Power Query uses the functional M language behind the Applied Steps interface.",
    acceptedAnswers: ["M", "M language"],
  },
  {
    id: "business-retention-case",
    category: "Business Analytics",
    topic: "Customer retention",
    title: "Respond to rising churn",
    prompt: "Churn rose from 5% to 9%, concentrated among new customers after onboarding. What is the best first action?",
    type: "Business Case Questions",
    difficulty: "Intermediate",
    xpReward: 25,
    hint: "Target the segment and stage where the change is concentrated.",
    explanation: "A focused onboarding cohort analysis can identify the failure point before a costly broad intervention.",
    context: "New-customer churn: 14% · Existing-customer churn: 4% · Support tickets peak in onboarding week 1",
    options: ["Discount every customer", "Analyze onboarding cohorts and week-one friction", "Stop measuring churn", "Acquire more users immediately"],
    correctAnswer: "Analyze onboarding cohorts and week-one friction",
  },
  {
    id: "business-kpi-choice",
    category: "Business Analytics",
    topic: "KPI design",
    title: "Choose a subscription KPI",
    prompt: "Which metric best captures recurring subscription revenue retained after churn and expansion?",
    type: "Multiple Choice",
    difficulty: "Advanced",
    xpReward: 30,
    hint: "The metric can exceed 100% when expansions outweigh losses.",
    explanation: "Net Revenue Retention includes starting recurring revenue, churn, contraction, and expansion.",
    options: ["Page views", "Net Revenue Retention", "Total sign-ups", "Average session duration"],
    correctAnswer: "Net Revenue Retention",
  },
  {
    id: "business-metric-match",
    category: "Business Analytics",
    topic: "Business metrics",
    title: "Match business metrics",
    prompt: "Match each metric with the question it answers.",
    type: "Match the Columns",
    difficulty: "Beginner",
    xpReward: 15,
    hint: "Think acquisition cost, customer value, and loss.",
    explanation: "CAC concerns acquisition spend, LTV estimates customer value, and churn measures customer loss.",
    pairs: [
      { left: "CAC", right: "What does it cost to acquire a customer?" },
      { left: "LTV", right: "How much value may a customer generate?" },
      { left: "Churn rate", right: "What share of customers did we lose?" },
    ],
  },
];

function normalizeText(value: string) {
  return value
    .trim()
    .toLocaleLowerCase()
    .replace(/[;]+$/g, "")
    .replace(/\s+/g, " ")
    .replace(/\s*([(),=<>\[\]])\s*/g, "$1");
}

export function isPracticeAnswerCorrect(
  question: PracticeQuestion,
  answer: PracticeAnswer,
) {
  if (question.type === "Drag & Drop Ordering") {
    return (
      Array.isArray(answer) &&
      question.orderItems?.length === answer.length &&
      question.orderItems.every((item, index) => item === answer[index])
    );
  }

  if (question.type === "Match the Columns") {
    if (!answer || typeof answer !== "object" || Array.isArray(answer)) return false;
    return Boolean(
      question.pairs?.every((pair) => answer[pair.left] === pair.right),
    );
  }

  if (typeof answer !== "string") return false;

  if (question.acceptedAnswers) {
    const normalized = normalizeText(answer);
    return question.acceptedAnswers.some(
      (accepted) => normalizeText(accepted) === normalized,
    );
  }

  return normalizeText(answer) === normalizeText(question.correctAnswer ?? "");
}

export function getQuestionById(id: string) {
  return practiceQuestions.find((question) => question.id === id);
}
