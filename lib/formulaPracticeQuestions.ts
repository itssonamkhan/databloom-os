import { formulas } from "@/lib/formulas";
import { STUDY_ACTIVITY_EVENT } from "@/lib/studyActivity";

export const formulaPracticeQuestionTypes = [
  "multiple-choice",
  "fill-blank",
  "formula-writing",
  "scenario-selection",
  "formula-comparison",
] as const;

export type FormulaPracticeQuestionType =
  (typeof formulaPracticeQuestionTypes)[number];

export type FormulaPracticeDifficulty =
  | "beginner"
  | "intermediate"
  | "advanced";

export type FormulaPracticeContext = {
  title: string;
  columns: string[];
  rows: string[][];
  note?: string;
};

export type FormulaPracticeSolution = {
  canonicalAnswer: string;
  explanation: string;
  steps: string[];
  expectedResult?: string;
};

export type FormulaPracticeQuestion = {
  id: string;
  formulaId: string;
  type: FormulaPracticeQuestionType;
  prompt: string;
  options?: string[];
  acceptedAnswers?: string[];
  correctOption?: string;
  explanation: string;
  hint: string;
  context: FormulaPracticeContext;
  solution: FormulaPracticeSolution;
  difficulty?: FormulaPracticeDifficulty;
};

type FormulaPracticeQuestionDraft = Omit<
  FormulaPracticeQuestion,
  "id" | "hint" | "context" | "solution"
>;

const question = (
  item: FormulaPracticeQuestionDraft & { id?: string },
) => ({
  ...item,
  id: item.id ?? `${item.formulaId}-practice-1`,
});

/**
 * Formula-specific exercises intentionally reference the canonical formula
 * records by ID. They do not duplicate formula content or create learning
 * completion state.
 */
const baseFormulaPracticeQuestions: Array<
  FormulaPracticeQuestionDraft & { id: string }
> = [
  question({
    formulaId: "sum",
    type: "formula-writing",
    prompt: "Write a formula that totals the values in cells B2 through B20.",
    acceptedAnswers: ["=SUM(B2:B20)"],
    explanation: "SUM adds every numeric value in the selected range.",
    difficulty: "beginner",
  }),
  question({
    formulaId: "if",
    type: "scenario-selection",
    prompt: "Which formula labels a sale as Target when C2 is at least 50000, and otherwise labels it Below target?",
    options: [
      "=IF(C2>=50000,\"Target\",\"Below target\")",
      "=COUNTIF(C2,50000)",
      "=SUM(C2>=50000)",
    ],
    correctOption: '=IF(C2>=50000,"Target","Below target")',
    explanation: "IF evaluates one condition and returns one of two results.",
    difficulty: "beginner",
  }),
  question({
    formulaId: "count",
    type: "multiple-choice",
    prompt: "Which formula counts only numeric entries in A2:A100?",
    options: ["=COUNT(A2:A100)", "=COUNTA(A2:A100)", "=COUNTIF(A2:A100,\"*\")"],
    correctOption: "=COUNT(A2:A100)",
    explanation: "COUNT ignores text and blank cells and counts numbers only.",
    difficulty: "beginner",
  }),
  question({
    formulaId: "counta",
    type: "fill-blank",
    prompt: "Complete the formula to count every non-empty cell in D2:D50: =COUNTA(____).",
    acceptedAnswers: ["D2:D50"],
    explanation: "COUNTA counts cells containing any value, including text.",
    difficulty: "beginner",
  }),
  question({
    formulaId: "countif",
    type: "formula-writing",
    prompt: "Count the rows in B2:B200 whose status is exactly \"Open\".",
    acceptedAnswers: ['=COUNTIF(B2:B200,"Open")'],
    explanation: "COUNTIF applies one criterion to one range.",
    difficulty: "intermediate",
  }),
  question({
    formulaId: "countifs",
    type: "formula-writing",
    prompt: "Count rows where Region in A2:A200 is \"West\" and Revenue in C2:C200 is greater than 10000.",
    acceptedAnswers: ['=COUNTIFS(A2:A200,"West",C2:C200,">10000")'],
    explanation: "COUNTIFS pairs each criteria range with its own criterion.",
    difficulty: "intermediate",
  }),
  question({
    formulaId: "min",
    type: "multiple-choice",
    prompt: "You need the lowest value in E2:E80, without applying a condition. Which formula is appropriate?",
    options: ["=MIN(E2:E80)", "=MAX(E2:E80)", "=ROUND(E2:E80,0)"],
    correctOption: "=MIN(E2:E80)",
    explanation: "MIN returns the smallest numeric value in a range.",
    difficulty: "beginner",
  }),
  question({
    formulaId: "max",
    type: "fill-blank",
    prompt: "Complete the formula to return the highest score in F2:F80: =MAX(____).",
    acceptedAnswers: ["F2:F80"],
    explanation: "MAX returns the largest numeric value in a range.",
    difficulty: "beginner",
  }),
  question({
    formulaId: "round",
    type: "formula-writing",
    prompt: "Round the value in A2 to two decimal places using standard rounding.",
    acceptedAnswers: ["=ROUND(A2,2)"],
    explanation: "ROUND uses normal rounding rules at the requested digit.",
    difficulty: "beginner",
  }),
  question({
    formulaId: "roundup",
    type: "scenario-selection",
    prompt: "A billing policy requires 12.31 to become 12.4. Which formula always rounds upward to one decimal place?",
    options: ["=ROUNDUP(12.31,1)", "=ROUND(12.31,1)", "=ROUNDDOWN(12.31,1)"],
    correctOption: "=ROUNDUP(12.31,1)",
    explanation: "ROUNDUP moves away from zero at the requested precision.",
    difficulty: "beginner",
  }),
  question({
    formulaId: "rounddown",
    type: "formula-writing",
    prompt: "Round the amount in G2 down to one decimal place, never increasing it.",
    acceptedAnswers: ["=ROUNDDOWN(G2,1)"],
    explanation: "ROUNDDOWN removes precision in the downward direction.",
    difficulty: "beginner",
  }),
  question({
    formulaId: "xlookup",
    type: "formula-writing",
    prompt: "Look up the employee ID in E2 within A2:A100 and return the matching salary from C2:C100. Show Not found when missing.",
    acceptedAnswers: ['=XLOOKUP(E2,A2:A100,C2:C100,"Not found")'],
    explanation: "XLOOKUP separates the lookup and return arrays and can provide a fallback.",
    difficulty: "intermediate",
  }),
  question({
    formulaId: "index",
    type: "formula-writing",
    prompt: "Return the value from row 5, column 3 of the range A2:F20.",
    acceptedAnswers: ["=INDEX(A2:F20,5,3)"],
    explanation: "INDEX retrieves a value by relative row and column position.",
    difficulty: "intermediate",
  }),
  question({
    formulaId: "match",
    type: "formula-writing",
    prompt: "Find the exact position of the product in H2 within the list A2:A100.",
    acceptedAnswers: ["=MATCH(H2,A2:A100,0)"],
    explanation: "MATCH returns the position, and 0 requests an exact match.",
    difficulty: "intermediate",
  }),
  question({
    formulaId: "index-match",
    type: "formula-comparison",
    prompt: "Which INDEX + MATCH formula returns the department for the employee ID in E2?",
    options: [
      "=INDEX(C2:C100,MATCH(E2,A2:A100,0))",
      "=MATCH(C2:C100,INDEX(E2,A2:A100),0)",
      "=INDEX(A2:A100,MATCH(C2:C100,E2,0))",
    ],
    correctOption: "=INDEX(C2:C100,MATCH(E2,A2:A100,0))",
    explanation: "MATCH finds the employee row and INDEX returns the department from that row.",
    difficulty: "advanced",
  }),
  question({
    formulaId: "left",
    type: "formula-writing",
    prompt: "Extract the first three characters from the code in B2.",
    acceptedAnswers: ["=LEFT(B2,3)"],
    explanation: "LEFT reads characters from the beginning of a text value.",
    difficulty: "beginner",
  }),
  question({
    formulaId: "right",
    type: "formula-writing",
    prompt: "Extract the final four characters from the identifier in B2.",
    acceptedAnswers: ["=RIGHT(B2,4)"],
    explanation: "RIGHT reads characters from the end of a text value.",
    difficulty: "beginner",
  }),
  question({
    formulaId: "mid",
    type: "formula-writing",
    prompt: "Extract five characters from B2, starting at character 4.",
    acceptedAnswers: ["=MID(B2,4,5)"],
    explanation: "MID needs the source text, starting position, and character count.",
    difficulty: "intermediate",
  }),
  question({
    formulaId: "len",
    type: "multiple-choice",
    prompt: "Which formula returns the number of characters in the text stored in C2?",
    options: ["=LEN(C2)", "=LEFT(C2)", "=COUNT(C2)"],
    correctOption: "=LEN(C2)",
    explanation: "LEN counts characters, including spaces, in the supplied text.",
    difficulty: "beginner",
  }),
  question({
    formulaId: "trim",
    type: "formula-writing",
    prompt: "Clean extra spaces from the customer name in C2 while preserving single spaces between words.",
    acceptedAnswers: ["=TRIM(C2)"],
    explanation: "TRIM removes leading, trailing, and repeated internal spaces.",
    difficulty: "beginner",
  }),
  question({
    formulaId: "text",
    type: "formula-writing",
    prompt: "Display the date in A2 as a four-digit year and two-digit month, such as 2026-04.",
    acceptedAnswers: ['=TEXT(A2,"yyyy-mm")'],
    explanation: "TEXT converts a value to a formatted text representation.",
    difficulty: "intermediate",
  }),
  question({
    formulaId: "concat",
    type: "formula-writing",
    prompt: "Join the first name in A2 and last name in B2 with one space between them.",
    acceptedAnswers: ['=CONCAT(A2," ",B2)'],
    explanation: "CONCAT combines text values in the order supplied.",
    difficulty: "beginner",
  }),
  question({
    formulaId: "concatenate",
    type: "formula-comparison",
    prompt: "Which legacy formula joins A2, a space, and B2 into one text value?",
    options: ['=CONCATENATE(A2," ",B2)', "=CONCATENATE(A2+B2)", "=CONCATENATE(A2:B2)"],
    correctOption: '=CONCATENATE(A2," ",B2)',
    explanation: "CONCATENATE accepts separate text arguments; newer workbooks often use CONCAT or TEXTJOIN.",
    difficulty: "intermediate",
  }),
  question({
    formulaId: "textjoin",
    type: "formula-writing",
    prompt: "Join the nonblank values in A2:A10 with a comma and a space, ignoring blanks.",
    acceptedAnswers: ['=TEXTJOIN(", ",TRUE,A2:A10)'],
    explanation: "TEXTJOIN supplies a delimiter and can ignore empty cells.",
    difficulty: "intermediate",
  }),
  question({
    formulaId: "today",
    type: "multiple-choice",
    prompt: "Which formula returns the current date and updates when the workbook recalculates?",
    options: ["=TODAY()", "=NOW()", "=DATE()"],
    correctOption: "=TODAY()",
    explanation: "TODAY returns the current date without a time component.",
    difficulty: "beginner",
  }),
  question({
    formulaId: "now",
    type: "multiple-choice",
    prompt: "Which formula returns the current date and time?",
    options: ["=NOW()", "=TODAY()", "=TIMEVALUE()"],
    correctOption: "=NOW()",
    explanation: "NOW returns a volatile current date-time value.",
    difficulty: "beginner",
  }),
  question({
    formulaId: "year",
    type: "formula-writing",
    prompt: "Extract the four-digit year from the date in D2.",
    acceptedAnswers: ["=YEAR(D2)"],
    explanation: "YEAR returns the year component of a valid Excel date.",
    difficulty: "beginner",
  }),
  question({
    formulaId: "month",
    type: "formula-writing",
    prompt: "Extract the month number from the date in D2.",
    acceptedAnswers: ["=MONTH(D2)"],
    explanation: "MONTH returns a number from 1 through 12 for a date.",
    difficulty: "beginner",
  }),
  question({
    formulaId: "day",
    type: "formula-writing",
    prompt: "Extract the day of the month from the date in D2.",
    acceptedAnswers: ["=DAY(D2)"],
    explanation: "DAY returns the day component of a date.",
    difficulty: "beginner",
  }),
  question({
    formulaId: "edate",
    type: "formula-writing",
    prompt: "Return the date exactly three months after the date in D2.",
    acceptedAnswers: ["=EDATE(D2,3)"],
    explanation: "EDATE shifts a date by a number of calendar months.",
    difficulty: "intermediate",
  }),
  question({
    formulaId: "eomonth",
    type: "formula-writing",
    prompt: "Return the last day of the month containing the date in D2.",
    acceptedAnswers: ["=EOMONTH(D2,0)"],
    explanation: "EOMONTH returns a month-end date after the requested offset.",
    difficulty: "intermediate",
  }),
  question({
    formulaId: "filter",
    type: "formula-writing",
    prompt: "Return rows A2:C100 where the status in C2:C100 equals \"Open\".",
    acceptedAnswers: ['=FILTER(A2:C100,C2:C100="Open")'],
    explanation: "FILTER spills the rows whose include array evaluates TRUE.",
    difficulty: "advanced",
  }),
  question({
    formulaId: "sort",
    type: "formula-writing",
    prompt: "Sort the range A2:C100 by its second column in ascending order.",
    acceptedAnswers: ["=SORT(A2:C100,2,1)"],
    explanation: "SORT uses sort_index 2 and sort_order 1 for ascending order.",
    difficulty: "advanced",
  }),
  question({
    formulaId: "unique",
    type: "formula-writing",
    prompt: "Create a spilled list of unique customer names from A2:A100.",
    acceptedAnswers: ["=UNIQUE(A2:A100)"],
    explanation: "UNIQUE returns each distinct value from the source range.",
    difficulty: "advanced",
  }),
  question({
    formulaId: "sortby",
    type: "formula-writing",
    prompt: "Sort A2:C100 by the revenue values in C2:C100 from largest to smallest.",
    acceptedAnswers: ["=SORTBY(A2:C100,C2:C100,-1)"],
    explanation: "SORTBY sorts one array using a separate by_array and descending order -1.",
    difficulty: "advanced",
  }),
  question({
    formulaId: "sequence",
    type: "formula-writing",
    prompt: "Generate a vertical sequence of the numbers 1 through 12.",
    acceptedAnswers: ["=SEQUENCE(12,1,1,1)"],
    explanation: "SEQUENCE creates a spilled numeric array from rows, columns, start, and step.",
    difficulty: "advanced",
  }),
  question({
    formulaId: "let",
    type: "formula-writing",
    prompt: "Use LET to calculate the total of B2:B20 once, then return that total after applying a 10% uplift.",
    acceptedAnswers: ["=LET(total,SUM(B2:B20),total*1.1)"],
    explanation: "LET names an intermediate result so it can be reused clearly.",
    difficulty: "advanced",
  }),
  question({
    formulaId: "lambda",
    type: "formula-comparison",
    prompt: "Which LAMBDA defines a reusable function that doubles its input?",
    options: ["=LAMBDA(x,x*2)", "=LAMBDA(x,SUM(x))", "=LAMBDA(2,x+x)"],
    correctOption: "=LAMBDA(x,x*2)",
    explanation: "LAMBDA names parameters first and returns the expression that uses them.",
    difficulty: "advanced",
  }),
  question({
    formulaId: "take",
    type: "formula-writing",
    prompt: "Return the first five rows from the spilled table in A2:D100.",
    acceptedAnswers: ["=TAKE(A2:D100,5)"],
    explanation: "TAKE selects rows or columns from the beginning or end of an array.",
    difficulty: "advanced",
  }),
  question({
    formulaId: "choosecols",
    type: "formula-writing",
    prompt: "From A2:F100, return only columns 1, 3, and 6.",
    acceptedAnswers: ["=CHOOSECOLS(A2:F100,1,3,6)"],
    explanation: "CHOOSECOLS projects selected column positions into a new array.",
    difficulty: "advanced",
  }),
  question({
    formulaId: "hstack",
    type: "formula-writing",
    prompt: "Place the arrays A2:A10 and C2:C10 side by side in one spilled result.",
    acceptedAnswers: ["=HSTACK(A2:A10,C2:C10)"],
    explanation: "HSTACK combines arrays horizontally by columns.",
    difficulty: "advanced",
  }),
  question({
    formulaId: "vstack",
    type: "formula-writing",
    prompt: "Append the rows in A2:C10 below the rows in A20:C28.",
    acceptedAnswers: ["=VSTACK(A2:C10,A20:C28)"],
    explanation: "VSTACK combines arrays vertically by rows.",
    difficulty: "advanced",
  }),
];

const tableContext = (
  title: string,
  columns: string[],
  rows: string[][],
  note?: string,
): FormulaPracticeContext => ({ title, columns, rows, note });

const numericWorksheet = tableContext(
  "Representative worksheet values",
  ["A", "B", "C", "D", "E", "F", "G", "H"],
  [
    ["18.376", "1250", "Open", "2026-04-15", "E-1001", "88", "19.99", "Laptop"],
    ["22.1", "675", "Closed", "2026-05-02", "E-1002", "92", "7.45", "Mouse"],
    ["9.5", "980", "Open", "2026-06-18", "E-1003", "76", "12.5", "Tablet"],
    ["31.25", "1440", "Open", "2026-07-11", "E-1004", "95", "25.0", "Monitor"],
    ["12.0", "750", "Open", "2026-08-09", "E-1005", "81", "5.25", "Keyboard"],
  ],
  "The displayed rows are representative values; apply the requested formula to the full range named in the question.",
);

const conditionalWorksheet = tableContext(
  "Sales target scenario",
  ["A", "B", "C"],
  [
    ["SO-1001", "North", "65000"],
    ["SO-1002", "West", "42000"],
    ["SO-1003", "South", "51500"],
  ],
  "C2 is 65000, so the first row is the worked example for the Target/Below target rule.",
);

const countWorksheet = tableContext(
  "Mixed values for counting",
  ["A", "B", "D"],
  [
    ["12", "Open", "Aisha"],
    ["18", "Closed", ""],
    ["21", "Open", "Meera"],
    ["n/a", "Open", "42"],
  ],
  "This small range intentionally mixes numbers, text, blanks, and labels so the counting rule is observable.",
);

const statusWorksheet = tableContext(
  "Status and revenue criteria",
  ["A", "B", "C"],
  [
    ["West", "Open", "12500"],
    ["West", "Closed", "9000"],
    ["North", "Open", "15500"],
    ["West", "Open", "21000"],
  ],
  "For COUNTIFS, rows 2 and 5 are West with revenue greater than 10000.",
);

const lookupWorksheet = tableContext(
  "Employee lookup table",
  ["A", "B", "C", "D", "E"],
  [
    ["E-1001", "Aisha Khan", "72000", "Sales", "E-1003"],
    ["E-1002", "Rohan Mehta", "68000", "Operations", ""],
    ["E-1003", "Meera Iyer", "75500", "Finance", ""],
    ["E-1004", "Arjun Das", "81000", "Marketing", ""],
  ],
  "E2 contains E-1003. A is the lookup array, C is salary, and D is department.",
);

const departmentLookupWorksheet = tableContext(
  "Employee department lookup",
  ["A", "B", "C", "E"],
  [
    ["E-1001", "Aisha Khan", "Sales", "E-1003"],
    ["E-1002", "Rohan Mehta", "Operations", ""],
    ["E-1003", "Meera Iyer", "Finance", ""],
    ["E-1004", "Arjun Das", "Marketing", ""],
  ],
  "E2 contains E-1003. MATCH locates it in A2:A100 and INDEX returns the department from C2:C100.",
);

const indexWorksheet = tableContext(
  "A2:F20 representative range",
  ["A", "B", "C", "D", "E", "F"],
  [
    ["North", "Laptop", "Software", "2", "1250", "2026-04-15"],
    ["West", "Mouse", "Hardware", "3", "675", "2026-05-02"],
    ["South", "Tablet", "Hardware", "1", "980", "2026-06-18"],
    ["East", "Monitor", "Hardware", "4", "1440", "2026-07-11"],
    ["North", "Keyboard", "Hardware", "5", "750", "2026-08-09"],
  ],
  "Five representative rows are shown so relative row 5 and column 3 can be checked directly.",
);

const matchWorksheet = tableContext(
  "Product lookup list",
  ["A", "H"],
  [
    ["Laptop", "Tablet"],
    ["Mouse", ""],
    ["Tablet", ""],
    ["Monitor", ""],
  ],
  "H2 contains Tablet; MATCH should return its exact position in A2:A100.",
);

const nameWorksheet = tableContext(
  "Name fields",
  ["A", "B"],
  [
    ["Aisha", "Khan"],
    ["Rohan", "Mehta"],
    ["Meera", "Iyer"],
    ["Arjun", "Das"],
    ["", ""],
  ],
  "A2 and B2 are the first-name and last-name inputs for the joining exercises.",
);

const textWorksheet = tableContext(
  "Text and code values",
  ["A", "B", "C", "D"],
  [
    ["Aisha", "ABC-1042", "  Aisha   Khan ", "2026-04-15"],
    ["Rohan", "MOU-2081", "Meera Iyer", "2026-05-02"],
    ["Meera", "TAB-3300", "Arjun Das", "2026-06-18"],
    ["Arjun", "XYZ-4521", "Sana Ali", "2026-07-11"],
  ],
  "The values in B2, C2, and D2 are the concrete inputs for the text/date exercises.",
);

const lenWorksheet = tableContext(
  "Text length input",
  ["A", "B", "C"],
  [["Aisha", "ABC-1042", "Customer Name"]],
  "C2 contains Customer Name, so LEN can be checked without hidden whitespace.",
);

const trimWorksheet = tableContext(
  "Text cleanup input",
  ["A", "B", "C"],
  [["Aisha", "ABC-1042", "  Aisha   Khan "]],
  "C2 contains leading, internal, and trailing whitespace for the TRIM exercise.",
);

const scoreWorksheet = tableContext(
  "Scores and amounts",
  ["E", "F", "G"],
  [
    ["12", "88", "19.99"],
    ["7", "92", "7.45"],
    ["15", "76", "12.5"],
    ["5", "95", "25.0"],
  ],
  "E, F, and G provide numeric values for minimum, maximum, and rounding examples.",
);

const dateWorksheet = tableContext(
  "Date values",
  ["A", "D"],
  [
    ["2026-04-15", "2026-04-15"],
    ["2026-05-02", "2026-05-02"],
    ["2026-06-18", "2026-06-18"],
  ],
  "D2 is 15 April 2026; date functions use that value for the expected result.",
);

const dynamicWorksheet = tableContext(
  "Dynamic-array source range",
  ["A", "B", "C"],
  [
    ["Aisha", "West", "Open"],
    ["Rohan", "North", "Closed"],
    ["Meera", "West", "Open"],
    ["Arjun", "East", "Open"],
    ["Aisha", "West", "Open"],
  ],
  "The prompt names the full source range; these rows make the filter, sort, and unique results concrete without creating a large sheet.",
);

const vstackWorksheet = tableContext(
  "Two compatible row blocks",
  ["A", "B", "C"],
  [
    ["A2", "North", "Laptop"],
    ["A3", "West", "Mouse"],
    ["A20", "South", "Tablet"],
    ["A21", "East", "Monitor"],
  ],
  "Rows labelled A2–A3 represent the first block; rows labelled A20–A21 represent the second block that should appear below it.",
);

const standaloneContext = tableContext(
  "Formula input scenario",
  ["Input", "Expected rule"],
  [["12.31", "Round upward to one decimal"], ["7", "Double with LAMBDA"]],
  "This exercise is self-contained and does not require a worksheet range.",
);

const formulaContextById: Record<string, FormulaPracticeContext> = {
  sum: numericWorksheet,
  if: conditionalWorksheet,
  count: countWorksheet,
  counta: countWorksheet,
  countif: statusWorksheet,
  countifs: statusWorksheet,
  min: scoreWorksheet,
  max: scoreWorksheet,
  round: numericWorksheet,
  roundup: standaloneContext,
  rounddown: numericWorksheet,
  xlookup: lookupWorksheet,
  index: indexWorksheet,
  match: matchWorksheet,
  "index-match": departmentLookupWorksheet,
  left: textWorksheet,
  right: textWorksheet,
  mid: textWorksheet,
  len: lenWorksheet,
  trim: trimWorksheet,
  text: dateWorksheet,
  concat: nameWorksheet,
  concatenate: nameWorksheet,
  textjoin: nameWorksheet,
  today: standaloneContext,
  now: standaloneContext,
  year: dateWorksheet,
  month: dateWorksheet,
  day: dateWorksheet,
  edate: dateWorksheet,
  eomonth: dateWorksheet,
  filter: dynamicWorksheet,
  sort: dynamicWorksheet,
  unique: dynamicWorksheet,
  sortby: statusWorksheet,
  sequence: standaloneContext,
  let: numericWorksheet,
  lambda: standaloneContext,
  take: indexWorksheet,
  choosecols: indexWorksheet,
  hstack: dynamicWorksheet,
  vstack: vstackWorksheet,
};

const hintByFormulaId: Record<string, string> = {
  sum: "Add the numeric values in the requested range; SUM takes one range argument.",
  if: "Identify the test first, then the value returned when it is TRUE and when it is FALSE.",
  count: "COUNT includes numeric cells only; text and blanks are ignored.",
  counta: "COUNTA counts any cell that is not empty, including text and numbers.",
  countif: "Use one criteria range and match the exact status requested.",
  countifs: "Pair each criteria range with its condition; both conditions must be true for a row.",
  min: "Choose the function that returns the smallest numeric value.",
  max: "Choose the function that returns the largest numeric value.",
  round: "The second argument controls how many decimal places remain.",
  roundup: "This policy always moves the value upward at the requested precision.",
  rounddown: "Use the rounding function that never increases the amount.",
  xlookup: "Map the lookup value to the key column, then return the parallel salary column with a fallback.",
  index: "INDEX takes a range followed by a relative row number and column number.",
  match: "Use exact-match mode so the position is returned only for the requested product.",
  "index-match": "MATCH locates the employee row; INDEX returns the department from that same row.",
  left: "Use the text function that reads from the beginning and specify three characters.",
  right: "Use the text function that reads from the end and specify four characters.",
  mid: "MID needs the source, starting character position, and number of characters.",
  len: "The required function counts characters rather than numeric values.",
  trim: "Look for the function that removes extra leading, trailing, and repeated spaces.",
  text: "TEXT applies a display mask to the date; the mask needs year and month tokens.",
  concat: "Pass the first name, a literal space, and the last name as separate arguments.",
  concatenate: "The legacy function takes each text fragment as a separate argument.",
  textjoin: "Choose a delimiter, tell Excel to ignore blanks, then supply the source range.",
  today: "TODAY returns the current date without a time component.",
  now: "NOW returns both the current date and the current time.",
  year: "Extract only the year component from the supplied date.",
  month: "Extract the month number, which is between 1 and 12.",
  day: "Extract the day-of-month component from the date.",
  edate: "Shift the date by three calendar months rather than adding a fixed number of days.",
  eomonth: "Use a zero-month offset and return the final day of that month.",
  filter: "Return the source rows whose status test evaluates TRUE.",
  sort: "Sort the source array by its second column and use ascending order.",
  unique: "The required function spills one copy of each distinct customer name.",
  sortby: "Sort the whole table by the revenue column, using descending order.",
  sequence: "Specify rows, columns, starting value, and step for a vertical 1–12 array.",
  let: "Name the SUM result once, then reuse that name in the 10% uplift calculation.",
  lambda: "LAMBDA declares its parameter before the expression that doubles it.",
  take: "TAKE selects rows from the top when the row count is positive.",
  choosecols: "Project columns 1, 3, and 6 from the source array.",
  hstack: "Place the two one-column arrays next to one another.",
  vstack: "Place the second block directly below the first block.",
};

const expectedResultByFormulaId: Record<string, string> = {
  sum: "5,095",
  if: "Target",
  count: "3 numeric cells",
  counta: "3 non-empty cells",
  countif: "3 Open rows",
  countifs: "2 rows",
  min: "5",
  max: "95",
  round: "18.38",
  roundup: "12.4",
  rounddown: "19.9",
  xlookup: "75,500",
  index: "Hardware",
  match: "3",
  "index-match": "Finance",
  left: "ABC",
  right: "1042",
  mid: "-1042",
  len: "13 characters",
  trim: "Aisha Khan",
  text: "2026-04",
  concat: "Aisha Khan",
  concatenate: "Aisha Khan",
  textjoin: "Aisha, Rohan, Meera, Arjun",
  year: "2026",
  month: "4",
  day: "15",
  edate: "2026-07-15",
  eomonth: "2026-04-30",
  filter: "The Open rows: Aisha, Meera, and Arjun",
  sort: "Rows ordered East, North, West, West, West by column B",
  unique: "Aisha, Rohan, Meera, Arjun",
  sortby: "Rows ordered by revenue from largest to smallest",
  sequence: "1, 2, 3, …, 12",
  let: "5,604.5",
  lambda: "For input 7, the result is 14",
  take: "The first five rows of A2:D100",
  choosecols: "Columns A, C, and F",
  hstack: "A and C appear side by side",
  vstack: "The A2:C10 block followed by A20:C28",
};

function enrichFormulaPracticeQuestion(
  item: FormulaPracticeQuestionDraft & { id: string },
): FormulaPracticeQuestion {
  const formula = formulas.find((entry) => entry.id === item.formulaId);
  if (!formula) {
    throw new Error(`Formula practice references unknown formula: ${item.formulaId}`);
  }

  const context = formulaContextById[item.formulaId];
  const hint = hintByFormulaId[item.formulaId];
  if (!context || !hint) {
    throw new Error(`Formula practice support is incomplete for ${item.formulaId}`);
  }

  const canonicalAnswer = item.correctOption ?? item.acceptedAnswers?.[0] ?? "";
  return {
    ...item,
    hint,
    context,
    solution: {
      canonicalAnswer,
      explanation: item.explanation,
      steps: [
        `Read the supplied ${context.title.toLowerCase()} for the cells or values named in the question.`,
        `Apply ${formula.name} to the requested input using the arguments described in the prompt.`,
        ...formula.howToUse.slice(0, 2),
      ],
      expectedResult: expectedResultByFormulaId[item.formulaId],
    },
  };
}

export const formulaPracticeQuestions: FormulaPracticeQuestion[] =
  baseFormulaPracticeQuestions.map((item) =>
    enrichFormulaPracticeQuestion(item),
  );

export const formulaPracticeSessionKey = "databloom-formula-practice-session-v1";

export const formulaPracticeDifficultyOrder: FormulaPracticeDifficulty[] = [
  "beginner",
  "intermediate",
  "advanced",
];

/** A deliberately small, session-only gate keeps practice progressive without creating learner mastery. */
export const formulaPracticeUnlockRequirements: Record<FormulaPracticeDifficulty, number> = {
  beginner: 0,
  intermediate: 3,
  advanced: 3,
};

export type FormulaWorkedExample = {
  problem: string;
  concept: string;
  steps: string[];
  finalAnswer: string;
  why: string;
};

export type FormulaPracticeAssessmentAlignment = {
  studioId: "formula-studio";
  topicId: string;
  chapterName: string;
  label: string;
};

export type FormulaPracticeAnalyticsAction =
  | "practice-started"
  | "exercise-attempted"
  | "answer-result"
  | "worked-example-viewed"
  | "practice-completed";

/**
 * Uses the existing study-activity event channel. AnalyticsHistoryTracker
 * observes this event and refreshes the existing snapshot; no event payload
 * or new storage key is introduced here.
 */
export function emitFormulaPracticeAnalyticsEvent({
  action,
  formulaId,
  difficulty,
  questionType,
  result,
}: {
  action: FormulaPracticeAnalyticsAction;
  formulaId: string;
  difficulty?: FormulaPracticeDifficulty;
  questionType?: FormulaPracticeQuestionType;
  result?: "correct" | "incorrect";
}): void {
  if (typeof window === "undefined") return;
  const alignment = getFormulaPracticeAssessmentAlignment(formulaId);

  window.dispatchEvent(
    new CustomEvent(STUDY_ACTIVITY_EVENT, {
      detail: {
        kind: "practice",
        source: `formula-practice:${formulaId}`,
        action,
        studio: alignment?.studioId ?? "formula-studio",
        formulaId,
        topicId: alignment?.topicId ?? formulaId,
        chapter: alignment?.chapterName,
        difficulty,
        questionType,
        result,
      },
    }),
  );
}

/**
 * Formula assessment coverage already uses formula IDs as topic IDs and the
 * canonical formula category as its chapter. Derive that relationship rather
 * than duplicating assessment data in every practice question.
 */
export function getFormulaPracticeAssessmentAlignment(
  formulaId: string,
): FormulaPracticeAssessmentAlignment | null {
  const formula = formulas.find((item) => item.id === formulaId);
  if (!formula) return null;

  return {
    studioId: "formula-studio",
    topicId: formula.id,
    chapterName: formula.category,
    label: `Assessment topic: ${formula.category}`,
  };
}

export function getFormulaWorkedExample(formulaId: string): FormulaWorkedExample | null {
  const formula = formulas.find((item) => item.id === formulaId);
  if (!formula) return null;

  return {
    problem: formula.example,
    concept: `${formula.name}: ${formula.purpose}`,
    steps: formula.howToUse,
    finalAnswer: formula.syntax,
    why: `This is correct because ${formula.purpose.charAt(0).toLowerCase()}${formula.purpose.slice(1)}`,
  };
}

export function getUnlockedFormulaDifficulties(
  completedQuestionIds: ReadonlySet<string>,
): Set<FormulaPracticeDifficulty> {
  const completedByDifficulty = formulaPracticeDifficultyOrder.reduce(
    (counts, difficulty) => {
      counts[difficulty] = formulaPracticeQuestions.filter(
        (item) => item.difficulty === difficulty && completedQuestionIds.has(item.id),
      ).length;
      return counts;
    },
    {} as Record<FormulaPracticeDifficulty, number>,
  );

  const unlocked = new Set<FormulaPracticeDifficulty>(["beginner"]);
  if (completedByDifficulty.beginner >= formulaPracticeUnlockRequirements.intermediate) {
    unlocked.add("intermediate");
  }
  if (completedByDifficulty.intermediate >= formulaPracticeUnlockRequirements.advanced) {
    unlocked.add("advanced");
  }
  return unlocked;
}

export function getProgressiveFormulaPracticeQuestions(
  completedQuestionIds: ReadonlySet<string>,
): FormulaPracticeQuestion[] {
  const unlocked = getUnlockedFormulaDifficulties(completedQuestionIds);
  return formulaPracticeQuestions
    .filter((item) => item.difficulty && unlocked.has(item.difficulty))
    .sort(
      (a, b) =>
        formulaPracticeDifficultyOrder.indexOf(a.difficulty ?? "beginner") -
        formulaPracticeDifficultyOrder.indexOf(b.difficulty ?? "beginner"),
    );
}

export type FormulaPracticeValidationIssue = {
  questionId?: string;
  message: string;
};

export type FormulaPracticeValidationResult = {
  valid: boolean;
  issues: FormulaPracticeValidationIssue[];
  coveredFormulaIds: string[];
  missingFormulaIds: string[];
};

const formulaIds = new Set(formulas.map((formula) => formula.id));
const questionTypes = new Set<string>(formulaPracticeQuestionTypes);

export function validateFormulaPracticeQuestions(
  questions: readonly FormulaPracticeQuestion[] = formulaPracticeQuestions,
): FormulaPracticeValidationResult {
  const issues: FormulaPracticeValidationIssue[] = [];
  const ids = new Set<string>();
  const covered = new Set<string>();

  for (const item of questions) {
    if (!item.id.trim()) {
      issues.push({ message: "Practice question has an empty ID." });
    } else if (ids.has(item.id)) {
      issues.push({ questionId: item.id, message: "Practice question ID is duplicated." });
    }
    ids.add(item.id);

    if (!formulaIds.has(item.formulaId)) {
      issues.push({ questionId: item.id, message: `Unknown formula ID: ${item.formulaId}.` });
    } else {
      covered.add(item.formulaId);
    }

    if (!questionTypes.has(item.type)) {
      issues.push({ questionId: item.id, message: `Invalid question type: ${item.type}.` });
    }
    if (!item.prompt.trim()) {
      issues.push({ questionId: item.id, message: "Practice question prompt is empty." });
    }
    if (!item.explanation.trim()) {
      issues.push({ questionId: item.id, message: "Practice question explanation is empty." });
    }
    if (!item.hint.trim()) {
      issues.push({ questionId: item.id, message: "Practice question hint is empty." });
    }
    if (!item.context.title.trim() || item.context.columns.length === 0 || item.context.rows.length === 0) {
      issues.push({ questionId: item.id, message: "Practice question context is incomplete." });
    }
    if (!item.solution.canonicalAnswer.trim() || !item.solution.explanation.trim() || item.solution.steps.length === 0) {
      issues.push({ questionId: item.id, message: "Practice question solution is incomplete." });
    }

    if (["multiple-choice", "scenario-selection", "formula-comparison"].includes(item.type)) {
      if (!item.options || item.options.length < 2) {
        issues.push({ questionId: item.id, message: "Selection question needs at least two options." });
      }
      if (!item.correctOption || !item.options?.includes(item.correctOption)) {
        issues.push({ questionId: item.id, message: "Selection question has no valid correct option." });
      }
    }
    if (["fill-blank", "formula-writing"].includes(item.type) && !item.acceptedAnswers?.length) {
      issues.push({ questionId: item.id, message: "Written-answer question needs accepted answers." });
    }
  }

  const missingFormulaIds = formulas
    .map((formula) => formula.id)
    .filter((id) => !covered.has(id));
  for (const id of missingFormulaIds) {
    issues.push({ message: `Formula has no practice coverage: ${id}.` });
  }

  return {
    valid: issues.length === 0,
    issues,
    coveredFormulaIds: formulas.map((formula) => formula.id).filter((id) => covered.has(id)),
    missingFormulaIds,
  };
}

export const formulaPracticeValidation = validateFormulaPracticeQuestions();

export function normalizeFormulaAnswer(value: string): string {
  return value.trim().replace(/\s+/g, "").toLowerCase();
}

export function validateFormulaPracticeAnswer(
  item: FormulaPracticeQuestion,
  answer: string,
): boolean {
  if (["multiple-choice", "scenario-selection", "formula-comparison"].includes(item.type)) {
    return Boolean(item.correctOption && answer === item.correctOption);
  }

  const normalized = normalizeFormulaAnswer(answer);
  return Boolean(item.acceptedAnswers?.some((accepted) => normalizeFormulaAnswer(accepted) === normalized));
}
