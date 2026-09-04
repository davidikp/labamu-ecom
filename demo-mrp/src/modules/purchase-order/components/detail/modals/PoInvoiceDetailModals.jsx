import React from "react";
import { GeneralModal } from "../../../../../components/modal/GeneralModal.jsx";
import { IconButton } from "../../../../../components/common/IconButton.jsx";
import {
  EditIcon,
  CloseIcon,
  Box,
  CalendarIcon,
  FileText,
  Trash2,
} from "../../../../../components/icons/Icons.jsx";
import {
  Button,
  StatusBadge,
} from "../shared/PoDetailSharedComponents.jsx";
import { DocumentTypeBadge } from "../../DocumentTypeBadge.jsx";

const PoInvoiceDetailModals = ({
  // Payment History Modal Props
  showPaymentHistoryModal,
  setShowPaymentHistoryModal,
  selectedInvoiceForHistory,
  formatCurrency,
  currency,
  getInvoiceMetrics,
  systemTableShellStyle,
  systemTableHeaderCellStyle,
  systemTableCellStyle,
  systemTableEmptyStateStyle,

  // Invoice Detail Drawer Props
  showInvoiceDetailDrawer,
  setShowInvoiceDetailDrawer,
  selectedInvoiceForDetail,
  handleEditInvoice,
  getInvoiceStatus,
  getAgingStatus,
  activeInvoiceTab,
  setActiveInvoiceTab,
  mockLines,
  formatIsoDateString,
  setPaymentToVoid,
  setShowVoidConfirmModal,
  setShowDeleteInvoiceConfirm,
  setSelectedInvoiceForPayment,
  setPaymentFormData,
  paymentFormData,
  setShowAddPaymentDrawer,
}) => {
  return (
    <>
      {/* Payment History Modal */}
      <GeneralModal
        isOpen={showPaymentHistoryModal}
        onClose={() => setShowPaymentHistoryModal(false)}
        title="Payment History"
        width="800px"
        footer={
          <Button
            variant="filled"
            size="large"
            onClick={() => setShowPaymentHistoryModal(false)}
            style={{ width: "100%" }}
          >
            Close
          </Button>
        }
      >
        {selectedInvoiceForHistory && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "16px",
                padding: "16px",
                background: "var(--neutral-surface-primary)",
                border: "1px solid var(--neutral-line-separator-1)",
                borderRadius: "var(--radius-md)",
              }}
            >
              <div
                style={{ display: "flex", flexDirection: "column", gap: "4px" }}
              >
                <span
                  style={{
                    fontSize: "var(--text-desc)",
                    color: "var(--neutral-on-surface-tertiary)",
                  }}
                >
                  Invoice No
                </span>
                <span style={{ fontWeight: "var(--font-weight-bold)" }}>
                  {selectedInvoiceForHistory.number}
                </span>
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: "4px" }}
              >
                <span
                  style={{
                    fontSize: "var(--text-desc)",
                    color: "var(--neutral-on-surface-tertiary)",
                  }}
                >
                  Invoice Amount
                </span>
                <span style={{ fontWeight: "var(--font-weight-bold)" }}>
                  {formatCurrency(selectedInvoiceForHistory.amount, currency)}
                </span>
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: "4px" }}
              >
                <span
                  style={{
                    fontSize: "var(--text-desc)",
                    color: "var(--neutral-on-surface-tertiary)",
                  }}
                >
                  Due Date
                </span>
                <span style={{ fontWeight: "var(--font-weight-bold)" }}>
                  {selectedInvoiceForHistory.dueDate}
                </span>
              </div>
            </div>

            <div style={systemTableShellStyle}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.2fr 1fr 1.2fr 2fr 1.5fr",
                  background: "var(--neutral-surface-primary)",
                  borderBottom: "1px solid var(--neutral-line-separator-1)",
                }}
              >
                <div style={systemTableHeaderCellStyle()}>Payment Date</div>
                <div style={systemTableHeaderCellStyle()}>Amount</div>
                <div style={systemTableHeaderCellStyle()}>Method</div>
                <div style={systemTableHeaderCellStyle()}>Proof</div>
                <div style={systemTableHeaderCellStyle()}>Notes</div>
              </div>
              {getInvoiceMetrics(selectedInvoiceForHistory).payments.length >
              0 ? (
                getInvoiceMetrics(selectedInvoiceForHistory).payments.map(
                  (pay, idx, arr) => (
                    <div
                      key={pay.id}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1.2fr 1fr 1.2fr 2fr 1.5fr",
                        borderBottom:
                          idx === arr.length - 1
                            ? "none"
                            : "1px solid var(--neutral-line-separator-1)",
                        alignItems: "center",
                      }}
                    >
                      <div style={systemTableCellStyle()}>{pay.date}</div>
                      <div
                        style={systemTableCellStyle({
                          fontWeight: "var(--font-weight-bold)",
                        })}
                      >
                        {formatCurrency(pay.amount, currency)}
                      </div>
                      <div style={systemTableCellStyle()}>{pay.method}</div>
                      <div style={systemTableCellStyle()}>
                        {pay.proof ? (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "12px",
                            }}
                          >
                            <DocumentTypeBadge fileName={pay.proof} />
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                overflow: "hidden",
                              }}
                            >
                              <span
                                style={{
                                  color: "var(--feature-brand-primary)",
                                  fontSize: "14px",
                                  fontWeight: "var(--font-weight-bold)",
                                  cursor: "pointer",
                                }}
                              >
                                Proof Document
                              </span>
                              <span
                                style={{
                                  color: "var(--neutral-on-surface-tertiary)",
                                  fontSize: "12px",
                                  cursor: "pointer",
                                  whiteSpace: "nowrap",
                                  textOverflow: "ellipsis",
                                  overflow: "hidden",
                                }}
                              >
                                {pay.proof}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span
                            style={{
                              color: "var(--neutral-on-surface-tertiary)",
                            }}
                          >
                            No proof
                          </span>
                        )}
                      </div>
                      <div
                        style={systemTableCellStyle({
                          fontSize: "var(--text-body)",
                        })}
                      >
                        {pay.notes || "-"}
                      </div>
                    </div>
                  )
                )
              ) : (
                <div style={systemTableEmptyStateStyle}>
                  No payments recorded yet.
                </div>
              )}
            </div>
          </div>
        )}
      </GeneralModal>

      {/* Invoice Detail Drawer */}
      {showInvoiceDetailDrawer && selectedInvoiceForDetail && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 3000,
            display: "flex",
            justifyContent: "flex-end",
          }}
          onClick={() => setShowInvoiceDetailDrawer(false)}
        >
          <div
            style={{
              width: "600px",
              height: "100%",
              backgroundColor: "white",
              display: "flex",
              flexDirection: "column",
              animation: "slideIn 0.3s ease-out",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div
              style={{
                padding: "24px",
                borderBottom: "1px solid var(--neutral-line-separator-1)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: "var(--text-title-1)",
                  fontWeight: "var(--font-weight-bold)",
                  color: "var(--neutral-on-surface-primary)",
                }}
              >
                Invoice Detail
              </h2>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Button
                  variant="secondary"
                  size="small"
                  leftIcon={EditIcon}
                  onClick={handleEditInvoice}
                >
                  Edit
                </Button>
                <IconButton
                  icon={CloseIcon}
                  onClick={() => setShowInvoiceDetailDrawer(false)}
                  color="var(--neutral-on-surface-primary)"
                />
              </div>
            </div>

            {/* Drawer Body */}
            <div
              style={{
                padding: "24px",
                flex: 1,
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: "24px",
                background: "#FFFFFF",
                minHeight: 0,
              }}
            >
              {/* Invoice Information Card */}
              <div
                style={{
                  background: "var(--neutral-surface-primary)",
                  borderRadius: "16px",
                  border: "1px solid var(--neutral-line-separator-1)",
                  overflow: "hidden",
                  height: "fit-content",
                  flexShrink: 0,
                }}
              >
                {/* Row 1: Number & Status */}
                <div
                  style={{
                    padding: "16px 20px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: "16px",
                      fontWeight: "var(--font-weight-bold)",
                      color: "var(--neutral-on-surface-primary)",
                    }}
                  >
                    {selectedInvoiceForDetail.number}
                  </span>
                  {(() => {
                    const status = getInvoiceStatus(
                      selectedInvoiceForDetail,
                      getInvoiceMetrics(selectedInvoiceForDetail)
                    );
                    return (
                      <StatusBadge variant={status.variant}>
                        {status.text}
                      </StatusBadge>
                    );
                  })()}
                </div>

                <div
                  style={{
                    height: "1px",
                    background: "var(--neutral-line-separator-1)",
                    margin: "0 20px",
                  }}
                />

                {/* Row 2 & 3: Info Grid */}
                <div
                  style={{
                    padding: "20px",
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: "24px 16px",
                    height: "fit-content",
                  }}
                >
                  {/* Row 2 items */}
                  <div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "var(--neutral-on-surface-tertiary)",
                        marginBottom: "4px",
                      }}
                    >
                      Invoice Date
                    </div>
                    <div
                      style={{ fontSize: "14px", fontWeight: "var(--font-weight-bold)" }}
                    >
                      {selectedInvoiceForDetail.date}
                    </div>
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "var(--neutral-on-surface-tertiary)",
                        marginBottom: "4px",
                      }}
                    >
                      Payment Terms
                    </div>
                    <div
                      style={{ fontSize: "14px", fontWeight: "var(--font-weight-bold)" }}
                    >
                      {selectedInvoiceForDetail.terms}
                    </div>
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "var(--neutral-on-surface-tertiary)",
                        marginBottom: "4px",
                      }}
                    >
                      Due Date
                    </div>
                    <div
                      style={{ fontSize: "14px", fontWeight: "var(--font-weight-bold)" }}
                    >
                      {selectedInvoiceForDetail.dueDate}
                    </div>
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "var(--neutral-on-surface-tertiary)",
                        marginBottom: "4px",
                      }}
                    >
                      Aging Status
                    </div>
                    {(() => {
                      const aging = getAgingStatus(
                        selectedInvoiceForDetail.dueDate,
                        getInvoiceMetrics(selectedInvoiceForDetail).outstanding
                      );
                      return (
                        <StatusBadge variant={aging.variant}>
                          {aging.text}
                        </StatusBadge>
                      );
                    })()}
                  </div>

                  {/* Row 3: Payment Info */}
                  <div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "var(--neutral-on-surface-tertiary)",
                        marginBottom: "4px",
                      }}
                    >
                      Bank Name
                    </div>
                    <div
                      style={{ fontSize: "14px", fontWeight: "var(--font-weight-bold)" }}
                    >
                      {selectedInvoiceForDetail.bankName || "-"}
                    </div>
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "var(--neutral-on-surface-tertiary)",
                        marginBottom: "4px",
                      }}
                    >
                      Account Number
                    </div>
                    <div
                      style={{ fontSize: "14px", fontWeight: "var(--font-weight-bold)" }}
                    >
                      {selectedInvoiceForDetail.accountNumber || "-"}
                    </div>
                  </div>
                  <div style={{ gridColumn: "span 2" }}>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "var(--neutral-on-surface-tertiary)",
                        marginBottom: "4px",
                      }}
                    >
                      Account Name
                    </div>
                    <div
                      style={{ fontSize: "14px", fontWeight: "var(--font-weight-bold)" }}
                    >
                      {selectedInvoiceForDetail.accountName || "-"}
                    </div>
                  </div>

                  {/* Row 4 items (shifted from Row 3) */}
                  <div style={{ gridColumn: "span 2" }}>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "var(--neutral-on-surface-tertiary)",
                        marginBottom: "4px",
                      }}
                    >
                      Notes
                    </div>
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: "var(--font-weight-bold)",
                        color: "var(--neutral-on-surface-primary)",
                        lineHeight: "1.5",
                      }}
                    >
                      {selectedInvoiceForDetail.notes || "-"}
                    </div>
                  </div>
                  <div style={{ gridColumn: "span 2" }}>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "var(--neutral-on-surface-tertiary)",
                        marginBottom: "8px",
                      }}
                    >
                      Invoice File
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        overflow: "hidden",
                      }}
                    >
                      {/* PDF Custom Icon */}
                      <div
                        style={{
                          width: "24px",
                          height: "24px",
                          background: "#E31B23",
                          borderRadius: "3px",
                          position: "relative",
                          display: "flex",
                          alignItems: "flex-end",
                          justifyContent: "center",
                          paddingBottom: "2px",
                          flexShrink: 0,
                          clipPath:
                            "polygon(0 0, 16px 0, 24px 8px, 24px 24px, 0 24px)",
                        }}
                      >
                        {/* Fold */}
                        <div
                          style={{
                            position: "absolute",
                            top: 0,
                            right: 0,
                            width: "8px",
                            height: "8px",
                            background: "#B3151A",
                            borderBottomLeftRadius: "1px",
                          }}
                        />
                        <span
                          style={{
                            color: "white",
                            fontSize: "6px",
                            fontWeight: "800",
                            letterSpacing: "0.2px",
                          }}
                        >
                          PDF
                        </span>
                      </div>
                      <div
                        title={
                          selectedInvoiceForDetail.attachments?.[0]?.name ||
                          selectedInvoiceForDetail.attachment?.name ||
                          "Invoice.pdf"
                        }
                        style={{
                          fontSize: "14px",
                          fontWeight: "var(--font-weight-bold)",
                          color: "var(--feature-brand-primary)",
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: "280px",
                          textDecoration: "underline",
                        }}
                      >
                        {selectedInvoiceForDetail.attachments?.[0]?.name ||
                          selectedInvoiceForDetail.attachment?.name ||
                          "Invoice.pdf"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Settlement Progress Card */}
              <div
                style={{
                  background: "var(--neutral-surface-primary)",
                  borderRadius: "16px",
                  border: "1px solid var(--neutral-line-separator-1)",
                  padding: "16px 20px",
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    fontSize: "16px",
                    fontWeight: "var(--font-weight-bold)",
                    color: "var(--neutral-on-surface-primary)",
                    marginBottom: "16px",
                  }}
                >
                  Settlement Progress
                </div>

                <div
                  style={{
                    height: "10px",
                    background: "#F5F5F5",
                    borderRadius: "100px",
                    overflow: "hidden",
                    marginBottom: "20px",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${
                        (getInvoiceMetrics(selectedInvoiceForDetail).paid /
                          getInvoiceMetrics(selectedInvoiceForDetail).total) *
                        100
                      }%`,
                      background: (() => {
                        const pct = (getInvoiceMetrics(selectedInvoiceForDetail).paid / (getInvoiceMetrics(selectedInvoiceForDetail).total || 1)) * 100;
                        if (pct >= 100) return "var(--status-green-primary)";
                        if (pct >= 75) return "var(--feature-brand-primary)";
                        if (pct >= 50) return "var(--status-yellow-primary)";
                        if (pct >= 25) return "var(--status-orange-primary)";
                        return "var(--status-red-primary)";
                      })(),
                      borderRadius: "100px",
                    }}
                  />
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: "24px",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "var(--neutral-on-surface-tertiary)",
                        marginBottom: "4px",
                      }}
                    >
                      Total Paid
                    </div>
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: "var(--font-weight-bold)",
                        color: (() => {
                          const pct = (getInvoiceMetrics(selectedInvoiceForDetail).paid / (getInvoiceMetrics(selectedInvoiceForDetail).total || 1)) * 100;
                          if (pct >= 100) return "var(--status-green-primary)";
                          if (pct >= 75) return "var(--feature-brand-primary)";
                          if (pct >= 50) return "var(--status-yellow-primary)";
                          if (pct >= 25) return "var(--status-orange-primary)";
                          return "var(--status-red-primary)";
                        })(),
                      }}
                    >
                      {formatCurrency(
                        getInvoiceMetrics(selectedInvoiceForDetail).paid,
                        currency
                      )}
                    </div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "var(--neutral-on-surface-tertiary)",
                        marginBottom: "4px",
                      }}
                    >
                      Outstanding
                    </div>
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: "var(--font-weight-bold)",
                        color: "var(--neutral-on-surface-primary)",
                      }}
                    >
                      {formatCurrency(
                        getInvoiceMetrics(selectedInvoiceForDetail).outstanding,
                        currency
                      )}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "var(--neutral-on-surface-tertiary)",
                        marginBottom: "4px",
                      }}
                    >
                      Total Invoiced
                    </div>
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: "var(--font-weight-bold)",
                        color: "var(--neutral-on-surface-primary)",
                      }}
                    >
                      {formatCurrency(
                        getInvoiceMetrics(selectedInvoiceForDetail).total,
                        currency
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Chip Tabs */}
              <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                {["Item Lines", "Payment History"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveInvoiceTab(tab)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "100px",
                      border: "1px solid",
                      borderColor:
                        activeInvoiceTab === tab
                          ? "var(--feature-brand-primary)"
                          : "var(--neutral-line-separator-1)",
                      background:
                        activeInvoiceTab === tab
                          ? "var(--feature-brand-container-lighter)"
                          : "var(--neutral-surface-primary)",
                      color:
                        activeInvoiceTab === tab
                          ? "var(--feature-brand-primary)"
                          : "var(--neutral-on-surface-secondary)",
                      fontSize: "14px",
                      fontWeight: activeInvoiceTab === tab ? "600" : "400",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              {activeInvoiceTab === "Item Lines" ? (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: "12px" }}
                >
                  {(selectedInvoiceForDetail.itemLines || []).map((line, idx) => {
                    const originalLine = mockLines.find(
                      (l) =>
                        String(l.id) === String(line.id) || l.item === line.id
                    );
                    return (
                      <div
                        key={idx}
                        style={{
                          background: "var(--neutral-surface-primary)",
                          borderRadius: "12px",
                          border: "1px solid var(--neutral-line-separator-1)",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            padding: "16px",
                            display: "flex",
                            alignItems: "center",
                            gap: "16px",
                          }}
                        >
                          <div
                            style={{
                              width: "40px",
                              height: "40px",
                              background: "#F5F5F5",
                              borderRadius: "8px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Box
                              size={20}
                              color="var(--neutral-on-surface-tertiary)"
                            />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div
                              style={{
                                fontSize: "15px",
                                fontWeight: "var(--font-weight-bold)",
                              }}
                            >
                              {originalLine?.item || line.id}
                            </div>
                            <div
                              style={{
                                fontSize: "12px",
                                color: "var(--neutral-on-surface-tertiary)",
                                marginTop: "2px",
                              }}
                            >
                              Name in Document:{" "}
                              {line.ocrRef && line.ocrRef !== "-"
                                ? line.ocrRef
                                : (originalLine?.item || line.id).toUpperCase()}
                            </div>
                          </div>
                          <div
                            style={{
                              fontSize: "16px",
                              fontWeight: "var(--font-weight-bold)",
                              color: "var(--neutral-on-surface-primary)",
                            }}
                          >
                            {line.qty}{" "}
                            {originalLine?.type === "material"
                              ? originalLine?.uom || "Unit"
                              : "Pcs"}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: "12px" }}
                >
                  {getInvoiceMetrics(selectedInvoiceForDetail).payments.length >
                  0 ? (
                    getInvoiceMetrics(selectedInvoiceForDetail).payments.map(
                      (pay) => {
                        return (
                          <div
                            key={pay.id}
                            style={{
                              background: "var(--neutral-surface-primary)",
                              borderRadius: "12px",
                              border: "1px solid var(--neutral-line-separator-1)",
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                padding: "16px",
                                display: "flex",
                                alignItems: "flex-start",
                                gap: "16px",
                              }}
                            >
                              <div
                                style={{
                                  width: "40px",
                                  height: "40px",
                                  background:
                                    "var(--feature-brand-container-lighter)",
                                  borderRadius: "8px",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <CalendarIcon
                                  size={20}
                                  color="var(--feature-brand-primary)"
                                />
                              </div>
                              <div style={{ flex: 1 }}>
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    marginBottom: "4px",
                                  }}
                                >
                                  <div
                                    style={{
                                      fontSize: "15px",
                                      fontWeight: "var(--font-weight-bold)",
                                      textDecoration: pay.isVoid
                                        ? "line-through"
                                        : "none",
                                      color: pay.isVoid
                                        ? "var(--neutral-on-surface-tertiary)"
                                        : "inherit",
                                    }}
                                  >
                                    {pay.id}
                                  </div>
                                   <StatusBadge
                                     variant={(() => {
                                       if (pay.isVoid) return "grey-light";
                                       const m = String(pay.method || "").toLowerCase();
                                       if (m.includes("cash")) return "green-light";
                                       if (m.includes("transfer")) return "blue-light";
                                       if (m.includes("giro")) return "grey-light";
                                       return "blue-light";
                                     })()}
                                   >
                                     {pay.isVoid ? "Voided" : pay.method}
                                   </StatusBadge>
                                </div>
                                <div
                                  style={{
                                    fontSize: "14px",
                                    color: "var(--neutral-on-surface-secondary)",
                                    marginBottom: "4px",
                                  }}
                                >
                                  {pay.date}
                                </div>
                                {pay.notes && (
                                  <div
                                    style={{
                                      fontSize: "14px",
                                      color: "var(--neutral-on-surface-secondary)",
                                      marginBottom: "4px",
                                    }}
                                  >
                                    {pay.notes}
                                  </div>
                                )}
                                {pay.proof && (
                                  <div
                                    style={{
                                      fontSize: "13px",
                                      color: "var(--feature-brand-primary)",
                                      marginTop: "4px",
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "6px",
                                    }}
                                  >
                                    <FileText size={14} />
                                    {pay.proof}
                                  </div>
                                )}
                                {(pay.addedBy || pay.createdAt) && (
                                  <div
                                    style={{
                                      fontSize: "12px",
                                      color: "var(--neutral-on-surface-secondary)",
                                      marginTop: "4px",
                                    }}
                                  >
                                    Added by {pay.addedBy || "System"} •{" "}
                                    {pay.createdAt
                                      ? `${formatIsoDateString(
                                          new Date(pay.createdAt)
                                        )} ${new Date(
                                          pay.createdAt
                                        ).toLocaleTimeString([], {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                          hour12: false,
                                        })}`
                                      : "Unknown"}
                                  </div>
                                )}
                              </div>
                              <div
                                style={{
                                  textAlign: "right",
                                  display: "flex",
                                  flexDirection: "column",
                                  justifyContent: "space-between",
                                  height: "100%",
                                  minHeight: "80px",
                                }}
                              >
                                <div
                                  style={{
                                    fontSize: "15px",
                                    fontWeight: "var(--font-weight-bold)",
                                    color: pay.isVoid
                                      ? "var(--neutral-on-surface-tertiary)"
                                      : "var(--neutral-on-surface-primary)",
                                    textDecoration: pay.isVoid
                                      ? "line-through"
                                      : "none",
                                  }}
                                >
                                  {formatCurrency(pay.amount, currency)}
                                </div>
                                {!pay.isVoid && (
                                  <Button
                                    variant="danger"
                                    size="small"
                                    onClick={() => {
                                      setPaymentToVoid(pay);
                                      setShowVoidConfirmModal(true);
                                    }}
                                    style={{ minWidth: "fit-content" }}
                                  >
                                    Void
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      }
                    )
                  ) : (
                    <div
                      style={{
                        padding: "40px",
                        textAlign: "center",
                        background: "var(--neutral-surface-primary)",
                        borderRadius: "12px",
                        border: "1px solid var(--neutral-line-separator-1)",
                        color: "var(--neutral-on-surface-tertiary)",
                      }}
                    >
                      No payment history recorded yet.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Drawer Footer */}
            <div
              style={{
                padding: "20px 24px",
                borderTop: "1px solid var(--neutral-line-separator-1)",
                display: "flex",
                gap: "12px",
                background: "var(--neutral-surface-primary)",
              }}
            >
              <IconButton
                icon={Trash2}
                size="large"
                color="var(--status-red-primary)"
                onClick={() => setShowDeleteInvoiceConfirm(true)}
                style={{
                  borderColor: "var(--status-red-primary)",
                  border: "1px solid var(--status-red-primary)",
                  borderRadius: "12px",
                }}
              />
              <Button
                variant="filled"
                size="large"
                onClick={() => {
                  setSelectedInvoiceForPayment(selectedInvoiceForDetail);
                  setPaymentFormData({
                    ...paymentFormData,
                    amount: "",
                  });
                  setShowInvoiceDetailDrawer(false);
                  setShowAddPaymentDrawer(true);
                }}
                disabled={
                  getInvoiceMetrics(selectedInvoiceForDetail).outstanding <= 0
                }
                style={{ flex: 1 }}
              >
                Add Payment
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PoInvoiceDetailModals;
