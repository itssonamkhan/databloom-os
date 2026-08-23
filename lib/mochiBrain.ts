export type MochiAnswer = {
  topic: string;
  answer: string;
  memory: string;
  example: string;
};


const mochiKnowledge: MochiAnswer[] = [

  {
    topic: "xlookup",
    answer:
      "XLOOKUP helps you find a value and return related information from another place. It is like asking Excel: 'Find this person and tell me their details.'",

   memory:
  "XLOOKUP = Search + Bring back the answer",

    example:
      "Employee ID → Find Employee Salary"
  },


  {
    topic: "sumifs",
    answer:
      "SUMIFS adds numbers only when multiple conditions are true. It is useful when you want a total based on rules.",

    memory:
      "SUMIFS = Add only what matches the conditions ➕",

    example:
      "Total sales of Product A in January"
  },


  {
    topic: "filter",
    answer:
      "FILTER shows only the rows that match your condition. It creates a smaller view from a bigger dataset.",

    memory:
      "FILTER = Show only what you need 🧹",

    example:
      "Show only customers from Jaipur"
  },


  {
    topic: "pivot table",
    answer:
      "A Pivot Table summarizes large data quickly. It helps you understand patterns without writing many formulas.",

    memory:
      "Pivot Table = Turn big data into simple reports 📊",

    example:
      "Monthly sales by category"
  },

  {
    topic: "sql join",
    answer: "A SQL JOIN combines rows from related tables using a shared key. Start with INNER JOIN when you only want matching records, and use LEFT JOIN when every row from the first table must remain.",
    memory: "JOIN = Match related tables through a key",
    example: "customers JOIN orders ON customers.customer_id = orders.customer_id",
  },
  {
    topic: "where",
    answer: "WHERE filters rows before a query returns them. Put the condition after FROM, and use AND or OR to combine conditions carefully.",
    memory: "WHERE = Keep only rows that meet a condition",
    example: "SELECT * FROM orders WHERE amount > 1000;",
  },
  {
    topic: "python",
    answer: "Python lets you express data work in small readable steps. For analysis, first inspect the data, then clean it, transform it, and only afterward summarize or visualize it.",
    memory: "Inspect → Clean → Transform → Explain",
    example: "df.head(); df.info(); df.isna().sum()",
  },
  {
    topic: "pandas",
    answer: "Pandas DataFrames are tables you can inspect, filter, clean, and summarize. Keep transformations explicit so you can explain how the final result was produced.",
    memory: "DataFrame = A programmable analysis table",
    example: "sales.loc[sales['region'] == 'North']",
  },
  {
    topic: "statistics",
    answer: "Statistics helps you separate signal from noise. Begin by asking what is being measured, how the sample was collected, and which summary best fits the question.",
    memory: "Measure first, summarize second, interpret with context",
    example: "Compare median order value when a few very large orders skew the mean.",
  },
  {
    topic: "power bi",
    answer: "Power BI connects data preparation, modelling, DAX, and visual storytelling. A reliable report starts with a clean model and clear measures before visual polish.",
    memory: "Model → Measure → Visualize",
    example: "Create a Date table, relate it to Sales, then build a Total Sales measure.",
  },
  {
    topic: "tableau",
    answer: "Tableau turns fields into visual marks. Start with the business question, choose a suitable chart, and use filters or calculated fields only when they clarify the story.",
    memory: "Question → Marks → Context",
    example: "Place Month on Columns and Sales on Rows to inspect a trend.",
  },
  {
    topic: "data cleaning",
    answer: "Data cleaning makes records consistent and trustworthy. Check missing values, duplicates, data types, spelling variations, and impossible values before analysing.",
    memory: "Clean for consistency, validity, and traceability",
    example: "Standardize country labels before grouping sales by country.",
  },
  {
    topic: "business analytics",
    answer: "Business analytics connects a decision to evidence. Define the business question, choose a measurable metric, compare the right groups, and explain the action the result supports.",
    memory: "Question → Metric → Comparison → Decision",
    example: "Investigate whether repeat-purchase rate changed after a campaign.",
  },
  {
    topic: "data analysis",
    answer: "Good data analysis moves from context to pattern to explanation. Check the grain of the data, establish a baseline, investigate unusual results, and communicate the finding plainly.",
    memory: "Context makes patterns useful",
    example: "Compare this month's conversion rate with the same period last year.",
  },


];


export function askMochi(question:string) {

  const text =
    question.toLowerCase();


  const found =
    mochiKnowledge.find(item =>
      text.includes(item.topic)
    );


  if(found){

    return found;

  }


  return {

    topic:"general",

    answer:
      "I am still learning this topic 🌸. Try asking me about Excel formulas, dashboards, or analytics concepts.",

    memory:
      "Small steps every day create data skills 🌱",

    example:
      "Try asking: Explain XLOOKUP"

  };

}
