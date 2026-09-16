import { readFile } from "node:fs/promises";

import {
  parseRetailProfitCrisisAnswers,
  RETAIL_PROFIT_CRISIS_STAGE_MAXIMUMS,
  scoreRetailProfitCrisisAnswers,
} from "../lib/server/workSims/retailProfitCrisisScoringCore.mjs";

const fail = (message) => { throw new Error("WorkSim scoring verification failed: " + message); };
const fixtureSource = await readFile("lib/server/workSims/retailProfitCrisisAnswerFixture.ts", "utf8");
const assignmentSource = await readFile("lib/workSims/retailProfitCrisisAssignments.ts", "utf8");
const fixtureMatch = fixtureSource.match(/Object\.freeze\((\{[\s\S]*\})\);\s*$/);
if (!fixtureMatch) fail("could not parse the generated server-only fixture.");
const fixture = JSON.parse(fixtureMatch[1]);

const firstMonth = fixture.monthlyTrend[0];
const lastMonth = fixture.monthlyTrend.at(-1);
const eastDelivery = fixture.deliveryAndLatenessAnalysis.find((entry) => entry.region === "East");
const lowestDiscountBand = [...fixture.discountBandAnalysis].sort((left, right) => left.contributionProfit - right.contributionProfit)[0];
const lossSku = fixture.lossMakingSkus[0];
const bandIds = { "0-9%": "zero-nine", "10-19%": "ten-nineteen", "20-29%": "twenty-twentynine", "30%+": "thirty-plus" };
const expected = {
  brief: {},
  "data-audit": { relationshipPath: "orders-items-products", qualityActions: ["normalise-category", "normalise-return-reason"] },
  "kpi-diagnosis": { netRevenueInr: fixture.overallKpis.netRevenue, contributionMarginRate: fixture.overallKpis.contributionMargin, profitDriver: "cost-pressure", currencyTolerance: fixture.validationTolerances.currencyInr, rateTolerance: fixture.validationTolerances.rate },
  "sql-diagnosis": { lossCategory: lossSku.category.toLowerCase(), lowestProfitDiscountBand: bandIds[lowestDiscountBand.discountBand], eastDeliveryCostInr: eastDelivery.deliveryCost, currencyTolerance: fixture.validationTolerances.currencyInr },
  "excel-analysis": { revenueTrend: lastMonth.netRevenue > firstMonth.netRevenue ? "increased" : "decreased", marginTrend: lastMonth.contributionMargin < firstMonth.contributionMargin ? "decreased" : "increased" },
  "dashboard-plan": { visuals: ["category-profit", "monthly-trend", "regional-delivery"] },
  "executive-summary": { priorityAction: "review-electronics-discounts", supportingFindings: ["discount-loss", "east-cost"] },
};
const perfect = {
  brief: { confirmed: true },
  "data-audit": { relationshipPath: "orders-items-products", qualityActions: ["normalise-category", "normalise-return-reason"] },
  "kpi-diagnosis": { netRevenueInr: fixture.overallKpis.netRevenue, contributionMarginPercent: fixture.overallKpis.contributionMargin * 100, profitDriver: "cost-pressure" },
  "sql-diagnosis": { lossCategory: lossSku.category.toLowerCase(), lowestProfitDiscountBand: bandIds[lowestDiscountBand.discountBand], eastDeliveryCostInr: eastDelivery.deliveryCost },
  "excel-analysis": { revenueTrend: "increased", marginTrend: "decreased" },
  "dashboard-plan": { visuals: ["category-profit", "monthly-trend", "regional-delivery"] },
  "executive-summary": { priorityAction: "review-electronics-discounts", supportingFindings: ["discount-loss", "east-cost"] },
};

const expectedMaximums = { brief: 0, "data-audit": 10, "kpi-diagnosis": 25, "sql-diagnosis": 30, "excel-analysis": 20, "dashboard-plan": 10, "executive-summary": 5 };
if (JSON.stringify(RETAIL_PROFIT_CRISIS_STAGE_MAXIMUMS) !== JSON.stringify(expectedMaximums)) fail("stage maximums changed.");
if (Object.values(RETAIL_PROFIT_CRISIS_STAGE_MAXIMUMS).reduce((total, value) => total + value, 0) !== 100) fail("stage maximums must total 100.");
for (const [stageId, answers] of Object.entries(perfect)) {
  const parsed = parseRetailProfitCrisisAnswers(stageId, answers);
  if (!parsed) fail(stageId + " perfect answers did not parse.");
  const score = scoreRetailProfitCrisisAnswers(stageId, parsed, expected[stageId]);
  if (score !== RETAIL_PROFIT_CRISIS_STAGE_MAXIMUMS[stageId]) fail(stageId + " perfect score is not its maximum.");
}
const partial = parseRetailProfitCrisisAnswers("kpi-diagnosis", { ...perfect["kpi-diagnosis"], profitDriver: "order-count" });
if (!partial || scoreRetailProfitCrisisAnswers("kpi-diagnosis", partial, expected["kpi-diagnosis"]) !== 16) fail("partial KPI scoring is not deterministic.");
const tolerance = parseRetailProfitCrisisAnswers("sql-diagnosis", { ...perfect["sql-diagnosis"], eastDeliveryCostInr: eastDelivery.deliveryCost + fixture.validationTolerances.currencyInr });
if (!tolerance || scoreRetailProfitCrisisAnswers("sql-diagnosis", tolerance, expected["sql-diagnosis"]) !== 30) fail("numeric tolerance is not applied.");
for (const invalid of [
  ["brief", {}],
  ["brief", { confirmed: false }],
  ["data-audit", { relationshipPath: "orders-items-products", qualityActions: ["normalise-category"], extra: true }],
  ["kpi-diagnosis", { netRevenueInr: Infinity, contributionMarginPercent: 1, profitDriver: "cost-pressure" }],
  ["sql-diagnosis", { ...perfect["sql-diagnosis"], eastDeliveryCostInr: -1 }],
  ["dashboard-plan", { visuals: ["monthly-trend", "monthly-trend"] }],
  ["unknown-stage", {}],
]) if (parseRetailProfitCrisisAnswers(invalid[0], invalid[1]) !== null) fail("invalid " + invalid[0] + " submission was accepted.");
for (const forbidden of ["retailProfitCrisisAnswerFixture", "overallKpis", "validationTolerances", "SERVER_ONLY_EXPECTED_ANSWERS", "server-only"]) if (assignmentSource.includes(forbidden)) fail("client-safe assignments include " + forbidden + ".");
if (!fixtureSource.startsWith('import "server-only";')) fail("answer fixture must stay server-only.");
console.log("Verified WorkSim assignments/scoring: 7 stages, 100 points, strict validation, and no answer fixture in client-safe definitions.");
