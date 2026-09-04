import React, { useEffect, useRef, useState } from "react";
import { CloseIcon, AddIcon, DeleteIcon, Info } from "../../../components/icons/Icons.jsx";
import { Button } from "../../../components/common/Button.jsx";
import { IconButton } from "../../../components/common/IconButton.jsx";
import { StatusBadge } from "../../../components/common/StatusBadge.jsx";
import { GeneralModal } from "../../../components/modal/GeneralModal.jsx";
import { DropdownSelect } from "../../../components/common/DropdownSelect.jsx";
import { InputField } from "../../../components/molecules/InputField.jsx";
import { ROW_STATUS_META, deriveRowStatusKey, totalAvailable } from "../mock/materialRequestMocks.js";

const thStyle = (overrides = {}) => ({
  padding: "16px 12px",
  textAlign: "left",
  fontWeight: "var(--font-weight-bold)",
  fontSize: "var(--text-title-3)",
  color: "var(--neutral-on-surface-primary)",
  whiteSpace: "nowrap",
  background: "var(--neutral-surface-primary)",
  position: "sticky",
  top: 0,
  zIndex: 5,
  // keeps the header separator visible while the body scrolls under it
  boxShadow: "inset 0 -1px 0 var(--neutral-line-separator-1)",
  ...overrides,
});

const tdStyle = (overrides = {}) => ({
  padding: "16px 12px",
  verticalAlign: "top",
  fontSize: "var(--text-title-3)",
  color: "var(--neutral-on-surface-primary)",
  ...overrides,
});

// Distribute the requested qty across available batches (used to prefill).
const prefillLines = (it) => {
  let remaining = it.requestedQty;
  const lines = [];
  for (const b of it.availableBatches) {
    if (remaining <= 0) break;
    const take = Math.min(b.available, remaining);
    lines.push({ batch: b.batch, qty: take });
    remaining -= take;
  }
  return lines;
};

// Compact, grouped list of transfer-time stock issues (Expired / Stock Changes).
// Each column groups batches under their material so many entries stay readable.
const IssueColumn = ({ label, groups, renderBatch }) => {
  // Count the leaf batch entries so the header reads e.g. "5 Expired Materials:".
  const count = groups.reduce((n, g) => n + g.batches.length, 0);
  // Show a bottom fade while there's more content to scroll into view.
  const scrollRef = useRef(null);
  const [showFade, setShowFade] = useState(false);
  const updateFade = () => {
    const el = scrollRef.current;
    if (el) setShowFade(el.scrollHeight - el.scrollTop - el.clientHeight > 4);
  };
  useEffect(() => {
    updateFade();
  }, [groups]);
  return (
    <div
      style={{
        flex: "1 1 320px",
        minWidth: 0,
        display: "flex",
        gap: "10px",
        border: "1px solid var(--status-orange-primary)",
        background: "var(--status-orange-container)",
        borderRadius: "var(--radius-card)",
        padding: "16px 20px",
      }}
    >
      <Info size={18} color="var(--status-orange-primary)" style={{ flexShrink: 0, marginTop: "2px" }} />
      <div
        style={{
          minWidth: 0,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "6px",
          color: "var(--status-orange-primary)",
          fontSize: "var(--text-title-3)",
          lineHeight: 1.5,
        }}
      >
        <span style={{ fontWeight: "var(--font-weight-bold)" }}>
          {count} {label}
        </span>
        {/* Long lists scroll inside the box so the section keeps a fixed height. */}
        <div style={{ position: "relative", minWidth: 0 }}>
          <div
            ref={scrollRef}
            onScroll={updateFade}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              maxHeight: "200px",
              overflowY: "auto",
              paddingRight: "4px",
            }}
          >
            {groups.map((g, gi) => (
              <div key={gi} style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <div style={{ display: "flex", gap: "6px" }}>
                  <span>&bull;</span>
                  <span>{g.name}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "2px", paddingLeft: "18px" }}>
                  {g.batches.map((b, bi) => (
                    <div key={bi} style={{ display: "flex", gap: "6px" }}>
                      <span>&bull;</span>
                      <span>{renderBatch(b)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {/* Bottom fade cue — only while more rows remain below the fold. */}
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: "40px",
              pointerEvents: "none",
              opacity: showFade ? 1 : 0,
              transition: "opacity 0.15s ease",
              background:
                "linear-gradient(to bottom, rgba(255, 244, 230, 0), var(--status-orange-container))",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export const MaterialPreparationDrawer = ({
  isOpen,
  onClose,
  items = [],
  onConfirm,
  showSnackbar,
  // When opened via the transfer "Review Stock" flow, groups the expired/changed
  // materials so the preparer can re-allocate with the corrected stock.
  // Shape: { expired: [{ name, sku, batches }], changed: [{ name, sku, batches }] }.
  transferIssues = { expired: [], changed: [] },
  // Label for the review-step primary button ("Start Preparing" / "Start Re-Preparing").
  confirmLabel = "Start Preparing",
}) => {
  // Working copy of the items so the batch stock can be swapped in-place when the
  // user refreshes after a stock allocation conflict.
  const [workItems, setWorkItems] = useState(items);
  const [rows, setRows] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [step, setStep] = useState("edit"); // "edit" | "review"
  const [conflictOpen, setConflictOpen] = useState(false);
  const [conflictResolved, setConflictResolved] = useState(false);

  // This request triggers a stock allocation conflict on the first "Start Preparing".
  const hasConflictData = items.some((it) => Array.isArray(it.updatedBatches));

  useEffect(() => {
    if (!isOpen) return;
    setSubmitted(false);
    setStep("edit");
    setConflictOpen(false);
    setConflictResolved(false);
    setWorkItems(items);
    setRows(items.map((it) => ({ lines: prefillLines(it), reason: "" })));
  }, [isOpen, items]);

  const readOnly = step === "review";

  const updateRow = (idx, patch) =>
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));

  const updateLine = (rowIdx, lineIdx, patch) =>
    setRows((prev) =>
      prev.map((r, i) =>
        i === rowIdx
          ? { ...r, lines: r.lines.map((l, j) => (j === lineIdx ? { ...l, ...patch } : l)) }
          : r
      )
    );

  const addLine = (rowIdx, firstUnusedBatch) =>
    setRows((prev) =>
      prev.map((r, i) =>
        i === rowIdx ? { ...r, lines: [...r.lines, { batch: firstUnusedBatch, qty: 0 }] } : r
      )
    );

  const removeLine = (rowIdx, lineIdx) =>
    setRows((prev) =>
      prev.map((r, i) =>
        i === rowIdx ? { ...r, lines: r.lines.filter((_, j) => j !== lineIdx) } : r
      )
    );

  const computed = workItems.map((it, idx) => {
    const row = rows[idx] || { lines: [], reason: "" };
    const total = row.lines.reduce((sum, l) => sum + (Number(l.qty) || 0), 0);
    const shortageQty = Math.max(it.requestedQty - total, 0);
    const rowStatusKey = deriveRowStatusKey(it.requestedQty, total);
    const exceeds = total > it.requestedQty;
    // Per-line: the entered qty must not exceed the selected batch's available stock.
    const lineBatchMax = row.lines.map(
      (l) => it.availableBatches.find((b) => b.batch === l.batch)?.available ?? 0
    );
    const lineOverBatch = row.lines.map((l, i) => (Number(l.qty) || 0) > lineBatchMax[i]);
    const hasBatchError = lineOverBatch.some(Boolean);
    return {
      ...row,
      total,
      shortageQty,
      rowStatusKey,
      needsReason: shortageQty > 0,
      exceeds,
      lineBatchMax,
      lineOverBatch,
      hasBatchError,
    };
  });

  const hasInvalid = computed.some(
    (c) => (c.needsReason && !c.reason.trim()) || c.exceeds || c.hasBatchError
  );

  const handleReview = () => {
    if (hasInvalid) {
      setSubmitted(true);
      return;
    }
    setStep("review");
  };

  const handleConfirm = () => {
    if (hasInvalid) {
      setSubmitted(true);
      return;
    }
    // First confirmation on a conflicting request surfaces the stock allocation
    // conflict instead of proceeding.
    if (hasConflictData && !conflictResolved) {
      setConflictOpen(true);
      return;
    }
    const preparedItems = computed.map((c) => ({
      fulfillableQty: c.total,
      shortageQty: c.shortageQty,
      // Only keep the shortage reason when there is an actual shortage.
      reason: c.shortageQty > 0 ? c.reason.trim() : "",
      batches: c.lines
        .filter((l) => l.batch && Number(l.qty) > 0)
        .map((l) => ({ batch: l.batch, qty: Number(l.qty) })),
    }));
    onConfirm(preparedItems);
  };

  // Swap in the refreshed batch stock, re-prefill, and return to the first step.
  const handleRefreshData = () => {
    const refreshed = workItems.map((it) =>
      Array.isArray(it.updatedBatches) ? { ...it, availableBatches: it.updatedBatches } : it
    );
    setWorkItems(refreshed);
    setRows(refreshed.map((it) => ({ lines: prefillLines(it), reason: "" })));
    setConflictResolved(true);
    setConflictOpen(false);
    setSubmitted(false);
    setStep("edit");
    showSnackbar?.("Material batch successfully updated", "success");
  };

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          zIndex: 6000,
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
          transition: "opacity 0.25s ease",
        }}
      />
      <div
        style={{
          position: "fixed",
          top: 0,
          // Animate via `right` (not `transform`) — a transformed ancestor would
          // break the fixed-positioned dropdown menus rendered inside the drawer.
          right: isOpen ? "0" : "-1220px",
          height: "100vh",
          width: "1200px",
          maxWidth: "100vw",
          background: "var(--neutral-surface-primary)",
          zIndex: 6001,
          boxShadow: "var(--elevation-sm)",
          transition: "right 0.28s ease",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "24px",
            borderBottom: "1px solid var(--neutral-line-separator-1)",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "16px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <h2 style={{ margin: 0, fontSize: "var(--text-headline)", fontWeight: "var(--font-weight-bold)" }}>
              Material Preparation
            </h2>
            <p style={{ margin: 0, fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-secondary)" }}>
              By continuing, you confirm the allocated materials and will begin preparing items as shown
            </p>
          </div>
          <IconButton
            icon={CloseIcon}
            size="large"
            onClick={onClose}
            color="var(--neutral-on-surface-primary)"
          />
        </div>

        {/* Body (single scroll container so the sticky header tracks vertical scroll) */}
        <div style={{ flex: 1, overflow: "auto", padding: "0 24px" }}>
          {(transferIssues.expired?.length > 0 || transferIssues.changed?.length > 0) && (
            <div style={{ marginTop: "20px", display: "flex", gap: "16px", flexWrap: "wrap" }}>
              {transferIssues.expired?.length > 0 && (
                <IssueColumn
                  label="Expired Materials:"
                  groups={transferIssues.expired}
                  renderBatch={(b) => (
                    <>
                      {b.batch} ({b.qty} {b.unit}) -{" "}
                      <b>Expired on {b.expiredOn}</b>
                    </>
                  )}
                />
              )}
              {transferIssues.changed?.length > 0 && (
                <IssueColumn
                  label="Stock Changes:"
                  groups={transferIssues.changed}
                  renderBatch={(b) => (
                    <>
                      {b.batch} (
                      <b>
                        {b.previous} {b.unit} &rarr; {b.current} {b.unit}
                      </b>
                      )
                    </>
                  )}
                />
              )}
            </div>
          )}
          <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
            <thead>
              <tr>
                <th style={thStyle({ width: "44px" })}>No</th>
                <th style={thStyle({ width: "84px" })}>Type</th>
                <th style={thStyle({ width: "280px" })}>Material</th>
                <th style={thStyle({ width: "120px" })}>Requested Qty</th>
                <th style={thStyle({ width: "356px" })}>Fulfillable Qty</th>
                <th style={thStyle({ width: "96px" })}>Shortage Qty</th>
                <th style={thStyle({ width: "120px" })}>Status</th>
              </tr>
            </thead>
            <tbody>
              {workItems.map((it, idx) => {
                const c = computed[idx] || { lines: [], reason: "" };
                const meta = ROW_STATUS_META[c.rowStatusKey] || ROW_STATUS_META.not_started;
                const stock = totalAvailable(it.availableBatches);
                const reasonError = submitted && c.needsReason && !c.reason.trim();
                const usedBatches = c.lines.map((l) => l.batch);
                const unusedBatches = it.availableBatches.filter((b) => !usedBatches.includes(b.batch));
                const reasonLabel = it.exceedingReason
                  ? "Exceeding reason:"
                  : it.requestReason
                  ? "Request reason:"
                  : null;
                const reasonValue = it.exceedingReason || it.requestReason;
                const notesValue = it.exceedingNotes || it.requestNotes;
                return (
                  <React.Fragment key={idx}>
                    <tr style={{ borderBottom: reasonLabel ? "none" : "1px solid var(--neutral-line-separator-1)" }}>
                      <td style={tdStyle({ color: "var(--neutral-on-surface-secondary)" })}>{idx + 1}</td>
                      <td style={tdStyle()}>
                        <StatusBadge variant={it.type === "BOM" ? "blue-light" : "grey-light"}>
                          {it.type}
                        </StatusBadge>
                      </td>
                      <td style={tdStyle()}>
                        <div style={{ fontWeight: "var(--font-weight-semi-bold)" }}>{it.name}</div>
                        <div style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-secondary)", marginTop: "2px" }}>
                          {it.sku}
                        </div>
                      </td>
                      <td style={tdStyle()}>
                        {it.requestedQty} {it.unit}
                      </td>
                      <td style={tdStyle()}>
                        {readOnly ? (
                          /* ---- Review (view-only) ---- */
                          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            {c.total > 0 ? (
                              <>
                                <span style={{ color: "var(--status-green-primary)" }}>
                                  {c.total} {it.unit}
                                </span>
                                {c.lines
                                  .filter((l) => l.batch && Number(l.qty) > 0)
                                  .map((l, i) => (
                                    <span
                                      key={i}
                                      style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-secondary)" }}
                                    >
                                      {l.batch}:{" "}
                                      <b style={{ color: "var(--neutral-on-surface-primary)" }}>
                                        {l.qty} {it.unit}
                                      </b>
                                    </span>
                                  ))}
                              </>
                            ) : (
                              <span style={{ color: "var(--neutral-on-surface-tertiary)" }}>-</span>
                            )}
                            {c.needsReason && c.reason && (
                              <div
                                style={{
                                  marginTop: "8px",
                                  fontSize: "var(--text-body)",
                                  color: "var(--neutral-on-surface-secondary)",
                                }}
                              >
                                <span style={{ fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>
                                  Shortage Reason:{" "}
                                </span>
                                {c.reason}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            {stock <= 0 ? (
                              <span style={{ color: "var(--neutral-on-surface-tertiary)" }}>No stock available</span>
                            ) : (
                              <>
                            {c.lines.map((line, lineIdx) => {
                              const batchMeta = it.availableBatches.find((b) => b.batch === line.batch);
                              const lineMax = batchMeta?.available ?? 0;
                              // options = this line's batch + any batches not used elsewhere
                              const options = it.availableBatches
                                .filter((b) => b.batch === line.batch || !usedBatches.includes(b.batch))
                                .map((b) => ({ value: b.batch, label: `${b.batch} (${b.available} ${it.unit})` }));
                              return (
                                <div key={lineIdx} style={{ display: "flex", alignItems: "flex-start", gap: "8px", minWidth: 0 }}>
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <DropdownSelect
                                      value={line.batch}
                                      onChange={(val) => updateLine(idx, lineIdx, { batch: val })}
                                      options={options}
                                      placeholder="Select batch"
                                      fieldHeight="48px"
                                      fontSize="var(--text-title-3)"
                                    />
                                  </div>
                                  <div style={{ width: "112px", flexShrink: 0 }}>
                                    <InputField
                                      type="number"
                                      value={String(line.qty ?? "")}
                                      onChange={(e) => {
                                        const next = Math.max(0, Number(e.target.value) || 0);
                                        updateLine(idx, lineIdx, { qty: next });
                                      }}
                                      placeholder="Qty"
                                      suffix={it.unit}
                                      error={
                                        submitted && c.lineOverBatch?.[lineIdx]
                                          ? `Exceeds batch qty (${lineMax})`
                                          : undefined
                                      }
                                      errorState={submitted && c.exceeds}
                                    />
                                  </div>
                                  <IconButton
                                    icon={DeleteIcon}
                                    size="large"
                                    onClick={() => removeLine(idx, lineIdx)}
                                    color="var(--status-red-primary)"
                                  />
                                </div>
                              );
                            })}

                            {c.lines.length === 0 && (
                              <span style={{ color: "var(--neutral-on-surface-tertiary)" }}>
                                No batch selected
                              </span>
                            )}

                            {(unusedBatches.length > 0 || (submitted && c.exceeds)) && (
                              // Mirrors the batch-line layout (select / qty / delete) so the
                              // message lines up with the qty column — same as "Exceeds batch qty".
                              <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  {unusedBatches.length > 0 && (
                                    <Button
                                      variant="tertiary"
                                      size="sm"
                                      leftIcon={AddIcon}
                                      disabled={c.shortageQty <= 0}
                                      onClick={() => addLine(idx, unusedBatches[0].batch)}
                                    >
                                      Add Batch
                                    </Button>
                                  )}
                                </div>
                                <div style={{ width: "112px", flexShrink: 0 }}>
                                  {submitted && c.exceeds && (
                                    <span
                                      style={{
                                        whiteSpace: "nowrap",
                                        color: "var(--status-red-primary)",
                                        fontSize: "var(--text-body)",
                                      }}
                                    >
                                      Exceeds requested qty
                                    </span>
                                  )}
                                </div>
                                <div style={{ width: "50px", flexShrink: 0 }} />
                              </div>
                            )}
                              </>
                            )}

                            {c.needsReason && (
                              <div style={{ marginTop: "10px" }}>
                                <InputField
                                  label="Shortage Reason"
                                  required
                                  multiline
                                  maxLength={400}
                                  headerRight={`${c.reason.length}/400`}
                                  value={c.reason}
                                  onChange={(e) => updateRow(idx, { reason: e.target.value })}
                                  placeholder="Explain why the request cannot be fully fulfilled"
                                  error={reasonError ? "Field cannot be empty" : undefined}
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                      <td style={tdStyle()}>
                        {c.shortageQty > 0 ? (
                          <span style={{ color: "var(--status-red-primary)" }}>
                            {c.shortageQty} {it.unit}
                          </span>
                        ) : (
                          <span style={{ color: "var(--neutral-on-surface-primary)" }}>
                            0 {it.unit}
                          </span>
                        )}
                      </td>
                      <td style={tdStyle()}>
                        <StatusBadge variant={`${meta.badge}-light`}>{meta.label}</StatusBadge>
                      </td>
                    </tr>
                    {reasonLabel && (
                      <tr style={{ borderBottom: "1px solid var(--neutral-line-separator-1)", background: "var(--status-orange-container)" }}>
                        <td style={{ borderLeft: "3px solid var(--status-orange-primary)" }} />
                        <td colSpan={2} style={{ padding: "12px 12px", fontSize: "var(--text-title-3)", lineHeight: 1.6, verticalAlign: "top" }}>
                          <span style={{ fontWeight: "var(--font-weight-bold)" }}>{reasonLabel} </span>
                          {reasonValue}
                        </td>
                        <td colSpan={4} style={{ padding: "12px 12px", fontSize: "var(--text-title-3)", lineHeight: 1.6, verticalAlign: "top" }}>
                          {notesValue && (
                            <>
                              <span style={{ fontWeight: "var(--font-weight-bold)" }}>Notes: </span>
                              {notesValue}
                            </>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "16px 24px",
            borderTop: "1px solid var(--neutral-line-separator-1)",
            boxShadow: "var(--elevation-sticky)",
            display: "flex",
            gap: "12px",
          }}
        >
          {readOnly ? (
            <>
              <Button variant="outlined" size="xl" onClick={() => setStep("edit")} style={{ flex: 1 }}>
                Back
              </Button>
              <Button size="xl" onClick={handleConfirm} style={{ flex: 1 }}>
                {confirmLabel}
              </Button>
            </>
          ) : (
            <Button size="xl" onClick={handleReview} style={{ width: "100%" }}>
              Review Material Preparation
            </Button>
          )}
        </div>
      </div>

      {/* Stock allocation conflict — rendered above the drawer (zIndex > 6001). */}
      <GeneralModal
        isOpen={conflictOpen}
        onClose={() => setConflictOpen(false)}
        title="Stock Allocation Conflict"
        description="Some materials are no longer available. Please refresh the updated stock before continuing."
        zIndex={7000}
        footer={
          <Button size="lg" onClick={handleRefreshData} style={{ width: "100%" }}>
            Refresh Data
          </Button>
        }
      />
    </>
  );
};
