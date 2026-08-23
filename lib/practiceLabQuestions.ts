import {
  getStudioCurriculumConfiguration,
  type SupportedCurriculumStudioId,
} from "@/lib/studioCurriculum";

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

export type PracticeQuestionContext = {
  title: string;
  columns: string[];
  rows: string[][];
  note?: string;
};

export type PracticeQuestionSolution = {
  canonicalAnswer: string;
  steps: string[];
  expectedResult?: string;
};

export type PracticeCurriculumReference = {
  studioId: SupportedCurriculumStudioId;
  lessonId: string;
};

type PracticeQuestionBase = {
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
  context?: string | PracticeQuestionContext;
  solution?: PracticeQuestionSolution;
  curriculum?: PracticeCurriculumReference;
};

type ChoiceQuestionType =
  | "Multiple Choice"
  | "Dashboard Interpretation"
  | "Business Case Questions";

/**
 * The question union documents which answer shape each interaction needs.
 * Runtime validation below remains the boundary for catalog data loaded or
 * edited outside TypeScript.
 */
export type PracticeQuestion =
  | (PracticeQuestionBase & {
      type: ChoiceQuestionType;
      options: string[];
      correctAnswer: string;
    })
  | (PracticeQuestionBase & {
      type:
        | "Fill in the Blank"
        | "Formula Writing"
        | "SQL Query"
        | "Python Coding";
      acceptedAnswers: string[];
    })
  | (PracticeQuestionBase & {
      type: "Match the Columns";
      pairs: Array<{ left: string; right: string }>;
    })
  | (PracticeQuestionBase & {
      type: "Drag & Drop Ordering";
      orderItems: string[];
    });

export type PracticeQuestionValidationIssue = {
  code:
    | "invalid-record"
    | "missing-field"
    | "invalid-value"
    | "missing-answer"
    | "duplicate-id"
    | "invalid-curriculum-reference";
  index?: number;
  questionId?: string;
  field?: string;
  message: string;
};

export type PracticeQuestionValidationResult = {
  valid: boolean;
  questionCount: number;
  uniqueIdCount: number;
  issues: readonly PracticeQuestionValidationIssue[];
};

const basePracticeQuestions: PracticeQuestion[] = [
  {
    id: "excel-if-formula",
    curriculum: { studioId: "formula-studio", lessonId: "if" },
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
    curriculum: { studioId: "formula-studio", lessonId: "xlookup" },
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
    curriculum: { studioId: "sql-studio", lessonId: "group-by" },
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
    curriculum: { studioId: "sql-studio", lessonId: "left-join" },
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
    curriculum: { studioId: "python-studio", lessonId: "filtering-rows" },
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
    curriculum: { studioId: "python-studio", lessonId: "groupby" },
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
    curriculum: { studioId: "python-studio", lessonId: "eda-workflow" },
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
    curriculum: { studioId: "statistics-studio", lessonId: "median" },
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
    curriculum: { studioId: "statistics-studio", lessonId: "p-value" },
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
    curriculum: { studioId: "power-bi-studio", lessonId: "kpi-card" },
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
    curriculum: { studioId: "power-bi-studio", lessonId: "star-schema" },
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
    curriculum: { studioId: "power-bi-studio", lessonId: "dax-divide" },
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
    curriculum: { studioId: "tableau-studio", lessonId: "chart-selection" },
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
    curriculum: { studioId: "tableau-studio", lessonId: "shelves-and-marks" },
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
    curriculum: { studioId: "tableau-studio", lessonId: "level-of-detail-expressions" },
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
    curriculum: { studioId: "business-analytics-studio", lessonId: "churn-analysis" },
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
  {
    id: "excel-sumifs-by-region",
    category: "Excel",
    topic: "Conditional aggregation",
    title: "Sum one region",
    prompt: "Write a formula that sums Sales[Amount] where Sales[Region] equals the value in H2.",
    type: "Formula Writing",
    difficulty: "Beginner",
    xpReward: 15,
    hint: "Use SUMIFS with the amount range first and a criteria range/value pair.",
    explanation: "SUMIFS adds values only for rows meeting every supplied criterion.",
    acceptedAnswers: ["=SUMIFS(Sales[Amount],Sales[Region],H2)", "=SUMIFS(Sales[Amount], Sales[Region], H2)"],
  },
  {
    id: "excel-absolute-reference",
    category: "Excel",
    topic: "Cell references",
    title: "Lock a tax rate",
    prompt: "Which reference keeps cell B1 fixed when a formula is filled down?",
    type: "Multiple Choice",
    difficulty: "Beginner",
    xpReward: 15,
    hint: "An absolute reference locks both the column and row.",
    explanation: "The dollar signs in $B$1 prevent either coordinate from moving when copied.",
    options: ["B1", "$B$1", "B$1", "$B1"],
    correctAnswer: "$B$1",
  },
  {
    id: "excel-text-cleaning",
    curriculum: { studioId: "formula-studio", lessonId: "trim" },
    category: "Excel",
    topic: "Text cleaning",
    title: "Clean imported names",
    prompt: "Which function removes extra spaces from the text in A2?",
    type: "Fill in the Blank",
    difficulty: "Intermediate",
    xpReward: 20,
    hint: "It removes leading, trailing, and repeated internal spaces.",
    explanation: "TRIM is a safe first step for names imported with inconsistent spacing.",
    acceptedAnswers: ["TRIM", "=TRIM(A2)", "TRIM(A2)"],
  },
  {
    id: "excel-index-match-two-way",
    curriculum: { studioId: "formula-studio", lessonId: "index-match" },
    category: "Excel",
    topic: "Lookup design",
    title: "Build a two-way lookup",
    prompt: "Which approach returns a value at the intersection of a row key and a column header?",
    type: "Multiple Choice",
    difficulty: "Advanced",
    xpReward: 30,
    hint: "Find a row position and a column position, then index the matrix.",
    explanation: "INDEX with two MATCH expressions supports a flexible two-dimensional lookup.",
    options: ["INDEX with MATCH for row and column", "SUM of the headers", "COUNTIF only", "CONCATENATE the table"],
    correctAnswer: "INDEX with MATCH for row and column",
  },
  {
    id: "excel-dynamic-filter",
    curriculum: { studioId: "formula-studio", lessonId: "filter" },
    category: "Excel",
    topic: "Dynamic arrays",
    title: "Return active customers",
    prompt: "Which modern function can spill all rows whose Status column equals Active?",
    type: "Multiple Choice",
    difficulty: "Advanced",
    xpReward: 30,
    hint: "The function returns a filtered array rather than one lookup result.",
    explanation: "FILTER creates a dynamic result that updates as the source and criteria change.",
    options: ["FILTER", "ROUND", "SUBTOTAL", "FORMULATEXT"],
    correctAnswer: "FILTER",
  },
  {
    id: "excel-pivot-validation",
    category: "Excel",
    topic: "Analysis quality",
    title: "Validate a pivot total",
    prompt: "Before presenting a PivotTable, what is the strongest validation step?",
    type: "Business Case Questions",
    difficulty: "Advanced",
    xpReward: 30,
    hint: "Compare an independently calculated total at the same grain.",
    explanation: "A source-level reconciliation catches filters, duplicate rows, and incorrect aggregation choices.",
    options: ["Change the colors", "Reconcile totals to an independent calculation", "Hide the source", "Add more slicers"],
    correctAnswer: "Reconcile totals to an independent calculation",
  },
  {
    id: "sql-where-filter",
    curriculum: { studioId: "sql-studio", lessonId: "where" },
    category: "SQL",
    topic: "Filtering",
    title: "Filter completed orders",
    prompt: "Which clause keeps only rows where status is Completed?",
    type: "Fill in the Blank",
    difficulty: "Beginner",
    xpReward: 15,
    hint: "Filtering rows happens before grouping.",
    explanation: "WHERE applies row-level conditions to the source result.",
    acceptedAnswers: ["WHERE status = 'Completed'", "WHERE status='Completed'"],
  },
  {
    id: "sql-count-distinct-customers",
    curriculum: { studioId: "sql-studio", lessonId: "count" },
    category: "SQL",
    topic: "Aggregation",
    title: "Count unique customers",
    prompt: "Write a query that returns the number of distinct customer_id values from orders.",
    type: "SQL Query",
    difficulty: "Intermediate",
    xpReward: 25,
    hint: "COUNT can operate on DISTINCT values.",
    explanation: "COUNT(DISTINCT customer_id) avoids counting repeat orders as separate customers.",
    acceptedAnswers: ["SELECT COUNT(DISTINCT customer_id) FROM orders", "SELECT COUNT(DISTINCT customer_id) AS customer_count FROM orders"],
  },
  {
    id: "sql-case-segment",
    curriculum: { studioId: "sql-studio", lessonId: "case-when" },
    category: "SQL",
    topic: "Conditional logic",
    title: "Create revenue bands",
    prompt: "Which SQL construct assigns labels based on ordered conditions?",
    type: "Multiple Choice",
    difficulty: "Intermediate",
    xpReward: 20,
    hint: "It evaluates WHEN conditions and returns the first match.",
    explanation: "CASE is SQL's standard conditional expression for derived classifications.",
    options: ["CASE", "UNION", "DISTINCT", "COALESCE only"],
    correctAnswer: "CASE",
  },
  {
    id: "sql-subquery-top-customer",
    curriculum: { studioId: "sql-studio", lessonId: "subqueries" },
    category: "SQL",
    topic: "Subqueries",
    title: "Find above-average orders",
    prompt: "Which approach compares each order amount with an aggregate calculated from the same table?",
    type: "Multiple Choice",
    difficulty: "Advanced",
    xpReward: 30,
    hint: "Compute the benchmark separately, then use it in the outer filter.",
    explanation: "A scalar subquery can calculate AVG(amount) for comparison in the outer query.",
    options: ["A scalar subquery", "A CROSS JOIN with no condition", "Only ORDER BY", "A column alias in WHERE"],
    correctAnswer: "A scalar subquery",
  },
  {
    id: "sql-window-running-total",
    category: "SQL",
    topic: "Window functions",
    title: "Build a running total",
    prompt: "Which window pattern calculates a cumulative amount ordered by order_date?",
    type: "SQL Query",
    difficulty: "Advanced",
    xpReward: 30,
    hint: "SUM can use an OVER clause with an ordered window.",
    explanation: "SUM(amount) OVER (ORDER BY order_date) retains row detail while accumulating values.",
    acceptedAnswers: ["SUM(amount) OVER (ORDER BY order_date)", "SUM(amount) OVER(ORDER BY order_date)"],
  },
  {
    id: "sql-join-duplicate-check",
    category: "SQL",
    topic: "Join validation",
    title: "Diagnose duplicate rows",
    prompt: "After a join unexpectedly doubles totals, what should you inspect first?",
    type: "Business Case Questions",
    difficulty: "Advanced",
    xpReward: 30,
    hint: "Check the relationship between the join keys on both sides.",
    explanation: "A many-to-many or non-unique join key can multiply rows and inflate aggregates.",
    options: ["The join-key cardinality", "The font size", "The database logo", "Only the ORDER BY clause"],
    correctAnswer: "The join-key cardinality",
  },
  {
    id: "python-select-column",
    curriculum: { studioId: "python-studio", lessonId: "selecting-columns" },
    category: "Python",
    topic: "Pandas selection",
    title: "Select one column",
    prompt: "Which expression selects the revenue Series from df?",
    type: "Python Coding",
    difficulty: "Beginner",
    xpReward: 15,
    hint: "Use bracket notation with the column label.",
    explanation: "df['revenue'] returns the named Series while preserving its index.",
    acceptedAnswers: ["df['revenue']", "df[\"revenue\"]", "df.revenue"],
  },
  {
    id: "python-fill-missing-values",
    curriculum: { studioId: "python-studio", lessonId: "missing-values" },
    category: "Python",
    topic: "Data cleaning",
    title: "Fill missing revenue",
    prompt: "Which pandas method replaces missing values in a column with zero?",
    type: "Fill in the Blank",
    difficulty: "Intermediate",
    xpReward: 20,
    hint: "The method name starts with fill and accepts a value.",
    explanation: "fillna(0) makes the replacement rule explicit and keeps the transformation reproducible.",
    acceptedAnswers: ["fillna", "fillna(0)", ".fillna(0)"],
  },
  {
    id: "python-merge-dataframes",
    curriculum: { studioId: "python-studio", lessonId: "merging-data" },
    category: "Python",
    topic: "Combining data",
    title: "Join customer attributes",
    prompt: "Which pandas function combines orders and customers using customer_id?",
    type: "Multiple Choice",
    difficulty: "Intermediate",
    xpReward: 20,
    hint: "It performs relational joins between DataFrames.",
    explanation: "pd.merge supports explicit key and join-type choices instead of relying on row position.",
    options: ["pd.merge", "pd.describe", "pd.plot", "pd.astype"],
    correctAnswer: "pd.merge",
  },
  {
    id: "python-groupby-multi-agg",
    curriculum: { studioId: "python-studio", lessonId: "aggregations" },
    category: "Python",
    topic: "Grouped analysis",
    title: "Summarize by region",
    prompt: "Which pattern computes both total revenue and average order value by region?",
    type: "Python Coding",
    difficulty: "Advanced",
    xpReward: 30,
    hint: "Group by the dimension, then provide named aggregations.",
    explanation: "Named aggregations make multiple business measures explicit and readable.",
    acceptedAnswers: ["df.groupby('region').agg(total_revenue=('revenue','sum'), average_order=('order_value','mean'))", "df.groupby(\"region\").agg(total_revenue=(\"revenue\",\"sum\"), average_order=(\"order_value\",\"mean\"))"],
  },
  {
    id: "python-vectorized-transform",
    curriculum: { studioId: "python-studio", lessonId: "numpy-vectorization" },
    category: "Python",
    topic: "Performance",
    title: "Prefer vectorized operations",
    prompt: "For a large numeric column, which approach is usually preferred over a Python row loop?",
    type: "Multiple Choice",
    difficulty: "Advanced",
    xpReward: 30,
    hint: "Use operations implemented for whole Series or arrays.",
    explanation: "Vectorized pandas or NumPy operations are generally clearer and faster for column transformations.",
    options: ["A vectorized Series expression", "A nested print loop", "Manual cell editing", "Repeated CSV exports"],
    correctAnswer: "A vectorized Series expression",
  },
  {
    id: "python-time-aware-rolling",
    category: "Python",
    topic: "Time series analysis",
    title: "Calculate a rolling average",
    prompt: "Which pandas operation calculates a three-period rolling mean for the revenue column?",
    type: "Python Coding",
    difficulty: "Advanced",
    xpReward: 30,
    hint: "Create a rolling window before calling mean.",
    explanation: "df['revenue'].rolling(3).mean() preserves a time-ordered moving average and makes the window explicit.",
    acceptedAnswers: ["df['revenue'].rolling(3).mean()", "df[\"revenue\"].rolling(3).mean()"],
  },
  {
    id: "stats-mean-calculation",
    curriculum: { studioId: "statistics-studio", lessonId: "mean" },
    category: "Statistics",
    topic: "Descriptive statistics",
    title: "Calculate the mean",
    prompt: "What is the mean of 4, 6, and 8?",
    type: "Multiple Choice",
    difficulty: "Beginner",
    xpReward: 15,
    hint: "Add the values and divide by the number of observations.",
    explanation: "The arithmetic mean is (4 + 6 + 8) / 3 = 6.",
    options: ["4", "6", "8", "18"],
    correctAnswer: "6",
  },
  {
    id: "stats-probability-complement",
    curriculum: { studioId: "statistics-studio", lessonId: "complement-rule" },
    category: "Statistics",
    topic: "Probability",
    title: "Use a complement",
    prompt: "If the probability an order is late is 0.2, what is the probability it is not late?",
    type: "Fill in the Blank",
    difficulty: "Beginner",
    xpReward: 15,
    hint: "The event and its complement add to one.",
    explanation: "1 - 0.2 = 0.8, assuming late and not late are complementary outcomes.",
    acceptedAnswers: ["0.8", "80%", "0.80"],
  },
  {
    id: "stats-standard-deviation-meaning",
    curriculum: { studioId: "statistics-studio", lessonId: "standard-deviation" },
    category: "Statistics",
    topic: "Dispersion",
    title: "Interpret standard deviation",
    prompt: "What does a larger standard deviation indicate when two datasets share the same mean?",
    type: "Multiple Choice",
    difficulty: "Intermediate",
    xpReward: 20,
    hint: "Think about distance from the center.",
    explanation: "A larger standard deviation indicates observations are more spread out around the mean.",
    options: ["More spread", "A higher sample size automatically", "No variation", "Causation"],
    correctAnswer: "More spread",
  },
  {
    id: "stats-confidence-interval",
    curriculum: { studioId: "statistics-studio", lessonId: "confidence-interpretation" },
    category: "Statistics",
    topic: "Inference",
    title: "Read a confidence interval",
    prompt: "Which statement best describes a 95% confidence interval for a population mean?",
    type: "Multiple Choice",
    difficulty: "Advanced",
    xpReward: 30,
    hint: "Describe the long-run procedure, not the probability of a fixed parameter.",
    explanation: "Across repeated samples, intervals made this way would contain the true mean about 95% of the time.",
    options: ["It contains 95% of observations", "The repeated procedure captures the true mean about 95% of the time", "There is a 95% chance this fixed interval contains the mean", "The sample mean is always exact"],
    correctAnswer: "The repeated procedure captures the true mean about 95% of the time",
  },
  {
    id: "stats-correlation-caution",
    curriculum: { studioId: "statistics-studio", lessonId: "correlation-causation" },
    category: "Statistics",
    topic: "Correlation",
    title: "Avoid causal overreach",
    prompt: "Two variables have a strong correlation. What should an analyst conclude first?",
    type: "Business Case Questions",
    difficulty: "Advanced",
    xpReward: 30,
    hint: "Association alone does not identify a mechanism.",
    explanation: "Confounding, reverse causality, and chance can explain an association without proving causation.",
    options: ["One causes the other", "Investigate design and confounders before claiming causation", "The data must be wrong", "No further analysis is needed"],
    correctAnswer: "Investigate design and confounders before claiming causation",
  },
  {
    id: "stats-regression-residuals",
    curriculum: { studioId: "statistics-studio", lessonId: "residuals" },
    category: "Statistics",
    topic: "Regression",
    title: "Inspect residuals",
    prompt: "What does a visible curved pattern in regression residuals suggest?",
    type: "Multiple Choice",
    difficulty: "Advanced",
    xpReward: 30,
    hint: "Residual structure means the model has not captured all systematic behavior.",
    explanation: "Curvature can indicate a missing nonlinear term or an unsuitable functional form.",
    options: ["Perfect fit", "Possible model misspecification", "Guaranteed causation", "No variation"],
    correctAnswer: "Possible model misspecification",
  },
  {
    id: "powerbi-relationships-direction",
    curriculum: { studioId: "power-bi-studio", lessonId: "filter-direction" },
    category: "Power BI",
    topic: "Data modeling",
    title: "Choose relationship direction",
    prompt: "In a star schema, what is the usual filtering direction from a product dimension to a sales fact?",
    type: "Multiple Choice",
    difficulty: "Beginner",
    xpReward: 15,
    hint: "Dimensions describe and filter facts.",
    explanation: "A single-direction dimension-to-fact relationship is easier to reason about and reduces ambiguity.",
    options: ["Product to Sales", "Sales to Product only", "No relationship", "Every table to every table"],
    correctAnswer: "Product to Sales",
  },
  {
    id: "powerbi-card-kpi",
    curriculum: { studioId: "power-bi-studio", lessonId: "kpi-card" },
    category: "Power BI",
    topic: "Visual selection",
    title: "Choose a KPI visual",
    prompt: "Which visual is most suitable for showing one current value against a target?",
    type: "Multiple Choice",
    difficulty: "Beginner",
    xpReward: 15,
    hint: "Use a compact visual designed for one headline measure and comparison.",
    explanation: "A KPI or gauge-style visual communicates a current metric and its target at a glance.",
    options: ["KPI visual", "Scatter plot only", "Raw data table only", "Shape map without a measure"],
    correctAnswer: "KPI visual",
  },
  {
    id: "powerbi-date-table",
    curriculum: { studioId: "power-bi-studio", lessonId: "date-table" },
    category: "Power BI",
    topic: "Date modeling",
    title: "Build a date table",
    prompt: "Why should a model often use a dedicated date table for time analysis?",
    type: "Business Case Questions",
    difficulty: "Beginner",
    xpReward: 15,
    hint: "Consistent calendar attributes support filtering and time intelligence.",
    explanation: "A marked date table provides a complete, reusable calendar grain for measures and slicers.",
    options: ["To remove all relationships", "To provide consistent calendar attributes", "To replace the fact table", "To hide dates from users"],
    correctAnswer: "To provide consistent calendar attributes",
  },
  {
    id: "powerbi-calculate-filter",
    curriculum: { studioId: "power-bi-studio", lessonId: "dax-calculate" },
    category: "Power BI",
    topic: "DAX context",
    title: "Change filter context",
    prompt: "Which DAX function evaluates an expression in a modified filter context?",
    type: "Fill in the Blank",
    difficulty: "Intermediate",
    xpReward: 20,
    hint: "It is the central context-shaping function in many measures.",
    explanation: "CALCULATE evaluates an expression after adding, removing, or modifying filters.",
    acceptedAnswers: ["CALCULATE"],
  },
  {
    id: "powerbi-context-transition",
    category: "Power BI",
    topic: "Advanced DAX",
    title: "Recognize context transition",
    prompt: "What does CALCULATE do inside a row context when no explicit filters are supplied?",
    type: "Multiple Choice",
    difficulty: "Advanced",
    xpReward: 30,
    hint: "Consider how a current row can become a filter for an expression.",
    explanation: "CALCULATE can convert the current row context into filter context, a key iterator behavior.",
    options: ["Context transition", "It deletes the row", "It disables all relationships", "It always returns text"],
    correctAnswer: "Context transition",
  },
  {
    id: "powerbi-inactive-date-relationship",
    curriculum: { studioId: "power-bi-studio", lessonId: "active-inactive-relationships" },
    category: "Power BI",
    topic: "Advanced modeling",
    title: "Use an alternate date",
    prompt: "Which DAX function can activate an inactive relationship for one calculation?",
    type: "Fill in the Blank",
    difficulty: "Advanced",
    xpReward: 30,
    hint: "It is commonly passed as a filter argument to CALCULATE.",
    explanation: "USERELATIONSHIP lets a measure use an alternate relationship such as Ship Date instead of Order Date.",
    acceptedAnswers: ["USERELATIONSHIP"],
  },
  {
    id: "tableau-discrete-continuous",
    curriculum: { studioId: "tableau-studio", lessonId: "discrete-and-continuous" },
    category: "Tableau",
    topic: "Dimensions and measures",
    title: "Read a blue pill",
    prompt: "In Tableau, what commonly happens when a date is placed as a discrete field?",
    type: "Multiple Choice",
    difficulty: "Beginner",
    xpReward: 15,
    hint: "Discrete fields create headers rather than a continuous axis.",
    explanation: "A discrete date creates separate headers such as year or month instead of a continuous scale.",
    options: ["It creates headers", "It deletes the date", "It always creates a map", "It disables aggregation"],
    correctAnswer: "It creates headers",
  },
  {
    id: "tableau-filter-order",
    curriculum: { studioId: "tableau-studio", lessonId: "filter-order-of-operations" },
    category: "Tableau",
    topic: "Filters",
    title: "Order a filtered view",
    prompt: "Which action should happen first when a dashboard is too crowded with irrelevant records?",
    type: "Drag & Drop Ordering",
    difficulty: "Beginner",
    xpReward: 15,
    hint: "Start by clarifying the audience and decision, then reduce the data deliberately.",
    explanation: "Define the question before applying a filter so the filter supports a decision rather than hiding context.",
    orderItems: ["Clarify the decision", "Choose the relevant field", "Apply the filter", "Check totals and context"],
  },
  {
    id: "tableau-calculated-field",
    curriculum: { studioId: "tableau-studio", lessonId: "calculated-fields" },
    category: "Tableau",
    topic: "Calculated fields",
    title: "Create a margin calculation",
    prompt: "Which expression calculates profit margin when Profit and Sales are measures?",
    type: "Formula Writing",
    difficulty: "Intermediate",
    xpReward: 20,
    hint: "Divide profit by sales and protect the denominator in production.",
    explanation: "A calculated field such as SUM([Profit]) / SUM([Sales]) expresses margin at the view's grain.",
    acceptedAnswers: ["SUM([Profit]) / SUM([Sales])", "SUM([Profit])/SUM([Sales])"],
  },
  {
    id: "tableau-parameter-use",
    curriculum: { studioId: "tableau-studio", lessonId: "parameters" },
    category: "Tableau",
    topic: "Interactivity",
    title: "Use a parameter",
    prompt: "What is a parameter best suited to control in a Tableau dashboard?",
    type: "Multiple Choice",
    difficulty: "Intermediate",
    xpReward: 20,
    hint: "It is a user-controlled value that can drive calculations or selections.",
    explanation: "Parameters let users change a value such as a selected measure or threshold without changing the data source.",
    options: ["A user-controlled calculation input", "A replacement for every relationship", "A CSV file format", "A permanent data filter only"],
    correctAnswer: "A user-controlled calculation input",
  },
  {
    id: "tableau-dashboard-story",
    curriculum: { studioId: "tableau-studio", lessonId: "stories" },
    category: "Tableau",
    topic: "Dashboard design",
    title: "Guide dashboard attention",
    prompt: "A dashboard has twelve equal-sized charts and users miss the key KPI. What is the best redesign principle?",
    type: "Business Case Questions",
    difficulty: "Advanced",
    xpReward: 30,
    hint: "Visual hierarchy should reflect the decision priority.",
    explanation: "Emphasize the primary KPI, reduce nonessential views, and create a clear reading path.",
    options: ["Make every chart identical", "Create hierarchy around the decision", "Add more colors everywhere", "Remove all labels"],
    correctAnswer: "Create hierarchy around the decision",
  },
  {
    id: "tableau-lod-context",
    curriculum: { studioId: "tableau-studio", lessonId: "level-of-detail-expressions" },
    category: "Tableau",
    topic: "Level of detail",
    title: "Choose a fixed grain",
    prompt: "Which LOD expression keeps a customer total independent of the view dimensions?",
    type: "Formula Writing",
    difficulty: "Advanced",
    xpReward: 30,
    hint: "Declare Customer inside a FIXED expression.",
    explanation: "{ FIXED [Customer] : SUM([Sales]) } evaluates each customer's total at a stable grain.",
    acceptedAnswers: ["{ FIXED [Customer] : SUM([Sales]) }", "{FIXED [Customer]:SUM([Sales])}"],
  },
  {
    id: "powerquery-type-detection",
    curriculum: { studioId: "power-query-studio", lessonId: "detect-change-data-types" },
    category: "Power Query",
    topic: "Data types",
    title: "Set a reliable type",
    prompt: "Why should a Power Query model explicitly set important column data types?",
    type: "Multiple Choice",
    difficulty: "Beginner",
    xpReward: 15,
    hint: "Types control sorting, arithmetic, joins, and refresh consistency.",
    explanation: "Explicit types prevent text numbers, locale surprises, and inconsistent downstream calculations.",
    options: ["To make refresh behavior predictable", "To hide errors", "To remove all nulls automatically", "To avoid naming columns"],
    correctAnswer: "To make refresh behavior predictable",
  },
  {
    id: "powerquery-remove-errors",
    curriculum: { studioId: "power-query-studio", lessonId: "remove-errors" },
    category: "Power Query",
    topic: "Data cleaning",
    title: "Handle transformation errors",
    prompt: "Which approach is safest when a type conversion creates errors?",
    type: "Business Case Questions",
    difficulty: "Beginner",
    xpReward: 15,
    hint: "Inspect the bad records before choosing a replacement or removal rule.",
    explanation: "Profile and document errors first; blindly removing rows can hide source-quality problems.",
    options: ["Inspect and document the error rule", "Delete every error immediately", "Ignore the column", "Duplicate the query repeatedly"],
    correctAnswer: "Inspect and document the error rule",
  },
  {
    id: "powerquery-append-files",
    curriculum: { studioId: "power-query-studio", lessonId: "append-queries" },
    category: "Power Query",
    topic: "Combining data",
    title: "Stack monthly files",
    prompt: "Which operation stacks rows from tables with compatible columns?",
    type: "Multiple Choice",
    difficulty: "Intermediate",
    xpReward: 20,
    hint: "It combines vertically rather than matching a key across tables.",
    explanation: "Append creates one longer table by stacking rows from compatible queries.",
    options: ["Append", "Merge", "Transpose", "Unpivot only"],
    correctAnswer: "Append",
  },
  {
    id: "powerquery-merge-key",
    curriculum: { studioId: "power-query-studio", lessonId: "merge-queries" },
    category: "Power Query",
    topic: "Combining data",
    title: "Merge on a business key",
    prompt: "What must be checked before merging a customer table onto orders?",
    type: "Multiple Choice",
    difficulty: "Advanced",
    xpReward: 30,
    hint: "A key should have the intended grain and compatible type on both sides.",
    explanation: "Key uniqueness, type compatibility, and join kind determine whether a merge preserves the expected row grain.",
    options: ["Key grain and data type", "Only column color", "The number of worksheets", "Whether headers are bold"],
    correctAnswer: "Key grain and data type",
  },
  {
    id: "powerquery-m-function",
    curriculum: { studioId: "power-query-studio", lessonId: "m-functions" },
    category: "Power Query",
    topic: "M language",
    title: "Create a reusable step",
    prompt: "Which M construct lets a transformation accept parameters and return a result?",
    type: "Fill in the Blank",
    difficulty: "Advanced",
    xpReward: 30,
    hint: "It defines reusable logic with inputs and an expression.",
    explanation: "An M function encapsulates repeatable transformation logic and can be invoked for multiple sources.",
    acceptedAnswers: ["function", "M function"],
  },
  {
    id: "powerquery-query-folding",
    curriculum: { studioId: "power-query-studio", lessonId: "query-folding" },
    category: "Power Query",
    topic: "Performance",
    title: "Preserve query folding",
    prompt: "What is the main benefit of keeping foldable steps close to the source?",
    type: "Multiple Choice",
    difficulty: "Advanced",
    xpReward: 30,
    hint: "Push work to the source system when it can execute the transformation efficiently.",
    explanation: "Query folding can reduce data transferred and let the source optimize filters and projections.",
    options: ["More work can run at the source", "Every step becomes manual", "Types are removed", "Refresh stops using credentials"],
    correctAnswer: "More work can run at the source",
  },
  {
    id: "business-revenue-growth",
    curriculum: { studioId: "business-analytics-studio", lessonId: "mom-yoy-growth" },
    category: "Business Analytics",
    topic: "Business metrics",
    title: "Calculate growth",
    prompt: "Revenue was 100 last month and 120 this month. What is the month-over-month growth rate?",
    type: "Formula Writing",
    difficulty: "Beginner",
    xpReward: 15,
    hint: "Divide the change by the prior period value.",
    explanation: "(120 - 100) / 100 = 20%, so revenue grew by 20%.",
    acceptedAnswers: ["20%", "0.2", "20"],
  },
  {
    id: "business-funnel-conversion",
    curriculum: { studioId: "business-analytics-studio", lessonId: "conversion-analysis" },
    category: "Business Analytics",
    topic: "Marketing analytics",
    title: "Read a funnel rate",
    prompt: "If 200 visitors produce 10 purchases, what is the conversion rate?",
    type: "Fill in the Blank",
    difficulty: "Beginner",
    xpReward: 15,
    hint: "Purchases divided by visitors gives the rate.",
    explanation: "10 / 200 = 0.05, or 5% conversion.",
    acceptedAnswers: ["5%", "0.05", "5"],
  },
  {
    id: "business-operations-kpi",
    curriculum: { studioId: "business-analytics-studio", lessonId: "process-cycle-time" },
    category: "Business Analytics",
    topic: "Operations analytics",
    title: "Choose an operations KPI",
    prompt: "Which KPI best indicates how long an order takes from placement to delivery?",
    type: "Multiple Choice",
    difficulty: "Intermediate",
    xpReward: 20,
    hint: "Measure elapsed time across the fulfillment process.",
    explanation: "Order cycle time directly measures the duration between order placement and delivery.",
    options: ["Order cycle time", "Logo impressions", "Employee headcount only", "Email open rate"],
    correctAnswer: "Order cycle time",
  },
  {
    id: "business-segment-retention",
    curriculum: { studioId: "business-analytics-studio", lessonId: "cohort-analysis" },
    category: "Business Analytics",
    topic: "Customer analytics",
    title: "Compare retention cohorts",
    prompt: "Why should retention be compared by signup cohort instead of only as one overall rate?",
    type: "Business Case Questions",
    difficulty: "Intermediate",
    xpReward: 20,
    hint: "Cohorts reveal changes in customer experience over time.",
    explanation: "Cohort retention separates customer age and acquisition period, helping identify onboarding or product changes.",
    options: ["Cohorts reveal lifecycle patterns", "It removes the need for dates", "It guarantees causation", "It makes sample size irrelevant"],
    correctAnswer: "Cohorts reveal lifecycle patterns",
  },
  {
    id: "business-forecast-interval",
    category: "Business Analytics",
    topic: "Forecasting",
    title: "Communicate forecast uncertainty",
    prompt: "A forecast includes a wide prediction interval. What should the analyst communicate?",
    type: "Multiple Choice",
    difficulty: "Advanced",
    xpReward: 30,
    hint: "The interval describes a range of plausible future outcomes.",
    explanation: "A wide interval signals meaningful uncertainty and should inform scenario planning rather than a single-point promise.",
    options: ["Only the midpoint is certain", "Plan around a range of plausible outcomes", "Ignore uncertainty", "The model has no value"],
    correctAnswer: "Plan around a range of plausible outcomes",
  },
  {
    id: "business-experiment-incrementality",
    curriculum: { studioId: "business-analytics-studio", lessonId: "experiment-design" },
    category: "Business Analytics",
    topic: "Decision science",
    title: "Measure incremental impact",
    prompt: "Which design best estimates whether a campaign caused additional purchases?",
    type: "Business Case Questions",
    difficulty: "Advanced",
    xpReward: 30,
    hint: "Compare an exposed group with a valid counterfactual.",
    explanation: "Randomized treatment and control groups estimate incremental lift while reducing confounding.",
    options: ["Randomized treatment and control", "Compare only campaign totals", "Ask the highest spenders", "Use last year's total without controls"],
    correctAnswer: "Randomized treatment and control",
  },
];

const tableContext = (
  title: string,
  columns: string[],
  rows: string[][],
  note?: string,
): PracticeQuestionContext => ({ title, columns, rows, note });

const salesWorksheet = tableContext(
  "Sales worksheet preview",
  ["OrderID", "Region", "Amount", "Status", "CustomerID"],
  [
    ["SO-1001", "North", "1250", "Completed", "C-101"],
    ["SO-1002", "West", "675", "Pending", "C-102"],
    ["SO-1003", "West", "980", "Completed", "C-101"],
    ["SO-1004", "East", "1440", "Completed", "C-103"],
  ],
  "Use the named columns in the prompt; the rows are representative inputs for the exercise.",
);

const productLookup = tableContext(
  "Products lookup table",
  ["ID", "Product", "Price"],
  [
    ["P-101", "Laptop", "1250"],
    ["P-102", "Mouse", "675"],
    ["P-103", "Tablet", "980"],
  ],
  "Products[ID] is the key column and Products[Price] is the return column.",
);

const textImport = tableContext(
  "Imported customer names",
  ["A", "B"],
  [["  Aisha   Khan ", "North"], ["Rohan Mehta", "West"]],
  "A2 contains extra spaces so the cleaning result is observable.",
);

const twoWayLookup = tableContext(
  "Regional price matrix",
  ["Product", "North", "West", "South"],
  [["Laptop", "1250", "1300", "1275"], ["Mouse", "25", "27", "24"], ["Tablet", "980", "1010", "995"]],
  "Use the row key Product and the column header Region to locate the intersection.",
);

const statusTable = tableContext(
  "Customer status table",
  ["Customer", "Status", "Revenue"],
  [["Aisha", "Active", "1250"], ["Rohan", "Inactive", "675"], ["Meera", "Active", "980"]],
  "Status is the criterion column for the dynamic filter.",
);

const ordersSchema = tableContext(
  "Orders table schema",
  ["order_id", "customer_id", "region", "amount", "status", "order_date"],
  [["O-1001", "C-101", "North", "1250", "Completed", "2026-01-05"], ["O-1002", "C-102", "West", "675", "Pending", "2026-01-12"], ["O-1003", "C-101", "West", "980", "Completed", "2026-02-03"]],
  "The schema and sample rows show the available fields without requiring a live database.",
);

const customersOrdersSchema = tableContext(
  "Customers and orders relationship",
  ["customers.customer_id", "customers.name", "orders.order_id", "orders.customer_id"],
  [["C-101", "Aisha", "O-1001", "C-101"], ["C-102", "Rohan", "—", "—"]],
  "The customer on the left has no order, illustrating why LEFT JOIN preserves it.",
);

const pythonFrame = tableContext(
  "Pandas DataFrame preview",
  ["customer", "region", "revenue", "order_value", "date"],
  [["Aisha", "North", "1250", "1250", "2026-01-05"], ["Rohan", "West", "675", "225", "2026-01-12"], ["Meera", "South", "980", "980", "2026-02-03"]],
  "Use these column labels and values when writing the requested pandas expression.",
);

const pythonMergeFrames = tableContext(
  "DataFrame join keys",
  ["orders.customer_id", "orders.revenue", "customers.customer_id", "customers.segment"],
  [["C-101", "1250", "C-101", "Enterprise"], ["C-102", "675", "C-102", "Starter"]],
  "Both frames share customer_id, which is the explicit merge key.",
);

const rollingSeries = tableContext(
  "Time-ordered revenue Series",
  ["date", "revenue"],
  [["2026-01-05", "100"], ["2026-01-12", "120"], ["2026-02-03", "90"], ["2026-02-18", "150"]],
  "The dates are already ordered, so rolling(3) uses each row and the two preceding observations.",
);

const marginModel = tableContext(
  "Power BI measure context",
  ["Measure", "Value"],
  [["[Revenue]", "100000"], ["[Profit]", "18000"], ["[Discount Rate]", "0.14"]],
  "The measures are supplied by the model; the task is to choose the safe DAX expression or interpretation.",
);

const dateModel = tableContext(
  "Power BI date model",
  ["Date", "Year", "Month"],
  [["2026-01-05", "2026", "January"], ["2026-02-03", "2026", "February"]],
  "A complete marked date table provides reusable calendar attributes for time intelligence.",
);

const errorPreview = tableContext(
  "Power Query conversion preview",
  ["Raw value", "Attempted type"],
  [["1250", "Number"], ["N/A", "Number error"], ["980", "Number"]],
  "Inspect the N/A record before deciding whether to replace, remove, or route it for review.",
);

const growthEvidence = tableContext(
  "Business growth evidence",
  ["Metric", "Prior", "Current"],
  [["Revenue", "100", "120"], ["Visitors", "200", "240"]],
  "Growth rate is the change divided by the prior-period value.",
);

const funnelEvidence = tableContext(
  "Funnel evidence",
  ["Stage", "Count"],
  [["Visitors", "200"], ["Purchases", "10"]],
  "Conversion rate is purchases divided by visitors.",
);

const contextByQuestionId: Record<string, PracticeQuestionContext> = {
  "excel-if-formula": salesWorksheet,
  "excel-xlookup-blank": productLookup,
  "excel-sumifs-by-region": salesWorksheet,
  "excel-text-cleaning": textImport,
  "excel-index-match-two-way": twoWayLookup,
  "excel-dynamic-filter": statusTable,
  "sql-region-aggregate": ordersSchema,
  "sql-left-join": customersOrdersSchema,
  "sql-where-filter": ordersSchema,
  "sql-count-distinct-customers": ordersSchema,
  "sql-window-running-total": ordersSchema,
  "python-filter-revenue": pythonFrame,
  "python-groupby-blank": pythonFrame,
  "python-select-column": pythonFrame,
  "python-fill-missing-values": pythonFrame,
  "python-merge-dataframes": pythonMergeFrames,
  "python-groupby-multi-agg": pythonFrame,
  "python-time-aware-rolling": rollingSeries,
  "powerbi-margin-card": marginModel,
  "powerbi-margin-dax": marginModel,
  "powerbi-date-table": dateModel,
  "powerquery-remove-errors": errorPreview,
  "business-revenue-growth": growthEvidence,
  "business-funnel-conversion": funnelEvidence,
};

function canonicalPracticeAnswer(question: PracticeQuestion): string {
  if (question.type === "Match the Columns") {
    return (question.pairs ?? []).map((pair) => `${pair.left} → ${pair.right}`).join("; ");
  }
  if (question.type === "Drag & Drop Ordering") return question.orderItems?.join(" → ") ?? "";
  return question.correctAnswer ?? question.acceptedAnswers?.[0] ?? "";
}

function enrichPracticeQuestion(question: PracticeQuestion): PracticeQuestion {
  const context = question.context ?? contextByQuestionId[question.id];
  return {
    ...question,
    context,
    solution: {
      canonicalAnswer: canonicalPracticeAnswer(question),
      steps: [
        "Read the supplied context and identify the field, rule, or relationship named in the prompt.",
        "Apply the relevant technique using the answer shape requested by this question.",
        question.explanation,
      ],
    },
  };
}

export const practiceQuestions: PracticeQuestion[] = basePracticeQuestions.map(
  enrichPracticeQuestion,
);

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every((item) => isNonEmptyString(item))
  );
}

function isAllowedValue<T extends string>(
  value: unknown,
  values: readonly T[],
): value is T {
  return typeof value === "string" && values.includes(value as T);
}

function addMissingFieldIssue(
  issues: PracticeQuestionValidationIssue[],
  questionId: string | undefined,
  index: number,
  field: string,
) {
  issues.push({
    code: "missing-field",
    field,
    index,
    questionId,
    message: `${field} must be a non-empty string`,
  });
}

/** Validate one question without changing or normalizing the supplied data. */
export function validatePracticeQuestion(
  value: unknown,
  index = 0,
): readonly PracticeQuestionValidationIssue[] {
  const issues: PracticeQuestionValidationIssue[] = [];
  if (!isRecord(value)) {
    return [
      {
        code: "invalid-record",
        index,
        message: "Question must be an object record",
      },
    ];
  }

  const questionId = typeof value.id === "string" ? value.id : undefined;
  if (!isNonEmptyString(value.id)) {
    addMissingFieldIssue(issues, questionId, index, "id");
  }

  for (const field of ["topic", "title", "prompt", "hint", "explanation"]) {
    if (!isNonEmptyString(value[field])) {
      addMissingFieldIssue(issues, questionId, index, field);
    }
  }

  if (!isRecord(value.solution) || !isNonEmptyString(value.solution.canonicalAnswer)) {
    issues.push({
      code: "missing-answer",
      field: "solution",
      index,
      questionId,
      message: "Every question requires a canonical solution answer",
    });
  } else if (!isStringArray(value.solution.steps)) {
    issues.push({
      code: "missing-field",
      field: "solution.steps",
      index,
      questionId,
      message: "Every solution requires at least one worked step",
    });
  }

  if (value.context !== undefined && typeof value.context !== "string") {
    if (
      !isRecord(value.context) ||
      !isNonEmptyString(value.context.title) ||
      !isStringArray(value.context.columns) ||
      !Array.isArray(value.context.rows) ||
      !value.context.rows.every((row) => isStringArray(row))
    ) {
      issues.push({
        code: "invalid-value",
        field: "context",
        index,
        questionId,
        message: "Structured context requires a title, columns, and non-empty rows",
      });
    }
  }

  if (!isAllowedValue(value.category, practiceCategories)) {
    issues.push({
      code: "invalid-value",
      field: "category",
      index,
      questionId,
      message: `category must be one of: ${practiceCategories.join(", ")}`,
    });
  }
  if (!isAllowedValue(value.difficulty, practiceDifficulties)) {
    issues.push({
      code: "invalid-value",
      field: "difficulty",
      index,
      questionId,
      message: `difficulty must be one of: ${practiceDifficulties.join(", ")}`,
    });
  }
  if (!isAllowedValue(value.type, practiceQuestionTypes)) {
    issues.push({
      code: "invalid-value",
      field: "type",
      index,
      questionId,
      message: `type must be one of: ${practiceQuestionTypes.join(", ")}`,
    });
    return issues;
  }
  if (
    typeof value.xpReward !== "number" ||
    !Number.isFinite(value.xpReward) ||
    value.xpReward < 0
  ) {
    issues.push({
      code: "invalid-value",
      field: "xpReward",
      index,
      questionId,
      message: "xpReward must be a finite non-negative number",
    });
  }

  if (value.curriculum !== undefined) {
    const reference = value.curriculum;
    if (!isRecord(reference)) {
      issues.push({
        code: "invalid-curriculum-reference",
        field: "curriculum",
        index,
        questionId,
        message: "curriculum must contain a studioId and lessonId",
      });
    } else if (
      typeof reference.studioId !== "string" ||
      typeof reference.lessonId !== "string" ||
      reference.lessonId.trim().length === 0
    ) {
      issues.push({
        code: "invalid-curriculum-reference",
        field: "curriculum",
        index,
        questionId,
        message: "curriculum studioId and lessonId must be non-empty strings",
      });
    } else {
      const configuration = getStudioCurriculumConfiguration(reference.studioId);
      if (!configuration || !configuration.officialCoreLessonIds.includes(reference.lessonId)) {
        issues.push({
          code: "invalid-curriculum-reference",
          field: "curriculum",
          index,
          questionId,
          message: `No official curriculum lesson ${reference.studioId}/${reference.lessonId} exists`,
        });
      }
    }
  }

  if (
    value.type === "Multiple Choice" ||
    value.type === "Dashboard Interpretation" ||
    value.type === "Business Case Questions"
  ) {
    if (!isStringArray(value.options)) {
      issues.push({
        code: "missing-answer",
        field: "options",
        index,
        questionId,
        message: "choice questions require a non-empty options array",
      });
    }
    if (!isNonEmptyString(value.correctAnswer)) {
      issues.push({
        code: "missing-answer",
        field: "correctAnswer",
        index,
        questionId,
        message: "choice questions require a correctAnswer",
      });
    } else if (isStringArray(value.options) && !value.options.includes(value.correctAnswer)) {
      issues.push({
        code: "invalid-value",
        field: "correctAnswer",
        index,
        questionId,
        message: "correctAnswer must be present in options",
      });
    }
  } else if (
    value.type === "Fill in the Blank" ||
    value.type === "Formula Writing" ||
    value.type === "SQL Query" ||
    value.type === "Python Coding"
  ) {
    if (!isStringArray(value.acceptedAnswers)) {
      issues.push({
        code: "missing-answer",
        field: "acceptedAnswers",
        index,
        questionId,
        message: "text-answer questions require acceptedAnswers",
      });
    }
  } else if (value.type === "Match the Columns") {
    if (
      !Array.isArray(value.pairs) ||
      value.pairs.length === 0 ||
      !value.pairs.every(
        (pair) =>
          isRecord(pair) &&
          isNonEmptyString(pair.left) &&
          isNonEmptyString(pair.right),
      )
    ) {
      issues.push({
        code: "missing-answer",
        field: "pairs",
        index,
        questionId,
        message: "matching questions require non-empty left/right pairs",
      });
    }
  } else if (!isStringArray(value.orderItems)) {
    issues.push({
      code: "missing-answer",
      field: "orderItems",
      index,
      questionId,
      message: "ordering questions require a non-empty orderItems array",
    });
  }

  return issues;
}

/** Validate a question bank, including stable ID uniqueness. */
export function validatePracticeQuestionBank(
  questions: readonly unknown[],
): PracticeQuestionValidationResult {
  const issues: PracticeQuestionValidationIssue[] = [];
  const ids = new Map<string, number>();

  questions.forEach((question, index) => {
    const questionId =
      isRecord(question) && typeof question.id === "string"
        ? question.id
        : undefined;
    if (questionId) {
      const firstIndex = ids.get(questionId);
      if (firstIndex !== undefined) {
        issues.push({
          code: "duplicate-id",
          field: "id",
          index,
          questionId,
          message: `Duplicate question id; first seen at index ${firstIndex}`,
        });
      } else {
        ids.set(questionId, index);
      }
    }
    issues.push(...validatePracticeQuestion(question, index));
  });

  return {
    valid: issues.length === 0,
    questionCount: questions.length,
    uniqueIdCount: ids.size,
    issues,
  };
}

/** Snapshot validation for the shipped catalog; this never mutates learner state. */
export const practiceQuestionValidation = validatePracticeQuestionBank(
  practiceQuestions,
);

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
