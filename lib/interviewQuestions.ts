export const interviewCategories = [
  "Excel",
  "SQL",
  "Python",
  "Statistics",
  "Power BI",
  "Tableau",
  "Power Query",
  "Business Analytics",
  "HR Interview",
  "Data Analyst Projects",
  "Resume & Portfolio",
] as const;

export const interviewDifficulties = [
  "Beginner",
  "Intermediate",
  "Advanced",
] as const;

export type InterviewCategory = (typeof interviewCategories)[number];
export type InterviewDifficulty = (typeof interviewDifficulties)[number];

export type InterviewQuestion = {
  id: string;
  category: InterviewCategory;
  topic: string;
  difficulty: InterviewDifficulty;
  question: string;
  idealAnswer: string;
  beginnerExplanation: string;
  advancedExplanation: string;
  commonMistakes: string[];
  followUpQuestions: string[];
  realInterviewTip: string;
  xpReward: number;
};

type TopicBlueprint = {
  category: InterviewCategory;
  topic: string;
  subject: string;
  ideal: string;
  beginner: string;
  advanced: string;
  mistakes: string[];
  followUps: string[];
  tip: string;
};

const variants: Array<{
  difficulty: InterviewDifficulty;
  question: (subject: string) => string;
  idealFocus: string;
  advancedFocus: string;
  followUp: string;
}> = [
  {
    difficulty: "Beginner",
    question: (subject) => `What is the purpose of ${subject}, and when would you use it?`,
    idealFocus: "Start with a plain-language definition, then connect it to one realistic analyst task.",
    advancedFocus: "A strong answer also states the assumptions that make the technique appropriate.",
    followUp: "What simple example would you use to teach this concept?",
  },
  {
    difficulty: "Beginner",
    question: (subject) => `Walk through a simple interview example involving ${subject}.`,
    idealFocus: "Use a small input, describe the action, and finish with the expected output or decision.",
    advancedFocus: "Name one validation check that proves the example is correct.",
    followUp: "How would you verify the result?",
  },
  {
    difficulty: "Beginner",
    question: (subject) => `How would you explain ${subject} to a non-technical teammate?`,
    idealFocus: "Avoid jargon, use a business analogy, and explain why the result matters.",
    advancedFocus: "Translate the technical constraint into a concrete business risk or benefit.",
    followUp: "Which term would you avoid or define first?",
  },
  {
    difficulty: "Intermediate",
    question: (subject) => `Compare two valid approaches to ${subject}. Which would you choose and why?`,
    idealFocus: "Compare correctness, maintainability, speed, and the needs of the audience before choosing.",
    advancedFocus: "Make the trade-off explicit instead of claiming one approach is universally best.",
    followUp: "When would your preferred approach become the wrong choice?",
  },
  {
    difficulty: "Intermediate",
    question: (subject) => `A result involving ${subject} is wrong. How would you diagnose it?`,
    idealFocus: "Reproduce the issue, inspect inputs and assumptions, isolate one step at a time, and validate the fix.",
    advancedFocus: "Add a regression check so the same failure is detected automatically next time.",
    followUp: "What evidence would tell you the root cause is upstream?",
  },
  {
    difficulty: "Intermediate",
    question: (subject) => `Design a repeatable analyst workflow for ${subject}.`,
    idealFocus: "Describe inputs, transformation or reasoning steps, validation, documentation, and the final handoff.",
    advancedFocus: "Separate reusable logic from one-off decisions and identify ownership for each control.",
    followUp: "Which step would you automate first?",
  },
  {
    difficulty: "Advanced",
    question: (subject) => `How would you scale or optimize ${subject} for a large, frequently refreshed dataset?`,
    idealFocus: "Measure the bottleneck first, reduce unnecessary work, and preserve correctness with targeted tests.",
    advancedFocus: "Discuss computational cost, data movement, incremental processing, observability, and failure recovery.",
    followUp: "Which metric would prove the optimization worked?",
  },
  {
    difficulty: "Advanced",
    question: (subject) => `What trade-offs and edge cases matter when using ${subject}?`,
    idealFocus: "State at least two failure modes, how to detect them, and when an alternative is safer.",
    advancedFocus: "Include data quality, governance, performance, and interpretation risks rather than only syntax.",
    followUp: "Which edge case is most likely to escape a basic test?",
  },
  {
    difficulty: "Advanced",
    question: (subject) => `How would you defend a decision involving ${subject} in a senior interview?`,
    idealFocus: "Frame the objective, evidence, alternatives, decision, measurable outcome, and what you would improve.",
    advancedFocus: "Quantify uncertainty and show how new evidence could change the decision.",
    followUp: "What would make you reverse your recommendation?",
  },
];

const blueprints: TopicBlueprint[] = [
  {
    category: "Excel", topic: "Formulas", subject: "Excel formulas for conditional business logic",
    ideal: "Use clear cell or structured references, select the smallest suitable function, handle blanks and errors deliberately, and test representative cases.",
    beginner: "A formula turns cell values into a repeatable result. Good formulas are readable and tested with normal and unusual inputs.",
    advanced: "Prefer structured references, LET for repeated expressions, explicit error handling, and helper logic when one dense formula would be hard to audit.",
    mistakes: ["Hard-coding values that should be referenced", "Hiding errors with IFERROR before finding their cause", "Testing only one happy-path row"],
    followUps: ["When would you use a helper column?", "How do relative and absolute references differ?"],
    tip: "Say the formula aloud as business logic before giving syntax; interviewers value reasoning over memorized punctuation.",
  },
  {
    category: "Excel", topic: "Lookups", subject: "Excel lookup functions for reliable data matching",
    ideal: "Choose XLOOKUP or INDEX/MATCH based on compatibility, use stable keys, define missing-match behavior, and validate duplicates before trusting the result.",
    beginner: "A lookup finds a key in one place and returns related information from another place.",
    advanced: "Discuss exact matching, duplicate keys, search direction, composite keys, spill behavior, and why Power Query may be safer for repeatable joins.",
    mistakes: ["Using approximate match accidentally", "Assuming lookup keys are unique", "Ignoring leading spaces or inconsistent data types"],
    followUps: ["Why might XLOOKUP return the wrong row?", "When is INDEX/MATCH still useful?"],
    tip: "Mention duplicate-key validation; it is the detail that separates production thinking from a syntax-only answer.",
  },
  {
    category: "Excel", topic: "Pivot Tables", subject: "Pivot Tables for summarizing business data",
    ideal: "Start with a clean tabular source, place dimensions in rows or columns, measures in values, choose the correct aggregation, and refresh and validate totals.",
    beginner: "A Pivot Table groups many rows into a summary without changing the source data.",
    advanced: "Cover source-table design, distinct counts, calculated fields or measures, grouping risks, cache refresh, and reconciliation to source totals.",
    mistakes: ["Using a source with blank headers or subtotal rows", "Leaving numeric fields summarized as Count", "Forgetting to refresh after source changes"],
    followUps: ["How do slicers improve a Pivot Table?", "How would you reconcile a Pivot total?"],
    tip: "Describe one concrete field layout—such as Region in Rows and Revenue in Values—to make the answer tangible.",
  },
  {
    category: "Excel", topic: "Data Cleaning", subject: "cleaning messy business data in Excel",
    ideal: "Preserve the raw data, profile blanks and invalid values, standardize text and types, remove duplicates with a defined key, and document every rule.",
    beginner: "Cleaning makes values consistent so formulas, summaries, and charts do not silently mix incompatible data.",
    advanced: "Explain lineage, reproducibility, exception tables, rule-based validation, and when Power Query should replace manual edits.",
    mistakes: ["Editing the only copy of raw data", "Removing duplicates without defining the business key", "Converting identifiers into numbers"],
    followUps: ["How would you detect hidden spaces?", "Which cleaning step should never be manual in a recurring report?"],
    tip: "Interviewers like hearing that you preserve the raw layer and produce an exceptions list instead of silently deleting questionable rows.",
  },
  {
    category: "Excel", topic: "Performance", subject: "optimizing a large Excel workbook",
    ideal: "Measure slow sheets, reduce volatile functions and repeated calculations, limit full-column arrays, simplify dependencies, and move repeatable transformations upstream.",
    beginner: "Workbook speed depends on how much Excel recalculates and how complex the dependency chain is.",
    advanced: "Discuss calculation modes, volatile functions, dynamic arrays, Power Pivot, query folding upstream, file formats, and model separation.",
    mistakes: ["Changing calculation to manual without warning users", "Using full-column array formulas everywhere", "Optimizing before locating the bottleneck"],
    followUps: ["Which functions are volatile?", "When would you move data into Power Pivot?"],
    tip: "Lead with measurement. Saying 'I first identify the slow calculation path' sounds much stronger than listing random tricks.",
  },

  {
    category: "SQL", topic: "Query Fundamentals", subject: "writing clear and correct SQL queries",
    ideal: "Define the required grain, select only needed columns, filter deliberately, use meaningful aliases, and validate row counts and duplicates.",
    beginner: "A SQL query describes which columns and rows to return from one or more tables.",
    advanced: "Cover logical query processing order, NULL semantics, deterministic ordering, data types, and how grain controls correctness.",
    mistakes: ["Using SELECT * in production logic", "Treating NULL as an ordinary value", "Ignoring the expected row grain"],
    followUps: ["What is SQL's logical processing order?", "How would you validate a filter?"],
    tip: "State the intended output grain before writing SQL; it prevents many join and aggregation mistakes.",
  },
  {
    category: "SQL", topic: "Joins", subject: "SQL joins across business tables",
    ideal: "Choose the join from the retention requirement, confirm key cardinality, qualify columns, and compare row counts before and after the join.",
    beginner: "A join combines related rows using one or more matching keys.",
    advanced: "Discuss one-to-many expansion, many-to-many traps, non-equi joins, anti-joins, NULL keys, and pre-aggregation when grains differ.",
    mistakes: ["Joining without checking key uniqueness", "Using DISTINCT to hide duplicated rows", "Filtering a right table in WHERE after a LEFT JOIN"],
    followUps: ["How can a LEFT JOIN behave like an INNER JOIN?", "How do you detect a many-to-many join?"],
    tip: "Use row-count and key-cardinality checks in your answer; they show you think beyond syntax.",
  },
  {
    category: "SQL", topic: "Aggregation", subject: "SQL aggregation and grouped metrics",
    ideal: "Set the grouping grain, apply the correct aggregate, keep non-aggregated columns in GROUP BY, and distinguish WHERE from HAVING.",
    beginner: "Aggregation collapses multiple rows into measures such as sums, counts, or averages for each group.",
    advanced: "Discuss conditional aggregation, distinct-count cost, weighted averages, double counting after joins, and grouping sets.",
    mistakes: ["Averaging averages without weights", "Filtering aggregates in WHERE", "Aggregating after a join that duplicated facts"],
    followUps: ["When do you use HAVING?", "How would you calculate a weighted average?"],
    tip: "Say what one output row represents; that single sentence makes grouped-query answers much clearer.",
  },
  {
    category: "SQL", topic: "Window Functions", subject: "SQL window functions for analytical calculations",
    ideal: "Use OVER with an intentional partition and order to calculate ranks, running values, or comparisons without collapsing detail rows.",
    beginner: "A window function calculates across related rows while keeping each original row visible.",
    advanced: "Explain frames, peer rows, ROWS versus RANGE, deterministic tie-breaking, and memory or sort costs.",
    mistakes: ["Omitting ORDER BY for sequence-dependent calculations", "Confusing GROUP BY with PARTITION BY", "Ignoring ties in ranking"],
    followUps: ["How do ROW_NUMBER and RANK differ?", "What frame does a running total need?"],
    tip: "Give one compact example—like LAG for month-over-month change—to prove you understand why windows matter.",
  },
  {
    category: "SQL", topic: "Optimization", subject: "optimizing a slow SQL query",
    ideal: "Inspect the execution plan, verify statistics and indexes, reduce scanned data, simplify expensive operations, and benchmark with representative parameters.",
    beginner: "Optimization means doing less unnecessary work while returning the same correct result.",
    advanced: "Cover sargability, join strategies, cardinality estimates, partition pruning, spills, parameter sensitivity, and workload trade-offs.",
    mistakes: ["Adding indexes without reading the plan", "Optimizing a query with incorrect results", "Testing only on a tiny sample"],
    followUps: ["What makes a predicate sargable?", "How can an index slow writes?"],
    tip: "Never promise that an index fixes everything; show a measure-plan-change-measure loop.",
  },

  {
    category: "Python", topic: "Core Language", subject: "Python fundamentals in an analyst workflow",
    ideal: "Use clear data structures, small functions, explicit control flow, meaningful names, and predictable error handling.",
    beginner: "Python lets analysts automate repeated steps and express data logic in readable code.",
    advanced: "Discuss mutability, iterators, comprehensions, scope, type hints, exceptions, packaging, and testable function boundaries.",
    mistakes: ["Using mutable default arguments", "Catching every exception silently", "Putting an entire workflow in one notebook cell"],
    followUps: ["When would you use a tuple instead of a list?", "Why are small functions easier to test?"],
    tip: "Use a data-analysis example rather than a generic coding puzzle when explaining Python choices.",
  },
  {
    category: "Python", topic: "Pandas Cleaning", subject: "cleaning tabular data with Pandas",
    ideal: "Inspect shape and dtypes, define missing-value rules, standardize columns, validate keys, and retain an auditable set of transformations.",
    beginner: "Pandas cleaning changes inconsistent rows and columns into dependable analysis-ready data.",
    advanced: "Cover nullable dtypes, vectorization, categorical data, chained assignment, schema validation, and memory-aware loading.",
    mistakes: ["Using inplace changes without checking results", "Filling every missing value with zero", "Ignoring SettingWithCopy warnings"],
    followUps: ["How do you choose a missing-value strategy?", "Why can object dtype be problematic?"],
    tip: "Explain the business meaning of missingness; interviewers want judgment, not just fillna syntax.",
  },
  {
    category: "Python", topic: "Pandas Aggregation", subject: "grouping and aggregating data with Pandas",
    ideal: "Define the grouping keys and output grain, use named aggregations, reset or preserve indexes intentionally, and reconcile totals.",
    beginner: "groupby splits rows into groups, applies calculations, and combines the results.",
    advanced: "Discuss transform versus aggregate, multi-index outputs, observed categories, vectorized custom logic, and performance.",
    mistakes: ["Losing keys in an unexpected index", "Using apply for work a built-in aggregation can do", "Ignoring duplicated rows before grouping"],
    followUps: ["How does transform differ from agg?", "How would you return several named metrics?"],
    tip: "Mention output shape. It demonstrates that you understand the result, not just the method name.",
  },
  {
    category: "Python", topic: "Testing", subject: "testing and validating Python analysis code",
    ideal: "Test pure functions with normal, boundary, and failure cases; validate schemas and invariants; and separate code from external I/O.",
    beginner: "Tests automatically check that code still produces expected results after changes.",
    advanced: "Cover fixtures, property tests, mocks at system boundaries, data contracts, reproducibility, and CI integration.",
    mistakes: ["Testing only that code runs", "Mocking the logic being tested", "Using production data as the only fixture"],
    followUps: ["What is an invariant in a dataset?", "When should you mock an API?"],
    tip: "A tiny test example—such as revenue never being negative after cleaning—makes your answer memorable.",
  },
  {
    category: "Python", topic: "Performance", subject: "optimizing Python data-processing performance",
    ideal: "Profile first, reduce I/O, prefer vectorized operations, use appropriate dtypes, and process only the data needed.",
    beginner: "Faster Python usually comes from avoiding repeated row-by-row work and unnecessary data movement.",
    advanced: "Discuss algorithmic complexity, memory profiling, chunking, categorical types, query engines, parallelism limits, and moving work to SQL.",
    mistakes: ["Using apply without profiling", "Loading every column into memory", "Parallelizing an inefficient algorithm"],
    followUps: ["Why is vectorization faster?", "When would you process data in chunks?"],
    tip: "Quantify before and after performance; a measured improvement is stronger than saying code became 'much faster'.",
  },

  {
    category: "Statistics", topic: "Descriptive Statistics", subject: "descriptive statistics for skewed business data",
    ideal: "Choose measures that match the distribution, report center and spread together, inspect outliers, and preserve business context.",
    beginner: "Descriptive statistics summarize what a dataset looks like without claiming why it happened.",
    advanced: "Discuss robust estimators, transformations, quantiles, distribution shape, sampling weights, and uncertainty in summaries.",
    mistakes: ["Reporting a mean alone for heavily skewed data", "Removing outliers without investigation", "Confusing correlation with causation"],
    followUps: ["When is median better than mean?", "How would you describe spread robustly?"],
    tip: "Connect every statistic to a decision; a median salary matters because it better represents a typical employee in skewed data.",
  },
  {
    category: "Statistics", topic: "Probability", subject: "probability concepts in analytical decision-making",
    ideal: "Define the event and population, apply conditional probability carefully, and communicate the result as uncertainty rather than certainty.",
    beginner: "Probability describes how likely an event is under stated assumptions.",
    advanced: "Cover independence, Bayes' rule, base rates, calibration, expected value, and simulation when formulas are impractical.",
    mistakes: ["Ignoring the base rate", "Treating conditional probabilities as reversible", "Presenting probability as a guaranteed outcome"],
    followUps: ["What is the base-rate fallacy?", "When are two events independent?"],
    tip: "Use frequencies—such as 8 in 100—when explaining probability to non-technical interviewers.",
  },
  {
    category: "Statistics", topic: "Hypothesis Testing", subject: "hypothesis testing for a business experiment",
    ideal: "Define hypotheses and the primary metric before analysis, choose alpha and power, check assumptions, then interpret effect size with the p-value.",
    beginner: "A hypothesis test asks whether observed evidence would be unusual if a baseline claim were true.",
    advanced: "Discuss power, multiple testing, sequential monitoring, practical significance, confidence intervals, and pre-registration.",
    mistakes: ["Saying a p-value is the probability the null is true", "Ignoring effect size", "Changing the metric after seeing results"],
    followUps: ["What does statistical power mean?", "How do confidence intervals help interpretation?"],
    tip: "Always separate statistical significance from business significance.",
  },
  {
    category: "Statistics", topic: "Regression", subject: "interpreting and validating a regression model",
    ideal: "Define the outcome and predictors, inspect assumptions and residuals, interpret coefficients conditionally, and evaluate out-of-sample performance.",
    beginner: "Regression estimates how an outcome tends to change as one or more inputs change.",
    advanced: "Cover multicollinearity, interactions, heteroskedasticity, leakage, regularization, causal limits, and robust validation.",
    mistakes: ["Giving coefficients a causal meaning automatically", "Judging a model only by R²", "Ignoring non-linear patterns in residuals"],
    followUps: ["What does a coefficient mean?", "How do you detect multicollinearity?"],
    tip: "Use the phrase 'holding other included variables constant' when interpreting a multiple-regression coefficient.",
  },
  {
    category: "Statistics", topic: "Experiments", subject: "designing and evaluating an A/B test",
    ideal: "Specify the unit, randomization, primary metric, guardrails, sample size, duration, and decision rule before launch.",
    beginner: "An A/B test randomly assigns comparable units so outcome differences can be attributed more confidently to the treatment.",
    advanced: "Discuss interference, novelty effects, attrition, heterogeneous effects, sequential methods, and operational validity.",
    mistakes: ["Stopping as soon as significance appears", "Running too many primary metrics", "Allowing users to switch variants"],
    followUps: ["How would you choose sample size?", "What is a guardrail metric?"],
    tip: "Mention what decision the experiment will unlock; testing without a decision rule sounds incomplete.",
  },

  {
    category: "Power BI", topic: "Data Modeling", subject: "star-schema modeling in Power BI",
    ideal: "Separate facts from descriptive dimensions, use stable one-to-many relationships, define a date table, and keep filter direction intentional.",
    beginner: "A star schema places measurable events in fact tables and descriptive labels in dimension tables.",
    advanced: "Discuss role-playing dates, bridge tables, inactive relationships, surrogate keys, slowly changing dimensions, and ambiguity.",
    mistakes: ["Using bidirectional filters by default", "Joining tables at incompatible grains", "Keeping one giant flat table without evaluating trade-offs"],
    followUps: ["Why is a date table important?", "When is a bridge table needed?"],
    tip: "Sketch the grain of the fact table verbally before discussing relationships.",
  },
  {
    category: "Power BI", topic: "DAX", subject: "DAX measures and filter context",
    ideal: "Define measures around business logic, explain row and filter context, use CALCULATE deliberately, and validate totals at multiple slices.",
    beginner: "A DAX measure calculates a result dynamically from the filters applied to a report.",
    advanced: "Cover context transition, iterator cost, expanded tables, virtual relationships, variables, and semi-additive calculations.",
    mistakes: ["Creating calculated columns for dynamic metrics", "Ignoring filter context at totals", "Using complex iterators without checking performance"],
    followUps: ["What does CALCULATE change?", "How does a measure differ from a calculated column?"],
    tip: "Explain DAX through a filter-context example instead of reciting function definitions.",
  },
  {
    category: "Power BI", topic: "Visual Design", subject: "designing an effective Power BI dashboard",
    ideal: "Start from user decisions, establish a visual hierarchy, choose honest charts, limit color, provide context, and test interactions.",
    beginner: "A dashboard should help a specific audience notice what matters and decide what to do next.",
    advanced: "Discuss cognitive load, accessibility, small multiples, drill-through, tooltip design, mobile layouts, and performance budgets.",
    mistakes: ["Filling every space with a visual", "Using color without semantic meaning", "Showing KPIs without targets or comparison periods"],
    followUps: ["When would you use a table instead of a chart?", "How do you test dashboard usability?"],
    tip: "Name the user and decision before naming a chart type.",
  },
  {
    category: "Power BI", topic: "Security", subject: "row-level security in Power BI",
    ideal: "Model an entitlement table, define roles with tested filters, map users reliably, and verify behavior using representative identities.",
    beginner: "Row-level security limits which rows each viewer can see in the same report.",
    advanced: "Discuss dynamic RLS, USERPRINCIPALNAME, many-to-many entitlements, workspace roles, build permission, and testing after publication.",
    mistakes: ["Assuming workspace admins are restricted by RLS", "Testing only one user", "Embedding access logic in many unrelated tables"],
    followUps: ["How does dynamic RLS work?", "Which users can bypass RLS?"],
    tip: "Security answers should include testing and governance, not only the DAX filter.",
  },
  {
    category: "Power BI", topic: "Performance", subject: "optimizing Power BI report performance",
    ideal: "Use Performance Analyzer, reduce model size and cardinality, simplify DAX, limit visual queries, and push suitable work upstream.",
    beginner: "Performance depends on model size, calculation complexity, and how many queries the report page triggers.",
    advanced: "Cover VertiPaq compression, storage modes, aggregations, query folding, calculation groups, DirectQuery limits, and capacity diagnostics.",
    mistakes: ["Optimizing visuals before measuring", "Keeping unused high-cardinality columns", "Using DirectQuery as a universal fix"],
    followUps: ["Why does cardinality matter?", "How do Import and DirectQuery differ?"],
    tip: "Separate model, DAX, visual, and source bottlenecks in your answer.",
  },

  {
    category: "Tableau", topic: "Dimensions & Measures", subject: "dimensions and measures in Tableau",
    ideal: "Use dimensions to define the level of detail and measures for quantitative aggregation, while checking whether Tableau's default role matches the analytical intent.",
    beginner: "Dimensions slice data into groups; measures are values Tableau usually aggregates within those groups.",
    advanced: "Discuss discrete versus continuous fields, data roles, generated bins, domain completion, and how the view's grain emerges from pills.",
    mistakes: ["Assuming every numeric field should be a measure", "Confusing blue/green with dimension/measure", "Ignoring aggregation defaults"],
    followUps: ["Can a numeric field be a dimension?", "What changes the view's level of detail?"],
    tip: "Describe what one mark represents; that reveals whether you understand the view's grain.",
  },
  {
    category: "Tableau", topic: "Calculations", subject: "calculated fields in Tableau",
    ideal: "Choose row-level or aggregate logic intentionally, keep types consistent, handle NULLs explicitly, and validate results at several levels of detail.",
    beginner: "A calculated field creates a reusable value from fields and functions in the data source.",
    advanced: "Discuss aggregate/non-aggregate errors, order of operations, table calculations, LOD expressions, parameterization, and pushdown.",
    mistakes: ["Mixing aggregate and row-level expressions", "Replacing every NULL without business reasoning", "Embedding repeated logic in many workbooks"],
    followUps: ["Why does Tableau reject mixed aggregation?", "When should logic move to the data source?"],
    tip: "State at which level the calculation is evaluated before showing syntax.",
  },
  {
    category: "Tableau", topic: "LOD Expressions", subject: "level-of-detail expressions in Tableau",
    ideal: "Use FIXED, INCLUDE, or EXCLUDE to calculate at a declared grain and account for Tableau's filter order.",
    beginner: "An LOD expression controls the grouping level used for a calculation independently of some view details.",
    advanced: "Explain context filters, nested LODs, dimensionality, extract behavior, and performance or maintainability costs.",
    mistakes: ["Using FIXED without considering filters", "Choosing LOD when a simple aggregate works", "Ignoring duplicated source grain"],
    followUps: ["How do FIXED and INCLUDE differ?", "Which filters affect a FIXED LOD?"],
    tip: "Use a customer lifetime sales example; it makes the reason for FIXED immediately clear.",
  },
  {
    category: "Tableau", topic: "Dashboards", subject: "building interactive Tableau dashboards",
    ideal: "Design around questions, use a clear hierarchy, add purposeful actions, provide filter context, and test with the actual audience.",
    beginner: "A dashboard combines coordinated views so users can explore and answer related questions.",
    advanced: "Discuss action scope, device layouts, navigation, accessibility, parameter actions, state clarity, and query load.",
    mistakes: ["Adding interactions without visible state", "Using too many quick filters", "Designing only on a large desktop"],
    followUps: ["How do filter and highlight actions differ?", "How would you design for mobile?"],
    tip: "Explain the sequence of questions a user can answer, not just the collection of charts.",
  },
  {
    category: "Tableau", topic: "Performance", subject: "optimizing Tableau workbook performance",
    ideal: "Use Performance Recording, simplify queries and calculations, reduce marks and filters, optimize extracts, and validate improvements.",
    beginner: "A workbook slows down when it requests too much data or draws and recalculates too many elements.",
    advanced: "Cover extract design, context filters, database pushdown, high-cardinality quick filters, custom SQL, caching, and server telemetry.",
    mistakes: ["Using context filters as a universal speed fix", "Displaying millions of marks", "Blaming Tableau before measuring database time"],
    followUps: ["What does Performance Recording show?", "When is an extract appropriate?"],
    tip: "Break total load time into query, computation, and rendering before proposing a fix.",
  },

  {
    category: "Power Query", topic: "Data Import", subject: "connecting Power Query to recurring data sources",
    ideal: "Use stable source paths or parameters, select only needed objects, preserve credentials safely, and design for refresh and schema change.",
    beginner: "Power Query records repeatable steps for importing and transforming source data.",
    advanced: "Discuss privacy levels, gateways, parameters, folder connectors, schema drift, incremental refresh dependencies, and lineage.",
    mistakes: ["Hard-coding a personal file path", "Importing every column", "Assuming source schemas never change"],
    followUps: ["How would you combine monthly files?", "What causes a gateway refresh failure?"],
    tip: "Mention refresh ownership and source stability; reliable automation starts before the first transformation.",
  },
  {
    category: "Power Query", topic: "Data Types", subject: "data types and locale handling in Power Query",
    ideal: "Assign types deliberately after structural cleanup, use locale-aware conversion, protect identifiers, and surface conversion errors.",
    beginner: "Data types tell Power Query whether a value is text, number, date, or another kind of data.",
    advanced: "Cover type metadata, culture, nullable types, precision, folding effects, and schema validation across refreshes.",
    mistakes: ["Letting automatic type detection change identifiers", "Parsing dates with the wrong locale", "Removing conversion errors without review"],
    followUps: ["Why keep postal codes as text?", "How do you convert dates using locale?"],
    tip: "Use a day/month ambiguity example; it demonstrates why locale is a correctness issue.",
  },
  {
    category: "Power Query", topic: "Cleaning", subject: "repeatable data cleaning in Power Query",
    ideal: "Profile the source, name steps clearly, standardize text and missing values, isolate exceptions, and keep transformations refresh-safe.",
    beginner: "Applied Steps turn manual cleaning decisions into a sequence Power Query can repeat.",
    advanced: "Discuss folding, error records, reusable functions, buffering trade-offs, metadata, and tests for schema drift.",
    mistakes: ["Deleting errors without understanding them", "Using positional column logic", "Creating many opaque auto-named steps"],
    followUps: ["How would you create an exception query?", "Why rename Applied Steps?"],
    tip: "Explain how questionable rows are retained for review instead of disappearing silently.",
  },
  {
    category: "Power Query", topic: "Merge & Append", subject: "merging and appending tables in Power Query",
    ideal: "Use Merge for key-based column joins and Append for row stacking, while validating keys, schemas, row counts, and unmatched records.",
    beginner: "Merge adds related columns; Append adds rows from similarly shaped tables.",
    advanced: "Cover join kinds, fuzzy matching risk, composite keys, nested tables, schema alignment, and folding.",
    mistakes: ["Appending mismatched columns without review", "Merging on non-unique keys", "Expanding every joined column"],
    followUps: ["How do you find unmatched rows?", "What happens when appended schemas differ?"],
    tip: "Always include a post-combine row-count or key check in your explanation.",
  },
  {
    category: "Power Query", topic: "M Language", subject: "writing maintainable Power Query M code",
    ideal: "Use descriptive step names, small reusable functions, parameters, explicit types, and comments where business rules are not obvious.",
    beginner: "M is the functional language behind Power Query's Applied Steps.",
    advanced: "Discuss lazy evaluation, records, lists, tables, higher-order functions, query folding boundaries, metadata, and error handling.",
    mistakes: ["Editing generated M without preserving step references", "Overusing Table.Buffer", "Building one enormous expression"],
    followUps: ["What does let…in do?", "When should you create a custom function?"],
    tip: "You do not need to memorize every M function; explain how you read and validate the step pipeline.",
  },

  {
    category: "Business Analytics", topic: "KPI Design", subject: "designing useful business KPIs",
    ideal: "Tie the KPI to an objective and owner, define formula and grain, set a target and cadence, document exclusions, and pair it with guardrails.",
    beginner: "A KPI is a defined measure used to track progress toward an important objective.",
    advanced: "Discuss leading versus lagging signals, controllability, gaming, denominator choice, cohort effects, and metric governance.",
    mistakes: ["Calling every metric a KPI", "Using a metric without an owner or target", "Optimizing a KPI while harming a guardrail"],
    followUps: ["What makes a KPI actionable?", "How do leading and lagging metrics differ?"],
    tip: "Give the complete definition, not just the metric name; revenue can mean bookings, billed revenue, or recognized revenue.",
  },
  {
    category: "Business Analytics", topic: "Requirements", subject: "translating stakeholder questions into analytical requirements",
    ideal: "Clarify the decision, audience, scope, grain, definitions, data constraints, success criteria, and delivery format before analysis.",
    beginner: "Requirements turn a broad request into a specific question the available data can answer.",
    advanced: "Cover assumption logs, metric contracts, stakeholder conflicts, change control, feasibility spikes, and acceptance tests.",
    mistakes: ["Starting analysis before agreeing on the decision", "Accepting vague terms such as active customer", "Ignoring delivery and refresh needs"],
    followUps: ["Which clarifying question do you ask first?", "How do you resolve conflicting definitions?"],
    tip: "Lead with 'What decision will this analysis support?'—it is often the highest-value clarification.",
  },
  {
    category: "Business Analytics", topic: "Root Cause Analysis", subject: "root-cause analysis for a changing business metric",
    ideal: "Confirm the metric change, segment it systematically, form hypotheses, test competing explanations, and distinguish drivers from correlations.",
    beginner: "Root-cause analysis narrows a symptom into evidence-backed reasons that can be acted on.",
    advanced: "Discuss decomposition, counterfactual thinking, instrumentation changes, causal diagrams, survivorship, and confounding.",
    mistakes: ["Choosing the first plausible story", "Ignoring definition or pipeline changes", "Stopping at correlation"],
    followUps: ["Which segment would you inspect first?", "How would you rule out a tracking issue?"],
    tip: "State how you would falsify your favorite hypothesis; it signals disciplined analysis.",
  },
  {
    category: "Business Analytics", topic: "Cohort Analysis", subject: "cohort and retention analysis",
    ideal: "Define cohort entry and retention events, align time periods, handle incomplete cohorts, segment intentionally, and compare curves rather than raw counts.",
    beginner: "Cohort analysis follows groups that started at similar times to compare how behavior changes after entry.",
    advanced: "Discuss censoring, reactivation, competing events, seasonality, acquisition mix, survival methods, and causal limits.",
    mistakes: ["Comparing incomplete recent cohorts directly", "Changing the retention definition mid-analysis", "Mixing calendar and lifecycle time"],
    followUps: ["How do you handle the newest cohort?", "What is logo versus revenue retention?"],
    tip: "Define day zero and the return event explicitly before discussing the chart.",
  },
  {
    category: "Business Analytics", topic: "Storytelling", subject: "communicating an analytical recommendation",
    ideal: "Lead with the decision and headline, show only decision-relevant evidence, quantify impact and uncertainty, and end with action, owner, and next check.",
    beginner: "Analytical storytelling connects evidence to a decision instead of presenting charts without a clear point.",
    advanced: "Discuss audience priors, alternative explanations, uncertainty framing, progressive disclosure, pre-reads, and decision logs.",
    mistakes: ["Walking through every analysis step chronologically", "Hiding uncertainty", "Ending without a recommendation"],
    followUps: ["How would you adapt this for executives?", "What belongs in an appendix?"],
    tip: "Practice a one-sentence headline with a number, reason, and action.",
  },

  {
    category: "HR Interview", topic: "Tell Me About Yourself", subject: "answering “Tell me about yourself” for a data role",
    ideal: "Use a present-past-future structure: current analytical focus, two relevant proof points, and why this role is the logical next step.",
    beginner: "This answer is a focused professional introduction, not a complete life story.",
    advanced: "Tailor the narrative to the job's highest-value problem, quantify evidence, and create a natural bridge to likely technical follow-ups.",
    mistakes: ["Reciting the entire resume", "Sharing unrelated personal history", "Ending without connecting to the role"],
    followUps: ["Why are you interested in this role?", "Which project best represents your strengths?"],
    tip: "Keep the core answer near 60–90 seconds and rehearse ideas, not a robotic script.",
  },
  {
    category: "HR Interview", topic: "Strengths", subject: "discussing professional strengths in an interview",
    ideal: "Choose a role-relevant strength, prove it with a concise example and outcome, and explain how it benefits the team.",
    beginner: "A credible strength is specific and supported by evidence.",
    advanced: "Select a strength that differentiates you, show calibration, and explain the operating habits that make it repeatable.",
    mistakes: ["Listing adjectives without evidence", "Choosing a strength irrelevant to the role", "Claiming perfection"],
    followUps: ["How has this strength helped a teammate?", "When can this strength become a limitation?"],
    tip: "Use one strength deeply rather than three generic strengths quickly.",
  },
  {
    category: "HR Interview", topic: "Weaknesses", subject: "answering the interview weakness question honestly",
    ideal: "Name a real but manageable weakness, show self-awareness, describe the system used to improve it, and provide evidence of progress.",
    beginner: "The interviewer is assessing honesty, learning, and risk management—not demanding perfection.",
    advanced: "Choose a weakness that is genuine without undermining a core requirement, and demonstrate an observable feedback loop.",
    mistakes: ["Using a disguised strength", "Naming a fatal job requirement", "Giving no improvement plan"],
    followUps: ["What feedback led you to notice it?", "How do you measure improvement?"],
    tip: "Avoid clichés like 'I work too hard'; thoughtful self-correction is more convincing.",
  },
  {
    category: "HR Interview", topic: "Conflict", subject: "describing a workplace conflict",
    ideal: "Use STAR, explain both perspectives fairly, show direct respectful communication, and focus on the shared objective and resolution.",
    beginner: "A conflict answer should demonstrate maturity and problem-solving rather than blame.",
    advanced: "Show how you separated interests from positions, used evidence, repaired trust, and changed a process to prevent recurrence.",
    mistakes: ["Making the other person the villain", "Claiming never to face conflict", "Skipping the result or lesson"],
    followUps: ["What would the other person say?", "What would you do differently now?"],
    tip: "Choose a professional disagreement with a constructive outcome, not a personal grievance.",
  },
  {
    category: "HR Interview", topic: "Teamwork", subject: "demonstrating teamwork on an analytical project",
    ideal: "Clarify your role, how information and decisions were shared, how you supported others, and the team outcome.",
    beginner: "Teamwork evidence shows how you contributed with others, not only what you completed alone.",
    advanced: "Discuss interfaces between roles, decision rights, feedback, psychological safety, and how you reduced coordination cost.",
    mistakes: ["Saying 'we' without explaining your contribution", "Taking all credit", "Ignoring communication challenges"],
    followUps: ["How did you handle a teammate falling behind?", "What did you learn from another function?"],
    tip: "Balance 'I' for your contribution with 'we' for the shared outcome.",
  },
  {
    category: "HR Interview", topic: "Leadership", subject: "showing leadership without formal authority",
    ideal: "Describe how you created clarity, influenced people, removed an obstacle, and helped the group deliver a measurable result.",
    beginner: "Leadership can mean taking responsibility and helping others move toward a shared goal without being their manager.",
    advanced: "Explain stakeholder mapping, incentives, delegation, decision mechanisms, and how you built capability beyond the immediate task.",
    mistakes: ["Equating leadership only with title", "Doing all the work yourself", "Ignoring resistance"],
    followUps: ["How did you gain buy-in?", "What did you delegate?"],
    tip: "A small initiative with clear influence can be stronger than a vague claim about leading a large group.",
  },
  {
    category: "HR Interview", topic: "Projects", subject: "presenting a project in an HR interview",
    ideal: "Explain the problem, your ownership, key choices, collaboration, measurable result, and one lesson relevant to the target role.",
    beginner: "A project answer proves how you turn skills into an outcome.",
    advanced: "Frame trade-offs, rejected alternatives, uncertainty, adoption, and what happened after delivery.",
    mistakes: ["Spending all the time on tools", "Omitting personal ownership", "Giving no result"],
    followUps: ["What was the hardest decision?", "What would you improve with more time?"],
    tip: "Prepare a two-minute version and a deeper technical version of the same project.",
  },
  {
    category: "HR Interview", topic: "Internship", subject: "discussing an internship or early-career experience",
    ideal: "Describe the context, learning curve, contribution, feedback received, and a result or process improvement you can defend.",
    beginner: "Interviewers know internships are learning experiences; they want evidence of initiative and growth.",
    advanced: "Show how you created leverage despite limited authority, handled ambiguity, and transferred learning into later work.",
    mistakes: ["Dismissing the work as minor", "Claiming ownership beyond reality", "Focusing only on what you observed"],
    followUps: ["What did you learn fastest?", "How did you ask for feedback?"],
    tip: "Small contributions become credible when you quantify time saved, errors reduced, or decisions improved.",
  },
  {
    category: "HR Interview", topic: "Career Goals", subject: "explaining career goals for a data analyst role",
    ideal: "Connect a realistic near-term skill and responsibility goal to the role, then describe a flexible longer-term direction.",
    beginner: "Career goals should show motivation and fit without pretending to know every future job title.",
    advanced: "Balance ambition with contribution, show a deliberate learning path, and connect growth to increasing business impact.",
    mistakes: ["Naming a role unrelated to the opportunity", "Sounding entitled to rapid promotion", "Giving no learning plan"],
    followUps: ["Which skill are you developing now?", "How does this company fit that path?"],
    tip: "Describe the problems you want to become capable of solving, not only the title you want.",
  },
  {
    category: "HR Interview", topic: "Salary", subject: "handling salary expectations professionally",
    ideal: "Express interest in the role, reference researched market and scope, give a reasonable range when required, and consider the total package.",
    beginner: "A salary answer should be informed, calm, and flexible without undervaluing your work.",
    advanced: "Discuss role level, geography, variable pay, benefits, competing constraints, and how to defer until scope is clear.",
    mistakes: ["Giving an unresearched number", "Apologizing for expectations", "Ignoring total compensation"],
    followUps: ["What if the range is below your expectation?", "How did you research the market?"],
    tip: "Prepare a target, an acceptable range, and a walk-away point privately before the interview.",
  },
  {
    category: "HR Interview", topic: "Behavioural Questions", subject: "answering behavioural interview questions with STAR",
    ideal: "Set concise context, state your responsibility, spend most time on specific actions, quantify the result, and finish with learning.",
    beginner: "STAR stands for Situation, Task, Action, and Result and keeps examples structured.",
    advanced: "Choose evidence matched to the competency, surface decisions and trade-offs, and prepare follow-up depth without overloading the first answer.",
    mistakes: ["Spending too long on the situation", "Describing team actions without your own", "Inventing a perfect result"],
    followUps: ["What did you personally decide?", "What would you change next time?"],
    tip: "Build a story bank of six adaptable examples rather than memorizing a different script for every possible question.",
  },

  {
    category: "Data Analyst Projects", topic: "Project Scoping", subject: "scoping a data analyst portfolio project",
    ideal: "Define the user, decision, measurable objective, available data, constraints, deliverables, and a finish line before choosing tools.",
    beginner: "A well-scoped project answers a specific useful question with available time and data.",
    advanced: "Discuss stakeholder maps, risk registers, feasibility spikes, metric contracts, milestones, and deliberate exclusions.",
    mistakes: ["Starting with a tool instead of a problem", "Choosing a scope too broad to finish", "Leaving success undefined"],
    followUps: ["What would you exclude from V1?", "How would you define success?"],
    tip: "A small finished project with a clear decision is stronger than an unfinished platform.",
  },
  {
    category: "Data Analyst Projects", topic: "Data Quality", subject: "handling data quality in an analyst project",
    ideal: "Profile completeness, validity, uniqueness, consistency, and timeliness; document rules; preserve exceptions; and communicate limitations.",
    beginner: "Data quality checks whether the data is fit for the question being answered.",
    advanced: "Cover contracts, observability, lineage, reconciliation, anomaly thresholds, ownership, and how quality affects decision risk.",
    mistakes: ["Cleaning silently", "Treating every missing value the same", "Reporting results without limitations"],
    followUps: ["Which quality dimension matters most here?", "How would you monitor quality after delivery?"],
    tip: "Include a data-quality section in the README; it gives interviewers evidence of professional judgment.",
  },
  {
    category: "Data Analyst Projects", topic: "Exploratory Analysis", subject: "exploratory data analysis in a portfolio project",
    ideal: "Begin with structure and quality, inspect distributions and relationships, form and test hypotheses, and distinguish discoveries from decisions.",
    beginner: "EDA helps you understand the data and find questions worth investigating before formal conclusions.",
    advanced: "Discuss selection bias, multiple comparisons, transformations, segment stability, leakage, and reproducible notebooks.",
    mistakes: ["Creating charts without questions", "Treating every correlation as insight", "Failing to record hypotheses"],
    followUps: ["How do you avoid cherry-picking?", "Which plot would you start with?"],
    tip: "Organize the notebook around questions and conclusions, not a gallery of every chart you tried.",
  },
  {
    category: "Data Analyst Projects", topic: "Validation", subject: "validating project metrics and analytical outputs",
    ideal: "Reconcile totals, test edge cases, compare with an independent calculation, review assumptions, and obtain stakeholder or peer validation.",
    beginner: "Validation checks that the result is complete, logically consistent, and suitable for use.",
    advanced: "Discuss golden datasets, invariants, back-testing, sensitivity analysis, peer review, and monitoring after deployment.",
    mistakes: ["Checking only that code runs", "Using the same logic for calculation and validation", "Ignoring surprising but plausible results"],
    followUps: ["What independent check could you use?", "How would you validate a dashboard total?"],
    tip: "Interviewers trust a result more when you volunteer how you tried to prove it wrong.",
  },
  {
    category: "Data Analyst Projects", topic: "Delivery", subject: "delivering and presenting a data analyst project",
    ideal: "Package the decision, method, result, limitations, reproducible assets, and next action for the intended audience.",
    beginner: "Delivery turns analysis into something another person can understand, verify, and use.",
    advanced: "Cover adoption, documentation layers, access, refresh ownership, versioning, monitoring, and feedback loops.",
    mistakes: ["Sharing only a notebook", "Leading with technical detail", "Omitting limitations and maintenance"],
    followUps: ["How would you measure adoption?", "What belongs in the README?"],
    tip: "Demo the decision path in under two minutes before offering technical depth.",
  },

  {
    category: "Resume & Portfolio", topic: "ATS Resume", subject: "building an ATS-friendly data analyst resume",
    ideal: "Use standard headings, role-relevant keywords naturally, simple formatting, specific skills, and quantified accomplishment bullets.",
    beginner: "An ATS-friendly resume is easy for software and people to parse and connects evidence to the job description.",
    advanced: "Discuss keyword relevance, semantic variation, parsing tests, role-specific versions, evidence density, and avoiding keyword stuffing.",
    mistakes: ["Using complex columns or graphics", "Listing tools without evidence", "Copying every job-description keyword"],
    followUps: ["How would you test ATS readability?", "Which keywords deserve priority?"],
    tip: "Paste the resume into plain text and confirm the reading order still makes sense.",
  },
  {
    category: "Resume & Portfolio", topic: "Portfolio", subject: "designing a focused data analyst portfolio",
    ideal: "Show a small set of complete projects with clear problems, decisions, methods, results, limitations, and easy navigation.",
    beginner: "A portfolio demonstrates how you apply skills, not just which tools you have studied.",
    advanced: "Discuss audience segmentation, case-study structure, evidence of adoption, accessibility, performance, and versioned artifacts.",
    mistakes: ["Including every tutorial", "Showing dashboards without context", "Leaving broken links or inaccessible files"],
    followUps: ["Which three projects would you feature?", "How would you show business impact?"],
    tip: "Lead each project with the problem and result before screenshots or code.",
  },
  {
    category: "Resume & Portfolio", topic: "GitHub", subject: "presenting analytics work professionally on GitHub",
    ideal: "Use a clear README, reproducible setup, organized folders, meaningful commits, sample or documented data, and no secrets.",
    beginner: "GitHub lets interviewers inspect how a project is organized, explained, and reproduced.",
    advanced: "Discuss dependency locking, CI checks, data licensing, release artifacts, issue history, branching, and secret scanning.",
    mistakes: ["Committing credentials", "Uploading unexplained notebooks", "Using one giant final commit"],
    followUps: ["What should a project README contain?", "How do you handle private data?"],
    tip: "Open every repository as if you were the interviewer and verify the first screen answers what, why, and how.",
  },
  {
    category: "Resume & Portfolio", topic: "LinkedIn", subject: "optimizing a LinkedIn profile for data analyst roles",
    ideal: "Use a searchable headline, outcome-focused About section, evidence-rich experience, relevant skills, and featured project links.",
    beginner: "LinkedIn should quickly communicate the role you target, the problems you solve, and proof of your work.",
    advanced: "Discuss recruiter search behavior, keyword consistency, social proof, content strategy, privacy, and measurable networking routines.",
    mistakes: ["Using only 'Open to Work' as a headline", "Copying the resume word for word", "Leaving featured work empty"],
    followUps: ["Which keywords belong in the headline?", "What would you feature first?"],
    tip: "Make the headline specific enough that a recruiter can match you to a role without opening the profile.",
  },
  {
    category: "Resume & Portfolio", topic: "Project Storytelling", subject: "turning an analytics project into an interview story",
    ideal: "Frame the user and decision, explain your contribution and key trade-off, quantify the result, and prepare technical follow-up depth.",
    beginner: "A project story connects what you built to why it mattered and what you personally learned.",
    advanced: "Discuss rejected alternatives, uncertainty, stakeholder adoption, post-launch evidence, and how the artifact demonstrates senior behaviors.",
    mistakes: ["Listing tools in sequence", "Claiming team work as entirely personal", "Giving no limitation or lesson"],
    followUps: ["What was your hardest trade-off?", "How would you redesign the project now?"],
    tip: "Prepare a 30-second headline, a two-minute story, and a ten-minute technical deep dive for each featured project.",
  },
];

function slug(value: string) {
  return value
    .toLocaleLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export const interviewQuestions: InterviewQuestion[] = blueprints.flatMap(
  (blueprint) =>
    variants.map((variant, index) => ({
      id: `${slug(blueprint.category)}-${slug(blueprint.topic)}-${index + 1}`,
      category: blueprint.category,
      topic: blueprint.topic,
      difficulty: variant.difficulty,
      question: variant.question(blueprint.subject),
      idealAnswer: `${blueprint.ideal} ${variant.idealFocus}`,
      beginnerExplanation: `${blueprint.beginner} First explain the goal, then give one small example and a way to check the result.`,
      advancedExplanation: `${blueprint.advanced} ${variant.advancedFocus}`,
      commonMistakes: blueprint.mistakes,
      followUpQuestions: [...blueprint.followUps, variant.followUp],
      realInterviewTip: blueprint.tip,
      xpReward:
        variant.difficulty === "Advanced"
          ? 20
          : variant.difficulty === "Intermediate"
            ? 15
            : 10,
    })),
);

export const interviewTopics = Array.from(
  new Set(interviewQuestions.map((question) => question.topic)),
).sort();

export function getInterviewQuestion(id: string) {
  return interviewQuestions.find((question) => question.id === id);
}

export const resumeReviewSections = [
  {
    id: "ats",
    title: "ATS checklist",
    icon: "📄",
    items: [
      "Use standard section headings and a single-column reading order",
      "Match role-relevant keywords naturally to demonstrated experience",
      "Keep contact details as selectable text, not inside an image",
      "Test the resume by copying it into plain text",
      "Save a clean PDF with a professional filename",
    ],
  },
  {
    id: "portfolio",
    title: "Portfolio checklist",
    icon: "🗂️",
    items: [
      "Feature three to five complete projects instead of every exercise",
      "Lead each case study with the problem, audience, and result",
      "Explain methodology, limitations, and validation",
      "Verify every project link on desktop and mobile",
      "Provide a clear contact path and concise professional introduction",
    ],
  },
  {
    id: "github",
    title: "GitHub checklist",
    icon: "💻",
    items: [
      "Add a README with purpose, setup, method, results, and screenshots",
      "Remove secrets, private data, and machine-specific paths",
      "Organize code, notebooks, data samples, and outputs clearly",
      "Pin the strongest repositories to the profile",
      "Use meaningful commits and lock or document dependencies",
    ],
  },
  {
    id: "linkedin",
    title: "LinkedIn checklist",
    icon: "🔗",
    items: [
      "Write a searchable role-focused headline",
      "Use the About section to connect strengths, evidence, and goals",
      "Quantify outcomes in experience descriptions",
      "Add portfolio, dashboard, and GitHub work to Featured",
      "Align skills and keywords with target data roles",
    ],
  },
  {
    id: "projects",
    title: "Project checklist",
    icon: "📊",
    items: [
      "State the decision or business question before the tools",
      "Document source, grain, quality checks, and assumptions",
      "Show at least one important analytical trade-off",
      "Validate metrics with an independent check",
      "Prepare a two-minute story and technical follow-up answers",
    ],
  },
] as const;

export const resumeChecklistItems = resumeReviewSections.flatMap((section) =>
  section.items.map((label, index) => ({
    id: `${section.id}-${index + 1}`,
    sectionId: section.id,
    label,
  })),
);
