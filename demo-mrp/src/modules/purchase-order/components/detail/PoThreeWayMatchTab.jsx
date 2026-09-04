import React from "react";
import {
  CheckCircleIcon,
  CanceledCircleIcon,
  ImageAssetIcon,
} from "../../../../components/icons/Icons.jsx";
import { TablePaginationFooter } from "../../../../components/table/TablePaginationFooter.jsx";
import {
  StatusBadge,
  Tooltip,
} from "./shared/PoDetailSharedComponents.jsx";

const PoThreeWayMatchTab = ({
  threeWaysMatchData,
  threeWaysMatchCurrentPage,
  threeWaysMatchRowsPerPage,
  setThreeWaysMatchCurrentPage,
  setThreeWaysMatchRowsPerPage,
  getImageUploadPreviewUrl,
}) => {
  return (
    <div
      style={{
        background: "var(--neutral-surface-primary)",
        borderRadius: "16px",
        border: "1px solid var(--neutral-line-separator-1)",
        overflow: "hidden",
      }}
    >
      <div style={{ padding: "20px 0 0 0" }}>
        <div
          style={{
            border: "none",
            borderRadius: "0",
            overflow: "hidden",
            width: "100%",
          }}
        >
          <div
            style={{
              overflowX: threeWaysMatchData.length > 0 ? "auto" : "hidden",
              width: "100%",
            }}
          >
            <div
              style={{
                minWidth: "100%",
                width: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {threeWaysMatchData.length > 0 && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "80px 1fr 140px 160px 160px",
                    gap: "12px",
                    padding: "0 24px",
                    height: "49px",
                    alignItems: "center",
                    background: "var(--neutral-surface-primary)",
                    position: "relative",
                    width: "100%",
                    boxSizing: "border-box",
                    fontSize: "var(--text-title-3)",
                    fontWeight: "var(--font-weight-bold)",
                    color: "var(--neutral-on-surface-primary)",
                  }}
                >
                  <div style={{ textAlign: "left", justifySelf: "start" }}>
                    Type
                  </div>
                  <div
                    style={{
                      textAlign: "left",
                      justifySelf: "start",
                      minWidth: 0,
                      overflow: "hidden",
                    }}
                  >
                    Item
                  </div>
                  <div style={{ textAlign: "left", justifySelf: "start" }}>
                    PO Qty
                  </div>
                  <div style={{ textAlign: "left", justifySelf: "start" }}>
                    Invoiced Qty
                  </div>
                  <div style={{ textAlign: "left", justifySelf: "start" }}>
                    Received Qty
                  </div>
                  <div
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      left: 0,
                      right: 0,
                      bottom: 0,
                      height: "1px",
                      background: "var(--neutral-line-separator-1)",
                      pointerEvents: "none",
                    }}
                  />
                </div>
              )}

              {threeWaysMatchData.length > 0 ? (
                threeWaysMatchData.map((line, idx) => {
                  const isWO = line.type === "wo";
                  const isReceivedMatched = line.receivedQty === line.qty;
                  const isInvoicedMatched = line.invoicedQty === line.qty;
                  const quantityLabel =
                    line.type === "material" && line.uom
                      ? `${line.qty} ${line.uom}`
                      : `${line.qty} Pcs`;
                  const receivedLabel =
                    line.type === "material" && line.uom
                      ? `${line.receivedQty} ${line.uom}`
                      : `${line.receivedQty} Pcs`;
                  const invoicedLabel =
                    line.type === "material" && line.uom
                      ? `${line.invoicedQty} ${line.uom}`
                      : `${line.invoicedQty} Pcs`;

                  return (
                    <div
                      key={line.id}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "80px 1fr 140px 160px 160px",
                        gap: "12px",
                        padding: "0 24px",
                        minHeight: "64px",
                        alignItems: "center",
                        background: "var(--neutral-surface-primary)",
                        position: "relative",
                        width: "100%",
                        borderBottom:
                          idx === threeWaysMatchData.length - 1
                            ? "none"
                            : "1px solid var(--neutral-line-separator-1)",
                        boxSizing: "border-box",
                      }}
                    >
                      <div style={{ justifySelf: "start" }}>
                        <StatusBadge
                          variant={
                            isWO
                              ? "blue-light"
                              : line.type === "material"
                                ? "yellow-light"
                                : "grey-light"
                          }
                        >
                          {isWO
                            ? "WO"
                            : line.type === "material"
                              ? "Material"
                              : "Manual"}
                        </StatusBadge>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          padding: "8px 0",
                          minWidth: 0,
                          overflow: "hidden",
                          justifySelf: "start",
                        }}
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
                            overflow: "hidden",
                          }}
                        >
                          <span
                            style={{
                              display: "block",
                              fontSize: "var(--text-title-3)",
                              fontWeight: "var(--font-weight-bold)",
                              color: "var(--neutral-on-surface-primary)",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                            title={line.item}
                          >
                            {line.item}
                            {line.isDeleted && (
                              <StatusBadge variant="red-light" style={{ marginLeft: "8px" }}>Deleted</StatusBadge>
                            )}
                          </span>
                          <span
                            style={{
                              display: "block",
                              fontSize: "var(--text-title-3)",
                              color: "var(--feature-brand-primary)",
                              textDecoration: "underline",
                              cursor: "pointer",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                            title={line.code}
                          >
                            {line.code}
                          </span>
                        </div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "flex-start",
                          textAlign: "left",
                          fontSize: "var(--text-title-3)",
                          fontWeight: "var(--font-weight-bold)",
                          color: "var(--neutral-on-surface-primary)",
                          whiteSpace: "nowrap",
                          justifySelf: "start",
                        }}
                      >
                        {quantityLabel}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "flex-start",
                          gap: "8px",
                          textAlign: "left",
                          fontSize: "var(--text-title-3)",
                          color: "var(--neutral-on-surface-primary)",
                          justifySelf: "start",
                        }}
                      >
                        <span style={{ whiteSpace: "nowrap" }}>
                          {invoicedLabel}
                        </span>
                        {isInvoicedMatched ? (
                          <Tooltip content="Matched with the purchase order qty">
                            <div
                              style={{ display: "flex", alignItems: "center" }}
                            >
                              <CheckCircleIcon
                                size={16}
                                color="var(--status-green-primary)"
                              />
                            </div>
                          </Tooltip>
                        ) : (
                          <Tooltip content="Still not matched with the purchase order qty">
                            <div
                              style={{ display: "flex", alignItems: "center" }}
                            >
                              <CanceledCircleIcon
                                size={16}
                                color="var(--status-red-primary)"
                              />
                            </div>
                          </Tooltip>
                        )}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "flex-start",
                          gap: "8px",
                          textAlign: "left",
                          fontSize: "var(--text-title-3)",
                          color: "var(--neutral-on-surface-primary)",
                          justifySelf: "start",
                        }}
                      >
                        <span style={{ whiteSpace: "nowrap" }}>
                          {receivedLabel}
                        </span>
                        {isReceivedMatched ? (
                          <Tooltip content="Matched with the purchase order qty">
                            <div
                              style={{ display: "flex", alignItems: "center" }}
                            >
                              <CheckCircleIcon
                                size={16}
                                color="var(--status-green-primary)"
                              />
                            </div>
                          </Tooltip>
                        ) : (
                          <Tooltip content="Still not matched with the purchase order qty">
                            <div
                              style={{ display: "flex", alignItems: "center" }}
                            >
                              <CanceledCircleIcon
                                size={16}
                                color="var(--status-red-primary)"
                              />
                            </div>
                          </Tooltip>
                        )}
                      </div>
                    </div>
                  );
                })
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
                    margin: "0 24px",
                  }}
                >
                  No items to match.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Pagination Footer */}
        <div style={{ padding: "0 4px" }}>
          <TablePaginationFooter
            currentPage={threeWaysMatchCurrentPage}
            totalPages={
              Math.ceil(
                threeWaysMatchData.length / threeWaysMatchRowsPerPage
              ) || 1
            }
            rowsPerPage={threeWaysMatchRowsPerPage}
            totalRows={threeWaysMatchData.length}
            onPageChange={setThreeWaysMatchCurrentPage}
            onRowsPerPageChange={setThreeWaysMatchRowsPerPage}
            style={{
              borderTop:
                threeWaysMatchData.length === 0
                  ? "none"
                  : "1px solid var(--neutral-line-separator-1)",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default PoThreeWayMatchTab;
