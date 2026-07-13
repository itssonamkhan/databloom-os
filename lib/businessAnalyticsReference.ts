export const businessAnalyticsRoadmap = [
  { id: "frame", title: "1. Frame the decision", icon: "🎯", description: "Define the decision, stakeholder, success metric, scope, and evidence.", lessonIds: ["business-analytics-introduction", "business-problem-framing", "stakeholder-discovery", "issue-trees", "data-requirements"] },
  { id: "measure", title: "2. Design metrics", icon: "📏", description: "Build precise KPIs, leading indicators, North Star metrics, and financial measures.", lessonIds: ["kpis-vs-metrics", "leading-lagging-indicators", "smart-metrics", "north-star-metric", "profit-margin-analysis"] },
  { id: "customer", title: "3. Understand growth", icon: "🌿", description: "Analyze sales, marketing, customers, funnels, cohorts, retention, and experiments.", lessonIds: ["sales-performance", "funnel-analysis", "customer-segmentation", "retention-analysis", "ab-testing"] },
  { id: "operate", title: "4. Improve operations", icon: "⚙️", description: "Balance inventory, supply chain, process, quality, capacity, and people outcomes.", lessonIds: ["inventory-analytics", "supply-chain-analytics", "operations-analytics", "quality-defect-analysis", "hr-analytics"] },
  { id: "decide", title: "5. Decide under uncertainty", icon: "🌳", description: "Forecast, compare scenarios, quantify risk, and diagnose root causes.", lessonIds: ["forecasting-basics", "scenario-analysis", "risk-analysis", "business-decision-trees", "root-cause-analysis"] },
  { id: "communicate", title: "6. Communicate action", icon: "📖", description: "Tell a decision-ready story and turn insights into owned actions.", lessonIds: ["dashboard-storytelling", "executive-reporting", "stakeholder-communication", "recommendation-writing", "insights-to-actions"] },
  { id: "cases", title: "7. Solve business cases", icon: "🎓", description: "Apply the full workflow across industries and interview formats.", lessonIds: ["case-ecommerce", "case-saas", "case-retail", "case-study-structure", "interview-executive-presentation"] },
] as const;

export const businessFrameworks = [
  { name: "SMART", icon: "✅", purpose: "Define a specific, measurable, achievable, relevant, and time-bound metric.", lessonId: "smart-metrics" },
  { name: "Issue tree", icon: "🌳", purpose: "Break an outcome into clear driver branches and prioritize analysis.", lessonId: "issue-trees" },
  { name: "RFM", icon: "🛍️", purpose: "Segment customers by recency, frequency, and monetary value.", lessonId: "rfm-analysis" },
  { name: "Five Whys", icon: "❓", purpose: "Trace a symptom toward an evidence-based, actionable process cause.", lessonId: "five-whys" },
  { name: "Fishbone", icon: "🐟", purpose: "Organize possible causes before testing them with data.", lessonId: "fishbone-diagram" },
  { name: "Pareto", icon: "📊", purpose: "Focus on the few causes responsible for most measurable impact.", lessonId: "pareto-analysis" },
  { name: "SWOT", icon: "🧭", purpose: "Separate internal strengths and weaknesses from external opportunities and threats.", lessonId: "swot-analysis" },
  { name: "PESTLE", icon: "🌍", purpose: "Scan the external environment across six strategic dimensions.", lessonId: "pestle-analysis" },
] as const;

export const businessCaseStudies = [
  { industry: "E-commerce", icon: "🛒", question: "Why is revenue growth slowing?", lessonId: "case-ecommerce" },
  { industry: "Food delivery", icon: "🛵", question: "How can delivery time improve without hurting margin?", lessonId: "case-food-delivery" },
  { industry: "Retail", icon: "🏬", question: "Why are comparable stores diverging?", lessonId: "case-retail" },
  { industry: "SaaS", icon: "☁️", question: "Which activation behaviors predict retention?", lessonId: "case-saas" },
  { industry: "Banking", icon: "🏦", question: "How should growth balance risk and profitability?", lessonId: "case-banking" },
  { industry: "HR", icon: "🧑‍💼", question: "Where is preventable attrition concentrated?", lessonId: "case-hr" },
  { industry: "Marketing", icon: "📣", question: "Which campaign creates incremental profitable growth?", lessonId: "case-marketing-campaign" },
] as const;
