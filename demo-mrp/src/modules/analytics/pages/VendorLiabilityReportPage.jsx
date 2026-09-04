
import React, { useState, useMemo } from "react";
import { 
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  Search, 
  Download,
  Building2,
  Info,
  FileText,
  Calendar,
  CheckCircleIcon,
  TrendingUp,
  CircleDollarSign
} from "../../../components/icons/Icons.jsx";
import { MOCK_REPORT_POS } from "../mock/reportMocks";
import { formatCurrency } from "../../../utils/format/formatUtils";
import { StatusBadge } from "../../../components/common/StatusBadge";
import { MultiSelectDropdown } from "../../../components/common/MultiSelectDropdown.jsx";
import { Button } from "../../../components/common/Button";
import { TableSearchField } from "../../../components/table/TableSearchField";
import { TablePaginationFooter } from "../../../components/table/TablePaginationFooter";

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

const VendorLiabilityReportPage = ({ onNavigate, t }) => {
  const currency = "IDR";
  const [vendorFilter, setVendorFilter] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: "total", direction: "desc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const today = new Date();

  // Aggregate data by Vendor
  const vendorLiabilities = useMemo(() => {
    const map = {};

    MOCK_REPORT_POS.forEach(po => {
      if (!map[po.vendorName]) {
        map[po.vendorName] = {
          name: po.vendorName,
          notDue: 0,
          late1_30: 0,
          late31_60: 0,
          late61_90: 0,
          late90Plus: 0,
          total: 0
        };
      }

      po.invoices.forEach(inv => {
        const paidAmount = inv.payments.reduce((sum, p) => sum + p.amount, 0);
        const outstanding = inv.amount - paidAmount;

        if (outstanding > 0) {
          const dueDate = new Date(inv.dueDate);
          const diffTime = today - dueDate;
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays <= 0) {
            map[po.vendorName].notDue += outstanding;
          } else if (diffDays <= 30) {
            map[po.vendorName].late1_30 += outstanding;
          } else if (diffDays <= 60) {
            map[po.vendorName].late31_60 += outstanding;
          } else if (diffDays <= 90) {
            map[po.vendorName].late61_90 += outstanding;
          } else {
            map[po.vendorName].late90Plus += outstanding;
          }
          map[po.vendorName].total += outstanding;
        }
      });
    });

    return Object.values(map);
  }, []);

  // Filter and Search
  const filteredData = useMemo(() => {
    return vendorLiabilities.filter(v => {
      return vendorFilter.length === 0 || vendorFilter.includes(v.name);
    });
  }, [vendorLiabilities, vendorFilter]);

  // Sort Logic
  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      const { key, direction } = sortConfig;
      let comparison = 0;
      if (key === "name") {
        comparison = a.name.localeCompare(b.name);
      } else {
        comparison = a[key] - b[key];
      }
      return direction === "asc" ? comparison : -comparison;
    });
  }, [filteredData, sortConfig]);

  const tableColumns = [
    { label: "Vendor", flex: "1.8", sortKey: "name", sortable: true },
    { label: "Not Due", flex: "1.2", sortKey: "notDue" },
    { label: "Late 1-30 days", flex: "1.2", sortKey: "late1_30" },
    { label: "Late 31-60 days", flex: "1.2", sortKey: "late31_60" },
    { label: "Late 61-90 days", flex: "1.2", sortKey: "late61_90" },
    { label: "Late 90+ days", flex: "1.2", sortKey: "late90Plus" },
    { label: "Total Outstanding", flex: "1.4", sortKey: "total", sortable: true },
  ];

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === "desc" ? "asc" : "desc"
    }));
  };

  const totalPages = Math.ceil(sortedData.length / rowsPerPage);
  const paginatedData = sortedData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  // Summary Metrics (reflect the filters applied to the table)
  const summary = useMemo(() => {
    return filteredData.reduce((acc, curr) => ({
      total: acc.total + curr.total,
      notDue: acc.notDue + curr.notDue,
      late1_30: acc.late1_30 + curr.late1_30,
      late31_60: acc.late31_60 + curr.late31_60,
      late61_90: acc.late61_90 + curr.late61_90,
      late90Plus: acc.late90Plus + curr.late90Plus,
    }), { total: 0, notDue: 0, late1_30: 0, late31_60: 0, late61_90: 0, late90Plus: 0 });
  }, [filteredData]);

  const handleExport = () => {
    alert(`Exporting ${sortedData.length} vendors liability report...`);
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
            Vendor Liability Report
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
          <span style={{ color: "var(--neutral-on-surface-secondary)" }}>Vendor Liability Report</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px", flexShrink: 0 }}>
        {[
          { label: "Total Outstanding", value: summary.total, icon: <TrendingUp /> },
          { label: "Not Due", value: summary.notDue, icon: <CheckCircleIcon /> },
          { label: "Late 1-30 days", value: summary.late1_30, icon: <Calendar /> },
          { label: "Late 31-60 days", value: summary.late31_60, icon: <Calendar /> },
          { label: "Late 61-90 days", value: summary.late61_90, icon: <Calendar /> },
          { label: "Late 90+ days", value: summary.late90Plus, icon: <Info /> },
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
              {React.isValidElement(card.icon) ? React.cloneElement(card.icon, { size: 18, color: "var(--neutral-on-surface-secondary)" }) : <card.icon size={18} color="var(--neutral-on-surface-secondary)" />}
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
              searchable={true}
              placeholder="Vendor"
              value={vendorFilter}
              options={["all", ...new Set(vendorLiabilities.map(v => v.name))].map(v => ({ value: v, label: v === "all" ? "Vendor" : v }))}
              onChange={(val) => { setVendorFilter(val); setCurrentPage(1); }}
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
                style={{
                  flex: col.flex,
                  ...cellStyle({ fontWeight: "var(--font-weight-bold)" }),
                  cursor: col.sortable ? "pointer" : "default",
                  userSelect: "none"
                }}
                onClick={() => col.sortable && handleSort(col.sortKey)}
              >
                <span style={{
                  fontSize: "var(--text-title-3)",
                  fontWeight: "var(--font-weight-bold)",
                  color: "var(--neutral-on-surface-primary)",
                  marginRight: "4px"
                }}>
                  {col.label}
                </span>
                {col.sortable && (
                  <span style={{ display: "inline-flex", opacity: sortConfig.key === col.sortKey ? 1 : 0.3 }}>
                    {sortConfig.key === col.sortKey && sortConfig.direction === "asc"
                      ? <ChevronUp size={14} />
                      : <ChevronDown size={14} />}
                  </span>
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
            {paginatedData.length > 0 ? paginatedData.map((v, idx) => (
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
                <div style={cellStyle({ flex: tableColumns[0].flex, fontWeight: "600" })}>{v.name}</div>
                <div style={cellStyle({ flex: tableColumns[1].flex })}>{formatCurrency(v.notDue, currency)}</div>
                <div style={cellStyle({ flex: tableColumns[2].flex })}>{formatCurrency(v.late1_30, currency)}</div>
                <div style={cellStyle({ flex: tableColumns[3].flex })}>{formatCurrency(v.late31_60, currency)}</div>
                <div style={cellStyle({ flex: tableColumns[4].flex })}>{formatCurrency(v.late61_90, currency)}</div>
                <div style={cellStyle({ flex: tableColumns[5].flex })}>{formatCurrency(v.late90Plus, currency)}</div>
                <div style={cellStyle({ flex: tableColumns[6].flex })}>{formatCurrency(v.total, currency)}</div>
              </div>
            )) : (
              <div style={{ padding: "64px 24px", textAlign: "center", color: "var(--neutral-on-surface-tertiary)", fontSize: "14px" }}>
                No vendor liabilities found for the selected criteria.
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

export { VendorLiabilityReportPage };
