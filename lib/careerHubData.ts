export const careerSections = [
  "home",
  "roadmaps",
  "resume",
  "portfolio",
  "linkedin",
  "github",
  "internships",
  "jobs",
  "companies",
  "certifications",
  "checklist",
] as const;

export type CareerSection = (typeof careerSections)[number];

export const careerSectionMeta: Record<CareerSection, { label: string; icon: string }> = {
  home: { label: "Career Home", icon: "🌱" },
  roadmaps: { label: "Career Roadmaps", icon: "🗺️" },
  resume: { label: "Resume Guide", icon: "📄" },
  portfolio: { label: "Portfolio Guide", icon: "🖼️" },
  linkedin: { label: "LinkedIn Guide", icon: "💼" },
  github: { label: "GitHub Guide", icon: "🐙" },
  internships: { label: "Internship Tracker", icon: "🎓" },
  jobs: { label: "Job Application Tracker", icon: "📬" },
  companies: { label: "Company Explorer", icon: "🏢" },
  certifications: { label: "Certification Tracker", icon: "🏅" },
  checklist: { label: "Career Checklist", icon: "✅" },
};

export type Roadmap = {
  id: string;
  title: string;
  icon: string;
  description: string;
  steps: Array<{ id: string; stage: string; title: string; detail: string }>;
};

const roadmapStages = [
  ["Beginner stage", "Build the foundation", "Learn data types, spreadsheet logic, business questions, and clear analytical thinking."],
  ["Core skills", "Master analysis fundamentals", "Practice cleaning, querying, statistics, visualization, and communicating decisions."],
  ["Tools to learn", "Build your tool stack", "Develop practical fluency in the tools employers expect for this role."],
  ["Projects to build", "Create evidence", "Complete realistic end-to-end projects with a question, method, result, and recommendation."],
  ["Portfolio requirements", "Package your work", "Publish concise case studies with screenshots, decisions, limitations, and measurable outcomes."],
  ["Interview preparation", "Rehearse your story", "Practice technical questions, project walkthroughs, and structured behavioural examples."],
  ["Suggested certifications", "Validate selectively", "Choose one role-aligned certification only when it strengthens a demonstrated skill."],
  ["Job-ready checklist", "Prepare to apply", "Tailor your resume, profiles, portfolio, interview stories, and application workflow."],
] as const;

function makeRoadmap(id: string, title: string, icon: string, description: string, details: string[]): Roadmap {
  return {
    id,
    title,
    icon,
    description,
    steps: roadmapStages.map(([stage, fallbackTitle, fallbackDetail], index) => ({
      id: `roadmap:${id}:${index + 1}`,
      stage,
      title: details[index] ?? fallbackTitle,
      detail: index === 0 ? `${fallbackDetail} ${description}` : fallbackDetail,
    })),
  };
}

export const careerRoadmaps: Roadmap[] = [
  makeRoadmap("data-analyst", "Data Analyst", "📊", "Focus on practical insight, reporting, and stakeholder decisions.", ["Learn spreadsheets and analytical thinking", "Practice SQL, statistics, and data storytelling", "Excel, SQL, Power BI or Tableau, and Python", "Build sales, customer, operations, and finance analyses", "Publish three decision-focused case studies", "Rehearse SQL, dashboards, metrics, and project trade-offs", "Consider PL-300 or a focused analytics certificate", "Tailor applications and track follow-ups"]),
  makeRoadmap("business-analyst", "Business Analyst", "💼", "Focus on requirements, processes, metrics, and business change.", ["Learn business processes and structured problem solving", "Practice requirements, KPIs, process mapping, and communication", "Excel, SQL, BI tools, Jira, and diagramming", "Build requirements, KPI, and process-improvement cases", "Show decisions, stakeholders, and business impact", "Rehearse cases, requirements, conflict, and prioritization", "Consider ECBA or domain-specific learning", "Prepare requirements stories and outcome evidence"]),
  makeRoadmap("bi-developer", "BI Developer", "📈", "Focus on semantic models, trustworthy reporting, and performance.", ["Learn relational data and dashboard principles", "Practice dimensional modeling, DAX, SQL, and governance", "Power BI, SQL, Power Query, DAX, and Git", "Build executive, operations, and self-service BI solutions", "Document model design, measures, security, and performance", "Rehearse modeling, DAX, refresh, and stakeholder scenarios", "Consider Microsoft PL-300 or Fabric credentials", "Demonstrate production-minded dashboard delivery"]),
  makeRoadmap("analytics-engineer", "Analytics Engineer", "⚙️", "Focus on modeled data, quality, reproducibility, and analytics delivery.", ["Learn SQL deeply and understand warehouse concepts", "Practice modeling, testing, documentation, and version control", "SQL, dbt concepts, Git, Python, and a cloud warehouse", "Build tested marts and documented metric layers", "Show lineage, tests, conventions, and downstream use", "Rehearse SQL, modeling trade-offs, and data quality", "Consider a warehouse or dbt-aligned credential", "Demonstrate reliable, maintainable analytics systems"]),
  makeRoadmap("data-scientist", "Data Scientist", "🧠", "Focus on experiments, predictive modeling, and responsible evaluation.", ["Learn Python, statistics, and analytical problem framing", "Practice inference, modeling, validation, and communication", "Python, SQL, notebooks, Git, and ML libraries", "Build prediction, experimentation, and segmentation projects", "Document assumptions, baselines, metrics, and limitations", "Rehearse statistics, ML choices, cases, and project depth", "Consider a focused ML or cloud credential", "Show reproducible work and responsible model judgment"]),
];

export type Guide = {
  id: "resume" | "portfolio" | "linkedin" | "github";
  title: string;
  icon: string;
  intro: string;
  checklist: Array<{ id: string; label: string }>;
  sections: Array<{ title: string; points: string[] }>;
};

function checklist(guide: string, labels: string[]) {
  return labels.map((label, index) => ({ id: `guide:${guide}:${index + 1}`, label }));
}

export const careerGuides: Guide[] = [
  {
    id: "resume", title: "Resume Guide", icon: "📄", intro: "Build a concise, evidence-led resume that is readable by people and ATS systems.",
    checklist: checklist("resume", ["Use a simple ATS-readable layout", "Place contact details in selectable text", "Lead with a focused summary", "Describe projects with action, method, and outcome", "Match skills to evidence in projects", "Check dates, links, spelling, and consistency", "Tailor keywords honestly for the role", "Keep the strongest information on page one"]),
    sections: [
      { title: "Resume section order", points: ["Name and contact links", "Targeted summary", "Skills grouped by evidence", "Projects and experience", "Education and relevant certifications"] },
      { title: "Summary-writing guide", points: ["Name the target role", "State two or three strongest relevant skills", "Add a credible proof point", "Avoid generic enthusiasm without evidence"] },
      { title: "Project-description guide", points: ["Start with a strong action verb", "Name the dataset, question, and tools", "Explain the analytical decision", "End with an outcome, recommendation, or quantified result"] },
      { title: "Skills-section guide", points: ["Group tools by category", "List only skills you can discuss", "Prefer specific capabilities over long keyword lists"] },
      { title: "Common mistakes", points: ["Decorative layouts that break parsing", "Unsupported percentages", "Responsibilities without outcomes", "Broken links or inconsistent dates"] },
      { title: "Action-verb examples", points: ["Analyzed, automated, modeled, validated", "Designed, built, improved, reduced", "Presented, recommended, collaborated, documented"] },
      { title: "Fresher resume example", points: ["Summary: aspiring analyst with SQL, Excel, and BI project evidence", "Project: analyzed retail performance and recommended inventory actions", "Experience: include internships, volunteering, coursework, and leadership when relevant"] },
    ],
  },
  {
    id: "portfolio", title: "Portfolio Guide", icon: "🖼️", intro: "Turn projects into clear proof that you can make sound analytical decisions.",
    checklist: checklist("portfolio", ["Publish at least three role-relevant projects", "Give every project a clear business question", "Show cleaning and validation decisions", "Explain analysis and limitations", "Present dashboards with an audience and purpose", "Link readable GitHub repositories", "Provide a working live demo where useful", "Use consistent personal branding"]),
    sections: [
      { title: "Data project checklist", points: ["Question and success metric", "Data source and quality checks", "Method and tools", "Insights, limitations, and recommendation"] },
      { title: "Case-study structure", points: ["Context", "Challenge", "Approach", "Evidence", "Recommendation", "Reflection"] },
      { title: "Dashboard presentation", points: ["State the intended audience", "Lead with the decisions supported", "Use focused screenshots", "Explain interactions and metric definitions"] },
      { title: "GitHub and README", points: ["Use a descriptive repository name", "Add setup and data notes", "Show project structure", "Link the final dashboard or report"] },
      { title: "Live demo and branding", points: ["Test every public link", "Remove secrets and private data", "Use consistent name, photo, colors, and role statement"] },
    ],
  },
  {
    id: "linkedin", title: "LinkedIn Guide", icon: "💼", intro: "Make your profile easy for recruiters and peers to understand, search, and trust.",
    checklist: checklist("linkedin", ["Use a clear professional profile photo", "Add a simple role-relevant banner", "Write a keyword-rich truthful headline", "Create an evidence-led About section", "Complete education and experience", "Add projects and certifications", "Curate the Featured section", "Follow a sustainable networking routine"]),
    sections: [
      { title: "Photo and banner", points: ["Use a clear, approachable headshot", "Keep the banner uncluttered", "Use consistent portfolio branding"] },
      { title: "Headline and About", points: ["Combine target role, core skills, and value", "Open About with your analytical focus", "Add tools, project proof, and a clear next step"] },
      { title: "Experience and proof", points: ["Describe outcomes, not only duties", "Add projects and certifications with context", "Feature your best case studies and dashboards"] },
      { title: "Networking routine", points: ["Follow relevant analysts and teams", "Write useful comments", "Connect with a personal note", "Share learning and project decisions consistently"] },
      { title: "Recruiter-search keywords", points: ["Data Analyst, Business Analyst, BI Developer", "SQL, Excel, Power BI, Tableau, Python", "Dashboarding, reporting, data cleaning, stakeholder communication"] },
    ],
  },
  {
    id: "github", title: "GitHub Guide", icon: "🐙", intro: "Present repositories as professional, reproducible project evidence.",
    checklist: checklist("github", ["Complete your profile and role statement", "Use descriptive repository names", "Add a complete README to each featured project", "Make small meaningful commits", "Pin your strongest relevant repositories", "Include live demo links where useful", "Add readable screenshots", "Document setup, data, and limitations"]),
    sections: [
      { title: "Profile and repositories", points: ["Use the same identity as your portfolio", "Name repositories by problem or outcome", "Pin three to six role-aligned projects"] },
      { title: "README checklist", points: ["Problem and audience", "Data and tools", "Method and project structure", "Results and screenshots", "Setup, limitations, and links"] },
      { title: "Commit practices", points: ["Commit coherent changes", "Use clear imperative messages", "Avoid secrets and generated clutter", "Keep the main branch usable"] },
      { title: "Presentation", points: ["Crop useful screenshots", "Use accessible alt text", "Link demos and reports", "Document dependencies and reproduction steps"] },
    ],
  },
];

export const careerChecklistCategories = [
  ["Skills", ["Complete core spreadsheet practice", "Complete core SQL practice", "Build one BI dashboard", "Explain one analysis clearly"]],
  ["Resume", ["Finish the ATS checklist", "Tailor the summary", "Add evidence-led projects", "Check every link and date"]],
  ["LinkedIn", ["Complete headline and About", "Add projects", "Add role keywords", "Start a weekly networking routine"]],
  ["GitHub", ["Complete the profile", "Pin strong projects", "Improve READMEs", "Check live links and screenshots"]],
  ["Portfolio", ["Publish three projects", "Add case-study narratives", "Show limitations", "Add a clear contact path"]],
  ["Interview preparation", ["Practice technical questions", "Rehearse project walkthroughs", "Prepare behavioural stories", "Complete a timed mock interview"]],
  ["Applications", ["Choose target roles", "Build a company list", "Track every application", "Schedule follow-ups"]],
] as const;

export const careerChecklistItems = careerChecklistCategories.flatMap(([category, labels]) =>
  labels.map((label, index) => ({ id: `career:${category.toLowerCase().replaceAll(" ", "-")}:${index + 1}`, category, label })),
);

export type Company = {
  slug: string;
  name: string;
  type: string;
  overview: string;
  roles: string[];
  skills: string[];
  learningPath: string[];
  portfolioIdeas: string[];
  interviewTopics: string[];
};

const companySpecs = [
  ["google", "Google", "Technology"], ["microsoft", "Microsoft", "Technology"], ["amazon", "Amazon", "Technology and commerce"], ["meta", "Meta", "Technology"], ["netflix", "Netflix", "Media technology"], ["spotify", "Spotify", "Audio technology"], ["flipkart", "Flipkart", "E-commerce"], ["swiggy", "Swiggy", "Consumer technology"], ["zomato", "Zomato", "Consumer technology"], ["myntra", "Myntra", "Fashion e-commerce"], ["nykaa", "Nykaa", "Beauty and retail"], ["deloitte", "Deloitte", "Professional services"], ["ey", "EY", "Professional services"], ["kpmg", "KPMG", "Professional services"], ["pwc", "PwC", "Professional services"], ["accenture", "Accenture", "Technology consulting"], ["tcs", "TCS", "Technology services"], ["infosys", "Infosys", "Technology services"],
] as const;

export const companies: Company[] = companySpecs.map(([slug, name, type]) => ({
  slug,
  name,
  type,
  overview: `${name} operates in ${type.toLowerCase()}. Prepare by connecting strong analytics fundamentals to realistic customer, product, operations, and business decisions rather than relying on unstable hiring claims.`,
  roles: ["Data Analyst", "Business Analyst", "BI / Reporting Analyst", "Product or Operations Analyst"],
  skills: ["SQL and data validation", "Metrics and business judgment", "Dashboard communication", "Structured problem solving", "Stakeholder communication"],
  learningPath: ["Practice SQL and statistics", "Build an industry-relevant dashboard", "Complete a business case", "Rehearse projects in Interview Hub"],
  portfolioIdeas: [`Analyze ${type.toLowerCase()} customer behaviour`, "Build an executive KPI dashboard", "Investigate retention or operational efficiency"],
  interviewTopics: ["SQL and data quality", "Metric design", "Case analysis", "Dashboard interpretation", "Project decisions and trade-offs"],
}));

export const applicationChecklist = [
  "Research the company and role",
  "Tailor resume keywords honestly",
  "Select relevant portfolio evidence",
  "Prepare a concise role motivation",
  "Rehearse technical and behavioural examples",
  "Record the application and follow-up date",
];

export function getCompany(slug: string) {
  return companies.find((company) => company.slug === slug);
}

export const allCareerCompletionIds = [
  ...careerRoadmaps.flatMap((roadmap) => roadmap.steps.map((step) => step.id)),
  ...careerGuides.flatMap((guide) => guide.checklist.map((item) => item.id)),
  ...careerChecklistItems.map((item) => item.id),
];
