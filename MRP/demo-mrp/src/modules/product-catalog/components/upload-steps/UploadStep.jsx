import React from "react";
import { DownloadIcon, CloudUploadIcon } from "../../../../components/icons/Icons.jsx";
import { Button } from "../../../../components/common/Button.jsx";
import { DocumentUploadField } from "../../../../ce-ui";
import { PRODUCT_FIELDS_CONFIG } from "../../mock/productFieldsConfig.js";

// Naive CSV line/field splitter — good enough for the demo's plain-JS
// constraint (no papaparse/xlsx). Handles simple double-quoted fields that
// may contain commas; anything more exotic (embedded newlines inside a
// quoted field, escaped quotes) is out of scope.
const parseCsvLine = (line) => {
  const cells = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      cells.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  cells.push(current.trim());
  return cells;
};

// Mirrors how a browser/OS names a second download with the same file name:
// the first occurrence of a header keeps its name as-is, later occurrences of
// the same (case-sensitive) name get " (1)", " (2)", etc. appended. A blank
// header name is treated as "Untitled Column" before dedup, so two blank
// headers in the same file become "Untitled Column" and "Untitled Column (1)".
export const dedupeHeaders = (rawHeaders) => {
  const seenCounts = {};
  return rawHeaders.map((raw) => {
    const base = raw && raw.trim() ? raw : "Untitled Column";
    const count = seenCounts[base] ?? 0;
    seenCounts[base] = count + 1;
    return count === 0 ? base : `${base} (${count})`;
  });
};

const parseCsvText = (text) => {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return { headers: [], rows: [] };
  const headers = dedupeHeaders(parseCsvLine(lines[0]));
  const rows = lines.slice(1).map((line) => {
    const cells = parseCsvLine(line);
    const row = {};
    headers.forEach((h, idx) => {
      row[h] = cells[idx] ?? "";
    });
    return row;
  });
  return { headers, rows };
};

// .xlsx/.xls can't be parsed client-side without a library, so we simulate a
// plausible parsed result (canned headers/rows built from the product field
// examples) so the rest of the wizard flow still works end-to-end.
const buildSimulatedXlsxData = () => {
  const headers = PRODUCT_FIELDS_CONFIG.filter((f) => f.key !== "sku").map((f) => f.label);
  const rowCount = 6;
  const rows = Array.from({ length: rowCount }).map((_, i) => {
    const row = {};
    PRODUCT_FIELDS_CONFIG.filter((f) => f.key !== "sku").forEach((f) => {
      row[f.label] = f.key === "name" ? `${f.example} ${i + 1}` : f.example;
    });
    return row;
  });
  return { headers, rows };
};

// Runs the (simulated, ~3.5s) file analysis and calls back with
// (headers, rows, fileName), or `onEmpty()` when a CSV genuinely has no data
// rows. Exported so the parent page can drive this from its own fixed
// "Analyze File" footer button. Returns a `cancel()` function so the caller
// can abandon a pending analysis (e.g. the demo "Simulate" controls below)
// without a late callback firing afterwards.
export const analyzeFile = (file, onDone, onEmpty) => {
  const isCsv = /\.csv$/i.test(file.name);
  let cancelled = false;

  const timeoutId = setTimeout(() => {
    if (isCsv) {
      const reader = new FileReader();
      reader.onload = () => {
        if (cancelled) return;
        const { headers, rows } = parseCsvText(String(reader.result || ""));
        if (rows.length === 0) {
          onEmpty?.();
        } else {
          onDone(headers, rows, file.name);
        }
      };
      reader.onerror = () => {
        if (cancelled) return;
        const { headers, rows } = buildSimulatedXlsxData();
        onDone(headers, rows, file.name);
      };
      reader.readAsText(file);
    } else {
      // .xlsx / .xls — simulated parse (see buildSimulatedXlsxData above).
      const { headers, rows } = buildSimulatedXlsxData();
      onDone(headers, rows, file.name);
    }
  }, 3500);

  return () => {
    cancelled = true;
    clearTimeout(timeoutId);
  };
};

export const UploadStep = ({ selectedFile, onFileSelected, isAnalyzing, error, onDownloadTemplate, onSimulateAnalyzeFailure }) => {
  if (isAnalyzing) {
    return (
      <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px", padding: "80px 24px", minHeight: "420px" }}>
        {/* Same icon-in-circle + spinning border treatment as
            BackgroundProcessingScreen, so the Analyzing/Normalizing/Importing
            interstitials all read as one consistent "processing" motif. */}
        <div
          style={{
            width: "72px",
            height: "72px",
            borderRadius: "50%",
            background: "var(--feature-brand-container-lighter)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <CloudUploadIcon size={32} color="var(--feature-brand-primary)" />
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              border: "3px solid var(--neutral-line-separator-2)",
              borderTopColor: "var(--feature-brand-primary)",
              animation: "pc-spin 1s linear infinite",
            }}
          />
        </div>
        <style>{`@keyframes pc-spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", textAlign: "center" }}>
          <span style={{ fontSize: "var(--text-title-2)", fontWeight: "var(--font-weight-bold)" }}>
            Analyzing your file...
          </span>
          <span style={{ fontSize: "14px", color: "var(--neutral-on-surface-secondary)", maxWidth: "360px" }}>
            We're reading your file and getting it ready for column mapping. This usually takes a few seconds.
          </span>
        </div>

        {onSimulateAnalyzeFailure && (
          <div
            style={{
              position: "absolute",
              bottom: "16px",
              right: "16px",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: "6px",
              padding: "10px",
              borderRadius: "var(--radius-card)",
              border: "1px dashed var(--neutral-line-separator-2)",
              background: "var(--neutral-surface-grey-lighter)",
            }}
          >
            <span style={{ fontSize: "11px", color: "var(--neutral-on-surface-tertiary)" }}>Demo: simulate a failure</span>
            <div style={{ display: "flex", gap: "8px" }}>
              <Button size="small" variant="outlined" onClick={() => onSimulateAnalyzeFailure("timeout")}>
                Simulate Timeout
              </Button>
              <Button size="small" variant="outlined" onClick={() => onSimulateAnalyzeFailure("empty")}>
                Simulate Empty File
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  const uploadedDocs = selectedFile
    ? [{ id: "pc-upload-file", file: selectedFile, name: selectedFile.name, description: "" }]
    : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", padding: "24px", width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <span style={{ fontSize: "var(--text-title-2)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>
            Import Products
          </span>
          <span style={{ fontSize: "14px", color: "var(--neutral-on-surface-secondary)" }}>
            Upload your product file in any spreadsheet format. We'll map and prepare the data for your product catalog.
          </span>
        </div>
        <Button variant="outlined" leftIcon={DownloadIcon} onClick={onDownloadTemplate} style={{ flexShrink: 0 }}>
          Download Template
        </Button>
      </div>

      <DocumentUploadField
        files={uploadedDocs}
        maxFiles={1}
        maxSizeMB={25}
        accept=".csv,.xlsx,.xls"
        showDescription={false}
        formatsHint="Allowed formats (.csv, .xlsx, .xls)"
        error={error}
        onAdd={(files) => files[0] && onFileSelected(files[0])}
        onRemove={() => onFileSelected(null)}
      />
    </div>
  );
};
