export const datasetCategories = [
  "Excel",
  "SQL",
  "Power BI",
  "Tableau",
  "Python",
  "Statistics",
  "Business Analytics",
  "Marketing",
  "Finance",
  "HR",
  "Sales",
  "Healthcare",
  "Retail",
  "Supply Chain",
] as const;

export const datasetDifficulties = [
  "Beginner",
  "Intermediate",
  "Advanced",
] as const;

export type DatasetCategory = (typeof datasetCategories)[number];
export type DatasetDifficulty = (typeof datasetDifficulties)[number];

type DatasetSchemaKey =
  | "campaign"
  | "commerce"
  | "customer"
  | "digital"
  | "education"
  | "finance"
  | "health"
  | "inventory"
  | "media"
  | "operations"
  | "people"
  | "service"
  | "time-series"
  | "travel";

export type DatasetColumn = {
  name: string;
  description: string;
};

export type DatasetLibraryItem = {
  id: string;
  name: string;
  icon: string;
  category: DatasetCategory;
  difficulty: DatasetDifficulty;
  description: string;
  businessScenario: string;
  rowCount: number;
  columnCount: number;
  skillsPracticed: string[];
  csvPath: string;
  columns: DatasetColumn[];
  recommendedStudio: { name: string; href: string };
  suggestedQuestions: string[];
  suggestedDashboards: string[];
  suggestedSQLQueries: string[];
  suggestedPowerBIVisuals: string[];
  suggestedTableauDashboards: string[];
  suggestedPythonAnalysis: string[];
  relatedLessons: Array<{ title: string; href: string }>;
  xpReward: number;
};

type DatasetTuple = readonly [
  id: string,
  name: string,
  icon: string,
  category: DatasetCategory,
  difficulty: DatasetDifficulty,
  schema: DatasetSchemaKey,
  description: string,
  businessScenario: string,
  skills: readonly string[],
];

const schemas: Record<DatasetSchemaKey, DatasetColumn[]> = {
  campaign: [
    { name: "Campaign", description: "Campaign or initiative name." },
    { name: "Channel", description: "Acquisition or communication channel." },
    { name: "StartDate", description: "Campaign launch date." },
    { name: "Audience", description: "Users or contacts reached." },
    { name: "Spend", description: "Campaign investment in currency units." },
    { name: "Clicks", description: "Recorded response clicks." },
    { name: "Conversions", description: "Completed target actions." },
    { name: "Revenue", description: "Revenue attributed to the campaign." },
  ],
  commerce: [
    { name: "OrderID", description: "Unique order identifier." },
    { name: "OrderDate", description: "Date the order was placed." },
    { name: "Customer", description: "Customer or account label." },
    { name: "Region", description: "Sales geography." },
    { name: "Category", description: "Product or service category." },
    { name: "Revenue", description: "Gross order revenue." },
    { name: "Cost", description: "Direct order cost." },
    { name: "Status", description: "Current order outcome or state." },
  ],
  customer: [
    { name: "CustomerID", description: "Unique customer identifier." },
    { name: "Segment", description: "Customer segment or plan." },
    { name: "Region", description: "Customer geography." },
    { name: "TenureMonths", description: "Months since acquisition." },
    { name: "MonthlyValue", description: "Average monthly customer value." },
    { name: "EngagementScore", description: "Normalized engagement score." },
    { name: "SupportCases", description: "Support requests in the period." },
    { name: "Outcome", description: "Retention, churn, or lifecycle outcome." },
  ],
  digital: [
    { name: "EventID", description: "Unique digital event identifier." },
    { name: "Date", description: "Observation date." },
    { name: "Channel", description: "Traffic or acquisition channel." },
    { name: "Device", description: "Device family." },
    { name: "Users", description: "Distinct active users." },
    { name: "Sessions", description: "Recorded sessions." },
    { name: "Conversions", description: "Completed target events." },
    { name: "Revenue", description: "Revenue associated with the events." },
  ],
  education: [
    { name: "StudentID", description: "Anonymized student identifier." },
    { name: "Course", description: "Course or subject." },
    { name: "Term", description: "Academic term." },
    { name: "StudyHours", description: "Weekly study hours." },
    { name: "AttendancePct", description: "Attendance percentage." },
    { name: "AssessmentScore", description: "Continuous assessment result." },
    { name: "FinalScore", description: "Final evaluation score." },
    { name: "Outcome", description: "Pass, support, or distinction outcome." },
  ],
  finance: [
    { name: "RecordID", description: "Unique financial record identifier." },
    { name: "Date", description: "Transaction or reporting date." },
    { name: "Customer", description: "Customer or account label." },
    { name: "Product", description: "Financial product or account type." },
    { name: "Amount", description: "Transaction, balance, or claim amount." },
    { name: "Rate", description: "Applicable rate or percentage." },
    { name: "RiskBand", description: "Assigned risk classification." },
    { name: "Status", description: "Approval, payment, or review status." },
  ],
  health: [
    { name: "RecordID", description: "Anonymized clinical record identifier." },
    { name: "Date", description: "Service or encounter date." },
    { name: "Facility", description: "Hospital, clinic, or branch." },
    { name: "Department", description: "Clinical department." },
    { name: "PatientGroup", description: "Anonymized patient cohort." },
    { name: "Service", description: "Service or treatment category." },
    { name: "Cost", description: "Recorded service cost." },
    { name: "Outcome", description: "Operational or care outcome." },
  ],
  inventory: [
    { name: "SKU", description: "Unique stock-keeping unit." },
    { name: "Product", description: "Product name." },
    { name: "Category", description: "Inventory category." },
    { name: "Location", description: "Store or warehouse location." },
    { name: "OnHand", description: "Current units available." },
    { name: "ReorderPoint", description: "Inventory reorder threshold." },
    { name: "UnitCost", description: "Cost per unit." },
    { name: "MonthlyDemand", description: "Typical monthly unit demand." },
  ],
  media: [
    { name: "Title", description: "Content or track title." },
    { name: "Type", description: "Media format." },
    { name: "Genre", description: "Primary content genre." },
    { name: "ReleaseYear", description: "Original release year." },
    { name: "Country", description: "Primary market or origin." },
    { name: "Rating", description: "Audience or platform rating." },
    { name: "Duration", description: "Runtime or track duration." },
    { name: "Popularity", description: "Normalized popularity score." },
  ],
  operations: [
    { name: "RecordID", description: "Unique production or process record." },
    { name: "Date", description: "Production date." },
    { name: "Site", description: "Plant, line, or operating site." },
    { name: "Process", description: "Process or product family." },
    { name: "Units", description: "Units processed or produced." },
    { name: "Defects", description: "Defective units recorded." },
    { name: "CycleMinutes", description: "Average cycle time in minutes." },
    { name: "Cost", description: "Process cost for the observation." },
  ],
  people: [
    { name: "EmployeeID", description: "Anonymized employee identifier." },
    { name: "Department", description: "Employee department." },
    { name: "Role", description: "Job family or role." },
    { name: "TenureYears", description: "Completed years of service." },
    { name: "MonthlySalary", description: "Monthly compensation." },
    { name: "PerformanceScore", description: "Latest performance score." },
    { name: "EngagementScore", description: "Latest engagement score." },
    { name: "Outcome", description: "Attrition or workforce outcome." },
  ],
  service: [
    { name: "InteractionID", description: "Unique service interaction." },
    { name: "Date", description: "Interaction date." },
    { name: "Team", description: "Handling team or location." },
    { name: "Channel", description: "Phone, chat, email, or in-person channel." },
    { name: "Topic", description: "Primary customer request topic." },
    { name: "HandleMinutes", description: "Handling duration in minutes." },
    { name: "SatisfactionScore", description: "Post-interaction satisfaction score." },
    { name: "Resolution", description: "Resolution outcome." },
  ],
  "time-series": [
    { name: "Date", description: "Trading or observation date." },
    { name: "Symbol", description: "Asset or series identifier." },
    { name: "Open", description: "Opening value." },
    { name: "High", description: "Highest value in the period." },
    { name: "Low", description: "Lowest value in the period." },
    { name: "Close", description: "Closing value." },
    { name: "Volume", description: "Observed transaction volume." },
    { name: "ChangePct", description: "Percentage change from the prior close." },
  ],
  travel: [
    { name: "BookingID", description: "Unique booking or trip identifier." },
    { name: "Date", description: "Booking or service date." },
    { name: "Origin", description: "Starting market or location." },
    { name: "Destination", description: "Destination market or location." },
    { name: "CustomerType", description: "Customer or traveler segment." },
    { name: "Revenue", description: "Booking revenue." },
    { name: "DelayMinutes", description: "Delay or service variance in minutes." },
    { name: "Status", description: "Booking or service outcome." },
  ],
};

const catalog = [
  ["superstore-sales", "Superstore Sales", "🛍️", "Excel", "Beginner", "commerce", "Regional orders, categories, revenue, cost, and fulfillment outcomes.", "A retail director needs a monthly sales and margin view before changing territory targets.", ["Pivot tables", "Profit margin", "Regional analysis"]],
  ["amazon-orders", "Amazon Orders", "📦", "SQL", "Intermediate", "commerce", "Marketplace orders with customers, product mix, revenue, cost, and status.", "An operations analyst must locate delayed orders and the categories driving margin changes.", ["GROUP BY", "CTEs", "Order analysis"]],
  ["netflix-titles", "Netflix Titles", "🎬", "Python", "Beginner", "media", "Streaming titles by format, genre, market, release year, rating, and popularity.", "A content team wants to understand catalog balance and audience demand by genre and market.", ["Pandas", "Categorical analysis", "Data visualization"]],
  ["spotify-songs", "Spotify Songs", "🎧", "Statistics", "Intermediate", "media", "Songs with genre, release year, duration, rating, and popularity measures.", "A music strategy team wants to compare popularity patterns across genres and release eras.", ["Distribution analysis", "Correlation", "Sampling"]],
  ["customer-churn", "Customer Churn", "🚪", "Business Analytics", "Intermediate", "customer", "Subscription customers with tenure, value, engagement, service use, and churn outcome.", "A subscription leader needs an actionable view of churn risk and retention opportunities.", ["Churn analysis", "Segmentation", "Retention metrics"]],
  ["marketing-campaign", "Marketing Campaign", "📣", "Marketing", "Intermediate", "campaign", "Cross-channel campaign spend, audience, clicks, conversions, and revenue.", "A marketing manager must reallocate the next campaign budget toward incremental profitable growth.", ["ROAS", "Conversion funnel", "Channel mix"]],
  ["hr-attrition", "HR Attrition", "🧑‍💼", "HR", "Intermediate", "people", "Anonymized workforce data with tenure, salary, performance, engagement, and attrition.", "HR leadership needs to identify preventable attrition patterns without confusing correlation with cause.", ["Attrition rate", "Cohort comparison", "Ethical analysis"]],
  ["retail-inventory", "Retail Inventory", "🏬", "Retail", "Intermediate", "inventory", "Store-level stock, reorder thresholds, unit costs, and monthly demand.", "A retail planner must reduce stockouts and excess working capital at the same time.", ["Inventory turnover", "Stockout risk", "Reorder analysis"]],
  ["hospital-patients", "Hospital Patients", "🏥", "Healthcare", "Advanced", "health", "Anonymized encounters with facility, department, patient group, service, cost, and outcome.", "Hospital operations wants to compare service demand and outcomes while protecting patient privacy.", ["Healthcare KPIs", "Cohorts", "Operational dashboards"]],
  ["bank-loans", "Bank Loans", "🏦", "Finance", "Advanced", "finance", "Loan applications with product, amount, rate, risk band, and approval status.", "A lending team needs to balance approval growth, portfolio risk, and customer access.", ["Risk segmentation", "Approval rate", "Portfolio analysis"]],
  ["hotel-bookings", "Hotel Bookings", "🏨", "Tableau", "Intermediate", "travel", "Hotel reservations with market, customer type, revenue, service delay, and status.", "A hotel group wants an executive view of demand, cancellations, and revenue by market.", ["Dashboard actions", "Trend analysis", "Market segmentation"]],
  ["food-delivery", "Food Delivery", "🛵", "Power BI", "Intermediate", "travel", "Delivery orders with route, customer type, revenue, delay, and fulfillment outcome.", "A delivery company must improve on-time performance without sacrificing contribution margin.", ["DAX measures", "SLA analysis", "Operational reporting"]],
  ["ecommerce-orders", "E-commerce Orders", "🛒", "SQL", "Intermediate", "commerce", "Digital orders with customer, region, category, revenue, cost, and fulfillment state.", "An e-commerce team wants to diagnose a revenue slowdown and growing return rate.", ["Window functions", "Customer orders", "Revenue analysis"]],
  ["airline-performance", "Airline Performance", "✈️", "Tableau", "Advanced", "travel", "Flight observations with routes, traveler segment, revenue, delays, and status.", "Network operations needs to identify delay hotspots and their impact on customers and revenue.", ["Maps", "Route analysis", "Delay dashboards"]],
  ["stock-prices", "Stock Prices", "📈", "Python", "Advanced", "time-series", "Daily OHLC prices, volume, and percentage change for a small equity portfolio.", "An analyst needs a reproducible notebook for returns, volatility, and moving-average signals.", ["Time series", "Rolling metrics", "Matplotlib"]],
  ["manufacturing-quality", "Manufacturing Quality", "🏭", "Supply Chain", "Advanced", "operations", "Plant output with defects, cycle time, process cost, and product family.", "A plant manager must prioritize the process causing the largest quality and throughput loss.", ["Defect rate", "Pareto analysis", "Process capability"]],
  ["restaurant-sales", "Restaurant Sales", "🍽️", "Excel", "Beginner", "commerce", "Restaurant orders with menu category, revenue, cost, region, and service status.", "A restaurant group needs a simple weekly menu mix and margin workbook.", ["SUMIFS", "Pivot charts", "Menu engineering"]],
  ["insurance-claims", "Insurance Claims", "🛡️", "Finance", "Advanced", "finance", "Claims records with customer, product, amount, risk band, rate, and settlement status.", "Claims leadership wants to understand severity, processing status, and suspicious segments.", ["Claims severity", "Risk bands", "Variance analysis"]],
  ["call-center", "Call Center", "🎧", "Power BI", "Intermediate", "service", "Service contacts with team, channel, topic, handle time, satisfaction, and resolution.", "A support director must reduce repeat contacts while protecting satisfaction.", ["Service KPIs", "DAX", "Drill-through"]],
  ["student-performance", "Student Performance", "🎓", "Statistics", "Beginner", "education", "Anonymized study hours, attendance, assessment results, final scores, and outcomes.", "An academic support team wants to identify early support signals without labeling students unfairly.", ["Correlation", "Descriptive statistics", "Regression basics"]],
  ["saas-metrics", "SaaS Metrics", "☁️", "Business Analytics", "Advanced", "customer", "Subscription accounts with tenure, monthly value, engagement, support, and lifecycle outcome.", "A SaaS executive team needs one view of activation, retention, expansion, and customer value.", ["MRR", "Net retention", "Unit economics"]],
  ["website-funnel", "Website Funnel", "🔻", "Marketing", "Beginner", "digital", "Daily channel and device traffic with users, sessions, conversions, and revenue.", "Growth marketing needs to locate the biggest funnel leak by device and acquisition channel.", ["Conversion rate", "Funnel analysis", "Channel performance"]],
  ["subscription-revenue", "Subscription Revenue", "💳", "Finance", "Intermediate", "customer", "Customer plans with tenure, monthly value, engagement, support, and renewal outcome.", "Finance and customer success need a shared recurring-revenue and renewal risk view.", ["Recurring revenue", "Cohorts", "Forecasting"]],
  ["employee-engagement", "Employee Engagement", "🌱", "HR", "Beginner", "people", "Workforce records with department, role, tenure, compensation, performance, and engagement.", "People leaders want to compare engagement responsibly and prioritize listening actions.", ["Survey analysis", "People metrics", "Segmentation"]],
  ["pharmacy-sales", "Pharmacy Sales", "💊", "Healthcare", "Intermediate", "commerce", "Pharmacy transactions with region, product category, revenue, cost, and order status.", "A pharmacy network must monitor product availability, margin, and regional demand.", ["Sales trends", "Healthcare retail", "Margin analysis"]],
  ["warehouse-operations", "Warehouse Operations", "🏗️", "Supply Chain", "Intermediate", "operations", "Warehouse output with units, defects, cycle time, process, site, and cost.", "Distribution leadership needs to compare throughput, quality, and cost across warehouses.", ["Throughput", "Cycle time", "Operational variance"]],
  ["product-returns", "Product Returns", "↩️", "Retail", "Intermediate", "commerce", "Returned and completed orders with category, customer, revenue, cost, and status.", "Merchandising wants to identify return-heavy products and protect customer experience.", ["Return rate", "Category analysis", "Root causes"]],
  ["ride-sharing", "Ride Sharing", "🚕", "Power BI", "Advanced", "travel", "Trips with origin, destination, rider type, revenue, delay, and completion status.", "Marketplace operations must balance rider wait time, driver supply, and revenue.", ["Geographic analysis", "Marketplace KPIs", "DAX"]],
  ["mobile-app-events", "Mobile App Events", "📱", "SQL", "Advanced", "digital", "Product events by date, channel, device, users, sessions, conversions, and revenue.", "A product analyst must define activation and compare retention-driving behaviors.", ["Event analytics", "Funnels", "Window functions"]],
  ["energy-consumption", "Energy Consumption", "⚡", "Python", "Intermediate", "time-series", "Daily energy readings represented as open, high, low, close, volume, and change.", "An energy analyst needs to detect usage trends, peaks, and unusual daily changes.", ["Time-series cleaning", "Anomaly detection", "Rolling averages"]],
  ["real-estate-market", "Real Estate Market", "🏠", "Tableau", "Intermediate", "finance", "Property financing observations with market, product, amount, rate, risk, and status.", "A property team needs an interactive market and price dashboard for investment review.", ["Maps", "Parameters", "Market comparison"]],
  ["credit-card-transactions", "Credit Card Transactions", "💳", "SQL", "Advanced", "finance", "Card activity with customer, product, amount, rate, risk band, and review status.", "Fraud operations needs a queryable view of unusual transactions and review outcomes.", ["CASE", "Window functions", "Fraud indicators"]],
  ["social-media-campaigns", "Social Media Campaigns", "📲", "Marketing", "Intermediate", "campaign", "Social campaign reach, spend, clicks, conversions, and attributed revenue.", "A social team must compare creative and channel efficiency before the next launch.", ["Campaign ROI", "Engagement", "Creative testing"]],
  ["sales-pipeline", "Sales Pipeline", "🤝", "Sales", "Intermediate", "customer", "Accounts with segment, region, tenure, value, engagement, support, and sales outcome.", "Sales leadership needs to identify pipeline risk and improve win rate by segment.", ["Win rate", "Pipeline coverage", "Sales forecasting"]],
  ["procurement-spend", "Procurement Spend", "🧾", "Supply Chain", "Advanced", "finance", "Supplier-related financial records with amount, rate, risk, product, and status.", "Procurement must consolidate spend, identify concentration risk, and prioritize negotiations.", ["Spend analysis", "Supplier risk", "Savings opportunities"]],
  ["clinic-appointments", "Clinic Appointments", "🩺", "Healthcare", "Intermediate", "health", "Anonymized appointments by facility, department, patient group, service, cost, and outcome.", "Clinic operations wants to reduce missed appointments and improve access by patient cohort.", ["No-show rate", "Capacity", "Cohort analysis"]],
  ["fashion-retail", "Fashion Retail", "👗", "Retail", "Beginner", "inventory", "Fashion stock by product, category, location, availability, cost, and demand.", "A fashion retailer needs a seasonal inventory and replenishment view.", ["Sell-through", "Inventory", "Seasonality"]],
  ["workforce-diversity", "Workforce Diversity", "🤝", "HR", "Advanced", "people", "Anonymized workforce representation and outcome measures across departments and roles.", "HR needs a privacy-aware representation and progression review with small-group safeguards.", ["Representation", "Ethics", "Cohort comparison"]],
  ["budget-variance", "Budget Variance", "📒", "Excel", "Intermediate", "finance", "Department financial records with budget-like amounts, rates, risk flags, and status.", "Finance needs a repeatable monthly workbook for actual, plan, variance, driver, and owner.", ["Variance formulas", "Conditional formatting", "Executive summary"]],
  ["experiment-results", "Experiment Results", "🧪", "Statistics", "Advanced", "digital", "Experiment traffic with channel, device, users, sessions, conversions, and revenue.", "A product team must decide whether an observed conversion lift is reliable and meaningful.", ["A/B testing", "Confidence intervals", "Practical significance"]],
  ["dashboard-performance", "Dashboard Performance", "📊", "Power BI", "Intermediate", "service", "Analytics support interactions with team, topic, handle time, satisfaction, and resolution.", "A BI team needs to prioritize slow or confusing reports using adoption and support signals.", ["Usage metrics", "Performance KPIs", "Report optimization"]],
  ["customer-segments", "Customer Segments", "🧩", "Business Analytics", "Intermediate", "customer", "Customers with segment, geography, tenure, value, engagement, support, and outcome.", "A commercial team wants actionable customer segments for service, retention, and growth.", ["RFM", "CLV", "Segmentation"]],
] satisfies readonly DatasetTuple[];

const recommendedStudios: Record<
  DatasetCategory,
  { name: string; href: string }
> = {
  Excel: { name: "Formula Studio", href: "/formula-studio" },
  SQL: { name: "SQL Studio", href: "/sql-studio" },
  "Power BI": { name: "Power BI Studio", href: "/power-bi-studio" },
  Tableau: { name: "Tableau Studio", href: "/tableau-studio" },
  Python: { name: "Python Studio", href: "/python-studio" },
  Statistics: { name: "Statistics Studio", href: "/statistics-studio" },
  "Business Analytics": {
    name: "Business Analytics Studio",
    href: "/business-analytics-studio",
  },
  Marketing: {
    name: "Business Analytics Studio",
    href: "/business-analytics-studio",
  },
  Finance: {
    name: "Business Analytics Studio",
    href: "/business-analytics-studio",
  },
  HR: {
    name: "Business Analytics Studio",
    href: "/business-analytics-studio",
  },
  Sales: {
    name: "Business Analytics Studio",
    href: "/business-analytics-studio",
  },
  Healthcare: { name: "Power BI Studio", href: "/power-bi-studio" },
  Retail: { name: "Tableau Studio", href: "/tableau-studio" },
  "Supply Chain": {
    name: "Power Query Studio",
    href: "/power-query-studio",
  },
};

function createDataset(tuple: DatasetTuple): DatasetLibraryItem {
  const [
    id,
    name,
    icon,
    category,
    difficulty,
    schema,
    description,
    businessScenario,
    skills,
  ] = tuple;
  const columns = schemas[schema];
  const recommendedStudio = recommendedStudios[category];
  const tableName = id.replaceAll("-", "_");
  const firstDimension = columns[2].name;
  const primaryMeasure = columns[5].name;

  return {
    id,
    name,
    icon,
    category,
    difficulty,
    description,
    businessScenario,
    rowCount: 8,
    columnCount: columns.length,
    skillsPracticed: [...skills],
    csvPath: `/datasets/library/${id}.csv`,
    columns,
    recommendedStudio,
    suggestedQuestions: [
      `Which ${firstDimension.toLocaleLowerCase()} groups drive the strongest and weakest outcomes?`,
      `How does ${primaryMeasure} change over time, and where are the material exceptions?`,
      `What action would you recommend, who should own it, and which guardrail should be monitored?`,
    ],
    suggestedDashboards: [
      `${name} executive overview with KPIs, trend, segment comparison, and exceptions`,
      `${firstDimension} diagnostic dashboard with drill-down and an action tracker`,
    ],
    suggestedSQLQueries: [
      `SELECT * FROM ${tableName} LIMIT 10;`,
      `SELECT ${firstDimension}, COUNT(*) AS records FROM ${tableName} GROUP BY ${firstDimension} ORDER BY records DESC;`,
      `SELECT ${firstDimension}, AVG(${primaryMeasure}) AS avg_${primaryMeasure.toLocaleLowerCase()} FROM ${tableName} GROUP BY ${firstDimension};`,
    ],
    suggestedPowerBIVisuals: [
      `KPI cards for total records and average ${primaryMeasure}`,
      `Column chart comparing ${primaryMeasure} by ${firstDimension}`,
      "Trend line with slicers and a detail table for exceptions",
    ],
    suggestedTableauDashboards: [
      `${name} overview with highlight and filter actions`,
      `${firstDimension} comparison with a parameter-driven metric selector`,
      "Exception dashboard with tooltips and drill-through navigation",
    ],
    suggestedPythonAnalysis: [
      "Load and validate types, missing values, duplicates, and category consistency with pandas.",
      `Group by ${firstDimension} and compare the distribution of ${primaryMeasure}.`,
      "Create a reproducible chart and write a concise decision recommendation.",
    ],
    relatedLessons: [
      {
        title: `Continue in ${recommendedStudio.name}`,
        href: recommendedStudio.href,
      },
      { title: "Apply it in Practice Lab", href: "/practice" },
    ],
    xpReward:
      difficulty === "Beginner" ? 20 : difficulty === "Intermediate" ? 30 : 40,
  };
}

export const datasetLibrary = catalog.map(createDataset);

export function getDatasetLibraryItem(id: string) {
  return datasetLibrary.find((dataset) => dataset.id === id);
}
