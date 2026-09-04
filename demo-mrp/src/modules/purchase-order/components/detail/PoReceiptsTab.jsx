import React from "react";
import {
  Info,
  ImageAssetIcon,
  HelpCircle,
  DownloadIcon,
} from "../../../../components/icons/Icons.jsx";
import {
  MOCK_WO_TABLE_DATA,
} from "../../../../modules/work-order/mock/workOrderMocks.js";
import {
  MOCK_MATERIALS_DATA,
} from "../../../../modules/materials/mock/materialsMocks.js";
import {
  getImageUploadPreviewUrl,
  normalizeProofDocuments,
} from "../../../../utils/upload/uploadUtils.js";
import {
  inputFrameStyle,
  inputControlStyle,
  focusInputFrame,
  blurInputFrame,
} from "../../../purchase-order/styles/purchaseOrderInputStyles.js";
import { MOCK_VENDORS } from "../../../../data/vendors.js";
import { MOCK_COMPANY } from "../../../../data/company.js";
import { downloadVendorReleasePdf } from "../../utils/vendorReleasePdfExport.js";
import { IconButton } from "../../../../components/common/IconButton.jsx";
import {
  Button,
  StatusBadge,
  Tooltip,
  ProofDocumentList,
  poReferenceTableFrameStyle,
  poReferenceTableScrollerStyle,
  poReferenceTableInnerStyle,
  poReferenceTableHeaderRowStyle,
  poReferenceTableRowStyle,
  poReferenceTableHeaderCellStyle,
  poReferenceTableCellStyle,
} from "./shared/PoDetailSharedComponents.jsx";

const PoReceiptsTab = ({
  // Data
  receiptLines,
  receiptErrors,
  groupedReceiptLogs,
  canConfirmReceipt,
  initialData,
  // Handlers
  handleReceiptConfirmClick,
  updateReceiptLine,
  onNavigate,
  showToast,
  // Helpers
  displayValue,
}) => {
  const [logTab, setLogTab] = React.useState("receipt");

  const groupedReleaseLogs = React.useMemo(() => {
    const logs = [];
    receiptLines.forEach((line) => {
      if (line.type === "wo" || (line.woRef && line.woRef !== "-")) {
        const woData = MOCK_WO_TABLE_DATA.find((w) => w.wo === line.woRef);
        if (woData && woData.vendors) {
          const vendor = woData.vendors.find(v => v.assignmentId === line.assignmentId);
          if (vendor && vendor.sendHistory) {
            vendor.sendHistory.forEach((sh) => {
              logs.push({
                ...sh,
                assignmentId: vendor.assignmentId,
                outsourceSteps: vendor.assignedSteps,
                woRef: line.woRef,
                item: line.item || "Outsourced Item",
                sendBy: sh.sendBy || sh.sentBy || "Natasha Smith",
                date: sh.date || "-",
                time: sh.time || "10:00",
                releaseId: sh.releaseId || `RLS-${Math.floor(1000 + Math.random() * 9000)}`,
                amount: sh.amount || 0,
                note: sh.note || "-",
                proofDocuments: sh.attachments || sh.proofDocuments || []
              });
            });
          }
        }
      }
    });
    return logs.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [receiptLines]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div
        style={{
          background: "var(--neutral-surface-primary)",
          borderRadius: "16px",
          border: "1px solid var(--neutral-line-separator-1)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "24px 24px 0 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
          }}
        >
          <span
            style={{
              fontSize: "var(--text-title-2)",
              fontWeight: "var(--font-weight-bold)",
            }}
          >
            Receipt
          </span>
          <Button
            variant="filled"
            onClick={handleReceiptConfirmClick}
            disabled={!canConfirmReceipt}
          >
            Confirm Receipt
          </Button>
        </div>
        <div
          style={{
            padding: "20px 24px 24px 24px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {!canConfirmReceipt ? (
            <div
              style={{
                marginBottom: "16px",
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
                padding: "12px 16px",
                borderRadius: "12px",
                background: "var(--feature-brand-container-lighter)",
                border: "1px solid var(--feature-brand-container-darker)",
              }}
            >
              <Info
                size={16}
                strokeWidth={2.1}
                color="var(--feature-brand-primary)"
                style={{ flexShrink: 0, marginTop: "2px" }}
              />
              <span
                style={{
                  fontSize: "var(--text-title-3)",
                  color: "var(--feature-brand-primary)",
                  lineHeight: "1.5",
                }}
              >
                Receipt confirmation is only available when the purchase order
                status is Issued.
              </span>
            </div>
          ) : null}
          {receiptErrors._global ? (
            <span
              style={{
                marginBottom: "16px",
                fontSize: "var(--text-body)",
                color: "var(--status-red-primary)",
              }}
            >
              {receiptErrors._global}
            </span>
          ) : null}
          <div style={poReferenceTableFrameStyle}>
            <div
              style={{
                ...poReferenceTableScrollerStyle,
                overflowX: receiptLines.length > 0 ? "auto" : "hidden",
              }}
            >
              <div style={poReferenceTableInnerStyle("100%")}>
                {receiptLines.length > 0 && (
                  <div
                    style={poReferenceTableHeaderRowStyle(
                      "80px minmax(160px, 1.4fr) minmax(180px, 1.8fr) minmax(160px, 1.5fr) minmax(150px, 1.3fr) 85px",
                      "8px"
                    )}
                  >
                    <div style={poReferenceTableHeaderCellStyle()}>Type</div>
                    <div style={poReferenceTableHeaderCellStyle()}>Item</div>
                    <div style={poReferenceTableHeaderCellStyle()}>
                      Description
                    </div>
                    <div style={poReferenceTableHeaderCellStyle()}>WO Ref & Assignment</div>
                    <div style={poReferenceTableHeaderCellStyle()}>
                      Receipt Progress
                    </div>
                    <div style={poReferenceTableHeaderCellStyle()}>
                      Receive Now
                    </div>
                  </div>
                )}
                {receiptLines.map((line, idx) => {
                  let availToReceive = null;
                  if (line.assignmentId && line.assignmentId !== "-" && line.woRef && line.woRef !== "-") {
                    const woData = MOCK_WO_TABLE_DATA.find((w) => w.wo === line.woRef);
                    if (woData && woData.vendors) {
                      const vendor = woData.vendors.find(v => v.assignmentId === line.assignmentId);
                      if (vendor) {
                        const vendorSentOutput = (vendor.sendHistory || []).reduce(
                          (sum, sh) => sum + (Number(sh.amount) || 0),
                          0
                        );
                        const vendorReceivedOutput = Number(vendor.receivedOutput) || 0;
                        availToReceive = Math.max(0, vendorSentOutput - vendorReceivedOutput);
                      }
                    }
                  }

                  const remainingQty = Math.max(
                    line.orderedQty - line.receivedQty,
                    0
                  );
                  const lineTypeLabel =
                    line.type === "wo"
                      ? "WO"
                      : line.type === "material"
                      ? "Material"
                      : "Manual";
                  const lineTypeVariant =
                    line.type === "wo"
                      ? "blue-light"
                      : line.type === "material"
                      ? "yellow-light"
                      : "grey-light";
                  return (
                    <div
                      key={line.id}
                      style={poReferenceTableRowStyle(
                        "80px minmax(160px, 1.4fr) minmax(180px, 1.8fr) minmax(160px, 1.5fr) minmax(150px, 1.3fr) 85px",
                        idx === receiptLines.length - 1,
                        { minHeight: "64px", gap: "8px" }
                      )}
                    >
                      <div style={poReferenceTableCellStyle()}>
                        <StatusBadge variant={lineTypeVariant}>
                          {lineTypeLabel}
                        </StatusBadge>
                      </div>
                      <div
                        style={poReferenceTableCellStyle({
                          minWidth: 0,
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          padding: "8px 0",
                        })}
                      >
                        <div
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "8px",
                            background: "var(--neutral-surface-grey-lighter)",
                            border: "1px solid var(--neutral-line-separator-1)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            overflow: "hidden",
                          }}
                        >
                          {line.image && getImageUploadPreviewUrl(line.image) ? (
                            <img
                              src={getImageUploadPreviewUrl(line.image)}
                              alt={line.item}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                          ) : (
                            <ImageAssetIcon
                              size={20}
                              color="var(--neutral-on-surface-tertiary)"
                            />
                          )}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "2px",
                            minWidth: 0,
                          }}
                        >
                          <span
                            style={{
                              display: "block",
                              fontSize: "var(--text-title-3)",
                              fontWeight: "var(--font-weight-bold)",
                              color: "var(--neutral-on-surface-primary)",
                              wordBreak: "break-word",
                            }}
                          >
                            {displayValue(line.item)}
                          </span>
                          <span
                            style={{
                              display: "block",
                              fontSize: "var(--text-title-3)",
                              color:
                                line.type === "manual"
                                  ? "var(--neutral-on-surface-secondary)"
                                  : "var(--feature-brand-primary)",
                              textDecoration:
                                line.type === "manual" ? "none" : "underline",
                              cursor:
                                line.type === "manual" ? "default" : "pointer",
                              wordBreak: "break-word",
                            }}
                            onClick={() => {
                              if (line.type === "manual") return;
                              const materialData =
                                MOCK_MATERIALS_DATA.find(
                                  (m) => m.sku === line.code
                                ) || {
                                  id: `mock-${line.code}`,
                                  name: line.item,
                                  sku: line.code,
                                  description: line.desc || "-",
                                  category: line.type === 'wo' ? "Work Order" : "Raw Material",
                                  status: "Active",
                                  type: line.type === 'wo' ? "Component" : "Raw",
                                  unit: "Pcs",
                                  onHandStock: 0,
                                  averageCost: line.price || 0
                                };
                              onNavigate("materials_detail", {
                                ...materialData,
                                from: "purchase_order_detail",
                                returnTo: {
                                  view: "purchase_order_detail",
                                  data: initialData,
                                },
                              });
                            }}
                          >
                            {displayValue(line.code)}
                          </span>
                        </div>
                      </div>
                      <div
                        style={poReferenceTableCellStyle({
                          minWidth: 0,
                          padding: "16px 0",
                          paddingRight: "16px",
                          color: "var(--neutral-on-surface-secondary)",
                        })}
                      >
                          <span
                            style={{
                              display: "block",
                              fontSize: "var(--text-title-3)",
                              color: "var(--neutral-on-surface-secondary)",
                              lineHeight: "1.4",
                              wordBreak: "break-word",
                              whiteSpace: "pre-wrap"
                            }}
                          >
                            {displayValue(line.desc)}
                          </span>
                      </div>
                      <div style={poReferenceTableCellStyle({ minWidth: 0, padding: "12px 0", flexDirection: "column", alignItems: "flex-start", gap: "4px" })}>
                        <span
                          onClick={() => {
                            if (!line.woRef || line.woRef === "-") return;
                            const woData = MOCK_WO_TABLE_DATA.find(
                              (w) => w.wo === line.woRef
                            );
                            if (woData) {
                              onNavigate("work_order_detail", {
                                ...woData,
                                from: "purchase_order_detail",
                                returnTo: {
                                  view: "detail",
                                  data: initialData,
                                },
                              });
                            }
                          }}
                          style={{
                            display: "block",
                            width: "100%",
                            whiteSpace: "normal",
                            wordBreak: "break-all",
                            color:
                              line.woRef && line.woRef !== "-"
                                ? "var(--feature-brand-primary)"
                                : "inherit",
                            textDecoration:
                              line.woRef && line.woRef !== "-"
                                ? "underline"
                                : "none",
                            cursor:
                              line.woRef && line.woRef !== "-"
                                ? "pointer"
                                : "default",
                          }}
                        >
                          {displayValue(line.woRef)}
                        </span>
                        {line.assignmentId && line.assignmentId !== "-" && (
                          <div style={{ marginTop: "4px", width: "100%", lineHeight: "1.4" }}>
                            <span style={{ fontSize: "14px", color: "var(--neutral-on-surface-secondary)", whiteSpace: "normal", wordBreak: "break-word" }}>
                              Assignment: <span style={{ color: "var(--feature-brand-primary)", textDecoration: "underline", cursor: "pointer" }}>{line.assignmentId}</span>
                            </span>
                            {line.outsourceSteps && line.outsourceSteps.length > 0 && (
                              <span style={{ display: "inline-flex", alignItems: "center", marginLeft: "4px", verticalAlign: "-2px" }}>
                              <Tooltip 
                                content={
                                  <div style={{ display: "flex", flexDirection: "column", gap: "4px", textAlign: "left" }}>
                                    {line.outsourceSteps.map(step => {
                                      const woData = MOCK_WO_TABLE_DATA.find(w => w.wo === line.woRef);
                                      const stage = woData?.routingStages?.find(s => s.step === step);
                                      return <div key={step}>Step {step}: {stage ? `${stage.route} - ${stage.op}` : "Unknown Stage"}</div>;
                                    })}
                                  </div>
                                } 
                                position="top"
                              >
                                <div style={{ display: "flex", alignItems: "center" }}>
                                  <HelpCircle size={14} color="var(--neutral-on-surface-tertiary)" style={{ cursor: "pointer" }} />
                                </div>
                              </Tooltip>
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <div style={poReferenceTableCellStyle({ minWidth: 0, paddingRight: "16px" })}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px", width: "100%" }}>
                          <div
                            style={{
                              height: "6px",
                              background: "var(--neutral-surface-grey-lighter)",
                              borderRadius: "3px",
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                height: "100%",
                                background: (() => {
                                  const pct = Math.min(100, ((line.receivedQty || 0) / (line.orderedQty || 1)) * 100);
                                  if (pct >= 100) return "var(--status-green-primary)";
                                  if (pct >= 75) return "var(--feature-brand-primary)";
                                  if (pct >= 50) return "var(--status-yellow-primary)";
                                  if (pct >= 25) return "var(--status-orange-primary)";
                                  return "var(--status-red-primary)";
                                })(),
                                width: `${Math.min(100, (((line.receivedQty || 0) / (line.orderedQty || 1)) * 100))}%`,
                                transition: "width 0.3s ease",
                                borderRadius: "3px",
                              }}
                            />
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              color: "var(--neutral-on-surface-tertiary)",
                              width: "100%",
                            }}
                          >
                            <div style={{ display: "flex", flexDirection: "column", gap: "2px", flex: 1 }}>
                              <span style={{ fontSize: "10px" }}>Received</span>
                              <span style={{ color: (() => { const pct = Math.min(100, ((line.receivedQty || 0) / (line.orderedQty || 1)) * 100); if (pct >= 100) return "var(--status-green-primary)"; if (pct >= 75) return "var(--feature-brand-primary)"; if (pct >= 50) return "var(--status-yellow-primary)"; if (pct >= 25) return "var(--status-orange-primary)"; return "var(--status-red-primary)"; })(), fontWeight: "var(--font-weight-bold)", fontSize: "11px" }}>{line.receivedQty || 0}</span>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "2px", alignItems: "center", flex: 1 }}>
                              <span style={{ fontSize: "10px" }}>Remaining</span>
                              <span style={{ color: "var(--neutral-on-surface-primary)", fontWeight: "var(--font-weight-bold)", fontSize: "11px" }}>{remainingQty}</span>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "2px", alignItems: "flex-end", flex: 1 }}>
                              <span style={{ fontSize: "10px" }}>Ordered</span>
                              <span style={{ color: "var(--neutral-on-surface-primary)", fontWeight: "var(--font-weight-bold)", fontSize: "11px" }}>{line.orderedQty || 0}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div style={poReferenceTableCellStyle()}>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "6px",
                            width: "100%",
                            padding: "9px 0",
                            position: "relative",
                          }}
                        >

                          <input
                            type="number"
                            min="0"
                            placeholder="0"
                            value={line.receiveNow}
                            onChange={(e) =>
                              updateReceiptLine(line.id, e.target.value)
                            }
                            style={{
                              height: "46px",
                              border: "1px solid transparent",
                              background:
                                remainingQty === 0 || !canConfirmReceipt
                                  ? "var(--neutral-surface-grey-lighter)"
                                  : "var(--neutral-surface-primary)",
                              ...inputFrameStyle(
                                remainingQty === 0 || !canConfirmReceipt,
                                !!receiptErrors[line.id]
                              ),
                              ...inputControlStyle(
                                remainingQty === 0 || !canConfirmReceipt,
                                !!line.receiveNow
                              ),
                              padding: "0 14px",
                              cursor: !canConfirmReceipt
                                ? "not-allowed"
                                : "text",
                            }}
                            disabled={remainingQty === 0 || !canConfirmReceipt}
                            onFocus={(e) => focusInputFrame(e.currentTarget)}
                            onBlur={(e) =>
                              blurInputFrame(
                                e.currentTarget,
                                remainingQty === 0 || !canConfirmReceipt,
                                !!receiptErrors[line.id]
                              )
                            }
                          />
                          {receiptErrors[line.id] ? (
                            <span
                              style={{
                                fontSize: "var(--text-body)",
                                color: "var(--status-red-primary)",
                                marginTop: "4px",
                              }}
                            >
                              {receiptErrors[line.id]}
                            </span>
                          ) : availToReceive !== null ? (
                            <span
                              style={{
                                fontSize: "var(--text-body)",
                                color: "var(--neutral-on-surface-tertiary)",
                                marginTop: "4px",
                              }}
                            >
                              Avail to receive: {availToReceive} pcs
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {receiptLines.length === 0 && (
                  <div
                    style={{
                      padding: "48px 24px",
                      textAlign: "center",
                      color: "var(--neutral-on-surface-tertiary)",
                      fontSize: "var(--text-title-3)",
                      background: "var(--neutral-surface-primary)",
                      border: "1.5px dashed var(--neutral-line-separator-1)",
                      borderRadius: "16px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      minHeight: "120px",
                    }}
                  >
                    No purchase order lines added.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          background: "var(--neutral-surface-primary)",
          borderRadius: "16px",
          border: "1px solid var(--neutral-line-separator-1)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "24px 24px 0 24px",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: "16px",
          }}
        >
          <span
            style={{
              fontSize: "var(--text-title-2)",
              fontWeight: "var(--font-weight-bold)",
            }}
          >
            Receipt and Release Log
          </span>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {[
              { id: "receipt", label: "Receipt Log" },
              { id: "release", label: "Release Log" }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setLogTab(tab.id)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "100px",
                  border: "1px solid",
                  borderColor:
                    logTab === tab.id
                      ? "var(--feature-brand-primary)"
                      : "var(--neutral-line-separator-1)",
                  background:
                    logTab === tab.id
                      ? "var(--feature-brand-container-lighter)"
                      : "var(--neutral-surface-primary)",
                  color:
                    logTab === tab.id
                      ? "var(--feature-brand-primary)"
                      : "var(--neutral-on-surface-secondary)",
                  fontSize: "14px",
                  fontWeight: logTab === tab.id ? "600" : "400",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        <div
          style={{
            padding: "20px 24px 24px 24px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={poReferenceTableFrameStyle}>
            <div style={poReferenceTableScrollerStyle}>
              <div
                style={poReferenceTableInnerStyle(
                  groupedReceiptLogs.length > 0 ? "1400px" : "100%"
                )}
              >
                {logTab === "receipt" ? (
                  <>
                    {groupedReceiptLogs.length > 0 && (
                      <div
                        style={poReferenceTableHeaderRowStyle(
                          "1.2fr 1fr 1.4fr 1fr 1.2fr 1.2fr 0.9fr 1.1fr 1.4fr 1.6fr",
                          "8px"
                        )}
                      >
                        <div style={poReferenceTableHeaderCellStyle()}>Receipt Date & Time</div>
                        <div style={poReferenceTableHeaderCellStyle()}>Receipt No</div>
                        <div style={poReferenceTableHeaderCellStyle()}>Item Name</div>
                        <div style={poReferenceTableHeaderCellStyle()}>SKU / Code</div>
                        <div style={poReferenceTableHeaderCellStyle()}>WO Ref</div>
                        <div style={poReferenceTableHeaderCellStyle()}>Assignment ID</div>
                        <div style={poReferenceTableHeaderCellStyle()}>Received Qty</div>
                        <div style={poReferenceTableHeaderCellStyle()}>Received By</div>
                        <div style={poReferenceTableHeaderCellStyle()}>Notes</div>
                        <div style={poReferenceTableHeaderCellStyle()}>Proof Document</div>
                      </div>
                    )}
                {groupedReceiptLogs.length > 0 ? (
                  groupedReceiptLogs.map((log, idx) => (
                    <div
                      key={log.id}
                      style={poReferenceTableRowStyle(
                        "1.2fr 1fr 1.4fr 1fr 1.2fr 1.2fr 0.9fr 1.1fr 1.4fr 1.6fr",
                        idx === groupedReceiptLogs.length - 1,
                        { alignItems: "start", gap: "8px" }
                      )}
                    >
                      <div
                        style={poReferenceTableCellStyle({
                          alignItems: "flex-start",
                          padding: "12px 0",
                        })}
                      >
                        {log.date} · {log.time}
                      </div>
                      <div
                        style={poReferenceTableCellStyle({
                          alignItems: "flex-start",
                          padding: "12px 0",
                        })}
                      >
                        {log.receiptNumber || "-"}
                      </div>
                      <div
                        style={poReferenceTableCellStyle({
                          alignItems: "flex-start",
                          padding: "12px 0",
                          flexDirection: "column",
                          gap: "10px",
                        })}
                      >
                        {(log.items || []).map((item, itemIndex) => (
                          <span
                            key={`${log.id}-item-${item.id || itemIndex}`}
                            style={{
                              fontSize: "var(--text-title-3)",
                              lineHeight: "20px",
                              letterSpacing: "0.09625px",
                              fontWeight: "var(--font-weight-bold)",
                              color: "var(--neutral-on-surface-primary)",
                            }}
                          >
                            {item.item || "-"}
                          </span>
                        ))}
                      </div>
                      <div
                        style={poReferenceTableCellStyle({
                          alignItems: "flex-start",
                          padding: "12px 0",
                          flexDirection: "column",
                          gap: "10px",
                        })}
                      >
                        {(log.items || []).map((item, itemIndex) => (
                          <span
                            key={`${log.id}-code-${item.id || itemIndex}`}
                            style={{
                              fontSize: "var(--text-title-3)",
                              lineHeight: "20px",
                              letterSpacing: "0.09625px",
                              color: "var(--neutral-on-surface-primary)",
                            }}
                          >
                            {item.code || "-"}
                          </span>
                        ))}
                      </div>
                      <div
                        style={poReferenceTableCellStyle({
                          alignItems: "flex-start",
                          padding: "12px 0",
                          flexDirection: "column",
                          gap: "10px",
                        })}
                      >
                        {(log.items || []).map((item, itemIndex) => {
                          const rLine = receiptLines.find(l => l.code === item.code && l.item === item.item) || {};
                          const woRef = item.woRef || rLine.woRef || "-";
                          return (
                            <div
                              key={`${log.id}-woref-${item.id || itemIndex}`}
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "4px",
                                minHeight: "20px",
                              }}
                            >
                              <span
                                onClick={() => {
                                  if (woRef === "-") return;
                                  const woData = MOCK_WO_TABLE_DATA.find(
                                    (w) => w.wo === woRef
                                  );
                                  if (woData) {
                                    onNavigate("work_order_detail", {
                                      ...woData,
                                      from: "purchase_order_detail",
                                      returnTo: {
                                        view: "detail",
                                        data: initialData,
                                      },
                                    });
                                  }
                                }}
                                style={{
                                  fontSize: "var(--text-title-3)",
                                  lineHeight: "20px",
                                  color: woRef !== "-" ? "var(--feature-brand-primary)" : "var(--neutral-on-surface-primary)",
                                  textDecoration: woRef !== "-" ? "underline" : "none",
                                  cursor: woRef !== "-" ? "pointer" : "default",
                                  wordBreak: "break-word",
                                }}
                              >
                                {woRef}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                      <div
                        style={poReferenceTableCellStyle({
                          alignItems: "flex-start",
                          padding: "12px 0",
                          flexDirection: "column",
                          gap: "10px",
                        })}
                      >
                        {(log.items || []).map((item, itemIndex) => {
                          const rLine = receiptLines.find(l => l.code === item.code && l.item === item.item) || {};
                          const assignmentId = item.assignmentId || rLine.assignmentId || "-";
                          const outsourceSteps = item.outsourceSteps || rLine.outsourceSteps || [];
                          const woRef = item.woRef || rLine.woRef || "-";
                          return (
                            <div
                              key={`${log.id}-assign-${item.id || itemIndex}`}
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "4px",
                                minHeight: "20px",
                              }}
                            >
                              {assignmentId !== "-" ? (
                                <span style={{ fontSize: "14px", color: "var(--neutral-on-surface-secondary)", lineHeight: "20px", display: "flex", alignItems: "center" }}>
                                  <span style={{ color: "var(--neutral-on-surface-primary)" }}>{assignmentId}</span>
                                  {outsourceSteps.length > 0 && (
                                    <span style={{ display: "inline-flex", alignItems: "center", marginLeft: "4px" }}>
                                      <Tooltip 
                                        content={
                                          <div style={{ display: "flex", flexDirection: "column", gap: "4px", textAlign: "left" }}>
                                            {outsourceSteps.map(step => {
                                              const woData = MOCK_WO_TABLE_DATA.find(w => w.wo === woRef);
                                              const stage = woData?.routingStages?.find(s => s.step === step);
                                              return <div key={step}>Step {step}: {stage ? `${stage.route} - ${stage.op}` : "Unknown Stage"}</div>;
                                            })}
                                          </div>
                                        } 
                                        position="top"
                                      >
                                        <div style={{ display: "flex", alignItems: "center" }}>
                                          <HelpCircle size={14} color="var(--neutral-on-surface-tertiary)" style={{ cursor: "pointer" }} />
                                        </div>
                                      </Tooltip>
                                    </span>
                                  )}
                                </span>
                              ) : (
                                <span style={{ fontSize: "var(--text-title-3)", lineHeight: "20px" }}>-</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      <div
                        style={poReferenceTableCellStyle({
                          alignItems: "flex-start",
                          padding: "12px 0",
                          flexDirection: "column",
                          gap: "10px",
                        })}
                      >
                        {(log.items || []).map((item, itemIndex) => (
                          <span
                            key={`${log.id}-qty-${item.id || itemIndex}`}
                            style={{
                              fontSize: "var(--text-title-3)",
                              lineHeight: "20px",
                              letterSpacing: "0.09625px",
                              color: "var(--neutral-on-surface-primary)",
                            }}
                          >
                            {item.receivedNow || 0} pcs
                          </span>
                        ))}
                      </div>
                      <div
                        style={poReferenceTableCellStyle({
                          alignItems: "flex-start",
                          padding: "12px 0",
                        })}
                      >
                        {log.receivedBy || "-"}
                      </div>
                      <div
                        style={poReferenceTableCellStyle({
                          alignItems: "flex-start",
                          padding: "12px 0",
                          width: "100%",
                          overflow: "hidden",
                        })}
                      >
                          <span
                            style={{
                              display: "block",
                              fontSize: "var(--text-title-3)",
                              color: "var(--neutral-on-surface-primary)",
                              lineHeight: "1.4",
                              wordBreak: "break-word",
                            }}
                          >
                            {log.notes || "-"}
                          </span>
                      </div>
                      <div
                        style={poReferenceTableCellStyle({
                          alignItems: "flex-start",
                          padding: "12px 0",
                        })}
                      >
                        <ProofDocumentList
                          documents={
                            log.proofDocuments ||
                            log.attachments ||
                            normalizeProofDocuments([], log.proof)
                          }
                        onDocumentClick={(doc) => {
                          showToast(`${doc?.name || "Document"} opened`);
                        }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <div
                    style={{
                      padding: "48px 24px",
                      textAlign: "center",
                      color: "var(--neutral-on-surface-tertiary)",
                      fontSize: "var(--text-title-3)",
                      background: "var(--neutral-surface-primary)",
                      border: "1.5px dashed var(--neutral-line-separator-1)",
                      borderRadius: "16px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      minHeight: "120px",
                    }}
                  >
                    No receipt history yet.
                  </div>
                )}
                  </>
                ) : (
                  <>
                    {groupedReleaseLogs.length > 0 && (
                      <div
                        style={poReferenceTableHeaderRowStyle(
                          "1.2fr 1fr 1.2fr 0.9fr 1fr 1fr 1fr 1.5fr 1.5fr 60px",
                          "8px"
                        )}
                      >
                        <div style={poReferenceTableHeaderCellStyle()}>Release Date & Time</div>
                        <div style={poReferenceTableHeaderCellStyle()}>Release ID</div>
                        <div style={poReferenceTableHeaderCellStyle()}>Item Name</div>
                        <div style={poReferenceTableHeaderCellStyle()}>WO Ref</div>
                        <div style={poReferenceTableHeaderCellStyle()}>Assignment ID</div>
                        <div style={poReferenceTableHeaderCellStyle()}>Release Qty</div>
                        <div style={poReferenceTableHeaderCellStyle()}>Released by</div>
                        <div style={poReferenceTableHeaderCellStyle()}>Notes</div>
                        <div style={poReferenceTableHeaderCellStyle()}>Document</div>
                        <div style={poReferenceTableHeaderCellStyle()}>Export</div>
                      </div>
                    )}
                    {groupedReleaseLogs.length > 0 ? (
                      groupedReleaseLogs.map((log, idx) => (
                        <div
                          key={idx}
                          style={poReferenceTableRowStyle(
                            "1.2fr 1fr 1.2fr 0.9fr 1fr 1fr 1fr 1.5fr 1.5fr 60px",
                            idx === groupedReleaseLogs.length - 1,
                            { alignItems: "start", gap: "8px" }
                          )}
                        >
                          <div style={poReferenceTableCellStyle({ padding: "12px 0", alignItems: "flex-start" })}>{log.date} · {log.time}</div>
                          <div style={poReferenceTableCellStyle({ padding: "12px 0", alignItems: "flex-start" })}>{log.releaseId}</div>
                          <div style={poReferenceTableCellStyle({ padding: "12px 0", alignItems: "flex-start" })}>
                            <span style={{ fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>{log.item}</span>
                          </div>
                          <div style={poReferenceTableCellStyle({ padding: "12px 0", alignItems: "flex-start" })}>
                            <span
                                onClick={() => {
                                  if (log.woRef === "-") return;
                                  const woData = MOCK_WO_TABLE_DATA.find((w) => w.wo === log.woRef);
                                  if (woData) {
                                    onNavigate("work_order_detail", {
                                      ...woData,
                                      from: "purchase_order_detail",
                                      returnTo: { view: "detail", data: initialData },
                                    });
                                  }
                                }}
                                style={{
                                  fontSize: "var(--text-title-3)",
                                  color: log.woRef !== "-" ? "var(--feature-brand-primary)" : "var(--neutral-on-surface-primary)",
                                  textDecoration: log.woRef !== "-" ? "underline" : "none",
                                  cursor: log.woRef !== "-" ? "pointer" : "default",
                                }}
                              >
                                {log.woRef}
                              </span>
                          </div>
                          <div style={poReferenceTableCellStyle({ padding: "12px 0", alignItems: "flex-start" })}>
                            <div style={{ display: "flex", alignItems: "center" }}>
                              <span style={{ color: "var(--neutral-on-surface-primary)", fontSize: "14px" }}>
                                {log.assignmentId}
                              </span>
                              {log.outsourceSteps && log.outsourceSteps.length > 0 && (
                                <span style={{ display: "inline-flex", alignItems: "center", marginLeft: "4px" }}>
                                <Tooltip 
                                  content={
                                    <div style={{ display: "flex", flexDirection: "column", gap: "4px", textAlign: "left" }}>
                                      {log.outsourceSteps.map(step => {
                                        const woData = MOCK_WO_TABLE_DATA.find(w => w.wo === log.woRef);
                                        const stage = woData?.routingStages?.find(s => s.step === step);
                                        return <div key={step}>Step {step}: {stage ? `${stage.route} - ${stage.op}` : "Unknown Stage"}</div>;
                                      })}
                                    </div>
                                  } 
                                  position="top"
                                >
                                  <div style={{ display: "flex", alignItems: "center" }}>
                                    <HelpCircle size={14} color="var(--neutral-on-surface-tertiary)" style={{ cursor: "pointer" }} />
                                  </div>
                                </Tooltip>
                              </span>
                            )}
                            </div>
                          </div>
                          <div style={poReferenceTableCellStyle({ padding: "12px 0", alignItems: "flex-start", fontWeight: "var(--font-weight-bold)" })}>
                            {log.amount} pcs
                          </div>
                          <div style={poReferenceTableCellStyle({ padding: "12px 0", alignItems: "flex-start" })}>{log.sendBy}</div>
                          <div style={poReferenceTableCellStyle({ padding: "12px 0", alignItems: "flex-start", width: "100%", overflow: "hidden" })}>
                              <span style={{ display: "block", fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-primary)", lineHeight: "1.4", wordBreak: "break-word" }}>
                                {log.note || "-"}
                              </span>
                          </div>
                          <div style={poReferenceTableCellStyle({ padding: "12px 0", alignItems: "flex-start" })}>
                            <ProofDocumentList
                              documents={normalizeProofDocuments(log.proofDocuments, null)}
                              onDocumentClick={(doc) => showToast(`${doc?.name || "Document"} opened`)}
                            />
                          </div>
                          <div style={poReferenceTableCellStyle({ padding: "12px 0" })}>
                            <Tooltip content="Export PDF" position="top">
                              <IconButton
                                icon={DownloadIcon}
                                size="small"
                                color="var(--feature-brand-primary)"
                                onClick={async () => {
                                  try {
                                    const woData = MOCK_WO_TABLE_DATA.find(w => w.wo === log.woRef);
                                    const vendorObj = woData?.vendors?.find(v => v.assignmentId === log.assignmentId);
                                    const vendorName = vendorObj?.name || "";
                                    const vendorInfo = MOCK_VENDORS.find(v => v.name === vendorName) || { name: vendorName };
                                    const poNum = typeof initialData === "string" ? initialData : initialData?.poNumber || "-";
                                    await downloadVendorReleasePdf({
                                      log,
                                      poNumber: poNum,
                                      vendorInfo,
                                      company: MOCK_COMPANY,
                                      woRoutingStages: woData?.routingStages || [],
                                    });
                                  } catch (e) {
                                    showToast("Failed to export PDF");
                                  }
                                }}
                              />
                            </Tooltip>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div
                        style={{
                          padding: "48px 24px",
                          textAlign: "center",
                          color: "var(--neutral-on-surface-tertiary)",
                          fontSize: "var(--text-title-3)",
                          background: "var(--neutral-surface-primary)",
                          border: "1.5px dashed var(--neutral-line-separator-1)",
                          borderRadius: "16px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          minHeight: "120px",
                        }}
                      >
                        No release history yet.
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PoReceiptsTab;
