import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AddIcon, ChevronDownIcon, Info, Settings, SearchNotFoundIllustration } from "../../../components/icons/Icons.jsx";
import { EmptyState } from "../../../ce-ui";
import { Button } from "../../../components/common/Button.jsx";
import { FilterMenu } from "../../../components/molecules/FilterMenu.jsx";
import { ListStatusCounterCard } from "../../../components/common/ListStatusCounterCard.jsx";
import { StatusBadge } from "../../../components/common/StatusBadge.jsx";
import { TablePaginationFooter } from "../../../components/table/TablePaginationFooter.jsx";
import { TableSearchField } from "../../../components/table/TableSearchField.jsx";
import { MOCK_PO_TABLE_DATA } from "../mock/purchaseOrderMocks.js";
import { cellStyle } from "../utils/purchaseOrderTableUtils.js";

const computePaymentStatus = (invoices, payments) => {
  if (!invoices || invoices.length === 0) return "Unpaid";
  const today = new Date();
  let allPaid = true;
  let anyOverdue = false;
  let anyPartial = false;
  for (const inv of invoices) {
    const paid = (payments || []).filter(p => !p.isVoid && p.invoiceId === inv.id).reduce((s, p) => s + (p.amount || 0), 0);
    const outstanding = Math.max((inv.amount || 0) - paid, 0);
    const isOverdue = new Date(inv.dueDate) < today && outstanding > 0;
    if (outstanding > 0) allPaid = false;
    if (isOverdue) anyOverdue = true;
    if (paid > 0 && outstanding > 0) anyPartial = true;
  }
  if (allPaid) return "Paid";
  if (anyOverdue) return "Overdue";
  if (anyPartial) return "Partially Paid";
  return "Unpaid";
};

const PoTitleTooltip = () => {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const ref = useRef(null);

  const updateCoords = () => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setCoords({ top: rect.bottom + 6, left: rect.left + rect.width / 2 });
    }
  };

  return (
    <div
      ref={ref}
      style={{ display: "inline-flex", alignItems: "center", cursor: "default" }}
      onMouseEnter={() => { updateCoords(); setVisible(true); }}
      onMouseLeave={() => setVisible(false)}
    >
      <Info size={16} color="var(--neutral-on-surface-tertiary)" strokeWidth={2} />
      {visible && typeof document !== "undefined" &&
        createPortal(
          <div style={{
            position: "fixed",
            top: coords.top,
            left: coords.left,
            transform: "translateX(-50%)",
            background: "var(--neutral-on-surface-primary)",
            color: "#fff",
            padding: "8px 12px",
            borderRadius: "8px",
            fontSize: "12px",
            lineHeight: "1.5",
            maxWidth: "320px",
            zIndex: 9999,
            pointerEvents: "none",
            boxShadow: "0 4px 12px rgba(0,0,0,0.18)",
          }}>
            Manage purchase orders sent to your vendors. Use this page to create, approve, and track purchase orders.
          </div>,
          document.body
        )
      }
    </div>
  );
};

export const PurchaseOrderListPage = ({ onNavigate, t }) => {
  const [sortBy, setSortBy] = useState("createdDate");
  const [sortDirection, setSortDirection] = useState("desc");
  const [filterStatuses, setFilterStatuses] = useState([]);
  const [filterPaymentStatuses, setFilterPaymentStatuses] = useState([]);
  const [dateFilterType, setDateFilterType] = useState("all");
  const [customDateFrom, setCustomDateFrom] = useState(null);
  const [customDateTo, setCustomDateTo] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewportHeight, setViewportHeight] = useState(() =>
    typeof window !== "undefined" ? window.innerHeight : 900
  );

  const tableColumns = [
    { label: "PO No", key: "poNumber", flex: "1.4", sortable: true },
    { label: "Vendor Name", key: "vendorName", flex: "1.6", sortable: true },
    { label: "Total Amount", key: "amount", flex: "1.3", sortable: false },
    { label: "PO Date", key: "poDate", flex: "1", sortable: true },
    { label: "Created Date", key: "createdDate", flex: "1", sortable: true },
    { label: "Payment Status", key: "paymentStatus", flex: "1.1", sortable: false },
    { label: "PO Status", key: "status", flex: "1", sortable: false },
  ];

  const statusCards = [
    { key: "Draft", label: "Draft", activeColor: "grey-light" },
    { key: "Waiting for Approval", label: "Waiting for Approval", activeColor: "orange-light" },
    { key: "Issued", label: "Issued", activeColor: "blue-light" },
    { key: "Completed", label: "Completed", activeColor: "green-light" },
    { key: "Need Revision", label: "Need Revision", activeColor: "yellow-light" },
    { key: "Cancelled", label: "Cancelled", activeColor: "red-light" },
  ];

  const paymentStatusCards = [
    { key: "Unpaid", label: "Unpaid", activeColor: "grey-light" },
    { key: "Partially Paid", label: "Partially Paid", activeColor: "blue-light" },
    { key: "Overdue", label: "Overdue", activeColor: "red-light" },
    { key: "Paid", label: "Paid", activeColor: "green-light" },
  ];

  const statusCounts = statusCards.reduce((acc, card) => {
    acc[card.key] = MOCK_PO_TABLE_DATA.filter((row) => row.status === card.key).length;
    return acc;
  }, {});

  const toggleFilterPaymentStatus = (key) => {
    setFilterPaymentStatuses((prev) =>
      prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key]
    );
  };

  const toggleSort = (key) => {
    if (sortBy === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(key);
      setSortDirection(key === "createdDate" ? "desc" : "asc");
    }
  };

  const toggleFilterStatus = (status) => {
    setFilterStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const parsedDate = (value) => {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  };

  const now = new Date("2026-03-31");
  const filteredRows = MOCK_PO_TABLE_DATA.filter((row) => {
    const matchesStatusFilter =
      filterStatuses.length === 0 || filterStatuses.includes(row.status);
    const rowPaymentStatus = computePaymentStatus(row.invoices, row.payments);
    const matchesPaymentStatusFilter =
      filterPaymentStatuses.length === 0 || filterPaymentStatuses.includes(rowPaymentStatus);
    const matchesSearch =
      !searchQuery ||
      `${row.poNumber} ${row.vendorName}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    let matchesDate = true;
    const rowDate = parsedDate(row.createdDate);

    if (dateFilterType === "last7" && rowDate) {
      const start = new Date(now);
      start.setDate(now.getDate() - 7);
      matchesDate = rowDate >= start && rowDate <= now;
    } else if (dateFilterType === "last30" && rowDate) {
      const start = new Date(now);
      start.setDate(now.getDate() - 30);
      matchesDate = rowDate >= start && rowDate <= now;
    } else if (dateFilterType === "__custom__" && rowDate && customDateFrom && customDateTo) {
      matchesDate = rowDate >= customDateFrom && rowDate <= customDateTo;
    }

    return matchesStatusFilter && matchesPaymentStatusFilter && matchesSearch && matchesDate;
  }).sort((a, b) => {
    const direction = sortDirection === "asc" ? 1 : -1;
    if (sortBy === "createdDate") {
      return (new Date(a.createdDate) - new Date(b.createdDate)) * direction;
    }
    return a[sortBy].localeCompare(b[sortBy]) * direction;
  });

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / rowsPerPage));
  const visibleRows = filteredRows.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );
  const purchaseOrderTableBodyMaxHeight = "calc(100vh - 412px)";
  const purchaseOrderAvailableBodyHeight = Math.max(220, viewportHeight - 412);
  const purchaseOrderVisibleBodyHeight =
    filteredRows.length === 0 ? 160 : visibleRows.length * 56;
  const purchaseOrderShouldScroll =
    purchaseOrderVisibleBodyHeight > purchaseOrderAvailableBodyHeight;

  useEffect(() => {
    setCurrentPage(1);
  }, [
    filterStatuses.join("|"),
    filterPaymentStatuses.join("|"),
    dateFilterType,
    customDateFrom,
    customDateTo,
    searchQuery,
    rowsPerPage,
  ]);

  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const handleResize = () => setViewportHeight(window.innerHeight);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <h1
            style={{
              margin: "0",
              fontSize: "var(--text-big-title)",
              fontWeight: "var(--font-weight-bold)",
            }}
          >
            {t("purchase_order.title")}
          </h1>
          <PoTitleTooltip />
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <Button variant="outlined" leftIcon={Settings} onClick={() => onNavigate("settings")}>
            {t("purchase_order.settings")}
          </Button>
          <Button variant="filled" leftIcon={AddIcon} onClick={() => onNavigate("create")}>
            {t("purchase_order.new")}
          </Button>
        </div>
      </div>

      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
        {statusCards.map((card) => (
          <ListStatusCounterCard
            key={card.key}
            label={card.label}
            count={statusCounts[card.key] || 0}
            badgeVariant={card.activeColor}
            active={filterStatuses.includes(card.key)}
            onClick={() => toggleFilterStatus(card.key)}
          />
        ))}
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
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              flexWrap: "wrap",
              position: "relative",
            }}
          >
            <FilterMenu
              label="Created Date"
              searchable={false}
              options={[
                { value: "last7",  label: "Last 7 days" },
                { value: "last30", label: "Last 30 days" },
              ]}
              value={dateFilterType}
              onChange={setDateFilterType}
              allValue="all"
              customDateEnabled
              customDateFrom={customDateFrom}
              customDateTo={customDateTo}
              onCustomDateChange={(from, to) => {
                setCustomDateFrom(from);
                setCustomDateTo(to);
              }}
            />
            <FilterMenu
              label="Payment Status"
              multiple
              searchable={false}
              options={paymentStatusCards.map((c) => ({ value: c.key, label: c.label }))}
              values={filterPaymentStatuses}
              onChangeMultiple={setFilterPaymentStatuses}
            />
          </div>

          <TableSearchField
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by PO No or Vendor Name"
            width="360px"
          />
        </div>

        <div
          style={{
            height: purchaseOrderShouldScroll
              ? `${purchaseOrderAvailableBodyHeight}px`
              : "auto",
            maxHeight: purchaseOrderTableBodyMaxHeight,
            overflowX: "auto",
            overflowY: purchaseOrderShouldScroll ? "auto" : "visible",
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
              {tableColumns.map((col, idx) => (
                <div
                  key={idx}
                  onClick={() => (col.sortable ? toggleSort(col.key) : undefined)}
                  style={{
                    flex: col.flex,
                    minWidth: 0,
                    height: "49px",
                    padding: "0 12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "var(--text-title-3)",
                    fontWeight: "var(--font-weight-bold)",
                    color: "var(--neutral-on-surface-primary)",
                    cursor: col.sortable ? "pointer" : "default",
                  }}
                >
                  <span
                    style={{
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {col.label}
                  </span>
                  {col.sortable ? (
                    <ChevronDownIcon
                      size={14}
                      color={
                        sortBy === col.key
                          ? (col.key === "createdDate" ? "var(--neutral-on-surface-tertiary)" : "var(--feature-brand-primary)")
                          : "var(--neutral-on-surface-tertiary)"
                      }
                      style={{
                        transform:
                          sortBy === col.key && sortDirection === "asc"
                            ? "rotate(180deg)"
                            : "rotate(0deg)",
                        transition: "transform 0.2s",
                      }}
                    />
                  ) : null}
                </div>
              ))}
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                flex: filteredRows.length === 0 ? 1 : "0 0 auto",
              }}
            >
              {visibleRows.map((row, rIdx) => (
                <div
                  key={rIdx}
                  onClick={() => onNavigate("detail", row)}
                  style={{
                    display: "flex",
                    background: "var(--neutral-surface-primary)",
                    borderBottom: "1px solid var(--neutral-line-separator-1)",
                    transition: "background 0.12s ease",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background =
                      "var(--neutral-surface-grey-lighter)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background =
                      "var(--neutral-surface-primary)")
                  }
                >
                  <div
                    style={cellStyle({
                      flex: tableColumns[0].flex,
                      color: "var(--feature-brand-primary)",
                    })}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        width: "100%",
                        overflow: "hidden",
                      }}
                    >
                      <span
                        style={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          flexShrink: 1,
                        }}
                      >
                        {row.poNumber}
                      </span>
                      {row.versions?.length > 0 && (
                        <StatusBadge variant="grey-light" style={{ flexShrink: 0 }}>
                          V {row.currentVersion || row.versions.length}.0
                        </StatusBadge>
                      )}
                    </div>
                  </div>
                  <div style={cellStyle({ flex: tableColumns[1].flex })}>
                    <span
                      style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {row.vendorName}
                    </span>
                  </div>
                  <div style={cellStyle({ flex: tableColumns[2].flex })}>
                    {row.amount}
                  </div>
                  <div style={cellStyle({ flex: tableColumns[3].flex })}>
                    <span
                      style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {row.poDate || row.createdDate}
                    </span>
                  </div>
                  <div style={cellStyle({ flex: tableColumns[4].flex })}>
                    <span
                      style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {row.createdDate}
                    </span>
                  </div>
                  <div style={cellStyle({ flex: tableColumns[5].flex })}>
                    {(() => {
                      const ps = computePaymentStatus(row.invoices, row.payments);
                      const variant = ps === "Paid" ? "green-light" : ps === "Overdue" ? "red-light" : ps === "Partially Paid" ? "blue-light" : "grey-light";
                      return <StatusBadge variant={variant}>{ps}</StatusBadge>;
                    })()}
                  </div>
                  <div style={cellStyle({ flex: tableColumns[6].flex })}>
                    <StatusBadge variant={row.sBadge}>{row.status}</StatusBadge>
                  </div>
                </div>
              ))}

              {filteredRows.length === 0 ? (
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <EmptyState
                    illustration={<SearchNotFoundIllustration />}
                    title="No purchase orders found"
                    description="Try adjusting your filters or search keywords."
                  />
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
