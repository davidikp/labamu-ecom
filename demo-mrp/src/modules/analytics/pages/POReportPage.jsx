
import React, { useState, useMemo, useEffect, useRef } from "react";
import { 
  ChevronRight, 
  ChevronLeft,
  Search, 
  Download,
  Building2,
  FileText,
  CreditCard,
  Info,
  Calendar,
  TrendingUp,
  CircleDollarSign
} from "../../../components/icons/Icons.jsx";
const AlertCircle = Info;
import { MOCK_REPORT_POS } from "../mock/reportMocks";
import { formatCurrency } from "../../../utils/format/formatUtils";
import { StatusBadge } from "../../../components/common/StatusBadge";
import { DropdownSelect } from "../../../components/common/DropdownSelect";
import { MultiSelectDropdown } from "../../../components/common/MultiSelectDropdown.jsx";
import { Button } from "../../../components/common/Button";
import { TablePaginationFooter } from "../../../components/table/TablePaginationFooter";
import { TableSearchField } from "../../../components/table/TableSearchField";
import { 
  ChevronDown as ChevronDownIcon, 
  ChevronUp as ChevronUpIcon 
} from "../../../components/icons/Icons.jsx";
import { createPortal } from "react-dom";

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
  minHeight: "56px",
  padding: "8px 12px",
  display: "flex",
  alignItems: "center",
  fontSize: "var(--text-title-3)",
  color: "var(--neutral-on-surface-primary)",
  ...overrides,
});

const tabButtonStyle = (isActive) => ({
  padding: "8px 24px",
  borderRadius: "100px",
  border: isActive ? "1px solid var(--feature-brand-primary)" : "1px solid var(--neutral-line-separator-1)",
  background: isActive ? "var(--feature-brand-container-lighter)" : "white",
  color: isActive ? "var(--feature-brand-primary)" : "var(--neutral-on-surface-secondary)",
  fontSize: "14px",
  fontWeight: isActive ? "var(--font-weight-bold)" : "var(--font-weight-semibold)",
  cursor: "pointer",
  transition: "all 0.2s ease",
  height: "44px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  whiteSpace: "nowrap"
});

const DateRangePicker = ({ startDate, endDate, onSelect, onClose }) => {
  const pickerRef = React.useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);
  
  const formatDateISO = (date) => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const isSameDay = (d1, d2) => {
    if (!d1 || !d2) return false;
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  const isInRange = (date) => {
    if (!startDate || !endDate) return false;
    return date > startDate && date < endDate;
  };

  const handleDateClick = (date) => {
    if (typeof onSelect !== 'function') return;
    
    if (!startDate || (startDate && endDate)) {
      onSelect(date, null);
    } else {
      if (date < startDate) {
        onSelect(date, startDate);
      } else {
        onSelect(startDate, date);
      }
    }
  };

  const renderDay = (day, month, year, isGrey = false) => {
    const date = new Date(year, month, day);
    const start = isSameDay(date, startDate);
    const end = isSameDay(date, endDate);
    const range = isInRange(date);
    
    return (
      <div 
        key={`${month}-${day}-${year}`}
        onClick={() => !isGrey && handleDateClick(date)}
        style={{
          height: "40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          cursor: isGrey ? "default" : "pointer"
        }}
      >
        {/* Range Background Pill */}
        {(range || start || end) && (
          <div style={{
            position: "absolute",
            left: "0",
            right: "0",
            top: "4px",
            bottom: "4px",
            background: "var(--feature-brand-container-lighter)",
            zIndex: 0,
            borderRadius: start ? "16px 0 0 16px" : (end ? "0 16px 16px 0" : "0")
          }} />
        )}
        
        {/* Date Circle/Text */}
        <div style={{
          width: "32px",
          height: "32px",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "13px",
          zIndex: 1,
          background: (start || end) ? "var(--feature-brand-primary)" : "transparent",
          color: (start || end) ? "white" : (isGrey ? "var(--neutral-on-surface-tertiary)" : "var(--neutral-on-surface-primary)"),
          opacity: isGrey ? 0.3 : 1,
          fontWeight: (start || end || range) ? "bold" : "500",
          transition: "all 0.2s ease"
        }}>
          {day}
        </div>
      </div>
    );
  };

  return (
    <div 
      ref={pickerRef}
      style={{
        position: "absolute",
        top: "calc(100% + 12px)",
        left: 0,
        zIndex: 100,
        background: "white",
        borderRadius: "16px",
        border: "1px solid var(--neutral-line-separator-1)",
        boxShadow: "0 12px 48px rgba(0,0,0,0.15)",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "28px",
        minWidth: "660px"
      }}
    >
      <div style={{ display: "flex", gap: "40px" }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <ChevronLeft size={18} style={{ cursor: "pointer" }} />
            <span style={{ fontWeight: "700", fontSize: "14px", letterSpacing: "0.5px" }}>APR 2026</span>
            <div style={{ width: 18 }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", textAlign: "center" }}>
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
              <span key={d} style={{ fontSize: "12px", color: "var(--neutral-on-surface-tertiary)", paddingBottom: "12px" }}>{d}</span>
            ))}
            {[29, 30, 31].map(d => renderDay(d, 2, 2026, true))}
            {[...Array(30)].map((_, i) => renderDay(i + 1, 3, 2026))}
            {[1, 2].map(d => renderDay(d, 4, 2026, true))}
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div style={{ width: 18 }} />
            <span style={{ fontWeight: "700", fontSize: "14px", letterSpacing: "0.5px" }}>MAY 2026</span>
            <ChevronRight size={18} style={{ cursor: "pointer" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", textAlign: "center" }}>
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
              <span key={d} style={{ fontSize: "12px", color: "var(--neutral-on-surface-tertiary)", paddingBottom: "12px" }}>{d}</span>
            ))}
            {[26, 27, 28, 29, 30].map(d => renderDay(d, 3, 2026, true))}
            {[...Array(31)].map((_, i) => renderDay(i + 1, 4, 2026))}
          </div>
        </div>
      </div>

      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        borderTop: "1px solid var(--neutral-line-separator-1)",
        paddingTop: "24px"
      }}>
        <div style={{
          width: "100%",
          maxWidth: "420px",
          height: "48px",
          borderRadius: "10px",
          border: "1px solid var(--feature-brand-primary)",
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          justifyContent: "space-between",
          background: "white",
          boxShadow: "0 2px 8px rgba(0,107,255,0.08)",
          cursor: "pointer"
        }} onClick={() => { if (startDate && endDate) onClose(); }}>
          <span style={{ fontSize: "14px", fontWeight: "500", color: "var(--neutral-on-surface-primary)" }}>
            {startDate ? formatDateISO(startDate) : "Select Start"} - {endDate ? formatDateISO(endDate) : "Select End"}
          </span>
          <Calendar size={18} color="var(--neutral-on-surface-secondary)" />
        </div>
      </div>
    </div>
  );
};

const POReportPage = ({ onNavigate, t }) => {
  const currency = "IDR";
  const [dateFilter, setDateFilter] = useState("Last 30 Days");
  const [vendorFilter, setVendorFilter] = useState([]);
  const [poStatusFilter, setPoStatusFilter] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d;
  });
  const [endDate, setEndDate] = useState(new Date());
  const [sortConfig, setSortConfig] = useState({ key: 'poNumber', direction: 'asc' });

  const toggleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getActiveRangeLabel = () => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const format = (d) => `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    
    if (dateFilter === "All Period") return "All Period";
    if (!startDate || !endDate) return "";
    return `${format(startDate)} - ${format(endDate)}`;
  };

  const handlePresetClick = (preset) => {
    const today = new Date();
    let start = new Date();
    
    if (preset === "Today") {
      start.setHours(0,0,0,0);
    } else if (preset === "Last 7 Days") {
      start.setDate(today.getDate() - 7);
    } else if (preset === "Last 14 Days") {
      start.setDate(today.getDate() - 14);
    } else if (preset === "Last 30 Days") {
      start.setDate(today.getDate() - 30);
    } else if (preset === "All Period") {
      setDateFilter("All Period");
      setCurrentPage(1);
      setShowDatePicker(false);
      return;
    }
    
    setStartDate(start);
    setEndDate(today);
    setDateFilter(preset);
    setCurrentPage(1);
    setShowDatePicker(false);
  };

  // Date filter logic
  const filteredByDate = useMemo(() => {
    if (dateFilter === "All Period") return MOCK_REPORT_POS;
    if (!startDate || !endDate) return MOCK_REPORT_POS;

    return MOCK_REPORT_POS.filter(po => {
      const poDate = new Date(po.createdDate);
      return poDate >= startDate && poDate <= endDate;
    });
  }, [dateFilter, startDate, endDate]);

  // Main filter logic
  const filteredData = useMemo(() => {
    let result = filteredByDate.filter(po => {
      const matchesVendor = vendorFilter.length === 0 || vendorFilter.includes(po.vendorName);
      const matchesPoStatus = poStatusFilter.length === 0 || poStatusFilter.includes(po.status);
      
      const invoicedAmount = po.invoices.reduce((s, i) => s + i.amount, 0);
      const paidAmount = po.invoices.reduce((s, i) => s + i.payments.reduce((sp, p) => sp + p.amount, 0), 0);
      
      const matchesSearch = po.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           po.vendorName.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesVendor && matchesPoStatus && matchesSearch;
    });

    // Sorting logic
    result.sort((a, b) => {
      let aVal, bVal;
      
      const getInvoiced = (item) => item.invoices.reduce((s, i) => s + i.amount, 0);
      const getPaid = (item) => item.invoices.reduce((s, i) => s + i.payments.reduce((sp, p) => sp + p.amount, 0), 0);

      switch(sortConfig.key) {
        case 'poDate':
          aVal = new Date(a.createdDate).getTime();
          bVal = new Date(b.createdDate).getTime();
          break;
        case 'poValue':
          aVal = a.amount;
          bVal = b.amount;
          break;
        case 'vendorInvoice':
          aVal = getInvoiced(a);
          bVal = getInvoiced(b);
          break;
        case 'paid':
          aVal = getPaid(a);
          bVal = getPaid(b);
          break;
        case 'outstanding':
          aVal = getInvoiced(a) - getPaid(a);
          bVal = getInvoiced(b) - getPaid(b);
          break;
        case 'poGap':
          aVal = a.amount - getInvoiced(a);
          bVal = b.amount - getInvoiced(b);
          break;
        default:
          aVal = a[sortConfig.key] || '';
          bVal = b[sortConfig.key] || '';
          if (typeof aVal === 'string') aVal = aVal.toLowerCase();
          if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [filteredByDate, vendorFilter, poStatusFilter, searchQuery, sortConfig]);

  // Summary Metrics
  const metrics = useMemo(() => {
    let totalPoValue = 0;
    let invoicedValue = 0;
    let paidValue = 0;

    filteredData.forEach(po => {
      totalPoValue += po.amount;
      po.invoices.forEach(inv => {
        invoicedValue += inv.amount;
        paidValue += inv.payments.reduce((sum, p) => sum + p.amount, 0);
      });
    });

    return {
      totalCount: filteredData.length,
      totalPoValue,
      invoicedValue,
      outstandingToPay: invoicedValue - paidValue
    };
  }, [filteredData]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Filter options
  const vendors = ["all", ...new Set(MOCK_REPORT_POS.map(po => po.vendorName))];
  const poStatuses = ["all", "Issued", "Completed"];

  const tableColumns = [
    { label: "PO No", flex: "1.4", key: "poNumber" },
    { label: "PO Date", flex: "1.2", key: "poDate", sortable: true },
    { label: "Vendor", flex: "1.8", key: "vendorName" },
    { label: "PO Value", flex: "1.4", key: "poValue", sortable: true },
    { label: "Vendor Invoice", flex: "1.2", key: "vendorInvoice", sortable: true },
    { label: "Paid", flex: "1.2", key: "paid", sortable: true },
    { label: "Outstanding", flex: "1.4", key: "outstanding", sortable: true, tooltip: "Amount that has not been paid from the vendor invoice" },
    { label: "Uninvoiced Amount", flex: "1.4", key: "poGap", sortable: true, tooltip: "Difference between the purchase order value and vendor invoice value" },
    { label: "PO Status", flex: "1.2", key: "status" },
  ];

  const handleExport = () => {
    console.log("Exporting data...", filteredData);
    alert("Exporting " + filteredData.length + " POs to Excel...");
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
            color: "var(--neutral-on-surface-primary)",
            display: "flex",
            alignItems: "center",
            gap: "12px"
          }}>
            PO Report
            <span style={{ 
              fontSize: "16px", 
              fontWeight: "500", 
              color: "var(--neutral-on-surface-secondary)" 
            }}>
              ({getActiveRangeLabel()})
            </span>
          </h1>
        </div>
        
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: "8px", 
          fontSize: "var(--text-title-3)",
          color: "var(--neutral-on-surface-secondary)",
          marginBottom: "24px"
        }}>
          <span 
            style={{ cursor: "pointer" }}
            onClick={() => onNavigate("analytics_procurement_ap_report")}
          >
            Procurement & AP Report
          </span>
          <span style={{ color: "var(--neutral-on-surface-tertiary)" }}>/</span>
          <span style={{ color: "var(--neutral-on-surface-secondary)" }}>PO Report</span>
        </div>

        {/* Period Filter (Tab Chips) */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", position: "relative" }}>
          <button
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: (showDatePicker || dateFilter === "Custom") ? "var(--feature-brand-primary)" : "white",
              border: "1px solid " + ((showDatePicker || dateFilter === "Custom") ? "var(--feature-brand-primary)" : "var(--neutral-line-separator-1)"),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: (showDatePicker || dateFilter === "Custom") ? "white" : "var(--neutral-on-surface-secondary)",
              transition: "all 0.2s ease"
            }}
            onClick={() => setShowDatePicker(!showDatePicker)}
          >
            <Calendar size={18} />
          </button>

          {["All Period", "Last 30 Days", "Last 14 Days", "Last 7 Days", "Today"].map(chip => (
            <button
              key={chip}
              onClick={() => handlePresetClick(chip)}
              style={tabButtonStyle(dateFilter === chip && !showDatePicker)}
            >
              {chip}
            </button>
          ))}

          {showDatePicker && (
            <DateRangePicker 
              startDate={startDate}
              endDate={endDate}
              onSelect={(s, e) => {
                setStartDate(s);
                setEndDate(e);
                if (s && e) setDateFilter("Custom");
              }}
              onClose={() => setShowDatePicker(false)}
            />
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "24px", flexShrink: 0 }}>
        {[
          { label: "Total Orders", value: metrics.totalCount, icon: <FileText /> },
          { label: "Total Order Value", value: formatCurrency(metrics.totalOrderValue || metrics.totalPoValue, currency), icon: <TrendingUp /> },
          { label: "Total Paid Value", value: formatCurrency(metrics.totalPaidValue || metrics.invoicedValue, currency), icon: <CreditCard /> },
          { label: "Total Outstanding Value", value: formatCurrency(metrics.totalOutstandingValue || metrics.outstandingToPay, currency), icon: <CircleDollarSign /> },
        ].map((card, idx) => (
          <div key={idx} style={{ 
            background: "var(--neutral-surface-primary)", 
            borderRadius: "16px", 
            padding: "20px", 
            border: "1px solid var(--neutral-line-separator-1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            minHeight: "92px"
          }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <div style={{ fontSize: "13px", color: "var(--neutral-on-surface-tertiary)", fontWeight: "500" }}>{card.label}</div>
              <div style={{ fontSize: "16px", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>{card.value}</div>
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
              {React.cloneElement(card.icon, { size: 18, color: "var(--neutral-on-surface-secondary)" })}
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
              options={vendors.map(v => ({ value: v, label: v === "all" ? "Vendor" : v }))}
              onChange={(val) => { setVendorFilter(val); setCurrentPage(1); }}
            />
            <MultiSelectDropdown 
              placeholder="PO Status"
              value={poStatusFilter}
              options={poStatuses.map(s => ({ value: s, label: s === "all" ? "PO Status" : s }))}
              onChange={(val) => { setPoStatusFilter(val); setCurrentPage(1); }}
            />
          </div>

          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <TableSearchField 
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="Search PO number"
              style={{ width: "320px" }}
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
                  flex: col.flex, 
                  padding: "0 12px", 
                  height: "49px", 
                  display: "flex", 
                  alignItems: "center",
                  cursor: col.sortable ? "pointer" : "default",
                  gap: "6px"
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
                  {col.tooltip && (
                    <Tooltip content={col.tooltip}>
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
            {paginatedData.length > 0 ? paginatedData.map((po, idx) => {
              const invoiced = po.invoices.reduce((s, i) => s + i.amount, 0);
              const paid = po.invoices.reduce((s, i) => s + i.payments.reduce((sp, p) => sp + p.amount, 0), 0);
              const outstanding = invoiced - paid;
              
              let poVariant = "grey";
              if (po.status === "Waiting for Approval") poVariant = "orange";
              else if (po.status === "Need Revision") poVariant = "yellow";
              else if (po.status === "Issued") poVariant = "blue";
              else if (po.status === "Completed") poVariant = "green";
              else if (po.status === "Canceled") poVariant = "red";

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
                  <div style={cellStyle({ flex: tableColumns[0].flex, fontWeight: "600", color: "var(--feature-brand-primary)" })}>
                    <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "8px", minWidth: 0 }}>
                      <span>{po.poNumber}</span>
                      {po.version > 1 && (
                        <StatusBadge variant="grey-light">{`V ${po.version}.0`}</StatusBadge>
                      )}
                    </div>
                  </div>
                  <div style={cellStyle({ flex: tableColumns[1].flex })}>{po.createdDate}</div>
                  <div style={cellStyle({ flex: tableColumns[2].flex, fontWeight: "500" })}>{po.vendorName}</div>
                  <div style={cellStyle({ flex: tableColumns[3].flex, fontWeight: "500" })}>{formatCurrency(po.amount, currency)}</div>
                  <div style={cellStyle({ flex: tableColumns[4].flex })}>{formatCurrency(invoiced, currency)}</div>
                  <div style={cellStyle({ flex: tableColumns[5].flex })}>{formatCurrency(paid, currency)}</div>
                  <div style={cellStyle({ flex: tableColumns[6].flex })}>{formatCurrency(outstanding, currency)}</div>
                  <div style={cellStyle({ flex: tableColumns[7].flex })}>{formatCurrency(po.amount - invoiced, currency)}</div>
                  <div style={cellStyle({ flex: tableColumns[8].flex })}><StatusBadge variant={poVariant}>{po.status}</StatusBadge></div>
                </div>
              );
            }) : (
              <div style={{ padding: "64px 24px", textAlign: "center", color: "var(--neutral-on-surface-tertiary)", fontSize: "14px" }}>
                No purchase orders found for the selected criteria.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pagination Footer */}
        <TablePaginationFooter
          totalRows={filteredData.length}
          rowsPerPage={itemsPerPage}
          onRowsPerPageChange={setItemsPerPage}
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

export { POReportPage };
