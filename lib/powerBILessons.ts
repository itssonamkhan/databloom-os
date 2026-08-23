export type PowerBIDifficulty = "Beginner" | "Intermediate" | "Advanced";

export type PowerBILesson = {
  id: string; title: string; icon: string; category: string;
  difficulty: PowerBIDifficulty; description: string; explanation: string;
  steps: string[]; example: string; memoryTrick: string; whenToUse: string[];
  commonMistakes: string[]; interviewQuestions: string[]; practiceTask: string;
  acceptedAnswers: string[]; hint: string; xpReward: number; relatedLessons: string[];
};

type Seed = Pick<PowerBILesson, "id" | "title" | "icon" | "category" | "difficulty" | "description"> & Partial<PowerBILesson>;

const powerBIContent: Record<string, { example: string; explanation: string }> = {
  "power-bi-interface": { example: "Report view contains the canvas, Fields lists model columns, and Filters narrows the current visual or page.", explanation: "Each Power BI area has a different job: the canvas builds visuals, the model stores relationships, and filters control the analysis scope." },
  "import-excel-csv": { example: "Home → Get data → Excel → Sales.xlsx → select the Orders sheet → Load.", explanation: "Choosing the correct connector and sheet preserves the source structure so the report can refresh from the intended file." },
  "data-types": { example: "Set OrderDate to Date, Quantity to Whole number, and Revenue to Decimal number before building visuals.", explanation: "Correct types control sorting, arithmetic, date hierarchies, and aggregation; a numeric-looking text field cannot be summed reliably." },
  "power-query-overview": { example: "Applied Steps: Source → Promoted Headers → Removed Errors → Changed Type.", explanation: "Power Query records preparation as repeatable steps, so the same cleanup runs again when the source refreshes." },
  "loading-data": { example: "After previewing the query, choose Close & Apply to load the cleaned Orders table into the model.", explanation: "Close & Apply commits query changes and makes the prepared table available to relationships, measures, and visuals." },
  "remove-duplicates": { example: "On Orders, select OrderID and choose Remove duplicates so each genuine order remains once.", explanation: "Deduplicating on the business key prevents repeated records from inflating revenue, counts, and other measures." },
  "handle-null-values": { example: "Profile a blank Revenue value, then document whether it should remain unknown, be replaced, or be excluded.", explanation: "Nulls carry meaning; inspecting their cause before replacement avoids hiding missing or invalid source data." },
  "split-columns": { example: "Split CustomerName = 'Aisha Khan' by the space delimiter into FirstName = 'Aisha' and LastName = 'Khan'.", explanation: "Splitting a combined field creates usable dimensions for grouping, filtering, and labels." },
  "merge-columns": { example: "Merge FirstName and LastName with a space to create DisplayName = 'Aisha Khan'.", explanation: "Merging selected fields creates a readable display value while retaining the original columns for analysis." },
  "replace-values": { example: "Replace the imported Region value 'N/A' with null, then review the affected records.", explanation: "Replacing a known placeholder with a consistent value makes the data-quality rule explicit instead of treating a code as a real region." },
  "change-data-types": { example: "Change Revenue from Text to Decimal number and OrderDate from Text to Date in Power Query.", explanation: "Explicit conversion makes calculations and time analysis predictable across refreshes and locales." },
  "conditional-columns": { example: "Add Margin Band: if Margin >= 0.30 then 'High' else if Margin >= 0.15 then 'Medium' else 'Low'.", explanation: "A conditional column turns a business rule into a repeatable label that can be filtered and grouped." },
  "append-queries": { example: "Append JanuarySales and FebruarySales, which share OrderID, Region, and Revenue columns, into one Sales table.", explanation: "Append stacks compatible rows vertically; it is appropriate when each query represents another slice of the same entity." },
  "merge-queries": { example: "Merge Orders with Customers on CustomerID using a Left outer join to bring Segment into every order where a match exists.", explanation: "Merge combines columns by a key, preserving the selected left-table rows while adding matching attributes." },
  "tables-relationships": { example: "Customers[CustomerID] (1) → Orders[CustomerID] (*) lets one customer filter many orders.", explanation: "A relationship defines how filters travel between tables, so measures use the intended business grain instead of disconnected columns." },
  "one-to-many": { example: "DimProduct[ProductID] is unique on the one side; FactSales[ProductID] repeats on the many side for each sale.", explanation: "One-to-many cardinality models a reusable description filtering multiple event rows." },
  "star-schema": { example: "FactSales sits in the center, related to DimDate, DimProduct, and DimCustomer around it.", explanation: "Separating measurable events from descriptive dimensions creates clear filter paths and more reliable measures." },
  "fact-dimension": { example: "FactSales stores Quantity and Amount per order; DimProduct stores ProductName, Category, and Brand.", explanation: "Facts record events and measures, while dimensions provide the descriptive context used to slice those events." },
  "date-table": { example: "Create a calendar from 2026-01-01 through 2026-12-31 with Date, Year, MonthNumber, and MonthName columns.", explanation: "A continuous date table gives every report visual the same calendar grain for filtering, sorting, and time intelligence." },
  "active-inactive-relationships": { example: "Keep OrderDate active for default sales reporting and ShipDate inactive for an alternate delivery-date measure.", explanation: "Active and inactive paths let one model support different date perspectives without ambiguous simultaneous filtering." },
  cardinality: { example: "CustomerID appears once in Customers but many times in Orders, so the relationship is one-to-many.", explanation: "Cardinality describes uniqueness on each side and helps identify duplicate keys or an incorrect model grain." },
  "filter-direction": { example: "Set DimProduct → FactSales as the single filter direction so choosing a category filters sales rows.", explanation: "A deliberate filter direction reduces ambiguous paths and keeps dimension-driven analysis predictable." },
  "bar-chart": { example: "Use a bar chart to compare regional revenue: North 1250, West 980, South 675.", explanation: "Bars share a baseline, making category magnitude comparisons easy to read." },
  "line-chart": { example: "Plot monthly revenue from January 1000, February 1200, and March 1450 on a continuous date axis.", explanation: "A line connects ordered time points so trend direction and changes are visible." },
  "pie-donut-chart": { example: "A donut shows product mix: Software 50%, Services 30%, Training 20%.", explanation: "Part-to-whole visuals work best for a small number of categories whose shares sum to a meaningful total." },
  "table-matrix": { example: "A matrix places Region on rows, Category beneath it, and Revenue as the value with expandable subtotals.", explanation: "Tables show detail, while matrices add grouped hierarchy and drillable summaries." },
  "kpi-card": { example: "A KPI card displays Current Revenue = 125000 against Target = 120000 with a positive status.", explanation: "A KPI card focuses attention on one headline measure and its comparison target." },
  slicer: { example: "Add a Region slicer with North, West, South, and East choices to filter the report page.", explanation: "A slicer exposes a visible filter control so viewers can change the analysis scope themselves." },
  map: { example: "Plot State by Sales and use bubble size for revenue to compare geographic performance.", explanation: "Maps add spatial meaning when location is reliable and geography is central to the decision." },
  "combo-chart": { example: "Show monthly Revenue as columns and Profit Margin as a line across the same month axis.", explanation: "A combo chart compares measures with different visual roles while preserving their shared category axis." },
  "drill-through": { example: "Right-click the West region summary and drill through to a detail page filtered to West orders.", explanation: "Drill-through carries the selected context to a focused detail view without crowding the summary page." },
  tooltips: { example: "Hovering over a Revenue bar reveals Order Count, Margin %, and Last Refresh in a tooltip.", explanation: "Tooltips provide supporting detail on demand, keeping the primary visual readable." },
  layout: { example: "Place headline KPIs across the top, the main trend below, and supporting detail in a consistent grid.", explanation: "Layout creates a reading path from summary to evidence instead of making viewers search the canvas." },
  "color-hierarchy": { example: "Use one accent for the selected KPI, neutral colors for context, and red only for an actual warning.", explanation: "Intentional color hierarchy directs attention and gives status colors a consistent meaning." },
  "choosing-right-chart": { example: "Use bars for category comparison, a line for monthly trend, and a scatter plot for Revenue versus Discount.", explanation: "The chart should match the analytical question: comparison, trend, composition, or relationship." },
  "kpi-placement": { example: "Place Revenue, Margin %, and Orders in the first row where the viewer starts reading.", explanation: "Putting headline metrics first answers the primary question before supporting detail." },
  "visual-consistency": { example: "Apply the same 12pt title style, currency format, padding, and legend treatment across report pages.", explanation: "Consistent visual rules reduce cognitive load and make differences in the data—not the formatting—stand out." },
  "mobile-layout": { example: "On a phone canvas, keep three KPI cards, one trend chart, and a single Region slicer in a vertical order.", explanation: "A focused mobile layout prioritizes the decisions that fit a narrow screen instead of shrinking every desktop visual." },
  "dashboard-storytelling": { example: "Lead with Revenue and Margin, show the regional trend, then end with the category detail that explains the variance.", explanation: "A dashboard story connects context, evidence, and action so the viewer knows what to investigate next." },
};

function lesson(seed: Seed): PowerBILesson {
  const title = seed.title;
  return {
    ...seed,
    steps: seed.steps ?? [`Open the relevant view in Power BI Desktop.`, `Select the table, field, or visual you want to work with.`, `Apply ${title.toLowerCase()} and review the result.`, "Check that totals, labels, and filters still answer the business question."],
    example: seed.example ?? powerBIContent[seed.id]?.example ?? `A sales analyst uses ${title.toLowerCase()} while preparing a monthly revenue dashboard for regional managers.`,
    explanation: seed.explanation ?? powerBIContent[seed.id]?.explanation ?? `${title} is a practical Power BI skill that helps you turn raw business data into a trustworthy, easy-to-read report.`,
    memoryTrick: seed.memoryTrick ?? `${title}: make one intentional change, then verify the result.`,
    whenToUse: seed.whenToUse ?? ["When building a repeatable business report.", "When the report needs to stay clear and trustworthy as data refreshes."],
    commonMistakes: seed.commonMistakes ?? ["Changing the report without checking totals afterward.", "Choosing a setting because it looks good rather than because it answers the question."],
    interviewQuestions: seed.interviewQuestions ?? [`What problem does ${title} solve in Power BI?`, `How would you validate ${title.toLowerCase()} in a real report?`],
    practiceTask: seed.practiceTask ?? `Choose the best reason to use ${title.toLowerCase()} in a sales dashboard.`,
    acceptedAnswers: seed.acceptedAnswers ?? ["To make the report accurate and useful for the business question"],
    hint: seed.hint ?? "Focus on accuracy, clarity, and the decision the report supports.",
    xpReward: seed.xpReward ?? (seed.difficulty === "Beginner" ? 20 : seed.difficulty === "Intermediate" ? 30 : 40),
    relatedLessons: seed.relatedLessons ?? [],
  };
}

const seeds = ([
  ["power-bi-interface","Power BI interface","🧭","Getting Started","Beginner","Understand Report, Data, Model, Filters, Visualizations, and Fields areas."],
  ["import-excel-csv","Importing Excel and CSV","📥","Getting Started","Beginner","Connect spreadsheet and text files to a report."],
  ["data-types","Data types","🔤","Getting Started","Beginner","Set text, number, date, and currency types correctly."],
  ["power-query-overview","Power Query overview","🧹","Getting Started","Beginner","Use a repeatable sequence of data preparation steps."],
  ["loading-data","Loading data","📦","Getting Started","Beginner","Apply query changes and load clean tables into the model."],
  ["remove-duplicates","Remove duplicates","🪄","Data Cleaning","Beginner","Keep one row for each genuine business record."],
  ["handle-null-values","Handle null values","🕳️","Data Cleaning","Beginner","Find and treat missing values without hiding data quality issues."],
  ["split-columns","Split columns","✂️","Data Cleaning","Beginner","Separate combined values using a delimiter or position."],
  ["merge-columns","Merge columns","🔗","Data Cleaning","Beginner","Combine fields into one readable value."],
  ["replace-values","Replace values","🔁","Data Cleaning","Beginner","Standardize inconsistent labels and codes."],
  ["change-data-types","Change data types","🔢","Data Cleaning","Beginner","Correct field types in Power Query before modelling."],
  ["conditional-columns","Conditional columns","🚦","Data Cleaning","Intermediate","Create rule-based labels without writing complex code."],
  ["append-queries","Append queries","➕","Data Cleaning","Intermediate","Stack tables that share the same columns."],
  ["merge-queries","Merge queries","🤝","Data Cleaning","Intermediate","Join matching rows from two queries."],
  ["tables-relationships","Tables and relationships","🕸️","Data Modelling","Beginner","Connect tables so filters and calculations work together."],
  ["one-to-many","One-to-many relationships","1️⃣","Data Modelling","Intermediate","Connect one unique dimension value to many fact rows."],
  ["star-schema","Star schema","⭐","Data Modelling","Intermediate","Arrange a central fact table around descriptive dimensions."],
  ["fact-dimension","Fact and dimension tables","🏗️","Data Modelling","Intermediate","Separate measurable events from descriptive context."],
  ["date-table","Date table","📅","Data Modelling","Intermediate","Create a continuous calendar for reliable time analysis."],
  ["active-inactive-relationships","Active and inactive relationships","🔌","Data Modelling","Advanced","Manage alternate paths such as order date and ship date."],
  ["cardinality","Cardinality","🔣","Data Modelling","Intermediate","Describe whether relationship values are unique or repeated."],
  ["filter-direction","Filter direction","➡️","Data Modelling","Advanced","Control how filters travel between model tables."],
  ["bar-chart","Bar chart","📊","Visuals","Beginner","Compare values across categories with a common baseline."],
  ["line-chart","Line chart","📈","Visuals","Beginner","Show trends and changes over time."],
  ["pie-donut-chart","Pie and donut chart","🍩","Visuals","Beginner","Show a small number of parts of a whole."],
  ["table-matrix","Table and matrix","▦","Visuals","Beginner","Display detailed values or grouped, expandable summaries."],
  ["kpi-card","KPI card","🎯","Visuals","Beginner","Highlight one important number or status."],
  ["slicer","Slicer","🎚️","Visuals","Beginner","Give report viewers a visible way to filter the page."],
  ["map","Map","🗺️","Visuals","Intermediate","Reveal meaningful geographic patterns."],
  ["combo-chart","Combo chart","📉","Visuals","Intermediate","Compare columns and a line across one shared category."],
  ["drill-through","Drill-through","🔎","Visuals","Intermediate","Navigate from a summary item to a filtered detail page."],
  ["tooltips","Tooltips","💬","Visuals","Intermediate","Add context on hover without crowding a visual."],
  ["layout","Layout","🧩","Dashboard Design","Beginner","Arrange content in a natural reading order."],
  ["color-hierarchy","Color hierarchy","🎨","Dashboard Design","Intermediate","Use color to guide attention and communicate meaning."],
  ["choosing-right-chart","Choosing the right chart","🤔","Dashboard Design","Intermediate","Match the visual to comparison, trend, composition, or relationship."],
  ["kpi-placement","KPI placement","📍","Dashboard Design","Beginner","Put headline metrics where viewers see them first."],
  ["visual-consistency","Visual consistency","🧵","Dashboard Design","Beginner","Keep spacing, typography, colors, and formats predictable."],
  ["mobile-layout","Mobile layout","📱","Dashboard Design","Intermediate","Create a focused portrait experience for phone users."],
  ["dashboard-storytelling","Dashboard storytelling","📖","Dashboard Design","Advanced","Lead viewers from context to insight to action."],
] as const).map(([id,title,icon,category,difficulty,description]) => lesson({ id, title, icon, category, difficulty, description }));

export const powerBILessons = seeds.map((item, index, all) => ({ ...item, relatedLessons: item.relatedLessons.length ? item.relatedLessons : [all[(index + 1) % all.length].id] }));
export const powerBICategories = Array.from(new Set(powerBILessons.map((item) => item.category)));
export const powerBIDifficulties: PowerBIDifficulty[] = ["Beginner", "Intermediate", "Advanced"];
export const getPowerBILesson = (id: string) => powerBILessons.find((item) => item.id === id);
