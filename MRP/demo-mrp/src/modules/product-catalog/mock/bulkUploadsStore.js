// Bulk Upload batches mock store — module-level array + pub-sub subscribe
// pattern, mirroring modules/materials/mock/batchesStore.js (minus
// localStorage persistence, which isn't needed for this demo flow).
import { CURRENT_USER, NOTIFICATION_USERS } from "../../../data/notification/notificationConfig.js";

// IDs are date-scoped — "BUP-[yyyymmdd]-0001" — with the sequence restarting
// at 0001 for each new day, based on the upload's created date.
const formatDateForId = (isoString) => {
  const d = new Date(isoString);
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}${mm}${dd}`;
};

const nextId = (createdAt) => {
  const prefix = `BUP-${formatDateForId(createdAt)}-`;
  const countToday = batches.filter((b) => b.id.startsWith(prefix)).length;
  return `${prefix}${String(countToday + 1).padStart(4, "0")}`;
};

// ── Activity log helpers ─────────────────────────────────────────────────────
// Every batch carries a `logs` array — one entry per status change (plus the
// initial "created" entry) — shown in the Bulk Upload Detail modal's Logs
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
// `updateBulkUpload` sees `patch.status` differ from the current one.
// `patch.logDesc` can override the description for a specific transition
// (e.g. "AI normalization skipped by user.").
const STATUS_LOG_COPY = {
  "Normalizing Data": { title: "Normalization Started", desc: "The uploaded data is being normalized in the background." },
  Review: { title: "Normalization Finished", desc: "Data is ready for review." },
  Processing: { title: "Import Started", desc: "Reviewed products are being imported into the catalog." },
  Completed: { title: "Import Completed", desc: "Products were added to the product catalog." },
  Cancelled: { title: "Upload Cancelled", desc: "This upload was cancelled and will not be imported." },
};

// ── Dummy data generator for BUP-0004 ────────────────────────────────────────
// Expands the "draft_boards_batch.csv" Review-status draft to 50 rows so the
// Review step has enough data to demo pagination/search/filtering, with a
// few deliberate edge cases mixed in alongside the original 3 invalid rows:
//  - row[4] — Lead Time unit isn't one of our options ("Fortnights"), so the
//             unit dropdown renders in its unset/error state with
//             "“Fortnights” couldn’t be applied due to its format."
//  - row[5] — Selling Price came in a foreign currency ($) — the numeric
//             value is kept as-is and flagged for the user to verify.
//  - row[6] — Name came in longer than the 100-char cap — already truncated
//             to 100 chars here (mirroring what normalizeMappedRows would do
//             for a real import) and flagged via __truncatedFields so the
//             Review step shows "Max. 100 characters. Extra text removed." Given
//             an "Aa " prefix so it still sorts into the first 10 rows under
//             the Review step's default ascending Name sort.
// All three are on page 1 (first 10 rows) so they're easy to spot without paging.
const DRAFT_CATEGORIES = ["Wooden Boards", "Trays", "Vases", "Bowls", "Baskets", "Coasters"];
const DRAFT_PRODUCT_NAMES = [
  "Teak Board", "Rattan Tray", "Ceramic Vase", "Mango Wood Bowl", "Woven Basket", "Bamboo Coaster",
  "Acacia Board", "Palm Leaf Tray", "Stoneware Vase", "Walnut Bowl", "Seagrass Basket", "Cork Coaster",
];

const generateDraftBoardsRows = () => {
  const rows = [];
  for (let i = 0; i < 50; i++) {
    const category = DRAFT_CATEGORIES[i % DRAFT_CATEGORIES.length];
    const productName = DRAFT_PRODUCT_NAMES[i % DRAFT_PRODUCT_NAMES.length];
    rows.push({
      __rowId: `draft-row-${i + 1}`,
      sku: `DFT-${String(i + 1).padStart(3, "0")}`,
      name: `${productName} ${i + 1}`,
      categoryName: category,
      leadTime: `${5 + (i % 10)} Days`,
      sellingPrice: String(120000 + i * 5000),
    });
  }

  rows[1] = { ...rows[1], sku: "", name: "" };
  rows[2] = { ...rows[2], categoryName: "", leadTime: "" };
  rows[3] = { ...rows[3], sellingPrice: "" };
  rows[4] = { ...rows[4], leadTime: "10 Fortnights" };
  rows[5] = { ...rows[5], sellingPrice: "120", sellingPriceSourceCurrency: "$" };
  rows[6] = {
    ...rows[6],
    name: "Aa Handwoven Mango Wood Bowl With Natural Finish And Reinforced Base For Everyday Kitchen And Dining Table".slice(0, 100),
    __truncatedFields: { name: true },
  };

  return rows;
};

const SEED_BATCHES = [
  {
    id: "BUP-20260801-0001",
    fileName: "product_catalog_master.xlsx",
    createdAt: "2026-08-01T09:12:00Z",
    createdBy: CURRENT_USER.name,
    totalProducts: 24,
    // No `rawRows` kept for this seed — sourceRowCount stands in as the
    // Bulk Upload Detail modal's "Data in File" count (one row was removed
    // during Review before import, hence 25 in the file vs. 24 reviewed).
    sourceRowCount: 25,
    status: "Completed",
    successCount: 24,
    failedCount: 0,
    failedRows: [],
    sourceDocumentName: "product_catalog_master.xlsx",
    logs: [
      makeLog(actorForName(CURRENT_USER.name), "Upload Created", "File \"product_catalog_master.xlsx\" was uploaded (24 products).", "2026-08-01T09:12:00Z"),
      makeLog(actorForName(CURRENT_USER.name), "Normalization Started", "The uploaded data is being normalized in the background.", "2026-08-01T09:13:00Z"),
      makeLog(actorForName(SYSTEM_ACTOR_NAME), "Normalization Finished", "Data is ready for review.", "2026-08-01T09:13:05Z"),
      makeLog(actorForName(CURRENT_USER.name), "Import Started", "Reviewed products are being imported into the catalog.", "2026-08-01T09:15:00Z"),
      makeLog(actorForName(SYSTEM_ACTOR_NAME), "Import Completed", "Products were added to the product catalog.", "2026-08-01T09:19:00Z"),
    ],
  },
  {
    id: "BUP-20260804-0001",
    fileName: "wooden_trays_q3.csv",
    createdAt: "2026-08-04T14:30:00Z",
    createdBy: NOTIFICATION_USERS[1].name,
    totalProducts: 15,
    sourceRowCount: 16,
    status: "Completed",
    successCount: 13,
    failedCount: 2,
    failedRows: [
      { row: 6, name: "", categoryName: "Trays", leadTime: "7 Days", sellingPrice: "210000", reason: "Missing required field: Name" },
      { row: 11, name: "Wooden Bowl XL", categoryName: "", leadTime: "9 Days", sellingPrice: "195000", reason: "Missing required field: Category Name" },
    ],
    sourceDocumentName: "wooden_trays_q3.csv",
    logs: [
      makeLog(actorForName(NOTIFICATION_USERS[1].name), "Upload Created", "File \"wooden_trays_q3.csv\" was uploaded (15 products).", "2026-08-04T14:30:00Z"),
      makeLog(actorForName(NOTIFICATION_USERS[1].name), "Normalization Started", "The uploaded data is being normalized in the background.", "2026-08-04T14:31:00Z"),
      makeLog(actorForName(SYSTEM_ACTOR_NAME), "Normalization Finished", "Data is ready for review.", "2026-08-04T14:31:05Z"),
      makeLog(actorForName(NOTIFICATION_USERS[1].name), "Import Started", "Reviewed products are being imported into the catalog.", "2026-08-04T14:33:00Z"),
      makeLog(actorForName(SYSTEM_ACTOR_NAME), "Import Completed", "13 of 15 products were added; 2 rows were skipped for missing required fields.", "2026-08-04T14:36:00Z"),
    ],
  },
  {
    id: "BUP-20260807-0001",
    fileName: "vases_new_arrivals.xlsx",
    createdAt: "2026-08-07T11:05:00Z",
    createdBy: NOTIFICATION_USERS[2].name,
    totalProducts: 18,
    sourceRowCount: 18,
    status: "Processing",
    successCount: 0,
    failedCount: 0,
    failedRows: [],
    sourceDocumentName: "vases_new_arrivals.xlsx",
    logs: [
      makeLog(actorForName(NOTIFICATION_USERS[2].name), "Upload Created", "File \"vases_new_arrivals.xlsx\" was uploaded (18 products).", "2026-08-07T11:05:00Z"),
      makeLog(actorForName(NOTIFICATION_USERS[2].name), "Normalization Started", "The uploaded data is being normalized in the background.", "2026-08-07T11:06:00Z"),
      makeLog(actorForName(SYSTEM_ACTOR_NAME), "Normalization Finished", "Data is ready for review.", "2026-08-07T11:06:05Z"),
      makeLog(actorForName(NOTIFICATION_USERS[2].name), "Import Started", "Reviewed products are being imported into the catalog.", "2026-08-07T11:14:00Z"),
    ],
  },
  {
    id: "BUP-20260808-0001",
    fileName: "draft_boards_batch.csv",
    createdAt: "2026-08-08T16:45:00Z",
    createdBy: NOTIFICATION_USERS[3].name,
    totalProducts: 50,
    sourceRowCount: 52,
    status: "Review",
    successCount: 0,
    failedCount: 0,
    failedRows: [],
    sourceDocumentName: "draft_boards_batch.csv",
    sourceHeaders: ["Product Name", "Category", "Lead Time", "Price", "SKU"],
    fieldMapping: {
      sku: "SKU",
      name: "Product Name",
      categoryName: "Category",
      leadTime: "Lead Time",
      sellingPrice: "Price",
    },
    rows: generateDraftBoardsRows(),
    logs: [
      makeLog(actorForName(NOTIFICATION_USERS[3].name), "Upload Created", "File \"draft_boards_batch.csv\" was uploaded (50 products).", "2026-08-08T16:45:00Z"),
      makeLog(actorForName(NOTIFICATION_USERS[3].name), "Normalization Started", "The uploaded data is being normalized in the background.", "2026-08-08T16:50:00Z"),
      makeLog(actorForName(SYSTEM_ACTOR_NAME), "Normalization Finished", "Data is ready for review.", "2026-08-08T16:52:00Z"),
    ],
  },
  {
    id: "BUP-20260809-0001",
    fileName: "trays_batch_two.csv",
    createdAt: "2026-08-09T10:15:00Z",
    createdBy: NOTIFICATION_USERS[1].name,
    totalProducts: 12,
    status: "Mapping",
    successCount: 0,
    failedCount: 0,
    failedRows: [],
    sourceDocumentName: "trays_batch_two.csv",
    sourceHeaders: ["Product Name", "Category", "Lead Time", "Price", "SKU", "Description"],
    fieldMapping: {
      sku: "SKU",
      name: "Product Name",
      categoryName: "Category",
      leadTime: "Lead Time",
      sellingPrice: "Price",
      description: "Description",
    },
    // Demo seed: a long Description value here so the Mapping step's Example
    // Value column has something to test the "Show all"/"Show less" clamp
    // against without needing to upload a fresh file.
    rawRows: [
      {
        SKU: "TRY-B2-01",
        "Product Name": "Rattan Tray Medium",
        Category: "Trays",
        "Lead Time": "7 Days",
        Price: "175000",
        Description:
          "Handwoven rattan serving tray with a reinforced teak base, finished in a natural matte lacquer. Each piece is woven by hand using sustainably sourced rattan strands, giving it a slightly irregular, organic texture that varies piece to piece. The reinforced base adds rigidity so the tray holds its shape under load without warping over time. Suitable for indoor use only — avoid prolonged exposure to direct sunlight or moisture, as this may cause the natural fibers to dry out and become brittle. Recommended for serving food, displaying decor, or as a catch-all tray on entryway tables.",
      },
      { SKU: "TRY-B2-02", "Product Name": "Rattan Tray Large", Category: "Trays", "Lead Time": "8 Days", Price: "220000", Description: "Large rattan tray, same weave and finish as the medium size." },
    ],
    rows: [],
    logs: [
      makeLog(actorForName(NOTIFICATION_USERS[1].name), "Upload Created", "File \"trays_batch_two.csv\" was uploaded (12 products).", "2026-08-09T10:15:00Z"),
    ],
  },
  {
    id: "BUP-20260809-0002",
    fileName: "vases_batch_normalizing.csv",
    createdAt: "2026-08-09T15:40:00Z",
    createdBy: NOTIFICATION_USERS[2].name,
    totalProducts: 10,
    status: "Normalizing Data",
    successCount: 0,
    failedCount: 0,
    failedRows: [],
    sourceDocumentName: "vases_batch_normalizing.csv",
    sourceHeaders: ["Product Name", "Category", "Lead Time", "Price", "SKU"],
    fieldMapping: {
      sku: "SKU",
      name: "Product Name",
      categoryName: "Category",
      leadTime: "Lead Time",
      sellingPrice: "Price",
    },
    rawRows: [
      { SKU: "VAS-NRM-01", "Product Name": "Ceramic Vase Medium", Category: "Vases", "Lead Time": "9 Days", Price: "230000" },
      { SKU: "VAS-NRM-02", "Product Name": "Ceramic Vase Tall", Category: "Vases", "Lead Time": "11 Days", Price: "310000" },
    ],
    rows: [],
    logs: [
      makeLog(actorForName(NOTIFICATION_USERS[2].name), "Upload Created", "File \"vases_batch_normalizing.csv\" was uploaded (10 products).", "2026-08-09T15:40:00Z"),
      makeLog(actorForName(NOTIFICATION_USERS[2].name), "Normalization Started", "The uploaded data is being normalized in the background.", "2026-08-09T15:41:30Z"),
    ],
  },
  {
    id: "BUP-20260810-0001",
    fileName: "trays_batch_three.csv",
    createdAt: "2026-08-10T13:05:00Z",
    createdBy: NOTIFICATION_USERS[1].name,
    totalProducts: 3,
    status: "Mapping",
    successCount: 0,
    failedCount: 0,
    failedRows: [],
    sourceDocumentName: "trays_batch_three.csv",
    // Demo data for the Mapping step's header edge cases: the file has two
    // "SKU" columns (the second becomes "SKU (1)", mirroring how a repeated
    // download file name gets deduped) and one column with a blank header
    // (becomes "Untitled Column") — see dedupeHeaders() in UploadStep.jsx.
    sourceHeaders: ["SKU", "Product Name", "SKU (1)", "Untitled Column", "Category"],
    fieldMapping: {
      sku: "SKU",
      name: "Product Name",
      categoryName: "Category",
    },
    rawRows: [
      { SKU: "TRY-B3-01", "Product Name": "Bamboo Tray Small", "SKU (1)": "OLD-SKU-01", "Untitled Column": "N/A", Category: "Trays" },
      { SKU: "TRY-B3-02", "Product Name": "Bamboo Tray Medium", "SKU (1)": "OLD-SKU-02", "Untitled Column": "N/A", Category: "Trays" },
      { SKU: "TRY-B3-03", "Product Name": "Bamboo Tray Large", "SKU (1)": "OLD-SKU-03", "Untitled Column": "N/A", Category: "Trays" },
    ],
    rows: [],
    logs: [
      makeLog(actorForName(NOTIFICATION_USERS[1].name), "Upload Created", "File \"trays_batch_three.csv\" was uploaded (3 products).", "2026-08-10T13:05:00Z"),
    ],
  },
  {
    id: "BUP-20260728-0001",
    fileName: "bulk_import_cancelled.xlsx",
    createdAt: "2026-07-28T08:20:00Z",
    createdBy: CURRENT_USER.name,
    totalProducts: 30,
    sourceRowCount: 30,
    status: "Cancelled",
    successCount: 0,
    failedCount: 30,
    failedRows: [
      { row: 2, name: "Wooden Vase A", categoryName: "Vases", leadTime: "10 Days", sellingPrice: "300000", reason: "Upload cancelled by user" },
    ],
    sourceDocumentName: "bulk_import_cancelled.xlsx",
    logs: [
      makeLog(actorForName(CURRENT_USER.name), "Upload Created", "File \"bulk_import_cancelled.xlsx\" was uploaded (30 products).", "2026-07-28T08:20:00Z"),
      makeLog(actorForName(CURRENT_USER.name), "Upload Cancelled", "This upload was cancelled and will not be imported.", "2026-07-28T08:24:00Z"),
    ],
  },
];

let batches = SEED_BATCHES.map((b) => ({ ...b }));
const listeners = new Set();

const notify = () => listeners.forEach((fn) => fn(batches));

export const getBulkUploads = () => batches;

export const getBulkUpload = (id) => batches.find((b) => b.id === id) || null;

export const subscribeBulkUploads = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

export const addBulkUpload = (data) => {
  const actor = actorForName(data.createdBy);
  const createdAt = new Date().toISOString();
  const record = {
    id: nextId(createdAt),
    fileName: data.fileName || "untitled.csv",
    createdAt,
    createdBy: data.createdBy || CURRENT_USER.name,
    totalProducts: data.totalProducts || 0,
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
      makeLog(actor, "Upload Created", `File "${data.fileName || "untitled.csv"}" was uploaded (${data.totalProducts || 0} products).`),
    ],
  };
  // The record's initial status (almost always "Mapping") isn't reached via
  // updateBulkUpload's status-diff logging below, since it's set at creation
  // time — log it explicitly here so the very first status a batch holds
  // isn't silently missing from its own history.
  const initialCopy = STATUS_LOG_COPY[record.status];
  if (initialCopy) {
    record.logs.push(makeLog(actor, initialCopy.title, initialCopy.desc));
  }
  batches = [record, ...batches];
  notify();
  return record;
};

export const updateBulkUpload = (id, patch) => {
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
  return getBulkUpload(id);
};
