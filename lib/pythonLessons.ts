export type PythonDifficulty = "Beginner" | "Intermediate" | "Advanced";

export type PythonLesson = {
  id: string;
  title: string;
  icon: string;
  category: string;
  difficulty: PythonDifficulty;
  description: string;
  explanation: string;
  syntax: string;
  example: string;
  memoryTrick: string;
  whenToUse: string[];
  commonMistakes: string[];
  interviewQuestions: string[];
  practiceTask: string;
  acceptedAnswers: string[];
  hint: string;
  xpReward: number;
  relatedLessons: string[];
};

type Seed = Pick<
  PythonLesson,
  | "id"
  | "title"
  | "icon"
  | "category"
  | "difficulty"
  | "description"
  | "syntax"
  | "example"
  | "practiceTask"
  | "acceptedAnswers"
  | "hint"
> &
  Partial<
    Pick<
      PythonLesson,
      | "explanation"
      | "memoryTrick"
      | "whenToUse"
      | "commonMistakes"
      | "interviewQuestions"
      | "xpReward"
      | "relatedLessons"
    >
  >;

function lesson(seed: Seed): PythonLesson {
  const reward =
    seed.difficulty === "Beginner" ? 20 : seed.difficulty === "Intermediate" ? 30 : 40;

  return {
    ...seed,
    explanation:
      seed.explanation ??
      `${seed.title} is a practical Python building block. Data analysts use it to turn a clear instruction into repeatable code instead of editing data manually.`,
    memoryTrick:
      seed.memoryTrick ??
      `${seed.title}: write one clear instruction, inspect the result, then build the next step.`,
    whenToUse: seed.whenToUse ?? [
      "When a data task should be repeatable and easy to check.",
      "When working with analyst scripts, notebooks, or reusable transformations.",
    ],
    commonMistakes: seed.commonMistakes ?? [
      "Using the wrong capitalization—Python names are case-sensitive.",
      "Skipping a quick result check before continuing the workflow.",
    ],
    interviewQuestions: seed.interviewQuestions ?? [
      `What problem does ${seed.title} solve in Python?`,
      `How would you validate the result of ${seed.title.toLowerCase()}?`,
    ],
    xpReward: seed.xpReward ?? reward,
    relatedLessons: seed.relatedLessons ?? [],
  };
}

const seeds: Seed[] = [
  {
    id: "print-output", title: "Printing output", icon: "👋", category: "Python Fundamentals", difficulty: "Beginner",
    description: "Display a value so you can inspect what your code produced.", syntax: "print(value)", example: "print('Hello, DataBloom!')",
    practiceTask: "Print the text Hello, DataBloom!", acceptedAnswers: ["print('Hello, DataBloom!')", "print(\"Hello, DataBloom!\")"], hint: "Put the text inside quotes and parentheses.", relatedLessons: ["variables", "strings"],
  },
  {
    id: "variables", title: "Variables", icon: "🏷️", category: "Python Fundamentals", difficulty: "Beginner",
    description: "Give a value a meaningful name for reuse later.", syntax: "variable_name = value", example: "total_sales = 5400",
    practiceTask: "Store 5400 in a variable named total_sales.", acceptedAnswers: ["total_sales = 5400"], hint: "The name goes on the left of the equals sign.", relatedLessons: ["numbers", "data-types"],
  },
  {
    id: "data-types", title: "Core data types", icon: "🧱", category: "Python Fundamentals", difficulty: "Beginner",
    description: "Recognize strings, integers, floats, booleans, and missing values.", syntax: "type(value)", example: "type(1250.50)",
    practiceTask: "Return the type of the value 1250.50.", acceptedAnswers: ["type(1250.50)", "type(1250.5)"], hint: "Use Python's type function.", relatedLessons: ["strings", "numbers", "booleans"],
  },
  {
    id: "strings", title: "Strings", icon: "🔤", category: "Python Fundamentals", difficulty: "Beginner",
    description: "Store and transform text such as customer and product names.", syntax: "text.upper()", example: "customer = 'Aisha Khan'\ncustomer.upper()",
    practiceTask: "Convert the text 'north' to uppercase.", acceptedAnswers: ["'north'.upper()", "\"north\".upper()"], hint: "Call the upper method on the string.", relatedLessons: ["variables", "f-strings"],
  },
  {
    id: "numbers", title: "Numbers and arithmetic", icon: "➗", category: "Python Fundamentals", difficulty: "Beginner",
    description: "Calculate totals, averages, margins, and other business measures.", syntax: "+  -  *  /  //  %  **", example: "revenue = 1250 * 3",
    practiceTask: "Calculate revenue for 3 units priced at 1250.", acceptedAnswers: ["3 * 1250", "1250 * 3", "revenue = 3 * 1250", "revenue = 1250 * 3"], hint: "Multiply quantity by price with an asterisk.", relatedLessons: ["variables", "comparisons"],
  },
  {
    id: "booleans", title: "Booleans", icon: "✅", category: "Python Fundamentals", difficulty: "Beginner",
    description: "Represent true-or-false states used in filters and decisions.", syntax: "True\nFalse", example: "is_profitable = True",
    practiceTask: "Store True in a variable named is_profitable.", acceptedAnswers: ["is_profitable = True"], hint: "Python spells True with a capital T.", relatedLessons: ["comparisons", "if-statements"],
  },
  {
    id: "comparisons", title: "Comparison operators", icon: "⚖️", category: "Python Fundamentals", difficulty: "Beginner",
    description: "Compare values using equal, greater-than, less-than, and not-equal rules.", syntax: "==  !=  >  <  >=  <=", example: "sales >= 1000",
    practiceTask: "Check whether sales is at least 1000.", acceptedAnswers: ["sales >= 1000"], hint: "At least means greater than or equal to.", relatedLessons: ["booleans", "if-statements"],
  },
  {
    id: "f-strings", title: "f-strings", icon: "💬", category: "Python Fundamentals", difficulty: "Beginner",
    description: "Insert values into readable messages and report labels.", syntax: "f'Total: {value}'", example: "f'Total sales: {total_sales}'",
    practiceTask: "Create an f-string that displays Total: followed by the value in sales.", acceptedAnswers: ["f'Total: {sales}'", "f\"Total: {sales}\""], hint: "Add f before the quote and put sales inside braces.", relatedLessons: ["strings", "variables"],
  },
  {
    id: "lists", title: "Lists", icon: "📋", category: "Collections", difficulty: "Beginner",
    description: "Store an ordered collection that can grow or change.", syntax: "items = [value1, value2]", example: "regions = ['North', 'South', 'West']",
    practiceTask: "Create a list named regions containing North and South.", acceptedAnswers: ["regions = ['North', 'South']", "regions = [\"North\", \"South\"]"], hint: "Use square brackets and separate strings with a comma.", relatedLessons: ["tuples", "list-comprehensions"],
  },
  {
    id: "tuples", title: "Tuples", icon: "📌", category: "Collections", difficulty: "Beginner",
    description: "Store an ordered collection that should not be changed.", syntax: "values = (value1, value2)", example: "coordinates = (19.07, 72.87)",
    practiceTask: "Create a tuple named months containing Jan and Feb.", acceptedAnswers: ["months = ('Jan', 'Feb')", "months = (\"Jan\", \"Feb\")"], hint: "Use parentheses for the two strings.", relatedLessons: ["lists", "sets"],
  },
  {
    id: "dictionaries", title: "Dictionaries", icon: "🗃️", category: "Collections", difficulty: "Beginner",
    description: "Store labelled key-value pairs such as a business record.", syntax: "record = {'key': value}", example: "order = {'region': 'North', 'sales': 1250}",
    practiceTask: "Create order with region North using a dictionary.", acceptedAnswers: ["order = {'region': 'North'}", "order = {\"region\": \"North\"}"], hint: "Use braces with a key, colon, and value.", relatedLessons: ["lists", "dataframe-basics"],
  },
  {
    id: "sets", title: "Sets", icon: "✨", category: "Collections", difficulty: "Beginner",
    description: "Keep only unique values such as distinct regions.", syntax: "unique_values = set(values)", example: "unique_regions = set(regions)",
    practiceTask: "Create unique_regions from regions using set.", acceptedAnswers: ["unique_regions = set(regions)"], hint: "Pass regions to the set function.", relatedLessons: ["lists", "dictionaries"],
  },
  {
    id: "if-statements", title: "if statements", icon: "🚦", category: "Control Flow", difficulty: "Beginner",
    description: "Run code only when a condition is true.", syntax: "if condition:\n    action", example: "if sales >= 1000:\n    print('High sale')",
    practiceTask: "Print High sale when sales is at least 1000.", acceptedAnswers: ["if sales >= 1000:\n    print('High sale')", "if sales >= 1000:\n    print(\"High sale\")"], hint: "End the if line with a colon, then indent print.", relatedLessons: ["comparisons", "for-loops"],
  },
  {
    id: "for-loops", title: "for loops", icon: "🔁", category: "Control Flow", difficulty: "Beginner",
    description: "Repeat an action once for every item in a collection.", syntax: "for item in items:\n    action", example: "for region in regions:\n    print(region)",
    practiceTask: "Print each region in regions with a for loop.", acceptedAnswers: ["for region in regions:\n    print(region)"], hint: "Loop with for region in regions and indent print.", relatedLessons: ["lists", "while-loops", "list-comprehensions"],
  },
  {
    id: "while-loops", title: "while loops", icon: "⏳", category: "Control Flow", difficulty: "Beginner",
    description: "Repeat code while a condition remains true.", syntax: "while condition:\n    action", example: "while page <= 5:\n    page += 1",
    practiceTask: "Increase page by 1 while page is less than 5.", acceptedAnswers: ["while page < 5:\n    page += 1", "while page < 5:\n    page = page + 1"], hint: "Use page < 5 as the condition and update page inside.", relatedLessons: ["for-loops", "comparisons"],
  },
  {
    id: "functions", title: "Functions", icon: "🛠️", category: "Functions and Modules", difficulty: "Intermediate",
    description: "Package reusable logic behind a meaningful name.", syntax: "def function_name(parameter):\n    return result", example: "def profit(revenue, cost):\n    return revenue - cost",
    practiceTask: "Define profit(revenue, cost) and return revenue minus cost.", acceptedAnswers: ["def profit(revenue, cost):\n    return revenue - cost"], hint: "Start with def and return the subtraction.", relatedLessons: ["imports", "lambda-functions"],
  },
  {
    id: "lambda-functions", title: "Lambda functions", icon: "λ", category: "Functions and Modules", difficulty: "Intermediate",
    description: "Write a small anonymous function in one expression.", syntax: "lambda parameter: expression", example: "tax = lambda amount: amount * 0.18",
    practiceTask: "Create double as a lambda that multiplies x by 2.", acceptedAnswers: ["double = lambda x: x * 2", "double = lambda x: 2 * x"], hint: "Use lambda x followed by a colon and expression.", relatedLessons: ["functions", "apply-method"],
  },
  {
    id: "imports", title: "Imports", icon: "📦", category: "Functions and Modules", difficulty: "Beginner",
    description: "Bring reusable functionality from a Python library into a script.", syntax: "import library as alias", example: "import pandas as pd",
    practiceTask: "Import pandas using the alias pd.", acceptedAnswers: ["import pandas as pd"], hint: "Use import, the library name, then as pd.", relatedLessons: ["read-csv", "numpy-arrays"],
  },
  {
    id: "exceptions", title: "Handling exceptions", icon: "🛟", category: "Functions and Modules", difficulty: "Intermediate",
    description: "Handle expected errors without crashing an entire workflow.", syntax: "try:\n    action\nexcept ErrorType:\n    fallback", example: "try:\n    value = float(text)\nexcept ValueError:\n    value = 0",
    practiceTask: "Set value to int(text), but set it to 0 on ValueError.", acceptedAnswers: ["try:\n    value = int(text)\nexcept ValueError:\n    value = 0"], hint: "Use try for conversion and except ValueError for fallback.", relatedLessons: ["data-types", "functions"],
  },
  {
    id: "list-comprehensions", title: "List comprehensions", icon: "⚡", category: "Collections", difficulty: "Intermediate",
    description: "Build a transformed or filtered list in one readable expression.", syntax: "[expression for item in items if condition]", example: "large_sales = [sale for sale in sales if sale >= 1000]",
    practiceTask: "Create large_sales containing sales values of at least 1000.", acceptedAnswers: ["large_sales = [sale for sale in sales if sale >= 1000]"], hint: "Start with sale, loop through sales, then add the condition.", relatedLessons: ["lists", "for-loops"],
  },
  {
    id: "numpy-arrays", title: "NumPy arrays", icon: "🔢", category: "NumPy", difficulty: "Intermediate",
    description: "Store numeric data in a fast, consistent array.", syntax: "np.array(values)", example: "sales = np.array([1250, 675, 980])",
    practiceTask: "Create a NumPy array named sales with 1250, 675, and 980.", acceptedAnswers: ["sales = np.array([1250, 675, 980])"], hint: "Call np.array with a Python list.", relatedLessons: ["imports", "numpy-indexing"],
  },
  {
    id: "numpy-indexing", title: "NumPy indexing", icon: "🎯", category: "NumPy", difficulty: "Intermediate",
    description: "Select array values by position or boolean condition.", syntax: "array[index]\narray[condition]", example: "sales[sales >= 1000]",
    practiceTask: "Select sales values greater than or equal to 1000.", acceptedAnswers: ["sales[sales >= 1000]"], hint: "Put the boolean condition inside square brackets.", relatedLessons: ["numpy-arrays", "numpy-vectorization"],
  },
  {
    id: "numpy-vectorization", title: "Vectorized operations", icon: "🚀", category: "NumPy", difficulty: "Intermediate",
    description: "Calculate across an entire array without a Python loop.", syntax: "array * number", example: "sales_with_tax = sales * 1.18",
    practiceTask: "Create doubled_sales by multiplying every sales value by 2.", acceptedAnswers: ["doubled_sales = sales * 2", "doubled_sales = 2 * sales"], hint: "Multiply the whole array directly.", relatedLessons: ["numpy-arrays", "numpy-aggregations"],
  },
  {
    id: "numpy-aggregations", title: "NumPy aggregations", icon: "📊", category: "NumPy", difficulty: "Intermediate",
    description: "Summarize numeric arrays with sum, mean, min, and max.", syntax: "array.sum()\narray.mean()", example: "average_sales = sales.mean()",
    practiceTask: "Store the mean of sales in average_sales.", acceptedAnswers: ["average_sales = sales.mean()", "average_sales = np.mean(sales)"], hint: "Use the mean method or np.mean.", relatedLessons: ["numpy-vectorization", "groupby"],
  },
  {
    id: "numpy-reshape", title: "Reshaping arrays", icon: "🧩", category: "NumPy", difficulty: "Advanced",
    description: "Change an array's dimensions without changing its values.", syntax: "array.reshape(rows, columns)", example: "matrix = sales.reshape(2, 3)",
    practiceTask: "Reshape values into 2 rows and 3 columns as matrix.", acceptedAnswers: ["matrix = values.reshape(2, 3)", "matrix = np.reshape(values, (2, 3))"], hint: "The new dimensions must contain the same number of values.", relatedLessons: ["numpy-arrays", "numpy-missing-values"],
  },
  {
    id: "numpy-missing-values", title: "NumPy missing values", icon: "🕳️", category: "NumPy", difficulty: "Advanced",
    description: "Identify and summarize NaN values in numeric arrays.", syntax: "np.isnan(array)\nnp.nanmean(array)", example: "clean_average = np.nanmean(sales)",
    practiceTask: "Calculate the mean of sales while ignoring NaN values.", acceptedAnswers: ["np.nanmean(sales)", "clean_average = np.nanmean(sales)"], hint: "Use NumPy's NaN-aware mean function.", relatedLessons: ["missing-values", "numpy-aggregations"],
  },
  {
    id: "dataframe-basics", title: "Series and DataFrames", icon: "🧾", category: "Pandas", difficulty: "Beginner",
    description: "Work with labelled columns and rows using Pandas.", syntax: "pd.DataFrame(data)", example: "df = pd.DataFrame({'Region': ['North'], 'Sales': [1250]})",
    practiceTask: "Create df from the existing dictionary named data.", acceptedAnswers: ["df = pd.DataFrame(data)"], hint: "Pass data into pd.DataFrame.", relatedLessons: ["read-csv", "inspect-dataframe"],
  },
  {
    id: "read-csv", title: "Reading CSV files", icon: "📥", category: "Pandas", difficulty: "Beginner",
    description: "Load a CSV dataset into a DataFrame.", syntax: "pd.read_csv('file.csv')", example: "df = pd.read_csv('python-sales-analysis.csv')",
    practiceTask: "Load sales.csv into a DataFrame named df.", acceptedAnswers: ["df = pd.read_csv('sales.csv')", "df = pd.read_csv(\"sales.csv\")"], hint: "Use pd.read_csv and assign its result.", relatedLessons: ["imports", "inspect-dataframe"],
  },
  {
    id: "inspect-dataframe", title: "Inspecting a DataFrame", icon: "🔍", category: "Pandas", difficulty: "Beginner",
    description: "Check rows, columns, data types, and summary statistics before analysis.", syntax: "df.head()\ndf.info()\ndf.describe()", example: "df.head()",
    practiceTask: "Display the first 5 rows of df.", acceptedAnswers: ["df.head()", "df.head(5)"], hint: "Use the head method.", relatedLessons: ["read-csv", "selecting-columns"],
  },
  {
    id: "selecting-columns", title: "Selecting columns", icon: "📌", category: "Pandas", difficulty: "Beginner",
    description: "Choose one or more DataFrame columns for analysis.", syntax: "df['Column']\ndf[['A', 'B']]", example: "df[['Region', 'Sales']]",
    practiceTask: "Select Region and Sales from df.", acceptedAnswers: ["df[['Region', 'Sales']]", "df[[\"Region\", \"Sales\"]]"], hint: "Use a list of two column names inside df brackets.", relatedLessons: ["filtering-rows", "loc-iloc"],
  },
  {
    id: "filtering-rows", title: "Filtering rows", icon: "🧹", category: "Pandas", difficulty: "Beginner",
    description: "Keep only records that match a business condition.", syntax: "df[df['Column'] condition]", example: "df[df['Sales'] >= 1000]",
    practiceTask: "Filter df to Sales values of at least 1000.", acceptedAnswers: ["df[df['Sales'] >= 1000]", "df[df[\"Sales\"] >= 1000]"], hint: "Put the Sales comparison inside df brackets.", relatedLessons: ["selecting-columns", "query-method"],
  },
  {
    id: "loc-iloc", title: "loc and iloc", icon: "🧭", category: "Pandas", difficulty: "Intermediate",
    description: "Select DataFrame values by labels or integer positions.", syntax: "df.loc[rows, columns]\ndf.iloc[row_positions, column_positions]", example: "df.loc[df['Region'] == 'North', ['Region', 'Sales']]",
    practiceTask: "Use loc to select Region and Sales for North rows.", acceptedAnswers: ["df.loc[df['Region'] == 'North', ['Region', 'Sales']]", "df.loc[df[\"Region\"] == \"North\", [\"Region\", \"Sales\"]]"], hint: "The row filter comes before the comma and column list after it.", relatedLessons: ["filtering-rows", "selecting-columns"],
  },
  {
    id: "query-method", title: "The query method", icon: "💬", category: "Pandas", difficulty: "Intermediate",
    description: "Express a DataFrame filter as a readable query string.", syntax: "df.query('condition')", example: "df.query(\"Region == 'North' and Sales >= 1000\")",
    practiceTask: "Use query to keep North rows.", acceptedAnswers: ["df.query(\"Region == 'North'\")", `df.query('Region == "North"')`], hint: "Put the Region comparison inside the query string.", relatedLessons: ["filtering-rows", "loc-iloc"],
  },
  {
    id: "sorting-data", title: "Sorting data", icon: "↕️", category: "Pandas", difficulty: "Beginner",
    description: "Order rows by one or more columns.", syntax: "df.sort_values('Column', ascending=False)", example: "df.sort_values('Sales', ascending=False)",
    practiceTask: "Sort df from highest Sales to lowest.", acceptedAnswers: ["df.sort_values('Sales', ascending=False)", "df.sort_values(\"Sales\", ascending=False)"], hint: "Sort Sales with ascending set to False.", relatedLessons: ["filtering-rows", "groupby"],
  },
  {
    id: "creating-columns", title: "Creating columns", icon: "➕", category: "Pandas", difficulty: "Beginner",
    description: "Calculate a new measure from existing DataFrame columns.", syntax: "df['New'] = df['A'] - df['B']", example: "df['Profit'] = df['Sales'] - df['Cost']",
    practiceTask: "Create Profit as Sales minus Cost.", acceptedAnswers: ["df['Profit'] = df['Sales'] - df['Cost']", "df[\"Profit\"] = df[\"Sales\"] - df[\"Cost\"]"], hint: "Assign the subtraction to a new Profit column.", relatedLessons: ["apply-method", "groupby"],
  },
  {
    id: "apply-method", title: "apply and map", icon: "🪄", category: "Pandas", difficulty: "Intermediate",
    description: "Apply custom transformation logic to values or rows.", syntax: "series.map(function)\nseries.apply(function)", example: "df['Region'] = df['Region'].str.title()",
    practiceTask: "Convert every Region value to uppercase.", acceptedAnswers: ["df['Region'] = df['Region'].str.upper()", "df[\"Region\"] = df[\"Region\"].str.upper()"], hint: "Use the string upper method on the Region Series.", relatedLessons: ["creating-columns", "lambda-functions"],
  },
  {
    id: "groupby", title: "GroupBy summaries", icon: "🧺", category: "Pandas", difficulty: "Intermediate",
    description: "Create one aggregate result for each business group.", syntax: "df.groupby('Group')['Value'].sum()", example: "df.groupby('Region')['Sales'].sum()",
    practiceTask: "Calculate total Sales for each Region.", acceptedAnswers: ["df.groupby('Region')['Sales'].sum()", "df.groupby(\"Region\")[\"Sales\"].sum()"], hint: "Group by Region, select Sales, then sum.", relatedLessons: ["pivot-tables", "aggregations"],
  },
  {
    id: "aggregations", title: "Pandas aggregations", icon: "📊", category: "Pandas", difficulty: "Intermediate",
    description: "Calculate multiple summary measures in one step.", syntax: "df['Column'].agg(['sum', 'mean'])", example: "df['Sales'].agg(['sum', 'mean'])",
    practiceTask: "Calculate sum and mean for the Sales column.", acceptedAnswers: ["df['Sales'].agg(['sum', 'mean'])", "df[\"Sales\"].agg([\"sum\", \"mean\"])"], hint: "Pass a list containing sum and mean to agg.", relatedLessons: ["groupby", "pivot-tables"],
  },
  {
    id: "pivot-tables", title: "Pivot tables", icon: "🔄", category: "Pandas", difficulty: "Intermediate",
    description: "Summarize a measure across row and column categories.", syntax: "pd.pivot_table(df, values='Value', index='Row', aggfunc='sum')", example: "pd.pivot_table(df, values='Sales', index='Region', aggfunc='sum')",
    practiceTask: "Create a pivot table summing Sales by Region.", acceptedAnswers: ["pd.pivot_table(df, values='Sales', index='Region', aggfunc='sum')", "pd.pivot_table(df, values=\"Sales\", index=\"Region\", aggfunc=\"sum\")"], hint: "Use Sales as values, Region as index, and sum as aggfunc.", relatedLessons: ["groupby", "aggregations"],
  },
  {
    id: "merging-data", title: "Merging DataFrames", icon: "🤝", category: "Pandas", difficulty: "Intermediate",
    description: "Join related tables using a shared key.", syntax: "left.merge(right, on='Key', how='left')", example: "orders.merge(customers, on='CustomerID', how='left')",
    practiceTask: "Left-join customers onto orders using CustomerID.", acceptedAnswers: ["orders.merge(customers, on='CustomerID', how='left')", "orders.merge(customers, on=\"CustomerID\", how=\"left\")", "pd.merge(orders, customers, on='CustomerID', how='left')"], hint: "Use orders as the left DataFrame and how='left'.", relatedLessons: ["concatenating-data", "groupby"],
  },
  {
    id: "concatenating-data", title: "Concatenating data", icon: "🧵", category: "Pandas", difficulty: "Intermediate",
    description: "Stack DataFrames with matching columns.", syntax: "pd.concat([df_one, df_two], ignore_index=True)", example: "all_sales = pd.concat([jan_sales, feb_sales], ignore_index=True)",
    practiceTask: "Stack jan and feb into all_sales and reset the row index.", acceptedAnswers: ["all_sales = pd.concat([jan, feb], ignore_index=True)"], hint: "Pass both DataFrames in a list and use ignore_index=True.", relatedLessons: ["merging-data", "export-csv"],
  },
  {
    id: "missing-values", title: "Missing values", icon: "🕳️", category: "Data Cleaning", difficulty: "Intermediate",
    description: "Find, remove, or fill missing DataFrame values intentionally.", syntax: "df.isna()\ndf.dropna()\ndf.fillna(value)", example: "df['Sales'] = df['Sales'].fillna(0)",
    practiceTask: "Fill missing Sales values with 0.", acceptedAnswers: ["df['Sales'] = df['Sales'].fillna(0)", "df[\"Sales\"] = df[\"Sales\"].fillna(0)"], hint: "Call fillna(0) on the Sales column.", relatedLessons: ["duplicates", "data-types-pandas"],
  },
  {
    id: "duplicates", title: "Removing duplicates", icon: "🪞", category: "Data Cleaning", difficulty: "Beginner",
    description: "Remove repeated business records using the right key.", syntax: "df.drop_duplicates(subset=['Key'])", example: "df = df.drop_duplicates(subset=['OrderID'])",
    practiceTask: "Remove duplicate OrderID rows and save the result back to df.", acceptedAnswers: ["df = df.drop_duplicates(subset=['OrderID'])", "df = df.drop_duplicates(subset=[\"OrderID\"])"], hint: "Use OrderID in the subset list.", relatedLessons: ["missing-values", "string-cleaning"],
  },
  {
    id: "data-types-pandas", title: "Pandas data types", icon: "🔤", category: "Data Cleaning", difficulty: "Intermediate",
    description: "Convert columns into reliable numeric, text, or date types.", syntax: "pd.to_numeric(series)\npd.to_datetime(series)", example: "df['Sales'] = pd.to_numeric(df['Sales'])",
    practiceTask: "Convert OrderDate to datetime.", acceptedAnswers: ["df['OrderDate'] = pd.to_datetime(df['OrderDate'])", "df[\"OrderDate\"] = pd.to_datetime(df[\"OrderDate\"])"], hint: "Use pd.to_datetime on the OrderDate column.", relatedLessons: ["datetime-analysis", "missing-values"],
  },
  {
    id: "string-cleaning", title: "Cleaning text columns", icon: "🧼", category: "Data Cleaning", difficulty: "Intermediate",
    description: "Standardize whitespace and capitalization in text fields.", syntax: "series.str.strip().str.title()", example: "df['Region'] = df['Region'].str.strip().str.title()",
    practiceTask: "Remove surrounding whitespace from Region.", acceptedAnswers: ["df['Region'] = df['Region'].str.strip()", "df[\"Region\"] = df[\"Region\"].str.strip()"], hint: "Use the str.strip method.", relatedLessons: ["duplicates", "apply-method"],
  },
  {
    id: "datetime-analysis", title: "Datetime analysis", icon: "📅", category: "Data Analysis", difficulty: "Intermediate",
    description: "Extract months, years, and other calendar parts for trends.", syntax: "series.dt.year\nseries.dt.month", example: "df['Month'] = df['OrderDate'].dt.month_name()",
    practiceTask: "Create Year from the year part of OrderDate.", acceptedAnswers: ["df['Year'] = df['OrderDate'].dt.year", "df[\"Year\"] = df[\"OrderDate\"].dt.year"], hint: "Use the dt accessor followed by year.", relatedLessons: ["data-types-pandas", "line-charts"],
  },
  {
    id: "correlation", title: "Correlation", icon: "🔗", category: "Data Analysis", difficulty: "Advanced",
    description: "Measure the strength and direction of numeric relationships.", syntax: "df[['A', 'B']].corr()", example: "df[['Quantity', 'Sales']].corr()",
    practiceTask: "Calculate correlation between Quantity and Sales.", acceptedAnswers: ["df[['Quantity', 'Sales']].corr()", "df[[\"Quantity\", \"Sales\"]].corr()"], hint: "Select both numeric columns, then call corr.", relatedLessons: ["scatter-plots", "aggregations"],
  },
  {
    id: "line-charts", title: "Line charts", icon: "📈", category: "Visualization", difficulty: "Intermediate",
    description: "Show how a measure changes across ordered time periods.", syntax: "plt.plot(x, y)\nplt.show()", example: "plt.plot(monthly_sales.index, monthly_sales.values)\nplt.show()",
    practiceTask: "Plot months against sales and show the chart.", acceptedAnswers: ["plt.plot(months, sales)\nplt.show()"], hint: "Call plt.plot first, then plt.show.", relatedLessons: ["bar-charts", "datetime-analysis"],
  },
  {
    id: "bar-charts", title: "Bar charts", icon: "📊", category: "Visualization", difficulty: "Intermediate",
    description: "Compare a measure across categories using a shared baseline.", syntax: "plt.bar(categories, values)\nplt.show()", example: "plt.bar(region_sales.index, region_sales.values)\nplt.show()",
    practiceTask: "Create a bar chart of regions and sales, then show it.", acceptedAnswers: ["plt.bar(regions, sales)\nplt.show()"], hint: "Use plt.bar with categories first and values second.", relatedLessons: ["line-charts", "histograms"],
  },
  {
    id: "histograms", title: "Histograms", icon: "📶", category: "Visualization", difficulty: "Intermediate",
    description: "See the distribution and spread of a numeric measure.", syntax: "plt.hist(values, bins=number)\nplt.show()", example: "plt.hist(df['Sales'], bins=10)\nplt.show()",
    practiceTask: "Plot a Sales histogram with 10 bins and show it.", acceptedAnswers: ["plt.hist(df['Sales'], bins=10)\nplt.show()", "plt.hist(df[\"Sales\"], bins=10)\nplt.show()"], hint: "Pass the Sales Series and bins=10 to plt.hist.", relatedLessons: ["bar-charts", "scatter-plots"],
  },
  {
    id: "scatter-plots", title: "Scatter plots", icon: "🌌", category: "Visualization", difficulty: "Intermediate",
    description: "Explore a relationship between two numeric variables.", syntax: "plt.scatter(x, y)\nplt.show()", example: "plt.scatter(df['Quantity'], df['Sales'])\nplt.show()",
    practiceTask: "Plot Quantity against Sales and show it.", acceptedAnswers: ["plt.scatter(df['Quantity'], df['Sales'])\nplt.show()", "plt.scatter(df[\"Quantity\"], df[\"Sales\"])\nplt.show()"], hint: "Quantity is x and Sales is y.", relatedLessons: ["correlation", "histograms"],
  },
  {
    id: "seaborn-charts", title: "Seaborn charts", icon: "🎨", category: "Visualization", difficulty: "Advanced",
    description: "Create statistical charts with concise DataFrame-aware syntax.", syntax: "sns.barplot(data=df, x='Category', y='Value')", example: "sns.barplot(data=df, x='Region', y='Sales')",
    practiceTask: "Create a Seaborn bar plot with Region on x and Sales on y.", acceptedAnswers: ["sns.barplot(data=df, x='Region', y='Sales')", "sns.barplot(data=df, x=\"Region\", y=\"Sales\")"], hint: "Pass df as data and name the x and y columns.", relatedLessons: ["bar-charts", "scatter-plots"],
  },
  {
    id: "chart-labels", title: "Chart labels and titles", icon: "🏷️", category: "Visualization", difficulty: "Beginner",
    description: "Make charts understandable with a title and axis labels.", syntax: "plt.title(text)\nplt.xlabel(text)\nplt.ylabel(text)", example: "plt.title('Monthly Sales')\nplt.xlabel('Month')\nplt.ylabel('Sales')",
    practiceTask: "Set the chart title to Regional Sales.", acceptedAnswers: ["plt.title('Regional Sales')", "plt.title(\"Regional Sales\")"], hint: "Use plt.title with the requested text.", relatedLessons: ["line-charts", "bar-charts"],
  },
  {
    id: "export-csv", title: "Exporting results", icon: "📤", category: "Analyst Workflow", difficulty: "Beginner",
    description: "Save a clean DataFrame for sharing or downstream reporting.", syntax: "df.to_csv('file.csv', index=False)", example: "summary.to_csv('regional-summary.csv', index=False)",
    practiceTask: "Export summary to summary.csv without the index.", acceptedAnswers: ["summary.to_csv('summary.csv', index=False)", "summary.to_csv(\"summary.csv\", index=False)"], hint: "Use to_csv and set index=False.", relatedLessons: ["read-csv", "eda-workflow"],
  },
  {
    id: "eda-workflow", title: "Exploratory analysis workflow", icon: "🧭", category: "Analyst Workflow", difficulty: "Advanced",
    description: "Move from raw data to validated questions, summaries, and insights.", syntax: "df.head()\ndf.info()\ndf.describe()", example: "df.head()\ndf.info()\ndf.describe(include='all')",
    practiceTask: "Display summary statistics for numeric columns in df.", acceptedAnswers: ["df.describe()", "summary = df.describe()"], hint: "Use the DataFrame describe method.", relatedLessons: ["inspect-dataframe", "groupby", "export-csv"],
  },
];

export const pythonLessons: PythonLesson[] = seeds.map((seed, index, all) => {
  const complete = lesson(seed);
  return {
    ...complete,
    relatedLessons:
      complete.relatedLessons.length > 0
        ? complete.relatedLessons
        : [all[(index + 1) % all.length].id],
  };
});

export const pythonCategories = Array.from(
  new Set(pythonLessons.map((item) => item.category)),
);

export const pythonDifficulties: PythonDifficulty[] = [
  "Beginner",
  "Intermediate",
  "Advanced",
];

export function getPythonLesson(id: string) {
  return pythonLessons.find((item) => item.id === id);
}

export function getNextPythonLesson(id: string) {
  const index = pythonLessons.findIndex((item) => item.id === id);
  return index >= 0 ? pythonLessons[index + 1] : undefined;
}
