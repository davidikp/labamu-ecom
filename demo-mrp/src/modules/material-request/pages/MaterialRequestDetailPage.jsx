import React, { useState } from "react";
import { ChevronLeftIcon, Info } from "../../../components/icons/Icons.jsx";
import { Button } from "../../../components/common/Button.jsx";
import { StatusBadge } from "../../../components/common/StatusBadge.jsx";
import { Tooltip } from "../../../components/common/Tooltip.jsx";
import { DropdownSelect } from "../../../components/common/DropdownSelect.jsx";
import { GeneralModal } from "../../../components/modal/GeneralModal.jsx";
import { InputField } from "../../../components/molecules/InputField.jsx";
import { UploadDropzone } from "../../../components/molecules/UploadDropzone.jsx";
import { UploadDescriptionCard } from "../../purchase-order/components/detail/shared/PoDetailSharedComponents.jsx";
import { MaterialPreparationDrawer } from "../components/MaterialPreparationDrawer.jsx";
import {
  getRequest,
  getRequests,
  applyPreparation,
  applyRePreparation,
  setRequestStatus,
  getTransferConflict,
  buildTransferIssues,
  buildTransferDrawerItems,
  REQUEST_STATUS_META,
  ROW_STATUS_META,
} from "../mock/materialRequestMocks.js";

// Title/description for the Start Transfer stock conflict modal, by conflict kind.
const TRANSFER_CONFLICT_META = {
  expired: {
    title: "Some materials are expired",
    description: "Review your stock to avoid incorrect allocation.",
  },
  changed: {
    title: "Some material stocks are changed",
    description: "Review your stock to avoid incorrect allocation.",
  },
  both: {
    title: "Some material stocks are changed and expired",
    description: "Review your stock to avoid incorrect allocation.",
  },
};

const LOG_ACTIVITY_NAME = {
  new_request: "Created",
  preparing: "Preparing",
  re_preparing: "Re-Preparing",
  transferring: "Start Transfer",
  completed: "Confirm Receipt",
  canceled: "Canceled",
};

const POV_OPTIONS = [
  { value: "inventory", label: "Inventory Team" },
  { value: "production", label: "Production Team" },
];

const QTY_TOOLTIPS = {
  requested: "The quantity of material submitted by production",
  fulfillable: "The quantity allocated based on current stock availability",
  shortage: "Unfulfilled quantity due to insufficient stock",
};

const COLS = "48px 1fr 2.2fr 1.2fr 1.4fr 1.2fr 1.3fr";

const tabButtonStyle = (isActive) => ({
  height: "44px",
  padding: "0 24px",
  borderRadius: "100px",
  border: isActive ? "1px solid var(--feature-brand-primary)" : "1px solid transparent",
  background: isActive ? "#EAF1FF" : "var(--neutral-surface-primary)",
  color: isActive ? "var(--feature-brand-primary)" : "#7F7F7F",
  fontSize: "var(--text-title-2)",
  fontWeight: isActive ? "var(--font-weight-bold)" : "var(--font-weight-regular)",
  cursor: "pointer",
  transition: "all 0.18s ease",
  whiteSpace: "nowrap",
});

const headerCell = (overrides = {}) => ({
  fontSize: "var(--text-title-3)",
  fontWeight: "var(--font-weight-bold)",
  color: "var(--neutral-on-surface-primary)",
  padding: "0 12px",
  display: "flex",
  alignItems: "center",
  gap: "4px",
  ...overrides,
});

const bodyCell = (overrides = {}) => ({
  fontSize: "var(--text-title-3)",
  color: "var(--neutral-on-surface-primary)",
  padding: "16px 12px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "flex-start",
  gap: "4px",
  ...overrides,
});

const InfoLabel = ({ label, tooltip }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
    {label}
    <Tooltip content={tooltip}>
      <Info size={14} color="var(--neutral-on-surface-tertiary)" />
    </Tooltip>
  </span>
);

const InfoField = ({ label, value }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
    <span style={{ fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-secondary)" }}>
      {label}
    </span>
    <span style={{ fontSize: "var(--text-title-2)", color: "var(--neutral-on-surface-primary)" }}>
      {value}
    </span>
  </div>
);

export const MaterialRequestDetailPage = ({ onNavigate, initialData, requestId, showSnackbar }) => {
  const resolved =
    (initialData && initialData.items ? initialData : null) ||
    getRequest(initialData?.id || requestId) ||
    null;

  const [request, setRequest] = useState(resolved);
  // Point of view: "inventory" (default) prepares/transfers; "production" receives.
  // Opening from the Work Order request history (?pov=production) defaults to Production.
  const [pov, setPov] = useState(() => {
    try {
      return new URLSearchParams(window.location.search).get("pov") === "production"
        ? "production"
        : "inventory";
    } catch {
      return "inventory";
    }
  });
  const [activeTab, setActiveTab] = useState("requested_material");
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [receiptFiles, setReceiptFiles] = useState([]);
  const [receiptSubmitted, setReceiptSubmitted] = useState(false);
  const [isReceiptExpiredOpen, setIsReceiptExpiredOpen] = useState(false);
  const [isPrepDrawerOpen, setIsPrepDrawerOpen] = useState(false);
  // Items + info banner passed to the prep drawer (varies between the new-request
  // preparation flow and the transfer "Review Stock" flow).
  const [prepItems, setPrepItems] = useState(resolved?.items || []);
  const [prepTransferIssues, setPrepTransferIssues] = useState({ expired: [], changed: [] });
  // "prepare" (new request) | "reprepare" (after a transfer stock conflict).
  const [prepMode, setPrepMode] = useState("prepare");
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isTransferConflictOpen, setIsTransferConflictOpen] = useState(false);
  const [transferConflictKind, setTransferConflictKind] = useState("none");
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelFiles, setCancelFiles] = useState([]);
  const [cancelSubmitted, setCancelSubmitted] = useState(false);
  // Same modal serves both flows; reject (Production POV) only differs in copy.
  const [isRejectReceipt, setIsRejectReceipt] = useState(false);

  const openCancelModal = () => {
    setCancelReason("");
    setCancelFiles([]);
    setCancelSubmitted(false);
    setIsRejectReceipt(false);
    setIsCancelModalOpen(true);
  };

  const openRejectReceiptModal = () => {
    setCancelReason("");
    setCancelFiles([]);
    setCancelSubmitted(false);
    setIsRejectReceipt(true);
    setIsCancelModalOpen(true);
  };

  const handleCancelFilesSelected = (files) => {
    const allowed = files
      .filter((f) => /\.(jpe?g|png|pdf)$/i.test(f.name) && f.size <= 25 * 1024 * 1024)
      .map((f) => ({ file: f, description: "" }));
    setCancelFiles((prev) => [...prev, ...allowed].slice(0, 3));
  };

  const updateCancelFileDescription = (idx, value) =>
    setCancelFiles((prev) => prev.map((e, i) => (i === idx ? { ...e, description: value } : e)));

  if (!request) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <p style={{ color: "var(--neutral-on-surface-tertiary)" }}>Request not found.</p>
        <Button onClick={() => onNavigate("list")}>Back to Material Request</Button>
      </div>
    );
  }

  const statusMeta = REQUEST_STATUS_META[request.status] || REQUEST_STATUS_META.new_request;
  const isNewRequest = request.status === "new_request";

  // Other requests sharing the same work order.
  const relatedRequests = getRequests().filter(
    (r) => r.workOrderNo === request.workOrderNo && r.id !== request.id
  );

  const handlePrepConfirm = (preparedItems) => {
    if (prepMode === "reprepare") {
      const updated = applyRePreparation(request.id, preparedItems);
      setRequest({ ...updated });
      setIsPrepDrawerOpen(false);
      showSnackbar("Material successfully re-prepared", "success");
      return;
    }
    const updated = applyPreparation(request.id, preparedItems);
    setRequest({ ...updated });
    setIsPrepDrawerOpen(false);
    showSnackbar("Status successfully changed to Preparing", "success");
  };

  // "Start Preparation" (new request) — open the drawer with the request's items.
  const openPrepDrawer = () => {
    setPrepMode("prepare");
    setPrepItems(request.items);
    setPrepTransferIssues({ expired: [], changed: [] });
    setIsPrepDrawerOpen(true);
  };

  // "Start Transfer" — surface a stock conflict modal when needed, otherwise the
  // existing transfer confirmation.
  const handleStartTransfer = () => {
    const kind = getTransferConflict(request);
    if (kind === "none") {
      setIsTransferModalOpen(true);
      return;
    }
    setTransferConflictKind(kind);
    setIsTransferConflictOpen(true);
  };

  // "Review Stock" — open the prep drawer with corrected stock + an info banner
  // listing the expired/changed materials.
  const handleReviewStock = () => {
    setIsTransferConflictOpen(false);
    setPrepMode("reprepare");
    setPrepItems(buildTransferDrawerItems(request));
    setPrepTransferIssues(buildTransferIssues(request));
    setIsPrepDrawerOpen(true);
    showSnackbar("Material batch successfully updated", "success");
  };

  const handleConfirmTransfer = () => {
    const updated = setRequestStatus(
      request.id,
      "transferring",
      "Status changed to Transferring"
    );
    setRequest({ ...updated });
    setIsTransferModalOpen(false);
    showSnackbar("Request successfully confirmed", "success");
  };

  const handleConfirmCancel = () => {
    const missingDescription = cancelFiles.some((e) => !e.description.trim());
    if (!cancelReason.trim() || missingDescription) {
      setCancelSubmitted(true);
      return;
    }
    const updated = setRequestStatus(request.id, "canceled", "Request Canceled", {
      cancelReason: cancelReason.trim(),
      cancelProofs: cancelFiles.map((e) => ({ name: e.file.name, description: e.description.trim() })),
    });
    setRequest({ ...updated });
    setIsCancelModalOpen(false);
    showSnackbar("Request successfully canceled", "success");
  };

  // --- Production POV: confirm receipt ---
  // Expired allocated materials detected at receipt time (drives the warning modal).
  const receiptExpired = buildTransferIssues(request).expired;
  const receiptExpiredCount = receiptExpired.reduce((n, g) => n + g.batches.length, 0);

  const openReceiptModal = () => {
    setReceiptFiles([]);
    setReceiptSubmitted(false);
    setIsReceiptModalOpen(true);
  };

  // "Confirm Receipt" — warn first if any allocated material has expired.
  const handleConfirmReceiptClick = () => {
    if (receiptExpiredCount > 0) {
      setIsReceiptExpiredOpen(true);
      return;
    }
    openReceiptModal();
  };

  const handleReceiptFilesSelected = (files) => {
    const allowed = files
      .filter((f) => /\.(jpe?g|png|pdf)$/i.test(f.name) && f.size <= 25 * 1024 * 1024)
      .map((f) => ({ file: f, description: "" }));
    setReceiptFiles((prev) => [...prev, ...allowed].slice(0, 3));
  };

  const updateReceiptFileDescription = (idx, value) =>
    setReceiptFiles((prev) => prev.map((e, i) => (i === idx ? { ...e, description: value } : e)));

  const handleConfirmReceipt = () => {
    const missingDescription = receiptFiles.some((e) => !e.description.trim());
    if (missingDescription) {
      setReceiptSubmitted(true);
      return;
    }
    const updated = setRequestStatus(request.id, "completed", "Materials received — Completed", {
      receiptProofs: receiptFiles.map((e) => ({ name: e.file.name, description: e.description.trim() })),
    });
    setRequest({ ...updated });
    setIsReceiptModalOpen(false);
    showSnackbar("Material request successfully completed", "success");
  };

  const renderRequestedMaterialTable = () => (
    <div
      style={{
        background: "var(--neutral-surface-primary)",
        border: "1px solid var(--neutral-line-separator-1)",
        borderRadius: "var(--radius-card)",
        overflow: "hidden",
      }}
    >
      <div style={{ overflowX: "auto", paddingTop: "8px" }}>
        <div style={{ minWidth: "880px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: COLS,
              height: "48px",
              padding: "0 12px",
              borderBottom: "1px solid var(--neutral-line-separator-1)",
            }}
          >
            <div style={headerCell()}>No</div>
            <div style={headerCell()}>Type</div>
            <div style={headerCell()}>Material</div>
            <div style={headerCell()}>
              <InfoLabel label="Requested Qty" tooltip={QTY_TOOLTIPS.requested} />
            </div>
            <div style={headerCell()}>
              <InfoLabel label="Fulfillable Qty" tooltip={QTY_TOOLTIPS.fulfillable} />
            </div>
            <div style={headerCell()}>
              <InfoLabel label="Shortage Qty" tooltip={QTY_TOOLTIPS.shortage} />
            </div>
            <div style={headerCell()}>Status</div>
          </div>

          {request.items.map((item, idx) => {
            const alloc = isNewRequest ? null : item.allocation;
            const rowMeta =
              ROW_STATUS_META[alloc?.rowStatusKey] || ROW_STATUS_META.not_started;
            const hasFulfillable = alloc && alloc.fulfillableQty > 0;
            const reasonLabel = item.exceedingReason
              ? "Exceeding reason:"
              : item.requestReason
              ? "Request reason:"
              : null;
            const reasonValue = item.exceedingReason || item.requestReason;
            const notesValue = item.exceedingNotes || item.requestNotes;
            const isLast = idx === request.items.length - 1;
            const separator = "1px solid var(--neutral-line-separator-1)";
            return (
              <React.Fragment key={idx}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: COLS,
                  padding: "0 12px",
                  borderBottom: reasonLabel ? "none" : isLast ? "none" : separator,
                }}
              >
                <div style={bodyCell({ color: "var(--neutral-on-surface-secondary)" })}>
                  {idx + 1}
                </div>
                <div style={bodyCell()}>
                  <StatusBadge
                    variant={item.type === "BOM" ? "blue-light" : "grey-light"}
                    style={{ alignSelf: "flex-start" }}
                  >
                    {item.type}
                  </StatusBadge>
                </div>
                <div style={bodyCell()}>
                  <span style={{ fontWeight: "var(--font-weight-semi-bold)" }}>{item.name}</span>
                  <span
                    style={{
                      fontSize: "var(--text-body)",
                      color: "var(--neutral-on-surface-secondary)",
                    }}
                  >
                    {item.sku}
                  </span>
                </div>
                <div style={bodyCell()}>
                  {item.requestedQty} {item.unit}
                </div>
                <div style={bodyCell()}>
                  {!alloc || !hasFulfillable ? (
                    <span style={{ color: "var(--neutral-on-surface-tertiary)" }}>-</span>
                  ) : (
                    <>
                      <span style={{ color: "var(--status-green-primary)" }}>
                        {alloc.fulfillableQty} {item.unit}
                      </span>
                      {alloc.batches?.map((b) => (
                        <span
                          key={b.batch}
                          style={{
                            fontSize: "var(--text-body)",
                            color: "var(--neutral-on-surface-secondary)",
                          }}
                        >
                          {b.batch}:{" "}
                          <b style={{ color: "var(--neutral-on-surface-primary)" }}>
                            {b.qty} {item.unit}
                          </b>
                        </span>
                      ))}
                    </>
                  )}
                  {alloc?.reason && (
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
                      {alloc.reason}
                    </div>
                  )}
                </div>
                <div style={bodyCell()}>
                  {!alloc ? (
                    <span style={{ color: "var(--neutral-on-surface-tertiary)" }}>-</span>
                  ) : alloc.shortageQty > 0 ? (
                    <span style={{ color: "var(--status-red-primary)" }}>
                      {alloc.shortageQty} {item.unit}
                    </span>
                  ) : (
                    <span style={{ color: "var(--neutral-on-surface-primary)" }}>
                      0 {item.unit}
                    </span>
                  )}
                </div>
                <div style={bodyCell()}>
                  <StatusBadge variant={`${rowMeta.badge}-light`} style={{ alignSelf: "flex-start" }}>
                    {rowMeta.label}
                  </StatusBadge>
                </div>
              </div>

              {reasonLabel && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: COLS,
                    padding: "0 12px",
                    background: "var(--status-orange-container)",
                    borderLeft: "3px solid var(--status-orange-primary)",
                    borderBottom: isLast ? "none" : separator,
                  }}
                >
                  <div style={{ gridColumn: "2 / 4", padding: "12px 12px", fontSize: "var(--text-title-3)", lineHeight: 1.6 }}>
                    <span style={{ fontWeight: "var(--font-weight-bold)" }}>{reasonLabel} </span>
                    {reasonValue}
                  </div>
                  {notesValue && (
                    <div style={{ gridColumn: "4 / 8", padding: "12px 12px", fontSize: "var(--text-title-3)", lineHeight: 1.6 }}>
                      <span style={{ fontWeight: "var(--font-weight-bold)" }}>Notes: </span>
                      {notesValue}
                    </div>
                  )}
                </div>
              )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderRelatedRequest = () => (
    <div
      style={{
        background: "var(--neutral-surface-primary)",
        border: "1px solid var(--neutral-line-separator-1)",
        borderRadius: "var(--radius-card)",
        overflow: "hidden",
      }}
    >
      {relatedRequests.length === 0 ? (
        <div
          style={{
            padding: "48px",
            textAlign: "center",
            color: "var(--neutral-on-surface-tertiary)",
            fontSize: "var(--text-title-3)",
          }}
        >
          No related requests for this work order.
        </div>
      ) : (
        <div style={{ padding: "8px 0" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.2fr 1.2fr 1.4fr 1fr",
              height: "48px",
              padding: "0 12px",
              borderBottom: "1px solid var(--neutral-line-separator-1)",
            }}
          >
            <div style={headerCell()}>Request ID</div>
            <div style={headerCell()}>Requested By</div>
            <div style={headerCell()}>Requested Date</div>
            <div style={headerCell()}>Status</div>
          </div>
          {relatedRequests.map((r, idx) => {
            const meta = REQUEST_STATUS_META[r.status];
            return (
              <div
                key={r.id}
                onClick={() => onNavigate("detail", r)}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.2fr 1.2fr 1.4fr 1fr",
                  padding: "0 12px",
                  borderBottom:
                    idx < relatedRequests.length - 1
                      ? "1px solid var(--neutral-line-separator-1)"
                      : "none",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "var(--neutral-surface-grey-lighter)")
                }
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <div style={bodyCell({ color: "var(--feature-brand-primary)" })}>{r.requestId}</div>
                <div style={bodyCell()}>{r.requestedBy}</div>
                <div style={bodyCell()}>{r.requestedDate}</div>
                <div style={bodyCell()}>
                  <StatusBadge variant={meta?.badge || "grey"} style={{ alignSelf: "flex-start" }}>
                    {meta?.label}
                  </StatusBadge>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const logEmail = (name) =>
    name && name !== "System"
      ? `${name.toLowerCase().replace(/\s+/g, ".")}@company.com`
      : "-";

  const renderLogs = () => {
    const logs = [...request.logs].reverse(); // newest first
    return (
      <div
        style={{
          background: "var(--neutral-surface-primary)",
          border: "1px solid var(--neutral-line-separator-1)",
          borderRadius: "var(--radius-card)",
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "24px 24px 0 24px", display: "flex", alignItems: "center" }}>
          <span style={{ fontSize: "var(--text-title-2)", fontWeight: "var(--font-weight-bold)" }}>
            Activity Logs
          </span>
        </div>
        <div style={{ padding: "24px" }}>
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
              <div style={{ flex: "1.1" }}>Name</div>
              <div style={{ flex: "1.9" }}>Email</div>
              <div style={{ flex: "2.8" }}>Activity</div>
              <div style={{ width: "190px" }}>Timestamp</div>
            </div>

            {logs.map((log, idx, arr) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  padding: "16px 0",
                  borderBottom:
                    idx === arr.length - 1
                      ? "none"
                      : "1px solid var(--neutral-line-separator-1)",
                  fontSize: "var(--text-title-3)",
                }}
              >
                <div style={{ flex: "1.1", color: "var(--neutral-on-surface-primary)" }}>
                  {log.by}
                </div>
                <div style={{ flex: "1.9", color: "var(--neutral-on-surface-primary)" }}>
                  {logEmail(log.by)}
                </div>
                <div style={{ flex: "2.8", display: "flex", flexDirection: "column", gap: "6px" }}>
                  <span style={{ fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>
                    {LOG_ACTIVITY_NAME[log.statusKey] || log.title}
                  </span>
                  {log.statusKey === "canceled" && (request.cancelReason || (request.cancelProofs || []).length > 0) && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      {request.cancelReason && (
                        <span style={{ fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-secondary)", lineHeight: 1.6 }}>
                          {request.cancelReason}
                        </span>
                      )}
                      {(request.cancelProofs || []).map((proof, i) => (
                        <a
                          key={i}
                          href={proof.url || "#"}
                          onClick={(e) => !proof.url && e.preventDefault()}
                          style={{
                            fontSize: "var(--text-title-3)",
                            color: "var(--feature-brand-primary)",
                            textDecoration: "underline",
                            cursor: "pointer",
                            width: "fit-content",
                          }}
                        >
                          {proof.description || proof.name}
                        </a>
                      ))}
                    </div>
                  )}
                  {log.statusKey === "completed" && (request.receiptProofs || []).length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      {(request.receiptProofs || []).map((proof, i) => (
                        <a
                          key={i}
                          href={proof.url || "#"}
                          onClick={(e) => !proof.url && e.preventDefault()}
                          style={{
                            fontSize: "var(--text-title-3)",
                            color: "var(--feature-brand-primary)",
                            textDecoration: "underline",
                            cursor: "pointer",
                            width: "fit-content",
                          }}
                        >
                          {proof.description || proof.name}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ width: "190px", color: "var(--neutral-on-surface-secondary)" }}>
                  {log.timestamp}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Inventory POV acts while the request is new/preparing; Production POV receives
  // once it is transferring. Each POV shows its own footer actions.
  const showInventoryFooter =
    pov === "inventory" && (isNewRequest || request.status === "preparing");
  const showProductionFooter = pov === "production" && request.status === "transferring";
  const hasFooter = showInventoryFooter || showProductionFooter;

  return (
    <div
      style={{
        height: "calc(100vh - 64px)",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        overflow: "hidden",
      }}
    >
      <div style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "16px",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div
              style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", marginLeft: "-4px" }}
              onClick={() => onNavigate("list")}
            >
              <ChevronLeftIcon size={28} color="var(--neutral-on-surface-primary)" />
              <h1 style={{ margin: 0, fontSize: "var(--text-large-title)", fontWeight: "var(--font-weight-bold)" }}>
                Request Detail
              </h1>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-title-3)", marginLeft: "32px" }}>
              <span style={{ color: "var(--neutral-on-surface-secondary)", cursor: "pointer" }} onClick={() => onNavigate("list")}>
                Material Request
              </span>
              <span style={{ color: "var(--neutral-on-surface-tertiary)" }}>/</span>
              <span style={{ color: "var(--neutral-on-surface-tertiary)" }}>Request Detail</span>
            </div>
          </div>
          {/* POV selector */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
            <span style={{ fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-secondary)", whiteSpace: "nowrap" }}>
              POV:
            </span>
            <div style={{ width: "200px" }}>
              <DropdownSelect
                value={pov}
                onChange={(val) => setPov(val)}
                options={POV_OPTIONS}
                fieldHeight="44px"
                fontSize="var(--text-title-3)"
              />
            </div>
          </div>
        </div>

        {/* Canceled banner */}
        {request.status === "canceled" && (
          <div
            style={{
              flexShrink: 0,
              display: "flex",
              alignItems: "flex-start",
              gap: "12px",
              padding: "16px 20px",
              borderRadius: "var(--radius-card)",
              border: "1px solid var(--status-red-primary)",
              background: "var(--status-red-container)",
            }}
          >
            <Info size={20} color="var(--status-red-primary)" style={{ flexShrink: 0, marginTop: "2px" }} />
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <span style={{ fontSize: "var(--text-title-2)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>
                Request Canceled
              </span>
              <span style={{ fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-primary)", lineHeight: 1.6 }}>
                {request.cancelReason || "This material request has been canceled and will not proceed further."}
              </span>
            </div>
          </div>
        )}

        {/* Request Information */}
        <div
          style={{
            background: "var(--neutral-surface-primary)",
            border: "1px solid var(--neutral-line-separator-1)",
            borderRadius: "var(--radius-card)",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ margin: 0, fontSize: "var(--text-headline)", fontWeight: "var(--font-weight-bold)" }}>
              {request.id}
            </h2>
            <StatusBadge variant={statusMeta.badge}>{statusMeta.label}</StatusBadge>
          </div>
          <div style={{ height: "1px", background: "var(--neutral-line-separator-1)" }} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}>
            <InfoField label="Work Order" value={request.workOrderNo} />
            <InfoField label="Requested By" value={request.requestedBy} />
            <InfoField label="Requested Date" value={request.requestedDate} />
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "12px", alignItems: "center", flexShrink: 0 }}>
          <button type="button" style={tabButtonStyle(activeTab === "requested_material")} onClick={() => setActiveTab("requested_material")}>
            Requested Material
          </button>
          <button type="button" style={tabButtonStyle(activeTab === "related_request")} onClick={() => setActiveTab("related_request")}>
            Related Request
          </button>
          <button type="button" style={tabButtonStyle(activeTab === "logs")} onClick={() => setActiveTab("logs")}>
            Logs
          </button>
        </div>

        {/* Tab content */}
        <div style={{ flexShrink: 0 }}>
          {activeTab === "requested_material" && renderRequestedMaterialTable()}
          {activeTab === "related_request" && renderRelatedRequest()}
          {activeTab === "logs" && renderLogs()}
        </div>
      </div>

      {/* Footer */}
      {hasFooter && (
        <div
          style={{
            flexShrink: 0,
            padding: "16px 24px",
            background: "var(--neutral-surface-primary)",
            borderTop: "1px solid var(--neutral-line-separator-1)",
            boxShadow: "var(--elevation-sticky)",
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: "12px",
          }}
        >
          {showInventoryFooter ? (
            <>
              <Button variant="danger" size="lg" onClick={openCancelModal}>
                Cancel Request
              </Button>
              {isNewRequest ? (
                <Button size="lg" onClick={openPrepDrawer}>
                  Start Preparation
                </Button>
              ) : (
                <Button size="lg" onClick={handleStartTransfer}>
                  Start Transfer
                </Button>
              )}
            </>
          ) : (
            <>
              <Button variant="danger" size="lg" onClick={openRejectReceiptModal}>
                Reject Receipt
              </Button>
              <Button size="lg" onClick={handleConfirmReceiptClick}>
                Confirm Receipt
              </Button>
            </>
          )}
        </div>
      )}

      {/* Preparation drawer */}
      <MaterialPreparationDrawer
        isOpen={isPrepDrawerOpen}
        onClose={() => setIsPrepDrawerOpen(false)}
        items={prepItems}
        transferIssues={prepTransferIssues}
        confirmLabel={prepMode === "reprepare" ? "Start Re-Preparing" : "Start Preparing"}
        onConfirm={handlePrepConfirm}
        showSnackbar={showSnackbar}
      />

      {/* Start Transfer — stock conflict (expired / changed / both) */}
      <GeneralModal
        isOpen={isTransferConflictOpen}
        onClose={() => setIsTransferConflictOpen(false)}
        title={(TRANSFER_CONFLICT_META[transferConflictKind] || {}).title}
        description={(TRANSFER_CONFLICT_META[transferConflictKind] || {}).description}
        footer={
          <Button size="lg" onClick={handleReviewStock} style={{ width: "100%" }}>
            Review Stock
          </Button>
        }
      />

      {/* Start Transfer confirmation */}
      <GeneralModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        title="Start Transferring?"
        description="The requestor will need to confirm once they have received the allocated materials"
        footer={
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
            <Button size="lg" onClick={handleConfirmTransfer} style={{ width: "100%" }}>
              Yes, Transfer
            </Button>
            <Button variant="outlined" size="lg" onClick={() => setIsTransferModalOpen(false)} style={{ width: "100%" }}>
              Cancel
            </Button>
          </div>
        }
      />

      {/* Cancel Request confirmation */}
      <GeneralModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title={isRejectReceipt ? "Reject Receipt?" : "Cancel Request?"}
        description={
          isRejectReceipt
            ? "Please input your reason for rejecting this receipt"
            : "Please input your reason for canceling request"
        }
        width="560px"
        footer={
          <Button size="lg" onClick={handleConfirmCancel} style={{ width: "100%" }}>
            Submit Request
          </Button>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "20px", textAlign: "left" }}>
          <InputField
            label="Reason"
            required
            multiline
            maxLength={400}
            headerRight={`${cancelReason.length}/400`}
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Input Reason"
            error={cancelSubmitted && !cancelReason.trim() ? "Field cannot be empty" : undefined}
          />

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <span style={{ fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-primary)" }}>
              Proof of Cancellation ({cancelFiles.length}/3)
            </span>
            <UploadDropzone
              multiple
              maxFiles={3}
              accept=".jpg,.jpeg,.png,.pdf"
              maxText="File size max. 25MB"
              allowedText="jpeg, png, pdf"
              disabled={cancelFiles.length >= 3}
              onFilesSelected={handleCancelFilesSelected}
            />
            {cancelFiles.map((entry, idx) => (
              <UploadDescriptionCard
                key={idx}
                file={entry.file}
                description={entry.description}
                descriptionRequired
                descriptionError={
                  cancelSubmitted && !entry.description.trim() ? "Field cannot be empty" : ""
                }
                onDescriptionChange={(val) => updateCancelFileDescription(idx, val)}
                onRemove={() => setCancelFiles((prev) => prev.filter((_, i) => i !== idx))}
              />
            ))}
          </div>
        </div>
      </GeneralModal>

      {/* Expired materials detected at receipt time (Production POV) */}
      <GeneralModal
        isOpen={isReceiptExpiredOpen}
        onClose={() => setIsReceiptExpiredOpen(false)}
        title="Expired Materials Detected"
        description={`${receiptExpiredCount} materials are expired. Do you still want to confirm receipt?`}
        width="560px"
        footer={
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
            <Button
              size="lg"
              onClick={() => {
                setIsReceiptExpiredOpen(false);
                openReceiptModal();
              }}
              style={{ width: "100%" }}
            >
              Confirm Anyway
            </Button>
            <Button
              variant="danger"
              size="lg"
              onClick={() => {
                setIsReceiptExpiredOpen(false);
                openRejectReceiptModal();
              }}
              style={{ width: "100%" }}
            >
              Reject Receipt
            </Button>
          </div>
        }
      >
        <div
          style={{
            display: "flex",
            gap: "10px",
            border: "1px solid var(--status-orange-primary)",
            background: "var(--status-orange-container)",
            borderRadius: "var(--radius-card)",
            padding: "16px 20px",
            textAlign: "left",
          }}
        >
          <Info size={18} color="var(--status-orange-primary)" style={{ flexShrink: 0, marginTop: "2px" }} />
          <div
            style={{
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              color: "var(--status-orange-primary)",
              fontSize: "var(--text-title-3)",
              lineHeight: 1.5,
            }}
          >
            <span style={{ fontWeight: "var(--font-weight-bold)" }}>Expired Materials:</span>
            {receiptExpired.map((g, gi) => (
              <div key={gi} style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <div style={{ display: "flex", gap: "6px" }}>
                  <span>&bull;</span>
                  <span>{g.name}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "2px", paddingLeft: "18px" }}>
                  {g.batches.map((b, bi) => (
                    <div key={bi} style={{ display: "flex", gap: "6px" }}>
                      <span>&bull;</span>
                      <span>
                        {b.batch} ({b.qty} {b.unit}) - <b>Expired on {b.expiredOn}</b>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </GeneralModal>

      {/* Confirm Receipt (Production POV) */}
      <GeneralModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        title="Confirm Receipt?"
        description="Make sure you have received all the allocated materials before confirming the request"
        width="560px"
        footer={
          <Button size="lg" onClick={handleConfirmReceipt} style={{ width: "100%" }}>
            Yes, Confirm
          </Button>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", textAlign: "left" }}>
          <span style={{ fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-primary)" }}>
            Proof of Receipt ({receiptFiles.length}/3)
          </span>
          <UploadDropzone
            multiple
            maxFiles={3}
            accept=".jpg,.jpeg,.png,.pdf"
            maxText="File size max. 25MB"
            allowedText="jpeg, png, pdf"
            disabled={receiptFiles.length >= 3}
            onFilesSelected={handleReceiptFilesSelected}
          />
          {receiptFiles.map((entry, idx) => (
            <UploadDescriptionCard
              key={idx}
              file={entry.file}
              description={entry.description}
              descriptionRequired
              descriptionError={
                receiptSubmitted && !entry.description.trim() ? "Field cannot be empty" : ""
              }
              onDescriptionChange={(val) => updateReceiptFileDescription(idx, val)}
              onRemove={() => setReceiptFiles((prev) => prev.filter((_, i) => i !== idx))}
            />
          ))}
        </div>
      </GeneralModal>
    </div>
  );
};
