# Untranslated Wording — 4 Flows

Strings with no Indonesian equivalent in `src/utils/localization/localizationUtils.js`, scoped to the Material Request module, the Bill of Materials module, the "Request Material" flow inside Work Order, and the "New Outsource" flow inside Work Order. In Indonesian mode, these currently render as raw English.

Legend:
- **Missing** — no entry at all in the dictionary
- **Partial** — only a generic fragment matches (e.g. `"Search " → "Cari "`), the specific phrase itself is not translated

Locations are file:line at the time of this review — re-verify before editing, since the file may have shifted.

---

## Material Request (39)

| # | English | Location | Status |
|---|---|---|---|
| 1 | Request ID | MaterialRequestListPage.jsx:49 | Missing |
| 2 | Total Item | MaterialRequestListPage.jsx:51 | Missing |
| 3 | Requested Date | MaterialRequestListPage.jsx:53, DetailPage.jsx:827 | Missing |
| 4 | Last 7 days / Last 30 days (filter options) | MaterialRequestListPage.jsx:224-225 | Missing (dict has differently-cased "Last 7 Days") |
| 5 | Search request ID | MaterialRequestListPage.jsx:243 | Partial ("Search " → "Cari " only) |
| 6 | No material requests found. | MaterialRequestListPage.jsx:372 | Missing |
| 7 | Some materials are expired | MaterialRequestDetailPage.jsx:30 | Missing |
| 8 | Review your stock to avoid incorrect allocation. | MaterialRequestDetailPage.jsx:31 | Missing |
| 9 | Some material stocks are changed | MaterialRequestDetailPage.jsx:34 | Missing |
| 10 | Some material stocks are changed and expired | MaterialRequestDetailPage.jsx:38 | Missing |
| 11 | Request not found. | MaterialRequestDetailPage.jsx:177 | Missing |
| 12 | Back to Material Request | MaterialRequestDetailPage.jsx:178 | Missing |
| 13 | Status successfully changed to Preparing | MaterialRequestDetailPage.jsx:202 | Missing |
| 14 | Material successfully re-prepared | MaterialRequestDetailPage.jsx:196 | Missing |
| 15 | Material batch successfully updated | MaterialRequestDetailPage.jsx:233 | Missing |
| 16 | Request successfully confirmed | MaterialRequestDetailPage.jsx:244 | Missing |
| 17 | Request successfully canceled | MaterialRequestDetailPage.jsx:268 | Missing |
| 18 | Material request successfully completed | MaterialRequestDetailPage.jsx:333 | Missing |
| 19 | Request Detail | MaterialRequestDetailPage.jsx:750, 758 | Missing |
| 20 | Request Canceled | MaterialRequestDetailPage.jsx:795 | Missing |
| 21 | This material request has been canceled and will not proceed further. | MaterialRequestDetailPage.jsx:798 | Missing |
| 22 | Requested Material (tab) | MaterialRequestDetailPage.jsx:835 | Missing |
| 23 | Related Request (tab) | MaterialRequestDetailPage.jsx:836 | Missing |
| 24 | Fulfillable Qty | MaterialRequestDetailPage.jsx:373 | Missing |
| 25 | Shortage Qty | MaterialRequestDetailPage.jsx:376 | Missing |
| 26 | The quantity of material submitted by production / allocated based on stock / unfulfilled due to insufficient stock (3 tooltips) | MaterialRequestDetailPage.jsx:58-60 | Missing |
| 27 | Exceeding reason: / Request reason: / Shortage Reason: | MaterialRequestDetailPage.jsx:388, 390, 464 | Missing |
| 28 | No related requests for this work order. | MaterialRequestDetailPage.jsx:539 | Missing |
| 29 | Timestamp | MaterialRequestDetailPage.jsx:630 | Missing |
| 30 | Preparing / Re-Preparing / Start Transfer (activity log labels) | MaterialRequestDetailPage.jsx:44-49 | Missing |
| 31 | Cancel Request / Start Preparation / Start Transfer / Reject Receipt / Review Stock (action buttons) | MaterialRequestDetailPage.jsx:871-914 | Missing |
| 32 | Start Transferring? / Reject Receipt? / Cancel Request? / Confirm Receipt? (confirm dialog titles) | MaterialRequestDetailPage.jsx:923, 941, 1080 | Missing |
| 33 | Please input your reason for rejecting this receipt / for canceling request | MaterialRequestDetailPage.jsx:944 | Missing |
| 34 | Submit Request | MaterialRequestDetailPage.jsx:950, drawer:691 | Missing |
| 35 | Input Reason | MaterialRequestDetailPage.jsx:963 | Missing |
| 36 | Expired Materials Detected / "{n} materials are expired..." / Confirm Anyway | MaterialRequestDetailPage.jsx:1001-1014 | Missing |
| 37 | Material Preparation (drawer title) | MaterialPreparationDrawer.jsx:326 | Missing |
| 38 | Select batch / No batch selected / Add Batch / Exceeds requested qty / Shortage Reason / Explain why the request cannot be fully fulfilled | MaterialPreparationDrawer.jsx:479-572 | Missing |
| 39 | Review Material Preparation / Stock Allocation Conflict / Some materials are no longer available... / Refresh Data | MaterialPreparationDrawer.jsx:640-654 | Missing |

---

## Bill of Materials (46)

| # | English | Location | Status |
|---|---|---|---|
| 1 | New BOM (button) | BomListPage.jsx:74 | Missing |
| 2 | BOM Name | BomListPage.jsx:24, BomCreatePage.jsx:342 | Missing |
| 3 | Version | BomListPage.jsx:25 | Missing |
| 4 | Created at / Updated at | BomListPage.jsx:26-27 | Missing |
| 5 | Search BOM Name... | BomListPage.jsx:123 | Partial ("Search " → "Cari " only) |
| 6 | No bill of materials found. | BomListPage.jsx:200 | Missing |
| 7 | Add New Bill of Materials / Edit Bill of Materials | BomCreatePage.jsx:311 | Missing |
| 8 | Bill of Materials Information | BomCreatePage.jsx:339 | Missing |
| 9 | e.g. European Working Desk (placeholder) | BomCreatePage.jsx:345 | Missing |
| 10 | Optional description (placeholder) | BomCreatePage.jsx:376 | Missing |
| 11 | Materials (section title) | BomCreatePage.jsx:388 | Missing |
| 12 | Add Material | BomCreatePage.jsx:390, MaterialLineModal.jsx:23 | Missing |
| 13 | Please add at least one material | BomCreatePage.jsx:395 | Missing |
| 14 | Unknown Material | BomCreatePage.jsx:418 | Missing |
| 15 | No materials added yet. Click "Add Material" to get started. | BomCreatePage.jsx:449 | Missing |
| 16 | Material Cost (auto-calculated label) | BomCreatePage.jsx:452 | Missing |
| 17 | Add Routing | BomCreatePage.jsx:462, RoutingLineModal.jsx:29 | Missing |
| 18 | Please add at least one routing step | BomCreatePage.jsx:467 | Missing |
| 19 | Routing Name / Operation Name / Hours (column headers) | BomCreatePage.jsx:477-479 | Missing |
| 20 | No routing steps added yet. Click "Add Routing" to get started. | BomCreatePage.jsx:550 | Missing |
| 21 | Forecasted Cost of Goods Sold | BomCreatePage.jsx:585, BomDetailPage.jsx:223 | Missing |
| 22 | Labour Cost / Packing Cost / Shipping Cost / Overhead Cost / Other Cost (+ their descriptions) | BomCreatePage.jsx:24-28 | Missing |
| 23 | Total Forecasted COGS | BomCreatePage.jsx:616, BomDetailPage.jsx:379 | Missing |
| 24 | Bill of Materials not found. | BomDetailPage.jsx:66 | Missing |
| 25 | BOM Detail | BomDetailPage.jsx:92 | Missing |
| 26 | Version {n}.0 | BomDetailPage.jsx:128 | Missing (dynamic pattern only covers "Revised to Version") |
| 27 | Materials / Routing / Forecasted COGS (tab labels) | BomDetailPage.jsx:30-32 | Missing |
| 28 | No materials added to this BOM. | BomDetailPage.jsx:182 | Missing |
| 29 | Routing / Operation / Hours (routing table headers) | BomDetailPage.jsx:196-199 | Missing |
| 30 | No routing steps added to this BOM. | BomDetailPage.jsx:214 | Missing |
| 31 | Cost Composition | BomDetailPage.jsx:246 | Missing |
| 32 | "{amount} total" | BomDetailPage.jsx:249 | Missing |
| 33 | Material Cost / Labour Cost / etc. (cost composition labels) | BomDetailPage.jsx:226-231 | Missing |
| 34 | Auto-calculated | BomDetailPage.jsx:301 | Missing |
| 35 | Sum of BOM qty × avg stock cost per material | BomDetailPage.jsx:304 | Missing |
| 36 | Hide Cost Breakdown / See Cost Breakdown | BomDetailPage.jsx:321, CostFieldAccordion.jsx:93 | Missing |
| 37 | Material / Average Cost / Quantity / Subtotal (breakdown table headers) | BomDetailPage.jsx:330-333 | Missing (headers reused, but this table instance untranslated) |
| 38 | "{amount} / Pcs" | BomDetailPage.jsx:380 | Missing |
| 39 | Search or select... (dropdown placeholder) | MaterialLineModal.jsx:31, RoutingLineModal.jsx:37 | Missing |
| 40 | Enter quantity | MaterialLineModal.jsx:39 | Missing |
| 41 | Select a routing first | RoutingLineModal.jsx:46 | Missing |
| 42 | Enter hours | RoutingLineModal.jsx:54 | Missing |
| 43 | No results | SearchableSelectField.jsx:126 | Missing |
| 44 | New (badge) | CostFieldAccordion.jsx:52 | Missing |
| 45 | Add Cost Item | CostFieldAccordion.jsx:109, 181 | Missing |
| 46 | Breakdown item name (placeholder) | CostFieldAccordion.jsx:139 | Missing |

---

## Work Order — "Request Material" Flow (24)

| # | English | Location | Status |
|---|---|---|---|
| 1 | Materials (section title) | WorkOrderDetailPage.jsx:4119 | Missing |
| 2 | BOM Name: | WorkOrderDetailPage.jsx:4129 | Missing |
| 3 | View Request History | WorkOrderDetailPage.jsx:4142 | Missing |
| 4 | No / Type / Required Qty (table headers) | WorkOrderDetailPage.jsx:4166-4171 | Missing |
| 5 | Quick Add Required Materials | WorkOrderDetailPage.jsx:3306 | Missing |
| 6 | This will replace current selections with all required | WorkOrderDetailPage.jsx:3314 | Missing |
| 7 | Apply Remaining BOM | WorkOrderDetailPage.jsx:3319 | Missing |
| 8 | Type / Material / Quantity (draft row headers) | WorkOrderDetailPage.jsx:3340-3342 | Missing |
| 9 | Select Material | WorkOrderDetailPage.jsx:3405 | Missing |
| 10 | Search material name or SKU | WorkOrderDetailPage.jsx:3407 | Partial ("Search " → "Cari " only) |
| 11 | Remaining: {n} {unit} | WorkOrderDetailPage.jsx:3453 | Missing |
| 12 | Exceeding Reason / Select Exceeding Reason | WorkOrderDetailPage.jsx:3491-3496 | Missing |
| 13 | Notes (bare label on draft rows) | WorkOrderDetailPage.jsx:3532 | Missing |
| 14 | Explain why the requested quantity exceeds the remaining BOM quantity | WorkOrderDetailPage.jsx:3546 | Missing |
| 15 | Request Reason / Select Request Reason | WorkOrderDetailPage.jsx:3587-3592 | Missing |
| 16 | Explain why this material is needed outside the BOM | WorkOrderDetailPage.jsx:3642 | Missing |
| 17 | Add Material (drawer button) | WorkOrderDetailPage.jsx:3673 | Missing |
| 18 | Submit Request | WorkOrderDetailPage.jsx:3691 | Missing |
| 19 | Request Material History (modal title) | WorkOrderDetailPage.jsx:3704 | Missing |
| 20 | "{n} Materials Shortage" | WorkOrderDetailPage.jsx:3729 | Missing |
| 21 | "You have {n} shortage materials from {id}" | WorkOrderDetailPage.jsx:3737 | Missing |
| 22 | Request Shortage | WorkOrderDetailPage.jsx:3742 | Missing |
| 23 | Request ID / Requested Date / Status (history table headers) | WorkOrderDetailPage.jsx:3764-3767 | Missing |
| 24 | R&D / Trial run, Material wastage, Rework (non-BOM category & exceeding-reason dropdown options) | WorkOrderDetailPage.jsx:98-115 | Missing |

---

## Work Order — "New Outsource" Flow (37)

| # | English | Location | Status |
|---|---|---|---|
| 1 | Routing / Operation / Yet to Start / In Progress / Completed (routing table headers) | WorkOrderDetailPage.jsx:4401-4406 | Missing ("Step" alone is translated) |
| 2 | Awaiting Update: {n} | WorkOrderDetailPage.jsx:4478 | Missing |
| 3 | "{n} items have been received from the vendor." | WorkOrderDetailPage.jsx:4482 | Missing |
| 4 | "Once this step is updated, the system will automatically mark them as completed." | WorkOrderDetailPage.jsx:4483 | Missing |
| 5 | Planned Date (header, ready-to-process view) | WorkOrderDetailPage.jsx:4514 | Missing |
| 6 | Add Date | WorkOrderDetailPage.jsx:4650 | Missing |
| 7 | Edit Planned Date (tooltip/title) | WorkOrderDetailPage.jsx:4638 | Missing |
| 8 | Waiting Prev Process | WorkOrderDetailPage.jsx:4711, 4761 | Missing |
| 9 | Allow Outsourced Stages | WorkOrderDetailPage.jsx:4821 | Missing |
| 10 | "Step {n}: {route} - {op}" (combined step label) | WorkOrderDetailPage.jsx:4846 | Missing (only bare "Step {n}" pattern matches) |
| 11 | All Vendors / All Statuses / All POs / Included Steps (filter labels) | WorkOrderDetailPage.jsx:4873-4910 | Missing |
| 12 | Without Purchase Order | WorkOrderDetailPage.jsx:4897 | Missing |
| 13 | Search Assignment ID | WorkOrderDetailPage.jsx:4917 | Partial ("Search " → "Cari " only) |
| 14 | Assignment ID / Included Steps / Receipt Progress (table headers) | WorkOrderDetailPage.jsx:4931-4936 | Missing |
| 15 | Add a vendor to assign outsourced output. You can also add Internal from the Add Vendor modal. | WorkOrderDetailPage.jsx:4968-4969 | Missing |
| 16 | No assignments match the selected filters. | WorkOrderDetailPage.jsx:5009 | Missing |
| 17 | Internal (vendor name literal) | WorkOrderDetailPage.jsx:5106 | Missing |
| 18 | Release to Vendor (tooltip/title/drawer heading) | WorkOrderDetailPage.jsx:5395, 5399, 8426 | Missing |
| 19 | Assignment Log (tooltip/title) | WorkOrderDetailPage.jsx:5444, 5448 | Missing |
| 20 | Outsourcing Cost | WorkOrderDetailPage.jsx:5509, 5862 | Missing |
| 21 | Are you sure you want to remove this assignment? This action will unassign the vendor from this stage. | WorkOrderDetailPage.jsx:6115 | Missing |
| 22 | Yes, Remove | WorkOrderDetailPage.jsx:6131 | Missing |
| 23 | Order Planned Date: | WorkOrderDetailPage.jsx:6190 | Missing |
| 24 | Planned Finish Date | WorkOrderDetailPage.jsx:6235 | Missing (dict only has "Planned End Date") |
| 25 | Manage Routing (modal title) | WorkOrderDetailPage.jsx:6340 | Missing |
| 26 | Operation: {op} | WorkOrderDetailPage.jsx:6348 | Missing |
| 27 | Item must be completed in the previous step to become available in the next one. Once Completed, items are locked and cannot be reverted. | WorkOrderDetailPage.jsx:6379-6381 | Missing |
| 28 | Included Steps (field label) | WorkOrderDetailPage.jsx:7328 | Missing |
| 29 | Please select a sequential range of steps for this vendor assignment. | WorkOrderDetailPage.jsx:7338 | Missing |
| 30 | No outsourced steps available. | WorkOrderDetailPage.jsx:7352 | Missing |
| 31 | "Step {n} - {route}" (combined step-range label) | WorkOrderDetailPage.jsx:7358 | Missing (only bare "Step {n}" pattern matches) |
| 32 | Assigned Output (field label) | WorkOrderDetailPage.jsx:7460 | Missing |
| 33 | Available: {n} pcs / Available: - | WorkOrderDetailPage.jsx:7465-7466 | Missing |
| 34 | Exceeds available quantity ({n} pcs). | WorkOrderDetailPage.jsx:7525 | Missing |
| 35 | Purchase Order (Optional) / Select PO / No Editable Purchase Order Found | WorkOrderDetailPage.jsx:7544-7547 | Missing |
| 36 | Select an existing PO if it is already known. If left empty, you can add the PO later. | WorkOrderDetailPage.jsx:7600-7601 | Missing |
| 37 | Notes (field label, plain) / Release to Vendor (drawer heading, second use) | WorkOrderDetailPage.jsx:8280, 8426 | Missing |
