import { createHash } from "node:crypto";

export const DATASET_VERSION = "retail-profit-crisis-v1";
export const GENERATOR_SEED = 20260913;
export const DATASET_DIRECTORY = `public/datasets/work-sims/${DATASET_VERSION}`;

const MONTHS = [
  { key: "2026-04", orders: 160 },
  { key: "2026-05", orders: 175 },
  { key: "2026-06", orders: 190 },
  { key: "2026-07", orders: 205 },
  { key: "2026-08", orders: 225 },
  { key: "2026-09", orders: 245 },
];

const REGIONS = [
  { id: "R01", name: "North", baseDeliveryCost: 92, lateRate: 0.11 },
  { id: "R02", name: "West", baseDeliveryCost: 78, lateRate: 0.07 },
  { id: "R03", name: "South", baseDeliveryCost: 86, lateRate: 0.09 },
  { id: "R04", name: "East", baseDeliveryCost: 168, lateRate: 0.24 },
];

const CATEGORY_SPECS = [
  { name: "Electronics", subcategories: ["Audio", "Accessories", "Smart Home"], listPrices: [1299, 2199, 3499, 4999], cogsRate: 0.72, packaging: 42 },
  { name: "Fashion", subcategories: ["Apparel", "Footwear", "Bags"], listPrices: [699, 999, 1399, 1899], cogsRate: 0.48, packaging: 24 },
  { name: "Home & Kitchen", subcategories: ["Cookware", "Storage", "Small Appliances"], listPrices: [549, 849, 1299, 2299], cogsRate: 0.59, packaging: 31 },
  { name: "Beauty", subcategories: ["Skin Care", "Personal Care", "Wellness"], listPrices: [349, 599, 899, 1199], cogsRate: 0.43, packaging: 19 },
  { name: "Essentials", subcategories: ["Home Care", "Pantry", "Daily Use"], listPrices: [199, 299, 449, 649], cogsRate: 0.52, packaging: 16 },
];

const CATEGORY_VARIANTS = {
  Electronics: ["Electronics", "electronics"],
  Fashion: ["Fashion", "FASHION"],
  "Home & Kitchen": ["Home & Kitchen", "Home & Kitchen "],
  Beauty: ["Beauty"],
  Essentials: ["Essentials"],
};

const CSV_HEADERS = {
  orders: ["order_id", "order_date", "customer_id", "region_id", "channel", "order_status", "coupon_code", "shipping_fee_charged", "promised_delivery_date", "delivered_date"],
  orderItems: ["order_item_id", "order_id", "product_id", "quantity", "list_price_inr", "gross_list_value_inr", "discount_amount_inr", "item_revenue_inr", "unit_cogs_inr", "cogs_inr", "packaging_cost_inr"],
  products: ["product_id", "sku", "product_name", "category", "subcategory", "list_price_inr", "unit_cogs_inr", "packaging_cost_per_unit_inr"],
  customers: ["customer_id", "acquisition_month", "acquisition_channel", "customer_segment", "city_tier"],
  returns: ["return_id", "order_item_id", "return_date", "return_reason", "returned_quantity", "refund_amount_inr", "return_shipping_cost_inr"],
  shipments: ["shipment_id", "order_id", "region_id", "carrier", "delivery_cost_inr", "promised_delivery_date", "actual_delivery_date", "delivery_status"],
};

function mulberry32(seed) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let result = value;
    result = Math.imul(result ^ (result >>> 15), result | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

function pick(random, values) { return values[Math.floor(random() * values.length)]; }
function integer(random, min, max) { return Math.floor(random() * (max - min + 1)) + min; }
function money(value) { return Number(value.toFixed(2)); }
function pad(value, size) { return String(value).padStart(size, "0"); }
function isoDate(date) { return date.toISOString().slice(0, 10); }
function addDays(date, days) { const output = new Date(date); output.setUTCDate(output.getUTCDate() + days); return output; }
function localMonthDate(monthIndex, day) { return new Date(Date.UTC(2026, 3 + monthIndex, day)); }
function sum(rows, accessor) { return rows.reduce((total, row) => total + Number(accessor(row) || 0), 0); }
function rate(numerator, denominator) { return denominator === 0 ? 0 : numerator / denominator; }
function round(value, decimals = 2) { return Number(value.toFixed(decimals)); }

function toCsv(headers, rows) {
  const escape = (value) => {
    const text = value === null || value === undefined ? "" : String(value);
    return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
  };
  return `${headers.join(",")}\n${rows.map((row) => headers.map((header) => escape(row[header])).join(",")).join("\n")}\n`;
}

function sha256(value) { return createHash("sha256").update(value).digest("hex"); }

function createProducts(random) {
  const products = [];
  let productNumber = 1;
  for (const spec of CATEGORY_SPECS) {
    for (let index = 0; index < 12; index += 1) {
      const listPrice = pick(random, spec.listPrices);
      const premiumAdjustment = 1 + ((index % 4) * 0.025);
      const lossProne = spec.name === "Electronics" && index < 5;
      const cogsRate = lossProne ? 0.83 + (index * 0.006) : spec.cogsRate * premiumAdjustment;
      const id = `P${pad(productNumber, 3)}`;
      const category = pick(random, CATEGORY_VARIANTS[spec.name]);
      products.push({
        product_id: id,
        sku: `DBR-${spec.name.slice(0, 3).toUpperCase()}-${pad(index + 1, 2)}`,
        product_name: `${spec.subcategories[index % spec.subcategories.length]} Item ${pad(index + 1, 2)}`,
        category,
        canonicalCategory: spec.name,
        subcategory: spec.subcategories[index % spec.subcategories.length],
        list_price_inr: listPrice,
        unit_cogs_inr: money(listPrice * cogsRate),
        packaging_cost_per_unit_inr: spec.packaging,
      });
      productNumber += 1;
    }
  }
  return products;
}

function createCustomers(random) {
  const segments = ["Value Seekers", "Core Shoppers", "Premium Planners"];
  const channels = ["Organic", "Search", "Social", "Referral", "Marketplace"];
  const customers = [];
  for (let index = 1; index <= 700; index += 1) {
    customers.push({
      customer_id: `C${pad(index, 4)}`,
      acquisition_month: `202${4 + (index % 2)}-${pad((index % 12) + 1, 2)}`,
      acquisition_channel: pick(random, channels),
      customer_segment: segments[index % segments.length],
      city_tier: `Tier ${1 + (index % 3)}`,
    });
  }
  return customers;
}

function productWeights(products, monthIndex, customerSegment) {
  return products.map((product) => {
    let weight = 1;
    if (product.canonicalCategory === "Electronics") weight *= 1.1 + monthIndex * 0.16;
    if (product.canonicalCategory === "Home & Kitchen") weight *= 1.04 + monthIndex * 0.08;
    if (product.canonicalCategory === "Fashion") weight *= 1.04;
    if (customerSegment === "Value Seekers" && ["Electronics", "Fashion"].includes(product.canonicalCategory)) weight *= 1.35;
    if (customerSegment === "Premium Planners" && product.canonicalCategory === "Beauty") weight *= 1.3;
    return weight;
  });
}

function weightedPick(random, values, weights) {
  const total = weights.reduce((sumValue, value) => sumValue + value, 0);
  let target = random() * total;
  for (let index = 0; index < values.length; index += 1) {
    target -= weights[index];
    if (target <= 0) return values[index];
  }
  return values.at(-1);
}

function discountRateFor(product, monthIndex, customerSegment, random) {
  const latePressure = monthIndex / 5;
  let base = 0.035;
  if (product.canonicalCategory === "Electronics") base = 0.08 + latePressure * 0.25;
  if (product.canonicalCategory === "Home & Kitchen") base = 0.07 + latePressure * 0.15;
  if (product.canonicalCategory === "Fashion") base = 0.08 + latePressure * 0.11;
  if (product.canonicalCategory === "Beauty") base = 0.045 + latePressure * 0.035;
  if (product.canonicalCategory === "Essentials") base = 0.025 + latePressure * 0.025;
  if (customerSegment === "Value Seekers") base += 0.025;
  return Math.min(0.46, Math.max(0.01, base + (integer(random, -2, 3) / 100)));
}

export function generateDataset() {
  const random = mulberry32(GENERATOR_SEED);
  const products = createProducts(random);
  const customers = createCustomers(random);
  const orders = [];
  const orderItems = [];
  const shipments = [];
  const customerById = new Map(customers.map((customer) => [customer.customer_id, customer]));
  let itemNumber = 1;
  let orderNumber = 1;
  let shipmentNumber = 1;

  for (let monthIndex = 0; monthIndex < MONTHS.length; monthIndex += 1) {
    const monthlyOrders = MONTHS[monthIndex].orders;
    for (let inMonth = 0; inMonth < monthlyOrders; inMonth += 1) {
      const orderId = `ORD-${pad(orderNumber, 5)}`;
      const orderDate = localMonthDate(monthIndex, integer(random, 1, 27));
      const customerId = `C${pad(((orderNumber * 17) % 700) + 1, 4)}`;
      const customer = customerById.get(customerId);
      const region = REGIONS[(orderNumber + monthIndex) % REGIONS.length];
      const cancelled = orderNumber % 24 === 0;
      const orderStatus = cancelled ? "Cancelled" : "Delivered";
      const promised = cancelled ? null : addDays(orderDate, integer(random, 3, 6));
      const delivered = cancelled ? null : addDays(orderDate, integer(random, 2, 8));
      const couponCode = random() < 0.42 + monthIndex * 0.05 ? pick(random, ["BLOOM10", "VALUE15", "FESTIVE20", "WELCOME5"]) : null;
      const shippingFee = cancelled ? 0 : (region.id === "R04" ? 49 : 29);
      orders.push({
        order_id: orderId,
        order_date: isoDate(orderDate),
        customer_id: customerId,
        region_id: region.id,
        channel: pick(random, ["App", "Web", "Marketplace"]),
        order_status: orderStatus,
        coupon_code: couponCode,
        shipping_fee_charged: shippingFee,
        promised_delivery_date: promised ? isoDate(promised) : null,
        delivered_date: delivered ? isoDate(delivered) : null,
      });
      // Exactly one sixth of orders have a third line, distributed across all months.
      const lineCount = orderNumber % 6 === 0 ? 3 : 2;
      const weights = productWeights(products, monthIndex, customer.customer_segment);
      for (let lineIndex = 0; lineIndex < lineCount; lineIndex += 1) {
        const product = weightedPick(random, products, weights);
        const isBulkOutlier = orderNumber === 1197 && lineIndex === 0;
        const quantity = isBulkOutlier ? 24 : (random() < 0.18 ? 2 : 1);
        const grossListValue = product.list_price_inr * quantity;
        const discountAmount = money(grossListValue * discountRateFor(product, monthIndex, customer.customer_segment, random));
        const itemRevenue = money(grossListValue - discountAmount);
        orderItems.push({
          order_item_id: `OI-${pad(itemNumber, 5)}`,
          order_id: orderId,
          product_id: product.product_id,
          quantity,
          list_price_inr: product.list_price_inr,
          gross_list_value_inr: grossListValue,
          discount_amount_inr: discountAmount,
          item_revenue_inr: itemRevenue,
          unit_cogs_inr: product.unit_cogs_inr,
          cogs_inr: money(product.unit_cogs_inr * quantity),
          packaging_cost_inr: money(product.packaging_cost_per_unit_inr * quantity),
        });
        itemNumber += 1;
      }
      if (!cancelled) {
        const late = random() < region.lateRate;
        const actual = delivered;
        shipments.push({
          shipment_id: `SHP-${pad(shipmentNumber, 5)}`,
          order_id: orderId,
          region_id: region.id,
          carrier: pick(random, ["SwiftShip", "ParcelRoute", "QuickCart"]),
          delivery_cost_inr: money(region.baseDeliveryCost + integer(random, -10, 22) + (late ? 18 : 0)),
          promised_delivery_date: isoDate(promised),
          actual_delivery_date: isoDate(actual),
          delivery_status: "Delivered",
        });
        shipmentNumber += 1;
      }
      orderNumber += 1;
    }
  }

  const productById = new Map(products.map((product) => [product.product_id, product]));
  const orderById = new Map(orders.map((order) => [order.order_id, order]));
  const returnCandidates = orderItems
    .filter((item) => orderById.get(item.order_id).order_status === "Delivered")
    .map((item) => {
      const product = productById.get(item.product_id);
      const weight = product.canonicalCategory === "Fashion" ? 4 : product.canonicalCategory === "Home & Kitchen" ? 3 : product.canonicalCategory === "Electronics" ? 2 : 1;
      return { item, product, weight };
    });
  const selectedItems = new Set();
  const returns = [];
  const reasonVariants = ["Damaged", "damaged", "Changed Mind", "changed mind ", "Size Issue", "size issue", "Late Delivery", "late delivery"];
  while (returns.length < 200) {
    const candidate = weightedPick(random, returnCandidates, returnCandidates.map((entry) => entry.weight));
    if (selectedItems.has(candidate.item.order_item_id) || candidate.item.order_id === "ORD-01197") continue;
    selectedItems.add(candidate.item.order_item_id);
    const order = orderById.get(candidate.item.order_id);
    const partial = candidate.item.quantity > 1 && returns.length % 7 === 0;
    const returnedQuantity = partial ? candidate.item.quantity - 1 : candidate.item.quantity;
    const perUnitRevenue = candidate.item.item_revenue_inr / candidate.item.quantity;
    returns.push({
      return_id: `RET-${pad(returns.length + 1, 4)}`,
      order_item_id: candidate.item.order_item_id,
      return_date: isoDate(addDays(new Date(`${order.delivered_date}T00:00:00.000Z`), integer(random, 3, 22))),
      return_reason: pick(random, reasonVariants),
      returned_quantity: returnedQuantity,
      refund_amount_inr: money(perUnitRevenue * returnedQuantity),
      return_shipping_cost_inr: money(35 + integer(random, 0, 35)),
    });
  }

  return { orders, orderItems, products, customers, returns, shipments };
}

function financialMetrics(dataset, filters = {}) {
  const { orders, orderItems, products, customers, returns, shipments } = dataset;
  const productById = new Map(products.map((product) => [product.product_id, product]));
  const orderById = new Map(orders.map((order) => [order.order_id, order]));
  const customerById = new Map(customers.map((customer) => [customer.customer_id, customer]));
  // Financial metrics exclude cancelled orders. Their line records remain in the
  // source so learners must make the same operational-status decision explicitly.
  const candidateOrderIds = new Set(orders.filter((order) => order.order_status === "Delivered" && (!filters.order || filters.order(order))).map((order) => order.order_id));
  const candidateItems = orderItems.filter((item) => candidateOrderIds.has(item.order_id));
  const selectedItems = candidateItems.filter((item) => !filters.item || filters.item(item, productById.get(item.product_id), orderById.get(item.order_id), customerById.get(orderById.get(item.order_id).customer_id)));
  const itemIds = new Set(selectedItems.map((item) => item.order_item_id));
  const selectedOrderIds = new Set(selectedItems.map((item) => item.order_id));
  const selectedOrders = orders.filter((order) => selectedOrderIds.has(order.order_id));
  const selectedReturns = returns.filter((entry) => itemIds.has(entry.order_item_id));
  const selectedShipments = shipments.filter((shipment) => selectedOrderIds.has(shipment.order_id));
  const totalRevenueByOrder = new Map();
  const selectedRevenueByOrder = new Map();
  for (const item of candidateItems) totalRevenueByOrder.set(item.order_id, (totalRevenueByOrder.get(item.order_id) ?? 0) + item.item_revenue_inr);
  for (const item of selectedItems) selectedRevenueByOrder.set(item.order_id, (selectedRevenueByOrder.get(item.order_id) ?? 0) + item.item_revenue_inr);
  const allocationRatio = (orderId) => rate(selectedRevenueByOrder.get(orderId) ?? 0, totalRevenueByOrder.get(orderId) ?? 0);
  const grossListValue = sum(selectedItems, (item) => item.gross_list_value_inr);
  const discountAmount = sum(selectedItems, (item) => item.discount_amount_inr);
  const itemRevenue = sum(selectedItems, (item) => item.item_revenue_inr);
  const refundAmount = sum(selectedReturns, (entry) => entry.refund_amount_inr);
  const shippingFees = sum(selectedOrders, (order) => order.shipping_fee_charged * allocationRatio(order.order_id));
  const netRevenue = itemRevenue + shippingFees - refundAmount;
  const cogs = sum(selectedItems, (item) => item.cogs_inr);
  const packagingCost = sum(selectedItems, (item) => item.packaging_cost_inr);
  const deliveryCost = sum(selectedShipments, (shipment) => shipment.delivery_cost_inr * allocationRatio(shipment.order_id));
  const returnShippingCost = sum(selectedReturns, (entry) => entry.return_shipping_cost_inr);
  const contributionProfit = netRevenue - cogs - packagingCost - deliveryCost - returnShippingCost;
  const deliveredItems = selectedItems.filter((item) => orderById.get(item.order_id).order_status === "Delivered");
  const returnedQuantity = sum(selectedReturns, (entry) => entry.returned_quantity);
  const deliveredQuantity = sum(deliveredItems, (item) => item.quantity);
  const lateShipments = selectedShipments.filter((shipment) => shipment.actual_delivery_date > shipment.promised_delivery_date);
  return {
    grossListValue: round(grossListValue), discountAmount: round(discountAmount), itemRevenue: round(itemRevenue), refundAmount: round(refundAmount), shippingFees: round(shippingFees), netRevenue: round(netRevenue), cogs: round(cogs), packagingCost: round(packagingCost), deliveryCost: round(deliveryCost), returnShippingCost: round(returnShippingCost), contributionProfit: round(contributionProfit), contributionMargin: round(rate(contributionProfit, netRevenue), 6), discountRate: round(rate(discountAmount, grossListValue), 6), returnRate: round(rate(returnedQuantity, deliveredQuantity), 6), lateDeliveryRate: round(rate(lateShipments.length, selectedShipments.length), 6), averageOrderValue: round(rate(netRevenue, selectedOrders.length)), orderCount: selectedOrders.length, itemCount: selectedItems.length, shipmentCount: selectedShipments.length, returnCount: selectedReturns.length,
  };
}

function buildAnswerFixture(dataset, checksums) {
  const { orders, orderItems, products, customers, returns, shipments } = dataset;
  const productById = new Map(products.map((product) => [product.product_id, product]));
  const orderById = new Map(orders.map((order) => [order.order_id, order]));
  const customerById = new Map(customers.map((customer) => [customer.customer_id, customer]));
  const monthlyTrend = MONTHS.map((month) => ({ month: month.key, ...financialMetrics(dataset, { order: (order) => order.order_date.startsWith(month.key) }) }));
  const categories = Array.from(new Set(products.map((product) => product.canonicalCategory))).sort();
  const categoryPerformance = categories.map((category) => ({ category, ...financialMetrics(dataset, { item: (item, product) => product.canonicalCategory === category }) })).sort((a, b) => a.contributionProfit - b.contributionProfit);
  const subcategories = Array.from(new Set(products.map((product) => product.subcategory))).sort();
  const subcategoryPerformance = subcategories.map((subcategory) => ({ subcategory, ...financialMetrics(dataset, { item: (item, product) => product.subcategory === subcategory }) })).sort((a, b) => a.contributionProfit - b.contributionProfit);
  const regionPerformance = REGIONS.map((region) => ({ region: region.name, ...financialMetrics(dataset, { order: (order) => order.region_id === region.id }) })).sort((a, b) => b.deliveryCost - a.deliveryCost);
  const lossMakingSkus = products.map((product) => ({ sku: product.sku, productId: product.product_id, productName: product.product_name, category: product.canonicalCategory, ...financialMetrics(dataset, { item: (item) => item.product_id === product.product_id }) })).filter((entry) => entry.contributionProfit < 0).sort((a, b) => a.contributionProfit - b.contributionProfit).slice(0, 10);
  const bands = [
    { label: "0-9%", min: 0, max: 0.1 }, { label: "10-19%", min: 0.1, max: 0.2 }, { label: "20-29%", min: 0.2, max: 0.3 }, { label: "30%+", min: 0.3, max: Infinity },
  ];
  const discountBandAnalysis = bands.map((band) => ({
    discountBand: band.label,
    ...financialMetrics(dataset, { item: (item) => rate(item.discount_amount_inr, item.gross_list_value_inr) >= band.min && rate(item.discount_amount_inr, item.gross_list_value_inr) < band.max }),
  }));
  const canonicalReason = (value) => value.trim().toLowerCase().replaceAll(" ", "-");
  const returnReasonAnalysis = Array.from(new Set(returns.map((entry) => canonicalReason(entry.return_reason)))).sort().map((reason) => {
    const rows = returns.filter((entry) => canonicalReason(entry.return_reason) === reason);
    return { returnReason: reason, returnCount: rows.length, refundAmount: round(sum(rows, (entry) => entry.refund_amount_inr)), returnShippingCost: round(sum(rows, (entry) => entry.return_shipping_cost_inr)) };
  }).sort((a, b) => b.refundAmount - a.refundAmount);
  const deliveryAndLatenessAnalysis = REGIONS.map((region) => {
    const rows = shipments.filter((shipment) => shipment.region_id === region.id);
    const lateCount = rows.filter((shipment) => shipment.actual_delivery_date > shipment.promised_delivery_date).length;
    return { region: region.name, shipmentCount: rows.length, deliveryCost: round(sum(rows, (shipment) => shipment.delivery_cost_inr)), averageDeliveryCost: round(rate(sum(rows, (shipment) => shipment.delivery_cost_inr), rows.length)), lateShipmentCount: lateCount, lateDeliveryRate: round(rate(lateCount, rows.length), 6) };
  }).sort((a, b) => b.averageDeliveryCost - a.averageDeliveryCost);
  const segments = Array.from(new Set(customers.map((customer) => customer.customer_segment))).sort();
  const customerSegmentPerformance = segments.map((segment) => ({ segment, ...financialMetrics(dataset, { order: (order) => customerById.get(order.customer_id).customer_segment === segment }) })).sort((a, b) => a.contributionMargin - b.contributionMargin);
  const bulkItem = orderItems.find((item) => item.order_id === "ORD-01197" && item.quantity === 24);
  const bulkOrder = orderById.get(bulkItem.order_id);
  const bulkOrderOutlier = { orderId: bulkOrder.order_id, orderDate: bulkOrder.order_date, itemId: bulkItem.order_item_id, sku: productById.get(bulkItem.product_id).sku, quantity: bulkItem.quantity, grossListValue: bulkItem.gross_list_value_inr, discountAmount: bulkItem.discount_amount_inr, itemRevenue: bulkItem.item_revenue_inr, note: "Legitimate bulk business purchase; it should be investigated, not automatically removed." };
  const first = monthlyTrend[0];
  const last = monthlyTrend.at(-1);
  const rankedFindings = [
    { rank: 1, finding: "Revenue grows while contribution margin declines across the six-month period.", evidence: { firstMonth: first.month, lastMonth: last.month, revenueChange: round(last.netRevenue - first.netRevenue), marginChange: round(last.contributionMargin - first.contributionMargin, 6) } },
    { rank: 2, finding: "High-discount product groups are less profitable than lower-discount groups.", evidence: { highestDiscountBand: discountBandAnalysis.at(-1).discountBand, lowestProfitBand: [...discountBandAnalysis].sort((a, b) => a.contributionProfit - b.contributionProfit)[0].discountBand } },
    { rank: 3, finding: "Regional delivery cost and lateness create uneven profitability pressure.", evidence: { highestDeliveryCostRegion: deliveryAndLatenessAnalysis[0].region, highestLateRateRegion: [...deliveryAndLatenessAnalysis].sort((a, b) => b.lateDeliveryRate - a.lateDeliveryRate)[0].region } },
    { rank: 4, finding: "A small group of SKUs has negative contribution profit.", evidence: { lossMakingSkuCount: lossMakingSkus.length, mostLossMakingSku: lossMakingSkus[0]?.sku ?? null } },
  ];
  return {
    datasetVersion: DATASET_VERSION,
    generatorSeed: GENERATOR_SEED,
    sourceFileChecksums: checksums,
    validationTolerances: { currencyInr: 0.01, rate: 0.0001, rankedListPositions: 0 },
    overallKpis: financialMetrics(dataset),
    monthlyTrend,
    categoryPerformance,
    subcategoryPerformance,
    regionPerformance,
    lossMakingSkus,
    discountBandAnalysis,
    returnReasonAnalysis,
    deliveryAndLatenessAnalysis,
    customerSegmentPerformance,
    bulkOrderOutlier,
    rankedFindings,
  };
}

function publicDataDictionary() {
  const lines = [
    "# Revenue Up, Profit Down — Data Dictionary", "", "## Educational-use notice", "",
    "**DataBloom Retail Co. is fictional.** Every record is synthetic and created exclusively for educational use. It does not describe a real company, customer, product, employee, or transaction.", "",
    "## Scenario", "", "Analyse six months of fictional Indian e-commerce activity. Revenue appears to be rising while management is concerned that profitability is weakening. Use related files to investigate discounts, returns, delivery operations, product mix, and customer segments.", "",
    `- Dataset version: ${DATASET_VERSION}`, "- Currency: Indian rupees (INR)", "- Date format: ISO 8601 calendar date (YYYY-MM-DD)", "- Analysis window: 2026-04-01 through 2026-09-30, with some valid post-delivery returns after this window.", "",
    "## Tables and relationships", "", "| Table | Grain | Primary key | Relationships |", "| --- | --- | --- | --- |",
    "| orders.csv | One customer order | order_id | customer_id → customers; region_id → shipments |",
    "| order_items.csv | One product line on an order | order_item_id | order_id → orders; product_id → products |",
    "| products.csv | One product | product_id | Referenced by order_items |",
    "| customers.csv | One anonymized customer | customer_id | Referenced by orders |",
    "| returns_refunds.csv | One return/refund record | return_id | order_item_id → order_items |",
    "| shipments.csv | One shipped order | shipment_id | order_id → orders |", "",
    "## Column guide", "", "### orders.csv", "", "| Column | Meaning |", "| --- | --- |",
    "| order_id | Synthetic order identifier. |", "| order_date | Date on which the order was placed. |", "| customer_id | Anonymous customer identifier. |", "| region_id | Internal region identifier shared with shipments. |", "| channel | App, Web, or Marketplace. |", "| order_status | Delivered or Cancelled. Cancelled orders have no shipment or delivery date. |", "| coupon_code | Promotion code when used; blank is a legitimate missing value. |", "| shipping_fee_charged | Customer shipping fee in INR. |", "| promised_delivery_date / delivered_date | Promised and actual dates for delivered orders; blank for cancelled orders. |", "",
    "### order_items.csv", "", "| Column | Meaning |", "| --- | --- |",
    "| order_item_id | Synthetic line-item identifier. |", "| order_id / product_id | Foreign keys to order and product. |", "| quantity | Units on the line. |", "| list_price_inr | List price per unit. |", "| gross_list_value_inr | quantity × list price. |", "| discount_amount_inr | Discount applied to the line. |", "| item_revenue_inr | Gross list value − discount. |", "| unit_cogs_inr / cogs_inr | Unit and total cost of goods sold. |", "| packaging_cost_inr | Total packaging cost for the line. |", "",
    "### products.csv", "", "| Column | Meaning |", "| --- | --- |",
    "| product_id / sku | Synthetic product identifiers. |", "| product_name | Fictional generic product label. |", "| category / subcategory | Product classification fields. |", "| list_price_inr / unit_cogs_inr | Product economics per unit. |", "| packaging_cost_per_unit_inr | Packaging cost per unit. |", "",
    "### customers.csv", "", "| Column | Meaning |", "| --- | --- |",
    "| customer_id | Anonymous identifier only; no direct personal data is present. |", "| acquisition_month / acquisition_channel | Acquisition cohort fields. |", "| customer_segment | Value Seekers, Core Shoppers, or Premium Planners. |", "| city_tier | Tier 1, Tier 2, or Tier 3. |", "",
    "### returns_refunds.csv", "", "| Column | Meaning |", "| --- | --- |",
    "| return_id | Synthetic return identifier. |", "| order_item_id | Foreign key to the returned line item. |", "| return_date | Date after delivery on which the return was recorded. |", "| return_reason | Recorded reason; normalize text before grouping. |", "| returned_quantity | Quantity returned; some returns are partial. |", "| refund_amount_inr | Refunded amount for the returned quantity. |", "| return_shipping_cost_inr | Company return-logistics cost. |", "",
    "### shipments.csv", "", "| Column | Meaning |", "| --- | --- |",
    "| shipment_id / order_id / region_id | Synthetic shipment and relationship identifiers. |", "| carrier | Fictional carrier label. |", "| delivery_cost_inr | Company delivery cost for one order shipment. |", "| promised_delivery_date / actual_delivery_date | Use these to derive lateness. |", "| delivery_status | Delivered for every shipment in this file. |", "",
    "## Metric definitions", "", "All currency metrics are summed in INR and rounded to two decimals only for display. Rates use full precision for calculation, then may be displayed as percentages rounded to two decimals.", "",
    "All financial metrics exclude Cancelled orders. Cancelled records remain available for operational data-quality analysis but are not realized sales.", "",
    "- **Gross list value:** sum of item gross list values for delivered orders.", "- **Discount amount:** sum of item discount amounts for delivered orders.", "- **Item revenue:** sum of item revenue for delivered orders.", "- **Refund amount:** sum of refund amounts; partial returns use only their returned quantity.", "- **Net revenue:** item revenue + shipping fees charged − refund amount.", "- **COGS:** sum of item COGS for delivered orders.", "- **Packaging cost:** sum of item packaging costs for delivered orders.", "- **Delivery cost:** sum shipment delivery costs once per shipment/order. Do not repeat it for every joined item row.", "- **Return-shipping cost:** sum return-shipping costs.", "- **Contribution profit:** net revenue − COGS − packaging cost − delivery cost − return-shipping cost.", "- **Contribution margin:** contribution profit ÷ net revenue.", "- **Discount rate:** discount amount ÷ gross list value.", "- **Return rate:** returned quantity ÷ delivered item quantity.", "- **Late-delivery rate:** late shipments ÷ all shipments.", "- **Average order value:** net revenue ÷ delivered orders.", "",
    "## Known intentional data-quality issues", "", "- Product category includes controlled casing and trailing-space variants.", "- Return reasons include controlled spelling, casing, and whitespace variants.", "- Coupon codes are legitimately blank when no coupon was used.", "- Delivery dates are blank only for cancelled orders, which have no shipment.", "- One order line is a legitimate bulk business purchase. Investigate it; do not automatically delete it.", "", "No foreign keys are intentionally broken. There are no negative quantities, impossible dates, or inconsistent line-level arithmetic.", "",
  ];
  return lines.join("\n");
}

function fixtureSource(fixture) {
  return `import "server-only";\n\n/** Generated from ${DATASET_VERSION}; do not import from Client Components. */\nexport const RETAIL_PROFIT_CRISIS_ANSWER_FIXTURE = Object.freeze(${JSON.stringify(fixture, null, 2)});\n`;
}

export function buildArtifacts() {
  const dataset = generateDataset();
  const csvFiles = {
    "orders.csv": toCsv(CSV_HEADERS.orders, dataset.orders),
    "order_items.csv": toCsv(CSV_HEADERS.orderItems, dataset.orderItems),
    "products.csv": toCsv(CSV_HEADERS.products, dataset.products.map((product) => {
      const publicProduct = { ...product };
      delete publicProduct.canonicalCategory;
      return publicProduct;
    })),
    "customers.csv": toCsv(CSV_HEADERS.customers, dataset.customers),
    "returns_refunds.csv": toCsv(CSV_HEADERS.returns, dataset.returns),
    "shipments.csv": toCsv(CSV_HEADERS.shipments, dataset.shipments),
  };
  const sourceFileChecksums = Object.fromEntries(Object.entries(csvFiles).map(([file, content]) => [file, sha256(content)]));
  const manifest = {
    datasetVersion: DATASET_VERSION,
    generatorSeed: GENERATOR_SEED,
    fictionalDataNotice: "DataBloom Retail Co. and all records are fictional and created exclusively for educational use.",
    files: Object.entries(csvFiles).map(([file, content]) => ({ file, rowCount: content.trimEnd().split("\n").length - 1, sha256: sourceFileChecksums[file] })),
  };
  const fixture = buildAnswerFixture(dataset, sourceFileChecksums);
  return { dataset, csvFiles, sourceFileChecksums, manifest: `${JSON.stringify(manifest, null, 2)}\n`, dictionary: publicDataDictionary(), fixtureSource: fixtureSource(fixture), fixture };
}

export function parseCsv(content) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (let index = 0; index < content.length; index += 1) {
    const character = content[index];
    if (quoted) {
      if (character === '"' && content[index + 1] === '"') { field += '"'; index += 1; }
      else if (character === '"') quoted = false;
      else field += character;
      continue;
    }
    if (character === '"') quoted = true;
    else if (character === ",") { row.push(field); field = ""; }
    else if (character === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
    else if (character !== "\r") field += character;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  const [headers, ...data] = rows;
  return data.filter((entry) => entry.length === headers.length && entry.some(Boolean)).map((entry) => Object.fromEntries(headers.map((header, index) => [header, entry[index]])));
}

export function expectedFixtureSource() { return buildArtifacts().fixtureSource; }
