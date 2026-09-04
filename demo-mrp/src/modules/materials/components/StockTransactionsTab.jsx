import React, { useState, useRef, useEffect } from "react";
import { 
  SearchIcon, 
  ChevronDownIcon, 
  ChevronUpIcon,
  CalendarIcon
} from "../../../components/icons/Icons.jsx";
import { Button } from "../../../components/common/Button.jsx";
import { createPortal } from "react-dom";
import { StatusBadge } from "../../../components/common/StatusBadge.jsx";
import { TablePaginationFooter } from "../../../components/table/TablePaginationFooter.jsx";
import { TableSearchField } from "../../../components/table/TableSearchField.jsx";
import { FilterPill } from "../../../components/common/FilterPill.jsx";
import { Checkbox } from "../../../components/common/Checkbox.jsx";

const Tooltip = ({ content, children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);

  const updateCoords = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.top,
        left: rect.left + rect.width / 2,
      });
    }
  };

  useEffect(() => {
    if (isVisible) {
      updateCoords();
      window.addEventListener("scroll", updateCoords, true);
      window.addEventListener("resize", updateCoords);
    }
    return () => {
      window.removeEventListener("scroll", updateCoords, true);
      window.removeEventListener("resize", updateCoords);
    };
  }, [isVisible]);

  return (
    <div
      ref={triggerRef}
      style={{
        position: "relative",
        display: "block",
        width: "100%",
        minWidth: 0,
      }}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible &&
        createPortal(
          <div
            style={{
              position: "fixed",
              top: coords.top - 8,
              left: coords.left,
              transform: "translate(-50%, -100%)",
              width: "max-content",
              maxWidth: "400px",
              zIndex: 10001,
              whiteSpace: "normal",
              padding: "8px 12px",
              borderRadius: "8px",
              background: "var(--neutral-on-surface-primary)",
              color: "var(--neutral-surface-primary)",
              fontSize: "var(--text-desc)",
              lineHeight: "1.6",
              boxShadow: "var(--elevation-sm)",
              textAlign: "left",
              pointerEvents: "none",
            }}
          >
            {content}
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: "50%",
                transform: "translateX(-50%)",
                borderWidth: "6px",
                borderStyle: "solid",
                borderColor:
                  "var(--neutral-on-surface-primary) transparent transparent transparent",
              }}
            />
          </div>,
          document.body
        )}
    </div>
  );
};

const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "-";
  const options = { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  };
  return date.toLocaleString('en-CA', options).replace(',', '');
};

const formatQuantity = (val, unit) => {
  if (val === undefined || val === null) return "-";
  const prefix = val > 0 ? "+" : "";
  return `${prefix}${val.toLocaleString('en-US')} ${unit || ""}`;
};

export const StockTransactionsTab = ({ materialId, onNavigate, localTransactions = [] }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilters, setActiveFilters] = useState({
    type: [],
    dateRange: 'all'
  });
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [openFilterKey, setOpenFilterKey] = useState(null);
  const [popoverTriggerRect, setPopoverTriggerRect] = useState(null);

  const scrollerRef = useRef(null);
  const [scrollShadows, setScrollShadows] = useState({ left: false, right: false });

  const handleFilterClick = (key, e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPopoverTriggerRect(rect);
    setOpenFilterKey(prev => prev === key ? null : key);
  };

  const toggleFilterValue = (key, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter(v => v !== value)
        : [...prev[key], value]
    }));
  };

  const toggleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getFilterOptions = (key) => {
    const all = localTransactions.filter(t => t.materialId === materialId);
    switch (key) {
      case "type":
        return [...new Set(all.map(t => t.type).filter(Boolean))];
      default:
        return [];
    }
  };

  const transactions = React.useMemo(() => {
    let result = localTransactions.filter(t => t.materialId === materialId);

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t => 
        t.batchNo.toLowerCase().includes(q) ||
        (t.reason && t.reason.toLowerCase().includes(q)) ||
        (t.actionBy && t.actionBy.toLowerCase().includes(q)) ||
        (t.workOrder && t.workOrder.toLowerCase().includes(q)) ||
        (t.product && t.product.toLowerCase().includes(q))
      );
    }

    if (activeFilters.type.length > 0) {
      result = result.filter(t => activeFilters.type.includes(t.type));
    }

    if (activeFilters.dateRange && activeFilters.dateRange !== 'all') {
      const now = new Date();
      if (activeFilters.dateRange === 'last_7') {
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        result = result.filter(t => new Date(t.date) >= sevenDaysAgo);
      } else if (activeFilters.dateRange === 'last_30') {
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        result = result.filter(t => new Date(t.date) >= thirtyDaysAgo);
      }
    }

    // Sorting
    result.sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      
      if (sortConfig.key === 'date') {
        const aDate = new Date(aVal || 0).getTime();
        const bDate = new Date(bVal || 0).getTime();
        return sortConfig.direction === 'asc' ? aDate - bDate : bDate - aDate;
      }
      
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [materialId, searchQuery, activeFilters, sortConfig]);

  const totalPages = Math.ceil(transactions.length / rowsPerPage);
  const visibleTransactions = transactions.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  useEffect(() => {
    const handleScroll = () => {
      if (!scrollerRef.current) return;
      const { scrollLeft, scrollWidth, clientWidth } = scrollerRef.current;
      setScrollShadows({
        left: scrollLeft > 0,
        right: scrollLeft < scrollWidth - clientWidth - 2
      });
    };

    const scroller = scrollerRef.current;
    if (scroller) {
      scroller.addEventListener("scroll", handleScroll);
      handleScroll();
    }
    return () => scroller?.removeEventListener("scroll", handleScroll);
  }, [transactions]);

  const columns = [
    { label: "Date", key: "date", width: "180px", sortable: true },
    { label: "Batch No", key: "batchNo", width: "180px" },
    { label: "Type", key: "type", width: "120px" },
    { label: "Quantity", key: "quantity", width: "140px" },
    { label: "Work Order", key: "workOrder", width: "160px" },
    { label: "Product", key: "product", width: "200px" },
    { label: "Reason", key: "reason", width: "240px" },
    { label: "Action By", key: "actionBy", width: "160px" }
  ];

  return (
    <div style={{ 
      background: "var(--neutral-surface-primary)", 
      borderRadius: "16px", 
      border: "1px solid var(--neutral-line-separator-1)",
      overflow: "hidden",
      display: "flex", 
      flexDirection: "column", 
    }}>
      {/* Header Section */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        gap: "16px", 
        flexWrap: "wrap",
        padding: "20px 24px"
      }}>
        <div style={{ display: "flex", gap: "12px", alignItems: "center", flex: 1, position: "relative" }}>
          <div onClick={(e) => handleFilterClick("type", e)}>
            <FilterPill 
              label="Transaction Type" 
              count={activeFilters.type.length} 
              active={activeFilters.type.length > 0}
              isOpen={openFilterKey === "type"}
            />
          </div>
          <div onClick={(e) => handleFilterClick("dateRange", e)}>
            <FilterPill 
              label="Select date range" 
              active={activeFilters.dateRange !== 'all'}
              isOpen={openFilterKey === "dateRange"}
            />
          </div>

          {openFilterKey && (
            <>
              {createPortal(
                <div style={{ position: "fixed", inset: 0, zIndex: 14000 }} onClick={() => setOpenFilterKey(null)} />,
                document.body
              )}
              {createPortal(
                <div style={{
                  position: "fixed",
                  top: popoverTriggerRect ? `${popoverTriggerRect.bottom + 8}px` : "200px",
                  left: popoverTriggerRect ? `${popoverTriggerRect.left}px` : "24px",
                  width: "280px",
                  background: "var(--neutral-surface-primary)",
                  border: "1px solid var(--neutral-line-separator-1)",
                  borderRadius: "16px",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                  padding: "16px",
                  zIndex: 14001,
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "var(--text-title-2)", fontWeight: "var(--font-weight-bold)" }}>
                      {openFilterKey === "type" ? "Transaction Type" : "Select date range"}
                    </span>
                    <button 
                      onClick={() => {
                        if (openFilterKey === 'dateRange') {
                          setActiveFilters(prev => ({ ...prev, dateRange: 'all' }));
                        } else {
                          setActiveFilters(prev => ({ ...prev, [openFilterKey]: [] }));
                        }
                        setOpenFilterKey(null);
                      }}
                      style={{ background: "none", border: "none", color: "var(--status-red-primary)", cursor: "pointer", fontSize: "12px", fontWeight: "bold" }}
                    >
                      Remove Filter
                    </button>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {openFilterKey === "type" ? (
                      getFilterOptions("type").length > 0 ? getFilterOptions("type").map(opt => (
                        <label key={opt} style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontSize: "13px" }}>
                          <Checkbox 
                            checked={activeFilters.type.includes(opt)} 
                            onChange={() => toggleFilterValue("type", opt)} 
                          />
                          {opt}
                        </label>
                      )) : (
                        <div style={{ padding: "12px", textAlign: "center", fontSize: "var(--text-body)", color: "var(--neutral-on-surface-tertiary)" }}>
                          No options available
                        </div>
                      )
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {[
                          { id: 'all', label: 'All' },
                          { id: 'last_7', label: 'Last 7 days' },
                          { id: 'last_30', label: 'Last 30 days' },
                          { id: 'custom', label: 'Custom date' }
                        ].map((opt) => (
                          <label key={opt.id} style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }}>
                            <div 
                              onClick={() => setActiveFilters(prev => ({ ...prev, dateRange: opt.id }))}
                              style={{
                                width: "18px",
                                height: "18px",
                                borderRadius: "50%",
                                border: `1.5px solid ${activeFilters.dateRange === opt.id ? "var(--feature-brand-primary)" : "var(--neutral-line-separator-1)"}`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                background: "white",
                                transition: "all 0.2s ease"
                              }}
                            >
                              {activeFilters.dateRange === opt.id && (
                                <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "var(--feature-brand-primary)" }} />
                              )}
                            </div>
                            <span style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-primary)" }}>{opt.label}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>,
                document.body
              )}
            </>
          )}
        </div>
        
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <TableSearchField 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Batch No"
            width="280px"
          />
        </div>
      </div>

      <div
        style={{
          height: "1px",
          background: "var(--neutral-line-separator-1)",
          width: "100%",
        }}
      />

      {/* Table Section */}
      <div style={{ 
        background: "var(--neutral-surface-primary)", 
        overflow: "hidden",
        display: "flex",
        flexDirection: "column"
      }}>
        <div ref={scrollerRef} style={{ overflowX: "auto" }}>
          <div style={{ 
            minWidth: "1380px", 
            display: "inline-flex", 
            flexDirection: "column",
            background: "var(--neutral-surface-primary)"
          }}>
            {/* Header */}
            <div style={{ 
              display: "flex", 
              background: "var(--neutral-surface-primary)",
              borderBottom: "1px solid var(--neutral-line-separator-1)",
              width: "100%"
            }}>
              {columns.map((col, idx) => {
                const isFirstColumn = idx === 0;
                return (
                  <div 
                    key={col.key} 
                    onClick={() => col.sortable && toggleSort(col.key)}
                    style={{ 
                      width: col.width, 
                      padding: isFirstColumn ? "16px 12px 16px 24px" : "16px 12px",
                      fontSize: "var(--text-title-3)",
                      fontWeight: "var(--font-weight-bold)",
                      color: "var(--neutral-on-surface-primary)",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      background: "var(--neutral-surface-primary)",
                      boxSizing: "border-box",
                      flexShrink: 0,
                      cursor: col.sortable ? "pointer" : "default",
                      userSelect: "none"
                    }}
                  >
                    {col.label}
                    {col.sortable && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "2px", opacity: sortConfig.key === col.key ? 1 : 0.3 }}>
                        {sortConfig.key === col.key && sortConfig.direction === 'asc' ? (
                          <ChevronUpIcon size={12} color="var(--neutral-on-surface-primary)" />
                        ) : (
                          <ChevronDownIcon size={12} color="var(--neutral-on-surface-primary)" />
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Body */}
            <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
              {visibleTransactions.length > 0 ? visibleTransactions.map((row) => (
                <div 
                  key={row.id} 
                  style={{ 
                    display: "flex", 
                    borderBottom: "1px solid var(--neutral-line-separator-1)",
                    background: "var(--neutral-surface-primary)",
                    height: "64px",
                    alignItems: "center",
                    transition: "background 0.12s ease",
                    cursor: "pointer",
                    width: "100%"
                  }}
                >
                  {/* Date (Non-Sticky) */}
                  <div style={{ 
                    width: "180px", 
                    padding: "0 12px 0 24px", 
                    fontSize: "var(--text-title-3)", 
                    color: "var(--neutral-on-surface-primary)",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    boxSizing: "border-box",
                    flexShrink: 0
                  }}>{formatDate(row.date)}</div>
                  
                  <div style={{ 
                    width: columns[1].width, 
                    padding: "0 12px", 
                    fontSize: "var(--text-title-3)", 
                    fontWeight: "var(--font-weight-bold)", 
                    color: "var(--neutral-on-surface-primary)", 
                    flexShrink: 0,
                    minWidth: 0
                  }}>
                    <Tooltip content={row.batchNo}>
                      <div style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        width: "100%"
                      }}>
                        {row.batchNo}
                      </div>
                    </Tooltip>
                  </div>
                  
                  <div style={{ width: columns[2].width, padding: "0 12px", flexShrink: 0 }}>
                    <StatusBadge variant={
                      row.type === "In" ? "green-light" : 
                      row.type === "Out" ? "red-light" : 
                      row.type === "Write Off" ? "orange-light" :
                      row.type === "Adjustment" ? "blue-light" :
                      "grey-light"
                    }>
                      {row.type}
                    </StatusBadge>
                  </div>
                  
                  <div style={{ 
                    width: columns[3].width, 
                    padding: "0 12px", 
                    fontSize: "var(--text-title-3)", 
                    fontWeight: "var(--font-weight-bold)", 
                    color: row.quantity > 0 ? "var(--status-green-primary)" : "var(--status-red-primary)",
                    flexShrink: 0 
                  }}>
                    {formatQuantity(row.quantity, row.unit)}
                  </div>
                  
                  <div style={{ 
                    width: columns[4].width, 
                    padding: "0 12px", 
                    fontSize: "var(--text-title-3)", 
                    color: row.workOrder ? "#0066FF" : "var(--neutral-on-surface-tertiary)",
                    textDecoration: row.workOrder ? "underline" : "none",
                    flexShrink: 0 
                  }}>
                    {row.workOrder || "-"}
                  </div>
                  
                  <div style={{ width: columns[5].width, padding: "0 12px", fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-primary)", flexShrink: 0 }}>{row.product || "-"}</div>
                  <div style={{ 
                    width: columns[6].width, 
                    padding: "0 12px", 
                    fontSize: "var(--text-title-3)", 
                    color: "var(--neutral-on-surface-secondary)", 
                    flexShrink: 0 
                  }}>
                    {row.reason}
                  </div>
                  <div style={{ width: columns[7].width, padding: "0 12px", fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-primary)", flexShrink: 0 }}>{row.actionBy}</div>
                </div>
              )) : (
                <div style={{ padding: "40px", textAlign: "center", color: "var(--neutral-on-surface-tertiary)" }}>
                  No transactions found.
                </div>
              )}
            </div>
          </div>
        </div>
        <div style={{ padding: "0 4px" }}>
          <TablePaginationFooter 
            currentPage={currentPage}
            totalPages={totalPages}
            rowsPerPage={rowsPerPage}
            totalRows={transactions.length}
            onPageChange={setCurrentPage}
            onRowsPerPageChange={setRowsPerPage}
          />
        </div>
      </div>
    </div>
  );
};
