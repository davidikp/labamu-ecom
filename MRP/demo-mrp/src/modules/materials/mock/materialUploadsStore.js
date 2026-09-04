// Material Bulk Upload batches mock store — module-level array + pub-sub
// subscribe pattern, mirroring
// product-catalog/mock/bulkUploadsStore.js exactly, with its own ID
// namespace ("BUM-" instead of "BUP-") so the two modules' upload sequences
// never collide.
import { CURRENT_USER, NOTIFICATION_USERS } from "../../../data/notification/notificationConfig.js";

// IDs are date-scoped — "BUM-[yyyymmdd]-0001" — with the sequence restarting
// at 0001 for each new day, based on the upload's created date.
const formatDateForId = (isoString) => {
  const d = new Date(isoString);
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}${mm}${dd}`;
};

const nextId = (createdAt) => {
  const prefix = `BUM-${formatDateForId(createdAt)}-`;
  const countToday = batches.filter((b) => b.id.startsWith(prefix)).length;
  return `${prefix}${String(countToday + 1).padStart(4, "0")}`;
};

// ── Activity log helpers ─────────────────────────────────────────────────────
// Every batch carries a `logs` array — one entry per status change (plus the
// initial "created" entry) — shown in the Material Upload Detail modal's Logs
// tab. Shape mirrors the app's other activity-log lists: name, email,
// activity (title + optional description), timestamp.
const USER_EMAIL_BY_NAME = new Map(NOTIFICATION_USERS.map((u) => [u.name, u.email]));

// Sentinel actor name for status changes the system makes on its own — e.g. a
// background timer completing after the user has navigated away — rather
// than something a person clicked. Kept distinct from a real user name so it
// never accidentally falls back to CURRENT_USER's email below.
export const SYSTEM_ACTOR_NAME = "System";

const actorForName = (name) => {
  if (name === SYSTEM_ACTOR_NAME) return { name: SYSTEM_ACTOR_NAME, email: null };
  return {
    name: name || CURRENT_USER.name,
    email: USER_EMAIL_BY_NAME.get(name) || CURRENT_USER.email,
  };
};

const makeLog = (actor, title, desc, timestamp) => ({
  name: actor.name,
  email: actor.email,
  title,
  desc,
  timestamp: timestamp || new Date().toISOString(),
});

// Default copy for each status a batch can land on — used whenever
// `updateMaterialUpload` sees `patch.status` differ from the current one.
// `patch.logDesc` can override the description for a specific transition
// (e.g. "AI normalization skipped by user.").
const STATUS_LOG_COPY = {
  "Normalizing Data": { title: "Normalization Started", desc: "The uploaded data is being normalized in the background." },
  Review: { title: "Normalization Finished", desc: "Data is ready for review." },
  Processing: { title: "Import Started", desc: "Reviewed materials are being imported into the catalog." },
  Completed: { title: "Import Completed", desc: "Materials were added to the material catalog." },
  Cancelled: { title: "Upload Cancelled", desc: "This upload was cancelled and will not be imported." },
};

// ── Dummy data generator for the Review-status seed ─────────────────────────
// Expands a Review-status draft to enough rows for the Review step to demo
// pagination/search/filtering, with a couple of deliberate edge cases mixed
// in so validation is visible without needing to page through everything:
//  - row[1] — missing Name/SKU (blank required field).
//  - row[2] — missing Category (blank required field).
//  - row[3] — ABC Classification isn't one of A/B/C ("D"), so the dropdown
//             renders in its unset/error state with
//             "“D” couldn’t be applied due to its format."
//  - row[4] — Material Type came in as a value with no matching alias
//             ("Composite" — unlike e.g. "Semi Finished", which normalizeMaterialTypeValue
//             *would* map to "SemiFinished"), showing
//             "“Composite” couldn’t be applied due to its format."
//  - row[5] — Name came in longer than the 100-char cap — already truncated
//             to 100 chars here (mirroring what normalizeMappedRows would do
//             for a real import) and flagged via __truncatedFields so the
//             Review step shows "Max. 100 characters. Extra text removed." Given
//             an "Aa " prefix so it still sorts into the first 10 rows under
//             the Review step's default ascending Name sort.
const DRAFT_CATEGORIES = ["Raw Material", "Chemicals", "Electronics", "Fasteners", "Components"];
const DRAFT_MATERIAL_NAMES = [
  "Aluminium Sheet", "Steel Pipe", "Plastic Granule", "Copper Wire", "Hex Bolt",
  "Plywood Board", "Wood Glue", "Veneer Sheet", "Foam Padding", "Rubber Gasket",
];
const DRAFT_UOMS = ["Sheet", "Meter", "Kg", "Roll", "Pcs"];

const generateDraftMaterialRows = () => {
  const rows = [];
  for (let i = 0; i < 20; i++) {
    const category = DRAFT_CATEGORIES[i % DRAFT_CATEGORIES.length];
    const materialName = DRAFT_MATERIAL_NAMES[i % DRAFT_MATERIAL_NAMES.length];
    rows.push({
      __rowId: `draft-material-row-${i + 1}`,
      sku: `DFT-MAT-${String(i + 1).padStart(3, "0")}`,
      name: `${materialName} ${i + 1}`,
      category,
      abcClassification: ["A", "B", "C"][i % 3],
      materialType: ["Raw", "SemiFinished", "Finished"][i % 3],
      uom: DRAFT_UOMS[i % DRAFT_UOMS.length],
    });
  }

  rows[1] = { ...rows[1], sku: "", name: "" };
  rows[2] = { ...rows[2], category: "" };
  rows[3] = { ...rows[3], abcClassification: "D" };
  rows[4] = { ...rows[4], materialType: "Composite" };
  rows[5] = {
    ...rows[5],
    name: "Aa Reinforced Galvanized Steel Pipe Fitting Coupler Heavy Duty Industrial Grade For Structural Use In".slice(0, 100),
    __truncatedFields: { name: true },
  };

  return rows;
};

const SEED_BATCHES = [
  {
    id: "BUM-20260802-0001",
    fileName: "material_catalog_master.xlsx",
    createdAt: "2026-08-02T09:20:00Z",
    createdBy: CURRENT_USER.name,
    totalMaterials: 14,
    // No `rawRows` kept for this seed — sourceRowCount stands in as the
    // Bulk Upload Detail modal's "Data in File" count (one row was removed
    // during Review before import, hence 15 in the file vs. 14 reviewed).
    sourceRowCount: 15,
    status: "Completed",
    successCount: 14,
    failedCount: 0,
    failedRows: [],
    sourceDocumentName: "material_catalog_master.xlsx",
    logs: [
      makeLog(actorForName(CURRENT_USER.name), "Upload Created", "File \"material_catalog_master.xlsx\" was uploaded (14 materials).", "2026-08-02T09:20:00Z"),
      makeLog(actorForName(CURRENT_USER.name), "Normalization Started", "The uploaded data is being normalized in the background.", "2026-08-02T09:21:00Z"),
      makeLog(actorForName(SYSTEM_ACTOR_NAME), "Normalization Finished", "Data is ready for review.", "2026-08-02T09:21:05Z"),
      makeLog(actorForName(CURRENT_USER.name), "Import Started", "Reviewed materials are being imported into the catalog.", "2026-08-02T09:23:00Z"),
      makeLog(actorForName(SYSTEM_ACTOR_NAME), "Import Completed", "Materials were added to the material catalog.", "2026-08-02T09:27:00Z"),
    ],
  },
  {
    id: "BUM-20260805-0001",
    fileName: "fasteners_batch_q3.csv",
    createdAt: "2026-08-05T13:10:00Z",
    createdBy: NOTIFICATION_USERS[1].name,
    totalMaterials: 10,
    sourceRowCount: 11,
    status: "Completed",
    successCount: 8,
    failedCount: 2,
    failedRows: [
      { row: 3, name: "", category: "Fasteners", abcClassification: "C", materialType: "SemiFinished", uom: "Pcs", reason: "Missing required field: Material Name" },
      { row: 7, name: "Hex Nut M6", category: "", abcClassification: "C", materialType: "SemiFinished", uom: "Pcs", reason: "Missing required field: Category" },
    ],
    sourceDocumentName: "fasteners_batch_q3.csv",
    logs: [
      makeLog(actorForName(NOTIFICATION_USERS[1].name), "Upload Created", "File \"fasteners_batch_q3.csv\" was uploaded (10 materials).", "2026-08-05T13:10:00Z"),
      makeLog(actorForName(NOTIFICATION_USERS[1].name), "Normalization Started", "The uploaded data is being normalized in the background.", "2026-08-05T13:11:00Z"),
      makeLog(actorForName(SYSTEM_ACTOR_NAME), "Normalization Finished", "Data is ready for review.", "2026-08-05T13:11:05Z"),
      makeLog(actorForName(NOTIFICATION_USERS[1].name), "Import Started", "Reviewed materials are being imported into the catalog.", "2026-08-05T13:13:00Z"),
      makeLog(actorForName(SYSTEM_ACTOR_NAME), "Import Completed", "8 of 10 materials were added; 2 rows were skipped for missing required fields.", "2026-08-05T13:16:00Z"),
    ],
  },
  {
    id: "BUM-20260807-0002",
    fileName: "electronics_new_stock.xlsx",
    createdAt: "2026-08-07T15:40:00Z",
    createdBy: NOTIFICATION_USERS[2].name,
    totalMaterials: 12,
    sourceRowCount: 12,
    status: "Processing",
    successCount: 0,
    failedCount: 0,
    failedRows: [],
    sourceDocumentName: "electronics_new_stock.xlsx",
    logs: [
      makeLog(actorForName(NOTIFICATION_USERS[2].name), "Upload Created", "File \"electronics_new_stock.xlsx\" was uploaded (12 materials).", "2026-08-07T15:40:00Z"),
      makeLog(actorForName(NOTIFICATION_USERS[2].name), "Normalization Started", "The uploaded data is being normalized in the background.", "2026-08-07T15:41:00Z"),
      makeLog(actorForName(SYSTEM_ACTOR_NAME), "Normalization Finished", "Data is ready for review.", "2026-08-07T15:41:05Z"),
      makeLog(actorForName(NOTIFICATION_USERS[2].name), "Import Started", "Reviewed materials are being imported into the catalog.", "2026-08-07T15:48:00Z"),
    ],
  },
  {
    id: "BUM-20260808-0001",
    fileName: "draft_materials_batch.csv",
    createdAt: "2026-08-08T10:05:00Z",
    createdBy: NOTIFICATION_USERS[3].name,
    totalMaterials: 20,
    sourceRowCount: 22,
    status: "Review",
    successCount: 0,
    failedCount: 0,
    failedRows: [],
    sourceDocumentName: "draft_materials_batch.csv",
    sourceHeaders: ["Material Name", "Category", "Classification", "Type", "UOM", "SKU"],
    fieldMapping: {
      sku: "SKU",
      name: "Material Name",
      category: "Category",
      abcClassification: "Classification",
      materialType: "Type",
      uom: "UOM",
    },
    rows: generateDraftMaterialRows(),
    logs: [
      makeLog(actorForName(NOTIFICATION_USERS[3].name), "Upload Created", "File \"draft_materials_batch.csv\" was uploaded (20 materials).", "2026-08-08T10:05:00Z"),
      makeLog(actorForName(NOTIFICATION_USERS[3].name), "Normalization Started", "The uploaded data is being normalized in the background.", "2026-08-08T10:10:00Z"),
      makeLog(actorForName(SYSTEM_ACTOR_NAME), "Normalization Finished", "Data is ready for review.", "2026-08-08T10:12:00Z"),
    ],
  },
  {
    id: "BUM-20260809-0001",
    fileName: "raw_materials_batch_two.csv",
    createdAt: "2026-08-09T11:15:00Z",
    createdBy: NOTIFICATION_USERS[1].name,
    totalMaterials: 8,
    status: "Mapping",
    successCount: 0,
    failedCount: 0,
    failedRows: [],
    sourceDocumentName: "raw_materials_batch_two.csv",
    sourceHeaders: ["Material Name", "Category", "Classification", "Type", "UOM", "SKU", "Description"],
    fieldMapping: {
      sku: "SKU",
      name: "Material Name",
      category: "Category",
      abcClassification: "Classification",
      materialType: "Type",
      uom: "UOM",
      description: "Description",
    },
    // Demo seed: a long Description value here so the Mapping step's Example
    // Value column has something to test the "Show all"/"Show less" clamp
    // against without needing to upload a fresh file.
    rawRows: [
      {
        SKU: "RAW-B2-01",
        "Material Name": "Teak Veneer Sheet Large",
        Category: "Raw Material",
        Classification: "A",
        Type: "Raw",
        UOM: "Sheet",
        Description:
          "Premium-grade teak veneer sheet sourced from sustainably managed plantations, sliced to a consistent 0.6mm thickness for use in furniture facing and cabinetry work. The grain pattern is naturally striped with warm honey-brown tones, and each sheet is quarter-cut to minimize warping during lamination. Store flat in a climate-controlled area away from direct sunlight and moisture — humidity fluctuations can cause the veneer to curl or crack at the edges. Suitable for both flat-panel and curved-surface applications when paired with a compatible contact adhesive. Not recommended for exterior use without additional sealant treatment.",
      },
      { SKU: "RAW-B2-02", "Material Name": "Teak Veneer Sheet Small", Category: "Raw Material", Classification: "B", Type: "Raw", UOM: "Sheet", Description: "Smaller-format teak veneer sheet, same grade and grain as the large size." },
    ],
    rows: [],
    logs: [
      makeLog(actorForName(NOTIFICATION_USERS[1].name), "Upload Created", "File \"raw_materials_batch_two.csv\" was uploaded (8 materials).", "2026-08-09T11:15:00Z"),
    ],
  },
  {
    id: "BUM-20260809-0002",
    fileName: "components_batch_normalizing.csv",
    createdAt: "2026-08-09T16:20:00Z",
    createdBy: NOTIFICATION_USERS[2].name,
    totalMaterials: 6,
    status: "Normalizing Data",
    successCount: 0,
    failedCount: 0,
    failedRows: [],
    sourceDocumentName: "components_batch_normalizing.csv",
    sourceHeaders: ["Material Name", "Category", "Classification", "Type", "UOM", "SKU"],
    fieldMapping: {
      sku: "SKU",
      name: "Material Name",
      category: "Category",
      abcClassification: "Classification",
      materialType: "Type",
      uom: "UOM",
    },
    rawRows: [
      { SKU: "CMP-NRM-01", "Material Name": "Rubber Gasket Model Y", Category: "Components", Classification: "C", Type: "SemiFinished", UOM: "Pcs" },
      { SKU: "CMP-NRM-02", "Material Name": "Rubber Gasket Model Z", Category: "Components", Classification: "C", Type: "SemiFinished", UOM: "Pcs" },
    ],
    rows: [],
    logs: [
      makeLog(actorForName(NOTIFICATION_USERS[2].name), "Upload Created", "File \"components_batch_normalizing.csv\" was uploaded (6 materials).", "2026-08-09T16:20:00Z"),
      makeLog(actorForName(NOTIFICATION_USERS[2].name), "Normalization Started", "The uploaded data is being normalized in the background.", "2026-08-09T16:21:30Z"),
    ],
  },
  {
    id: "BUM-20260729-0001",
    fileName: "bulk_material_import_cancelled.xlsx",
    createdAt: "2026-07-29T09:00:00Z",
    createdBy: CURRENT_USER.name,
    totalMaterials: 16,
    sourceRowCount: 16,
    status: "Cancelled",
    successCount: 0,
    failedCount: 16,
    failedRows: [
      { row: 2, name: "Steel Rod 10mm", category: "Raw Material", abcClassification: "B", materialType: "Raw", uom: "Meter", reason: "Upload cancelled by user" },
    ],
    sourceDocumentName: "bulk_material_import_cancelled.xlsx",
    logs: [
      makeLog(actorForName(CURRENT_USER.name), "Upload Created", "File \"bulk_material_import_cancelled.xlsx\" was uploaded (16 materials).", "2026-07-29T09:00:00Z"),
      makeLog(actorForName(CURRENT_USER.name), "Upload Cancelled", "This upload was cancelled and will not be imported.", "2026-07-29T09:04:00Z"),
    ],
  },
];

let batches = SEED_BATCHES.map((b) => ({ ...b }));
const listeners = new Set();

const notify = () => listeners.forEach((fn) => fn(batches));

export const getMaterialUploads = () => batches;

export const getMaterialUpload = (id) => batches.find((b) => b.id === id) || null;

export const subscribeMaterialUploads = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

export const addMaterialUpload = (data) => {
  const actor = actorForName(data.createdBy);
  const createdAt = new Date().toISOString();
  const record = {
    id: nextId(createdAt),
    fileName: data.fileName || "untitled.csv",
    createdAt,
    createdBy: data.createdBy || CURRENT_USER.name,
    totalMaterials: data.totalMaterials || 0,
    status: data.status || "Mapping",
    successCount: data.successCount || 0,
    failedCount: data.failedCount || 0,
    failedRows: data.failedRows || [],
    sourceDocumentName: data.sourceDocumentName || data.fileName || "untitled.csv",
    rows: data.rows || [],
    rawRows: data.rawRows || [],
    fieldMapping: data.fieldMapping || {},
    sourceHeaders: data.sourceHeaders || [],
    logs: [
      makeLog(actor, "Upload Created", `File "${data.fileName || "untitled.csv"}" was uploaded (${data.totalMaterials || 0} materials).`),
    ],
  };
  // The record's initial status (almost always "Mapping") isn't reached via
  // updateMaterialUpload's status-diff logging below, since it's set at
  // creation time — log it explicitly here so the very first status a batch
  // holds isn't silently missing from its own history.
  const initialCopy = STATUS_LOG_COPY[record.status];
  if (initialCopy) {
    record.logs.push(makeLog(actor, initialCopy.title, initialCopy.desc));
  }
  batches = [record, ...batches];
  notify();
  return record;
};

export const updateMaterialUpload = (id, patch) => {
  const { logActorName, logTitle, logDesc, ...rest } = patch;
  batches = batches.map((b) => {
    if (b.id !== id) return b;
    const next = { ...b, ...rest, id: b.id };
    if (rest.status && rest.status !== b.status) {
      const copy = STATUS_LOG_COPY[rest.status];
      const actor = actorForName(logActorName || CURRENT_USER.name);
      const log = makeLog(actor, logTitle || copy?.title || `Status Changed To "${rest.status}"`, logDesc || copy?.desc);
      next.logs = [...(b.logs || []), log];
    }
    return next;
  });
  notify();
  return getMaterialUpload(id);
};
