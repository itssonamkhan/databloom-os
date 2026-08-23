import type { PowerBIDifficulty, PowerBILesson } from "@/lib/powerBILessons";

export type DAXFormula = { id: string; name: string; category: string; difficulty: PowerBIDifficulty; purpose: string; syntax: string; explanation: string; example: string; memoryTrick: string; commonMistake: string; };
const daxExplanations: Record<string, string> = {
  sum: "SUM adds the values in Revenue within the current filter context, so the result changes when a report is filtered by date, region, or product.",
  sumx: "SUMX evaluates Quantity multiplied by UnitPrice for each Sales row and then adds those row-level results, which is useful when the total is not stored in one column.",
  average: "AVERAGE returns the arithmetic mean of nonblank Revenue values in the current context; it does not calculate an average of already aggregated totals.",
  count: "COUNT counts nonblank numeric values in Quantity. It is not appropriate for a text identifier such as OrderID, where COUNTA or DISTINCTCOUNT may be needed instead.",
  countrows: "COUNTROWS returns the number of rows in Sales or another table expression after the current filters have been applied.",
  distinctcount: "DISTINCTCOUNT counts each Customer value once in the current context, so repeat purchases do not inflate the customer total.",
  calculate: "CALCULATE evaluates an expression after modifying filter context, allowing the same Revenue measure to be evaluated specifically for the West region.",
  filter: "FILTER returns the rows that meet a condition. It is commonly passed into CALCULATE to turn a filtered table into a scalar measure result.",
  all: "ALL removes the selected Region filter from the denominator, making it possible to compare the current revenue with the all-region total.",
  related: "RELATED retrieves the matching Product[Category] from the one-side table when a valid relationship and row context are available.",
  divide: "DIVIDE safely handles a zero or blank denominator and returns the supplied alternate result instead of an error.",
  if: "IF evaluates one condition and returns the first result when it is true or the second result when it is false.",
  switch: "SWITCH(TRUE()) evaluates conditions in order, returning the first matching band and an explicit fallback for all other rows.",
  date: "DATE constructs a real date value from separate year, month, and day numbers so it can be used consistently in the model calendar.",
  year: "YEAR extracts the four-digit calendar year from a date, which can be used for grouping or comparisons.",
  month: "MONTH extracts the month number from a date; pair it with a month name and sort column when displaying calendar labels.",
  today: "TODAY returns the current date at refresh time, so calculations using it change as the dataset refreshes.",
  totalytd: "TOTALYTD accumulates an expression from the start of the year through the latest date in the current date context.",
  sameperiodlastyear: "SAMEPERIODLASTYEAR shifts the current date set back one year, enabling a like-for-like prior-year comparison when a marked date table is used.",
};
const dax = (id:string,name:string,category:string,difficulty:PowerBIDifficulty,purpose:string,syntax:string,example:string):DAXFormula => ({id,name,category,difficulty,purpose,syntax,example,explanation:daxExplanations[id] ?? `${name} ${purpose.toLowerCase()} It is most useful when the model relationships and field types are already correct.`,memoryTrick:`${name}: ${purpose}`,commonMistake:"Using the formula before checking filter context, relationships, or data types."});
export const daxFormulas:DAXFormula[] = [
  dax("sum","SUM","Aggregation","Beginner","Adds every value in one numeric column.","SUM(Sales[Revenue])","Total Revenue = SUM(Sales[Revenue])"),
  dax("sumx","SUMX","Aggregation","Intermediate","Evaluates an expression row by row, then adds the results.","SUMX(table, expression)","Revenue = SUMX(Sales, Sales[Quantity] * Sales[UnitPrice])"),
  dax("average","AVERAGE","Aggregation","Beginner","Returns the arithmetic mean of a numeric column.","AVERAGE(Sales[Revenue])","Average Sale = AVERAGE(Sales[Revenue])"),
  dax("count","COUNT","Aggregation","Beginner","Counts nonblank numeric values in a column.","COUNT(Sales[Quantity])","Order Quantity Rows = COUNT(Sales[Quantity])"),
  dax("countrows","COUNTROWS","Aggregation","Beginner","Counts rows in a table or table expression.","COUNTROWS(Sales)","Orders = COUNTROWS(Sales)"),
  dax("distinctcount","DISTINCTCOUNT","Aggregation","Beginner","Counts unique values in a column.","DISTINCTCOUNT(Sales[Customer])","Customers = DISTINCTCOUNT(Sales[Customer])"),
  dax("calculate","CALCULATE","Filter Context","Intermediate","Evaluates an expression under changed filters.","CALCULATE(expression, filter)","West Revenue = CALCULATE([Revenue], Sales[Region] = \"West\")"),
  dax("filter","FILTER","Filter Context","Intermediate","Returns rows that meet a condition.","FILTER(table, condition)","Large Sales Revenue = CALCULATE([Revenue], FILTER(Sales, Sales[Revenue] > 1000))"),
  dax("all","ALL","Filter Context","Intermediate","Removes filters from a table or column.","ALL(table_or_column)","Share = DIVIDE([Revenue], CALCULATE([Revenue], ALL(Sales[Region])))"),
  dax("related","RELATED","Relationships","Intermediate","Fetches one value through an existing relationship.","RELATED(Product[Category])","Category = RELATED(Product[Category])"),
  dax("divide","DIVIDE","Logical & Math","Beginner","Divides safely with an optional alternate result.","DIVIDE(numerator, denominator, alternate)","Margin = DIVIDE([Profit], [Revenue], 0)"),
  dax("if","IF","Logical & Math","Beginner","Returns one result for true and another for false.","IF(condition, true_result, false_result)","Status = IF([Revenue] >= 1000, \"High\", \"Standard\")"),
  dax("switch","SWITCH","Logical & Math","Intermediate","Matches one expression against several outcomes.","SWITCH(expression, value, result, else)","Band = SWITCH(TRUE(), [Revenue] > 1000, \"High\", \"Other\")"),
  dax("date","DATE","Date & Time","Beginner","Builds a date from year, month, and day.","DATE(year, month, day)","Start Date = DATE(2026, 1, 1)"),
  dax("year","YEAR","Date & Time","Beginner","Extracts the year number from a date.","YEAR(date)","Order Year = YEAR(Sales[OrderDate])"),
  dax("month","MONTH","Date & Time","Beginner","Extracts the month number from a date.","MONTH(date)","Order Month = MONTH(Sales[OrderDate])"),
  dax("today","TODAY","Date & Time","Beginner","Returns the current date.","TODAY()","AsOfDate = TODAY()"),
  dax("totalytd","TOTALYTD","Time Intelligence","Advanced","Calculates a year-to-date total.","TOTALYTD(expression, dates)","Revenue YTD = TOTALYTD([Revenue], 'Date'[Date])"),
  dax("sameperiodlastyear","SAMEPERIODLASTYEAR","Time Intelligence","Advanced","Shifts the current date period back one year.","SAMEPERIODLASTYEAR(dates)","Revenue LY = CALCULATE([Revenue], SAMEPERIODLASTYEAR('Date'[Date]))"),
];
export const daxCategories = Array.from(new Set(daxFormulas.map((item) => item.category)));
export const daxToLesson = (formula:DAXFormula):PowerBILesson => ({id:`dax-${formula.id}`,title:formula.name,icon:"ƒx",category:`DAX · ${formula.category}`,difficulty:formula.difficulty,description:formula.purpose,explanation:formula.explanation,steps:["Create or select a measure.",`Enter ${formula.syntax}.`,"Replace example names with fields from your model.","Check the result under more than one filter."],example:formula.example,memoryTrick:formula.memoryTrick,whenToUse:[formula.purpose,"When a report needs a reusable model calculation."],commonMistakes:[formula.commonMistake,"Creating a calculated column when a measure is more appropriate."],interviewQuestions:[`What does ${formula.name} return?`,`How does filter context affect ${formula.name}?`],practiceTask:`Choose the correct DAX pattern for this purpose: ${formula.purpose}`,acceptedAnswers:[formula.name,formula.syntax,formula.example],hint:`The formula name is ${formula.name}.`,xpReward:formula.difficulty === "Beginner" ? 20 : formula.difficulty === "Intermediate" ? 30 : 40,relatedLessons:[]});
export const daxLessons = daxFormulas.map(daxToLesson);
export const getDAXLesson = (id:string) => daxLessons.find((item) => item.id === id);
