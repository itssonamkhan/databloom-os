const stageSchemas = {
  brief: { confirmed: { type: "boolean" } },
  "data-audit": {
    relationshipPath: { type: "choice", values: ["orders-items-products", "orders-products-customers", "customers-returns-shipments"] },
    qualityActions: { type: "multi", values: ["normalise-category", "blank-coupon", "delete-bulk-order", "normalise-return-reason"], minimum: 1, maximum: 4 },
  },
  "kpi-diagnosis": {
    netRevenueInr: { type: "number", minimum: 0, maximum: 10_000_000 },
    contributionMarginPercent: { type: "number", minimum: -100, maximum: 100 },
    profitDriver: { type: "choice", values: ["cost-pressure", "order-count", "delivery-speed"] },
  },
  "sql-diagnosis": {
    lossCategory: { type: "choice", values: ["electronics", "essentials", "fashion", "beauty"] },
    lowestProfitDiscountBand: { type: "choice", values: ["zero-nine", "ten-nineteen", "twenty-twentynine", "thirty-plus"] },
    eastDeliveryCostInr: { type: "number", minimum: 0, maximum: 1_000_000 },
  },
  "excel-analysis": {
    revenueTrend: { type: "choice", values: ["increased", "decreased", "flat"] },
    marginTrend: { type: "choice", values: ["increased", "decreased", "flat"] },
  },
  "dashboard-plan": {
    visuals: { type: "multi", values: ["monthly-trend", "category-profit", "regional-delivery", "raw-order-list"], minimum: 1, maximum: 3 },
  },
  "executive-summary": {
    priorityAction: { type: "choice", values: ["review-electronics-discounts", "remove-all-coupons", "hide-return-data"] },
    supportingFindings: { type: "multi", values: ["discount-loss", "east-cost", "bulk-order"], minimum: 1, maximum: 3 },
  },
};

function isPlainRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value) && Object.getPrototypeOf(value) === Object.prototype;
}

function hasExactKeys(value, keys) {
  const actual = Object.keys(value).sort();
  return actual.length === keys.length && actual.every((key, index) => key === keys[index]);
}

function parseField(value, schema) {
  if (schema.type === "boolean") return typeof value === "boolean" ? value : null;
  if (schema.type === "number") return typeof value === "number" && Number.isFinite(value) && value >= schema.minimum && value <= schema.maximum ? value : null;
  if (schema.type === "choice") return typeof value === "string" && schema.values.includes(value) ? value : null;
  if (!Array.isArray(value) || value.length < schema.minimum || value.length > schema.maximum || value.some((entry) => typeof entry !== "string" || !schema.values.includes(entry))) return null;
  const unique = [...new Set(value)].sort();
  return unique.length === value.length ? unique : null;
}

export function parseRetailProfitCrisisAnswers(stageId, answers) {
  const schema = stageSchemas[stageId];
  if (!schema || !isPlainRecord(answers)) return null;
  const keys = Object.keys(schema).sort();
  if (!hasExactKeys(answers, keys)) return null;
  const parsed = {};
  for (const key of keys) {
    const value = parseField(answers[key], schema[key]);
    if (value === null) return null;
    parsed[key] = value;
  }
  if (stageId === "brief" && parsed.confirmed !== true) return null;
  return parsed;
}

function setEquals(left, right) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function isWithinTolerance(actual, expected, tolerance) {
  return Math.abs(actual - expected) <= tolerance + (Number.EPSILON * Math.max(1, Math.abs(actual), Math.abs(expected)));
}

export function scoreRetailProfitCrisisAnswers(stageId, answers, expected) {
  switch (stageId) {
    case "brief":
      return 0;
    case "data-audit":
      return (answers.relationshipPath === expected.relationshipPath ? 5 : 0)
        + (setEquals(answers.qualityActions, expected.qualityActions) ? 5 : 0);
    case "kpi-diagnosis":
      return (isWithinTolerance(answers.netRevenueInr, expected.netRevenueInr, expected.currencyTolerance) ? 8 : 0)
        + (isWithinTolerance(answers.contributionMarginPercent / 100, expected.contributionMarginRate, expected.rateTolerance) ? 8 : 0)
        + (answers.profitDriver === expected.profitDriver ? 9 : 0);
    case "sql-diagnosis":
      return (answers.lossCategory === expected.lossCategory ? 10 : 0)
        + (answers.lowestProfitDiscountBand === expected.lowestProfitDiscountBand ? 10 : 0)
        + (isWithinTolerance(answers.eastDeliveryCostInr, expected.eastDeliveryCostInr, expected.currencyTolerance) ? 10 : 0);
    case "excel-analysis":
      return (answers.revenueTrend === expected.revenueTrend ? 10 : 0)
        + (answers.marginTrend === expected.marginTrend ? 10 : 0);
    case "dashboard-plan":
      return setEquals(answers.visuals, expected.visuals) ? 10 : 0;
    case "executive-summary":
      return (answers.priorityAction === expected.priorityAction ? 2 : 0)
        + (setEquals(answers.supportingFindings, expected.supportingFindings) ? 3 : 0);
    default:
      return null;
  }
}

export const RETAIL_PROFIT_CRISIS_STAGE_MAXIMUMS = Object.freeze({
  brief: 0,
  "data-audit": 10,
  "kpi-diagnosis": 25,
  "sql-diagnosis": 30,
  "excel-analysis": 20,
  "dashboard-plan": 10,
  "executive-summary": 5,
});
