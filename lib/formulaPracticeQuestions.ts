import { formulas } from "@/lib/formulas";

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

export type FormulaPracticeQuestion = {
  id: string;
  formulaId: string;
  type: FormulaPracticeQuestionType;
  prompt: string;
  options?: string[];
  acceptedAnswers?: string[];
  correctOption?: string;
  explanation: string;
  difficulty?: FormulaPracticeDifficulty;
};

const question = (
  item: Omit<FormulaPracticeQuestion, "id"> & { id?: string },
): FormulaPracticeQuestion => ({
  ...item,
  id: item.id ?? `${item.formulaId}-practice-1`,
});

/**
 * Formula-specific exercises intentionally reference the canonical formula
 * records by ID. They do not duplicate formula content or create learning
 * completion state.
 */
export const formulaPracticeQuestions: FormulaPracticeQuestion[] = [
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
