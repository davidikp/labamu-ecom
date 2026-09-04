import React, { useState } from "react";
import { Settings } from "../../../components/icons/Icons.jsx";
import { Button } from "../../../components/common/Button.jsx";
import { StatusBadge } from "../../../components/common/StatusBadge.jsx";
import { TableSearchField } from "../../../components/table/TableSearchField.jsx";
import { TablePaginationFooter } from "../../../components/table/TablePaginationFooter.jsx";
import { getCprs, CPR_STATUS_META } from "../mock/customProductRequestMocks.js";
import { cellStyle } from "../../purchase-order/utils/purchaseOrderTableUtils.js";

const tableColumns = [
  { label: "CPR Number", key: "cprNumber", flex: "1.1" },
  { label: "RFQ Number", key: "rfqNumber", flex: "1" },
  { label: "Customer Name", key: "customerName", flex: "1.3" },
  { label: "Requested Product Name", key: "requestedProductName", flex: "1.6" },
  { label: "Requested Quantity", key: "requestedQuantity", flex: "1" },
  { label: "Created Date", key: "createdDate", flex: "1" },
  { label: "Created By", key: "createdBy", flex: "1" },
  { label: "Status", key: "status", flex: "1" },
];

export const CustomProductRequestListPage = ({ onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);

  const allRows = getCprs();
  const filteredRows = allRows.filter((row) => {
    if (!searchQuery) return true;
    const haystack = `${row.cprNumber} ${row.rfqNumber} ${row.customerName} ${row.requestedProductName}`.toLowerCase();
    return haystack.includes(searchQuery.toLowerCase());
  });

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / rowsPerPage));
  const visibleRows = filteredRows.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  return (
    <div
      style={{
        height: "calc(100vh - 64px)",
        padding: "24px",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        overflow: "hidden",
        minHeight: 0,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ margin: 0, fontSize: "var(--text-big-title)", fontWeight: "var(--font-weight-bold)" }}>
          Custom Product Request
        </h1>
        <Button variant="outlined" leftIcon={Settings} onClick={() => onNavigate("settings")}>
          Settings
        </Button>
      </div>

      <div
        style={{
          background: "var(--neutral-surface-primary)",
          borderRadius: "var(--radius-card)",
          border: "1px solid var(--neutral-line-separator-1)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          minHeight: 0,
        }}
      >
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--neutral-line-separator-2)",
            display: "flex",
            justifyContent: "flex-end",
            flexShrink: 0,
          }}
        >
          <TableSearchField
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by CPR Number, RFQ Number, or Customer"
            width="360px"
          />
        </div>

        <div style={{ overflowX: "auto", overflowY: "auto", width: "100%" }}>
          <div style={{ minWidth: "100%", width: "100%", display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                background: "var(--neutral-surface-primary)",
                borderBottom: "1px solid var(--neutral-line-separator-1)",
                position: "sticky",
                top: 0,
                zIndex: 20,
              }}
            >
              {tableColumns.map((col) => (
                <div
                  key={col.key}
                  style={{
                    flex: col.flex,
                    minWidth: 0,
                    height: "49px",
                    padding: "0 12px",
                    display: "flex",
                    alignItems: "center",
                    fontSize: "var(--text-title-3)",
                    fontWeight: "var(--font-weight-bold)",
                    color: "var(--neutral-on-surface-primary)",
                  }}
                >
                  <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {col.label}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              {visibleRows.map((row) => (
                <div
                  key={row.cprNumber}
                  onClick={() => onNavigate("detail", row)}
                  style={{
                    display: "flex",
                    background: "var(--neutral-surface-primary)",
                    borderBottom: "1px solid var(--neutral-line-separator-1)",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--neutral-surface-grey-lighter)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "var(--neutral-surface-primary)")}
                >
                  <div style={cellStyle({ flex: tableColumns[0].flex, color: "var(--feature-brand-primary)" })}>
                    {row.cprNumber}
                  </div>
                  <div style={cellStyle({ flex: tableColumns[1].flex })}>{row.rfqNumber}</div>
                  <div style={cellStyle({ flex: tableColumns[2].flex })}>{row.customerName}</div>
                  <div style={cellStyle({ flex: tableColumns[3].flex })}>{row.requestedProductName}</div>
                  <div style={cellStyle({ flex: tableColumns[4].flex })}>{row.requestedQuantity}</div>
                  <div style={cellStyle({ flex: tableColumns[5].flex })}>{row.createdDate}</div>
                  <div style={cellStyle({ flex: tableColumns[6].flex })}>{row.createdBy}</div>
                  <div style={cellStyle({ flex: tableColumns[7].flex })}>
                    <StatusBadge variant={CPR_STATUS_META[row.status]?.badge || "grey"}>
                      {row.status}
                    </StatusBadge>
                  </div>
                </div>
              ))}

              {filteredRows.length === 0 ? (
                <div
                  style={{
                    padding: "40px",
                    textAlign: "center",
                    color: "var(--neutral-on-surface-tertiary)",
                    fontSize: "var(--text-title-3)",
                  }}
                >
                  No custom product requests found.
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <TablePaginationFooter
          totalRows={filteredRows.length}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={setRowsPerPage}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
};
