// =============================
// MATERIAL REQUEST — MOCK STORE
// =============================
// A module-level mutable store so status changes persist across navigation
// for the session (resets on reload), consistent with the rest of the app.

// Request status -> { label, statusKey, badge (solid), badgeVariant (soft, for counters) }
export const REQUEST_STATUS_META = {
  new_request: { label: "New Request", badge: "blue", badgeVariant: "blue-light" },
  preparing: { label: "Preparing", badge: "yellow", badgeVariant: "yellow-light" },
  transferring: { label: "Transferring", badge: "orange", badgeVariant: "orange-light" },
  completed: { label: "Completed", badge: "green", badgeVariant: "green-light" },
  canceled: { label: "Canceled", badge: "red", badgeVariant: "red-light" },
};

export const ROW_STATUS_META = {
  not_started: { label: "Not Started", badge: "grey" },
  available: { label: "Available", badge: "green" },
  partially_available: { label: "Partially Available", badge: "orange" },
  not_available: { label: "Not Available", badge: "red" },
};

// Derive a per-row status key from a fulfillment result.
export const deriveRowStatusKey = (requestedQty, fulfillableQty) => {
  if (!fulfillableQty || fulfillableQty <= 0) return "not_available";
  if (fulfillableQty >= requestedQty) return "available";
  return "partially_available";
};

export const totalAvailable = (batches = []) =>
  batches.reduce((sum, b) => sum + (b.available || 0), 0);

const makeItem = (overrides) => ({
  type: "BOM",
  name: "",
  sku: "",
  requestedQty: 0,
  unit: "pcs",
  // Stock currently on hand for this material, per batch.
  availableBatches: [],
  // For Non-BOM items: the reason the requester submitted this material.
  justification: "",
  // Set once the request has been prepared. null = not prepared yet.
  allocation: null,
  ...overrides,
});

// Build an allocation result (used to seed already-prepared requests).
const buildAllocation = (requestedQty, fulfillableQty, batches = [], reason = "") => ({
  fulfillableQty,
  shortageQty: Math.max(requestedQty - fulfillableQty, 0),
  batches,
  reason,
  rowStatusKey: deriveRowStatusKey(requestedQty, fulfillableQty),
});

// The canonical sample item set referenced in the brief / screenshots.
const sampleItems = () => [
  makeItem({
    type: "BOM",
    name: "Wooden Plank with With Black Striped Leopard",
    sku: "WOD-023UDISJJDS",
    requestedQty: 50,
    unit: "pcs",
    availableBatches: [
      { batch: "BAT-260126-000001", available: 45 },
      { batch: "BAT-260126-000002", available: 5 },
      { batch: "BAT-260126-000003", available: 30 },
      { batch: "BAT-260126-000008", available: 25 },
    ],
    // Requested quantity exceeded the remaining BOM quantity (entered in the Work Order).
    exceedingReason: "Material wastage",
    exceedingNotes: "Around 5 pcs are expected to be lost during cutting and shaping.",
  }),
  makeItem({
    type: "BOM",
    name: "Paint",
    sku: "PAI-WIQIFQJFJSA",
    requestedQty: 5,
    unit: "liter",
    availableBatches: [
      { batch: "BAT-260126-000002", available: 2 },
      { batch: "BAT-260126-000007", available: 1 },
    ],
  }),
  makeItem({
    type: "Non-BOM",
    name: "Nail Box with 1000000 pcs nails per bpx",
    sku: "NAI-9AIF0U092F",
    requestedQty: 10,
    unit: "box",
    availableBatches: [],
    // Request reason + notes (entered in the Work Order for Non-BOM materials).
    requestReason: "Packaging change",
    requestNotes:
      "Requested for additional reinforcement not covered by the BOM. Needed to complete the custom packaging for this work order.",
    justification:
      "Requested for additional reinforcement not covered by the BOM. Needed to complete the custom packaging for this work order.",
  }),
];

// Item set for the "stock allocation conflict" demo. Each item carries an
// `updatedBatches` field representing the freshly-refreshed stock that replaces
// `availableBatches` after the user hits "Refresh Data" in the conflict modal.
// The initial `availableBatches` are intentionally optimistic (enough to fulfill),
// while `updatedBatches` reflect stock that was consumed by another request.
const conflictSampleItems = () => [
  makeItem({
    type: "BOM",
    name: "Wooden Plank with With Black Striped Leopard",
    sku: "WOD-023UDISJJDS",
    requestedQty: 50,
    unit: "pcs",
    availableBatches: [
      { batch: "BAT-260126-000001", available: 45 },
      { batch: "BAT-260126-000002", available: 5 },
      { batch: "BAT-260126-000003", available: 30 },
    ],
    // Refreshed stock: batch 000001 was fully consumed by another request.
    updatedBatches: [
      { batch: "BAT-260126-000002", available: 5 },
      { batch: "BAT-260126-000003", available: 30 },
      { batch: "BAT-260126-000008", available: 25 },
    ],
    exceedingReason: "Material wastage",
    exceedingNotes: "Around 5 pcs are expected to be lost during cutting and shaping.",
  }),
  makeItem({
    type: "BOM",
    name: "Paint",
    sku: "PAI-WIQIFQJFJSA",
    requestedQty: 5,
    unit: "liter",
    availableBatches: [
      { batch: "BAT-260126-000002", available: 4 },
      { batch: "BAT-260126-000007", available: 3 },
    ],
    // Refreshed stock: less paint on hand than before.
    updatedBatches: [
      { batch: "BAT-260126-000007", available: 2 },
    ],
  }),
  makeItem({
    type: "Non-BOM",
    name: "Nail Box with 1000000 pcs nails per bpx",
    sku: "NAI-9AIF0U092F",
    requestedQty: 10,
    unit: "box",
    availableBatches: [
      { batch: "BAT-260126-000009", available: 6 },
    ],
    // Refreshed stock: the nail boxes are no longer available at all.
    updatedBatches: [],
    requestReason: "Packaging change",
    requestNotes:
      "Requested for additional reinforcement not covered by the BOM. Needed to complete the custom packaging for this work order.",
    justification:
      "Requested for additional reinforcement not covered by the BOM. Needed to complete the custom packaging for this work order.",
  }),
];

// Build an already-allocated item, optionally carrying transfer-time stock
// conflicts: `expired` batches (no longer usable) and `stockChanges` (the on-hand
// amount changed since preparation). These drive the Start Transfer conflict modals.
const allocItem = ({
  type = "BOM",
  name,
  sku,
  requestedQty,
  unit = "pcs",
  availableBatches = [],
  allocBatches = [],
  reason = "",
  expired = [],
  stockChanges = [],
  exceedingReason,
  exceedingNotes,
  requestReason,
  requestNotes,
}) => {
  const fulfillable = allocBatches.reduce((sum, b) => sum + b.qty, 0);
  return {
    ...makeItem({
      type,
      name,
      sku,
      requestedQty,
      unit,
      availableBatches,
      exceedingReason,
      exceedingNotes,
      requestReason,
      requestNotes,
    }),
    allocation: buildAllocation(requestedQty, fulfillable, allocBatches, reason),
    // Transfer-time conflict metadata.
    expiredBatches: expired, // [{ batch, qty, expiredOn }]
    stockChanges, // [{ batch, previous, current }]
  };
};

// ---- Transfer-time stock conflict demos ----
// Each returns a fully-allocated ("prepared") item set. Some items flag batches as
// expired and/or changed so the Start Transfer flow can surface the conflict modals.
const woodenPlankExpired = () =>
  allocItem({
    type: "BOM",
    name: "Wooden Plank with With Black Striped Leopard",
    sku: "WOD-023UDISJJDS",
    requestedQty: 50,
    unit: "pcs",
    availableBatches: [
      { batch: "BAT-260126-000001", available: 45 },
      { batch: "BAT-260126-000002", available: 5 },
      { batch: "BAT-260126-000003", available: 30 },
    ],
    allocBatches: [
      { batch: "BAT-260126-000001", qty: 45 },
      { batch: "BAT-260126-000002", qty: 5 },
    ],
    // BAT-260126-000001 turned out to be expired after preparation.
    expired: [{ batch: "BAT-260126-000001", qty: 45, expiredOn: "10 Feb" }],
    exceedingReason: "Material wastage",
    exceedingNotes: "Around 5 pcs are expected to be lost during cutting and shaping.",
  });

const paintStockChanged = () =>
  allocItem({
    type: "BOM",
    name: "Paint",
    sku: "PAI-WIQIFQJFJSA",
    requestedQty: 5,
    unit: "liter",
    availableBatches: [
      { batch: "BAT-260126-000002", available: 2 },
      { batch: "BAT-260126-000007", available: 1 },
    ],
    allocBatches: [
      { batch: "BAT-260126-000002", qty: 2 },
      { batch: "BAT-260126-000007", qty: 1 },
    ],
    reason: "Insufficient stock available at preparation time.",
    // BAT-260126-000002 on-hand dropped from 2 → 1 liter since preparation.
    stockChanges: [{ batch: "BAT-260126-000002", previous: 2, current: 1 }],
  });

const nailBoxNoStock = () =>
  allocItem({
    type: "Non-BOM",
    name: "Nail Box with 1000000 pcs nails per bpx",
    sku: "NAI-9AIF0U092F",
    requestedQty: 10,
    unit: "box",
    availableBatches: [],
    allocBatches: [],
    reason: "No stock available at preparation time.",
    requestReason: "Packaging change",
    requestNotes:
      "Requested for additional reinforcement not covered by the BOM. Needed to complete the custom packaging for this work order.",
  });

const woodenPlankOk = () =>
  allocItem({
    type: "BOM",
    name: "Wooden Plank with With Black Striped Leopard",
    sku: "WOD-023UDISJJDS",
    requestedQty: 50,
    unit: "pcs",
    availableBatches: [
      { batch: "BAT-260126-000001", available: 45 },
      { batch: "BAT-260126-000002", available: 5 },
      { batch: "BAT-260126-000003", available: 30 },
    ],
    allocBatches: [
      { batch: "BAT-260126-000001", qty: 45 },
      { batch: "BAT-260126-000002", qty: 5 },
    ],
    exceedingReason: "Material wastage",
    exceedingNotes: "Around 5 pcs are expected to be lost during cutting and shaping.",
  });

const paintOk = () =>
  allocItem({
    type: "BOM",
    name: "Paint",
    sku: "PAI-WIQIFQJFJSA",
    requestedQty: 5,
    unit: "liter",
    availableBatches: [
      { batch: "BAT-260126-000002", available: 2 },
      { batch: "BAT-260126-000007", available: 1 },
    ],
    allocBatches: [
      { batch: "BAT-260126-000002", qty: 2 },
      { batch: "BAT-260126-000007", qty: 1 },
    ],
    reason: "Insufficient stock available at preparation time.",
  });

// Richer items for the combined case — multiple expired + changed batches across
// materials, so the two-column info section is exercised with many entries.
const woodenPlankExpiredChanged = () =>
  allocItem({
    type: "BOM",
    name: "Wooden Plank with With Black Striped Leopard",
    sku: "WOD-023UDISJJDS",
    requestedQty: 50,
    unit: "pcs",
    availableBatches: [
      { batch: "BAT-260126-000001", available: 45 },
      { batch: "BAT-260126-000002", available: 5 },
      { batch: "BAT-260126-000003", available: 30 },
      { batch: "BAT-260126-000004", available: 20 },
      { batch: "BAT-260126-000008", available: 25 },
    ],
    allocBatches: [
      { batch: "BAT-260126-000001", qty: 45 },
      { batch: "BAT-260126-000002", qty: 5 },
    ],
    expired: [
      { batch: "BAT-260126-000001", qty: 45, expiredOn: "10 Feb" },
      { batch: "BAT-260126-000004", qty: 20, expiredOn: "15 Feb" },
    ],
    stockChanges: [
      { batch: "BAT-260126-000003", previous: 30, current: 25 },
      { batch: "BAT-260126-000008", previous: 25, current: 10 },
    ],
    exceedingReason: "Material wastage",
    exceedingNotes: "Around 5 pcs are expected to be lost during cutting and shaping.",
  });

const paintExpiredChanged = () =>
  allocItem({
    type: "BOM",
    name: "Paint",
    sku: "PAI-WIQIFQJFJSA",
    requestedQty: 5,
    unit: "liter",
    availableBatches: [
      { batch: "BAT-260126-000002", available: 2 },
      { batch: "BAT-260126-000007", available: 2 },
    ],
    allocBatches: [
      { batch: "BAT-260126-000002", qty: 2 },
      { batch: "BAT-260126-000007", qty: 1 },
    ],
    reason: "Insufficient stock available at preparation time.",
    expired: [{ batch: "BAT-260126-000002", qty: 2, expiredOn: "12 Feb" }],
    stockChanges: [{ batch: "BAT-260126-000007", previous: 2, current: 1 }],
  });

// Extra BOM materials, each with an expired batch and a changed batch — used to
// make the conflict lists long enough to scroll inside the info section.
const extraConflictMaterials = () =>
  [
    { name: "Sandpaper Sheet Grit 120", sku: "SAN-09AF2K1", unit: "sheet", qty: 40, base: "0001" },
    { name: "Wood Glue Premium", sku: "GLU-77BQ3M2", unit: "liter", qty: 12, base: "0002" },
    { name: "Clear Varnish Gloss", sku: "VAR-31KD8L5", unit: "liter", qty: 10, base: "0003" },
    { name: "Steel Screws 4mm", sku: "SCR-55XP9R0", unit: "pcs", qty: 120, base: "0004" },
    { name: "Brass Hinges", sku: "HIN-12ZT4N8", unit: "pcs", qty: 30, base: "0005" },
    { name: "Foam Padding Roll", sku: "FOA-84LM6V3", unit: "roll", qty: 18, base: "0006" },
  ].map((m, i) => {
    const big = Math.round(m.qty * 0.6);
    const small = m.qty - big;
    const expiredOn = ["05 Feb", "07 Feb", "09 Feb", "11 Feb", "13 Feb", "16 Feb"][i];
    return allocItem({
      type: "BOM",
      name: m.name,
      sku: m.sku,
      unit: m.unit,
      requestedQty: m.qty,
      availableBatches: [
        { batch: `BAT-260126-${m.base}10`, available: big },
        { batch: `BAT-260126-${m.base}20`, available: small + 4 },
      ],
      allocBatches: [
        { batch: `BAT-260126-${m.base}10`, qty: big },
        { batch: `BAT-260126-${m.base}20`, qty: small },
      ],
      reason: "Insufficient stock available at preparation time.",
      expired: [{ batch: `BAT-260126-${m.base}10`, qty: big, expiredOn }],
      stockChanges: [{ batch: `BAT-260126-${m.base}20`, previous: small + 4, current: small }],
    });
  });

// Items for the "expired at receipt" demo — already allocated/transferred, but some
// allocated batches expired before the production team confirmed receipt.
const receiptExpiredItems = () => [
  allocItem({
    type: "BOM",
    name: "Wooden Plank with With Black Striped Leopard",
    sku: "WOD-023UDISJJDS",
    requestedQty: 50,
    unit: "pcs",
    availableBatches: [
      { batch: "BAT-260126-000004", available: 25 },
      { batch: "BAT-260126-000005", available: 20 },
      { batch: "BAT-260126-000002", available: 5 },
    ],
    allocBatches: [
      { batch: "BAT-260126-000004", qty: 25 },
      { batch: "BAT-260126-000005", qty: 20 },
      { batch: "BAT-260126-000002", qty: 5 },
    ],
    expired: [
      { batch: "BAT-260126-000004", qty: 25, expiredOn: "10 Feb" },
      { batch: "BAT-260126-000005", qty: 20, expiredOn: "15 Feb" },
    ],
    exceedingReason: "Material wastage",
    exceedingNotes: "Around 5 pcs are expected to be lost during cutting and shaping.",
  }),
  allocItem({
    type: "BOM",
    name: "Paint",
    sku: "PAI-WIQIFQJFJSA",
    requestedQty: 5,
    unit: "liter",
    availableBatches: [
      { batch: "BAT-260126-000001", available: 2 },
      { batch: "BAT-260126-000007", available: 1 },
    ],
    allocBatches: [
      { batch: "BAT-260126-000001", qty: 2 },
      { batch: "BAT-260126-000007", qty: 1 },
    ],
    reason: "Insufficient stock available at preparation time.",
    expired: [{ batch: "BAT-260126-000001", qty: 2, expiredOn: "12 Feb" }],
  }),
  nailBoxNoStock(),
];

// Case 2 — an expired batch only.
const transferExpiredItems = () => [woodenPlankExpired(), paintOk(), nailBoxNoStock()];
// Case 3 — a changed stock amount only.
const transferChangedItems = () => [woodenPlankOk(), paintStockChanged(), nailBoxNoStock()];
// Case 4 — many expired + changed batches across materials (long, scrollable lists).
const transferBothItems = () => [
  woodenPlankExpiredChanged(),
  paintExpiredChanged(),
  ...extraConflictMaterials(),
  nailBoxNoStock(),
];

// Seed an item set with allocations as if it had already been prepared.
const prepared = (items) =>
  items.map((it) => {
    const stock = totalAvailable(it.availableBatches);
    const fulfillable = Math.min(it.requestedQty, stock);
    const batches = it.availableBatches
      .reduce(
        (acc, b) => {
          if (acc.remaining <= 0) return acc;
          const take = Math.min(b.available, acc.remaining);
          acc.list.push({ batch: b.batch, qty: take });
          acc.remaining -= take;
          return acc;
        },
        { remaining: fulfillable, list: [] }
      )
      .list;
    const reason =
      fulfillable < it.requestedQty ? "Insufficient stock available at preparation time." : "";
    return { ...it, allocation: buildAllocation(it.requestedQty, fulfillable, batches, reason) };
  });

const INITIAL_REQUESTS = [
  {
    id: "REQ-929E92E9",
    requestId: "REQ0129031",
    requestedDate: "12/02/2025; 15:00",
    requestedDateRaw: "2025-12-09",
    requestedBy: "Anna Jones",
    workOrderNo: "WO-248824-20251109-00001",
    workOrderShort: "WO092309091",
    status: "new_request",
    items: sampleItems(),
    logs: [
      {
        statusKey: "new_request",
        title: "Request Created",
        by: "Anna Jones",
        timestamp: "2025-12-09; 15:00",
      },
    ],
  },
  {
    // Demo request for the Stock Allocation Conflict flow. Hitting "Start Preparing"
    // surfaces the conflict modal; "Refresh Data" reloads the updated batch stock.
    id: "REQ-6B3D8F12",
    requestId: "REQ0129032",
    requestedDate: "13/02/2025; 09:30",
    requestedDateRaw: "2025-12-13",
    requestedBy: "Marcus Lee",
    workOrderNo: "WO-248824-20251109-00001",
    workOrderShort: "WO092309091",
    status: "new_request",
    items: conflictSampleItems(),
    logs: [
      {
        statusKey: "new_request",
        title: "Request Created",
        by: "Marcus Lee",
        timestamp: "2025-12-13; 09:30",
      },
    ],
  },
  {
    id: "REQ-7A41C2B0",
    requestId: "REQ0129030",
    requestedDate: "10/02/2025; 15:00",
    requestedDateRaw: "2025-10-02",
    requestedBy: "Richard Mille",
    workOrderNo: "WO-248824-20251109-00001",
    workOrderShort: "WO092309091",
    status: "preparing",
    items: prepared(sampleItems()),
    logs: [
      { statusKey: "new_request", title: "Request Created", by: "Richard Mille", timestamp: "2025-10-02; 15:00" },
      { statusKey: "preparing", title: "Status changed to Preparing", by: "Natasha Smith", timestamp: "2025-10-02; 16:10" },
    ],
  },
  {
    // Demo — Start Transfer, Case 2: a batch is expired.
    id: "REQ-2E7F90A1",
    requestId: "REQ0129033",
    requestedDate: "11/02/2025; 10:15",
    requestedDateRaw: "2025-11-02",
    requestedBy: "Liam Carter",
    workOrderNo: "WO-248824-20251109-00005",
    workOrderShort: "WO092309091",
    status: "preparing",
    items: transferExpiredItems(),
    logs: [
      { statusKey: "new_request", title: "Request Created", by: "Liam Carter", timestamp: "2025-11-02; 10:15" },
      { statusKey: "preparing", title: "Status changed to Preparing", by: "Natasha Smith", timestamp: "2025-11-02; 11:00" },
    ],
  },
  {
    // Demo — Start Transfer, Case 3: a batch stock amount changed.
    id: "REQ-3A8C1B72",
    requestId: "REQ0129034",
    requestedDate: "11/02/2025; 13:40",
    requestedDateRaw: "2025-11-02",
    requestedBy: "Olivia Brown",
    workOrderNo: "WO-248824-20251109-00006",
    workOrderShort: "WO092309091",
    status: "preparing",
    items: transferChangedItems(),
    logs: [
      { statusKey: "new_request", title: "Request Created", by: "Olivia Brown", timestamp: "2025-11-02; 13:40" },
      { statusKey: "preparing", title: "Status changed to Preparing", by: "Natasha Smith", timestamp: "2025-11-02; 14:20" },
    ],
  },
  {
    // Demo — Start Transfer, Case 4: both expired and changed.
    id: "REQ-4D9E2C53",
    requestId: "REQ0129035",
    requestedDate: "11/02/2025; 16:05",
    requestedDateRaw: "2025-11-02",
    requestedBy: "Noah Wilson",
    workOrderNo: "WO-248824-20251109-00007",
    workOrderShort: "WO092309091",
    status: "preparing",
    items: transferBothItems(),
    logs: [
      { statusKey: "new_request", title: "Request Created", by: "Noah Wilson", timestamp: "2025-11-02; 16:05" },
      { statusKey: "preparing", title: "Status changed to Preparing", by: "Natasha Smith", timestamp: "2025-11-02; 16:45" },
    ],
  },
  {
    // Demo — Production POV "Confirm Receipt" with materials expired at receipt time.
    id: "REQ-7E2A1F90",
    requestId: "REQ0129036",
    requestedDate: "12/02/2025; 09:00",
    requestedDateRaw: "2025-12-02",
    requestedBy: "Ethan Walker",
    workOrderNo: "WO-248824-20251109-00008",
    workOrderShort: "WO092309091",
    status: "transferring",
    items: receiptExpiredItems(),
    logs: [
      { statusKey: "new_request", title: "Request Created", by: "Ethan Walker", timestamp: "2025-12-02; 09:00" },
      { statusKey: "preparing", title: "Status changed to Preparing", by: "Natasha Smith", timestamp: "2025-12-02; 10:00" },
      { statusKey: "transferring", title: "Status changed to Transferring", by: "Natasha Smith", timestamp: "2025-12-02; 11:30" },
    ],
  },
  {
    id: "REQ-55D9E1F4",
    requestId: "REQ0129029",
    requestedDate: "08/02/2025; 15:00",
    requestedDateRaw: "2025-08-02",
    requestedBy: "Abigail Husni",
    workOrderNo: "WO-248824-20251109-00002",
    workOrderShort: "WO092309091",
    status: "transferring",
    items: prepared(sampleItems()),
    logs: [
      { statusKey: "new_request", title: "Request Created", by: "Abigail Husni", timestamp: "2025-08-02; 15:00" },
      { statusKey: "preparing", title: "Status changed to Preparing", by: "Natasha Smith", timestamp: "2025-08-02; 15:40" },
      { statusKey: "transferring", title: "Status changed to Transferring", by: "Natasha Smith", timestamp: "2025-08-02; 16:05" },
    ],
  },
  {
    id: "REQ-31B0A7C8",
    requestId: "REQ0129028",
    requestedDate: "08/02/2025; 15:00",
    requestedDateRaw: "2025-08-02",
    requestedBy: "Zoe Adams",
    workOrderNo: "WO-248824-20251108-00003",
    workOrderShort: "WO092309091",
    status: "completed",
    items: sampleItems().map((it) => ({
      ...it,
      // Completed request was fully fulfilled.
      allocation: buildAllocation(
        it.requestedQty,
        it.requestedQty,
        it.availableBatches.length
          ? [{ batch: it.availableBatches[0].batch, qty: it.requestedQty }]
          : [{ batch: "BAT-260126-000003", qty: it.requestedQty }]
      ),
    })),
    logs: [
      { statusKey: "new_request", title: "Request Created", by: "Zoe Adams", timestamp: "2025-08-02; 15:00" },
      { statusKey: "preparing", title: "Status changed to Preparing", by: "Natasha Smith", timestamp: "2025-08-02; 15:20" },
      { statusKey: "transferring", title: "Status changed to Transferring", by: "Natasha Smith", timestamp: "2025-08-02; 15:50" },
      { statusKey: "completed", title: "Materials received — Completed", by: "Zoe Adams", timestamp: "2025-08-03; 09:15" },
    ],
  },
  {
    id: "REQ-9C2F6D31",
    requestId: "REQ0129027",
    requestedDate: "08/02/2025; 15:00",
    requestedDateRaw: "2025-08-02",
    requestedBy: "Zoe Adams",
    workOrderNo: "WO-248824-20251108-00004",
    workOrderShort: "WO092309091",
    status: "canceled",
    cancelReason: "Work order was put on hold, so these materials are no longer needed at this time.",
    cancelProofs: [
      { name: "cancellation-notice.pdf", description: "Cancellation notice from production" },
    ],
    items: sampleItems(),
    logs: [
      { statusKey: "new_request", title: "Request Created", by: "Zoe Adams", timestamp: "2025-08-02; 15:00" },
      { statusKey: "canceled", title: "Request Canceled", by: "Natasha Smith", timestamp: "2025-08-02; 17:30" },
    ],
  },
];

// Runtime-created requests (e.g. from the Work Order request flow) are persisted to
// localStorage so they survive a full page load — needed when the detail page is
// opened in a new tab, which starts with a fresh in-memory store.
const RUNTIME_STORAGE_KEY = "mr_runtime_requests";

const loadRuntimeRequests = () => {
  try {
    const raw = typeof localStorage !== "undefined" ? localStorage.getItem(RUNTIME_STORAGE_KEY) : null;
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveRuntimeRequests = (list) => {
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(RUNTIME_STORAGE_KEY, JSON.stringify(list));
    }
  } catch {
    /* ignore persistence failures (private mode, quota, etc.) */
  }
};

// In-memory store (mutated during the session). Seeded with the initial requests
// plus any runtime-created requests previously persisted in this browser.
let requests = (() => {
  const seeded = INITIAL_REQUESTS.map((r) => ({ ...r }));
  const seededIds = new Set(seeded.map((r) => r.id));
  const runtime = loadRuntimeRequests().filter((r) => r && !seededIds.has(r.id));
  return [...runtime, ...seeded];
})();

export const getRequests = () => requests;

export const getRequest = (id) => requests.find((r) => r.id === id) || null;

// Mock on-hand stock per material SKU. Used to seed availableBatches for newly
// created material requests so the preparation drawer isn't always empty.
const STOCK_BY_SKU = {
  "WOD-023UDISJJDS": [
    { batch: "BAT-260126-000001", available: 45 },
    { batch: "BAT-260126-000002", available: 5 },
    { batch: "BAT-260126-000003", available: 30 },
  ],
  "PAI-WIQIFQJFJSA": [
    { batch: "BAT-260126-000002", available: 2 },
    { batch: "BAT-260126-000007", available: 1 },
  ],
  "NAI-9AIF0U092F": [{ batch: "BAT-260126-000009", available: 10 }],
  "SCR-100200300": [{ batch: "BAT-260126-000201", available: 80 }],
  "GLU-400500600": [{ batch: "BAT-260126-000202", available: 12 }],
  "VAR-700800900": [{ batch: "BAT-260126-000203", available: 6 }],
  "SND-110220330": [{ batch: "BAT-260126-000204", available: 40 }],
};

// Fresh copies so callers can't mutate the shared mock stock.
export const getStockBatchesForSku = (sku) =>
  (STOCK_BY_SKU[sku] || []).map((b) => ({ ...b }));

// Register a newly-created request (newest first) and persist it across page loads.
export const addRequest = (req) => {
  requests = [req, ...requests.filter((r) => r.id !== req.id)];
  const runtime = loadRuntimeRequests().filter((r) => r && r.id !== req.id);
  saveRuntimeRequests([req, ...runtime]);
  return req;
};

// Classify the transfer-time stock conflict for a request:
// "none" | "expired" | "changed" | "both".
export const getTransferConflict = (request) => {
  const items = request?.items || [];
  const hasExpired = items.some((it) => (it.expiredBatches || []).length > 0);
  const hasChanged = items.some((it) => (it.stockChanges || []).length > 0);
  if (hasExpired && hasChanged) return "both";
  if (hasExpired) return "expired";
  if (hasChanged) return "changed";
  return "none";
};

// Affected materials/batches grouped by material, used for the drawer info
// section. Returns { expired: [{ name, sku, batches }], changed: [...] }.
export const buildTransferIssues = (request) => {
  const expired = [];
  const changed = [];
  (request?.items || []).forEach((it) => {
    if ((it.expiredBatches || []).length > 0) {
      expired.push({
        name: it.name,
        sku: it.sku,
        batches: it.expiredBatches.map((e) => ({
          batch: e.batch,
          qty: e.qty,
          unit: it.unit,
          expiredOn: e.expiredOn,
        })),
      });
    }
    if ((it.stockChanges || []).length > 0) {
      changed.push({
        name: it.name,
        sku: it.sku,
        batches: it.stockChanges.map((c) => ({
          batch: c.batch,
          previous: c.previous,
          current: c.current,
          unit: it.unit,
        })),
      });
    }
  });
  return { expired, changed };
};

// Items for the preparation drawer with the corrected stock applied: expired
// batches removed, changed amounts updated, and transfer metadata stripped so the
// drawer doesn't re-trigger any conflict.
export const buildTransferDrawerItems = (request) =>
  (request?.items || []).map((it) => {
    const expired = new Set((it.expiredBatches || []).map((e) => e.batch));
    const changes = new Map((it.stockChanges || []).map((c) => [c.batch, c.current]));
    const availableBatches = (it.availableBatches || [])
      .filter((b) => !expired.has(b.batch))
      .map((b) => (changes.has(b.batch) ? { ...b, available: changes.get(b.batch) } : b));
    const { expiredBatches, stockChanges, updatedBatches, ...rest } = it;
    return { ...rest, availableBatches };
  });

const nowStamp = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}; ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

// Apply the prepared allocations (from the preparation drawer) and move to Preparing.
// preparedItems is aligned by index to request.items.
export const applyPreparation = (id, preparedItems = []) => {
  requests = requests.map((r) =>
    r.id === id
      ? {
          ...r,
          status: "preparing",
          items: r.items.map((it, idx) => {
            const p = preparedItems[idx];
            if (!p) return it;
            return {
              ...it,
              allocation: buildAllocation(it.requestedQty, p.fulfillableQty, p.batches, p.reason),
            };
          }),
          logs: [
            ...r.logs,
            { statusKey: "preparing", title: "Status changed to Preparing", by: "Natasha Smith", timestamp: nowStamp() },
          ],
        }
      : r
  );
  return getRequest(id);
};

// Re-apply allocations after a transfer-time stock conflict was reviewed. Status
// stays "Preparing", the transfer conflict metadata is cleared, and a "Re-Preparing"
// activity is logged. preparedItems is aligned by index to request.items.
export const applyRePreparation = (id, preparedItems = []) => {
  requests = requests.map((r) =>
    r.id === id
      ? {
          ...r,
          status: "preparing",
          items: r.items.map((it, idx) => {
            const p = preparedItems[idx];
            if (!p) return it;
            return {
              ...it,
              allocation: buildAllocation(it.requestedQty, p.fulfillableQty, p.batches, p.reason),
              // Conflict resolved — drop the metadata so Start Transfer won't re-flag it.
              expiredBatches: [],
              stockChanges: [],
            };
          }),
          logs: [
            ...r.logs,
            { statusKey: "re_preparing", title: "Re-Preparing", by: "Natasha Smith", timestamp: nowStamp() },
          ],
        }
      : r
  );
  return getRequest(id);
};

export const setRequestStatus = (id, statusKey, logTitle, extra = {}) => {
  requests = requests.map((r) =>
    r.id === id
      ? {
          ...r,
          ...extra,
          status: statusKey,
          logs: logTitle
            ? [...r.logs, { statusKey, title: logTitle, by: "Natasha Smith", timestamp: nowStamp() }]
            : r.logs,
        }
      : r
  );
  return getRequest(id);
};
