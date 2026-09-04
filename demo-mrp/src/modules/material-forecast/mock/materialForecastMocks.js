// Helpers to compute real ISO week numbers and date ranges starting from today
const getMondayOfCurrentWeek = () => {
  const today = new Date();
  const day = today.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(today);
  monday.setDate(today.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
};

const getISOWeekNumber = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  return 1 + Math.round(((d - week1) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
};

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const fmtShort = (d) => `${MONTHS[d.getMonth()]} ${d.getDate()}`;

const getWeekLabel = (weekOffset) => {
  const monday = getMondayOfCurrentWeek();
  monday.setDate(monday.getDate() + weekOffset * 7);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const wn = getISOWeekNumber(monday);
  return `W${wn} (${fmtShort(monday)} - ${fmtShort(sunday)})`;
};

// Day offset within the current week (0=Mon … 6=Sun) — used to pin slipped WOs to today
const TODAY_DAY_OFFSET = (() => {
  const d = new Date().getDay();
  return d === 0 ? 6 : d - 1;
})();

// Days from today to the Monday that starts weekOffset
const getDaysUntilWeek = (weekOffset) => {
  const daysSinceMon = TODAY_DAY_OFFSET;
  return weekOffset * 7 - daysSinceMon;
};

// Original date string for slipped WOs
const getSlippedOriginalDate = (daysAgo) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return fmtShort(d);
};

const generateTimeline = (demandArr, endStockArr, weeklyWorkOrders, weeklyBatches, weeklyPurchaseOrders) =>
  demandArr.map((demand, i) => ({
    week: getWeekLabel(i),
    weekOffset: i,
    demand,
    endStock: endStockArr[i],
    workOrders: weeklyWorkOrders[i] || [],
    batches: weeklyBatches[i] || [],
    purchaseOrders: weeklyPurchaseOrders ? (weeklyPurchaseOrders[i] || []) : [],
  }));

// ── Steel Plate 2mm (MTL-001) ─────────────────────────────────────────────────
// Slipped WO added to W0: WO-2490 (150 pcs, slipped 5 days ago)
// demands:   [700, 600, 200, 300,   0, 100, 200,  50, 100, 200, 150,  50]
// endStocks: [800, 200,   0,-300,-300,-400,-600,-650,-750,-950,-1100,-1150]

const mtl001WorkOrders = [
  // W0 — sum 700 (includes slipped WO-2490)
  [
    {
      id: "WO-2490",
      orderId: "SO-3200",
      productName: "Bracket Frame X9",
      customerName: "PT Maju Jaya",
      estimatedStartDayOffset: TODAY_DAY_OFFSET,
      qty: 150,
      isSlipped: true,
      slippedDays: 5,
      originalEstimatedStartDate: getSlippedOriginalDate(5),
    },
    { id: "WO-2401", orderId: "SO-3202", productName: "Frame Assembly Alpha", customerName: "PT Maju Jaya", estimatedStartDayOffset: 1, qty: 200, isStarted: true },
    { id: "WO-2402", orderId: "SO-3203", productName: "Cabinet Unit B", customerName: "CV Sinar Abadi", estimatedStartDayOffset: 3, qty: 300 },
    { id: "WO-2400", orderId: "SO-3201", productName: "Prototype Frame X", customerName: "PT Demo Nusantara", estimatedStartDayOffset: 5, qty: 50 },
  ],
  // W1 — sum 600
  [
    { id: "WO-2403", orderId: "SO-3204", productName: "Panel Structure C", customerName: "PT Karya Utama", estimatedStartDayOffset: 0, qty: 350 },
    { id: "WO-2404", orderId: "SO-3205", productName: "Frame Assembly Beta", customerName: "PT Maju Jaya", estimatedStartDayOffset: 4, qty: 250 },
  ],
  // W2 — sum 200
  [{ id: "WO-2405", orderId: "SO-3206", productName: "Cabinet Unit D", customerName: "CV Bintang Mas", estimatedStartDayOffset: 2, qty: 200 }],
  // W3 — sum 300
  [{ id: "WO-2406", orderId: "SO-3201", productName: "Frame Assembly Gamma", customerName: "PT Karya Utama", estimatedStartDayOffset: 1, qty: 300 }],
  // W4 — demand 0
  [],
  // W5 — sum 100
  [{ id: "WO-2420", orderId: "SO-3207", productName: "Steel Frame Unit E", customerName: "PT Maju Jaya", estimatedStartDayOffset: 2, qty: 100 }],
  // W6 — sum 200
  [{ id: "WO-2421", orderId: "SO-3208", productName: "Frame Panel F", customerName: "CV Sinar Abadi", estimatedStartDayOffset: 1, qty: 200 }],
  // W7 — sum 50
  [{ id: "WO-2422", orderId: "SO-3209", productName: "Connector Block G", customerName: "PT Karya Utama", estimatedStartDayOffset: 4, qty: 50 }],
  // W8 — sum 100
  [{ id: "WO-2423", orderId: "SO-3210", productName: "Frame Assembly H", customerName: "PT Maju Jaya", estimatedStartDayOffset: 0, qty: 100 }],
  // W9 — sum 200
  [{ id: "WO-2424", orderId: "SO-3211", productName: "Cabinet Unit J", customerName: "CV Sinar Abadi", estimatedStartDayOffset: 3, qty: 200 }],
  // W10 — sum 150
  [{ id: "WO-2425", orderId: "SO-3212", productName: "Panel Structure K", customerName: "PT Karya Utama", estimatedStartDayOffset: 2, qty: 150 }],
  // W11 — sum 50
  [{ id: "WO-2426", orderId: "SO-3213", productName: "Frame Unit L", customerName: "PT Maju Jaya", estimatedStartDayOffset: 5, qty: 50 }],
];

const mtl001Batches = [
  // W0 — slipped WO-2490 has batch allocated (BATCH-2499); WO-2401/2402 also allocated
  [
    { batchId: "BATCH-2401", totalStock: 800, poId: "PO-2401", poQty: 300, poEstimatedArrivalDayOffset: 0,
      consumptions: [{ dayOffset: 1, qty: 200, woId: "WO-2401" }, { dayOffset: 3, qty: 150, woId: "WO-2402" }] },
    { batchId: "BATCH-2402", totalStock: 500, poId: "PO-2402", poQty: 200, poEstimatedArrivalDayOffset: 2,
      consumptions: [{ dayOffset: 3, qty: 150, woId: "WO-2402" }] },
    { batchId: "BATCH-2499", totalStock: 200,
      consumptions: [{ dayOffset: TODAY_DAY_OFFSET, qty: 150, woId: "WO-2490" }] },
  ],
  // W1 — initialStock = W0 endStock (800)
  [
    { batchId: "BATCH-2403", totalStock: 800, poId: "PO-2403", poQty: 400, poEstimatedArrivalDayOffset: 1,
      consumptions: [{ dayOffset: 0, qty: 350, woId: "WO-2403" }, { dayOffset: 4, qty: 250, woId: "WO-2404" }] },
  ],
  // W2 — initialStock = W1 endStock (200)
  [{ batchId: "BATCH-2404", totalStock: 200, consumptions: [{ dayOffset: 2, qty: 200, woId: "WO-2405" }] }],
  // W3 — initialStock = W2 endStock (0); all 300 pcs come from PO-2404
  [
    { batchId: "BATCH-2405", totalStock: 0, poId: "PO-2404", poQty: 300, poEstimatedArrivalDayOffset: 0,
      consumptions: [{ dayOffset: 1, qty: 300, woId: "WO-2406" }] },
  ],
  // W4 — pure recovery PO
  [{ batchId: "BATCH-2410", totalStock: null, poId: "PO-2407", poQty: 400, poEstimatedArrivalDayOffset: 2, consumptions: [] }],
  [],
  // W6 — pure recovery PO
  [{ batchId: "BATCH-2411", totalStock: null, poId: "PO-2408", poQty: 500, poEstimatedArrivalDayOffset: 0, consumptions: [] }],
  [],
  // W8 — pure recovery PO
  [{ batchId: "BATCH-2412", totalStock: null, poId: "PO-2409", poQty: 300, poEstimatedArrivalDayOffset: 3, consumptions: [] }],
  [], [], [],
];

const mtl001PurchaseOrders = [
  [{ poId: "PO-2401", estimatedArrivalDayOffset: 0, qty: 300 }, { poId: "PO-2402", estimatedArrivalDayOffset: 2, qty: 200 }],
  [{ poId: "PO-2403", estimatedArrivalDayOffset: 1, qty: 400 }],
  [],
  [{ poId: "PO-2404", estimatedArrivalDayOffset: 0, qty: 300 }],
  [{ poId: "PO-2407", estimatedArrivalDayOffset: 2, qty: 400 }],
  [],
  [{ poId: "PO-2408", estimatedArrivalDayOffset: 0, qty: 500 }],
  [],
  [{ poId: "PO-2409", estimatedArrivalDayOffset: 3, qty: 300 }],
  [], [], [],
];

const mtl001EndStocks = [800, -400, -600, -900, -900, -1000, -1200, -1250, -1350, -1550, -1700, -1750];

// ── Aluminum Tube 50mm (MTL-002) ──────────────────────────────────────────────
// Slipped WO added to W0: WO-2491 (80 pcs, slipped 8 days ago)
// demands:   [180, 150, 200,  50, 100,  50, 100, 200,   0,  50,  50, 100]
// endStocks: [620, 470, 270, 220, 120,  70, -30,-230,-230,-280,-330,-430]
// First negative week: W6 (was W7 before slip)

const mtl002WorkOrders = [
  // W0 — sum 180 (includes slipped WO-2491)
  [
    {
      id: "WO-2491",
      productName: "Tube Module Y7",
      customerName: "CV Logam Prima",
      estimatedStartDayOffset: TODAY_DAY_OFFSET,
      qty: 80,
      isSlipped: true,
      slippedDays: 8,
      originalEstimatedStartDate: getSlippedOriginalDate(8),
    },
    { id: "WO-2407", productName: "Pipe Joint Assembly", customerName: "PT Teknik Maju", estimatedStartDayOffset: 2, qty: 100, isStarted: true },
  ],
  [
    { id: "WO-2408", productName: "Frame Tube Unit", customerName: "CV Logam Prima", estimatedStartDayOffset: 0, qty: 80 },
    { id: "WO-2409", productName: "Support Bracket A", customerName: "PT Teknik Maju", estimatedStartDayOffset: 3, qty: 70 },
  ],
  [{ id: "WO-2410", productName: "Pipe Joint Assembly B", customerName: "CV Logam Prima", estimatedStartDayOffset: 1, qty: 200 }],
  [{ id: "WO-2430", productName: "Tube Joint D", customerName: "PT Teknik Maju", estimatedStartDayOffset: 1, qty: 50 }],
  [{ id: "WO-2431", productName: "Frame Pipe E", customerName: "CV Logam Prima", estimatedStartDayOffset: 3, qty: 100 }],
  [{ id: "WO-2432", productName: "Bracket Tube F", customerName: "PT Teknik Maju", estimatedStartDayOffset: 0, qty: 50 }],
  [{ id: "WO-2433", productName: "Pipe Support G", customerName: "CV Logam Prima", estimatedStartDayOffset: 4, qty: 100 }],
  [{ id: "WO-2434", productName: "Frame Assembly H", customerName: "PT Teknik Maju", estimatedStartDayOffset: 2, qty: 200 }],
  [],
  [{ id: "WO-2435", productName: "Tube Connect J", customerName: "CV Logam Prima", estimatedStartDayOffset: 1, qty: 50 }],
  [{ id: "WO-2436", productName: "Pipe Frame K", customerName: "PT Teknik Maju", estimatedStartDayOffset: 5, qty: 50 }],
  [{ id: "WO-2437", productName: "Joint Unit L", customerName: "CV Logam Prima", estimatedStartDayOffset: 3, qty: 100 }],
];

const mtl002Batches = [
  // W0 — slipped WO-2491 has no batch yet
  [{ batchId: "BATCH-2406", totalStock: 800, poId: "PO-2405", poQty: 120, poEstimatedArrivalDayOffset: 1,
     consumptions: [{ dayOffset: 2, qty: 100, woId: "WO-2407" }] }],
  // W1–W6 totalStock = previous week's endStock
  [{ batchId: "BATCH-2407", totalStock: 620, poId: "PO-2406", poQty: 180, poEstimatedArrivalDayOffset: 0,
     consumptions: [{ dayOffset: 0, qty: 80, woId: "WO-2408" }, { dayOffset: 3, qty: 70, woId: "WO-2409" }] }],
  [{ batchId: "BATCH-2408", totalStock: 470, consumptions: [{ dayOffset: 1, qty: 200, woId: "WO-2410" }] }],
  [{ batchId: "BATCH-2440", totalStock: 270, consumptions: [{ dayOffset: 1, qty: 50, woId: "WO-2430" }] }],
  [{ batchId: "BATCH-2441", totalStock: 220, consumptions: [{ dayOffset: 3, qty: 100, woId: "WO-2431" }] }],
  [{ batchId: "BATCH-2442", totalStock: 120, consumptions: [{ dayOffset: 0, qty: 50, woId: "WO-2432" }] }],
  // W6 — only 70 available; WO-2433 needs 100, 30 pcs unallocated (shortage)
  [{ batchId: "BATCH-2443", totalStock: 70, consumptions: [{ dayOffset: 4, qty: 70, woId: "WO-2433" }] }],
  // W7 — initialStock = W6 endStock (-30) → pure recovery PO needed
  [{ batchId: "BATCH-2445", totalStock: null, poId: "PO-2410", poQty: 300, poEstimatedArrivalDayOffset: 0, consumptions: [] }],
  [],
  [{ batchId: "BATCH-2446", totalStock: null, poId: "PO-2411", poQty: 200, poEstimatedArrivalDayOffset: 2, consumptions: [] }],
  [], [],
];

const mtl002PurchaseOrders = [
  [{ poId: "PO-2405", estimatedArrivalDayOffset: 1, qty: 120 }],
  [{ poId: "PO-2406", estimatedArrivalDayOffset: 0, qty: 180 }],
  [], [], [], [], [],
  [{ poId: "PO-2410", estimatedArrivalDayOffset: 0, qty: 300 }],
  [],
  [{ poId: "PO-2411", estimatedArrivalDayOffset: 2, qty: 200 }],
  [], [],
];

const mtl002EndStocks = [-180, -330, -530, -580, -680, -730, -760, -960, -960, -1010, -1060, -1160];

// ── Rubber Gasket Model X (MTL-003) ───────────────────────────────────────────
// Slipped WOs added to W0: WO-2492 (200 pcs, 3d ago) + WO-2493 (300 pcs, 11d ago)
// demands:   [1000, 500, 1000, 200, 300, 400, 200, 500, 100, 200,   0, 100]
// endStocks: [2000, 1500, 500, 300,   0,-400,-600,-1100,-1200,-1400,-1400,-1500]
// First negative week: W5 (was W6 before slips)

const mtl003WorkOrders = [
  // W0 — sum 1000 (includes slipped WO-2492 + WO-2493)
  [
    {
      id: "WO-2492",
      productName: "Gasket Set Z2",
      customerName: "PT Industri Nusantara",
      estimatedStartDayOffset: TODAY_DAY_OFFSET,
      qty: 200,
      isSlipped: true,
      slippedDays: 3,
      originalEstimatedStartDate: getSlippedOriginalDate(3),
    },
    {
      id: "WO-2493",
      productName: "Engine Seal Z3",
      customerName: "CV Delta Teknik",
      estimatedStartDayOffset: TODAY_DAY_OFFSET,
      qty: 300,
      isSlipped: true,
      slippedDays: 11,
      originalEstimatedStartDate: getSlippedOriginalDate(11),
    },
    { id: "WO-2411", productName: "Engine Seal Kit A", customerName: "PT Industri Nusantara", estimatedStartDayOffset: 0, qty: 250, isStarted: true },
    { id: "WO-2412", productName: "Valve Assembly Z", customerName: "CV Delta Teknik", estimatedStartDayOffset: 4, qty: 250 },
  ],
  [{ id: "WO-2413", productName: "Engine Seal Kit B", customerName: "PT Industri Nusantara", estimatedStartDayOffset: 2, qty: 500 }],
  [
    { id: "WO-2414", productName: "Gasket Frame Unit", customerName: "CV Delta Teknik", estimatedStartDayOffset: 1, qty: 600 },
    { id: "WO-2415", productName: "Valve Assembly W", customerName: "PT Karya Utama", estimatedStartDayOffset: 5, qty: 400 },
  ],
  [{ id: "WO-2450", productName: "Gasket Set D", customerName: "PT Industri Nusantara", estimatedStartDayOffset: 2, qty: 200 }],
  [
    { id: "WO-2451", productName: "Seal Kit E", customerName: "CV Delta Teknik", estimatedStartDayOffset: 0, qty: 150 },
    { id: "WO-2452", productName: "Engine Gasket F", customerName: "PT Karya Utama", estimatedStartDayOffset: 4, qty: 150 },
  ],
  [{ id: "WO-2453", productName: "Valve Frame G", customerName: "PT Industri Nusantara", estimatedStartDayOffset: 1, qty: 400 }],
  [{ id: "WO-2454", productName: "Gasket Unit H", customerName: "CV Delta Teknik", estimatedStartDayOffset: 3, qty: 200 }],
  [
    { id: "WO-2455", productName: "Seal Assembly J", customerName: "PT Industri Nusantara", estimatedStartDayOffset: 2, qty: 300 },
    { id: "WO-2456", productName: "Valve Set K", customerName: "PT Karya Utama", estimatedStartDayOffset: 5, qty: 200 },
  ],
  [{ id: "WO-2457", productName: "Gasket Connect L", customerName: "CV Delta Teknik", estimatedStartDayOffset: 0, qty: 100 }],
  [{ id: "WO-2458", productName: "Seal Frame M", customerName: "PT Industri Nusantara", estimatedStartDayOffset: 4, qty: 200 }],
  [],
  [{ id: "WO-2459", productName: "Valve Unit N", customerName: "CV Delta Teknik", estimatedStartDayOffset: 2, qty: 100 }],
];

const mtl003Batches = [
  // W0 — slipped WO-2492 + WO-2493 have no batches yet
  // W0 — slipped WO-2492 has batch allocated (BATCH-2409); WO-2493 has no batch
  [{ batchId: "BATCH-2409", totalStock: 3000, consumptions: [
    { dayOffset: TODAY_DAY_OFFSET, qty: 200, woId: "WO-2492" },
    { dayOffset: 0, qty: 250, woId: "WO-2411" },
    { dayOffset: 4, qty: 250, woId: "WO-2412" },
  ] }],
  // W1–W4 totalStock = previous week's endStock
  [{ batchId: "BATCH-2410", totalStock: 2000, poId: "PO-2408", poQty: 600, poEstimatedArrivalDayOffset: 1,
     consumptions: [{ dayOffset: 2, qty: 500, woId: "WO-2413" }] }],
  [{ batchId: "BATCH-2411", totalStock: 1500, consumptions: [{ dayOffset: 1, qty: 600, woId: "WO-2414" }, { dayOffset: 5, qty: 400, woId: "WO-2415" }] }],
  [{ batchId: "BATCH-2450", totalStock: 500, consumptions: [{ dayOffset: 2, qty: 200, woId: "WO-2450" }] }],
  // W4 — 300 available, exactly consumed by WO-2451 (150) + WO-2452 (150)
  [{ batchId: "BATCH-2451", totalStock: 300, consumptions: [{ dayOffset: 0, qty: 150, woId: "WO-2451" }, { dayOffset: 4, qty: 150, woId: "WO-2452" }] }],
  // W5 — initialStock = W4 endStock (0) → pure recovery PO needed; WO-2453 unallocated
  [{ batchId: "BATCH-2452", totalStock: null, poId: "PO-2414", poQty: 500, poEstimatedArrivalDayOffset: 0,
     consumptions: [{ dayOffset: 1, qty: 400, woId: "WO-2453" }] }],
  // W6 — initialStock = W5 endStock (-400) → pure recovery PO
  [{ batchId: "BATCH-2460", totalStock: null, poId: "PO-2412", poQty: 500, poEstimatedArrivalDayOffset: 1, consumptions: [] }],
  [{ batchId: "BATCH-2461", totalStock: null, poId: "PO-2413", poQty: 800, poEstimatedArrivalDayOffset: 0, consumptions: [] }],
  [], [], [], [],
];

const mtl003PurchaseOrders = [
  [],
  [{ poId: "PO-2408", estimatedArrivalDayOffset: 1, qty: 600 }],
  [], [], [],
  [{ poId: "PO-2414", estimatedArrivalDayOffset: 0, qty: 500 }],
  [{ poId: "PO-2412", estimatedArrivalDayOffset: 1, qty: 500 }],
  [{ poId: "PO-2413", estimatedArrivalDayOffset: 0, qty: 800 }],
  [], [], [], [],
];

const mtl003EndStocks = [2000, 1500, 500, 300, 0, -400, -600, -1100, -1200, -1400, -1400, -1500];

// ── Simple material generator for additional rows ──────────────────────────────

// Auto-generates one batch per week so Stock rows are expandable in the drawer
const generateSimpleBatches = (sku, demands, endStocks, wosByWeek) => {
  const skuNum = sku.replace('MTL-', '');
  return demands.map((demand, i) => {
    const initialStock = (endStocks[i] || 0) + demand;
    if (initialStock <= 0) return [];
    const wos = wosByWeek[i] || [];
    return [{
      batchId: `BATCH-${skuNum}W${i}`,
      totalStock: initialStock,
      consumptions: wos.map(wo => ({
        dayOffset: wo.estimatedStartDayOffset || 0,
        qty: wo.qty,
        woId: wo.id,
      })),
    }];
  });
};

const makeSimpleMaterial = (materialName, sku, onHandStock, incomingPoStock, unscheduled, demands, endStocks, wosByWeek) =>
  ({
    materialName, sku, onHandStock, incomingPoStock, unscheduled,
    timeline: generateTimeline(demands, endStocks, wosByWeek, generateSimpleBatches(sku, demands, endStocks, wosByWeek), null),
  });

// MTL-004: Copper Wire 2.5mm
const mtl004Wos = [
  [{ id: "WO-2500", productName: "Control Panel A", customerName: "PT Elektro Jaya", estimatedStartDayOffset: 1, qty: 120, orderId: "SO-4001" }],
  [{ id: "WO-2501", productName: "Wiring Harness B", customerName: "CV Cahaya Teknik", estimatedStartDayOffset: 3, qty: 80, orderId: "SO-4002" }],
  [{ id: "WO-2502", productName: "Panel Unit C", customerName: "PT Elektro Jaya", estimatedStartDayOffset: 2, qty: 150, orderId: "SO-4003" }],
  [{ id: "WO-2503", productName: "Control Panel D", customerName: "PT Maju Jaya", estimatedStartDayOffset: 0, qty: 60, orderId: "SO-4004" }],
  [], [],
  [{ id: "WO-2504", productName: "Harness E", customerName: "CV Cahaya Teknik", estimatedStartDayOffset: 4, qty: 90, orderId: "SO-4005" }],
  [], [], [], [], [],
];

// MTL-005: Stainless Bolt M8
const mtl005Wos = [
  [{ id: "WO-2510", productName: "Machine Frame A", customerName: "PT Karya Utama", estimatedStartDayOffset: 0, qty: 500, orderId: "SO-4010" }],
  [{ id: "WO-2511", productName: "Assembly Rack B", customerName: "CV Sinar Abadi", estimatedStartDayOffset: 2, qty: 300, orderId: "SO-4011" }],
  [], [],
  [{ id: "WO-2512", productName: "Support Frame C", customerName: "PT Karya Utama", estimatedStartDayOffset: 1, qty: 400, orderId: "SO-4012" }],
  [], [], [], [], [], [], [],
];

// MTL-006: PVC Pipe 32mm
const mtl006Wos = [
  [{ id: "WO-2520", productName: "Plumbing Kit A", customerName: "PT Bangun Raya", estimatedStartDayOffset: 1, qty: 200, orderId: "SO-4020" }],
  [], [],
  [{ id: "WO-2521", productName: "Pipeline Unit B", customerName: "CV Inti Karya", estimatedStartDayOffset: 3, qty: 150, orderId: "SO-4021" }],
  [{ id: "WO-2522", productName: "Plumbing Kit C", customerName: "PT Bangun Raya", estimatedStartDayOffset: 0, qty: 250, orderId: "SO-4022" }],
  [], [], [], [], [], [], [],
];

// MTL-007: Zinc Plate 1mm
const mtl007Wos = [
  [{ id: "WO-2530", productName: "Enclosure Box A", customerName: "PT Industri Nusantara", estimatedStartDayOffset: 2, qty: 80, orderId: "SO-4030" }],
  [{ id: "WO-2531", productName: "Shield Panel B", customerName: "CV Delta Teknik", estimatedStartDayOffset: 4, qty: 120, orderId: "SO-4031" }],
  [], [],
  [{ id: "WO-2532", productName: "Enclosure Box C", customerName: "PT Industri Nusantara", estimatedStartDayOffset: 2, qty: 100, orderId: "SO-4032" }],
  [], [], [], [], [], [], [],
];

// MTL-008: HDPE Sheet 10mm
const mtl008Wos = [
  [],
  [{ id: "WO-2540", productName: "Tank Liner A", customerName: "CV Polimer Jaya", estimatedStartDayOffset: 1, qty: 50, orderId: "SO-4040" }],
  [{ id: "WO-2541", productName: "Container Base B", customerName: "PT Plastik Prima", estimatedStartDayOffset: 3, qty: 70, orderId: "SO-4041" }],
  [], [],
  [{ id: "WO-2542", productName: "Tank Liner C", customerName: "CV Polimer Jaya", estimatedStartDayOffset: 0, qty: 60, orderId: "SO-4042" }],
  [], [], [], [], [], [],
];

// MTL-009: Silicone Sealant 300ml
const mtl009Wos = [
  [{ id: "WO-2550", productName: "Window Frame A", customerName: "PT Alumindo Glass", estimatedStartDayOffset: 0, qty: 40, orderId: "SO-4050" },
   { id: "WO-2551", productName: "Door Seal B", customerName: "CV Kaca Mas", estimatedStartDayOffset: 3, qty: 30, orderId: "SO-4051" }],
  [],
  [{ id: "WO-2552", productName: "Frame Assembly C", customerName: "PT Alumindo Glass", estimatedStartDayOffset: 2, qty: 50, orderId: "SO-4052" }],
  [], [], [], [], [], [], [], [], [],
];

// MTL-010: Carbon Steel Rod 20mm
const mtl010Wos = [
  [{ id: "WO-2560", productName: "Shaft Assembly A", customerName: "PT Mesin Utama", estimatedStartDayOffset: 1, qty: 300, orderId: "SO-4060" }],
  [{ id: "WO-2561", productName: "Axle Unit B", customerName: "CV Logam Prima", estimatedStartDayOffset: 0, qty: 200, orderId: "SO-4061" }],
  [{ id: "WO-2562", productName: "Rod Assembly C", customerName: "PT Mesin Utama", estimatedStartDayOffset: 4, qty: 250, orderId: "SO-4062" }],
  [], [],
  [{ id: "WO-2563", productName: "Shaft Unit D", customerName: "CV Logam Prima", estimatedStartDayOffset: 2, qty: 180, orderId: "SO-4063" }],
  [], [], [], [], [], [],
];

// MTL-011: Epoxy Resin 1kg
const mtl011Wos = [
  [],
  [{ id: "WO-2570", productName: "Composite Panel A", customerName: "PT Komposit Indo", estimatedStartDayOffset: 2, qty: 25, orderId: "SO-4070" }],
  [], [],
  [{ id: "WO-2571", productName: "Laminate Board B", customerName: "CV Resin Jaya", estimatedStartDayOffset: 1, qty: 30, orderId: "SO-4071" }],
  [], [], [], [], [], [], [],
];

// MTL-012: Galvanized Wire 1.6mm
const mtl012Wos = [
  [{ id: "WO-2580", productName: "Fence Panel A", customerName: "PT Pagar Nusantara", estimatedStartDayOffset: 0, qty: 600, orderId: "SO-4080" }],
  [], [],
  [{ id: "WO-2581", productName: "Gate Frame B", customerName: "CV Besi Mas", estimatedStartDayOffset: 3, qty: 400, orderId: "SO-4081" }],
  [], [],
  [{ id: "WO-2582", productName: "Fence Panel C", customerName: "PT Pagar Nusantara", estimatedStartDayOffset: 1, qty: 500, orderId: "SO-4082" }],
  [], [], [], [], [],
];

// MTL-013: Nylon 66 Pellet
const mtl013Wos = [
  [{ id: "WO-2590", productName: "Gear Housing A", customerName: "PT Plastik Teknik", estimatedStartDayOffset: 1, qty: 150, orderId: "SO-4090" }],
  [{ id: "WO-2591", productName: "Bearing Cage B", customerName: "CV Nylon Jaya", estimatedStartDayOffset: 4, qty: 100, orderId: "SO-4091" }],
  [], [], [],
  [{ id: "WO-2592", productName: "Gear Housing C", customerName: "PT Plastik Teknik", estimatedStartDayOffset: 2, qty: 120, orderId: "SO-4092" }],
  [], [], [], [], [], [],
];

// MTL-014: Titanium Screw M5
const mtl014Wos = [
  [{ id: "WO-2600", productName: "Aerospace Bracket A", customerName: "PT Dirgantara", estimatedStartDayOffset: 2, qty: 200, orderId: "SO-4100" }],
  [], [],
  [{ id: "WO-2601", productName: "Flight Frame B", customerName: "CV Aero Prima", estimatedStartDayOffset: 0, qty: 150, orderId: "SO-4101" }],
  [], [], [], [], [], [], [], [],
];

// MTL-015: Magnesium Alloy Bar
const mtl015Wos = [
  [],
  [{ id: "WO-2610", productName: "Die Cast Part A", customerName: "PT Cor Logam", estimatedStartDayOffset: 3, qty: 80, orderId: "SO-4110" }],
  [{ id: "WO-2611", productName: "Housing Shell B", customerName: "CV Magnesium Indo", estimatedStartDayOffset: 1, qty: 60, orderId: "SO-4111" }],
  [], [],
  [{ id: "WO-2612", productName: "Die Cast Part C", customerName: "PT Cor Logam", estimatedStartDayOffset: 4, qty: 90, orderId: "SO-4112" }],
  [], [], [], [], [], [],
];

// MTL-016: Polycarbonate Sheet 3mm
const mtl016Wos = [
  [{ id: "WO-2620", productName: "Display Cover A", customerName: "PT Display Nusantara", estimatedStartDayOffset: 0, qty: 100, orderId: "SO-4120" }],
  [], [],
  [{ id: "WO-2621", productName: "Panel Guard B", customerName: "CV Plastik Mas", estimatedStartDayOffset: 2, qty: 80, orderId: "SO-4121" }],
  [{ id: "WO-2622", productName: "Display Cover C", customerName: "PT Display Nusantara", estimatedStartDayOffset: 3, qty: 120, orderId: "SO-4122" }],
  [], [], [], [], [], [], [],
];

// Add orderId to existing work orders
const addOrderIds = (wosByWeek, orderIdMap) => wosByWeek.map(week =>
  week.map(wo => ({ ...wo, orderId: orderIdMap[wo.id] || "SO-3000" }))
);

const mtl001OrderIdMap = {
  "WO-2490": "SO-3200", "WO-2401": "SO-3201", "WO-2402": "SO-3202", "WO-2400": "SO-3203",
  "WO-2403": "SO-3204", "WO-2404": "SO-3205", "WO-2405": "SO-3206", "WO-2406": "SO-3201",
  "WO-2420": "SO-3207", "WO-2421": "SO-3208", "WO-2422": "SO-3209", "WO-2423": "SO-3210",
  "WO-2424": "SO-3211", "WO-2425": "SO-3212", "WO-2426": "SO-3213",
};
const mtl002OrderIdMap = {
  "WO-2491": "SO-3140", "WO-2407": "SO-3141", "WO-2408": "SO-3142", "WO-2409": "SO-3143",
  "WO-2410": "SO-3144", "WO-2430": "SO-3145", "WO-2431": "SO-3146", "WO-2432": "SO-3147",
  "WO-2433": "SO-3145", "WO-2434": "SO-3148", "WO-2435": "SO-3149", "WO-2436": "SO-3150", "WO-2437": "SO-3151",
};
const mtl003OrderIdMap = {
  "WO-2492": "SO-3080", "WO-2493": "SO-3081", "WO-2411": "SO-3082", "WO-2412": "SO-3083",
  "WO-2413": "SO-3084", "WO-2414": "SO-3085", "WO-2415": "SO-3086", "WO-2450": "SO-3087",
  "WO-2451": "SO-3088", "WO-2452": "SO-3089", "WO-2453": "SO-3089", "WO-2454": "SO-3090",
  "WO-2455": "SO-3091", "WO-2456": "SO-3092", "WO-2457": "SO-3093", "WO-2458": "SO-3094", "WO-2459": "SO-3095",
};

// ── Customer PIC mapping ───────────────────────────────────────────────────────
export const MOCK_CUSTOMER_PIC_MAP = {
  "PT Maju Jaya":         "Budi Santoso",
  "CV Sinar Abadi":       "Rina Wulandari",
  "PT Karya Utama":       "Hendra Kurniawan",
  "PT Demo Nusantara":    "Dewi Rahayu",
  "CV Bintang Mas":       "Agus Prasetyo",
  "PT Pagar Nusantara":   "Siti Aminah",
  "CV Besi Mas":          "Joko Widodo",
  "PT Plastik Teknik":    "Farida Hanum",
  "CV Nylon Jaya":        "Rudi Hermawan",
  "PT Dirgantara":        "Anwar Syahputra",
  "CV Aero Prima":        "Lestari Ningrum",
  "PT Cor Logam":         "Bambang Susilo",
  "CV Magnesium Indo":    "Yuli Astuti",
  "PT Display Nusantara": "Toni Saputra",
  "CV Plastik Mas":       "Nisa Rahmawati",
  "CV Logam Prima":       "Wahyu Nugroho",
  "PT Teknik Maju":       "Surya Pratama",
  "PT Industri Nusantara":"Endang Suryani",
  "CV Delta Teknik":      "Firman Hidayat",
  "PT Elektro Jaya":      "Indah Permatasari",
  "CV Cahaya Teknik":     "Doni Setiawan",
  "PT Bangun Raya":       "Maulana Akbar",
  "CV Inti Karya":        "Ratna Sari",
  "CV Polimer Jaya":      "Galih Pratama",
  "PT Plastik Prima":     "Wulan Anggraini",
  "PT Alumindo Glass":    "Fauzi Rahman",
  "CV Kaca Mas":          "Sri Mulyani",
  "PT Mesin Utama":       "Arif Budiman",
  "PT Komposit Indo":     "Dian Pertiwi",
  "CV Resin Jaya":        "Hendro Susanto",
};

// ── Product SKU mapping ────────────────────────────────────────────────────────
export const MOCK_PRODUCT_SKU_MAP = {
  // MTL-001 products
  "Bracket Frame X9":     "PRD-101",
  "Frame Assembly Alpha": "PRD-102",
  "Cabinet Unit B":       "PRD-103",
  "Prototype Frame X":    "PRD-104",
  "Panel Structure C":    "PRD-105",
  "Frame Assembly Beta":  "PRD-106",
  "Cabinet Unit D":       "PRD-107",
  "Frame Assembly Gamma": "PRD-108",
  "Steel Frame Unit E":   "PRD-109",
  "Frame Panel F":        "PRD-110",
  "Connector Block G":    "PRD-111",
  "Frame Assembly H":     "PRD-112",
  "Cabinet Unit J":       "PRD-113",
  "Panel Structure K":    "PRD-114",
  "Frame Unit L":         "PRD-115",
  // MTL-002 products
  "Tube Module Y7":        "PRD-121",
  "Pipe Joint Assembly":   "PRD-122",
  "Frame Tube Unit":       "PRD-123",
  "Support Bracket A":     "PRD-124",
  "Pipe Joint Assembly B": "PRD-125",
  "Tube Joint D":          "PRD-126",
  "Frame Pipe E":          "PRD-127",
  "Bracket Tube F":        "PRD-128",
  "Pipe Support G":        "PRD-129",
  "Tube Connect J":        "PRD-130",
  "Pipe Frame K":          "PRD-131",
  "Joint Unit L":          "PRD-132",
  // MTL-003 products
  "Gasket Set Z2":         "PRD-141",
  "Engine Seal Z3":        "PRD-142",
  "Engine Seal Kit A":     "PRD-143",
  "Valve Assembly Z":      "PRD-144",
  "Engine Seal Kit B":     "PRD-145",
  "Gasket Frame Unit":     "PRD-146",
  "Valve Assembly W":      "PRD-147",
  "Gasket Set D":          "PRD-148",
  "Seal Kit E":            "PRD-149",
  "Engine Gasket F":       "PRD-150",
  "Valve Frame G":         "PRD-151",
  "Gasket Unit H":         "PRD-152",
  "Seal Assembly J":       "PRD-153",
  "Valve Set K":           "PRD-154",
  "Gasket Connect L":      "PRD-155",
  "Seal Frame M":          "PRD-156",
  "Valve Unit N":          "PRD-157",
  // MTL-004 products
  "Control Panel A":       "PRD-161",
  "Wiring Harness B":      "PRD-162",
  "Panel Unit C":          "PRD-163",
  "Control Panel D":       "PRD-164",
  "Harness E":             "PRD-165",
  // MTL-005 products
  "Machine Frame A":       "PRD-171",
  "Assembly Rack B":       "PRD-172",
  "Support Frame C":       "PRD-173",
  // MTL-006 products
  "Plumbing Kit A":        "PRD-181",
  "Pipeline Unit B":       "PRD-182",
  "Plumbing Kit C":        "PRD-183",
  // MTL-007 products
  "Enclosure Box A":       "PRD-191",
  "Shield Panel B":        "PRD-192",
  "Enclosure Box C":       "PRD-193",
  // MTL-008 products
  "Tank Liner A":          "PRD-201",
  "Container Base B":      "PRD-202",
  "Tank Liner C":          "PRD-203",
  // MTL-009 products
  "Window Frame A":        "PRD-211",
  "Door Seal B":           "PRD-212",
  "Frame Assembly C":      "PRD-213",
  // MTL-010 products
  "Shaft Assembly A":      "PRD-221",
  "Axle Unit B":           "PRD-222",
  "Rod Assembly C":        "PRD-223",
  "Shaft Unit D":          "PRD-224",
  // MTL-011 products
  "Composite Panel A":     "PRD-231",
  "Laminate Board B":      "PRD-232",
  // MTL-012 products
  "Fence Panel A":         "PRD-241",
  "Gate Frame B":          "PRD-242",
  "Fence Panel C":         "PRD-243",
  // MTL-013 products
  "Gear Housing A":        "PRD-251",
  "Bearing Cage B":        "PRD-252",
  "Gear Housing C":        "PRD-253",
  // MTL-014 products
  "Aerospace Bracket A":   "PRD-261",
  "Flight Frame B":        "PRD-262",
  // MTL-015 products
  "Die Cast Part A":       "PRD-271",
  "Housing Shell B":       "PRD-272",
  "Die Cast Part C":       "PRD-273",
  // MTL-016 products
  "Display Cover A":       "PRD-281",
  "Panel Guard B":         "PRD-282",
  "Display Cover C":       "PRD-283",
};

// ── Exported mock data ─────────────────────────────────────────────────────────

export const MOCK_MATERIAL_FORECAST_DATA = [
  {
    materialName: "Steel Plate 2mm",
    sku: "MTL-001",
    onHandStock: 1500,
    incomingPoStock: 150,
    unscheduled: 500,
    timeline: generateTimeline(
      [700, 600, 200, 300, 0, 100, 200, 50, 100, 200, 150, 50],
      mtl001EndStocks,
      addOrderIds(mtl001WorkOrders, mtl001OrderIdMap), mtl001Batches, mtl001PurchaseOrders
    ),
  },
  {
    materialName: "Aluminum Tube 50mm",
    sku: "MTL-002",
    onHandStock: 800,
    incomingPoStock: 50,
    unscheduled: 110,
    timeline: generateTimeline(
      [180, 150, 200, 50, 100, 50, 100, 200, 0, 50, 50, 100],
      mtl002EndStocks,
      addOrderIds(mtl002WorkOrders, mtl002OrderIdMap), mtl002Batches, mtl002PurchaseOrders
    ),
  },
  {
    materialName: "Rubber Gasket Model X",
    sku: "MTL-003",
    onHandStock: 3000,
    incomingPoStock: 0,
    unscheduled: 0,
    timeline: generateTimeline(
      [1000, 500, 1000, 200, 300, 400, 200, 500, 100, 200, 0, 100],
      mtl003EndStocks,
      addOrderIds(mtl003WorkOrders, mtl003OrderIdMap), mtl003Batches, mtl003PurchaseOrders
    ),
  },
  makeSimpleMaterial("Copper Wire 2.5mm",       "MTL-004", 600,  30, 120, [120, 80, 150, 60, 0, 0, 90, 0, 0, 0, 0, 0], [480, 400, 250, 190, 190, 190, 100, 100, 100, 100, 100, 100], mtl004Wos),
  makeSimpleMaterial("Stainless Bolt M8",        "MTL-005", 2000, 0,  300, [500, 300, 0, 0, 400, 0, 0, 0, 0, 0, 0, 0], [1500, 1200, 1200, 1200, 800, 800, -200, -400, -400, -400, -400, -400], mtl005Wos),
  makeSimpleMaterial("PVC Pipe 32mm",            "MTL-006", 500,  20, 250,  [200, 0, 0, 150, 250, 0, 0, 0, 0, 0, 0, 0], [300, 300, 300, 150, -100, -100, -100, -100, -100, -100, -100, -100], mtl006Wos),
  makeSimpleMaterial("Zinc Plate 1mm",           "MTL-007", 400,  0,  0, [80, 120, 0, 0, 100, 0, 0, 0, 0, 0, 0, 0],  [320, 200, 200, 200, 100, 100, 100, 100, 100, 100, 100, 100], mtl007Wos),
  makeSimpleMaterial("HDPE Sheet 10mm",          "MTL-008", 300,  0,  70,  [0, 50, 70, 0, 0, 60, 0, 0, 0, 0, 0, 0],   [300, 250, 180, 180, 180, -20, -80, -140, -140, -140, -140, -140], mtl008Wos),
  makeSimpleMaterial("Silicone Sealant 300ml",   "MTL-009", 200,  10, 30,  [70, 0, 50, 0, 0, 0, 0, 0, 0, 0, 0, 0],    [130, 130, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80], mtl009Wos),
  makeSimpleMaterial("Carbon Steel Rod 20mm",    "MTL-010", 1200, 80, 180, [300, 200, 250, 0, 0, 180, 0, 0, 0, 0, 0, 0], [900, 700, 450, 450, 450, 270, 270, 270, 270, 270, 270, 270], mtl010Wos),
  makeSimpleMaterial("Epoxy Resin 1kg",          "MTL-011", 150,  0,  0,  [0, 25, 0, 0, 30, 0, 0, 0, 0, 0, 0, 0],    [150, 125, 125, 125, -5, -55, -55, -55, -55, -55, -55, -55], mtl011Wos),
  makeSimpleMaterial("Galvanized Wire 1.6mm",    "MTL-012", 2500, 0,  600,[600, 0, 0, 400, 0, 0, 500, 0, 0, 0, 0, 0], [1900, 1900, 1900, 1500, 1500, 1500, 1000, 1000, 1000, 1000, 1000, 1000], mtl012Wos),
  makeSimpleMaterial("Nylon 66 Pellet",          "MTL-013", 700,  50, 120,  [150, 100, 0, 0, 0, 120, 0, 0, 0, 0, 0, 0], [550, 450, 450, 450, 450, -70, -70, -70, -70, -70, -70, -70], mtl013Wos),
  makeSimpleMaterial("Titanium Screw M5",        "MTL-014", 1000, 0,  0,  [200, 0, 0, 150, 0, 0, 0, 0, 0, 0, 0, 0],  [800, 800, 800, 650, 650, 650, 650, 650, 650, 650, 650, 650], mtl014Wos),
  makeSimpleMaterial("Magnesium Alloy Bar",      "MTL-015", 400,  0,  90,  [0, 80, 60, 0, 0, 90, 0, 0, 0, 0, 0, 0],   [400, 320, 260, 260, 260, 170, 170, 170, 170, 170, 170, 170], mtl015Wos),
  makeSimpleMaterial("Polycarbonate Sheet 3mm",  "MTL-016", 550,  20, 120, [100, 0, 0, 80, 120, 0, 0, 0, 0, 0, 0, 0], [450, 450, -50, -130, -250, -250, -250, -250, -250, -250, -250, -250], mtl016Wos),
];

// ── Vendor lead times (per vendor + material pair) ─────────────────────────────
// Used to compute procurement urgency status per material.
// Fastest vendor lead time drives overdue/urgent; average drives this_week.

export const MOCK_VENDOR_LEAD_TIMES = [
  { sku: "MTL-001", vendor: "PT Baja Nusantara",    leadTimeDays: 21 },
  { sku: "MTL-001", vendor: "CV Logam Prima",        leadTimeDays: 28 },
  { sku: "MTL-001", vendor: "PT Karya Logam",        leadTimeDays: 35 },
  // MTL-002 urgent: fastest=40 → buffer=42-40=2 ≤ 3
  { sku: "MTL-002", vendor: "CV Alumindo",            leadTimeDays: 40 },
  { sku: "MTL-002", vendor: "PT Teknik Maju",         leadTimeDays: 43 },
  { sku: "MTL-003", vendor: "CV Karet Jaya",          leadTimeDays: 25 },
  { sku: "MTL-003", vendor: "PT Seal Industri",       leadTimeDays: 31 },
  { sku: "MTL-004", vendor: "CV Kawat Prima",         leadTimeDays: 14 },
  // MTL-005 urgent: neg at week 6 (42d), fastest=40 → buffer=2
  { sku: "MTL-005", vendor: "PT Baut Nusantara",      leadTimeDays: 40 },
  { sku: "MTL-005", vendor: "CV Baut Prima",          leadTimeDays: 43 },
  // MTL-006 overdue: neg at week 4 (28d), fastest=30 ≥ 28
  { sku: "MTL-006", vendor: "CV Pipa Jaya",           leadTimeDays: 30 },
  { sku: "MTL-006", vendor: "PT Pipa Nusantara",      leadTimeDays: 35 },
  { sku: "MTL-007", vendor: "PT Seng Utama",          leadTimeDays: 22 },
  // MTL-008 urgent: neg at week 5 (35d), fastest=33 → buffer=2
  { sku: "MTL-008", vendor: "CV HDPE Indo",           leadTimeDays: 33 },
  { sku: "MTL-008", vendor: "PT Polimer Jaya",        leadTimeDays: 36 },
  { sku: "MTL-009", vendor: "PT Sealant Prima",       leadTimeDays: 7  },
  { sku: "MTL-010", vendor: "CV Baja Karya",          leadTimeDays: 25 },
  // MTL-011 this_week: neg at week 4 (28d), fastest=22, avg=22 → 28-22=6 ≤ 7
  { sku: "MTL-011", vendor: "PT Resin Jaya",          leadTimeDays: 22 },
  { sku: "MTL-012", vendor: "CV Kawat Galvanis",      leadTimeDays: 20 },
  // MTL-013 this_week: neg at week 5 (35d), fastest=28, avg=28 → 35-28=7 ≤ 7
  { sku: "MTL-013", vendor: "PT Plastik Teknik",      leadTimeDays: 28 },
  { sku: "MTL-014", vendor: "CV Titanium Indo",       leadTimeDays: 45 },
  { sku: "MTL-015", vendor: "PT Magnesium Prima",     leadTimeDays: 35 },
  // MTL-016 overdue: neg at week 2 (14d), fastest=16 ≥ 14
  { sku: "MTL-016", vendor: "CV Polikarbonat Jaya",   leadTimeDays: 16 },
  { sku: "MTL-016", vendor: "PT Polycarbonate Prima", leadTimeDays: 21 },
];

// ── Procurement status computation ────────────────────────────────────────────
// status rules (using "order now" scenario):
//   overdue    — fastest lead time ≥ days until first negative stock week
//   urgent     — daysUntilDemand - fastestLeadTime ≤ 3 (AND not overdue)
//   this_week  — daysUntilDemand - avgLeadTime ≤ 7   (rolling 7-day window)
//   ok         — none of the above

const addDays = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return fmtShort(d);
};

const computeProcurementStatus = (sku, endStocks, workOrdersByWeek, leadTimes) => {
  const firstNegIdx = endStocks.findIndex(s => s < 0);
  if (firstNegIdx < 0) return { sku, status: "ok", firstNegativeWeekOffset: -1, affectedWoIds: [] };

  const daysUntilDemand = getDaysUntilWeek(firstNegIdx);
  const vendorsForSku = leadTimes.filter(lt => lt.sku === sku);
  const fastest = vendorsForSku.reduce((a, b) => a.leadTimeDays <= b.leadTimeDays ? a : b);
  const avgLeadTimeDays = Math.round(
    vendorsForSku.reduce((s, v) => s + v.leadTimeDays, 0) / vendorsForSku.length
  );

  let status;
  if (fastest.leadTimeDays >= daysUntilDemand)             status = "overdue";
  else if (daysUntilDemand - fastest.leadTimeDays <= 3)    status = "urgent";
  else if (daysUntilDemand - avgLeadTimeDays <= 7)         status = "this_week";
  else                                                       status = "ok";

  const delayDays = status === "overdue" ? fastest.leadTimeDays - daysUntilDemand : 0;
  const affectedWos = workOrdersByWeek[firstNegIdx] || [];
  const affectedWoIds = affectedWos.filter(wo => !wo.isSlipped).map(wo => wo.id);

  // Latest date to create the PO to still meet demand on time
  const orderByDays = daysUntilDemand - fastest.leadTimeDays;
  const orderByDate = orderByDays >= 0 ? addDays(orderByDays) : null;
  // For this_week: use avg lead time to compute the window
  const orderByDaysAvg = daysUntilDemand - avgLeadTimeDays;
  const orderByDateAvg = orderByDaysAvg >= 0 ? addDays(orderByDaysAvg) : null;
  // Estimated arrival if ordered today
  const estArrivalDate = addDays(fastest.leadTimeDays);
  // Use the earliest actual WO start day within the first negative week, not just Monday
  const nonSlippedWos = affectedWos.filter(wo => !wo.isSlipped);
  const earliestWoDayOffset = nonSlippedWos.length > 0
    ? Math.min(...nonSlippedWos.map(wo => wo.estimatedStartDayOffset))
    : 0;
  const demandDate = addDays(daysUntilDemand + earliestWoDayOffset);

  return {
    sku,
    status,
    fastestVendor: fastest.vendor,
    fastestLeadTimeDays: fastest.leadTimeDays,
    avgLeadTimeDays,
    daysUntilDemand,
    firstNegativeWeekOffset: firstNegIdx,
    delayDays,
    affectedWoIds,
    orderByDate,       // latest order date using fastest vendor (for urgent)
    orderByDateAvg,    // latest order date using avg lead time (for this_week)
    estArrivalDate,    // if ordered today, arrives on this date
    demandDate,        // date the first negative stock week starts
    bufferDays: orderByDays,  // days of buffer remaining (negative = overdue)
  };
};

const simpleEndStocks = {
  "MTL-004": [480, 400, 250, 190, 190, 190, 100, 100, 100, 100, 100, 100],
  // MTL-005 urgent: neg starts week 6
  "MTL-005": [1500, 1200, 1200, 1200, 800, 800, -200, -400, -400, -400, -400, -400],
  "MTL-006": [300, 300, 300, 150, -100, -100, -100, -100, -100, -100, -100, -100],
  "MTL-007": [320, 200, 200, 200, 100, 100, 100, 100, 100, 100, 100, 100],
  // MTL-008 urgent: neg starts week 5
  "MTL-008": [300, 250, 180, 180, 180, -20, -80, -140, -140, -140, -140, -140],
  "MTL-009": [130, 130, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80],
  "MTL-010": [900, 700, 450, 450, 450, 270, 270, 270, 270, 270, 270, 270],
  // MTL-011 this_week: neg starts week 4
  "MTL-011": [150, 125, 125, 125, -5, -55, -55, -55, -55, -55, -55, -55],
  "MTL-012": [1900, 1900, 1900, 1500, 1500, 1500, 1000, 1000, 1000, 1000, 1000, 1000],
  // MTL-013 this_week: neg starts week 5
  "MTL-013": [550, 450, 450, 450, 450, -70, -70, -70, -70, -70, -70, -70],
  "MTL-014": [800, 800, 800, 650, 650, 650, 650, 650, 650, 650, 650, 650],
  "MTL-015": [400, 320, 260, 260, 260, 170, 170, 170, 170, 170, 170, 170],
  // MTL-016 overdue: neg starts week 2
  "MTL-016": [450, 450, -50, -130, -250, -250, -250, -250, -250, -250, -250, -250],
};
const simpleWos = {
  "MTL-004": mtl004Wos, "MTL-005": mtl005Wos, "MTL-006": mtl006Wos, "MTL-007": mtl007Wos,
  "MTL-008": mtl008Wos, "MTL-009": mtl009Wos, "MTL-010": mtl010Wos, "MTL-011": mtl011Wos,
  "MTL-012": mtl012Wos, "MTL-013": mtl013Wos, "MTL-014": mtl014Wos, "MTL-015": mtl015Wos,
  "MTL-016": mtl016Wos,
};

export const MOCK_PROCUREMENT_STATUS = {
  "MTL-001": computeProcurementStatus("MTL-001", mtl001EndStocks, mtl001WorkOrders, MOCK_VENDOR_LEAD_TIMES),
  "MTL-002": computeProcurementStatus("MTL-002", mtl002EndStocks, mtl002WorkOrders, MOCK_VENDOR_LEAD_TIMES),
  "MTL-003": computeProcurementStatus("MTL-003", mtl003EndStocks, mtl003WorkOrders, MOCK_VENDOR_LEAD_TIMES),
  ...Object.fromEntries(
    Object.keys(simpleEndStocks).map(sku => [
      sku, computeProcurementStatus(sku, simpleEndStocks[sku], simpleWos[sku], MOCK_VENDOR_LEAD_TIMES)
    ])
  ),
};

// MOCK_FORECAST_COUNTERS is computed after MOCK_DEMAND_URGENCY_ROWS (defined below)

// ── Incoming PO helpers ────────────────────────────────────────────────────────

const getDateFromOffset = (dayOffset) => {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  return d;
};

const fmtDate = (d) => {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[d.getMonth()]} ${String(d.getDate()).padStart(2,'0')}, ${d.getFullYear()}`;
};

const fmtDateTime = (d) => {
  const h = String(d.getHours()).padStart(2,'0');
  const m = String(d.getMinutes()).padStart(2,'0');
  return `${fmtDate(d)}, ${h}:${m}`;
};

// urgency: "late" | "urgent" | "this_week" | "next_week" | "later"
export const MOCK_INCOMING_PO = [
  {
    id: "PO-2401", material: "Steel Plate 2mm", sku: "MTL-001", vendor: "PT Baja Nusantara",
    estArrival: fmtDate(getDateFromOffset(-3)), received: 200, requested: 300, urgency: "late",
    receipts: [
      { dateTime: fmtDateTime(getDateFromOffset(-5)), receiptId: "RCP-0021", qty: 120 },
      { dateTime: fmtDateTime(getDateFromOffset(-3)), receiptId: "RCP-0022", qty: 80 },
    ],
  },
  {
    id: "PO-2402", material: "Steel Plate 2mm", sku: "MTL-001", vendor: "CV Logam Prima",
    estArrival: fmtDate(getDateFromOffset(-1)), received: 0, requested: 200, urgency: "late",
    receipts: [],
  },
  {
    id: "PO-2403", material: "Steel Plate 2mm", sku: "MTL-001", vendor: "PT Baja Nusantara",
    estArrival: fmtDate(getDateFromOffset(2)), received: 0, requested: 400, urgency: "urgent",
    receipts: [],
  },
  {
    id: "PO-2404", material: "Steel Plate 2mm", sku: "MTL-001", vendor: "PT Karya Logam",
    estArrival: fmtDate(getDateFromOffset(4)), received: 150, requested: 300, urgency: "this_week",
    receipts: [{ dateTime: fmtDateTime(getDateFromOffset(1)), receiptId: "RCP-0030", qty: 150 }],
  },
  {
    id: "PO-2405", material: "Aluminum Tube 50mm", sku: "MTL-002", vendor: "CV Alumindo",
    estArrival: fmtDate(getDateFromOffset(3)), received: 0, requested: 120, urgency: "this_week",
    receipts: [],
  },
  {
    id: "PO-2406", material: "Aluminum Tube 50mm", sku: "MTL-002", vendor: "PT Teknik Maju",
    estArrival: fmtDate(getDateFromOffset(5)), received: 60, requested: 180, urgency: "this_week",
    receipts: [{ dateTime: fmtDateTime(getDateFromOffset(2)), receiptId: "RCP-0031", qty: 60 }],
  },
  {
    id: "PO-2407", material: "Steel Plate 2mm", sku: "MTL-001", vendor: "PT Baja Nusantara",
    estArrival: fmtDate(getDateFromOffset(9)), received: 0, requested: 400, urgency: "next_week",
    receipts: [],
  },
  {
    id: "PO-2408", material: "Rubber Gasket Model X", sku: "MTL-003", vendor: "CV Karet Jaya",
    estArrival: fmtDate(getDateFromOffset(10)), received: 0, requested: 600, urgency: "next_week",
    receipts: [],
  },
  {
    id: "PO-2409", material: "Steel Plate 2mm", sku: "MTL-001", vendor: "CV Logam Prima",
    estArrival: fmtDate(getDateFromOffset(17)), received: 0, requested: 300, urgency: "later",
    receipts: [],
  },
  {
    id: "PO-2410", material: "Aluminum Tube 50mm", sku: "MTL-002", vendor: "PT Teknik Maju",
    estArrival: fmtDate(getDateFromOffset(18)), received: 0, requested: 300, urgency: "later",
    receipts: [],
  },
  {
    id: "PO-2411", material: "Aluminum Tube 50mm", sku: "MTL-002", vendor: "CV Alumindo",
    estArrival: fmtDate(getDateFromOffset(20)), received: 0, requested: 200, urgency: "later",
    receipts: [],
  },
  {
    id: "PO-2412", material: "Rubber Gasket Model X", sku: "MTL-003", vendor: "CV Karet Jaya",
    estArrival: fmtDate(getDateFromOffset(22)), received: 0, requested: 500, urgency: "later",
    receipts: [],
  },
];

export const MOCK_INCOMING_PO_COUNTERS = {
  late:     MOCK_INCOMING_PO.filter(p => p.urgency === "late").length,
  urgent:   MOCK_INCOMING_PO.filter(p => p.urgency === "urgent").length,
  thisWeek: MOCK_INCOMING_PO.filter(p => p.urgency === "this_week").length,
  nextWeek: MOCK_INCOMING_PO.filter(p => p.urgency === "next_week").length,
  later:    MOCK_INCOMING_PO.filter(p => p.urgency === "later").length,
};

const getWoStartDate = (weekOffset, dayOffset) => {
  const m = getMondayOfCurrentWeek();
  m.setDate(m.getDate() + weekOffset * 7 + dayOffset);
  return fmtShort(m);
};

// ── Unscheduled Work Orders ────────────────────────────────────────────────────
export const MOCK_UNSCHEDULED_WOS = {
  "MTL-001": [
    { woId: "WO-2498", orderId: "SO-3220", productName: "Bracket Frame X9",    customer: "PT Maju Jaya",      qty: 200 },
    { woId: "WO-2499", orderId: "SO-3221", productName: "Panel Structure C",   customer: "PT Karya Utama",    qty: 150 },
    { woId: "WO-2497", orderId: "SO-3222", productName: "Frame Assembly Alpha", customer: "CV Sinar Abadi",   qty: 100 },
    { woId: "WO-2496", orderId: "SO-3223", productName: "Cabinet Unit B",       customer: "PT Demo Nusantara",qty: 50  },
  ],
  "MTL-002": [
    { woId: "WO-2495", orderId: "SO-3140", productName: "Tube Module Y7",       customer: "CV Logam Prima",   qty: 50  },
    { woId: "WO-2494", orderId: "SO-3141", productName: "Frame Tube Unit",      customer: "PT Teknik Maju",   qty: 60  },
  ],
  "MTL-003": [],
  "MTL-004": [
    { woId: "WO-2505", orderId: "SO-4005", productName: "Harness E",            customer: "CV Cahaya Teknik", qty: 90  },
    { woId: "WO-2506", orderId: "SO-4006", productName: "Panel Unit C",         customer: "PT Elektro Jaya",  qty: 30  },
  ],
  "MTL-005": [
    { woId: "WO-2513", orderId: "SO-4013", productName: "Assembly Rack B",      customer: "CV Sinar Abadi",   qty: 300 },
  ],
  "MTL-006": [
    { woId: "WO-2523", orderId: "SO-4023", productName: "Plumbing Kit C",       customer: "PT Bangun Raya",   qty: 250 },
  ],
  "MTL-007": [],
  "MTL-008": [
    { woId: "WO-2543", orderId: "SO-4043", productName: "Container Base B",     customer: "PT Plastik Prima", qty: 70  },
  ],
  "MTL-009": [
    { woId: "WO-2553", orderId: "SO-4053", productName: "Door Seal B",          customer: "CV Kaca Mas",      qty: 30  },
  ],
  "MTL-010": [
    { woId: "WO-2564", orderId: "SO-4064", productName: "Rod Assembly C",       customer: "PT Mesin Utama",   qty: 180 },
  ],
  "MTL-011": [],
  "MTL-012": [
    { woId: "WO-2583", orderId: "SO-4083", productName: "Fence Panel A",        customer: "PT Pagar Nusantara", qty: 600 },
  ],
  "MTL-013": [
    { woId: "WO-2593", orderId: "SO-4093", productName: "Gear Housing C",       customer: "PT Plastik Teknik", qty: 120 },
  ],
  "MTL-014": [],
  "MTL-015": [
    { woId: "WO-2613", orderId: "SO-4113", productName: "Die Cast Part C",      customer: "PT Cor Logam",     qty: 90  },
  ],
  "MTL-016": [
    { woId: "WO-2623", orderId: "SO-4123", productName: "Display Cover C",      customer: "PT Display Nusantara", qty: 120 },
  ],
};

export const MOCK_DEMAND_URGENCY_ROWS = [
  // Future WOs with uncovered demand (needToBuy > 0)
  { id: "DUR-001", materialName: "Steel Plate 2mm",         sku: "MTL-001", productName: "Frame Assembly Gamma",  woId: "WO-2406", orderId: "SO-3201", customer: "PT Karya Utama",        woStartDate: getWoStartDate(3, 1), demandQty: 300, fromStock: 0,   needToBuy: 300 },
  { id: "DUR-004", materialName: "Steel Plate 2mm",         sku: "MTL-001", productName: "Frame Assembly H",      woId: "WO-2423", orderId: "SO-3210", customer: "PT Maju Jaya",          woStartDate: getWoStartDate(8, 0), demandQty: 100, fromStock: 0,   needToBuy: 100 },
  { id: "DUR-005", materialName: "PVC Pipe 32mm",           sku: "MTL-006", productName: "Plumbing Kit C",        woId: "WO-2522", orderId: "SO-4022", customer: "PT Bangun Raya",        woStartDate: getWoStartDate(4, 0), demandQty: 250, fromStock: 0,   needToBuy: 250 },
  { id: "DUR-010", materialName: "Polycarbonate Sheet 3mm", sku: "MTL-016", productName: "Display Cover A",       woId: "WO-2620", orderId: "SO-4120", customer: "PT Display Nusantara",  woStartDate: getWoStartDate(2, 0), demandQty: 100, fromStock: 0,   needToBuy: 100 },
  { id: "DUR-002", materialName: "Aluminum Tube 50mm",      sku: "MTL-002", productName: "Pipe Support G",        woId: "WO-2433", orderId: "SO-3145", customer: "CV Logam Prima",        woStartDate: getWoStartDate(6, 4), demandQty: 100, fromStock: 70,  needToBuy: 30  },
  { id: "DUR-006", materialName: "Aluminum Tube 50mm",      sku: "MTL-002", productName: "Frame Assembly H",      woId: "WO-2434", orderId: "SO-3147", customer: "PT Teknik Maju",        woStartDate: getWoStartDate(7, 2), demandQty: 200, fromStock: 0,   needToBuy: 200 },
  { id: "DUR-007", materialName: "Stainless Bolt M8",       sku: "MTL-005", productName: "Support Frame C",       woId: "WO-2512", orderId: "SO-4012", customer: "PT Karya Utama",        woStartDate: getWoStartDate(6, 1), demandQty: 400, fromStock: 0,   needToBuy: 400 },
  { id: "DUR-011", materialName: "HDPE Sheet 10mm",         sku: "MTL-008", productName: "Tank Liner C",          woId: "WO-2542", orderId: "SO-4042", customer: "CV Polimer Jaya",       woStartDate: getWoStartDate(5, 0), demandQty: 60,  fromStock: 0,   needToBuy: 60  },
  { id: "DUR-003", materialName: "Rubber Gasket Model X",   sku: "MTL-003", productName: "Valve Frame G",         woId: "WO-2453", orderId: "SO-3089", customer: "PT Industri Nusantara", woStartDate: getWoStartDate(5, 1), demandQty: 400, fromStock: 0,   needToBuy: 400 },
  { id: "DUR-008", materialName: "Rubber Gasket Model X",   sku: "MTL-003", productName: "Seal Assembly J",       woId: "WO-2455", orderId: "SO-3088", customer: "PT Industri Nusantara", woStartDate: getWoStartDate(7, 2), demandQty: 300, fromStock: 0,   needToBuy: 300 },
  { id: "DUR-009", materialName: "Epoxy Resin 1kg",         sku: "MTL-011", productName: "Composite Panel A",     woId: "WO-2570", orderId: "SO-4070", customer: "PT Komposit Indo",      woStartDate: getWoStartDate(4, 2), demandQty: 25,  fromStock: 0,   needToBuy: 25  },
  { id: "DUR-012", materialName: "Nylon 66 Pellet",         sku: "MTL-013", productName: "Gear Housing C",        woId: "WO-2592", orderId: "SO-4092", customer: "PT Plastik Teknik",     woStartDate: getWoStartDate(5, 2), demandQty: 120, fromStock: 0,   needToBuy: 120 },
  // Near-term rows (within a few days from now) — will appear as urgent when setting <= N days
  { id: "DUR-017", materialName: "Copper Wire 2.5mm",       sku: "MTL-004", productName: "Control Panel A",       woId: "WO-2500", orderId: "SO-4001", customer: "PT Elektro Jaya",       woStartDate: addDays(1),           demandQty: 120, fromStock: 0,   needToBuy: 120 },
  { id: "DUR-018", materialName: "Zinc Plate 1mm",          sku: "MTL-007", productName: "Enclosure Box A",       woId: "WO-2530", orderId: "SO-4030", customer: "PT Industri Nusantara", woStartDate: addDays(2),           demandQty: 80,  fromStock: 20,  needToBuy: 60  },
  { id: "DUR-019", materialName: "Carbon Steel Rod 20mm",   sku: "MTL-010", productName: "Shaft Assembly A",      woId: "WO-2560", orderId: "SO-4060", customer: "PT Mesin Utama",        woStartDate: addDays(4),           demandQty: 300, fromStock: 120, needToBuy: 180 },
  // Delayed WOs (past start date, not started — carried over slipped work orders)
  { id: "DUR-013", isDelayed: true, materialName: "Steel Plate 2mm",         sku: "MTL-001", productName: "Bracket Frame X9",    woId: "WO-2490", orderId: "SO-3200", customer: "PT Maju Jaya",          woStartDate: getSlippedOriginalDate(5),  demandQty: 150, fromStock: 150, needToBuy: 0   },
  { id: "DUR-014", isDelayed: true, materialName: "Aluminum Tube 50mm",      sku: "MTL-002", productName: "Tube Module Y7",      woId: "WO-2491", orderId: "SO-3140", customer: "CV Logam Prima",        woStartDate: getSlippedOriginalDate(8),  demandQty: 80,  fromStock: 70,  needToBuy: 10  },
  { id: "DUR-015", isDelayed: true, materialName: "Rubber Gasket Model X",   sku: "MTL-003", productName: "Gasket Set Z2",       woId: "WO-2492", orderId: "SO-3080", customer: "PT Industri Nusantara", woStartDate: getSlippedOriginalDate(3),  demandQty: 200, fromStock: 200, needToBuy: 0   },
  { id: "DUR-016", isDelayed: true, materialName: "Rubber Gasket Model X",   sku: "MTL-003", productName: "Engine Seal Z3",      woId: "WO-2493", orderId: "SO-3081", customer: "CV Delta Teknik",       woStartDate: getSlippedOriginalDate(11), demandQty: 300, fromStock: 0,   needToBuy: 300 },
];

// ── Flat list of all unscheduled WOs across all materials ─────────────────────
export const MOCK_UNSCHEDULED_WO_ROWS = (() => {
  const materialNameMap = {};
  MOCK_MATERIAL_FORECAST_DATA.forEach(m => { materialNameMap[m.sku] = m.materialName; });
  return Object.entries(MOCK_UNSCHEDULED_WOS).flatMap(([sku, wos]) =>
    wos.map(wo => ({ ...wo, sku, materialName: materialNameMap[sku] || sku }))
  );
})();

// ── Dynamic counter computation (depends on urgencyDaysInAdvance setting) ─────
export const computeForecastCounters = (urgencyDaysInAdvance = 5) => {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const parseDate = (str) => {
    if (!str) return null;
    const d = new Date(`${str} ${today.getFullYear()}`);
    return isNaN(d.getTime()) ? null : d;
  };
  const urgentToBuy = MOCK_DEMAND_URGENCY_ROWS.filter(r => {
    if (r.needToBuy <= 0 || r.isDelayed) return false;
    const d = parseDate(r.woStartDate);
    if (!d) return false;
    d.setHours(0, 0, 0, 0);
    return (d - today) / 86400000 <= urgencyDaysInAdvance;
  }).length;
  const delayedWo = MOCK_DEMAND_URGENCY_ROWS.filter(r => {
    if (!r.isDelayed) return false;
    return true;
  }).length;
  const unscheduledWo = MOCK_UNSCHEDULED_WO_ROWS.length;
  const materialsToBuy = new Set(
    MOCK_DEMAND_URGENCY_ROWS.filter(r => r.needToBuy > 0).map(r => r.sku)
  ).size;
  return { urgentToBuy, delayedWo, unscheduledWo, materialsToBuy };
};

export const MOCK_FORECAST_COUNTERS = computeForecastCounters(5);
