# Untranslated Wording — Round 2 (after first translation pass)

Your screenshot flagged "New Request" and "Transferring" still showing in English on the Material Request list. I traced the root cause: these are **status labels defined as constants in mock/data files** (`REQUEST_STATUS_META`, `ROW_STATUS_META`, `POV_OPTIONS`, `QTY_TOOLTIPS` in `materialRequestMocks.js` and `MaterialRequestDetailPage.jsx`, plus dropdown option lists in `WorkOrderDetailPage.jsx`), not page copy — so they weren't in the strings the first extraction pass surfaced. I verified each row below programmatically against the current dictionary (`translateToIndonesian()`), not just by inspection.

**Already fixed** (these were approved in your docs' notes sections but I never wired them into the dictionary — done now, no action needed):
- R&D / Trial run → R&D / Trial Produksi
- Material wastage → Bahan Baku Terbuang
- Rework → Rework / Pengerjaan Ulang

**Also fixed — exact-string bugs from your latest screenshot:**
- `"BOM Name:"` (with the trailing colon, as its own text node before the value) was never added — only the colon-less `"BOM Name"` was. Now maps to *"Nama BOM:"*.
- `"This will replace current selections with all required"` — the real rendered string has no trailing "materials." (it's cut short in the source). My first pass added the wrong key with "materials." appended, so it never matched. Fixed to match the real string, same Indonesian wording as before.
- **Global fix per your instruction to keep "Bill of Materials" as-is:** two pre-existing dictionary entries (from before this review started) were silently translating bare `"Bill of Materials"` → `"Daftar Material"` and `"Bill of Material"` → `"Daftar Material"` everywhere those exact strings appear (breadcrumbs, etc.), which contradicted the terminology you want kept. Both now map to themselves, so "Bill of Materials" stays untranslated everywhere in the app.

---

## Still missing (31)

### Material Request — status & metadata (8)

| # | English | Location | Notes |
|---|---|---|---|
| 1 | New Request | `materialRequestMocks.js` → `REQUEST_STATUS_META.new_request` | Status pill shown in your screenshot |
| 2 | Transferring | `materialRequestMocks.js` → `REQUEST_STATUS_META.transferring` | Status pill shown in your screenshot |
| 3 | Available | `MaterialRequestDetailPage.jsx` → `ROW_STATUS_META.available` | Per-row fulfillment status |
| 4 | Partially Available | `MaterialRequestDetailPage.jsx` → `ROW_STATUS_META.partially_available` | Per-row fulfillment status |
| 5 | Not Available | `MaterialRequestDetailPage.jsx` → `ROW_STATUS_META.not_available` | Per-row fulfillment status |
| 6 | Inventory Team | `MaterialRequestDetailPage.jsx` → `POV_OPTIONS` | "POV:" selector on detail page |
| 7 | Production Team | `MaterialRequestDetailPage.jsx` → `POV_OPTIONS` | "POV:" selector on detail page |
| 8 | The quantity of material submitted by production / The quantity allocated based on current stock availability / Unfulfilled quantity due to insufficient stock | `MaterialRequestDetailPage.jsx` → `QTY_TOOLTIPS` | 3 tooltips on Requested/Fulfillable/Shortage Qty columns |

### Work Order — New Outsource (1)

| # | English | Location | Notes |
|---|---|---|---|
| 9 | Released to Vendor | `WorkOrderDetailPage.jsx` ~line 8614 | Assignment Log drawer tab label — distinct from the already-translated "Release to Vendor" (verb/button) |

### Work Order — Request Material, non-BOM category options (11)

| # | English | Location |
|---|---|---|
| 10 | Design change | `NON_BOM_CATEGORY_OPTIONS` |
| 11 | Material replacement | `NON_BOM_CATEGORY_OPTIONS` |
| 12 | Extra finishing | `NON_BOM_CATEGORY_OPTIONS` |
| 13 | Production consumable | `NON_BOM_CATEGORY_OPTIONS` |
| 14 | Packaging change | `NON_BOM_CATEGORY_OPTIONS` |
| 15 | Testing a new material or process not yet in the standard BOM | description for "R&D / Trial run" |
| 16 | Product design was updated and needs a new material | description for "Design change" |
| 17 | Original BOM material is unavailable, using a substitute | description for "Material replacement" |
| 18 | An additional finishing step was added (e.g. coating, sanding, polishing) | description for "Extra finishing" |
| 19 | Item needed to support the production process (e.g. adhesive, abrasive) | description for "Production consumable" |
| 20 | Packaging material changed by buyer or logistics team | description for "Packaging change" |

### Work Order — Request Material, exceeding-reason options (11)

| # | English | Location |
|---|---|---|
| 21 | Quality testing | `EXCEEDING_REASON_OPTIONS` |
| 22 | Safety buffer | `EXCEEDING_REASON_OPTIONS` |
| 23 | Buyer change request | `EXCEEDING_REASON_OPTIONS` |
| 24 | Machine setup | `EXCEEDING_REASON_OPTIONS` |
| 25 | Some material will be lost during cutting, shaping, or processing | description for "Material wastage" |
| 26 | Extra needed for testing or inspection samples | description for "Quality testing" |
| 27 | Keeping extra in case of shortage or delay | description for "Safety buffer" |
| 28 | Extra needed in case some pieces need to be redone | description for "Rework" |
| 29 | Customer changed the requirement and needs more material | description for "Buyer change request" |
| 30 | Material used during machine calibration before production starts | description for "Machine setup" |

### Bill of Materials / Work Order — COGS & tab labels (7, added per your request)

| # | English | Location | Notes |
|---|---|---|---|
| 31 | Details | `WorkOrderDetailPage.jsx` ~line 4088 — BOM/costing tab bar | Sibling tabs "Logs"→"Log" already translate correctly |
| 32 | Actual COGS | `WorkOrderDetailPage.jsx` ~line 4089 — same tab bar | |
| 33 | Forecasted COGS | `BomDetailPage.jsx` line 32 — BOM detail tab bar (`Materials` / `Routing` / `Forecasted COGS`) | Flagged as missing in round 1 too — still not translated, please confirm wording |
| 34 | Forecasted COGS (BOM) | `WorkOrderDetailPage.jsx` line 5708 | Small label above a cost figure |
| 35 | Actual COGS (current) | `WorkOrderDetailPage.jsx` line 5717 | Small label above a cost figure |
| 36 | Total Actual COGS | `WorkOrderDetailPage.jsx` line 5949 | |

---

Send translations for these (same format as before) and I'll wire them into `localizationUtils.js`.
