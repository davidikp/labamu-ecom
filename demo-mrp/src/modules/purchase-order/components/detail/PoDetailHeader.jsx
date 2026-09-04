import React from "react";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  EditIcon,
  FileText,
  Info,
} from "../../../../components/icons/Icons.jsx";
import {
  Button,
  StatusBadge,
  LabelValue,
  tabButtonStyle,
} from "./shared/PoDetailSharedComponents.jsx";


const PoDetailHeader = ({
  // Data & State
  poNumber,
  currentStatus,
  currentBadge,
  displayVersionNum,
  latestVersionNum,
  versions,
  isVersionMenuOpen,
  activeTab,
  isHistoricalVersion,
  isExportingPdf,
  initialData,
  createdDate,
  actualCreatedDate,
  expectedDeliveryDate,
  currencyLabel,
  paymentStatus,
  revisionMessage,
  canceledMessage,
  showHeaderEdit,
  showHeaderExportPdf,
  // Handlers
  handleBackNavigation,
  handleEditPo,
  handleExportPdf,
  setIsVersionMenuOpen,
  setSelectedVersionNum,
  setActiveTab,
  handleRevisePo,
  openDecisionModal,
}) => {
  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "8px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
              marginLeft: "-4px",
            }}
            onClick={handleBackNavigation}
          >
            <ChevronLeftIcon
              size={28}
              color="var(--neutral-on-surface-primary)"
            />
            <h1
              style={{
                margin: 0,
                fontSize: "var(--text-large-title)",
                fontWeight: "var(--font-weight-bold)",
              }}
            >
              Purchase Order Detail
            </h1>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "var(--text-title-3)",
            }}
          >
            <span
              style={{
                color: "var(--neutral-on-surface-secondary)",
                cursor: "pointer",
              }}
              onClick={handleBackNavigation}
            >
              {initialData?.from === "material_detail"
                ? "Materials"
                : "Purchase Order"}
            </span>
            <span style={{ color: "var(--neutral-on-surface-tertiary)" }}>
              /
            </span>
            <span style={{ color: "var(--neutral-on-surface-tertiary)" }}>
              Purchase Order Detail
            </span>
          </div>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          {showHeaderEdit ? (
            <Button
              variant="outlined"
              leftIcon={EditIcon}
              onClick={handleEditPo}
            >
              Edit PO
            </Button>
          ) : null}
          {showHeaderExportPdf ? (
            <Button
              variant="outlined"
              leftIcon={FileText}
              disabled={isExportingPdf || isHistoricalVersion}
              onClick={handleExportPdf}
            >
              {isExportingPdf ? "Exporting PDF..." : "Export as PDF"}
            </Button>
          ) : null}
        </div>
      </div>

      {currentStatus === "Need Revision" || currentStatus === "Canceled" ? (
        <div
          style={{
            border: `1px solid ${
              currentStatus === "Need Revision" ? "#F5B342" : "#E04B45"
            }`,
            background:
              currentStatus === "Need Revision" ? "#F8EFDF" : "#F8E6E8",
            borderRadius: "16px",
            padding: "20px 24px",
            display: "flex",
            alignItems: "flex-start",
            gap: "12px",
          }}
        >
          <Info
            size={16}
            strokeWidth={2.1}
            color={
              currentStatus === "Need Revision"
                ? "var(--status-orange-primary)"
                : "var(--status-red-primary)"
            }
            style={{ flexShrink: 0, marginTop: "2px" }}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <span
              style={{
                fontSize: "var(--text-title-2)",
                fontWeight: "var(--font-weight-bold)",
                color: "var(--neutral-on-surface-primary)",
              }}
            >
              {currentStatus === "Need Revision"
                ? "Revision Requested"
                : "Purchase Order Canceled"}
            </span>
            <span
              style={{
                fontSize: "var(--text-title-3)",
                color: "var(--neutral-on-surface-primary)",
                lineHeight: "1.6",
              }}
            >
              {currentStatus === "Need Revision"
                ? revisionMessage
                : canceledMessage}
            </span>
          </div>
        </div>
      ) : null}

      <div
        style={{
          background: "var(--neutral-surface-primary)",
          borderRadius: "16px",
          border: "1px solid var(--neutral-line-separator-1)",
          overflow: "visible",
        }}
      >
        <div
          style={{
            padding: "20px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span
              style={{
                fontSize: "var(--text-headline)",
                fontWeight: "var(--font-weight-bold)",
                color: "var(--neutral-on-surface-primary)",
              }}
            >
              {poNumber}
            </span>
            {versions.length > 0 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  position: "relative",
                }}
              >
                <StatusBadge variant="grey-light">
                  Version {displayVersionNum}.0
                </StatusBadge>
                <div
                  style={{
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    padding: "4px",
                    borderRadius: "4px",
                    background: isVersionMenuOpen
                      ? "var(--neutral-surface-grey-lighter)"
                      : "transparent",
                  }}
                  onClick={() => setIsVersionMenuOpen(!isVersionMenuOpen)}
                >
                  <ChevronDownIcon
                    size={16}
                    color="var(--neutral-on-surface-secondary)"
                  />
                </div>
                {isVersionMenuOpen && (
                  <>
                    <div
                      style={{
                        position: "fixed",
                        inset: 0,
                        zIndex: 999,
                        background: "transparent",
                      }}
                      onClick={() => setIsVersionMenuOpen(false)}
                    />
                    <div
                      style={{
                        position: "absolute",
                        top: "calc(100% + 8px)",
                        left: 0,
                        background: "var(--neutral-surface-primary)",
                        borderRadius: "12px",
                        boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.12)",
                        border: "1px solid var(--neutral-line-separator-1)",
                        zIndex: 1000,
                        width: "200px",
                        overflow: "hidden",
                      }}
                    >
                      {[...versions].reverse().map((v) => (
                        <div
                          key={v.version}
                          style={{
                            padding: "12px 16px",
                            cursor: "pointer",
                            background:
                              displayVersionNum === v.version
                                ? "var(--feature-brand-container-lighter)"
                                : "transparent",
                            color:
                              displayVersionNum === v.version
                                ? "var(--feature-brand-primary)"
                                : "var(--neutral-on-surface-primary)",
                            fontSize: "var(--text-title-3)",
                            borderBottom:
                              "1px solid var(--neutral-line-separator-1)",
                          }}
                          onClick={() => {
                            setSelectedVersionNum(v.version);
                            setIsVersionMenuOpen(false);
                          }}
                        >
                          Version {v.version}.0 ({v.date})
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
          {!isHistoricalVersion && (
            <StatusBadge variant={currentBadge}>{currentStatus}</StatusBadge>
          )}
        </div>
        <div
          style={{
            margin: "0 24px",
            borderTop: "1px solid var(--neutral-line-separator-1)",
          }}
        />
        <div
          style={{
            padding: "16px 24px",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "24px" }}>
            <LabelValue label="PO Date" value={createdDate} />
            <LabelValue label="Expected Delivery Date" value={expectedDeliveryDate ?? null} />
            <LabelValue label="Currency" value={currencyLabel} />
            <LabelValue
              label="Payment Status"
              badge={paymentStatus ? {
                text: paymentStatus,
                variant: paymentStatus === "Paid" ? "green-light"
                  : paymentStatus === "Overdue" ? "red-light"
                  : paymentStatus === "Partially Paid" ? "blue-light"
                  : "grey-light",
              } : null}
              value={paymentStatus ? undefined : "-"}
            />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "24px" }}>
            <LabelValue label="Created By" value="Joko" />
            <LabelValue label="Created Date" value={actualCreatedDate ?? createdDate} />
          </div>
        </div>
      </div>

      {!isHistoricalVersion ? (
        <div
          style={{
            display: "flex",
            gap: "12px",
            alignItems: "center",
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab("details")}
            style={tabButtonStyle(activeTab === "details")}
          >
            PO Detail
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("invoices")}
            style={tabButtonStyle(activeTab === "invoices")}
          >
            Invoices & Payments
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("receipt")}
            style={tabButtonStyle(activeTab === "receipt")}
          >
            Receipt
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("3-ways-match")}
            style={tabButtonStyle(activeTab === "3-ways-match")}
          >
            3-Ways Match
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("documents")}
            style={tabButtonStyle(activeTab === "documents")}
          >
            Documents
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("logs")}
            style={tabButtonStyle(activeTab === "logs")}
          >
            Logs
          </button>
        </div>
      ) : (
        <div
          style={{
            background: "var(--feature-brand-container-lighter)",
            padding: "12px 20px",
            borderRadius: "12px",
            border: "1px solid var(--feature-brand-primary-light)",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            color: "var(--feature-brand-primary)",
            fontSize: "var(--text-body)",
          }}
        >
          <Info size={20} />
          <span>
            You are viewing Version {displayVersionNum}.0 (view only). To see the
            current version, select Version {latestVersionNum}.0 in the version
            selector.
          </span>
        </div>
      )}
    </>
  );
};

export default PoDetailHeader;
