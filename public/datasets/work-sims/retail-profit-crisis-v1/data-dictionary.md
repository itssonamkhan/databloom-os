# Revenue Up, Profit Down — Data Dictionary

## Educational-use notice

**DataBloom Retail Co. is fictional.** Every record is synthetic and created exclusively for educational use. It does not describe a real company, customer, product, employee, or transaction.

## Scenario

Analyse six months of fictional Indian e-commerce activity. Revenue appears to be rising while management is concerned that profitability is weakening. Use related files to investigate discounts, returns, delivery operations, product mix, and customer segments.

- Dataset version: retail-profit-crisis-v1
- Currency: Indian rupees (INR)
- Date format: ISO 8601 calendar date (YYYY-MM-DD)
- Analysis window: 2026-04-01 through 2026-09-30, with some valid post-delivery returns after this window.

## Tables and relationships

| Table | Grain | Primary key | Relationships |
| --- | --- | --- | --- |
| orders.csv | One customer order | order_id | customer_id → customers; region_id → shipments |
| order_items.csv | One product line on an order | order_item_id | order_id → orders; product_id → products |
| products.csv | One product | product_id | Referenced by order_items |
| customers.csv | One anonymized customer | customer_id | Referenced by orders |
| returns_refunds.csv | One return/refund record | return_id | order_item_id → order_items |
| shipments.csv | One shipped order | shipment_id | order_id → orders |

## Column guide

### orders.csv

| Column | Meaning |
| --- | --- |
| order_id | Synthetic order identifier. |
| order_date | Date on which the order was placed. |
| customer_id | Anonymous customer identifier. |
| region_id | Internal region identifier shared with shipments. |
| channel | App, Web, or Marketplace. |
| order_status | Delivered or Cancelled. Cancelled orders have no shipment or delivery date. |
| coupon_code | Promotion code when used; blank is a legitimate missing value. |
| shipping_fee_charged | Customer shipping fee in INR. |
| promised_delivery_date / delivered_date | Promised and actual dates for delivered orders; blank for cancelled orders. |

### order_items.csv

| Column | Meaning |
| --- | --- |
| order_item_id | Synthetic line-item identifier. |
| order_id / product_id | Foreign keys to order and product. |
| quantity | Units on the line. |
| list_price_inr | List price per unit. |
| gross_list_value_inr | quantity × list price. |
| discount_amount_inr | Discount applied to the line. |
| item_revenue_inr | Gross list value − discount. |
| unit_cogs_inr / cogs_inr | Unit and total cost of goods sold. |
| packaging_cost_inr | Total packaging cost for the line. |

### products.csv

| Column | Meaning |
| --- | --- |
| product_id / sku | Synthetic product identifiers. |
| product_name | Fictional generic product label. |
| category / subcategory | Product classification fields. |
| list_price_inr / unit_cogs_inr | Product economics per unit. |
| packaging_cost_per_unit_inr | Packaging cost per unit. |

### customers.csv

| Column | Meaning |
| --- | --- |
| customer_id | Anonymous identifier only; no direct personal data is present. |
| acquisition_month / acquisition_channel | Acquisition cohort fields. |
| customer_segment | Value Seekers, Core Shoppers, or Premium Planners. |
| city_tier | Tier 1, Tier 2, or Tier 3. |

### returns_refunds.csv

| Column | Meaning |
| --- | --- |
| return_id | Synthetic return identifier. |
| order_item_id | Foreign key to the returned line item. |
| return_date | Date after delivery on which the return was recorded. |
| return_reason | Recorded reason; normalize text before grouping. |
| returned_quantity | Quantity returned; some returns are partial. |
| refund_amount_inr | Refunded amount for the returned quantity. |
| return_shipping_cost_inr | Company return-logistics cost. |

### shipments.csv

| Column | Meaning |
| --- | --- |
| shipment_id / order_id / region_id | Synthetic shipment and relationship identifiers. |
| carrier | Fictional carrier label. |
| delivery_cost_inr | Company delivery cost for one order shipment. |
| promised_delivery_date / actual_delivery_date | Use these to derive lateness. |
| delivery_status | Delivered for every shipment in this file. |

## Metric definitions

All currency metrics are summed in INR and rounded to two decimals only for display. Rates use full precision for calculation, then may be displayed as percentages rounded to two decimals.

All financial metrics exclude Cancelled orders. Cancelled records remain available for operational data-quality analysis but are not realized sales.

- **Gross list value:** sum of item gross list values for delivered orders.
- **Discount amount:** sum of item discount amounts for delivered orders.
- **Item revenue:** sum of item revenue for delivered orders.
- **Refund amount:** sum of refund amounts; partial returns use only their returned quantity.
- **Net revenue:** item revenue + shipping fees charged − refund amount.
- **COGS:** sum of item COGS for delivered orders.
- **Packaging cost:** sum of item packaging costs for delivered orders.
- **Delivery cost:** sum shipment delivery costs once per shipment/order. Do not repeat it for every joined item row.
- **Return-shipping cost:** sum return-shipping costs.
- **Contribution profit:** net revenue − COGS − packaging cost − delivery cost − return-shipping cost.
- **Contribution margin:** contribution profit ÷ net revenue.
- **Discount rate:** discount amount ÷ gross list value.
- **Return rate:** returned quantity ÷ delivered item quantity.
- **Late-delivery rate:** late shipments ÷ all shipments.
- **Average order value:** net revenue ÷ delivered orders.

## Known intentional data-quality issues

- Product category includes controlled casing and trailing-space variants.
- Return reasons include controlled spelling, casing, and whitespace variants.
- Coupon codes are legitimately blank when no coupon was used.
- Delivery dates are blank only for cancelled orders, which have no shipment.
- One order line is a legitimate bulk business purchase. Investigate it; do not automatically delete it.

No foreign keys are intentionally broken. There are no negative quantities, impossible dates, or inconsistent line-level arithmetic.
