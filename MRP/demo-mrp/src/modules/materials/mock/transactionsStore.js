import { MOCK_STOCK_TRANSACTIONS } from "./transactionsMocks.js";

// Stock Transactions created at runtime (e.g. an "In" transaction from a Work
// Order's "Confirm Stock Build" action) are held in a module-level store so
// both the Materials module and the Work Order module can read/write the same
// data, and persisted to localStorage so they survive a full page reload —
// mirroring modules/materials/mock/batchesStore.js.
const RUNTIME_STORAGE_KEY = "stock_transactions_runtime";

const loadRuntimeTransactions = () => {
  try {
    const raw = typeof localStorage !== "undefined" ? localStorage.getItem(RUNTIME_STORAGE_KEY) : null;
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveRuntimeTransactions = (list) => {
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(RUNTIME_STORAGE_KEY, JSON.stringify(list));
    }
  } catch {
    /* ignore persistence failures (private mode, quota, etc.) */
  }
};

const seededIds = new Set(MOCK_STOCK_TRANSACTIONS.map((t) => t.id));

let transactions = (() => {
  const runtime = loadRuntimeTransactions().filter((t) => t && !seededIds.has(t.id));
  return [...runtime, ...MOCK_STOCK_TRANSACTIONS.map((t) => ({ ...t }))];
})();

const persistRuntime = () => {
  saveRuntimeTransactions(transactions.filter((t) => !seededIds.has(t.id)));
};

export const getTransactions = () => transactions;

export const setTransactions = (nextTransactions) => {
  transactions = Array.isArray(nextTransactions) ? nextTransactions : transactions;
  persistRuntime();
};

export const addTransaction = (transaction) => {
  transactions = [transaction, ...transactions];
  persistRuntime();
  return transaction;
};
