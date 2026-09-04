import React, { useEffect, useState } from "react";
import { ChevronDownIcon, Settings, SearchIcon } from "../../../components/icons/Icons.jsx";
import { Button } from "../../../components/common/Button.jsx";
import { FilterPill } from "../../../components/common/FilterPill.jsx";
import { ListStatusCounterCard } from "../../../components/common/ListStatusCounterCard.jsx";
import { StatusBadge } from "../../../components/common/StatusBadge.jsx";
import { TablePaginationFooter } from "../../../components/table/TablePaginationFooter.jsx";
import { TableSearchField } from "../../../components/table/TableSearchField.jsx";
import { MOCK_ORDER_TABLE_DATA } from "../mock/orderMocks.js";
import { cellStyle } from "../utils/orderTableUtils.js";

export const OrderListPage = ({ onNavigate, t }) => {
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");
  const [openFilterKey, setOpenFilterKey] = useState(null);
  const [filterStatuses, setFilterStatuses] = useState([]);
  const [filterCustomer, setFilterCustomer] = useState("all");
  const [filterOrderType, setFilterOrderType] = useState("all");
  const [customerSearch, setCustomerSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [popoverTriggerRect, setPopoverTriggerRect] = useState(null);
  const [viewportHeight, setViewportHeight] = useState(() =>
    typeof window !== "undefined" ? window.innerHeight : 900
  );

  const tableColumns = [
    { label: "Order No", key: "orderNo", flex: "1", sortable: true },
    { label: "Quote No", key: "quoteNo", flex: "1", sortable: true },
    { label: "Customer Name", key: "customerName", flex: "1.3", sortable: true },
    { label: "Planned Start", key: "plannedStart", flex: "1", sortable: true },
    { label: "Planned End", key: "plannedEnd", flex: "1", sortable: true },
    { label: "Created By", key: "createdBy", flex: "1", sortable: true },
    { label: "Created At", key: "createdAt", flex: "1", sortable: true },
    { label: "Priority", key: "priority", flex: "0.8", sortable: true },
    { label: "Status", key: "status", flex: "1.2", sortable: false },
  ];

  const statusCards = [
    { key: "Not Started", label: "Not Started", activeColor: "grey-light" },
    { key: "Waiting for Approval", label: "Waiting for Approval", activeColor: "orange-light" },
    { key: "Need Revision", label: "Need Revision", activeColor: "yellow-light" },
    { key: "Confirmed", label: "Confirmed", activeColor: "green-light" },
    { key: "In Progress", label: "In Progress", activeColor: "blue-light" },
    { key: "Ready to Ship", label: "Ready to Ship", activeColor: "blue-light" },
    { key: "On Shipping", label: "On Shipping", activeColor: "blue-light" },
    { key: "Completed", label: "Completed", activeColor: "green-light" },
    { key: "Canceled", label: "Canceled", activeColor: "red-light" },
  ];

  const statusCounts = statusCards.reduce((acc, card) => {
    acc[card.key] = MOCK_ORDER_TABLE_DATA.filter(
      (row) => row.status === card.key
    ).length;
    return acc;
  }, {});

  const toggleSort = (key) => {
    if (sortBy === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(key);
      setSortDirection("asc");
    }
  };

  const toggleFilterStatus = (status) => {
    setFilterStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const filteredRows = MOCK_ORDER_TABLE_DATA.filter((row) => {
    const matchesStatusFilter =
      filterStatuses.length === 0 || filterStatuses.includes(row.status);
    const matchesSearch =
      !searchQuery ||
      row.orderNo.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCustomer = filterCustomer === "all" || row.customerName === filterCustomer;
    const matchesOrderType = filterOrderType === "all" || row.orderType === filterOrderType; 

    return matchesStatusFilter && matchesSearch && matchesCustomer && matchesOrderType;
  }).sort((a, b) => {
    const direction = sortDirection === "asc" ? 1 : -1;
    if (!a[sortBy] || !b[sortBy]) return 0;
    return a[sortBy].localeCompare(b[sortBy]) * direction;
  });

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / rowsPerPage));
  const visibleRows = filteredRows.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const orderTableBodyMaxHeight = "calc(100vh - 412px)";
  const orderAvailableBodyHeight = Math.max(220, viewportHeight - 412);
  const orderVisibleBodyHeight = filteredRows.length === 0 ? 160 : visibleRows.length * 56;
  const orderShouldScroll = orderVisibleBodyHeight > orderAvailableBodyHeight;

  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatuses, filterCustomer, filterOrderType, searchQuery, rowsPerPage]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const handleResize = () => setViewportHeight(window.innerHeight);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const customers = Array.from(new Set(MOCK_ORDER_TABLE_DATA.map(r => r.customerName)));
  const orderTypes = ["Internal", "Customer", "Forecast", "Rework"];

  const filteredCustomers = customerSearch 
    ? customers.filter(c => c.toLowerCase().includes(customerSearch.toLowerCase()))
    : customers;

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
        <h1
          style={{
            margin: "0",
            fontSize: "var(--text-big-title)",
            fontWeight: "var(--font-weight-bold)",
          }}
        >
          Orders
        </h1>
        <div style={{ display: "flex", gap: "12px" }}>
          <Button variant="outlined" leftIcon={Settings} onClick={() => onNavigate("settings")}>
            Settings
          </Button>
        </div>
      </div>

      <div 
        style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(5, 1fr)", 
          gap: "16px", 
          flexShrink: 0 
        }}
      >
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
            <div
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setPopoverTriggerRect(rect);
                setCustomerSearch("");
                setOpenFilterKey((prev) => (prev === "customer" ? null : "customer"));
              }}
            >
              <FilterPill
                label="Customer"
                active={filterCustomer !== "all"}
                isOpen={openFilterKey === "customer"}
                count={filterCustomer !== "all" ? 1 : 0}
              />
            </div>

            <div
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setPopoverTriggerRect(rect);
                setOpenFilterKey((prev) => (prev === "orderType" ? null : "orderType"));
              }}
            >
              <FilterPill
                label="Order Type"
                active={filterOrderType !== "all"}
                isOpen={openFilterKey === "orderType"}
                count={filterOrderType !== "all" ? 1 : 0}
              />
            </div>

            {openFilterKey ? (
              <>
                <div
                  style={{ position: "fixed", inset: 0, zIndex: 80 }}
                  onClick={() => setOpenFilterKey(null)}
                />
                <div
                  style={{
                    position: "fixed",
                    top: popoverTriggerRect ? `${popoverTriggerRect.bottom + 8}px` : "160px",
                    left: popoverTriggerRect ? `${popoverTriggerRect.left}px` : "0",
                    width: "280px",
                    background: "var(--neutral-surface-primary)",
                    border: "1px solid var(--neutral-line-separator-1)",
                    borderRadius: "var(--radius-card)",
                    boxShadow: "var(--elevation-sm)",
                    padding: "16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                    zIndex: 1000,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "var(--text-title-2)", fontWeight: "var(--font-weight-bold)" }}>
                      {openFilterKey === "customer" ? "Customer" : "Order Type"}
                    </span>
                    <button
                      onClick={() => {
                        if (openFilterKey === "customer") setFilterCustomer("all");
                        else setFilterOrderType("all");
                        setOpenFilterKey(null);
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--status-red-primary)",
                        cursor: "pointer",
                        fontSize: "var(--text-body)",
                        fontWeight: "var(--font-weight-bold)",
                      }}
                    >
                      Remove Filter
                    </button>
                  </div>

                  {openFilterKey === "customer" && customers.length > 5 && (
                    <div style={{ position: "relative" }}>
                      <input
                        type="text"
                        placeholder="Search customer..."
                        value={customerSearch}
                        onChange={(e) => setCustomerSearch(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "8px 12px 8px 32px",
                          borderRadius: "8px",
                          border: "1px solid var(--neutral-line-separator-1)",
                          fontSize: "var(--text-title-3)",
                          outline: "none",
                        }}
                      />
                      <SearchIcon 
                        size={14} 
                        color="var(--neutral-on-surface-tertiary)" 
                        style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} 
                      />
                    </div>
                  )}

                  <div 
                    style={{ 
                      display: "flex", 
                      flexDirection: "column", 
                      gap: "10px",
                      maxHeight: "240px",
                      overflowY: "auto",
                      paddingRight: "4px"
                    }}
                  >
                    {(openFilterKey === "customer" ? ["all", ...filteredCustomers] : ["all", ...orderTypes]).map((opt) => (
                      <label
                        key={opt}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          cursor: "pointer",
                          fontSize: "var(--text-title-3)",
                          padding: "4px 0"
                        }}
                      >
                        <input
                          type="radio"
                          name={openFilterKey}
                          checked={(openFilterKey === "customer" ? filterCustomer : filterOrderType) === opt}
                          onChange={() => {
                            if (openFilterKey === "customer") setFilterCustomer(opt);
                            else setFilterOrderType(opt);
                            setOpenFilterKey(null);
                          }}
                        />
                        <span>{opt === "all" ? "All" : opt}</span>
                      </label>
                    ))}
                    {openFilterKey === "customer" && filteredCustomers.length === 0 && (
                      <div style={{ textAlign: "center", color: "var(--neutral-on-surface-tertiary)", fontSize: "var(--text-desc)", padding: "12px 0" }}>
                        No results found
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : null}
          </div>

          <TableSearchField
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by order number"
            width="360px"
          />
        </div>

        <div
          style={{
            height: orderShouldScroll ? `${orderAvailableBodyHeight}px` : "auto",
            maxHeight: orderTableBodyMaxHeight,
            overflowX: "auto",
            overflowY: orderShouldScroll ? "auto" : "visible",
            width: "100%",
          }}
        >
          <div style={{ minWidth: "1000px", width: "100%", display: "flex", flexDirection: "column" }}>
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
                  <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {col.label}
                  </span>
                  {col.sortable && (
                    <ChevronDownIcon
                      size={14}
                      color={sortBy === col.key ? "var(--feature-brand-primary)" : "var(--neutral-on-surface-tertiary)"}
                      style={{
                        transform: sortBy === col.key && sortDirection === "asc" ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.2s",
                      }}
                    />
                  )}
                </div>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
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
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--neutral-surface-grey-lighter)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "var(--neutral-surface-primary)")}
                >
                  <div style={cellStyle({ flex: tableColumns[0].flex, color: "var(--feature-brand-primary)" })}>
                    {row.orderNo}
                  </div>
                  <div style={cellStyle({ flex: tableColumns[1].flex })}>{row.quoteNo}</div>
                  <div style={cellStyle({ flex: tableColumns[2].flex })}>
                    <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {row.customerName}
                    </span>
                  </div>
                  <div style={cellStyle({ flex: tableColumns[3].flex })}>{row.plannedStart}</div>
                  <div style={cellStyle({ flex: tableColumns[4].flex })}>{row.plannedEnd}</div>
                  <div style={cellStyle({ flex: tableColumns[5].flex })}>{row.createdBy}</div>
                  <div style={cellStyle({ flex: tableColumns[6].flex })}>{row.createdAt}</div>
                  <div style={cellStyle({ flex: tableColumns[7].flex })}>
                    <StatusBadge variant={row.pVariant || "grey-light"}>{row.priority}</StatusBadge>
                  </div>
                  <div style={cellStyle({ flex: tableColumns[8].flex })}>
                    <StatusBadge variant={row.sBadge || "grey"}>{row.status}</StatusBadge>
                  </div>
                </div>
              ))}

              {filteredRows.length === 0 && (
                <div style={{ padding: "64px", textAlign: "center", color: "var(--neutral-on-surface-tertiary)" }}>
                  No orders found.
                </div>
              )}
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
