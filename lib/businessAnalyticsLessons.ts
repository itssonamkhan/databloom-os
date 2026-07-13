export const businessAnalyticsCategories = [
  "Foundations and Problem Framing",
  "Metrics and Financial Performance",
  "Customer, Sales, and Marketing",
  "Operations and People",
  "Forecasting and Decision Science",
  "Strategy and Communication",
  "Case Studies and Interviews",
] as const;

export const businessAnalyticsDifficulties = [
  "Beginner",
  "Intermediate",
  "Advanced",
] as const;

export type BusinessAnalyticsCategory =
  (typeof businessAnalyticsCategories)[number];
export type BusinessAnalyticsDifficulty =
  (typeof businessAnalyticsDifficulties)[number];

export type BusinessAnalyticsLesson = {
  id: string;
  title: string;
  icon: string;
  category: BusinessAnalyticsCategory;
  difficulty: BusinessAnalyticsDifficulty;
  description: string;
  explanation: string;
  whyItMatters: string;
  whenToUse: string[];
  steps: string[];
  businessExample: string;
  formula?: string;
  commonMistakes: string[];
  interviewTip: string;
  casePrompt: string;
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
  category: BusinessAnalyticsCategory,
  difficulty: BusinessAnalyticsDifficulty,
  description: string,
];

const catalog = [
  ["business-analytics-introduction", "Introduction to business analytics", "🌱", "Foundations and Problem Framing", "Beginner", "Use data, analysis, and business context to improve decisions and measurable outcomes."],
  ["analytics-lifecycle", "The analytics lifecycle", "🔄", "Foundations and Problem Framing", "Beginner", "Move from a decision and question through data, analysis, recommendation, action, and monitoring."],
  ["descriptive-analytics", "Descriptive analytics", "📊", "Foundations and Problem Framing", "Beginner", "Summarize what happened using trusted historical measures and useful comparisons."],
  ["diagnostic-analytics", "Diagnostic analytics", "🔍", "Foundations and Problem Framing", "Beginner", "Investigate why an outcome changed by segmenting drivers and testing plausible causes."],
  ["predictive-analytics", "Predictive analytics", "🔮", "Foundations and Problem Framing", "Intermediate", "Estimate what is likely to happen using patterns, assumptions, and validated models."],
  ["prescriptive-analytics", "Prescriptive analytics", "🧭", "Foundations and Problem Framing", "Intermediate", "Recommend what action to take under goals, constraints, costs, and uncertainty."],
  ["business-problem-framing", "Business problem framing", "🎯", "Foundations and Problem Framing", "Beginner", "Translate a broad concern into a decision, objective, scope, stakeholder, and measurable success condition."],
  ["stakeholder-discovery", "Stakeholder discovery", "🗣️", "Foundations and Problem Framing", "Beginner", "Clarify who owns the decision, who is affected, and what evidence each stakeholder needs."],
  ["hypothesis-driven-analysis", "Hypothesis-driven analysis", "🧪", "Foundations and Problem Framing", "Intermediate", "State testable explanations before exploring data so analysis remains focused."],
  ["issue-trees", "Issue trees", "🌳", "Foundations and Problem Framing", "Intermediate", "Break a complex business outcome into mutually exclusive, collectively useful driver branches."],
  ["data-requirements", "Defining data requirements", "🧾", "Foundations and Problem Framing", "Beginner", "Specify grain, fields, time range, source, quality rules, and refresh needs before analysis."],
  ["metric-grain", "Metric grain", "🔬", "Foundations and Problem Framing", "Intermediate", "Define the entity and time level at which a metric is calculated and interpreted."],
  ["baselines-benchmarks", "Baselines and benchmarks", "📏", "Foundations and Problem Framing", "Beginner", "Choose a meaningful reference such as prior period, target, peer, or control group."],
  ["data-quality-for-decisions", "Data quality for decisions", "🩺", "Foundations and Problem Framing", "Intermediate", "Assess completeness, validity, consistency, timeliness, uniqueness, and decision impact."],
  ["analytics-ethics-bias", "Analytics ethics and bias", "⚖️", "Foundations and Problem Framing", "Intermediate", "Identify privacy, fairness, proxy, selection, and interpretation risks before recommending action."],

  ["kpis-vs-metrics", "KPIs and metrics", "🎛️", "Metrics and Financial Performance", "Beginner", "Distinguish decision-critical performance indicators from supporting measurements."],
  ["leading-lagging-indicators", "Leading vs lagging indicators", "⏩", "Metrics and Financial Performance", "Beginner", "Pair early controllable signals with later outcome measures."],
  ["smart-metrics", "SMART metrics", "✅", "Metrics and Financial Performance", "Beginner", "Define measures that are specific, measurable, achievable, relevant, and time-bound."],
  ["north-star-metric", "North Star metrics", "⭐", "Metrics and Financial Performance", "Intermediate", "Select one durable measure of customer value that aligns teams without hiding guardrails."],
  ["guardrail-metrics", "Guardrail metrics", "🛡️", "Metrics and Financial Performance", "Intermediate", "Protect quality, risk, or customer experience while optimizing a primary metric."],
  ["revenue-analysis", "Revenue analysis", "💰", "Metrics and Financial Performance", "Beginner", "Decompose revenue by price, volume, mix, segment, channel, geography, and time."],
  ["cost-analysis", "Cost analysis", "🧮", "Metrics and Financial Performance", "Beginner", "Separate fixed, variable, direct, indirect, and avoidable costs for better decisions."],
  ["profit-margin-analysis", "Profit and margin analysis", "📈", "Metrics and Financial Performance", "Beginner", "Connect revenue and costs to gross profit, operating profit, and margin percentages."],
  ["unit-economics", "Unit economics", "🧱", "Metrics and Financial Performance", "Intermediate", "Evaluate revenue, variable cost, contribution, acquisition cost, and lifetime value per unit or customer."],
  ["growth-metrics", "Growth metrics", "🌿", "Metrics and Financial Performance", "Beginner", "Measure absolute and percentage change while controlling for base size and seasonality."],
  ["mom-yoy-growth", "MoM and YoY growth", "🗓️", "Metrics and Financial Performance", "Beginner", "Compare adjacent months and same-period years with consistent definitions."],
  ["variance-analysis", "Variance analysis", "↔️", "Metrics and Financial Performance", "Intermediate", "Explain differences between actual, budget, forecast, or prior results using accountable drivers."],
  ["break-even-analysis", "Break-even analysis", "⚖️", "Metrics and Financial Performance", "Intermediate", "Calculate the sales volume or revenue needed for contribution to cover fixed costs."],
  ["financial-ratios", "Financial ratio analysis", "🧾", "Metrics and Financial Performance", "Intermediate", "Interpret profitability, liquidity, leverage, efficiency, and return ratios in context."],
  ["budget-forecast-variance", "Budget vs forecast vs actual", "📚", "Metrics and Financial Performance", "Intermediate", "Separate original plan, latest expectation, and realized result for accountable reporting."],

  ["sales-pipeline-analytics", "Sales pipeline analytics", "🛤️", "Customer, Sales, and Marketing", "Beginner", "Track opportunities by stage, value, probability, age, owner, and expected close date."],
  ["sales-performance", "Sales performance analytics", "🏆", "Customer, Sales, and Marketing", "Beginner", "Compare revenue, bookings, units, mix, target attainment, and productivity across sellers and segments."],
  ["quota-attainment", "Quota attainment", "🎯", "Customer, Sales, and Marketing", "Beginner", "Measure seller or team performance against assigned targets with fair time and territory context."],
  ["win-rate", "Win rate", "🤝", "Customer, Sales, and Marketing", "Beginner", "Measure won opportunities as a share of decided opportunities using a stable cohort."],
  ["sales-cycle", "Sales cycle analysis", "⏱️", "Customer, Sales, and Marketing", "Intermediate", "Analyze time from qualified opportunity to close and locate stage delays."],
  ["marketing-analytics", "Marketing analytics", "📣", "Customer, Sales, and Marketing", "Beginner", "Connect campaign spend and audience behavior to qualified demand, revenue, and incremental value."],
  ["customer-acquisition-cost", "Customer acquisition cost", "🧲", "Customer, Sales, and Marketing", "Intermediate", "Divide acquisition spending by new customers using aligned scope and time."],
  ["roas-marketing-roi", "ROAS and marketing ROI", "💹", "Customer, Sales, and Marketing", "Intermediate", "Compare attributed revenue or incremental profit with marketing spend."],
  ["funnel-analysis", "Funnel analysis", "🔻", "Customer, Sales, and Marketing", "Beginner", "Measure movement and drop-off through ordered customer journey stages."],
  ["conversion-analysis", "Conversion analysis", "✨", "Customer, Sales, and Marketing", "Beginner", "Measure the share of eligible users who complete a defined action."],
  ["marketing-attribution", "Marketing attribution", "🧭", "Customer, Sales, and Marketing", "Advanced", "Assign conversion credit across touchpoints while acknowledging model limitations."],
  ["customer-analytics", "Customer analytics", "👥", "Customer, Sales, and Marketing", "Beginner", "Analyze customer acquisition, behavior, value, satisfaction, retention, and risk."],
  ["customer-segmentation", "Customer segmentation", "🧩", "Customer, Sales, and Marketing", "Intermediate", "Group customers by meaningful needs, behavior, value, or lifecycle characteristics."],
  ["rfm-analysis", "RFM analysis", "🛍️", "Customer, Sales, and Marketing", "Intermediate", "Score recency, frequency, and monetary value to identify actionable customer segments."],
  ["customer-lifetime-value", "Customer lifetime value", "💎", "Customer, Sales, and Marketing", "Advanced", "Estimate the future contribution value of a customer relationship."],
  ["churn-analysis", "Churn analysis", "🚪", "Customer, Sales, and Marketing", "Intermediate", "Define customer loss consistently and identify risk patterns, drivers, and preventable causes."],
  ["retention-analysis", "Retention analysis", "🪴", "Customer, Sales, and Marketing", "Intermediate", "Measure the share of a starting customer cohort that remains active over time."],
  ["cohort-analysis", "Cohort analysis", "🗓️", "Customer, Sales, and Marketing", "Intermediate", "Compare groups that started in the same period or experience to separate lifecycle from calendar effects."],
  ["nps-csat-ces", "NPS, CSAT, and CES", "🙂", "Customer, Sales, and Marketing", "Intermediate", "Use recommendation, satisfaction, and effort measures for distinct customer experience questions."],
  ["ab-testing", "A/B testing", "🧪", "Customer, Sales, and Marketing", "Intermediate", "Compare randomized variants to estimate causal impact on a predeclared outcome."],
  ["experiment-design", "Experiment design", "🔬", "Customer, Sales, and Marketing", "Advanced", "Define hypothesis, unit, randomization, sample, duration, metric, guardrail, and analysis plan before launch."],
  ["practical-significance", "Statistical vs practical significance", "📐", "Customer, Sales, and Marketing", "Advanced", "Separate evidence against chance from whether an effect is large enough to matter."],
  ["market-basket-analysis", "Market basket analysis", "🧺", "Customer, Sales, and Marketing", "Advanced", "Use support, confidence, and lift to identify products purchased together."],
  ["cross-sell-recommendations", "Cross-sell recommendations", "➕", "Customer, Sales, and Marketing", "Intermediate", "Turn product affinity and customer context into relevant, measurable offers."],
  ["pricing-analysis", "Pricing analysis", "🏷️", "Customer, Sales, and Marketing", "Advanced", "Evaluate price, volume, mix, elasticity, margin, and customer response before changing price."],

  ["inventory-analytics", "Inventory analytics", "📦", "Operations and People", "Beginner", "Balance availability, working capital, demand variability, lead time, and obsolescence."],
  ["inventory-turnover", "Inventory turnover", "🔄", "Operations and People", "Intermediate", "Measure how often average inventory is sold or consumed during a period."],
  ["stockout-service-level", "Stockouts and service level", "🚨", "Operations and People", "Intermediate", "Measure unmet demand and the ability to fulfill customer needs on time."],
  ["abc-inventory-analysis", "ABC inventory analysis", "🅰️", "Operations and People", "Intermediate", "Prioritize inventory control by cumulative annual consumption value."],
  ["supply-chain-analytics", "Supply chain analytics", "🚚", "Operations and People", "Beginner", "Analyze supplier, procurement, transport, warehouse, fulfillment, cost, and resilience performance."],
  ["otif", "On time in full", "✅", "Operations and People", "Intermediate", "Measure orders delivered by the promised date with the complete requested quantity."],
  ["lead-time-analysis", "Lead time analysis", "⏳", "Operations and People", "Intermediate", "Decompose elapsed time from request to delivery and identify delay variation."],
  ["operations-analytics", "Operations analytics", "⚙️", "Operations and People", "Beginner", "Improve throughput, quality, cost, capacity, and reliability in business processes."],
  ["process-cycle-time", "Process cycle time", "⏱️", "Operations and People", "Intermediate", "Measure elapsed time through a process and separate work time from waiting."],
  ["capacity-utilization", "Capacity utilization", "🏭", "Operations and People", "Intermediate", "Compare actual output with practical capacity while monitoring bottlenecks and quality."],
  ["quality-defect-analysis", "Quality and defect analytics", "🧯", "Operations and People", "Intermediate", "Measure defect rate, severity, source, rework, and cost of poor quality."],
  ["hr-analytics", "HR analytics", "🧑‍💼", "Operations and People", "Beginner", "Use workforce data to improve hiring, engagement, performance, development, and retention decisions."],
  ["employee-attrition", "Employee attrition analysis", "🚪", "Operations and People", "Intermediate", "Measure voluntary and involuntary exits and identify actionable risk patterns without confusing correlation with cause."],
  ["recruiting-funnel", "Recruiting funnel analytics", "🧑‍🤝‍🧑", "Operations and People", "Intermediate", "Track candidates from application through screening, interview, offer, acceptance, and start."],
  ["workforce-productivity", "Workforce productivity", "📈", "Operations and People", "Advanced", "Relate meaningful output to labor input without rewarding volume at the expense of quality or wellbeing."],

  ["forecasting-basics", "Forecasting basics", "🔮", "Forecasting and Decision Science", "Beginner", "Estimate future outcomes using historical patterns, drivers, assumptions, and uncertainty ranges."],
  ["moving-averages", "Moving averages", "〰️", "Forecasting and Decision Science", "Intermediate", "Smooth short-term noise using the average of a rolling number of periods."],
  ["trend-seasonality", "Trend and seasonality", "📈", "Forecasting and Decision Science", "Intermediate", "Separate long-run direction from recurring calendar patterns and irregular variation."],
  ["forecast-accuracy", "Forecast accuracy", "🎯", "Forecasting and Decision Science", "Intermediate", "Evaluate forecast errors with scale-appropriate metrics and bias checks."],
  ["scenario-analysis", "Scenario analysis", "🎭", "Forecasting and Decision Science", "Intermediate", "Compare coherent future states built from multiple linked assumptions."],
  ["what-if-analysis", "What-if analysis", "🎛️", "Forecasting and Decision Science", "Beginner", "Change selected inputs to observe how an outcome responds."],
  ["sensitivity-analysis", "Sensitivity analysis", "📶", "Forecasting and Decision Science", "Advanced", "Measure which uncertain inputs have the greatest influence on a result."],
  ["risk-analysis", "Risk analysis", "⚠️", "Forecasting and Decision Science", "Intermediate", "Identify likelihood, impact, exposure, controls, and response options for uncertain events."],
  ["expected-value", "Expected value", "🎲", "Forecasting and Decision Science", "Intermediate", "Weight each possible payoff by its probability to compare uncertain choices."],
  ["business-decision-trees", "Decision trees for business", "🌳", "Forecasting and Decision Science", "Advanced", "Map sequential decisions, chance events, probabilities, payoffs, and rollback values."],
  ["optimization-basics", "Optimization basics", "🧠", "Forecasting and Decision Science", "Advanced", "Choose decision variables that maximize or minimize an objective subject to constraints."],
  ["pareto-analysis", "Pareto analysis", "📊", "Forecasting and Decision Science", "Intermediate", "Rank causes by impact and use cumulative contribution to focus improvement effort."],
  ["root-cause-analysis", "Root cause analysis", "🕵️", "Forecasting and Decision Science", "Intermediate", "Move beyond symptoms by combining evidence, process knowledge, and causal hypotheses."],
  ["five-whys", "Five Whys", "❓", "Forecasting and Decision Science", "Beginner", "Ask successive evidence-based why questions until an actionable process cause is identified."],
  ["fishbone-diagram", "Fishbone diagram", "🐟", "Forecasting and Decision Science", "Intermediate", "Organize possible causes across categories before testing them with evidence."],

  ["swot-analysis", "SWOT analysis", "🧭", "Strategy and Communication", "Beginner", "Separate internal strengths and weaknesses from external opportunities and threats."],
  ["pestle-analysis", "PESTLE analysis", "🌍", "Strategy and Communication", "Intermediate", "Scan political, economic, social, technological, legal, and environmental forces."],
  ["competitive-benchmarking", "Competitive benchmarking", "🏁", "Strategy and Communication", "Intermediate", "Compare performance and practices with relevant peers using equivalent definitions."],
  ["dashboard-storytelling", "Dashboard storytelling", "📖", "Strategy and Communication", "Intermediate", "Guide viewers from context and signal to explanation, implication, and action."],
  ["executive-reporting", "Executive reporting", "👔", "Strategy and Communication", "Intermediate", "Communicate the few decision-critical outcomes, drivers, risks, and asks concisely."],
  ["stakeholder-communication", "Stakeholder communication", "💬", "Strategy and Communication", "Beginner", "Adapt detail, language, evidence, and recommendation to audience needs and decision authority."],
  ["visual-selection", "Choosing business visuals", "📉", "Strategy and Communication", "Beginner", "Match comparisons, trends, distributions, relationships, flows, and composition to suitable visual forms."],
  ["recommendation-writing", "Writing recommendations", "✍️", "Strategy and Communication", "Intermediate", "State the action, owner, timing, evidence, expected impact, risk, and measurement plan."],
  ["insights-to-actions", "Translating insights into actions", "🚀", "Strategy and Communication", "Intermediate", "Convert analytical findings into owned interventions with success metrics and review dates."],
  ["impact-effort-prioritization", "Impact-effort prioritization", "🗂️", "Strategy and Communication", "Beginner", "Compare expected value and implementation effort to sequence initiatives transparently."],
  ["action-monitoring", "Monitoring business actions", "📡", "Strategy and Communication", "Intermediate", "Track adoption, leading indicators, outcomes, guardrails, and unintended consequences after launch."],
  ["analytics-change-management", "Analytics change management", "🌉", "Strategy and Communication", "Advanced", "Build trust, ownership, workflow integration, training, and feedback around data-driven changes."],

  ["case-ecommerce", "Case study: e-commerce growth", "🛒", "Case Studies and Interviews", "Intermediate", "Diagnose slowing revenue through traffic, conversion, order value, retention, product mix, and channel economics."],
  ["case-food-delivery", "Case study: food delivery", "🛵", "Case Studies and Interviews", "Advanced", "Balance order growth, delivery time, cancellations, courier supply, restaurant quality, and contribution margin."],
  ["case-retail", "Case study: retail performance", "🏬", "Case Studies and Interviews", "Intermediate", "Explain store performance using traffic, conversion, basket size, assortment, inventory, and promotion metrics."],
  ["case-saas", "Case study: SaaS retention", "☁️", "Case Studies and Interviews", "Advanced", "Connect acquisition, activation, product usage, expansion, churn, retention, and lifetime value."],
  ["case-banking", "Case study: banking risk and growth", "🏦", "Case Studies and Interviews", "Advanced", "Evaluate customer growth, product adoption, credit risk, fraud, service, and profitability under controls."],
  ["case-hr", "Case study: employee attrition", "🧑‍💼", "Case Studies and Interviews", "Intermediate", "Frame attrition, compare cohorts, identify risk patterns, test explanations, and design ethical interventions."],
  ["case-marketing-campaign", "Case study: marketing campaign", "📣", "Case Studies and Interviews", "Intermediate", "Assess audience, spend, funnel, incrementality, revenue, margin, and payback across campaigns."],
  ["case-study-structure", "Structuring a business case", "🧱", "Case Studies and Interviews", "Intermediate", "Lead with the decision, define success, build a driver tree, prioritize analyses, and close with action."],
  ["interview-metric-design", "Interview: design a metric", "🎤", "Case Studies and Interviews", "Intermediate", "Define numerator, denominator, population, grain, window, exclusions, owner, target, and guardrails."],
  ["interview-estimation", "Interview: business estimation", "🧠", "Case Studies and Interviews", "Intermediate", "Estimate an unknown using transparent assumptions, segmentation, arithmetic, and sanity checks."],
  ["interview-root-cause", "Interview: root cause case", "🔍", "Case Studies and Interviews", "Advanced", "Structure drivers, request discriminating data, quantify contributions, and separate evidence from speculation."],
  ["interview-product-analytics", "Interview: product analytics case", "📱", "Case Studies and Interviews", "Advanced", "Frame user value, funnel, activation, engagement, retention, experiment, and guardrail metrics."],
  ["interview-operations", "Interview: operations case", "⚙️", "Case Studies and Interviews", "Advanced", "Diagnose service, throughput, capacity, quality, cost, and variability before recommending process changes."],
  ["interview-executive-presentation", "Interview: executive presentation", "🗣️", "Case Studies and Interviews", "Advanced", "Present the answer first, support it with decisive evidence, quantify impact, and state the ask."],
  ["interview-portfolio-walkthrough", "Interview: portfolio walkthrough", "🎓", "Case Studies and Interviews", "Advanced", "Explain context, ownership, method, tradeoffs, validation, outcome, and what you would improve."],
] satisfies readonly LessonTuple[];

const formulas: Partial<Record<(typeof catalog)[number][0], string>> = {
  "revenue-analysis": "Revenue = Price × Quantity",
  "profit-margin-analysis": "Profit = Revenue − Cost\nMargin % = Profit ÷ Revenue × 100",
  "unit-economics": "Contribution per unit = Unit revenue − Variable cost per unit",
  "growth-metrics": "Growth % = (Current − Previous) ÷ Previous × 100",
  "mom-yoy-growth": "YoY growth % = (Current period − Same period last year) ÷ Same period last year × 100",
  "variance-analysis": "Variance = Actual − Plan\nVariance % = (Actual − Plan) ÷ Plan × 100",
  "break-even-analysis": "Break-even units = Fixed costs ÷ (Price per unit − Variable cost per unit)",
  "quota-attainment": "Quota attainment % = Actual sales ÷ Quota × 100",
  "win-rate": "Win rate % = Won opportunities ÷ (Won + Lost opportunities) × 100",
  "customer-acquisition-cost": "CAC = Acquisition sales and marketing cost ÷ New customers acquired",
  "roas-marketing-roi": "ROAS = Attributed revenue ÷ Ad spend\nMarketing ROI = Incremental profit ÷ Marketing spend",
  "conversion-analysis": "Conversion rate % = Conversions ÷ Eligible visitors × 100",
  "customer-lifetime-value": "Simple CLV = Average order value × Purchase frequency × Customer lifespan × Gross margin %",
  "churn-analysis": "Churn rate % = Customers lost during period ÷ Customers at start of period × 100",
  "retention-analysis": "Retention rate % = Customers retained from starting cohort ÷ Customers at start × 100",
  "market-basket-analysis": "Lift(A→B) = Confidence(A→B) ÷ Support(B)",
  "inventory-turnover": "Inventory turnover = Cost of goods sold ÷ Average inventory",
  "otif": "OTIF % = Orders delivered on time and in full ÷ Total orders × 100",
  "capacity-utilization": "Capacity utilization % = Actual output ÷ Practical capacity × 100",
  "employee-attrition": "Attrition rate % = Employee exits ÷ Average headcount × 100",
  "moving-averages": "n-period moving average = Sum of last n observations ÷ n",
  "forecast-accuracy": "MAPE = Average(|Actual − Forecast| ÷ |Actual|) × 100",
  "expected-value": "Expected value = Σ(Probability × Payoff)",
};

const examples: Record<BusinessAnalyticsCategory, string> = {
  "Foundations and Problem Framing": "A regional manager asks why performance fell; the analyst defines the decision, period, segments, metric grain, and evidence needed before querying data.",
  "Metrics and Financial Performance": "An executive team reviews actual performance against target and traces the gap through price, volume, mix, and cost drivers.",
  "Customer, Sales, and Marketing": "A growth team compares channels and customer cohorts to decide where the next campaign budget should go.",
  "Operations and People": "An operations leader compares locations to identify a process bottleneck while protecting quality and employee wellbeing.",
  "Forecasting and Decision Science": "A planning team evaluates demand, uncertainty, and constraints before choosing a capacity plan.",
  "Strategy and Communication": "An analyst turns a complex analysis into a short recommendation with owner, timing, impact, risk, and follow-up measures.",
  "Case Studies and Interviews": "A candidate structures an ambiguous case, requests the most discriminating data, quantifies drivers, and communicates a decision-ready recommendation.",
};

function arrangeOptions(id: string, correctAnswer: string) {
  const choices = [
    correctAnswer,
    "Choose the most visually impressive chart before defining the business decision.",
    "Report one overall average without validating segments, definitions, or possible tradeoffs.",
  ];
  const offset =
    Array.from(id).reduce(
      (total, character) => total + character.charCodeAt(0),
      0,
    ) % choices.length;
  return [...choices.slice(offset), ...choices.slice(0, offset)];
}

function createLesson(tuple: LessonTuple): BusinessAnalyticsLesson {
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
    explanation: `${description} The analyst keeps the definition, population, time window, comparison, and decision owner explicit so the result can be trusted.`,
    whyItMatters: `Strong ${title.toLocaleLowerCase()} helps a team distinguish a useful decision signal from an attractive but unactionable number.`,
    whenToUse: [
      `Use ${title.toLocaleLowerCase()} when it can change a real business decision or priority.`,
      "Use it when the metric definition, comparison, assumptions, and intended action can be made explicit.",
    ],
    steps: [
      "State the business decision, objective, owner, scope, and time horizon.",
      `Define the measures, segments, comparison, and assumptions required for ${title.toLocaleLowerCase()}.`,
      "Analyze the largest drivers, validate definitions and data quality, and test alternative explanations.",
      "Translate the result into an action, expected impact, guardrails, owner, and review date.",
    ],
    businessExample: examples[category],
    formula: formulas[id],
    commonMistakes: [
      "Starting with available data or a preferred chart instead of the decision and success definition.",
      "Presenting correlation, an aggregate average, or a forecast as certainty without segments, assumptions, and guardrails.",
    ],
    interviewTip: `For ${title.toLocaleLowerCase()}, lead with a clear framework, define the metric precisely, quantify the key driver, and close with an owned action and validation plan.`,
    casePrompt: `${examples[category]} Apply ${title.toLocaleLowerCase()} to decide what the team should investigate or do next.`,
    practiceQuestion: `Which approach best demonstrates sound ${title.toLocaleLowerCase()}?`,
    practiceOptions: arrangeOptions(id, correctAnswer),
    correctAnswer,
    hint: "Choose the option that defines a decision-ready, measurable approach rather than a chart-first shortcut.",
    xpReward,
    relatedLessonIds: [],
  };
}

const lessons = catalog.map(createLesson);

export const businessAnalyticsLessons = lessons.map((lesson, index) => ({
  ...lesson,
  relatedLessonIds: [lessons[index - 1]?.id, lessons[index + 1]?.id].filter(
    (id): id is string => Boolean(id),
  ),
}));

export function getBusinessAnalyticsLesson(id: string) {
  return businessAnalyticsLessons.find((lesson) => lesson.id === id);
}

export function getNextBusinessAnalyticsLesson(id: string) {
  const index = businessAnalyticsLessons.findIndex((lesson) => lesson.id === id);
  return index >= 0 ? businessAnalyticsLessons[index + 1] : undefined;
}
