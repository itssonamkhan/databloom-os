export type PowerBIDifficulty = "Beginner" | "Intermediate" | "Advanced";

export type PowerBILesson = {
  id: string; title: string; icon: string; category: string;
  difficulty: PowerBIDifficulty; description: string; explanation: string;
  steps: string[]; example: string; memoryTrick: string; whenToUse: string[];
  commonMistakes: string[]; interviewQuestions: string[]; practiceTask: string;
  acceptedAnswers: string[]; hint: string; xpReward: number; relatedLessons: string[];
};

type Seed = Pick<PowerBILesson, "id" | "title" | "icon" | "category" | "difficulty" | "description"> & Partial<PowerBILesson>;

function lesson(seed: Seed): PowerBILesson {
  const title = seed.title;
  return {
    ...seed,
    explanation: seed.explanation ?? `${title} is a practical Power BI skill that helps you turn raw business data into a trustworthy, easy-to-read report.`,
    steps: seed.steps ?? [`Open the relevant view in Power BI Desktop.`, `Select the table, field, or visual you want to work with.`, `Apply ${title.toLowerCase()} and review the result.`, "Check that totals, labels, and filters still answer the business question."],
    example: seed.example ?? `A sales analyst uses ${title.toLowerCase()} while preparing a monthly revenue dashboard for regional managers.`,
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
