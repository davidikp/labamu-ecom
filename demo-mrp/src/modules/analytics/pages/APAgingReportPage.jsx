
import React, { useState, useMemo, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { 
  ChevronLeft,
  ChevronRight,
  ChevronDown as ChevronDownIcon,
  ChevronUp as ChevronUpIcon,
  Search, 
  Download,
  FileText,
  Info,
  Building2,
  CreditCard,
  Calendar,
  CheckCircleIcon,
  TrendingUp,
  CircleDollarSign
} from "../../../components/icons/Icons.jsx";
import { MOCK_REPORT_POS } from "../mock/reportMocks";
import { formatCurrency } from "../../../utils/format/formatUtils";
import { StatusBadge } from "../../../components/common/StatusBadge";
import { DropdownSelect } from "../../../components/common/DropdownSelect";
import { MultiSelectDropdown } from "../../../components/common/MultiSelectDropdown.jsx";
import { Button } from "../../../components/common/Button";
import { TableSearchField } from "../../../components/table/TableSearchField";
import { TablePaginationFooter } from "../../../components/table/TablePaginationFooter";

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
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center"
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

const cellStyle = (overrides) => ({
  minWidth: 0,
  height: "56px",
  padding: "0 12px",
  display: "flex",
  alignItems: "center",
  fontSize: "var(--text-title-3)",
  color: "var(--neutral-on-surface-primary)",
  ...overrides,
});

const APAgingReportPage = ({ onNavigate, t }) => {
  const currency = "IDR";
  const [agingBucketFilter, setAgingBucketFilter] = useState([]);
  const [vendorFilter, setVendorFilter] = useState([]);
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [sortConfig, setSortConfig] = useState({ key: 'overdueDays', direction: 'desc' });

  const toggleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const today = new Date();

  // Flatten all invoices with metadata
  const allInvoices = useMemo(() => {
    const list = [];
    MOCK_REPORT_POS.forEach(po => {
      po.invoices.forEach(inv => {
        const paidAmount = inv.payments.reduce((sum, p) => sum + p.amount, 0);
        const outstanding = inv.amount - paidAmount;
        
        const dueDate = new Date(inv.dueDate);
        const diffTime = today - dueDate;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        let agingBucket = "Not Due";
        if (diffDays > 90) agingBucket = "Late 90+ days";
        else if (diffDays > 60) agingBucket = "Late 61-90 days";
        else if (diffDays > 30) agingBucket = "Late 31-60 days";
        else if (diffDays > 0) agingBucket = "Late 1-30 days";

        let status = "Open";
        if (paidAmount >= inv.amount) {
          status = "Paid";
        } else if (paidAmount > 0) {
          status = "Partially Paid";
        } else if (diffDays > 0) {
          status = "Overdue";
        }

        list.push({
          ...inv,
          poNumber: po.poNumber,
          vendorName: po.vendorName,
          invoiceDate: po.createdDate,
          paidAmount,
          outstanding,
          agingBucket,
          status,
          overdueDays: diffDays > 0 ? diffDays : 0
        });
      });
    });
    return list;
  }, []);

  // Filter Logic
  const filteredData = useMemo(() => {
    return allInvoices.filter(inv => {
      const matchesAging = agingBucketFilter.length === 0 || agingBucketFilter.includes(inv.agingBucket);
      const matchesVendor = vendorFilter.length === 0 || vendorFilter.includes(inv.vendorName);
      
      let matchesStatus = true;
      if (invoiceStatusFilter.length > 0) {
        matchesStatus = invoiceStatusFilter.includes(inv.status);
      }

      const matchesSearch = inv.number.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           inv.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           inv.poNumber.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesAging && matchesVendor && matchesStatus && matchesSearch;
    });
  }, [allInvoices, agingBucketFilter, vendorFilter, invoiceStatusFilter, searchQuery]);

  // Sorting logic
  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      let aVal, bVal;
      
      switch (sortConfig.key) {
        case 'dueDate':
          aVal = new Date(a.dueDate).getTime();
          bVal = new Date(b.dueDate).getTime();
          break;
        case 'outstanding':
          aVal = a.outstanding;
          bVal = b.outstanding;
          break;
        default:
          // Default sorting: Highest overdue first, then highest outstanding
          if (b.overdueDays !== a.overdueDays) return b.overdueDays - a.overdueDays;
          return b.outstanding - a.outstanding;
      }
      
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  // Summary Metrics (reflect the filters applied to the table)
  const summary = useMemo(() => {
    return filteredData.reduce((acc, curr) => {
      if (curr.status === "Paid") return acc;

      if (curr.agingBucket === "Not Due") acc.notDue += curr.outstanding;
      else if (curr.agingBucket === "Late 1-30 days") acc.late1_30 += curr.outstanding;
      else if (curr.agingBucket === "Late 31-60 days") acc.late31_60 += curr.outstanding;
      else if (curr.agingBucket === "Late 61-90 days") acc.late61_90 += curr.outstanding;
      else if (curr.agingBucket === "Late 90+ days") acc.late90Plus += curr.outstanding;

      return acc;
    }, { notDue: 0, late1_30: 0, late31_60: 0, late61_90: 0, late90Plus: 0 });
  }, [filteredData]);

  // Pagination
  const totalPages = Math.ceil(sortedData.length / rowsPerPage);
  const paginatedData = sortedData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const tableColumns = [
    { label: "PO No", flex: "1.2" },
    { label: "Vendor", flex: "1.8" },
    { label: "Invoice No", flex: "1.4" },
    { label: "Invoice Date", flex: "1.2" },
    { label: "Due Date", flex: "1.6", key: "dueDate", sortable: true },
    { label: "Invoice Amount", flex: "1.4" },
    { label: "Paid Amount", flex: "1.4" },
    { label: "Outstanding", flex: "1.4", key: "outstanding", sortable: true },
    { label: "Invoice Status", flex: "1.2" },
    { label: "Aging Bucket", flex: "1.4" },
  ];

  const handleExport = () => {
    alert(`Exporting ${sortedData.length} invoices to Excel...`);
  };

  return (
    <div style={{
      height: "calc(100vh - 64px)",
      padding: "24px",
      boxSizing: "border-box",
      display: "flex",
      flexDirection: "column",
      gap: "24px",
      background: "var(--neutral-background-primary)",
      overflow: "hidden",
      minHeight: 0,
    }}>
      {/* Header Section */}
      <div>
        <div 
          style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "12px", 
            cursor: "pointer",
            marginLeft: "-4px",
            marginBottom: "8px"
          }}
          onClick={() => onNavigate("analytics_procurement_ap_report")}
        >
          <ChevronLeft size={28} color="var(--neutral-on-surface-primary)" />
          <h1 style={{ 
            margin: 0, 
            fontSize: "var(--text-large-title)", 
            fontWeight: "var(--font-weight-bold)",
            color: "var(--neutral-on-surface-primary)"
          }}>
            Accounts Payable Aging Report
          </h1>
        </div>
        
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: "8px", 
          fontSize: "var(--text-title-3)",
          color: "var(--neutral-on-surface-secondary)"
        }}>
          <span 
            style={{ cursor: "pointer" }}
            onClick={() => onNavigate("analytics_procurement_ap_report")}
          >
            Procurement & AP Report
          </span>
          <span style={{ color: "var(--neutral-on-surface-tertiary)" }}>/</span>
          <span style={{ color: "var(--neutral-on-surface-secondary)" }}>Accounts Payable Aging Report</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "24px", flexShrink: 0 }}>
        {[
          { label: "Not Due", value: summary.notDue, icon: <CheckCircleIcon /> },
          { label: "Late 1-30 days", value: summary.late1_30, icon: <Calendar /> },
          { label: "Late 31-60 days", value: summary.late31_60, icon: <Calendar /> },
          { label: "Late 61-90 days", value: summary.late61_90, icon: <Calendar /> },
          { label: "Late 90+ days", value: summary.late90Plus, icon: <Info />, isCritical: true },
        ].map((card, idx) => (
          <div 
            key={idx}
            style={{
              background: "var(--neutral-surface-primary)",
              borderRadius: "16px",
              padding: "20px",
              border: "1px solid var(--neutral-line-separator-1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              minHeight: "92px"
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <span style={{ fontSize: "13px", color: "var(--neutral-on-surface-tertiary)", fontWeight: "500" }}>
                {card.label}
              </span>
              <div style={{ fontSize: "16px", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>
                {formatCurrency(card.value, currency)}
              </div>
            </div>
            <div style={{ 
              width: "36px", 
              height: "36px", 
              borderRadius: "50%", 
              background: "#F5F5F5", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              flexShrink: 0
            }}>
              {React.isValidElement(card.icon) ? React.cloneElement(card.icon, { size: 18, color: card.isCritical ? "var(--status-red-primary)" : "var(--neutral-on-surface-secondary)" }) : <card.icon size={18} color={card.isCritical ? "var(--status-red-primary)" : "var(--neutral-on-surface-secondary)"} />}
            </div>
          </div>
        ))}
      </div>

      {/* Table Section */}
      <div style={{ 
        background: "var(--neutral-surface-primary)", 
        borderRadius: "16px", 
        border: "1px solid var(--neutral-line-separator-1)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        minHeight: 0
      }}>
        {/* Filters Header */}
        <div style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--neutral-line-separator-2)" }}>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <MultiSelectDropdown 
              placeholder="Aging Bucket"
              value={agingBucketFilter}
              options={[
                { value: "Not Due", label: "Not Due" },
                { value: "Late 1-30 days", label: "Late 1-30 days" },
                { value: "Late 31-60 days", label: "Late 31-60 days" },
                { value: "Late 61-90 days", label: "Late 61-90 days" },
                { value: "Late 90+ days", label: "Late 90+ days" }
              ]}
              onChange={(val) => { setAgingBucketFilter(val); setCurrentPage(1); }}
            />
            <MultiSelectDropdown 
              searchable={true}
              placeholder="Vendor"
              value={vendorFilter}
              options={["all", ...new Set(allInvoices.map(inv => inv.vendorName))].map(v => ({ value: v, label: v === "all" ? "Vendor" : v }))}
              onChange={(val) => { setVendorFilter(val); setCurrentPage(1); }}
            />
            <MultiSelectDropdown 
              placeholder="Status"
              value={invoiceStatusFilter}
              options={[
                { value: "Open", label: "Open" },
                { value: "Overdue", label: "Overdue" },
                { value: "Partially Paid", label: "Partially Paid" },
                { value: "Paid", label: "Paid" }
              ]}
              onChange={(val) => { setInvoiceStatusFilter(val); setCurrentPage(1); }}
            />
          </div>

          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <TableSearchField 
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="Search PO or invoice number"
              style={{ width: "280px" }}
            />
          </div>
        </div>

        {/* Table Content */}
        <div style={{ 
          maxHeight: "calc(100vh - 412px)", 
          overflow: "auto", 
          width: "100%" 
        }}>
          <div style={{
            minWidth: "1050px",
            width: "100%",
            display: "flex",
            flexDirection: "column",
          }}>
            {/* Header Row */}
            <div style={{ 
              display: "flex", 
              background: "var(--neutral-surface-primary)", 
              borderBottom: "1px solid var(--neutral-line-separator-1)",
              position: "sticky",
              top: 0,
              zIndex: 20
            }}>
            {tableColumns.map((col, idx) => (
              <div 
                key={idx} 
                onClick={() => col.sortable && toggleSort(col.key)}
                style={{ 
                  flex: `${col.flex} 1 0%`, 
                  minWidth: 0,
                  padding: "0 12px", 
                  height: "49px", 
                  display: "flex", 
                  alignItems: "center",
                  cursor: col.sortable ? "pointer" : "default",
                  gap: "4px"
                }}
              >
                <span style={{ 
                  fontSize: "var(--text-title-3)", 
                  fontWeight: "var(--font-weight-bold)", 
                  color: "var(--neutral-on-surface-primary)",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px"
                }}>
                  {col.label}
                  {col.label === "Outstanding" && (
                    <Tooltip content="Amount that has not been paid from the vendor invoice">
                      <Info size={14} color="var(--neutral-on-surface-tertiary)" style={{ cursor: "help" }} />
                    </Tooltip>
                  )}
                </span>
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
            ))}
            </div>

            {/* Rows */}
            <div style={{ 
              display: "flex", 
              flexDirection: "column",
              flex: paginatedData.length === 0 ? 1 : "0 0 auto"
            }}>
            {paginatedData.length > 0 ? paginatedData.map((inv, idx) => {
              let statusVariant = "red-light";
              if (inv.status === "Paid") statusVariant = "green-light";
              if (inv.status === "Partially Paid") statusVariant = "blue-light";
              if (inv.status === "Open") statusVariant = "grey-light";

              const isOverdue = inv.overdueDays > 0 && inv.status !== "Paid";

              return (
                <div 
                  key={idx} 
                  style={{ 
                    display: "flex", 
                    borderBottom: "1px solid var(--neutral-line-separator-1)",
                    transition: "background 0.1s ease"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "var(--neutral-surface-grey-lighter)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
                  <div style={cellStyle({ 
                    flex: `${tableColumns[0].flex} 1 0%`, 
                    color: "var(--feature-brand-primary)", 
                    fontWeight: "500",
                    position: "relative"
                  })}>
                    <div 
                      style={{
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        wordBreak: "break-all",
                        lineHeight: "1.2"
                      }}
                      title={inv.poNumber.length > 20 ? inv.poNumber : ""}
                    >
                      {inv.poNumber}
                    </div>
                  </div>
                  <div style={cellStyle({ flex: `${tableColumns[1].flex} 1 0%`, fontWeight: "400" })}>{inv.vendorName}</div>
                  <div style={cellStyle({ flex: `${tableColumns[2].flex} 1 0%`, fontWeight: "400" })}>{inv.number}</div>
                  <div style={cellStyle({ flex: `${tableColumns[3].flex} 1 0%` })}>{inv.invoiceDate}</div>
                  <div style={cellStyle({ flex: `${tableColumns[4].flex} 1 0%`, color: isOverdue ? "var(--status-red-primary)" : "var(--neutral-on-surface-primary)", fontWeight: isOverdue ? "700" : "400", flexDirection: "column", alignItems: "flex-start", justifyContent: "center" })}>
                    <div>{inv.dueDate}</div>
                    {isOverdue && <div style={{ fontSize: "11px", fontWeight: "600" }}>{`(${inv.overdueDays}d overdue)`}</div>}
                  </div>
                  <div style={cellStyle({ flex: `${tableColumns[5].flex} 1 0%` })}>{formatCurrency(inv.amount, currency)}</div>
                  <div style={cellStyle({ flex: `${tableColumns[6].flex} 1 0%` })}>{formatCurrency(inv.paidAmount, currency)}</div>
                  <div style={cellStyle({ flex: `${tableColumns[7].flex} 1 0%`, fontWeight: "400", color: isOverdue ? "var(--status-red-primary)" : "var(--neutral-on-surface-primary)" })}>{formatCurrency(inv.outstanding, currency)}</div>
                  <div style={cellStyle({ flex: `${tableColumns[8].flex} 1 0%` })}><StatusBadge variant={statusVariant}>{inv.status}</StatusBadge></div>
                  <div style={cellStyle({ flex: `${tableColumns[9].flex} 1 0%` })}>
                    <StatusBadge variant={
                      inv.agingBucket === "Not Due" ? "grey-light" : 
                      inv.agingBucket === "Late 1-30 days" ? "blue-light" :
                      inv.agingBucket === "Late 31-60 days" ? "yellow-light" :
                      inv.agingBucket === "Late 61-90 days" ? "orange-light" :
                      "red-light"
                    }>
                      {inv.agingBucket}
                    </StatusBadge>
                  </div>
                </div>
              );
            }) : (
              <div style={{ padding: "64px 24px", textAlign: "center", color: "var(--neutral-on-surface-tertiary)", fontSize: "14px" }}>
                No invoices found for the selected criteria.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pagination Footer */}
        <TablePaginationFooter
          totalRows={sortedData.length}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={setRowsPerPage}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          renderLeftActions={() => (
            <Button 
              variant="outlined" 
              size="small"
              leftIcon={Download}
              onClick={handleExport}
              style={{ height: "40px", borderRadius: "12px", padding: "0 16px" }}
            >
              Download
            </Button>
          )}
        />
      </div>
    </div>
  );
};

export { APAgingReportPage };
