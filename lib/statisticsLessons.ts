export type StatisticsDifficulty = "Beginner" | "Intermediate" | "Advanced";

export type StatisticsLesson = {
  id: string;
  title: string;
  icon: string;
  category: string;
  difficulty: StatisticsDifficulty;
  description: string;
  explanation: string;
  formula: string;
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

type Topic = readonly [
  id: string,
  title: string,
  icon: string,
  category: string,
  difficulty: StatisticsDifficulty,
  description: string,
  formula: string,
  example: string,
  practiceTask?: string,
  acceptedAnswers?: readonly string[],
  hint?: string,
];

const topics: Topic[] = [
  ["population-sample", "Population and sample", "👥", "Foundations", "Beginner", "Distinguish the full group from the subset you actually observe.", "Population → all units; Sample → observed subset", "All customers are the population; 500 surveyed customers are the sample."],
  ["data-types", "Statistical data types", "🔤", "Foundations", "Beginner", "Recognize categorical, ordinal, discrete, and continuous variables.", "Categorical | Ordinal | Discrete | Continuous", "Region is categorical; satisfaction 1–5 is ordinal; sales is continuous."],
  ["parameters-statistics", "Parameters and statistics", "🏷️", "Foundations", "Beginner", "Separate a population truth from a value estimated using a sample.", "Parameter: μ, σ, p | Statistic: x̄, s, p̂", "The sample mean x̄ estimates population mean μ."],
  ["mean", "Arithmetic mean", "➗", "Descriptive Statistics", "Beginner", "Calculate the familiar average of numeric values.", "x̄ = Σx / n", "For 10, 20, 30: mean = 60 / 3 = 20.", "Find the mean of 10, 20, and 30.", ["20", "mean = 20", "20.0"], "Add the values and divide by 3."],
  ["median", "Median", "🎯", "Descriptive Statistics", "Beginner", "Find the middle ordered value, which is resistant to outliers.", "Median = middle ordered value", "For 5, 8, 100: median = 8.", "Find the median of 5, 8, and 100.", ["8", "median = 8"], "Order the values and choose the middle one."],
  ["mode", "Mode", "🔁", "Descriptive Statistics", "Beginner", "Identify the value or category that occurs most often.", "Mode = most frequent value", "For North, West, North: mode = North.", "Find the mode of North, West, North.", ["north", "mode = north"], "Count how often each value appears."],
  ["weighted-mean", "Weighted mean", "⚖️", "Descriptive Statistics", "Intermediate", "Average values that contribute in different proportions.", "x̄w = Σ(wx) / Σw", "Scores 80 and 90 weighted 40% and 60% give 86.", "Find the weighted mean of 80 at 40% and 90 at 60%.", ["86", "86.0", "weighted mean = 86"], "Multiply each score by its weight and add."],
  ["range", "Range", "↔️", "Descriptive Statistics", "Beginner", "Measure the full distance from the smallest to largest value.", "Range = max − min", "For 12, 19, 32: range = 32 − 12 = 20.", "Find the range of 12, 19, and 32.", ["20", "range = 20"], "Subtract the minimum from the maximum."],
  ["variance", "Variance", "📐", "Descriptive Statistics", "Intermediate", "Measure average squared distance from the mean.", "Sample variance: s² = Σ(x − x̄)² / (n − 1)", "A larger variance means values are more dispersed.", "What symbol commonly represents sample variance?", ["s²", "s^2", "s2"], "It is the square of sample standard deviation."],
  ["standard-deviation", "Standard deviation", "📏", "Descriptive Statistics", "Intermediate", "Express typical spread in the original unit of the data.", "s = √s²", "If variance is 25, standard deviation is 5.", "Find the standard deviation when variance is 25.", ["5", "standard deviation = 5", "sd = 5"], "Take the square root of variance."],
  ["quartiles", "Quartiles", "4️⃣", "Descriptive Statistics", "Intermediate", "Split ordered data into four equal sections.", "Q1 = 25th percentile; Q2 = median; Q3 = 75th percentile", "Q2 is always the median."],
  ["iqr", "Interquartile range", "📦", "Descriptive Statistics", "Intermediate", "Measure the spread of the middle 50% of values.", "IQR = Q3 − Q1", "If Q1 = 20 and Q3 = 50, IQR = 30.", "Find IQR when Q1 is 20 and Q3 is 50.", ["30", "iqr = 30"], "Subtract Q1 from Q3."],
  ["percentiles", "Percentiles", "💯", "Descriptive Statistics", "Intermediate", "Describe the percentage of observations at or below a value.", "Pk = value with k% of observations at or below it", "The 90th percentile is at least as large as 90% of observations."],
  ["outliers", "Outlier detection", "🚨", "Descriptive Statistics", "Intermediate", "Flag unusual values without automatically assuming they are errors.", "Lower = Q1 − 1.5×IQR; Upper = Q3 + 1.5×IQR", "With Q1=20 and IQR=10, lower fence=5.", "Find the lower fence when Q1=20 and IQR=10.", ["5", "lower fence = 5"], "Compute 20 − 1.5×10."],
  ["coefficient-variation", "Coefficient of variation", "📊", "Descriptive Statistics", "Advanced", "Compare relative variability across measures with different scales.", "CV = (standard deviation / mean) × 100%", "Mean 50 and SD 5 gives CV 10%.", "Find CV for mean 50 and SD 5.", ["10%", "10", "cv = 10%"], "Divide 5 by 50 and convert to percent."],
  ["skewness", "Skewness", "🛝", "Descriptive Statistics", "Intermediate", "Describe whether a distribution has a longer left or right tail.", "Positive skew → right tail; Negative skew → left tail", "Income is often positively skewed."],
  ["kurtosis", "Kurtosis", "⛰️", "Descriptive Statistics", "Advanced", "Describe tail heaviness relative to a normal distribution.", "Excess kurtosis = kurtosis − 3", "High positive excess kurtosis indicates heavier tails."],
  ["probability-basics", "Probability basics", "🎲", "Probability", "Beginner", "Represent uncertainty on a scale from impossible to certain.", "0 ≤ P(A) ≤ 1", "P(A)=0.25 means a 25% chance."],
  ["complement-rule", "Complement rule", "🔄", "Probability", "Beginner", "Find the chance that an event does not happen.", "P(not A) = 1 − P(A)", "If conversion probability is 0.2, no-conversion probability is 0.8.", "Find P(not A) when P(A)=0.2.", ["0.8", "80%", "p(not a) = 0.8"], "Subtract 0.2 from 1."],
  ["addition-rule", "Addition rule", "➕", "Probability", "Intermediate", "Find the probability that A or B occurs.", "P(A∪B)=P(A)+P(B)−P(A∩B)", "Subtract the overlap so it is not counted twice."],
  ["multiplication-rule", "Multiplication rule", "✖️", "Probability", "Intermediate", "Find the probability that independent events both occur.", "Independent: P(A∩B)=P(A)×P(B)", "Two independent 0.5 events both occur with probability 0.25.", "Find the probability of two independent 0.5 events both occurring.", ["0.25", "25%"], "Multiply 0.5 by 0.5."],
  ["conditional-probability", "Conditional probability", "🧩", "Probability", "Intermediate", "Measure probability given that another event is already known.", "P(A|B)=P(A∩B)/P(B)", "Conversion among mobile users is P(convert | mobile)."],
  ["bayes-theorem", "Bayes’ theorem", "🔍", "Probability", "Advanced", "Update a probability after observing new evidence.", "P(A|B)=P(B|A)P(A)/P(B)", "Use a test result to update prior risk."],
  ["expected-value", "Expected value", "💰", "Probability", "Intermediate", "Calculate the long-run average outcome of uncertain choices.", "E(X)=Σ[x×P(x)]", "A 50% chance of ₹100 and 50% of ₹0 has expected value ₹50.", "Find expected value for 50% chance of 100 and 50% chance of 0.", ["50", "₹50", "expected value = 50"], "Multiply each outcome by its probability and add."],
  ["permutations", "Permutations", "🔢", "Probability", "Intermediate", "Count arrangements when order matters.", "nPr = n!/(n−r)!", "Choosing president and vice-president is a permutation."],
  ["combinations", "Combinations", "🧺", "Probability", "Intermediate", "Count selections when order does not matter.", "nCr = n!/[r!(n−r)!]", "Choosing 2 interviewees from 5 gives 10 combinations.", "How many ways can you choose 2 items from 5?", ["10", "5c2 = 10"], "Use 5! divided by 2!3!."],
  ["random-variables", "Random variables", "🎰", "Distributions", "Beginner", "Map uncertain outcomes to numeric values.", "X = numerical outcome of a random process", "X can be the number of purchases in one session."],
  ["discrete-continuous", "Discrete vs continuous", "🔣", "Distributions", "Beginner", "Distinguish countable outcomes from measured values.", "Discrete → counts; Continuous → measurements", "Orders are discrete; delivery time is continuous."],
  ["bernoulli-distribution", "Bernoulli distribution", "🪙", "Distributions", "Intermediate", "Model one trial with success or failure.", "X~Bernoulli(p); E(X)=p", "One visitor either converts (1) or does not (0)."],
  ["binomial-distribution", "Binomial distribution", "🎯", "Distributions", "Intermediate", "Model the number of successes in fixed independent trials.", "P(X=k)=C(n,k)p^k(1−p)^(n−k)", "Conversions among 100 independent visitors."],
  ["normal-distribution", "Normal distribution", "🔔", "Distributions", "Intermediate", "Understand the symmetric bell-shaped distribution.", "X~N(μ,σ²)", "Many measurement errors are approximately normal."],
  ["z-score", "Z-scores", "Z️⃣", "Distributions", "Intermediate", "Express how many standard deviations a value is from the mean.", "z=(x−μ)/σ", "x=70, mean=50, SD=10 gives z=2.", "Find z for x=70, mean=50, SD=10.", ["2", "z = 2", "2.0"], "Subtract 50 from 70, then divide by 10."],
  ["uniform-distribution", "Uniform distribution", "▬", "Distributions", "Intermediate", "Model outcomes that are equally likely within a range.", "Continuous uniform density: 1/(b−a)", "A random arrival equally likely from minute 0 to 10."],
  ["poisson-distribution", "Poisson distribution", "📞", "Distributions", "Advanced", "Model event counts in a fixed interval.", "P(X=k)=e^(−λ)λ^k/k!", "Support tickets arriving per hour."],
  ["exponential-distribution", "Exponential distribution", "⏱️", "Distributions", "Advanced", "Model waiting time between Poisson events.", "f(x)=λe^(−λx), x≥0", "Minutes between support tickets."],
  ["central-limit-theorem", "Central limit theorem", "🏛️", "Distributions", "Advanced", "Understand why sample means become approximately normal.", "x̄ ≈ N(μ, σ²/n) for sufficiently large n", "Repeated large samples produce a bell-shaped distribution of means."],
  ["law-large-numbers", "Law of large numbers", "🌊", "Distributions", "Intermediate", "Understand why sample averages stabilize as observations grow.", "x̄ → μ as n grows", "Average conversion rate stabilizes with more visitors."],
  ["sampling-methods", "Sampling methods", "🧪", "Sampling", "Beginner", "Choose simple random, systematic, stratified, or cluster samples.", "Random | Systematic | Stratified | Cluster", "Stratify customers by region before sampling."],
  ["sampling-bias", "Sampling bias", "⚠️", "Sampling", "Intermediate", "Recognize samples that systematically miss part of the population.", "Bias = systematic difference from target population", "Surveying only premium users overstates satisfaction."],
  ["standard-error", "Standard error", "📏", "Sampling", "Intermediate", "Measure how much a statistic varies across repeated samples.", "SE(x̄)=s/√n", "SD=20 and n=100 gives SE=2.", "Find SE when SD=20 and n=100.", ["2", "se = 2", "2.0"], "Divide 20 by square root of 100."],
  ["sample-size", "Sample size", "📦", "Sampling", "Advanced", "Balance precision, power, cost, and practical constraints.", "Mean estimate: n≈(zσ/E)²", "Smaller margin of error needs a larger sample."],
  ["bootstrap", "Bootstrap resampling", "🥾", "Sampling", "Advanced", "Estimate uncertainty by sampling observed rows with replacement.", "Resample with replacement many times", "Bootstrap a median when its analytic SE is inconvenient."],
  ["confidence-interval-mean", "Confidence interval for a mean", "🎯", "Confidence Intervals", "Intermediate", "Estimate a plausible range for a population mean.", "x̄ ± critical value × SE", "Mean 50, margin 4 gives [46,54].", "Give the interval for mean 50 with margin 4.", ["46 to 54", "[46, 54]", "46-54"], "Subtract and add 4."],
  ["confidence-interval-proportion", "Confidence interval for a proportion", "📊", "Confidence Intervals", "Advanced", "Estimate a plausible range for a population rate.", "p̂ ± z*√[p̂(1−p̂)/n]", "Estimate uncertainty around conversion rate."],
  ["confidence-interpretation", "Interpreting confidence intervals", "💬", "Confidence Intervals", "Intermediate", "Explain confidence without claiming a fixed parameter moves randomly.", "95% method coverage over repeated samples", "Across repeated samples, 95% of constructed intervals cover the true value."],
  ["margin-error", "Margin of error", "↔️", "Confidence Intervals", "Intermediate", "Quantify the half-width of a confidence interval.", "Margin = critical value × SE", "Critical value 2 and SE 3 gives margin 6.", "Find margin when critical value=2 and SE=3.", ["6", "margin = 6"], "Multiply 2 by 3."],
  ["null-alternative", "Null and alternative hypotheses", "⚔️", "Hypothesis Testing", "Beginner", "State the baseline claim and the competing claim.", "H₀: no effect; H₁: effect or difference", "H₀: conversion rates are equal."],
  ["p-value", "P-values", "🧾", "Hypothesis Testing", "Intermediate", "Measure how surprising the data is if the null were true.", "p=P(result at least this extreme | H₀)", "p=0.03 is evidence against H₀ at α=0.05."],
  ["significance-level", "Significance level", "🚦", "Hypothesis Testing", "Beginner", "Choose the false-positive threshold before inspecting results.", "Reject H₀ when p≤α", "At α=0.05 and p=0.03, reject H₀.", "At alpha 0.05 and p-value 0.03, reject or fail to reject?", ["reject", "reject h0", "reject the null"], "The p-value is below alpha."],
  ["type-errors", "Type I and Type II errors", "🚨", "Hypothesis Testing", "Intermediate", "Understand false positives and false negatives.", "Type I: reject true H₀; Type II: fail to reject false H₀", "A false experiment winner is a Type I error."],
  ["one-two-tailed", "One-tailed vs two-tailed tests", "↔️", "Hypothesis Testing", "Intermediate", "Match directional or non-directional alternatives to the question.", "One-tailed: > or <; Two-tailed: ≠", "Testing any difference uses two tails."],
  ["one-sample-t-test", "One-sample t-test", "1️⃣", "Hypothesis Testing", "Intermediate", "Compare a sample mean with a benchmark.", "t=(x̄−μ₀)/(s/√n)", "Test whether average order value differs from ₹1,000."],
  ["independent-t-test", "Independent t-test", "👥", "Hypothesis Testing", "Intermediate", "Compare means from two independent groups.", "t=(x̄₁−x̄₂)/SEdifference", "Compare order value for two separate customer groups."],
  ["paired-t-test", "Paired t-test", "👯", "Hypothesis Testing", "Intermediate", "Compare before-and-after measurements on the same units.", "Test the mean of paired differences", "Compare employee productivity before and after training."],
  ["chi-square", "Chi-square test", "🔲", "Hypothesis Testing", "Advanced", "Test association between categorical variables.", "χ²=Σ(O−E)²/E", "Test whether device type and conversion are associated."],
  ["anova", "ANOVA", "🧮", "Hypothesis Testing", "Advanced", "Compare means across three or more groups.", "F=between-group variance / within-group variance", "Compare average sales across four regions."],
  ["nonparametric-tests", "Nonparametric tests", "🪨", "Hypothesis Testing", "Advanced", "Compare groups when parametric assumptions are unsuitable.", "Mann–Whitney | Wilcoxon | Kruskal–Wallis", "Use Mann–Whitney for two independent skewed groups."],
  ["statistical-power", "Statistical power", "🔋", "Hypothesis Testing", "Advanced", "Measure the chance of detecting a real effect.", "Power=1−β", "If beta is 0.2, power is 0.8.", "Find power when beta=0.2.", ["0.8", "80%", "power = 0.8"], "Subtract beta from 1."],
  ["correlation", "Correlation", "🔗", "Correlation and Regression", "Beginner", "Summarize the direction and strength of association.", "−1≤r≤1", "r=0.8 indicates a strong positive linear relationship."],
  ["correlation-causation", "Correlation vs causation", "🧠", "Correlation and Regression", "Beginner", "Avoid treating an association as proof of cause.", "Correlation ≠ causation", "Ice cream sales and sunburns share a weather confounder."],
  ["pearson-correlation", "Pearson correlation", "📏", "Correlation and Regression", "Intermediate", "Measure linear association between continuous variables.", "r=cov(X,Y)/(sX sY)", "Use Pearson for roughly linear numeric relationships."],
  ["spearman-correlation", "Spearman correlation", "🏁", "Correlation and Regression", "Intermediate", "Measure monotonic association using ranks.", "ρ=correlation of ranks", "Use Spearman for ordinal scores or nonlinear monotonic patterns."],
  ["simple-regression", "Simple linear regression", "📈", "Correlation and Regression", "Intermediate", "Model a numeric outcome using one predictor.", "ŷ=β₀+β₁x", "Predict sales from advertising spend."],
  ["multiple-regression", "Multiple regression", "🧩", "Correlation and Regression", "Advanced", "Model an outcome using several predictors.", "ŷ=β₀+β₁x₁+…+βkxk", "Predict sales from spend, region, and season."],
  ["r-squared", "R-squared", "R²", "Correlation and Regression", "Intermediate", "Describe the fraction of outcome variance explained by a model.", "R²=1−SSE/SST", "R²=0.70 means 70% of variation is explained."],
  ["residuals", "Residuals", "📉", "Correlation and Regression", "Intermediate", "Inspect prediction errors for model problems.", "Residual=e=y−ŷ", "Actual 120 and predicted 100 gives residual 20.", "Find residual when actual=120 and predicted=100.", ["20", "residual = 20"], "Subtract prediction from actual."],
  ["regression-assumptions", "Regression assumptions", "📋", "Correlation and Regression", "Advanced", "Check linearity, independence, constant variance, and residual behavior.", "Linearity | Independence | Homoscedasticity | Residual normality", "A funnel residual plot suggests nonconstant variance."],
  ["mae-rmse", "MAE and RMSE", "🎯", "Correlation and Regression", "Advanced", "Evaluate prediction error with interpretable metrics.", "MAE=mean(|e|); RMSE=√mean(e²)", "RMSE penalizes large errors more strongly than MAE."],
  ["ab-test-design", "A/B test design", "🧪", "A/B Testing", "Intermediate", "Randomly compare a control and treatment on a predefined metric.", "Random assignment + control + treatment + primary metric", "Compare checkout A and B on conversion rate."],
  ["ab-primary-metric", "Primary and guardrail metrics", "🛡️", "A/B Testing", "Intermediate", "Choose one decision metric and safety metrics before launch.", "Primary metric + guardrails", "Conversion is primary; refund rate is a guardrail."],
  ["conversion-rate", "Conversion rate", "🛒", "A/B Testing", "Beginner", "Calculate the share of visitors completing an action.", "Conversion rate=conversions/visitors", "120 conversions from 1000 visitors gives 12%.", "Find conversion rate for 120 conversions and 1000 visitors.", ["12%", "0.12", "conversion rate = 12%"], "Divide 120 by 1000."],
  ["absolute-relative-lift", "Absolute and relative lift", "🚀", "A/B Testing", "Intermediate", "Express an experiment change in percentage points and percent.", "Absolute=B−A; Relative=(B−A)/A", "10% to 12% is +2 points and +20% relative."],
  ["experiment-significance", "Experiment significance", "✅", "A/B Testing", "Advanced", "Combine effect size, uncertainty, and predefined thresholds.", "Decision uses estimate + CI + p-value + guardrails", "A small p-value alone does not guarantee business value."],
  ["practical-significance", "Practical significance", "💼", "A/B Testing", "Intermediate", "Decide whether an effect is large enough to matter commercially.", "Business impact≈effect×eligible volume×value", "A tiny lift may matter at very high traffic."],
  ["multiple-testing", "Multiple testing", "🎯", "A/B Testing", "Advanced", "Control false positives when testing many metrics or variants.", "Bonferroni α/m | FDR procedures", "Testing 20 metrics at 5% creates many false-alarm opportunities."],
  ["business-kpis", "Business KPI statistics", "💹", "Business Statistics", "Beginner", "Connect statistical measures to revenue, retention, cost, and growth.", "KPI=well-defined measure + period + segment", "Track conversion by channel and week, not only overall."],
  ["cohort-analysis", "Cohort analysis", "🗓️", "Business Statistics", "Intermediate", "Compare groups that started in the same period or event.", "Retention(age)=active cohort users/original cohort users", "Compare month-1 retention across signup cohorts."],
  ["seasonality", "Seasonality and trends", "🌦️", "Business Statistics", "Intermediate", "Separate recurring calendar patterns from longer movement.", "Observed=trend+seasonality+noise", "Retail sales may spike every festive season."],
  ["simpsons-paradox", "Simpson’s paradox", "🔀", "Business Statistics", "Advanced", "Recognize when aggregated and segmented conclusions reverse.", "Aggregate trend can reverse within groups", "Channel mix can hide improvement inside every channel."],
  ["forecast-baseline", "Forecast baselines", "🔮", "Business Statistics", "Intermediate", "Compare forecasting models with a simple reference.", "Naive forecast: next value=latest value", "A model should beat last-period or seasonal-naive predictions."],
  ["interview-framework", "Statistics interview framework", "🎤", "Analyst Interviews", "Beginner", "Structure statistical answers around goal, metric, method, assumptions, and decision.", "Question→Metric→Method→Checks→Decision", "Explain not just the test, but why it supports the business decision."],
  ["interview-average", "Interview: choosing an average", "🤔", "Analyst Interviews", "Intermediate", "Choose mean or median based on distribution and decision context.", "Skew/outliers→often median; additive planning→often mean", "Use median salary when a few executive salaries dominate."],
  ["interview-test-choice", "Interview: choosing a test", "🧭", "Analyst Interviews", "Advanced", "Map outcome type, groups, pairing, and assumptions to a suitable test.", "Outcome type + group count + pairing + assumptions", "Two independent means may use an independent t-test."],
  ["interview-ab-test", "Interview: evaluate an experiment", "🧑‍💼", "Analyst Interviews", "Advanced", "Discuss randomization, sample ratio, metrics, uncertainty, and business impact.", "Design checks→effect→CI/p-value→guardrails→decision", "Check sample-ratio mismatch before trusting lift."],
  ["interview-bias", "Interview: identify bias", "🔎", "Analyst Interviews", "Advanced", "Spot selection, survivorship, measurement, and confounding bias.", "Ask who is missing, how measured, and what else changed", "Analyzing only retained customers creates survivorship bias."],
];

function makeLesson(topic: Topic, index: number): StatisticsLesson {
  const [id, title, icon, category, difficulty, description, formula, example, practiceTask, acceptedAnswers, hint] = topic;
  const reward = difficulty === "Beginner" ? 20 : difficulty === "Intermediate" ? 30 : 40;
  return {
    id, title, icon, category, difficulty, description, formula, example,
    explanation: `${description} In analyst work, define the population, unit, time period, and business decision before calculating or interpreting it.`,
    memoryTrick: `${title}: calculate carefully, state the assumption, then translate the result into plain business language.`,
    whenToUse: [
      "When a business question needs evidence rather than intuition alone.",
      "When comparing groups, estimating uncertainty, or communicating data limitations.",
    ],
    commonMistakes: [
      "Calculating the measure without checking assumptions or data quality.",
      "Reporting a number without explaining its uncertainty or business meaning.",
    ],
    interviewQuestions: [
      `When would you use ${title.toLowerCase()}?`,
      `How would you explain ${title.toLowerCase()} to a non-technical stakeholder?`,
    ],
    practiceTask: practiceTask ?? `Which statistical concept is described by: ${description}`,
    acceptedAnswers: [...(acceptedAnswers ?? [title])],
    hint: hint ?? `Use the lesson title: ${title}.`,
    xpReward: reward,
    relatedLessons: [topics[(index + 1) % topics.length][0]],
  };
}

export const statisticsLessons = topics.map(makeLesson);

export const statisticsCategories = Array.from(
  new Set(statisticsLessons.map((lesson) => lesson.category)),
);

export const statisticsDifficulties: StatisticsDifficulty[] = [
  "Beginner",
  "Intermediate",
  "Advanced",
];

export function getStatisticsLesson(id: string) {
  return statisticsLessons.find((lesson) => lesson.id === id);
}

export function getNextStatisticsLesson(id: string) {
  const index = statisticsLessons.findIndex((lesson) => lesson.id === id);
  return index >= 0 ? statisticsLessons[index + 1] : undefined;
}
