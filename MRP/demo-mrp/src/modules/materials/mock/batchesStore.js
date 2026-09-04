import { MOCK_STOCK_BATCHES } from "./batchesMocks.js";

// Stock Batches created at runtime (e.g. via "Post Output to Stock" from a Work
// Order, or added/edited from the Material Detail > Stock Batches tab) are held
// in a module-level store so both the Materials module and the Work Order module
// can read/write the same data, and persisted to localStorage so they survive a
// full page reload — mirroring modules/bill-of-materials/mock/bomMocks.js's
// RUNTIME_STORAGE_KEY pattern.
const RUNTIME_STORAGE_KEY = "stock_batches_runtime";

const loadRuntimeBatches = () => {
  try {
    const raw = typeof localStorage !== "undefined" ? localStorage.getItem(RUNTIME_STORAGE_KEY) : null;
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveRuntimeBatches = (list) => {
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(RUNTIME_STORAGE_KEY, JSON.stringify(list));
    }
  } catch {
    /* ignore persistence failures (private mode, quota, etc.) */
  }
};

const seededIds = new Set(MOCK_STOCK_BATCHES.map((b) => b.id));

let batches = (() => {
  const runtime = loadRuntimeBatches().filter((b) => b && !seededIds.has(b.id));
  return [...runtime, ...MOCK_STOCK_BATCHES.map((b) => ({ ...b }))];
})();

const persistRuntime = () => {
  saveRuntimeBatches(batches.filter((b) => !seededIds.has(b.id)));
};

export const getBatches = () => batches;

export const getBatch = (id) => batches.find((b) => b.id === id) || null;

export const getBatchesForMaterial = (materialId) => batches.filter((b) => b.materialId === materialId);

// Replaces the whole batches list (used by StockBatchesTab's controlled
// add/edit/dispose/adjustment flows on the Material Detail page) and persists
// any non-seeded (runtime) records.
export const setBatches = (nextBatches) => {
  batches = Array.isArray(nextBatches) ? nextBatches : batches;
  persistRuntime();
};

export const addBatch = (batch) => {
  batches = [batch, ...batches];
  persistRuntime();
  return batch;
};

export const updateBatch = (id, data) => {
  batches = batches.map((b) => (b.id === id ? { ...b, ...data, id: b.id } : b));
  persistRuntime();
  return getBatch(id);
};
