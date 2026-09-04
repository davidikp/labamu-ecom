import { MOCK_MATERIALS_DATA } from "../../materials/mock/materialsMocks.js";

// BOM records created/edited at runtime are persisted to localStorage so they
// survive a full page reload, mirroring modules/material-request/mock/materialRequestMocks.js.
const RUNTIME_STORAGE_KEY = "bom_runtime_records";

const loadRuntimeBoms = () => {
  try {
    const raw = typeof localStorage !== "undefined" ? localStorage.getItem(RUNTIME_STORAGE_KEY) : null;
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveRuntimeBoms = (list) => {
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(RUNTIME_STORAGE_KEY, JSON.stringify(list));
    }
  } catch {
    /* ignore persistence failures (private mode, quota, etc.) */
  }
};

const material = (materialId, quantity) => {
  const found = MOCK_MATERIALS_DATA.find((m) => m.id === materialId);
  return {
    materialId,
    name: found?.name || "Unknown Material",
    sku: found?.sku || "-",
    category: found?.category || "-",
    abcClassification: found?.abcClassification || "-",
    type: found?.type || "-",
    unit: found?.unit || "-",
    quantity,
  };
};

let nextLineId = 1;
const line = (label, amount) => ({ id: `line-${nextLineId++}`, label, amount });

const singleField = (amount) => ({ mode: "single", amount, lines: [] });
const breakdownField = (lines) => ({ mode: "breakdown", amount: 0, lines });

export const DEFAULT_COGS = () => ({
  labour: breakdownField([line("Labour cost", 0)]),
  packing: breakdownField([line("Packing cost", 0)]),
  shipping: breakdownField([line("Shipping cost", 0)]),
  overhead: breakdownField([line("Overhead cost", 0)]),
  other: breakdownField([line("Other cost", 0)]),
});

// Accepts either the current per-field cogs shape or the legacy Phase 1 flat
// { labourCost, packingCost, otherCost } shape, and always returns the current shape.
const normalizeCogs = (cogs) => {
  const base = DEFAULT_COGS();
  if (!cogs) return base;
  if (cogs.labour || cogs.packing || cogs.shipping || cogs.overhead || cogs.other) {
    return { ...base, ...cogs };
  }
  return {
    ...base,
    labour: singleField(cogs.labourCost || 0),
    packing: singleField(cogs.packingCost || 0),
    other: cogs.otherCost ? breakdownField([line("Other cost", cogs.otherCost)]) : base.other,
  };
};

const INITIAL_BOMS = [
  {
    id: "BOM-000001",
    name: "European Working Desk",
    version: 1,
    status: "Active",
    description: "",
    linkedTo: null,
    createdAt: "2026-04-22",
    updatedAt: "2026-04-22",
    materials: [
      material("mat-006", 2),
      material("mat-008", 2),
      material("mat-012", 1),
      material("mat-007", 1),
    ],
    routing: [
      { step: 1, name: "Working Desk Making: Inbound", operation: "-", hours: 1 },
      { step: 2, name: "Working Desk Making: Processing", operation: "-", hours: 4 },
      { step: 3, name: "Working Desk Making: Packaging", operation: "-", hours: 1 },
      { step: 4, name: "Working Desk Making: Shipping", operation: "-", hours: 1 },
    ],
    cogs: {
      labour: breakdownField([line("Assembly labour", 2760000)]),
      packing: breakdownField([line("Packing labour & materials", 320000)]),
      shipping: breakdownField([
        line("Inbound - Supplier to Factory", 180000),
        line("FOB Fee - Container 20' Export", 90000),
      ]),
      overhead: breakdownField([line("Factory overhead allocation", 150000)]),
      other: breakdownField([line("Finishing consumables", 120000)]),
    },
  },
  {
    id: "BOM-000002",
    name: "European Dining Table",
    version: 1,
    status: "Active",
    description: "",
    linkedTo: null,
    createdAt: "2026-04-23",
    updatedAt: "2026-04-23",
    materials: [
      material("mat-006", 3),
      material("mat-008", 3),
      material("mat-011", 1),
    ],
    routing: [
      { step: 1, name: "Dining Table Making: Inbound", operation: "-", hours: 1 },
      { step: 2, name: "Dining Table Making: Processing", operation: "-", hours: 5 },
      { step: 3, name: "Dining Table Making: Packaging", operation: "-", hours: 1 },
      { step: 4, name: "Dining Table Making: Shipping", operation: "-", hours: 1 },
    ],
    cogs: {
      labour: breakdownField([line("Assembly labour", 3200000)]),
      packing: breakdownField([line("Packing labour & materials", 350000)]),
      shipping: breakdownField([line("Inbound - Supplier to Factory", 200000)]),
      overhead: breakdownField([line("Factory overhead allocation", 180000)]),
      other: breakdownField([line("Finishing consumables", 150000)]),
    },
  },
  {
    id: "BOM-000003",
    name: "BOM 123",
    version: 1,
    status: "Active",
    description: "",
    linkedTo: null,
    createdAt: "2026-05-06",
    updatedAt: "2026-05-06",
    materials: [material("mat-001", 1), material("mat-010", 4)],
    routing: [{ step: 1, name: "General Assembly", operation: "-", hours: 2 }],
    cogs: {
      ...DEFAULT_COGS(),
      labour: breakdownField([line("Assembly labour", 500000)]),
      packing: breakdownField([line("Packing labour & materials", 80000)]),
    },
  },
  {
    id: "BOM-000004",
    name: "1234565432234",
    version: 1,
    status: "Active",
    description: "",
    linkedTo: null,
    createdAt: "2026-05-06",
    updatedAt: "2026-05-06",
    materials: [material("mat-002", 2)],
    routing: [{ step: 1, name: "General Assembly", operation: "-", hours: 1 }],
    cogs: {
      ...DEFAULT_COGS(),
      labour: breakdownField([line("Assembly labour", 300000)]),
      packing: breakdownField([line("Packing labour & materials", 50000)]),
    },
  },
  {
    id: "BOM-000005",
    name: "111111111",
    version: 1,
    status: "Active",
    description: "",
    linkedTo: null,
    createdAt: "2026-05-06",
    updatedAt: "2026-05-06",
    materials: [material("mat-003", 5)],
    routing: [{ step: 1, name: "General Assembly", operation: "-", hours: 1 }],
    cogs: {
      ...DEFAULT_COGS(),
      labour: breakdownField([line("Assembly labour", 250000)]),
      packing: breakdownField([line("Packing labour & materials", 40000)]),
    },
  },
  {
    id: "BOM-000006",
    name: "1234567654322345",
    version: 1,
    status: "Active",
    description: "",
    linkedTo: null,
    createdAt: "2026-05-06",
    updatedAt: "2026-05-06",
    materials: [material("mat-004", 1), material("mat-005", 10)],
    routing: [{ step: 1, name: "General Assembly", operation: "-", hours: 1 }],
    cogs: {
      ...DEFAULT_COGS(),
      labour: breakdownField([line("Assembly labour", 400000)]),
      packing: breakdownField([line("Packing labour & materials", 60000)]),
    },
  },
  {
    id: "BOM-000007",
    name: "Table Premioum",
    version: 1,
    status: "Active",
    description: "",
    linkedTo: null,
    createdAt: "2026-05-06",
    updatedAt: "2026-05-06",
    materials: [material("mat-008", 4), material("mat-009", 2), material("mat-014", 1)],
    routing: [
      { step: 1, name: "Premium Table Making: Processing", operation: "-", hours: 6 },
      { step: 2, name: "Premium Table Making: Finishing", operation: "-", hours: 2 },
    ],
    cogs: {
      ...DEFAULT_COGS(),
      labour: breakdownField([line("Assembly labour", 4500000)]),
      packing: breakdownField([line("Packing labour & materials", 400000)]),
      overhead: breakdownField([line("Factory overhead allocation", 300000)]),
      other: breakdownField([line("Tooling costs", 200000)]),
    },
  },
  {
    id: "BOM-000008",
    name: "Copper Wire Sub-Assembly",
    version: 1,
    status: "Active",
    description: "Insulated copper wire built internally from raw copper stock.",
    linkedTo: { type: "Material", id: "mat-004" },
    createdAt: "2026-06-10",
    updatedAt: "2026-06-10",
    materials: [material("mat-002", 3), material("mat-003", 1)],
    routing: [
      { step: 1, name: "Wire Sub-Assembly: Drawing", operation: "-", hours: 2 },
      { step: 2, name: "Wire Sub-Assembly: Insulation", operation: "-", hours: 1 },
    ],
    cogs: {
      ...DEFAULT_COGS(),
      labour: breakdownField([line("Assembly labour", 150000)]),
      packing: breakdownField([line("Packing labour & materials", 30000)]),
    },
  },
];

let boms = (() => {
  const seeded = INITIAL_BOMS.map((b) => ({ ...b }));
  const seededIds = new Set(seeded.map((b) => b.id));
  const runtime = loadRuntimeBoms().filter((b) => b && !seededIds.has(b.id));
  return [...runtime, ...seeded].map((b) => ({ ...b, cogs: normalizeCogs(b.cogs) }));
})();

const persistRuntime = () => {
  const seededIds = new Set(INITIAL_BOMS.map((b) => b.id));
  saveRuntimeBoms(boms.filter((b) => !seededIds.has(b.id)));
};

export const getBoms = () => boms;

export const getBom = (id) => boms.find((b) => b.id === id) || null;

const nextBomId = () => {
  const maxSeq = boms.reduce((max, b) => {
    const match = /^BOM-(\d+)$/.exec(b.id);
    return match ? Math.max(max, parseInt(match[1], 10)) : max;
  }, 0);
  return `BOM-${String(maxSeq + 1).padStart(6, "0")}`;
};

export const createBom = (data) => {
  const today = new Date().toISOString().slice(0, 10);
  const record = {
    id: nextBomId(),
    version: 1,
    status: data.status || "Active",
    createdAt: today,
    updatedAt: today,
    materials: [],
    routing: [],
    cogs: DEFAULT_COGS(),
    linkedTo: null,
    ...data,
    cogs: normalizeCogs(data.cogs),
  };
  boms = [record, ...boms];
  persistRuntime();
  return record;
};

export const getEligibleBoms = () => boms.filter((b) => !b.linkedTo);

export const linkBomToMaterial = (bomId, materialId) => {
  boms = boms.map((b) =>
    b.id === bomId ? { ...b, linkedTo: { type: "Material", id: materialId } } : b
  );
  persistRuntime();
  return getBom(bomId);
};

// Materials don't carry their own `bomId` field — the link lives on the BOM's
// `linkedTo` — so this looks it up from that side.
export const getBomLinkedToMaterial = (materialId) =>
  boms.find((b) => b.linkedTo?.type === "Material" && b.linkedTo?.id === materialId) || null;

export const unlinkBomFromMaterial = (bomId) => {
  boms = boms.map((b) => (b.id === bomId ? { ...b, linkedTo: null } : b));
  persistRuntime();
};

export const updateBom = (id, data) => {
  const today = new Date().toISOString().slice(0, 10);
  boms = boms.map((b) =>
    b.id === id ? { ...b, ...data, id: b.id, updatedAt: today, cogs: normalizeCogs(data.cogs || b.cogs) } : b
  );
  persistRuntime();
  return getBom(id);
};

export const resolveMaterialOption = (materialId) =>
  MOCK_MATERIALS_DATA.find((m) => m.id === materialId) || null;
