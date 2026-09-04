import React from "react";
import { GeneralModal } from "../../../components/modal/GeneralModal.jsx";
import { Button } from "../../../components/common/Button.jsx";
import { DownloadIcon, Info } from "../../../components/icons/Icons.jsx";
import { StatusBadge } from "../../../components/common/StatusBadge.jsx";
import { LabelValue } from "../../../components/molecules/LabelValue.jsx";

const STATUS_VARIANT = {
  Mapping: "orange",
  "Normalizing Data": "yellow",
  Review: "grey",
  Processing: "blue",
  Completed: "green",
  Cancelled: "red",
};

const formatDate = (iso) => {
  try {
    const d = new Date(iso);
    const pad = (n) => String(n).padStart(2, "0");
    const datePart = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const timePart = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
    return `${datePart}; ${timePart}`;
  } catch {
    return iso;
  }
};

const openSourceFile = (batch) => {
  const rows = batch.rows || batch.rawRows || [];
  const headers = rows.length
    ? Array.from(rows.reduce((set, row) => {
        Object.keys(row).forEach((k) => set.add(k));
        return set;
      }, new Set()))
    : ["fileName"];
  const csvLines = rows.length
    ? [
        headers.join(","),
        ...rows.map((row) => headers.map((h) => `"${String(row[h] ?? "").replace(/"/g, '""')}"`).join(",")),
      ]
    : [batch.fileName];
  const blob = new Blob([csvLines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank", "noopener,noreferrer");
  setTimeout(() => URL.revokeObjectURL(url), 30000);
};

const downloadFailedRowsCsv = (batch) => {
  const rows = batch.failedRows || [];
  if (rows.length === 0) return;
  const headers = Array.from(rows.reduce((set, row) => {
    Object.keys(row).forEach((k) => set.add(k));
    return set;
  }, new Set()));
  const csvLines = [
    headers.join(","),
    ...rows.map((row) => headers.map((h) => `"${String(row[h] ?? "").replace(/"/g, '""')}"`).join(",")),
  ];
  const blob = new Blob([csvLines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${batch.id}-failed-items.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Same shape/columns as the app's other activity-log lists (see e.g.
// PurchaseOrderDetailPage's "Activity Logs" section): Name / Email /
// Activity (title, plus the cancellation reason as a description line when
// present — every other log's desc is internal bookkeeping copy, not shown) /
// Timestamp.
const LogsSection = ({ logs }) => {
  const sorted = [...(logs || [])].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <span style={{ fontSize: "var(--text-title-2)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>
        Activity Logs
      </span>

      {sorted.length === 0 ? (
        <div style={{ padding: "16px 0", textAlign: "center", color: "var(--neutral-on-surface-tertiary)", fontSize: "14px" }}>
          No activity yet.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              paddingBottom: "12px",
              borderBottom: "1px solid var(--neutral-line-separator-1)",
              fontWeight: "var(--font-weight-bold)",
              fontSize: "var(--text-title-3)",
              color: "var(--neutral-on-surface-primary)",
            }}
          >
            <div style={{ flex: "1.1", minWidth: 0 }}>Name</div>
            <div style={{ flex: "1.6", minWidth: 0 }}>Email</div>
            <div style={{ flex: "2.4", minWidth: 0 }}>Activity</div>
            <div style={{ width: "150px", flexShrink: 0 }}>Timestamp</div>
          </div>

          {sorted.map((log, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                alignItems: "flex-start",
                padding: "14px 0",
                borderBottom: idx === sorted.length - 1 ? "none" : "1px solid var(--neutral-line-separator-1)",
                fontSize: "var(--text-title-3)",
              }}
            >
              <div style={{ flex: "1.1", minWidth: 0, paddingRight: "8px", overflowWrap: "break-word", wordBreak: "break-word", color: "var(--neutral-on-surface-primary)" }}>{log.name}</div>
              <div style={{ flex: "1.6", minWidth: 0, paddingRight: "8px", overflowWrap: "break-word", wordBreak: "break-word", color: "var(--neutral-on-surface-primary)" }}>{log.email || "—"}</div>
              <div style={{ flex: "2.4", minWidth: 0, paddingRight: "8px", display: "flex", flexDirection: "column", gap: log.title === "Upload Cancelled" && log.desc ? "6px" : "0" }}>
                <span style={{ overflowWrap: "break-word", wordBreak: "break-word", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>
                  {log.title}
                </span>
                {/* Only the cancellation reason is surfaced here — every other
                    log's `desc` is internal bookkeeping copy (e.g. "File X
                    was uploaded"), not something the user needs repeated
                    back to them. */}
                {log.title === "Upload Cancelled" && log.desc && (
                  <span style={{ overflowWrap: "break-word", wordBreak: "break-word", color: "var(--neutral-on-surface-secondary)", fontWeight: "var(--font-weight-regular)", lineHeight: "1.5" }}>
                    {log.desc}
                  </span>
                )}
              </div>
              <div style={{ width: "150px", flexShrink: 0, color: "var(--neutral-on-surface-secondary)", fontSize: "13px" }}>
                {formatDate(log.timestamp)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const BulkUploadDetailModal = ({ isOpen, onClose, batch }) => {
  if (!batch) return null;

  return (
    <GeneralModal
      isOpen={isOpen}
      onClose={onClose}
      title="Bulk Upload Detail"
      width="880px"
      footer={
        batch.failedCount > 0 && (
          <Button variant="secondary" size="large" leftIcon={DownloadIcon} onClick={() => downloadFailedRowsCsv(batch)} style={{ flex: 1 }}>
            Download Invalid Data
          </Button>
        )
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {batch.status === "Processing" && (
          <div
            style={{
              display: "flex",
              gap: "12px",
              alignItems: "flex-start",
              padding: "12px 16px",
              borderRadius: "var(--radius-card)",
              background: "var(--feature-brand-container-lighter)",
            }}
          >
            <Info size={20} color="var(--feature-brand-primary)" style={{ flexShrink: 0, marginTop: "2px" }} />
            <span style={{ fontSize: "14px", color: "var(--neutral-on-surface-primary)" }}>
              <strong>Import in progress:</strong> Your products are being added to the product catalog. We’ll notify you by email when it’s complete.
            </span>
          </div>
        )}

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            padding: "16px",
            borderRadius: "var(--radius-card)",
            border: "1px solid var(--neutral-line-separator-1)",
          }}
        >
          {/* One shared 5-column grid (not two separate ones) so the second
              row lines up under the first — both start at column 1 (Upload
              ID / Data in File), since the first row exactly fills all 5
              columns and CSS grid auto-wraps the next item to a new row. */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "16px" }}>
            <LabelValue label="Upload ID" value={batch.id} />
            <div style={{ display: "flex", flexDirection: "column", gap: "4px", minWidth: 0 }}>
              <span style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-secondary)" }}>File Name</span>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  openSourceFile(batch);
                }}
                style={{
                  fontSize: "var(--text-title-3)",
                  fontWeight: "var(--font-weight-bold)",
                  color: "var(--feature-brand-primary)",
                  textDecoration: "underline",
                  overflowWrap: "break-word",
                  wordBreak: "break-word",
                  cursor: "pointer",
                }}
              >
                {batch.fileName}
              </a>
            </div>
            <LabelValue label="Created At" value={formatDate(batch.createdAt)} />
            <LabelValue label="Created By" value={batch.createdBy} />
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", minWidth: 0 }}>
              <span style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-secondary)" }}>Status</span>
              <div>
                <StatusBadge variant={STATUS_VARIANT[batch.status] || "grey"}>{batch.status}</StatusBadge>
              </div>
            </div>

            {/* "Data in File" = the original parsed row count before any Review
                edits (rawRows, set once at Mapping); falls back to the seeded
                sourceRowCount, then to the reviewed count for older records
                that have neither. "Data after Review" is that reviewed count
                (the field this modal used to just call "Total Data"). */}
            <LabelValue label="Data in File" value={batch.rawRows?.length ?? batch.sourceRowCount ?? batch.totalProducts} />
            <LabelValue label="Data after Review" value={batch.totalProducts} />
            <LabelValue label="Imported Data" value={batch.successCount} />
            <LabelValue label="Invalid Data" value={batch.failedCount} />
          </div>
        </div>

        <LogsSection logs={batch.logs} />
      </div>
    </GeneralModal>
  );
};
