import { readFile } from "node:fs/promises";
import { join } from "node:path";

import {
  DATASET_DIRECTORY,
  buildArtifacts,
  parseCsv,
} from "./lib/retailProfitCrisisDataset.mjs";

const artifacts = buildArtifacts();
const csvNames = Object.keys(artifacts.csvFiles);
const actual = Object.fromEntries(await Promise.all(csvNames.map(async (file) => [file, await readFile(join(DATASET_DIRECTORY, file), "utf8")] )));
const fail = (message) => { throw new Error(`Dataset verification failed: ${message}`); };

for (const [file, expected] of Object.entries(artifacts.csvFiles)) {
  if (actual[file] !== expected) fail(`${file} differs from deterministic generator output.`);
  if (!actual[file].endsWith("\n") || actual[file].includes("\r\n")) fail(`${file} must use LF newlines and end with one newline.`);
}
const manifest = await readFile(join(DATASET_DIRECTORY, "manifest.json"), "utf8");
if (manifest !== artifacts.manifest) fail("manifest.json does not match calculated checksums or row counts.");
const fixture = await readFile("lib/server/workSims/retailProfitCrisisAnswerFixture.ts", "utf8");
if (fixture !== artifacts.fixtureSource) fail("The server-only answer fixture does not match the CSV-derived answers.");
if (!fixture.startsWith('import "server-only";')) fail("The answer fixture must be server-only.");

const tables = Object.fromEntries(Object.entries(actual).map(([file, content]) => [file, parseCsv(content)]));
const ranges = { "orders.csv": [1200, 1200], "order_items.csv": [2400, 2800], "products.csv": [60, 60], "customers.csv": [700, 700], "returns_refunds.csv": [180, 220], "shipments.csv": [1100, 1200] };
for (const [file, [minimum, maximum]] of Object.entries(ranges)) {
  const count = tables[file].length;
  if (count < minimum || count > maximum) fail(`${file} row count ${count} is outside ${minimum}-${maximum}.`);
}
const unique = (rows, field) => new Set(rows.map((row) => row[field])).size === rows.length;
for (const [file, field] of [["orders.csv", "order_id"], ["order_items.csv", "order_item_id"], ["products.csv", "product_id"], ["customers.csv", "customer_id"], ["returns_refunds.csv", "return_id"], ["shipments.csv", "shipment_id"]]) if (!unique(tables[file], field)) fail(`${file} has duplicate ${field} values.`);
const ids = (file, field) => new Set(tables[file].map((row) => row[field]));
const orderIds = ids("orders.csv", "order_id");
const itemIds = ids("order_items.csv", "order_item_id");
const productIds = ids("products.csv", "product_id");
const customerIds = ids("customers.csv", "customer_id");
for (const item of tables["order_items.csv"]) if (!orderIds.has(item.order_id) || !productIds.has(item.product_id)) fail("order_items contains a broken foreign key.");
for (const order of tables["orders.csv"]) if (!customerIds.has(order.customer_id)) fail("orders contains a broken customer foreign key.");
for (const entry of tables["returns_refunds.csv"]) if (!itemIds.has(entry.order_item_id)) fail("returns_refunds contains a broken order-item foreign key.");
for (const shipment of tables["shipments.csv"]) if (!orderIds.has(shipment.order_id)) fail("shipments contains a broken order foreign key.");

const asNumber = (value) => Number(value);
const isDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00.000Z`));
for (const row of tables["orders.csv"]) {
  if (!["Delivered", "Cancelled"].includes(row.order_status) || !["App", "Web", "Marketplace"].includes(row.channel) || !["R01", "R02", "R03", "R04"].includes(row.region_id) || !isDate(row.order_date)) fail("orders has invalid status/channel/region/date values.");
  const hasDeliveryDates = Boolean(row.promised_delivery_date || row.delivered_date);
  if (row.order_status === "Cancelled" && hasDeliveryDates) fail("cancelled order has delivery dates.");
  if (row.order_status === "Delivered" && (!isDate(row.promised_delivery_date) || !isDate(row.delivered_date) || row.delivered_date < row.order_date)) fail("delivered order has invalid delivery dates.");
}
for (const row of tables["order_items.csv"]) {
  const gross = asNumber(row.gross_list_value_inr);
  const discount = asNumber(row.discount_amount_inr);
  const revenue = asNumber(row.item_revenue_inr);
  if (!Number.isInteger(asNumber(row.quantity)) || asNumber(row.quantity) <= 0 || Math.abs(gross - asNumber(row.quantity) * asNumber(row.list_price_inr)) > 0.001 || Math.abs(revenue - (gross - discount)) > 0.001 || discount < 0 || revenue < 0 || asNumber(row.cogs_inr) < 0 || asNumber(row.packaging_cost_inr) < 0) fail("order_items has invalid financial arithmetic.");
}
const itemById = new Map(tables["order_items.csv"].map((row) => [row.order_item_id, row]));
const orderById = new Map(tables["orders.csv"].map((row) => [row.order_id, row]));
for (const entry of tables["returns_refunds.csv"]) {
  const item = itemById.get(entry.order_item_id);
  const order = item ? orderById.get(item.order_id) : null;
  if (!item || !order || !isDate(entry.return_date) || entry.return_date < order.delivered_date || asNumber(entry.returned_quantity) <= 0 || asNumber(entry.returned_quantity) > asNumber(item.quantity) || asNumber(entry.refund_amount_inr) < 0 || asNumber(entry.return_shipping_cost_inr) < 0) fail("returns_refunds has invalid return/refund values.");
}
if (!unique(tables["returns_refunds.csv"], "order_item_id")) fail("returns_refunds has duplicate return records for an order item.");
for (const shipment of tables["shipments.csv"]) {
  const order = orderById.get(shipment.order_id);
  if (!order || order.order_status !== "Delivered" || !["R01", "R02", "R03", "R04"].includes(shipment.region_id) || !["SwiftShip", "ParcelRoute", "QuickCart"].includes(shipment.carrier) || shipment.delivery_status !== "Delivered" || !isDate(shipment.promised_delivery_date) || !isDate(shipment.actual_delivery_date) || shipment.actual_delivery_date < order.order_date || asNumber(shipment.delivery_cost_inr) < 0) fail("shipments has invalid shipment/order consistency.");
}
const deliveredOrderIds = new Set(tables["orders.csv"].filter((row) => row.order_status === "Delivered").map((row) => row.order_id));
if (tables["shipments.csv"].length !== deliveredOrderIds.size || new Set(tables["shipments.csv"].map((row) => row.order_id)).size !== deliveredOrderIds.size) fail("every delivered order must have exactly one shipment.");
for (const customer of tables["customers.csv"]) if (!["Organic", "Search", "Social", "Referral", "Marketplace"].includes(customer.acquisition_channel) || !["Value Seekers", "Core Shoppers", "Premium Planners"].includes(customer.customer_segment) || !["Tier 1", "Tier 2", "Tier 3"].includes(customer.city_tier)) fail("customers has an invalid enumerated value.");
const piiHeaders = /(^|_)(email|phone|address|first_name|last_name|passport|aadhaar)(_|$)/i;
for (const content of Object.values(actual)) for (const header of content.split("\n", 1)[0].split(",")) if (piiHeaders.test(header)) fail(`PII-like field ${header} is not permitted.`);
for (const content of Object.values(actual)) for (const line of content.trimEnd().split("\n").slice(1)) for (const cell of line.split(",")) if (/^[=+\-@]/.test(cell.replace(/^"/, ""))) fail("Spreadsheet formula-injection prefix found.");
const categories = tables["products.csv"].map((row) => row.category);
if (!categories.includes("electronics") || !categories.includes("Home & Kitchen ") || !categories.includes("FASHION")) fail("controlled category variants are missing.");
if (categories.some((category) => !["Electronics", "electronics", "Fashion", "FASHION", "Home & Kitchen", "Home & Kitchen ", "Beauty", "Essentials"].includes(category))) fail("products has an invalid category value.");
const reasons = tables["returns_refunds.csv"].map((row) => row.return_reason);
if (!reasons.includes("damaged") || !reasons.includes("changed mind ") || !reasons.includes("size issue")) fail("controlled return-reason variants are missing.");
if (reasons.some((reason) => !["Damaged", "damaged", "Changed Mind", "changed mind ", "Size Issue", "size issue", "Late Delivery", "late delivery"].includes(reason))) fail("returns_refunds has an invalid return reason.");
if (!tables["orders.csv"].some((row) => row.coupon_code === "")) fail("legitimately blank coupon codes are missing.");
if (!tables["orders.csv"].some((row) => row.order_status === "Cancelled" && row.delivered_date === "")) fail("valid cancelled-order delivery-date blanks are missing.");
if (tables["order_items.csv"].filter((row) => asNumber(row.quantity) >= 20).length !== 1) fail("expected exactly one bulk-order outlier.");
const fixtureObject = artifacts.fixture;
if (!(fixtureObject.monthlyTrend.at(-1).netRevenue > fixtureObject.monthlyTrend[0].netRevenue)) fail("revenue-growth signal is missing.");
if (!(fixtureObject.monthlyTrend.at(-1).contributionMargin < fixtureObject.monthlyTrend[0].contributionMargin)) fail("profitability-decline signal is missing.");
if (fixtureObject.lossMakingSkus.length < 3) fail("loss-making SKU signal is missing.");
if (fixtureObject.deliveryAndLatenessAnalysis[0].region !== "East") fail("regional delivery-cost signal is missing.");
if (!(fixtureObject.overallKpis.returnRate > 0)) fail("return-rate signal is missing.");
const second = buildArtifacts();
if (JSON.stringify(artifacts) !== JSON.stringify(second)) fail("generator is not byte deterministic on a second run.");
console.log(`Verified ${fixtureObject.datasetVersion}: ${tables["orders.csv"].length} orders, ${tables["order_items.csv"].length} order items, ${tables["returns_refunds.csv"].length} returns, ${tables["shipments.csv"].length} shipments.`);
