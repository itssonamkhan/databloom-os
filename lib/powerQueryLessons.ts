export const powerQueryCategories = [
  "Foundations",
  "Connections and Imports",
  "Cleaning and Transforming",
  "Combining and Shaping",
  "M Language and Automation",
  "Performance and Integration",
  "Business Scenarios and Interviews",
] as const;

export const powerQueryDifficulties = [
  "Beginner",
  "Intermediate",
  "Advanced",
] as const;

export type PowerQueryCategory = (typeof powerQueryCategories)[number];
export type PowerQueryDifficulty = (typeof powerQueryDifficulties)[number];

export type PowerQueryLesson = {
  id: string;
  title: string;
  icon: string;
  category: PowerQueryCategory;
  difficulty: PowerQueryDifficulty;
  description: string;
  definition?: string;
  explanation: string;
  whenToUse: string[];
  steps: string[];
  beforeExample: string;
  afterExample: string;
  mCode?: string;
  commonMistakes: string[];
  interviewTip: string;
  practiceQuestion: string;
  practiceOptions: string[];
  correctAnswer: string;
  hint: string;
  xpReward: number;
  relatedLessonIds: string[];
};

type LessonTuple = readonly [
  id: string,
  title: string,
  icon: string,
  category: PowerQueryCategory,
  difficulty: PowerQueryDifficulty,
  description: string,
];

const catalog = [
  ["power-query-overview", "Power Query overview", "🌱", "Foundations", "Beginner", "Build repeatable data preparation pipelines instead of manually cleaning every refresh."],
  ["where-power-query-runs", "Where Power Query runs", "🧭", "Foundations", "Beginner", "Recognize Power Query experiences in Excel, Power BI, dataflows, and other Microsoft products."],
  ["query-editor-interface", "Query Editor interface", "🖥️", "Foundations", "Beginner", "Navigate the ribbon, Queries pane, data preview, query settings, status bar, and formula bar."],
  ["queries-pane", "Queries pane", "📚", "Foundations", "Beginner", "Organize, group, rename, duplicate, reference, and inspect queries from one workspace."],
  ["data-preview", "Data preview", "🔎", "Foundations", "Beginner", "Inspect sampled rows, column types, profiling indicators, and transformation results before loading."],
  ["applied-steps", "Applied Steps", "🪜", "Foundations", "Beginner", "Read, rename, reorder, edit, and safely remove transformations in the query pipeline."],
  ["formula-bar", "Formula bar", "🧮", "Foundations", "Beginner", "Inspect and edit the M expression generated for the selected transformation step."],
  ["advanced-editor", "Advanced Editor", "⌨️", "Foundations", "Intermediate", "Read and edit the complete let/in expression behind a query."],
  ["query-properties", "Query properties", "🏷️", "Foundations", "Beginner", "Give queries clear names, descriptions, and refresh behavior that communicate their purpose."],
  ["load-destinations", "Load destinations", "📦", "Foundations", "Beginner", "Choose whether clean results load to an Excel table, Data Model, or Power BI model."],
  ["enable-load-refresh", "Enable load and refresh", "🔄", "Foundations", "Intermediate", "Control which staging and output queries load or participate in refresh."],
  ["referencing-vs-duplicating", "Reference vs duplicate", "🌿", "Foundations", "Intermediate", "Choose between a linked downstream query and an independent copy of existing steps."],

  ["import-excel-workbook", "Import an Excel workbook", "📗", "Connections and Imports", "Beginner", "Connect to worksheets, tables, and named ranges from an Excel file."],
  ["excel-tables-ranges", "Excel tables and ranges", "▦", "Connections and Imports", "Beginner", "Prefer structured Excel tables while understanding how named ranges and sheets differ."],
  ["import-csv-text", "Import CSV and text files", "📄", "Connections and Imports", "Beginner", "Connect delimited files and validate headers, types, delimiters, and row parsing."],
  ["csv-delimiters-encoding", "CSV delimiters and encoding", "🔤", "Connections and Imports", "Intermediate", "Correct parsing problems caused by separator, quote style, locale, or character encoding."],
  ["folder-connector", "Folder connector", "📁", "Connections and Imports", "Intermediate", "List files from a folder and expose binary content plus file metadata for automation."],
  ["combine-files", "Combine files", "🗂️", "Connections and Imports", "Intermediate", "Apply one sample-file transformation consistently across files with a shared structure."],
  ["web-connector", "Web connector", "🌐", "Connections and Imports", "Intermediate", "Connect to public web pages, files, APIs, and structured web content."],
  ["web-by-example", "Web by example", "🕸️", "Connections and Imports", "Intermediate", "Teach Power Query the rows you want when a web page does not expose a clean table."],
  ["sql-server-connector", "SQL Server connector", "🗄️", "Connections and Imports", "Beginner", "Connect to SQL Server with appropriate server, database, authentication, and navigation choices."],
  ["database-native-query", "Native database query", "💬", "Connections and Imports", "Advanced", "Use a carefully reviewed native SQL statement when connector navigation is insufficient."],
  ["data-source-settings", "Data source settings", "⚙️", "Connections and Imports", "Intermediate", "Edit source paths, permissions, credentials, and connection scope safely."],
  ["credentials-privacy-levels", "Credentials and privacy levels", "🔐", "Connections and Imports", "Intermediate", "Configure authentication and isolation rules when data from multiple sources is combined."],
  ["parameters-for-sources", "Source parameters", "🎛️", "Connections and Imports", "Intermediate", "Replace hard-coded file paths, server names, and environments with controlled parameter values."],
  ["refresh-source-changes", "Handle source changes", "🧯", "Connections and Imports", "Advanced", "Design resilient queries for renamed files, added columns, and changing source schemas."],

  ["data-profiling", "Data profiling", "🩺", "Cleaning and Transforming", "Beginner", "Use quality, distribution, and profile views to investigate values before transforming them."],
  ["column-quality-distribution-profile", "Column quality and distribution", "📊", "Cleaning and Transforming", "Intermediate", "Interpret valid, error, empty, distinct, and unique statistics correctly."],
  ["detect-change-data-types", "Detect and change data types", "🔢", "Cleaning and Transforming", "Beginner", "Assign text, number, currency, logical, date, time, duration, and binary types deliberately."],
  ["locale-data-types", "Data types with locale", "🌍", "Cleaning and Transforming", "Intermediate", "Parse dates and decimal separators correctly when source culture differs from the machine locale."],
  ["remove-columns", "Remove columns", "🗑️", "Cleaning and Transforming", "Beginner", "Discard fields that are unnecessary for the required output."],
  ["choose-columns", "Choose columns", "✅", "Cleaning and Transforming", "Beginner", "Keep an explicit set of required columns and ignore the rest."],
  ["rename-columns", "Rename columns", "✏️", "Cleaning and Transforming", "Beginner", "Create stable, business-friendly headers without changing source data."],
  ["reorder-columns", "Reorder columns", "↔️", "Cleaning and Transforming", "Beginner", "Arrange output fields for readability or a required downstream schema."],
  ["filter-rows", "Filter rows", "🔽", "Cleaning and Transforming", "Beginner", "Keep only records that satisfy business, quality, date, or status conditions."],
  ["sort-rows", "Sort rows", "↕️", "Cleaning and Transforming", "Beginner", "Order records for presentation or for transformations whose result depends on row order."],
  ["replace-values", "Replace values", "🔁", "Cleaning and Transforming", "Beginner", "Standardize known labels, codes, and text fragments with an auditable step."],
  ["fill-down-up", "Fill down and fill up", "🪣", "Cleaning and Transforming", "Beginner", "Propagate a non-null value through grouped report rows that omit repeated labels."],
  ["handle-nulls", "Handle nulls", "🕳️", "Cleaning and Transforming", "Intermediate", "Distinguish missing values from blanks and apply a business-approved treatment."],
  ["remove-errors", "Remove errors", "🚫", "Cleaning and Transforming", "Beginner", "Exclude error rows only when omission is understood and acceptable."],
  ["replace-errors", "Replace errors", "🩹", "Cleaning and Transforming", "Intermediate", "Substitute a controlled fallback while preserving the meaning of failed conversions or calculations."],
  ["remove-duplicates", "Remove duplicates", "🧹", "Cleaning and Transforming", "Beginner", "Keep one row for a validated business key after confirming sort and tie-breaking rules."],
  ["keep-remove-rows", "Keep and remove rows", "✂️", "Cleaning and Transforming", "Beginner", "Keep top, bottom, range, duplicate, error, or alternate rows for a specific cleanup need."],
  ["split-delimiter", "Split by delimiter", "🔪", "Cleaning and Transforming", "Beginner", "Separate combined text into fields using a consistent delimiter."],
  ["split-position", "Split by position", "📏", "Cleaning and Transforming", "Intermediate", "Separate fixed-width codes or text using character positions."],
  ["merge-columns", "Merge columns", "🧷", "Cleaning and Transforming", "Beginner", "Combine multiple text fields with a deliberate separator and null strategy."],
  ["text-transformations", "Text transformations", "🔤", "Cleaning and Transforming", "Intermediate", "Trim, clean, change case, extract, pad, and standardize text values."],
  ["number-transformations", "Number transformations", "➗", "Cleaning and Transforming", "Intermediate", "Round, take absolute values, apply arithmetic, and derive numeric measures safely."],
  ["date-transformations", "Date transformations", "📅", "Cleaning and Transforming", "Intermediate", "Extract calendar parts, calculate boundaries, and shift dates for reporting periods."],
  ["time-duration-transformations", "Time and duration transformations", "⏱️", "Cleaning and Transforming", "Intermediate", "Parse times and calculate elapsed intervals with correct duration semantics."],
  ["conditional-column", "Conditional columns", "🚦", "Cleaning and Transforming", "Intermediate", "Create rule-based labels through ordered if/then conditions."],
  ["custom-column", "Custom columns", "🧪", "Cleaning and Transforming", "Intermediate", "Add an M expression that derives a value from one or more row fields."],
  ["index-column", "Index columns", "#️⃣", "Cleaning and Transforming", "Beginner", "Add a stable sequence for ordering, surrogate identifiers, or row-to-row patterns."],
  ["group-by", "Group By", "🧺", "Cleaning and Transforming", "Intermediate", "Aggregate rows by one or more keys using sum, count, average, min, max, or custom logic."],
  ["aggregate-all-rows", "Group By with All Rows", "📚", "Cleaning and Transforming", "Advanced", "Create nested tables per group for advanced within-group transformations."],

  ["pivot-columns", "Pivot columns", "🔄", "Combining and Shaping", "Intermediate", "Turn distinct row values into columns with an explicit aggregation."],
  ["unpivot-columns", "Unpivot columns", "🫗", "Combining and Shaping", "Intermediate", "Turn repeated period or measure columns into attribute-value rows for analysis."],
  ["transpose-table", "Transpose a table", "🔃", "Combining and Shaping", "Intermediate", "Swap rows and columns when the source orientation is unsuitable."],
  ["reverse-rows", "Reverse rows", "⤴️", "Combining and Shaping", "Beginner", "Invert row order before an order-dependent transformation."],
  ["promote-demote-headers", "Promote and demote headers", "🔝", "Combining and Shaping", "Beginner", "Move the correct first row into column names or return headers to data."],
  ["merge-queries", "Merge Queries", "🤝", "Combining and Shaping", "Intermediate", "Join related tables by matching one or more key columns."],
  ["join-kinds", "Join kinds", "🕸️", "Combining and Shaping", "Advanced", "Choose left, right, full, inner, left anti, or right anti joins based on the required row set."],
  ["expand-merged-tables", "Expand merged tables", "📤", "Combining and Shaping", "Intermediate", "Select fields from a nested joined table without accidentally duplicating or renaming columns poorly."],
  ["fuzzy-matching", "Fuzzy matching", "🧩", "Combining and Shaping", "Advanced", "Match similar text using thresholds, transformation tables, and carefully reviewed ambiguity."],
  ["append-queries", "Append Queries", "➕", "Combining and Shaping", "Intermediate", "Stack tables vertically after aligning names and compatible types."],
  ["schema-alignment", "Schema alignment before append", "📐", "Combining and Shaping", "Advanced", "Standardize required columns and types before combining recurring extracts."],
  ["folder-combine-pattern", "Folder combine pattern", "🗃️", "Combining and Shaping", "Advanced", "Use sample-file, transform-file, parameter, and output queries as one maintainable ingestion pattern."],
  ["query-dependencies", "Query dependencies", "🗺️", "Combining and Shaping", "Intermediate", "Trace which queries reference sources, staging layers, functions, and final outputs."],
  ["data-lineage-staging", "Staging and data lineage", "🏗️", "Combining and Shaping", "Advanced", "Separate source, staging, transformation, and output queries for clear ownership and troubleshooting."],

  ["m-values-types", "M values and types", "🧱", "M Language and Automation", "Intermediate", "Understand primitive values, structured values, null, type declarations, and conversions in M."],
  ["lists", "Lists in M", "📜", "M Language and Automation", "Intermediate", "Create ordered values with braces and use List functions for generation and transformation."],
  ["records", "Records in M", "🪪", "M Language and Automation", "Intermediate", "Work with named fields enclosed in brackets and access values by field name."],
  ["tables", "Tables in M", "▦", "M Language and Automation", "Intermediate", "Understand tables as typed rows and columns manipulated by the Table function family."],
  ["let-in", "let/in syntax", "🧠", "M Language and Automation", "Intermediate", "Bind named intermediate expressions in a let block and return the expression after in."],
  ["step-references", "Step references", "🔗", "M Language and Automation", "Intermediate", "Reference prior steps correctly, including quoted identifiers for names with spaces."],
  ["each-expression", "each expressions", "λ", "M Language and Automation", "Intermediate", "Use concise row functions where the underscore represents the current value or record."],
  ["if-then-else", "if then else", "🚦", "M Language and Automation", "Intermediate", "Write complete conditional expressions that return compatible result types."],
  ["try-otherwise", "try and otherwise", "🛟", "M Language and Automation", "Advanced", "Capture expression errors and provide an intentional alternative or inspect the error record."],
  ["m-functions", "Functions in M", "ƒ", "M Language and Automation", "Advanced", "Define parameters and an expression using the goes-to operator."],
  ["reusable-m-function", "Reusable M functions", "♻️", "M Language and Automation", "Advanced", "Package repeated transformation logic into a documented function query."],
  ["invoke-custom-function", "Invoke a custom function", "▶️", "M Language and Automation", "Advanced", "Run a function for each row or file and expand the returned result."],
  ["parameters", "Power Query parameters", "🎚️", "M Language and Automation", "Intermediate", "Create typed values that control sources, thresholds, dates, and reusable logic."],
  ["list-transform", "List.Transform", "🔁", "M Language and Automation", "Advanced", "Apply a function to every item in a list and return a new list."],
  ["table-transform-rows", "Table.TransformRows", "🧬", "M Language and Automation", "Advanced", "Transform each table row record into a structured output value."],
  ["metadata-dynamic-columns", "Dynamic columns and metadata", "🧰", "M Language and Automation", "Advanced", "Use schema metadata and column-name lists to make transformations resilient."],

  ["query-folding", "Query folding", "🛤️", "Performance and Integration", "Advanced", "Push compatible transformations back to a structured source so it performs the work."],
  ["view-native-query", "View native query", "🔍", "Performance and Integration", "Advanced", "Inspect the source query produced by folding when the connector supports it."],
  ["folding-indicators", "Query folding indicators", "🚥", "Performance and Integration", "Advanced", "Interpret folding status at each step in supported Power Query experiences."],
  ["filter-early", "Filter early", "⚡", "Performance and Integration", "Intermediate", "Reduce rows near the source while preserving folding whenever possible."],
  ["remove-columns-early", "Remove columns early", "🪶", "Performance and Integration", "Intermediate", "Reduce width before expensive operations without hiding fields needed later."],
  ["buffering-caveats", "Buffering caveats", "🧊", "Performance and Integration", "Advanced", "Use List.Buffer or Table.Buffer only after measurement because buffering can block folding and consume memory."],
  ["incremental-refresh", "Incremental refresh", "📆", "Performance and Integration", "Advanced", "Parameterize date windows so supported Power BI refreshes process only required partitions."],
  ["power-bi-integration", "Power BI integration", "📊", "Performance and Integration", "Intermediate", "Load clean, typed tables into a model with appropriate query names and refresh settings."],
  ["excel-integration", "Excel integration", "📗", "Performance and Integration", "Intermediate", "Load to worksheets, connection-only queries, or the Data Model based on workbook needs."],
  ["dataflows-gateway", "Dataflows and gateways", "☁️", "Performance and Integration", "Advanced", "Prepare shared cloud transformations and understand when on-premises refresh requires a gateway."],
  ["diagnostics-performance", "Query Diagnostics", "🩻", "Performance and Integration", "Advanced", "Measure evaluation activity and isolate expensive connectors, steps, or repeated work."],

  ["messy-sales-cleaning", "Messy sales cleanup", "🧾", "Business Scenarios and Interviews", "Intermediate", "Standardize dates, region labels, currencies, null discounts, and duplicate order lines."],
  ["customer-master-cleaning", "Customer master cleanup", "👥", "Business Scenarios and Interviews", "Intermediate", "Clean identifiers, names, emails, phone values, duplicates, and incomplete customer attributes."],
  ["inventory-reconciliation", "Inventory reconciliation", "📦", "Business Scenarios and Interviews", "Advanced", "Combine stock snapshots and transactions to identify shortages, overages, and stale items."],
  ["finance-transactions", "Finance transaction cleanup", "💳", "Business Scenarios and Interviews", "Advanced", "Parse dates and amounts, classify accounts, handle signs, and flag invalid or duplicate entries."],
  ["monthly-folder-automation", "Monthly folder automation", "🗓️", "Business Scenarios and Interviews", "Advanced", "Combine recurring monthly files with a resilient sample-file function and traceable file metadata."],
  ["interview-merge-vs-append", "Interview: merge vs append", "🎤", "Business Scenarios and Interviews", "Intermediate", "Explain when to join columns from related tables and when to stack similarly shaped rows."],
  ["interview-query-folding", "Interview: query folding", "🎤", "Business Scenarios and Interviews", "Advanced", "Explain folding, why it matters, how to inspect it, and which transformations can interrupt it."],
  ["interview-m-debugging", "Interview: debug M errors", "🎤", "Business Scenarios and Interviews", "Advanced", "Trace a failing step, inspect types and row errors, and correct the earliest invalid assumption."],
  ["interview-performance-case", "Interview: optimize a slow query", "🎤", "Business Scenarios and Interviews", "Advanced", "Present a measurement-first plan covering source, folding, row and column reduction, joins, and refresh."],
  ["interview-end-to-end-case", "Interview: end-to-end cleaning case", "🎓", "Business Scenarios and Interviews", "Advanced", "Structure a complete answer from requirements and profiling through reusable transformation, validation, and delivery."],
] satisfies readonly LessonTuple[];

const mExamples: Partial<Record<(typeof catalog)[number][0], string>> = {
  "advanced-editor": `let
    Source = Excel.CurrentWorkbook(){[Name="Sales"]}[Content],
    #"Changed Type" = Table.TransformColumnTypes(Source, {{"Amount", Currency.Type}})
in
    #"Changed Type"`,
  "import-csv-text": `Csv.Document(File.Contents("C:\\Data\\sales.csv"), [Delimiter=",", Encoding=65001, QuoteStyle=QuoteStyle.Csv])`,
  "folder-connector": `Folder.Files("C:\\Data\\Monthly Sales")`,
  "sql-server-connector": `Sql.Database("analytics-server", "SalesWarehouse")`,
  "parameters-for-sources": `Excel.Workbook(File.Contents(FilePathParameter), null, true)`,
  "detect-change-data-types": `Table.TransformColumnTypes(Source, {{"OrderDate", type date}, {"Revenue", Currency.Type}})`,
  "locale-data-types": `Table.TransformColumnTypes(Source, {{"OrderDate", type date}}, "en-GB")`,
  "remove-columns": `Table.RemoveColumns(Source, {"InternalNotes", "UnusedFlag"})`,
  "choose-columns": `Table.SelectColumns(Source, {"OrderID", "OrderDate", "Customer", "Revenue"})`,
  "rename-columns": `Table.RenameColumns(Source, {{"Cust_Name", "Customer Name"}})`,
  "reorder-columns": `Table.ReorderColumns(Source, {"OrderID", "OrderDate", "Customer", "Revenue"})`,
  "filter-rows": `Table.SelectRows(Source, each [Status] = "Active" and [Revenue] > 0)`,
  "sort-rows": `Table.Sort(Source, {{"OrderDate", Order.Ascending}, {"OrderID", Order.Ascending}})`,
  "replace-values": `Table.ReplaceValue(Source, "NORTH ", "North", Replacer.ReplaceText, {"Region"})`,
  "fill-down-up": `Table.FillDown(Source, {"Region", "Sales Manager"})`,
  "handle-nulls": `Table.ReplaceValue(Source, null, 0, Replacer.ReplaceValue, {"Discount"})`,
  "remove-errors": `Table.RemoveRowsWithErrors(Source, {"OrderDate", "Revenue"})`,
  "replace-errors": `Table.ReplaceErrorValues(Source, {{"Revenue", null}})`,
  "remove-duplicates": `Table.Distinct(Source, {"OrderID", "LineID"})`,
  "split-delimiter": `Table.SplitColumn(Source, "FullName", Splitter.SplitTextByDelimiter(" ", QuoteStyle.Csv), {"FirstName", "LastName"})`,
  "merge-columns": `Table.CombineColumns(Source, {"City", "State"}, Combiner.CombineTextByDelimiter(", ", QuoteStyle.None), "Location")`,
  "text-transformations": `Table.TransformColumns(Source, {{"Customer", each Text.Proper(Text.Trim(Text.Clean(_))), type text}})`,
  "number-transformations": `Table.TransformColumns(Source, {{"Revenue", each Number.Round(_, 2), type number}})`,
  "date-transformations": `Table.AddColumn(Source, "MonthStart", each Date.StartOfMonth([OrderDate]), type date)`,
  "conditional-column": `Table.AddColumn(Source, "Value Band", each if [Revenue] >= 10000 then "High" else if [Revenue] >= 5000 then "Medium" else "Low", type text)`,
  "custom-column": `Table.AddColumn(Source, "Profit", each [Revenue] - [Cost], Currency.Type)`,
  "index-column": `Table.AddIndexColumn(Source, "RowID", 1, 1, Int64.Type)`,
  "group-by": `Table.Group(Source, {"Region"}, {{"Revenue", each List.Sum([Revenue]), Currency.Type}, {"Orders", each Table.RowCount(_), Int64.Type}})`,
  "pivot-columns": `Table.Pivot(Source, List.Distinct(Source[Month]), "Month", "Revenue", List.Sum)`,
  "unpivot-columns": `Table.UnpivotOtherColumns(Source, {"Product"}, "Month", "Revenue")`,
  "promote-demote-headers": `Table.PromoteHeaders(Source, [PromoteAllScalars=true])`,
  "merge-queries": `Table.NestedJoin(Orders, {"CustomerID"}, Customers, {"CustomerID"}, "Customer", JoinKind.LeftOuter)`,
  "expand-merged-tables": `Table.ExpandTableColumn(Merged, "Customer", {"CustomerName", "Segment"}, {"Customer Name", "Segment"})`,
  "fuzzy-matching": `Table.FuzzyNestedJoin(Sales, {"Customer"}, Master, {"Customer"}, "Match", JoinKind.LeftOuter, [Threshold=0.85, IgnoreCase=true])`,
  "append-queries": `Table.Combine({January, February, March})`,
  "m-values-types": `Value.Type(42) = type number`,
  "lists": `{1, 2, 3, 4, 5}`,
  "records": `[CustomerID="C-100", Segment="Retail", Active=true]`,
  "tables": `#table({"Product", "Quantity"}, {{"Keyboard", 2}, {"Mouse", 5}})`,
  "let-in": `let
    Source = {1, 2, 3},
    Total = List.Sum(Source)
in
    Total`,
  "step-references": `#"Filtered Rows" = Table.SelectRows(#"Changed Type", each [Revenue] > 0)`,
  "each-expression": `Table.SelectRows(Source, each [Status] = "Open")`,
  "if-then-else": `if [Revenue] >= [Target] then "Met" else "Below"`,
  "try-otherwise": `Table.AddColumn(Source, "ParsedAmount", each try Number.FromText([Amount]) otherwise null, type number)`,
  "m-functions": `(amount as number, taxRate as number) as number => amount * (1 + taxRate)`,
  "reusable-m-function": `(file as binary) as table =>
let
    Workbook = Excel.Workbook(file, null, true),
    Sales = Workbook{[Item="Sales", Kind="Table"]}[Data]
in
    Sales`,
  "invoke-custom-function": `Table.AddColumn(Files, "Transformed", each TransformFile([Content]))`,
  "parameters": `Table.SelectRows(Source, each [OrderDate] >= RangeStart and [OrderDate] < RangeEnd)`,
  "list-transform": `List.Transform({1, 2, 3}, each _ * 10)`,
  "table-transform-rows": `Table.TransformRows(Source, each [OrderID=[OrderID], Margin=[Revenue] - [Cost]])`,
  "filter-early": `Table.SelectRows(Sql.Database(Server, Database){[Schema="dbo", Item="Sales"]}[Data], each [OrderDate] >= RangeStart)`,
  "incremental-refresh": `Table.SelectRows(Source, each [OrderDate] >= RangeStart and [OrderDate] < RangeEnd)`,
};

const powerQueryDefinitions: Record<string, string> = {
  "power-query-overview": "Power Query is a tool for connecting to data and applying repeatable preparation steps before analysis.",
  "where-power-query-runs": "Power Query runs inside products such as Excel and Power BI to connect, transform, and refresh data.",
  "query-editor-interface": "The Query Editor is the workspace where sources, previews, transformations, and query settings are managed.",
  "queries-pane": "The Queries pane lists queries so they can be organized, renamed, grouped, referenced, or inspected.",
  "data-preview": "Data preview is the sampled table view used to inspect values, types, profiles, and transformation results.",
  "applied-steps": "Applied Steps are the ordered transformation actions that define how a query changes from source to output.",
  "formula-bar": "The formula bar displays and edits the M expression behind the selected query step.",
  "advanced-editor": "The Advanced Editor is the full-query editor for reading and editing a query's let/in M script.",
  "query-properties": "Query properties are metadata and settings that document a query and control aspects of its refresh behavior.",
  "load-destinations": "Load destinations specify where query results are delivered, such as an Excel table, Data Model, or Power BI model.",
  "enable-load-refresh": "Enable load and refresh settings determine which queries load results and which participate in refresh operations.",
  "referencing-vs-duplicating": "Reference creates a query linked to another query, while Duplicate creates an independent copy of its steps.",
  "import-excel-workbook": "The Excel workbook connector reads worksheets, tables, and named ranges into Power Query.",
  "excel-tables-ranges": "Excel tables and ranges are workbook structures that expose data differently for reliable query connections.",
  "import-csv-text": "The CSV and text connector parses delimited files into rows and columns for transformation.",
  "csv-delimiters-encoding": "CSV delimiter and encoding settings control how separators, quotes, and characters are interpreted during import.",
  "folder-connector": "The Folder connector lists files in a directory with their binary contents and metadata.",
  "combine-files": "Combine Files applies a shared sample-file transformation to multiple files with a compatible structure.",
  "web-connector": "The Web connector retrieves supported web pages, files, APIs, or structured web content as query data.",
  "web-by-example": "Web by Example infers extraction steps from sample values when a page does not expose a clean table.",
  "sql-server-connector": "The SQL Server connector establishes a governed Power Query connection to SQL Server databases and objects.",
  "database-native-query": "A native database query is a reviewed SQL statement sent directly to the source through a connector.",
  "data-source-settings": "Data source settings manage connection paths, credentials, permissions, and privacy scope for sources.",
  "credentials-privacy-levels": "Credentials and privacy levels control authentication and how data from different sources may be combined.",
  "parameters-for-sources": "Source parameters replace hard-coded paths, servers, or environments with controlled reusable values.",
  "refresh-source-changes": "Handling source changes means designing queries to detect and respond safely to renamed files, new columns, or schema drift.",
  "data-profiling": "Data profiling summarizes quality, distribution, and value patterns so problems are understood before transformation.",
  "column-quality-distribution-profile": "Column quality and distribution profiles show valid, error, empty, distinct, and unique value statistics.",
  "detect-change-data-types": "Detecting and changing data types assigns fields formats such as text, number, date, logical, or duration.",
  "locale-data-types": "Locale-aware data types parse dates and decimal separators according to the culture used by the source values.",
  "remove-columns": "Remove Columns deletes fields that are not needed for the query's required output.",
  "choose-columns": "Choose Columns keeps an explicit list of required fields while excluding the rest.",
  "rename-columns": "Rename Columns changes headers to stable, meaningful names without altering the source system.",
  "reorder-columns": "Reorder Columns changes the output field sequence for readability or a downstream schema requirement.",
  "filter-rows": "Filter Rows keeps only records that satisfy a selected business, quality, date, or status condition.",
  "sort-rows": "Sort Rows orders records by one or more fields for presentation or order-dependent transformations.",
  "replace-values": "Replace Values substitutes known labels, codes, or text fragments with standardized values.",
  "fill-down-up": "Fill Down or Fill Up propagates nearby non-null values into rows where grouped labels were omitted.",
  "handle-nulls": "Handling nulls distinguishes missing values from blanks and applies an explicit business treatment.",
  "remove-errors": "Remove Errors excludes rows containing transformation errors when that omission is understood and acceptable.",
  "replace-errors": "Replace Errors substitutes a controlled fallback for failed conversions or calculations while preserving an auditable rule.",
  "remove-duplicates": "Remove Duplicates keeps one row for a validated key after the tie-breaking and sort rules are confirmed.",
  "keep-remove-rows": "Keep and Remove Rows selects positional, duplicate, error, top, bottom, or range-based subsets of rows.",
  "split-delimiter": "Split by Delimiter separates text into fields wherever a chosen separator occurs.",
  "split-position": "Split by Position separates fixed-width text using specified character offsets.",
  "merge-columns": "Merge Columns combines multiple text fields with a chosen separator and null-handling rule.",
  "text-transformations": "Text transformations clean, trim, change case, extract, pad, or otherwise standardize text values.",
  "number-transformations": "Number transformations apply rounding, absolute values, arithmetic, or other numeric operations.",
  "date-transformations": "Date transformations extract calendar parts, calculate boundaries, or shift dates for reporting periods.",
  "time-duration-transformations": "Time and duration transformations parse clock values and calculate elapsed intervals with correct time semantics.",
  "conditional-column": "A Conditional Column creates a new field by assigning values through ordered if/then rules.",
  "custom-column": "A Custom Column adds an M expression that derives a value from fields in the current row.",
  "index-column": "An Index Column adds a sequence number useful for ordering, surrogate keys, or row-to-row logic.",
  "group-by": "Group By partitions rows by keys and calculates aggregations such as sum, count, average, minimum, or maximum.",
  "aggregate-all-rows": "Group By with All Rows creates a nested table for each group so advanced within-group transformations can run.",
  "pivot-columns": "Pivot Columns turns distinct row values into separate columns using an explicit aggregation.",
  "unpivot-columns": "Unpivot Columns turns repeated columns into attribute-value rows suited to tidy analysis.",
  "transpose-table": "Transpose swaps a table's rows and columns when the source orientation is unsuitable.",
  "reverse-rows": "Reverse Rows inverts the current row order before a transformation that depends on sequence.",
  "promote-demote-headers": "Promote or Demote Headers moves a row into column names or returns headers to the data rows.",
  "merge-queries": "Merge Queries joins related tables by matching one or more key columns.",
  "join-kinds": "Join kinds define which matched and unmatched rows a merge keeps, including inner, outer, and anti joins.",
  "expand-merged-tables": "Expand Merged Tables selects fields from a nested joined result and adds them to the current table.",
  "fuzzy-matching": "Fuzzy Matching joins similar text values using similarity rules instead of requiring exact equality.",
  "append-queries": "Append Queries stacks rows from compatible tables vertically into one combined table.",
  "schema-alignment": "Schema alignment standardizes required column names and types before recurring tables are appended.",
  "folder-combine-pattern": "The Folder Combine pattern uses sample, transform, parameter, and output queries to ingest recurring files.",
  "query-dependencies": "Query Dependencies is a diagram of how sources, staging queries, functions, and outputs relate.",
  "data-lineage-staging": "Staging and data lineage separate source, preparation, transformation, and output layers for traceability.",
  "m-values-types": "M values and types describe primitive and structured values, null, type declarations, and conversions in the M language.",
  lists: "An M list is an ordered collection of values written with braces and processed by List functions.",
  records: "An M record is a collection of named fields written in brackets and accessed by field name.",
  tables: "An M table is a typed collection of rows and columns manipulated by the Table function family.",
  "let-in": "The let/in expression binds named intermediate values and returns the expression specified after in.",
  "step-references": "Step references let an M expression reuse the result of an earlier Applied Step.",
  "each-expression": "An each expression is shorthand for a row function where the underscore represents the current value or record.",
  "if-then-else": "An if then else expression returns one compatible value when a condition is true and another when it is false.",
  "try-otherwise": "Try and otherwise capture an M expression error and return an intentional fallback or inspect the error record.",
  "m-functions": "An M function is a parameterized expression that returns a value when invoked with arguments.",
  "reusable-m-function": "A reusable M function packages repeated transformation logic behind documented parameters.",
  "invoke-custom-function": "Invoking a custom function runs it for a value such as each row or file and exposes the returned result.",
  parameters: "Power Query parameters are typed values that control sources, thresholds, dates, or reusable transformation logic.",
  "list-transform": "List.Transform applies a function to every item in a list and returns the transformed list.",
  "table-transform-rows": "Table.TransformRows applies a function to each table row record and returns structured transformed values.",
  "metadata-dynamic-columns": "Dynamic columns and metadata use schema information and column-name lists to make queries adapt to changing fields.",
  "query-folding": "Query folding pushes compatible Power Query transformations back to the source so the source performs the work.",
  "view-native-query": "View Native Query shows the source query generated by folding when the connector supports inspection.",
  "folding-indicators": "Query folding indicators reveal whether a step is still being translated to the source in supported experiences.",
  "filter-early": "Filtering early reduces source rows before expensive steps while preserving folding where possible.",
  "remove-columns-early": "Removing columns early reduces data width before costly operations without discarding fields needed later.",
  "buffering-caveats": "Buffering materializes values in memory and should be measured carefully because it can block folding and increase resource use.",
  "incremental-refresh": "Incremental refresh processes only changing date partitions instead of reloading the entire historical dataset.",
  "power-bi-integration": "Power BI integration loads clean, typed Power Query results into a model with deliberate names and refresh settings.",
  "excel-integration": "Excel integration loads query results to worksheets, connection-only queries, or the Data Model according to workbook needs.",
  "dataflows-gateway": "Dataflows and gateways connect shared cloud transformations with sources that may require on-premises refresh access.",
  "diagnostics-performance": "Query Diagnostics measures evaluation activity so slow connectors, steps, or repeated work can be isolated.",
  "messy-sales-cleaning": "Messy sales cleanup is a repeatable query process for standardizing dates, regions, currencies, nulls, and duplicate lines.",
  "customer-master-cleaning": "Customer master cleanup prepares identifiers and contact attributes while resolving duplicates and incomplete records.",
  "inventory-reconciliation": "Inventory reconciliation combines snapshots and transactions to compare stock movement with expected balances.",
  "finance-transactions": "Finance transaction cleanup parses amounts and dates, classifies accounts, and flags invalid or duplicate entries.",
  "monthly-folder-automation": "Monthly folder automation combines recurring files through a resilient sample-file transformation and file metadata.",
  "interview-merge-vs-append": "Merge versus append is the modeling choice between joining columns by keys and stacking compatible rows.",
  "interview-query-folding": "A query-folding interview discussion explains source pushdown, unsupported steps, performance checks, and validation.",
  "interview-m-debugging": "Debugging M errors is the process of isolating a failing step, checking types and values, and applying a controlled fix.",
  "interview-performance-case": "A slow-query case is solved by measuring diagnostics, reducing data early, preserving folding, and retesting.",
  "interview-end-to-end-case": "An end-to-end cleaning case connects source profiling, transformations, validation, refresh, and delivery into one workflow.",
};

function arrangeOptions(id: string, correctAnswer: string) {
  const choices = [
    correctAnswer,
    "Delete the source and manually type the final totals for each refresh.",
    "Format the destination report without validating rows, types, or errors.",
  ];
  const offset =
    Array.from(id).reduce(
      (total, character) => total + character.charCodeAt(0),
      0,
    ) % choices.length;
  return [...choices.slice(offset), ...choices.slice(0, offset)];
}

function createLesson(tuple: LessonTuple): PowerQueryLesson {
  const [id, title, icon, category, difficulty, description] = tuple;
  const correctAnswer = description;
  const xpReward = difficulty === "Beginner" ? 20 : difficulty === "Intermediate" ? 30 : 40;

  return {
    id,
    title,
    icon,
    category,
    difficulty,
    description,
    definition: powerQueryDefinitions[id],
    explanation: `${description} Power Query records the work as ordered, refreshable steps, so the same logic can be reviewed and applied to new source data.`,
    whenToUse: [
      `Use ${title.toLocaleLowerCase()} when it directly supports the required output and can be validated against the source.`,
      "Use it in a repeatable refresh workflow where another analyst must be able to inspect the transformation later.",
    ],
    steps: [
      "Confirm the expected source grain, required columns, and business rule before changing the query.",
      `Apply ${title.toLocaleLowerCase()} from the Query Editor or write the equivalent M expression.`,
      "Inspect the new Applied Step, data types, errors, row count, and representative values.",
      "Rename the step clearly, refresh with changed source data, and validate the final output before loading.",
    ],
    beforeExample: `Raw input still needs ${title.toLocaleLowerCase()}; values are not yet ready for a reliable model or report.`,
    afterExample: `${title} is captured as a named, refreshable step and the resulting rows, columns, and types have been checked.`,
    mCode: mExamples[id],
    commonMistakes: [
      "Applying the step before confirming the source grain, key, and expected output.",
      "Ignoring automatic type changes, row-count changes, errors, or lost query folding after the transformation.",
    ],
    interviewTip: `For ${title.toLocaleLowerCase()}, explain the business reason, the M or UI action, how you validated it, and its refresh or performance tradeoff.`,
    practiceQuestion: `Which outcome best demonstrates a correct use of ${title.toLocaleLowerCase()}?`,
    practiceOptions: arrangeOptions(id, correctAnswer),
    correctAnswer,
    hint: "Choose the outcome that creates a repeatable, validated transformation rather than a manual reporting shortcut.",
    xpReward,
    relatedLessonIds: [],
  };
}

const lessons = catalog.map(createLesson);

export const powerQueryLessons = lessons.map((lesson, index) => ({
  ...lesson,
  relatedLessonIds: [lessons[index - 1]?.id, lessons[index + 1]?.id].filter(
    (id): id is string => Boolean(id),
  ),
}));

export function getPowerQueryLesson(id: string) {
  return powerQueryLessons.find((lesson) => lesson.id === id);
}

export function getNextPowerQueryLesson(id: string) {
  const index = powerQueryLessons.findIndex((lesson) => lesson.id === id);
  return index >= 0 ? powerQueryLessons[index + 1] : undefined;
}
