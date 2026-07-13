export type Formula = {
  id: string;
  name: string;
  category: string;
  difficulty: string;

  purpose: string;

  syntax: string;

  arguments: string[];

  howToUse: string[];

  whenToUse: string[];

  avoidWhen: string;

  example: string;

  memory: string;

  interviewQuestions: string[];

  flashcard: {
    front: string;
    back: string;
  };
};


export const formulas: Formula[] = [
    {
  id: "sum",
  name: "SUM",
  category: "Beginner Foundation",
  difficulty: "⭐ Beginner",
  purpose: "Adds numbers together quickly.",
  syntax: "=SUM(range)",
  arguments: [
    "range → Cells containing numbers to add"
  ],
  howToUse: [
    "Select the cells you want to add.",
    "Excel calculates the total automatically."
  ],
  whenToUse: [
    "Total sales",
    "Total expenses",
    "Monthly reports"
  ],
  avoidWhen: "When you need conditions while adding. Use SUMIF/SUMIFS.",
  example: "Calculate total sales from B2:B100.",
  memory: "SUM = Simply add everything.",
  interviewQuestions: [
    "Difference between SUM and SUMIF?",
    "Why use SUM instead of manual addition?"
  ],
  flashcard: {
    front: "What does SUM do?",
    back: "It adds numbers from selected cells."
  }
},


{
  id: "if",
  name: "IF",
  category: "Logical Functions",
  difficulty: "⭐⭐ Beginner",
  purpose: "Makes decisions based on a condition.",
  syntax: "=IF(logical_test,value_if_true,value_if_false)",
  arguments: [
    "logical_test → Condition to check",
    "value_if_true → Result when true",
    "value_if_false → Result when false"
  ],
  howToUse: [
    "Create a condition.",
    "Give Excel results for true and false."
  ],
  whenToUse: [
    "Pass/Fail",
    "Target achievement",
    "Status creation"
  ],
  avoidWhen: "When there are many conditions. Use IFS.",
  example: "If sales are above 50000 show Target Achieved.",
  memory: "IF = If this happens, do this.",
  interviewQuestions: [
    "Explain IF with a business example.",
    "Difference between IF and IFS?"
  ],
  flashcard: {
    front: "Why is IF used?",
    back: "To return different results based on conditions."
  }
},


{
  id: "count",
  name: "COUNT",
  category: "Beginner Foundation",
  difficulty: "⭐ Beginner",
  purpose: "Counts cells containing numbers.",
  syntax: "=COUNT(value1,[value2],...)",
  arguments: [
    "value → Numbers or cell references"
  ],
  howToUse: [
    "Select the numeric range."
  ],
  whenToUse: [
    "Count transactions",
    "Count numerical records"
  ],
  avoidWhen: "When counting text values. Use COUNTA.",
  example: "Count number of sales entries.",
  memory: "COUNT = Count numbers only.",
  interviewQuestions: [
    "Difference between COUNT and COUNTA?"
  ],
  flashcard: {
    front: "Does COUNT count text?",
    back: "No, COUNT counts numbers only."
  }
},


{
  id: "counta",
  name: "COUNTA",
  category: "Beginner Foundation",
  difficulty: "⭐ Beginner",
  purpose: "Counts all non-empty cells.",
  syntax: "=COUNTA(range)",
  arguments: [
    "range → Cells to check"
  ],
  howToUse: [
    "Select the data range."
  ],
  whenToUse: [
    "Count customers",
    "Count filled records"
  ],
  avoidWhen: "When you only need numbers.",
  example: "Count total customer entries.",
  memory: "COUNTA = Count Anything filled.",
  interviewQuestions: [
    "COUNT vs COUNTA?"
  ],
  flashcard: {
    front: "What does COUNTA count?",
    back: "All non-empty cells."
  }
},


{
  id: "countif",
  name: "COUNTIF",
  category: "Conditional Analysis",
  difficulty: "⭐⭐ Intermediate",
  purpose: "Counts cells matching one condition.",
  syntax: "=COUNTIF(range,criteria)",
  arguments: [
    "range → Where Excel checks",
    "criteria → Condition"
  ],
  howToUse: [
    "Select the range.",
    "Enter the condition."
  ],
  whenToUse: [
    "Count specific products",
    "Count employees by category"
  ],
  avoidWhen: "Multiple conditions are needed. Use COUNTIFS.",
  example: "Count orders from Jaipur.",
  memory: "COUNTIF = Count if rule matches.",
  interviewQuestions: [
    "How do you count values above a limit?"
  ],
  flashcard: {
    front: "COUNTIF is used for?",
    back: "Counting values based on one condition."
  }
},


{
  id: "countifs",
  name: "COUNTIFS",
  category: "Conditional Analysis",
  difficulty: "⭐⭐⭐ Intermediate",
  purpose: "Counts values matching multiple conditions.",
  syntax: "=COUNTIFS(criteria_range1,criteria1,criteria_range2,criteria2)",
  arguments: [
    "criteria_range → Range to check",
    "criteria → Rule to match"
  ],
  howToUse: [
    "Add multiple conditions.",
    "Excel counts only matching rows."
  ],
  whenToUse: [
    "Sales analysis",
    "Employee reports",
    "Multiple filters"
  ],
  avoidWhen: "Only one condition is required.",
  example: "Count sales from Jaipur in January.",
  memory: "COUNTIFS = Count with many rules.",
  interviewQuestions: [
    "Explain COUNTIFS with a dataset."
  ],
  flashcard: {
    front: "COUNTIFS handles what?",
    back: "Multiple conditions together."
  }
},
{
  id: "min",
  name: "MIN",
  category: "Statistical Functions",
  difficulty: "⭐ Beginner",

  purpose:
    "Returns the smallest value from a range.",

  syntax:
    "=MIN(range)",

  arguments:[
    "range → Cells containing numbers"
  ],

  howToUse:[
    "Select the numerical range.",
    "Excel returns the lowest value."
  ],

  whenToUse:[
    "Find lowest sales",
    "Minimum score",
    "Smallest value analysis"
  ],

  avoidWhen:
    "You need the lowest value with conditions.",

  example:
    "Find the lowest monthly revenue.",

  memory:
    "MIN = Minimum value.",

  interviewQuestions:[
    "How do you find the smallest value in Excel?"
  ],

  flashcard:{
    front:
      "What does MIN return?",
    back:
      "The smallest number in a range."
  }
},


{
  id:"max",
  name:"MAX",
  category:"Statistical Functions",
  difficulty:"⭐ Beginner",

  purpose:
    "Returns the largest value from a range.",

  syntax:
    "=MAX(range)",

  arguments:[
    "range → Cells containing numbers"
  ],

  howToUse:[
    "Select numerical values.",
    "Excel finds the highest value."
  ],

  whenToUse:[
    "Highest sales",
    "Maximum score",
    "Peak performance"
  ],

  avoidWhen:
    "You need the highest value with conditions.",

  example:
    "Find the highest selling product.",

  memory:
    "MAX = Maximum value.",

  interviewQuestions:[
    "How do you identify top values in Excel?"
  ],

  flashcard:{
    front:
      "What does MAX return?",
    back:
      "The largest number in a range."
  }
},


{
  id:"round",
  name:"ROUND",
  category:"Number Formatting",
  difficulty:"⭐ Beginner",

  purpose:
    "Rounds a number to a specific number of digits.",

  syntax:
    "=ROUND(number,num_digits)",

  arguments:[
    "number → Value to round",
    "num_digits → Decimal places required"
  ],

  howToUse:[
    "Select the number.",
    "Choose decimal places."
  ],

  whenToUse:[
    "Reports",
    "Financial calculations",
    "Clean presentation"
  ],

  avoidWhen:
    "You need only upward or downward rounding."
,

  example:
    "Round 123.456 to 123.46.",

  memory:
    "ROUND = Normal rounding.",

  interviewQuestions:[
    "Difference between ROUND, ROUNDUP and ROUNDDOWN?"
  ],

  flashcard:{
    front:
      "What does ROUND do?",
    back:
      "Rounds a number to selected digits."
  }
},


{
  id:"roundup",
  name:"ROUNDUP",
  category:"Number Formatting",
  difficulty:"⭐ Beginner",

  purpose:
    "Always rounds a number upward.",

  syntax:
    "=ROUNDUP(number,num_digits)",

  arguments:[
    "number → Value to round",
    "num_digits → Decimal places"
  ],

  howToUse:[
    "Select value.",
    "Choose required digits."
  ],

  whenToUse:[
    "Pricing",
    "Estimations",
    "Always increasing values"
  ],

  avoidWhen:
    "Normal rounding is required."
,

  example:
    "Round 12.31 upward to 12.4.",

  memory:
    "ROUNDUP = Always go higher.",

  interviewQuestions:[
    "When would you use ROUNDUP in business?"
  ],

  flashcard:{
    front:
      "Does ROUNDUP go down?",
    back:
      "No, it always rounds upward."
  }
},


{
  id:"rounddown",
  name:"ROUNDDOWN",
  category:"Number Formatting",
  difficulty:"⭐ Beginner",

  purpose:
    "Always rounds a number downward.",

  syntax:
    "=ROUNDDOWN(number,num_digits)",

  arguments:[
    "number → Value to round",
    "num_digits → Decimal places"
  ],

  howToUse:[
    "Select the number.",
    "Specify decimal places."
  ],

  whenToUse:[
    "Conservative calculations",
    "Removing extra decimals"
  ],

  avoidWhen:
    "You need standard rounding."
,

  example:
    "Round 12.89 down to 12.8.",

  memory:
    "ROUNDDOWN = Always go lower.",

  interviewQuestions:[
    "Difference between ROUNDUP and ROUNDDOWN?"
  ],

  flashcard:{
    front:
      "What does ROUNDDOWN do?",
    back:
      "It always reduces the value while rounding."
  }
},
{
  id:"xlookup",
  name:"XLOOKUP",
  category:"Lookup & Reference",
  difficulty:"⭐⭐⭐⭐⭐ Essential Data Analyst Formula",

  purpose:
    "Finds a value from a table and returns the related information. It can search in any direction.",

  syntax:
    "=XLOOKUP(lookup_value,lookup_array,return_array,[if_not_found],[match_mode],[search_mode])",

  arguments:[
    "lookup_value → The value you are searching for",
    "lookup_array → Where Excel searches",
    "return_array → The value Excel returns",
    "if_not_found → Message if no match exists",
    "match_mode → Type of matching",
    "search_mode → Search direction"
  ],

  howToUse:[
    "Choose the value you want to find.",
    "Select the column where Excel searches.",
    "Select the column containing the answer."
  ],

  whenToUse:[
    "Employee ID to Salary",
    "Customer lookup",
    "Inventory search",
    "Sales analysis"
  ],

  avoidWhen:
    "Large complex calculations where database tools are better.",

  example:
    "Find employee salary using Employee ID.",

  memory:
    "XLOOKUP = Find X and bring back its information.",

  interviewQuestions:[
    "Why is XLOOKUP better than VLOOKUP?",
    "Can XLOOKUP search left?"
  ],

  flashcard:{
    front:
      "Why is XLOOKUP popular?",
    back:
      "It can search in any direction and is easier than older lookup formulas."
  }
},


{
  id:"index",
  name:"INDEX",
  category:"Lookup & Reference",
  difficulty:"⭐⭐⭐ Intermediate",

  purpose:
    "Returns a value from a specific position in a range.",

  syntax:
    "=INDEX(array,row_num,[column_num])",

  arguments:[
    "array → Data range",
    "row_num → Row position",
    "column_num → Column position"
  ],

  howToUse:[
    "Select the table.",
    "Provide the row and column position."
  ],

  whenToUse:[
    "Advanced lookups",
    "Dynamic reports",
    "Large datasets"
  ],

  avoidWhen:
    "A simple XLOOKUP solves the problem."
,

  example:
    "Return the value from row 5 column 3.",

  memory:
    "INDEX = Give me the value at this position.",

  interviewQuestions:[
    "What is the purpose of INDEX function?"
  ],

  flashcard:{
    front:
      "What does INDEX return?",
    back:
      "A value from a specified position."
  }
},


{
  id:"match",
  name:"MATCH",
  category:"Lookup & Reference",
  difficulty:"⭐⭐⭐ Intermediate",

  purpose:
    "Finds the position of a value inside a range.",

  syntax:
    "=MATCH(lookup_value,lookup_array,[match_type])",

  arguments:[
    "lookup_value → Value to find",
    "lookup_array → Range to search",
    "match_type → Type of matching"
  ],

  howToUse:[
    "Provide the value.",
    "Select the search range.",
    "Excel returns its position."
  ],

  whenToUse:[
    "Finding positions",
    "Dynamic formulas",
    "Combining with INDEX"
  ],

  avoidWhen:
    "You only need the actual value. Use XLOOKUP."
,

  example:
    "Find the position of Product A in a list.",

  memory:
    "MATCH = Where is it located?",

  interviewQuestions:[
    "What does MATCH return?",
    "Why combine INDEX and MATCH?"
  ],

  flashcard:{
    front:
      "What does MATCH give?",
    back:
      "The position number of a value."
  }
},


{
  id:"index-match",
  name:"INDEX + MATCH",
  category:"Lookup & Reference",
  difficulty:"⭐⭐⭐⭐ Advanced",

  purpose:
    "A powerful lookup combination used before XLOOKUP.",

  syntax:
    "=INDEX(return_range,MATCH(value,lookup_range,0))",

  arguments:[
    "INDEX → Returns the final value",
    "MATCH → Finds the position"
  ],

  howToUse:[
    "MATCH finds where the value exists.",
    "INDEX returns the related information."
  ],

  whenToUse:[
    "Advanced Excel interviews",
    "Flexible lookups",
    "Older Excel versions"
  ],

  avoidWhen:
    "XLOOKUP is available and simpler."
,

  example:
    "Find employee department using employee ID.",

  memory:
    "MATCH finds the place, INDEX brings the answer.",

  interviewQuestions:[
    "Explain INDEX MATCH in an interview.",
    "INDEX MATCH vs VLOOKUP?"
  ],

  flashcard:{
    front:
      "What is the role of MATCH in INDEX MATCH?",
    back:
      "It finds the position of the required value."
  }
},
{
  id:"left",
  name:"LEFT",
  category:"Text Cleaning",
  difficulty:"⭐ Beginner",

  purpose:
    "Extracts characters from the beginning of a text value.",

  syntax:
    "=LEFT(text,[num_chars])",

  arguments:[
    "text → Original text",
    "num_chars → Number of characters to extract"
  ],

  howToUse:[
    "Select the text cell.",
    "Mention how many characters you need."
  ],

  whenToUse:[
    "Extract codes",
    "Clean IDs",
    "Separate prefixes"
  ],

  avoidWhen:
    "The required text is not at the beginning.",

  example:
    "Extract IND from IND1025.",

  memory:
    "LEFT = Take from the left side.",

  interviewQuestions:[
    "How do you extract first characters from a column?"
  ],

  flashcard:{
    front:
      "LEFT extracts from where?",
    back:
      "From the beginning of text."
  }
},


{
  id:"right",
  name:"RIGHT",
  category:"Text Cleaning",
  difficulty:"⭐ Beginner",

  purpose:
    "Extracts characters from the end of a text value.",

  syntax:
    "=RIGHT(text,[num_chars])",

  arguments:[
    "text → Original text",
    "num_chars → Number of characters"
  ],

  howToUse:[
    "Select the text.",
    "Specify characters required from the end."
  ],

  whenToUse:[
    "Extract last digits",
    "Extract file extensions",
    "Clean codes"
  ],

  avoidWhen:
    "The value position changes.",

  example:
    "Extract 2026 from EMP2026.",

  memory:
    "RIGHT = Take from the right side.",

  interviewQuestions:[
    "Difference between LEFT and RIGHT?"
  ],

  flashcard:{
    front:
      "RIGHT extracts from where?",
    back:
      "From the end of text."
  }
},


{
  id:"mid",
  name:"MID",
  category:"Text Cleaning",
  difficulty:"⭐⭐ Intermediate",

  purpose:
    "Extracts characters from the middle of text.",

  syntax:
    "=MID(text,start_num,num_chars)",

  arguments:[
    "text → Original text",
    "start_num → Starting position",
    "num_chars → Number of characters"
  ],

  howToUse:[
    "Find the starting position.",
    "Select required characters."
  ],

  whenToUse:[
    "Extract codes from IDs",
    "Split combined information"
  ],

  avoidWhen:
    "The position is unpredictable.",

  example:
    "Extract 2026 from INV2026IND.",

  memory:
    "MID = Middle extraction.",

  interviewQuestions:[
    "How is MID different from LEFT and RIGHT?"
  ],

  flashcard:{
    front:
      "What does MID require?",
    back:
      "Starting position and number of characters."
  }
},


{
  id:"len",
  name:"LEN",
  category:"Text Cleaning",
  difficulty:"⭐ Beginner",

  purpose:
    "Counts the number of characters in text.",

  syntax:
    "=LEN(text)",

  arguments:[
    "text → Text value"
  ],

  howToUse:[
    "Select the text cell.",
    "Excel counts characters."
  ],

  whenToUse:[
    "Data quality checks",
    "Find incorrect IDs",
    "Text analysis"
  ],

  avoidWhen:
    "You need to remove spaces. Use TRIM.",

  example:
    "Check if customer ID has correct length.",

  memory:
    "LEN = Length of text.",

  interviewQuestions:[
    "How do you find text length?"
  ],

  flashcard:{
    front:
      "What does LEN count?",
    back:
      "Number of characters in text."
  }
},


{
  id:"trim",
  name:"TRIM",
  category:"Data Cleaning",
  difficulty:"⭐⭐⭐ Data Analyst Essential",

  purpose:
    "Removes extra spaces from text.",

  syntax:
    "=TRIM(text)",

  arguments:[
    "text → Text containing unwanted spaces"
  ],

  howToUse:[
    "Apply TRIM to messy imported data."
  ],

  whenToUse:[
    "Cleaning customer names",
    "Before lookup formulas",
    "Removing extra spaces"
  ],

  avoidWhen:
    "Spaces are meaningful."
,

  example:
    "Convert '  Excel  ' into 'Excel'.",

  memory:
    "TRIM = Remove unnecessary spaces.",

  interviewQuestions:[
    "Why use TRIM before XLOOKUP?"
  ],

  flashcard:{
    front:
      "Why is TRIM important?",
    back:
      "It cleans extra spaces that can break matching."
  }
},
{
  id:"text",
  name:"TEXT",
  category:"Text Formatting",
  difficulty:"⭐⭐ Intermediate",

  purpose:
    "Converts numbers or dates into a custom text format.",

  syntax:
    "=TEXT(value,format_text)",

  arguments:[
    "value → Number/date to format",
    "format_text → Required display format"
  ],

  howToUse:[
    "Select the value.",
    "Enter the format you want."
  ],

  whenToUse:[
    "Dashboard labels",
    "Custom dates",
    "Professional reports"
  ],

  avoidWhen:
    "You need the value for calculations after formatting.",

  example:
    "Convert date into January 2026 format.",

  memory:
    "TEXT = Make data look beautiful.",

  interviewQuestions:[
    "Why does TEXT convert values into text?",
    "Can formatted TEXT values be calculated?"
  ],

  flashcard:{
    front:
      "What does TEXT do?",
    back:
      "Changes how a value is displayed."
  }
},


{
  id:"concat",
  name:"CONCAT",
  category:"Text Combining",
  difficulty:"⭐ Beginner",

  purpose:
    "Combines multiple text values into one.",

  syntax:
    "=CONCAT(text1,text2,...)",

  arguments:[
    "text values you want to combine"
  ],

  howToUse:[
    "Select multiple text cells.",
    "Excel joins them together."
  ],

  whenToUse:[
    "Creating full names",
    "Combining IDs",
    "Making labels"
  ],

  avoidWhen:
    "You need separators between many values. Use TEXTJOIN.",

  example:
    "Combine First Name and Last Name.",

  memory:
    "CONCAT = Connect text.",

  interviewQuestions:[
    "Difference between CONCAT and TEXTJOIN?"
  ],

  flashcard:{
    front:
      "What is CONCAT used for?",
    back:
      "Joining multiple text values."
  }
},


{
  id:"concatenate",
  name:"CONCATENATE",
  category:"Text Combining",
  difficulty:"⭐ Beginner",

  purpose:
    "Older Excel function used to join text values.",

  syntax:
    "=CONCATENATE(text1,text2,...)",

  arguments:[
    "Text values to combine"
  ],

  howToUse:[
    "Select the values you want to merge."
  ],

  whenToUse:[
    "Working with old Excel files"
  ],

  avoidWhen:
    "Modern Excel is available. Use CONCAT."
,

  example:
    "Create a complete customer name.",

  memory:
    "CONCATENATE = Old way of connecting.",

  interviewQuestions:[
    "Why was CONCAT introduced after CONCATENATE?"
  ],

  flashcard:{
    front:
      "Is CONCATENATE the modern function?",
    back:
      "No, CONCAT is the newer replacement."
  }
},


{
  id:"textjoin",
  name:"TEXTJOIN",
  category:"Text Combining",
  difficulty:"⭐⭐⭐ Intermediate",

  purpose:
    "Combines text with a chosen separator.",

  syntax:
    "=TEXTJOIN(delimiter,ignore_empty,text1,...)",

  arguments:[
    "delimiter → Symbol between texts",
    "ignore_empty → Ignore blank cells",
    "text → Values to combine"
  ],

  howToUse:[
    "Choose a separator.",
    "Select text values."
  ],

  whenToUse:[
    "Creating sentences",
    "Combining lists",
    "Dashboard labels"
  ],

  avoidWhen:
    "Only two values need joining."
,

  example:
    "Combine city names separated by commas.",

  memory:
    "TEXTJOIN = Join text with style.",

  interviewQuestions:[
    "Why is TEXTJOIN better than CONCAT?"
  ],

  flashcard:{
    front:
      "What extra feature does TEXTJOIN provide?",
    back:
      "It adds separators and ignores blanks."
  }
},
{
  id:"today",
  name:"TODAY",
  category:"Date & Time",
  difficulty:"⭐ Beginner",

  purpose:
    "Returns the current date automatically.",

  syntax:
    "=TODAY()",

  arguments:[
    "No arguments required"
  ],

  howToUse:[
    "Enter the formula in a cell.",
    "Excel automatically displays today's date."
  ],

  whenToUse:[
    "Daily reports",
    "Age calculations",
    "Date tracking"
  ],

  avoidWhen:
    "You need a fixed date that should not update.",

  example:
    "Display today's report date.",

  memory:
    "TODAY = Current date.",

  interviewQuestions:[
    "How can Excel automatically show today's date?"
  ],

  flashcard:{
    front:
      "Does TODAY need arguments?",
    back:
      "No, it automatically returns the current date."
  }
},


{
  id:"now",
  name:"NOW",
  category:"Date & Time",
  difficulty:"⭐ Beginner",

  purpose:
    "Returns the current date and time.",

  syntax:
    "=NOW()",

  arguments:[
    "No arguments required"
  ],

  howToUse:[
    "Enter NOW in a cell.",
    "Excel provides live timestamp."
  ],

  whenToUse:[
    "Time tracking",
    "Report timestamps",
    "Activity logs"
  ],

  avoidWhen:
    "You only need date. Use TODAY."
,

  example:
    "Record when a report was generated.",

  memory:
    "NOW = Date + Time.",

  interviewQuestions:[
    "Difference between TODAY and NOW?"
  ],

  flashcard:{
    front:
      "What does NOW return?",
    back:
      "Current date and current time."
  }
},


{
  id:"year",
  name:"YEAR",
  category:"Date & Time",
  difficulty:"⭐ Beginner",

  purpose:
    "Extracts the year from a date.",

  syntax:
    "=YEAR(date)",

  arguments:[
    "date → Date value"
  ],

  howToUse:[
    "Select a date cell.",
    "Excel returns only the year."
  ],

  whenToUse:[
    "Year-wise analysis",
    "Annual reports",
    "Trend analysis"
  ],

  avoidWhen:
    "You need complete date information."
,

  example:
    "Extract 2026 from 15 March 2026.",

  memory:
    "YEAR = Pull the year.",

  interviewQuestions:[
    "How do you group data by year?"
  ],

  flashcard:{
    front:
      "What does YEAR extract?",
    back:
      "Only the year from a date."
  }
},


{
  id:"month",
  name:"MONTH",
  category:"Date & Time",
  difficulty:"⭐ Beginner",

  purpose:
    "Extracts the month number from a date.",

  syntax:
    "=MONTH(date)",

  arguments:[
    "date → Date value"
  ],

  howToUse:[
    "Select a date.",
    "Excel returns month number."
  ],

  whenToUse:[
    "Monthly sales analysis",
    "Seasonal trends",
    "Reports"
  ],

  avoidWhen:
    "You need month name instead of number."
,

  example:
    "Extract month from invoice date.",

  memory:
    "MONTH = Pull the month.",

  interviewQuestions:[
    "How do you analyse monthly trends?"
  ],

  flashcard:{
    front:
      "What does MONTH return?",
    back:
      "The month number from a date."
  }
},


{
  id:"day",
  name:"DAY",
  category:"Date & Time",
  difficulty:"⭐ Beginner",

  purpose:
    "Extracts the day number from a date.",

  syntax:
    "=DAY(date)",

  arguments:[
    "date → Date value"
  ],

  howToUse:[
    "Select the date cell.",
    "Excel returns the day."
  ],

  whenToUse:[
    "Daily analysis",
    "Date breakdowns"
  ],

  avoidWhen:
    "You need month/year details."
,

  example:
    "Find the day from a transaction date.",

  memory:
    "DAY = Pull the day.",

  interviewQuestions:[
    "How do you separate date components?"
  ],

  flashcard:{
    front:
      "What does DAY return?",
    back:
      "The day number from a date."
  }
},
{
  id:"edate",
  name:"EDATE",
  category:"Date & Time",
  difficulty:"⭐⭐ Intermediate",

  purpose:
    "Calculates a date after adding or subtracting months.",

  syntax:
    "=EDATE(start_date,months)",

  arguments:[
    "start_date → Starting date",
    "months → Number of months to add or subtract"
  ],

  howToUse:[
    "Select the starting date.",
    "Enter number of months."
  ],

  whenToUse:[
    "Subscription dates",
    "Loan schedules",
    "Future planning"
  ],

  avoidWhen:
    "You need the last day of a month. Use EOMONTH.",

  example:
    "Find a date 6 months after joining date.",

  memory:
    "EDATE = Extend date by months.",

  interviewQuestions:[
    "How do you calculate future dates in Excel?"
  ],

  flashcard:{
    front:
      "What does EDATE add?",
    back:
      "Months to a date."
  }
},


{
  id:"eomonth",
  name:"EOMONTH",
  category:"Date & Time",
  difficulty:"⭐⭐ Intermediate",

  purpose:
    "Returns the last day of a month.",

  syntax:
    "=EOMONTH(start_date,months)",

  arguments:[
    "start_date → Starting date",
    "months → Months ahead or behind"
  ],

  howToUse:[
    "Select starting date.",
    "Choose month offset."
  ],

  whenToUse:[
    "Financial closing",
    "Monthly reports",
    "Billing cycles"
  ],

  avoidWhen:
    "You need a normal date calculation."
,

  example:
    "Find month end date for March.",

  memory:
    "EOMONTH = End Of Month.",

  interviewQuestions:[
    "How can you find month-end dates?"
  ],

  flashcard:{
    front:
      "What does EOMONTH return?",
    back:
      "The last date of a month."
  }
},


{
  id:"filter",
  name:"FILTER",
  category:"Dynamic Array",
  difficulty:"⭐⭐⭐⭐⭐ Essential",

  purpose:
    "Returns only data that matches a given condition.",

  syntax:
    "=FILTER(array,include,[if_empty])",

  arguments:[
    "array → Complete dataset",
    "include → Condition",
    "if_empty → Result if nothing matches"
  ],

  howToUse:[
    "Select the dataset.",
    "Create a condition.",
    "Excel returns matching rows."
  ],

  whenToUse:[
    "Interactive dashboards",
    "Data extraction",
    "Reports"
  ],

  avoidWhen:
    "Using old Excel versions without dynamic arrays."
,

  example:
    "Show only sales from Jaipur region.",

  memory:
    "FILTER = Keep only required data.",

  interviewQuestions:[
    "How is FILTER better than manual filtering?",
    "How can FILTER help dashboards?"
  ],

  flashcard:{
    front:
      "What does FILTER return?",
    back:
      "Only rows matching a condition."
  }
},


{
  id:"sort",
  name:"SORT",
  category:"Dynamic Array",
  difficulty:"⭐⭐⭐ Intermediate",

  purpose:
    "Sorts data automatically using a formula.",

  syntax:
    "=SORT(array,[sort_index],[sort_order],[by_col])",

  arguments:[
    "array → Data range",
    "sort_index → Column number",
    "sort_order → Ascending/descending"
  ],

  howToUse:[
    "Select data.",
    "Choose sorting preference."
  ],

  whenToUse:[
    "Rankings",
    "Reports",
    "Dashboards"
  ],

  avoidWhen:
    "You only need one manual sort."
,

  example:
    "Arrange sales from highest to lowest.",

  memory:
    "SORT = Arrange automatically.",

  interviewQuestions:[
    "Difference between SORT formula and normal sorting?"
  ],

  flashcard:{
    front:
      "Why use SORT?",
    back:
      "To create automatic sorted results."
  }
},


{
  id:"unique",
  name:"UNIQUE",
  category:"Dynamic Array",
  difficulty:"⭐⭐⭐ Intermediate",

  purpose:
    "Creates a list of unique values by removing duplicates.",

  syntax:
    "=UNIQUE(array,[by_col],[exactly_once])",

  arguments:[
    "array → Data range",
    "by_col → Compare columns",
    "exactly_once → Values appearing only once"
  ],

  howToUse:[
    "Select data containing duplicates.",
    "Excel creates a clean list."
  ],

  whenToUse:[
    "Customer lists",
    "Category lists",
    "Dropdown creation"
  ],

  avoidWhen:
    "Duplicates are important for analysis.",

  example:
    "Create unique product categories.",

  memory:
    "UNIQUE = Remove repeats.",

  interviewQuestions:[
    "How do you remove duplicates using formulas?"
  ],

  flashcard:{
    front:
      "What does UNIQUE do?",
    back:
      "Returns values without duplicates."
  }
},
{
  id:"sortby",
  name:"SORTBY",
  category:"Dynamic Array",
  difficulty:"⭐⭐⭐⭐ Advanced",

  purpose:
    "Sorts one range based on another range.",

  syntax:
    "=SORTBY(array,by_array1,[sort_order1],...)",

  arguments:[
    "array → Data to return",
    "by_array → Column used for sorting",
    "sort_order → Ascending or descending"
  ],

  howToUse:[
    "Select the complete dataset.",
    "Choose the column that controls sorting."
  ],

  whenToUse:[
    "Advanced dashboards",
    "Ranking reports",
    "Dynamic analysis"
  ],

  avoidWhen:
    "Simple sorting is enough. Use SORT.",

  example:
    "Sort employee names based on salary.",

  memory:
    "SORTBY = Sort using another column.",

  interviewQuestions:[
    "Difference between SORT and SORTBY?"
  ],

  flashcard:{
    front:
      "How is SORTBY different?",
    back:
      "It sorts using another range."
  }
},


{
  id:"sequence",
  name:"SEQUENCE",
  category:"Dynamic Array",
  difficulty:"⭐⭐⭐ Intermediate",

  purpose:
    "Generates a sequence of numbers automatically.",

  syntax:
    "=SEQUENCE(rows,[columns],[start],[step])",

  arguments:[
    "rows → Number of rows",
    "columns → Number of columns",
    "start → Starting value",
    "step → Difference between values"
  ],

  howToUse:[
    "Define rows and columns.",
    "Excel creates numbers automatically."
  ],

  whenToUse:[
    "Automatic numbering",
    "Date series",
    "Templates"
  ],

  avoidWhen:
    "A fixed list is enough.",

  example:
    "Generate numbers from 1 to 100.",

  memory:
    "SEQUENCE = Create a series.",

  interviewQuestions:[
    "How can you generate serial numbers dynamically?"
  ],

  flashcard:{
    front:
      "What does SEQUENCE create?",
    back:
      "Automatic number patterns."
  }
},


{
  id:"let",
  name:"LET",
  category:"Advanced Excel",
  difficulty:"⭐⭐⭐⭐ Advanced",

  purpose:
    "Creates variables inside formulas to simplify complex calculations.",

  syntax:
    "=LET(name1,value1,calculation)",

  arguments:[
    "name → Variable name",
    "value → Stored value",
    "calculation → Final result"
  ],

  howToUse:[
    "Store repeated calculations.",
    "Use names instead of repeating formulas."
  ],

  whenToUse:[
    "Complex formulas",
    "Improving readability",
    "Better performance"
  ],

  avoidWhen:
    "A simple formula works."
,

  example:
    "Store total sales and calculate profit percentage.",

  memory:
    "LET = Give a calculation a name.",

  interviewQuestions:[
    "Why use LET in Excel?"
  ],

  flashcard:{
    front:
      "What is LET used for?",
    back:
      "Making complex formulas shorter and cleaner."
  }
},


{
  id:"lambda",
  name:"LAMBDA",
  category:"Advanced Excel",
  difficulty:"⭐⭐⭐⭐⭐ Expert",

  purpose:
    "Creates your own custom Excel functions.",

  syntax:
    "=LAMBDA(parameter1,calculation)",

  arguments:[
    "parameter → Input value",
    "calculation → Function logic"
  ],

  howToUse:[
    "Create reusable calculations.",
    "Save them as custom functions."
  ],

  whenToUse:[
    "Advanced automation",
    "Custom business calculations"
  ],

  avoidWhen:
    "A normal Excel function already exists.",

  example:
    "Create a custom profit formula.",

  memory:
    "LAMBDA = Make your own function.",

  interviewQuestions:[
    "What are custom functions in Excel?"
  ],

  flashcard:{
    front:
      "What can LAMBDA create?",
    back:
      "Custom Excel functions."
  }
},


{
  id:"take",
  name:"TAKE",
  category:"Dynamic Array",
  difficulty:"⭐⭐⭐⭐ Advanced",

  purpose:
    "Returns selected rows or columns from a dataset.",

  syntax:
    "=TAKE(array,rows,[columns])",

  arguments:[
    "array → Source data",
    "rows → Number of rows",
    "columns → Number of columns"
  ],

  howToUse:[
    "Select dataset.",
    "Specify required rows or columns."
  ],

  whenToUse:[
    "Top records",
    "Dashboard summaries",
    "Quick extraction"
  ],

  avoidWhen:
    "Older Excel versions are used."
,

  example:
    "Show top 10 sales records.",

  memory:
    "TAKE = Take what you need.",

  interviewQuestions:[
    "How do you extract top records dynamically?"
  ],

  flashcard:{
    front:
      "What does TAKE return?",
    back:
      "Selected rows or columns."
  }
},
{
  id:"choosecols",
  name:"CHOOSECOLS",
  category:"Dynamic Array",
  difficulty:"⭐⭐⭐⭐ Advanced",

  purpose:
    "Returns only selected columns from a dataset.",

  syntax:
    "=CHOOSECOLS(array,col_num1,...)",

  arguments:[
    "array → Source dataset",
    "col_num → Column numbers to extract"
  ],

  howToUse:[
    "Select the full dataset.",
    "Mention the columns you need."
  ],

  whenToUse:[
    "Creating reports",
    "Removing unnecessary columns",
    "Dashboard preparation"
  ],

  avoidWhen:
    "Manual column selection is enough.",

  example:
    "Extract only Customer Name and Sales columns.",

  memory:
    "CHOOSECOLS = Choose required columns.",

  interviewQuestions:[
    "How can you extract selected columns dynamically?"
  ],

  flashcard:{
    front:
      "Why use CHOOSECOLS?",
    back:
      "To return only required columns."
  }
},


{
  id:"hstack",
  name:"HSTACK",
  category:"Dynamic Array",
  difficulty:"⭐⭐⭐⭐ Advanced",

  purpose:
    "Combines multiple arrays horizontally.",

  syntax:
    "=HSTACK(array1,array2,...)",

  arguments:[
    "array1,array2 → Data ranges to combine"
  ],

  howToUse:[
    "Select datasets.",
    "Excel places them side by side."
  ],

  whenToUse:[
    "Combining reports",
    "Building dashboards",
    "Merging columns"
  ],

  avoidWhen:
    "You need to combine rows. Use VSTACK.",

  example:
    "Combine customer details with sales data.",

  memory:
    "H = Horizontal = Side by side.",

  interviewQuestions:[
    "Difference between HSTACK and VSTACK?"
  ],

  flashcard:{
    front:
      "What does HSTACK do?",
    back:
      "Combines data horizontally."
  }
},


{
  id:"vstack",
  name:"VSTACK",
  category:"Dynamic Array",
  difficulty:"⭐⭐⭐⭐ Advanced",

  purpose:
    "Combines multiple arrays vertically.",

  syntax:
    "=VSTACK(array1,array2,...)",

  arguments:[
    "array1,array2 → Data ranges to combine"
  ],

  howToUse:[
    "Select multiple tables.",
    "Excel places them one below another."
  ],

  whenToUse:[
    "Combining monthly datasets",
    "Appending reports",
    "Merging tables"
  ],

  avoidWhen:
    "You need side-by-side data. Use HSTACK.",

  example:
    "Combine January and February sales tables.",

  memory:
    "V = Vertical = One below another.",

  interviewQuestions:[
    "When would you use VSTACK?"
  ],

  flashcard:{
    front:
      "What does VSTACK do?",
    back:
      "Combines data vertically."
  }
},
];