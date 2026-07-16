export type FlashcardDifficulty = "Beginner" | "Intermediate" | "Advanced";

export type FlashcardDeck = {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  difficulty: FlashcardDifficulty;
  custom: boolean;
  createdAt: string;
  updatedAt: string;
};

export type FlashcardDefinition = {
  id: string;
  deckId: string;
  front: string;
  back: string;
  difficulty: FlashcardDifficulty;
  category: string;
  audio: {
    text: string;
    language: "en";
    ready: true;
  };
  createdAt: string;
  updatedAt: string;
};

const seedDate = "2026-01-01T00:00:00.000Z";

const deckSeeds = [
  ["excel", "Excel", "📗", "Formulas, lookups, references, and analysis essentials.", "Beginner"],
  ["sql", "SQL", "🗄️", "Query patterns for filtering, joining, grouping, and analysis.", "Intermediate"],
  ["python", "Python", "🐍", "Core Python and pandas concepts for analysts.", "Beginner"],
  ["statistics", "Statistics", "📐", "Probability, inference, distributions, and experiments.", "Intermediate"],
  ["power-bi", "Power BI", "📊", "Data models, DAX, visuals, and report design.", "Intermediate"],
  ["tableau", "Tableau", "🎨", "Visual analytics, calculations, and dashboard decisions.", "Intermediate"],
  ["power-query", "Power Query", "🧹", "Repeatable cleaning and transformation workflows.", "Intermediate"],
  ["business-analytics", "Business Analytics", "💼", "Metrics, cases, and decision-making frameworks.", "Advanced"],
  ["interview", "Interview Questions", "🎤", "Concise technical and behavioural interview recall.", "Advanced"],
] as const;

export const defaultFlashcardDecks: FlashcardDeck[] = deckSeeds.map(
  ([id, title, icon, description, difficulty]) => ({
    id: `deck-${id}`,
    title,
    description,
    icon,
    category: title,
    difficulty,
    custom: false,
    createdAt: seedDate,
    updatedAt: seedDate,
  }),
);

const cardSeeds: Array<[
  string,
  string,
  string,
  FlashcardDifficulty,
]> = [
  ["excel", "What does an absolute cell reference look like?", "It uses dollar signs before both the column and row, for example $A$1, so copying a formula does not move the reference.", "Beginner"],
  ["excel", "When should you use XLOOKUP?", "Use XLOOKUP to find a value in one range and return the corresponding value from another range, with exact match as its default.", "Beginner"],
  ["excel", "What is the purpose of SUMIFS?", "SUMIFS adds values that meet multiple criteria, with the sum range first and each criteria range paired with its criterion.", "Intermediate"],
  ["excel", "What problem does a PivotTable solve?", "It quickly groups and aggregates a tabular dataset so you can compare measures across dimensions without writing formulas for every view.", "Beginner"],
  ["sql", "What is the logical difference between WHERE and HAVING?", "WHERE filters rows before aggregation; HAVING filters grouped results after GROUP BY.", "Beginner"],
  ["sql", "What does an INNER JOIN return?", "Only rows whose join keys match in both input tables.", "Beginner"],
  ["sql", "How does ROW_NUMBER differ from RANK?", "ROW_NUMBER always assigns unique sequential numbers; RANK gives tied rows the same rank and leaves gaps afterward.", "Intermediate"],
  ["sql", "Why use a CTE?", "A common table expression names an intermediate query, making multi-step SQL easier to read, test, and reuse within the statement.", "Intermediate"],
  ["python", "What is the difference between a list and a tuple?", "Lists are mutable; tuples are immutable. Both preserve order and can hold mixed Python objects.", "Beginner"],
  ["python", "What does pandas groupby do?", "It splits rows into groups by one or more keys, applies aggregations or transformations, and combines the results.", "Beginner"],
  ["python", "Why use .loc in pandas?", ".loc selects rows and columns by labels and supports boolean conditions, making the intended selection explicit.", "Intermediate"],
  ["python", "What does a Python dictionary store?", "Key-value pairs with unique, hashable keys and values of any type.", "Beginner"],
  ["statistics", "What does a p-value represent?", "Assuming the null hypothesis and model assumptions are true, it is the probability of observing a result at least as extreme as the one measured.", "Intermediate"],
  ["statistics", "What is a confidence interval?", "A range produced by a procedure that, over repeated samples, captures the true parameter at the stated confidence rate.", "Intermediate"],
  ["statistics", "Correlation versus causation?", "Correlation describes association. Causation requires evidence that changing one variable produces a change in another, usually through design or strong identification assumptions.", "Beginner"],
  ["statistics", "What does standard deviation measure?", "The typical spread of observations around their mean, expressed in the same units as the data.", "Beginner"],
  ["power-bi", "What is a star schema?", "A model with a central fact table connected to descriptive dimension tables, usually through one-to-many relationships.", "Intermediate"],
  ["power-bi", "What is filter context in DAX?", "The set of filters active when a measure is evaluated, coming from visuals, slicers, relationships, and DAX expressions.", "Intermediate"],
  ["power-bi", "Measure versus calculated column?", "A measure is evaluated at query time in filter context; a calculated column is computed per row and stored in the model.", "Intermediate"],
  ["power-bi", "Why use CALCULATE?", "CALCULATE evaluates an expression after modifying filter context, which makes it central to reusable analytical measures.", "Advanced"],
  ["tableau", "What is a discrete field in Tableau?", "A discrete field creates headers and partitions the view into categories; it appears blue on the shelf.", "Beginner"],
  ["tableau", "What does an LOD expression do?", "A level-of-detail expression computes a value at a specified granularity that may differ from the current visualization.", "Advanced"],
  ["tableau", "When should you use a dashboard action?", "Use one when interaction in one sheet should filter, highlight, or navigate another view for focused analysis.", "Intermediate"],
  ["tableau", "Context filter purpose?", "It creates a primary filtered dataset that dependent filters and some calculations evaluate against.", "Advanced"],
  ["power-query", "What is query folding?", "Power Query translates supported transformation steps back to the data source so the source performs the work.", "Intermediate"],
  ["power-query", "Append versus merge?", "Append stacks rows from compatible tables; merge joins columns using matching keys.", "Beginner"],
  ["power-query", "Why set data types early?", "Correct types prevent ambiguous operations, catch invalid values, and help later transformations behave predictably.", "Beginner"],
  ["power-query", "What does Unpivot do?", "It turns multiple value columns into attribute-value rows, producing a tidy structure that is easier to analyze.", "Intermediate"],
  ["business-analytics", "What makes a KPI useful?", "It is tied to a decision or objective, clearly defined, measurable, timely, and paired with context or a target.", "Intermediate"],
  ["business-analytics", "Leading versus lagging indicator?", "A leading indicator signals likely future outcomes; a lagging indicator confirms results after they occur.", "Intermediate"],
  ["business-analytics", "What is cohort analysis?", "It compares groups that share a starting event or period to reveal retention and behaviour changes over time.", "Intermediate"],
  ["business-analytics", "How should an analyst structure a business case?", "Clarify the decision, define success metrics, identify drivers and constraints, analyze evidence, then recommend an action with risks and next steps.", "Advanced"],
  ["interview", "How should you answer 'Tell me about yourself'?", "Give a concise present-past-future story: your current analytical focus, relevant evidence from prior work, and why this role is the logical next step.", "Beginner"],
  ["interview", "How do you explain a project clearly?", "Use problem, data, approach, result, and reflection. Quantify impact and state what you personally owned.", "Intermediate"],
  ["interview", "What should you do when you do not know an answer?", "Acknowledge the gap, reason aloud from what you know, ask a clarifying question, and explain how you would verify the result.", "Intermediate"],
  ["interview", "How do you answer a conflict question?", "Use a specific STAR example, focus on the shared objective, describe your communication and trade-offs, and finish with the outcome and lesson.", "Advanced"],
];

export const defaultFlashcards: FlashcardDefinition[] = cardSeeds.map(
  ([categoryId, front, back, difficulty], index) => {
    const deck = defaultFlashcardDecks.find((item) => item.id === `deck-${categoryId}`)!;
    const timestamp = new Date(Date.parse(seedDate) + index * 1000).toISOString();
    return {
      id: `card-${categoryId}-${index + 1}`,
      deckId: deck.id,
      front,
      back,
      difficulty,
      category: deck.category,
      audio: { text: `${front} ${back}`, language: "en", ready: true },
      createdAt: timestamp,
      updatedAt: timestamp,
    };
  },
);
