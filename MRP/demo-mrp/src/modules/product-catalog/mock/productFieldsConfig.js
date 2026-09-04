// Product field schema used to drive the Bulk Upload wizard's Mapping and
// Review steps. `synonyms` are lowercase, normalized (no spaces/punctuation)
// alternate header spellings used for fuzzy auto-matching against an
// uploaded file's column headers.
export const PRODUCT_FIELDS_CONFIG = [
  {
    key: "sku",
    label: "SKU",
    required: false,
    example: "WBD-TEAK-120",
    synonyms: ["sku", "productsku", "code", "productcode", "itemcode"],
    helpText: "If empty, the system will auto-generate the SKU",
  },
  {
    key: "name",
    label: "Name",
    required: true,
    example: "Mountain Bike 2",
    synonyms: ["name", "productname", "itemname", "title"],
  },
  {
    key: "categoryName",
    label: "Category Name",
    required: true,
    example: "Sport",
    synonyms: ["categoryname", "category", "productcategory"],
  },
  {
    key: "description",
    label: "Description",
    required: false,
    example: "Handwoven rattan tray with teak base",
    synonyms: ["description", "productdescription", "notes", "desc"],
  },
  {
    key: "status",
    label: "Status",
    required: false,
    example: "Active",
    synonyms: ["status", "productstatus", "activestatus", "state"],
  },
  {
    key: "leadTime",
    label: "Lead Time",
    required: true,
    example: "10 Days",
    synonyms: ["leadtime", "productionleadtime", "leadtimedays"],
  },
  {
    key: "sellingPrice",
    label: "Selling Price",
    required: true,
    example: "20000",
    synonyms: ["sellingprice", "price", "unitprice", "sellprice"],
  },
  {
    key: "primaryMaterial",
    label: "Primary Material",
    required: false,
    example: "Aluminium Alloy",
    synonyms: ["primarymaterial", "material", "mainmaterial"],
  },
  {
    key: "finishing",
    label: "Finishing",
    required: false,
    example: "Powder Coating",
    synonyms: ["finishing", "finish", "surfacefinish"],
  },
  {
    key: "weightKg",
    label: "Weight (Kg)",
    required: false,
    example: "12.5",
    synonyms: ["weightkg", "weight", "netweight"],
  },
  {
    key: "finishedHeightCm",
    label: "Finished Height (cm)",
    required: false,
    example: "110",
    synonyms: ["finishedheightcm", "finishedheight", "height"],
  },
  {
    key: "finishedWidthCm",
    label: "Finished Width (cm)",
    required: false,
    example: "60",
    synonyms: ["finishedwidthcm", "finishedwidth", "width"],
  },
  {
    key: "finishedLengthCm",
    label: "Finished Length (cm)",
    required: false,
    example: "180",
    synonyms: ["finishedlengthcm", "finishedlength", "length"],
  },
  {
    key: "packedHeightCm",
    label: "Packed Height (cm)",
    required: false,
    example: "30",
    synonyms: ["packedheightcm", "packedheight", "boxheight"],
  },
  {
    key: "packedWidthCm",
    label: "Packed Width (cm)",
    required: false,
    example: "70",
    synonyms: ["packedwidthcm", "packedwidth", "boxwidth"],
  },
  {
    key: "packedLengthCm",
    label: "Packed Length (cm)",
    required: false,
    example: "190",
    synonyms: ["packedlengthcm", "packedlength", "boxlength"],
  },
  {
    key: "container20ft",
    label: "Container 20ft (Qty)",
    required: false,
    example: "180",
    synonyms: ["container20ft", "20ftcontainer", "qty20ft"],
  },
  {
    key: "container40ft",
    label: "Container 40ft (Qty)",
    required: false,
    example: "380",
    synonyms: ["container40ft", "40ftcontainer", "qty40ft"],
  },
  {
    key: "container40ftHighCube",
    label: "Container 40ft High Cube (Qty)",
    required: false,
    example: "440",
    synonyms: ["container40fthighcube", "40fthighcube", "hc40ft", "qty40fthc"],
  },
];

export const REQUIRED_PRODUCT_FIELD_KEYS = PRODUCT_FIELDS_CONFIG.filter((f) => f.required).map((f) => f.key);

// A row is invalid when any required field is blank — used by the Review
// step's table (red-outline cells) and by the page-level "Input Data" footer
// button (disabled while any row is invalid).
export const isRowInvalid = (row) => REQUIRED_PRODUCT_FIELD_KEYS.some((key) => !String(row[key] || "").trim());

// A non-empty Lead Time whose unit isn't one of our options (e.g. "10
// Fortnights") — mirrors the Review step's own parsing (see parseLeadTime in
// ReviewStep.jsx) just enough to flag it without duplicating that UI logic.
const LEAD_TIME_UNIT_PATTERN = /^[\d,.]+\s*(days?|weeks?|months?)$/i;
const hasUnrecognizedLeadTimeUnit = (row) => {
  const value = String(row.leadTime || "").trim();
  return !!value && !LEAD_TIME_UNIT_PATTERN.test(value);
};

// Broader than `isRowInvalid` — also flags rows that skipped the AI
// normalization pass (see `__skippedNormalization`, set by BulkUploadNewPage
// when the "Skip Process" control or an interrupted normalization leaves a
// row un-cleaned) or have a Lead Time unit we don't recognize. These rows
// aren't necessarily missing any required field (so they don't block
// import), but still need a human look before the user can be confident in
// them. Used by the Review step's "needs attention" filter/counter;
// import-blocking logic keeps using `isRowInvalid` as-is.
export const rowNeedsAttention = (row) =>
  isRowInvalid(row) ||
  !!row.__skippedNormalization ||
  hasUnrecognizedLeadTimeUnit(row) ||
  Object.keys(row.__truncatedFields || {}).length > 0;

// Flags rows whose SKU or Name repeats (case-insensitive, trimmed) elsewhere
// in the same batch — recomputed live as rows change. Blank values never
// count as duplicates of each other. Returns { [rowId]: { sku: bool, name:
// bool } }, only including rows that actually have a duplicate on at least
// one field.
export const findDuplicateRowFields = (rows) => {
  const list = rows || [];
  const countValues = (key) => {
    const counts = new Map();
    list.forEach((row) => {
      const value = String(row[key] || "").trim().toLowerCase();
      if (!value) return;
      counts.set(value, (counts.get(value) || 0) + 1);
    });
    return counts;
  };
  const skuCounts = countValues("sku");
  const nameCounts = countValues("name");

  const result = {};
  list.forEach((row) => {
    const sku = String(row.sku || "").trim().toLowerCase();
    const name = String(row.name || "").trim().toLowerCase();
    const dupSku = !!sku && skuCounts.get(sku) > 1;
    const dupName = !!name && nameCounts.get(name) > 1;
    if (dupSku || dupName) {
      result[row.__rowId] = { sku: dupSku, name: dupName };
    }
  });
  return result;
};

export const NOT_MAPPED = "__not_mapped__";

export const STATUS_OPTIONS = ["Active", "Inactive"];

// Best-effort normalization for the Status field — maps common truthy/falsy
// spellings from an uploaded file to the canonical "Active"/"Inactive"
// values. Anything unrecognized is left as-is so it still surfaces as an
// invalid row (missing/unmatched required field) for manual fixing.
const ACTIVE_ALIASES = new Set(["active", "1", "yes", "true", "y"]);
const INACTIVE_ALIASES = new Set(["inactive", "0", "no", "false", "n"]);
export const normalizeStatusValue = (raw) => {
  const trimmed = String(raw ?? "").trim();
  if (!trimmed) return "Active";
  const norm = trimmed.toLowerCase();
  if (ACTIVE_ALIASES.has(norm)) return "Active";
  if (INACTIVE_ALIASES.has(norm)) return "Inactive";
  return trimmed;
};

// Backfills a missing/blank Status on rows that predate the field (e.g.
// seeded/saved drafts) so the Review step never shows an empty Status —
// it's always "Active" unless a source column explicitly mapped "Inactive".
export const withDefaultStatus = (rows) =>
  (rows || []).map((row) => ({ ...row, status: normalizeStatusValue(row.status) }));

// Strips everything except letters/digits so headers like "Weight (Kg)",
// "weight_kg", "Weight-KG" and "weight kg" all normalize to the same key.
const normalizeHeader = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]/g, "");

// Fuzzy-matches each product field against the parsed file's headers using
// synonym/label equality or substring containment on normalized strings.
// Used both to pre-fill the Source Column mapping and to compute the fixed
// AI Recommendation shown in the Mapping step (which does NOT change if the
// user later overrides the Source Column selection).
export const autoMatchHeaders = (headers) => {
  const normalizedHeaders = (headers || []).map((h) => ({ raw: h, norm: normalizeHeader(h) }));
  const result = {};

  PRODUCT_FIELDS_CONFIG.forEach((field) => {
    const candidates = [normalizeHeader(field.label), ...field.synonyms.map(normalizeHeader)];
    let bestMatch = null;

    // Exact match first.
    for (const h of normalizedHeaders) {
      if (candidates.includes(h.norm)) {
        bestMatch = h.raw;
        break;
      }
    }
    // Fall back to substring containment either direction.
    if (!bestMatch) {
      for (const h of normalizedHeaders) {
        if (candidates.some((c) => c && (h.norm.includes(c) || c.includes(h.norm)))) {
          bestMatch = h.raw;
          break;
        }
      }
    }
    result[field.key] = bestMatch || NOT_MAPPED;
  });

  return result;
};

// The system's base currency — Selling Price is always stored/displayed as a
// plain number under this currency (see the "IDR" prefix in the Review
// table). "Rp"/"IDR" prefixes in the source file are treated as already
// being the base currency and are stripped silently.
const BASE_CURRENCY_ALIASES = new Set(["rp", "idr"]);

// Any non-numeric prefix/symbol in front of the number (that isn't Rp/IDR)
// is treated as a foreign-currency signal — e.g. "$120", "USD 120", "€120".
// Returns the plain numeric string plus the detected currency label (or null
// when the value is already in the base currency / has no prefix at all).
const CURRENCY_PREFIX_PATTERN = /^\s*([^\d.,\s-]+)\s*(-?[\d.,]+)\s*$/;
export const extractSellingPriceCurrency = (raw) => {
  const str = String(raw ?? "").trim();
  const match = str.match(CURRENCY_PREFIX_PATTERN);
  if (!match) return { numeric: str, currency: null };
  const [, prefix, numeric] = match;
  const isBaseCurrency = BASE_CURRENCY_ALIASES.has(prefix.trim().toLowerCase());
  return { numeric, currency: isBaseCurrency ? null : prefix.trim() };
};

// Shared row-normalization logic used both by MappingStep (kept for
// reference/back-compat) and by the simulated background "Mapping"
// processing timer in bulkUploadsStore.js, which needs to build normalized
// rows from the raw parsed rows + chosen field mapping once the delay ends.
// Fields capped to 100 chars (Name/Category Name) — an uploaded file's value
// longer than this is silently truncated during normalization, with the row
// flagged via `__truncatedFields` so the Review step can surface an inline
// "Max. 100 characters. Extra text removed." error on the affected cell.
const TRUNCATED_FIELD_MAX_LENGTH = 100;
const TRUNCATABLE_FIELD_KEYS = new Set(["name", "categoryName"]);

export const normalizeMappedRows = (rawRows, mapping) => {
  const rows = rawRows || [];
  const fieldMapping = mapping || {};
  return rows.map((row, idx) => {
    const normalized = { __rowId: `row-${idx}-${Date.now()}` };
    const truncatedFields = {};
    PRODUCT_FIELDS_CONFIG.forEach((field) => {
      const sourceHeader = fieldMapping[field.key];
      let rawValue = sourceHeader && sourceHeader !== NOT_MAPPED ? row[sourceHeader] ?? "" : "";
      if (TRUNCATABLE_FIELD_KEYS.has(field.key) && String(rawValue).length > TRUNCATED_FIELD_MAX_LENGTH) {
        rawValue = String(rawValue).slice(0, TRUNCATED_FIELD_MAX_LENGTH);
        truncatedFields[field.key] = true;
      }
      if (field.key === "status") {
        normalized[field.key] = normalizeStatusValue(rawValue);
      } else if (field.key === "sellingPrice") {
        // The numeric value is kept as-is (no conversion) — a mismatched
        // currency is only flagged for the user to verify, on
        // `sellingPriceSourceCurrency`.
        const { numeric, currency } = extractSellingPriceCurrency(rawValue);
        normalized[field.key] = numeric;
        normalized.sellingPriceSourceCurrency = currency;
      } else {
        normalized[field.key] = rawValue;
      }
    });
    if (Object.keys(truncatedFields).length > 0) normalized.__truncatedFields = truncatedFields;
    return normalized;
  });
};

// Triggers a browser download of a blank CSV template — one column per
// product field, headers only — so users have a known-good starting point
// instead of guessing at the expected structure.
export const downloadProductTemplateCsv = () => {
  const headers = PRODUCT_FIELDS_CONFIG.map((f) => f.label);
  const exampleRow = PRODUCT_FIELDS_CONFIG.map((f) => f.example);
  const csvLines = [headers.join(","), exampleRow.join(",")];
  const blob = new Blob([csvLines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "labamu_product_upload_template.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Builds the Review-ready rows for a normalization pass, simulating the AI
// occasionally leaving the last `skipCount` rows un-cleaned — either because
// it randomly "ran out of tokens" mid-run, or because the user hit "Skip
// Process" partway through. Skipped rows are still mapped (so nothing goes
// missing) but flagged with `__skippedNormalization` so the Review step's
// "needs attention" filter picks them up even when otherwise valid.
export const buildNormalizationResult = (rawRows, mapping, skipCount = 0) => {
  const normalizedAll = normalizeMappedRows(rawRows, mapping);
  const effectiveSkip = Math.min(skipCount, normalizedAll.length);
  const skipStartIdx = normalizedAll.length - effectiveSkip;
  const rows = normalizedAll.map((row, idx) =>
    effectiveSkip > 0 && idx >= skipStartIdx ? { ...row, __skippedNormalization: true } : row
  );
  return {
    rows,
    stats: { total: normalizedAll.length, normalized: normalizedAll.length - effectiveSkip, skipped: effectiveSkip },
  };
};
