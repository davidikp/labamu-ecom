# Untranslated Wording — Round 3 (Actual COGS view + Estimasi HPP panel)

Your two screenshots (Work Order "Actual Cost of Goods Sold" tab, and the "Estimasi HPP" panel) surfaced a deeper problem than the tab labels alone: **the entire cost-breakdown content below those tabs was still in English**, including table headers, cost-item descriptions, and a status badge. I re-verified every row below programmatically (`translateToIndonesian()` against the live dictionary), not just by eye, after finding that a batch of translations I'd added in round 1 were silently dead — they were keyed to paraphrased text from the source docs that didn't match the actual strings in the code, so they never matched anything at runtime.

## Already fixed in code

- **`"Material"` (bare word)** — was left as `"Material"` → `"Material"` (untranslated) since the very first review. Now → **"Bahan Baku"**, consistent with "Materials" already fixed in round 1. This affects table column headers across BOM, Work Order Materials, and the Actual COGS breakdown table.
- **Removed 4 dead dictionary entries** from round 1 that never matched anything: `"Cost of packaging materials"`, `"Cost of shipping finished goods"`, `"Manufacturing overhead expenses"`, `"Other production-related costs"`. These were based on paraphrased text from your BOM doc that doesn't match the real source strings (see table below for the real strings, now flagged for translation).

## Still missing — needs your translation

### Actual COGS page chrome (7)

| # | English | Location |
|---|---|---|
| 1 | Actual Cost of Goods Sold | `WorkOrderDetailPage.jsx` line 5628 — DetailCard title |
| 2 | Linked Bill of Materials: | `WorkOrderDetailPage.jsx` line 5630 — label before the linked BOM name |
| 3 | Auto-calculated | `WorkOrderDetailPage.jsx` line 5739 — badge on the Material Cost line |
| 4 | Sum of BOM qty × avg stock cost per material | `WorkOrderDetailPage.jsx` line 5742 — subtitle under Material Cost |
| 5 | On forecast | `WorkOrderDetailPage.jsx` line 171 — badge shown when actual cost matches forecast |
| 6 | "▲/▼ {pct}% over/under forecast" | `WorkOrderDetailPage.jsx` line 171 — same badge, dynamic variant when actual ≠ forecast |
| 7 | Cost Item | `WorkOrderDetailPage.jsx` line 5565 — breakdown table header (in the forecasted-vs-actual cost line drawer) |

### Cost breakdown table headers (4)

| # | English | Location | Notes |
|---|---|---|---|
| 8 | Quantity Used | `WorkOrderDetailPage.jsx` line 5779 | Material breakdown table |
| 9 | Forecasted Cost per Unit | `WorkOrderDetailPage.jsx` lines 5567, 5780, 8842 | Appears in 3 places — breakdown table, cost line drawer, Add/Edit Cost Item modal |
| 10 | Total Cost per Unit | `WorkOrderDetailPage.jsx` lines 5568, 5781, 8851 | Same 3 places |
| 11 | Total Cost This WO | `WorkOrderDetailPage.jsx` lines 5569, 5782, 8867 | Same 3 places |

### Cost-type descriptions — corrected strings (the real ones, not the paraphrased ones from round 1) (5)

These titles ("Labour Cost", "Packing Cost", etc.) already translate correctly — only the descriptions below each are missing:

| # | English | Notes |
|---|---|---|
| 12 | Cost of human labour to produce one unit | Description under "Labour Cost" |
| 13 | Cost of packaging this product for delivery | Description under "Packing Cost" |
| 14 | Cost of moving goods from supplier to customer | Description under "Shipping Cost" |
| 15 | Indirect factory costs not tied to a task | Description under "Overhead Cost" |
| 16 | Additional production cost not covered above | Description under "Other Cost" |

### Add/Edit Cost Item modal — tooltips (4)

| # | English | Location |
|---|---|---|
| 17 | e.g. Overtime labour | `WorkOrderDetailPage.jsx` line 8836 — placeholder |
| 18 | The estimated cost per finished unit from the Bill of Materials | Tooltip on "Forecasted Cost per Unit" field |
| 19 | The actual cost allocated to produce one finished unit in this Work Order | Tooltip on "Total Cost per Unit" — currently renders as mixed English/Indonesian ("...in this Perintah Kerja") since only the "Work Order" fragment matches |
| 20 | The total actual cost allocated for this cost item across the entire Work Order | Tooltip on "Total Cost This WO" — same mixed-language issue |

### Estimasi HPP panel (BOM Create/Detail pages) (1)

| # | English | Location |
|---|---|---|
| 21 | Material Cost (auto-calculated from selected materials) | `BomCreatePage.jsx` lines 452, 597 — subtitle under the Estimasi HPP heading |

---

Send translations for these and I'll wire them in — and this time I'll verify each one against the actual source string with `translateToIndonesian()` before considering it done, rather than trusting the doc text at face value.
