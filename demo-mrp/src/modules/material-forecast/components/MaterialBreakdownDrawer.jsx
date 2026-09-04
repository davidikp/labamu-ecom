import React, { useState, useMemo, useRef, useEffect } from "react";
import { CloseIcon, Info, AddIcon, DocumentIcon, ChevronDownIcon, ChevronLeft } from "../../../components/icons/Icons.jsx";
import { IconButton } from "../../../components/common/IconButton.jsx";
import { Button } from "../../../components/common/Button.jsx";
import { TableSearchField } from "../../../components/table/TableSearchField.jsx";
import { TablePaginationFooter } from "../../../components/table/TablePaginationFooter.jsx";
import { FilterPill } from "../../../components/common/FilterPill.jsx";
import { FilterPopoverCheckbox } from "../../../components/molecules/FilterPopoverCheckbox.jsx";
import { DateRangeInputControl } from "../../purchase-order/components/DateRangeInputControl.jsx";
import { DropdownSelect } from "../../../components/common/DropdownSelect.jsx";
import { StatusBadge } from "../../../components/common/StatusBadge.jsx";
import { MOCK_PROCUREMENT_STATUS, MOCK_CUSTOMER_PIC_MAP } from "../mock/materialForecastMocks.js";
import { MOCK_PO_TABLE_DATA } from "../../purchase-order/mock/purchaseOrderMocks.js";

const ROW_BORDER = "1px solid var(--neutral-line-separator-1)";

const formatNumberWithCommas = (num) => num.toLocaleString();

const MOCK_VENDOR_INFO = {
  "PT Mitra Sejahtera":  { phone: "08123456789", email: "contact@mitra.com",         address: "Jl. Sudirman No.1, Jakarta Pusat, 10220" },
  "CV Kayu Makmur":      { phone: "02198765432", email: "info@kayumakmur.co.id",     address: "Jl. Industri No.5, Bekasi, 17530" },
  "Bintang Sejahtera":   { phone: "02155512345", email: "order@bintangsejahtera.id", address: "Jl. Raya Bogor Km.12, Depok, 16436" },
  "PT Cahaya Abadi":     { phone: "02177889900", email: "procurement@cahayaabadi.com", address: "Jl. Gatot Subroto No.88, Jakarta Selatan, 12930" },
};
const SHIP_TO_DEFAULT = { name: "Labamu Manufacturing", phone: "+62 21 555 1234", email: "procurement@labamu.com", address: "Jl. Industri Utama Kav.9, South Tangerang, Banten" };

// ── Date helpers ───────────────────────────────────────────────────────────────

const getMondayOfCurrentWeek = () => {
  const today = new Date();
  const day = today.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(today);
  monday.setDate(today.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
};

const fmtDate = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const getAbsoluteStartDate = (weekOffset, dayOffset) => {
  const monday = getMondayOfCurrentWeek();
  monday.setDate(monday.getDate() + weekOffset * 7 + dayOffset);
  return monday;
};

// ── Urgency computation — based on days-in-advance setting ────────────────────

const getUrgencyStatus = (woStartDate, needToBuy, daysInAdvance) => {
  if (needToBuy === 0) return "covered";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(woStartDate);
  start.setHours(0, 0, 0, 0);
  const diffDays = Math.floor((start - today) / 86400000);
  if (diffDays < 0) return "delayed";
  if (diffDays <= daysInAdvance) return "urgent";
  return "on_track";
};

const STATUS_CONFIG = {
  delayed:      { label: "Delayed",     bg: "var(--neutral-surface-grey-lighter, #F5F5F5)", color: "var(--neutral-on-surface-secondary)" },
  urgent:       { label: "Urgent",      bg: "var(--status-red-container, #FFEBEE)",          color: "var(--status-red-primary)" },
  on_track:     { label: "Not Covered", bg: "var(--status-orange-container, #FFF3E0)",       color: "var(--status-orange-primary)" },
  covered:      { label: "Covered",     bg: "var(--status-green-container, #E8F5E9)",        color: "var(--status-green-primary)" },
};

const STATUS_ORDER = { delayed: 0, urgent: 1, on_track: 2, covered: 3 };

// ── Column definitions ─────────────────────────────────────────────────────────

const WO_ID_W    = 130;
const ORDER_ID_W = 110;
const PRODUCT_W  = 180;
const CUSTOMER_W = 160;
const EST_W      = 120;
const DEMAND_W   = 90;
const NEED_W     = 110;
const STATUS_W   = 116;
const ACTION_W   = 120;

const TABLE_MIN_W = WO_ID_W + ORDER_ID_W + PRODUCT_W + CUSTOMER_W + EST_W + DEMAND_W + NEED_W + STATUS_W + ACTION_W;

// ── Sub-components ─────────────────────────────────────────────────────────────

const LabelValue = ({ label, value }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1, minWidth: 0 }}>
    <span style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-secondary)" }}>{label}</span>
    <div style={{ fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>{value}</div>
  </div>
);

const UrgencyBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.on_track;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", padding: "3px 10px", borderRadius: "6px",
      background: cfg.bg, color: cfg.color,
      fontSize: "var(--text-body)", fontWeight: "var(--font-weight-semi-bold)", whiteSpace: "nowrap",
    }}>
      {cfg.label}
    </span>
  );
};

const cellBase = (width, extra = {}) => ({
  width: `${width}px`,
  flexShrink: 0,
  boxSizing: "border-box",
  display: "flex",
  alignItems: "center",
  padding: "0 12px",
  minHeight: "56px",
  fontSize: "var(--text-title-3)",
  color: "var(--neutral-on-surface-primary)",
  ...extra,
});

const thBase = (width, extra = {}) => ({
  ...cellBase(width, extra),
  fontSize: "var(--text-title-3)",
  fontWeight: "var(--font-weight-bold)",
  color: "var(--neutral-on-surface-primary)",
  minHeight: "49px",
  whiteSpace: "nowrap",
});

// ── Est. Start Date popover ────────────────────────────────────────────────────
const toISO = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const StartDatePopover = ({ dateFilterType, setDateFilterType, customDateRange, setCustomDateRange, onClose }) => {
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div ref={ref} style={{ position: "absolute", top: "calc(100% + 8px)", left: 0, width: "300px", background: "var(--neutral-surface-primary)", border: ROW_BORDER, borderRadius: "var(--radius-card)", boxShadow: "var(--elevation-sm)", padding: "16px", display: "flex", flexDirection: "column", gap: "16px", zIndex: 100000 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "var(--text-title-2)", fontWeight: "var(--font-weight-bold)" }}>Est. Start</span>
        <button onClick={() => { setDateFilterType("all"); setCustomDateRange({ start: "", end: "" }); onClose(); }} style={{ background: "none", border: "none", padding: 0, color: "var(--status-red-primary)", cursor: "pointer", fontSize: "var(--text-body)", fontWeight: "var(--font-weight-bold)" }}>Remove Filter</button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {[{ key: "all", label: "All" }, { key: "last7", label: "Last 7 days" }, { key: "last30", label: "Last 30 days" }, { key: "next7", label: "Next 7 days" }, { key: "next30", label: "Next 30 days" }, { key: "custom", label: "Custom date" }].map((opt) => (
          <label key={opt.key} style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", fontSize: "var(--text-title-3)" }}>
            <input type="radio" checked={dateFilterType === opt.key} onChange={() => setDateFilterType(opt.key)} />
            <span>{opt.label}</span>
          </label>
        ))}
        {dateFilterType === "custom" && <DateRangeInputControl value={customDateRange} onChange={(e) => setCustomDateRange(e.target.value)} fieldHeight="40px" fontSize="14px" />}
      </div>
    </div>
  );
};

// ── Main component ─────────────────────────────────────────────────────────────

const linkStyle = {
  color: "var(--feature-brand-primary)",
  cursor: "pointer",
  textDecoration: "underline",
  fontSize: "var(--text-title-3)",
};

export const MaterialBreakdownDrawer = ({ isOpen, onClose, materialData, onCreatePo, urgencyDaysInAdvance = 5, pageFilters = {} }) => {
  const [filterProduct, setFilterProduct] = useState([]);
  const [filterCustomer, setFilterCustomer] = useState([]);
  const [filterOrderId, setFilterOrderId] = useState([]);
  const [filterWoId, setFilterWoId] = useState([]);
  const [filterStatus, setFilterStatus] = useState([]);
  const [openFilterKey, setOpenFilterKey] = useState(null);
  const [popoverTriggerRect, setPopoverTriggerRect] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [dateFilterType, setDateFilterType] = useState("all");
  const [customDateRange, setCustomDateRange] = useState({ start: "", end: "" });
  const [showDatePopover, setShowDatePopover] = useState(false);
  const [sortCol, setSortCol] = useState(null); // null | "estStart" | "status"
  const [sortDir, setSortDir] = useState("asc");
  const scrollerRef = useRef(null);
  const [scrollShadows, setScrollShadows] = useState({ left: false, right: false });

  // 2-option Create PO state
  const [poMenuOpenRowId, setPoMenuOpenRowId] = useState(null);
  const [poMenuPos, setPoMenuPos] = useState({ top: null, bottom: null, right: 0 });
  const [isSelectExistingPoOpen, setIsSelectExistingPoOpen] = useState(false);
  const [selectPoRow, setSelectPoRow] = useState(null);
  const [selectedVendorName, setSelectedVendorName] = useState("");
  const [selectedExistingPoNumber, setSelectedExistingPoNumber] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      if (!scrollerRef.current) return;
      const { scrollLeft, scrollWidth, clientWidth } = scrollerRef.current;
      setScrollShadows({ left: scrollLeft > 0, right: scrollLeft < scrollWidth - clientWidth - 2 });
    };
    const scroller = scrollerRef.current;
    if (scroller) { scroller.addEventListener("scroll", handleScroll); handleScroll(); }
    return () => scroller?.removeEventListener("scroll", handleScroll);
  }, [isOpen, materialData]);

  // Sync page-level filters into drawer filter state when drawer opens
  useEffect(() => {
    if (isOpen) {
      setFilterCustomer(pageFilters.customers || []);
      setFilterOrderId(pageFilters.orderIds   || []);
      setFilterProduct(pageFilters.products   || []);
      setFilterWoId(pageFilters.woIds         || []);
      setCurrentPage(1);
    }
  }, [isOpen]);

  // Close PO menu on outside click
  useEffect(() => {
    if (!poMenuOpenRowId) return;
    const handler = (e) => { if (!e.target.closest("[data-po-menu]")) setPoMenuOpenRowId(null); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [poMenuOpenRowId]);

  const openPoMenu = (rowId, btnEl) => {
    const rect = btnEl.getBoundingClientRect();
    const menuHeight = 96;
    if (window.innerHeight - rect.bottom < menuHeight + 8) {
      setPoMenuPos({ bottom: window.innerHeight - rect.top + 4, top: null, right: window.innerWidth - rect.right });
    } else {
      setPoMenuPos({ top: rect.bottom + 4, bottom: null, right: window.innerWidth - rect.right });
    }
    setPoMenuOpenRowId(prev => prev === rowId ? null : rowId);
  };

  const allRows = useMemo(() => {
    if (!materialData) return [];
    const rows = [];
    materialData.timeline.forEach((weekData) => {
      weekData.workOrders.forEach((wo) => {
        const allocated = materialData.timeline.reduce((sum, wd) =>
          sum + wd.batches.reduce((bSum, batch) => {
            const c = batch.consumptions.find((x) => x.woId === wo.id);
            return bSum + (c ? c.qty : 0);
          }, 0)
        , 0);
        const demand = wo.qty;
        const needToBuy = Math.max(0, demand - allocated);
        const woStartDate = getAbsoluteStartDate(weekData.weekOffset, wo.estimatedStartDayOffset);
        const statusKey = getUrgencyStatus(woStartDate, needToBuy, urgencyDaysInAdvance);
        rows.push({
          woId: wo.id,
          orderId: wo.orderId || "—",
          productName: wo.productName,
          customerName: wo.customerName,
          sku: materialData.sku,
          estStart: fmtDate(woStartDate),
          demand,
          needToBuy,
          statusKey,
          isStarted: !!wo.isStarted,
        });
      });
    });
    rows.sort((a, b) => (STATUS_ORDER[a.statusKey] ?? 99) - (STATUS_ORDER[b.statusKey] ?? 99));
    return rows;
  }, [materialData, urgencyDaysInAdvance]);

  const productOptions = useMemo(() => [...new Set(allRows.map((r) => r.productName))].sort().map((v) => ({ value: v, label: v })), [allRows]);
  const customerOptions = useMemo(() => [...new Set(allRows.map((r) => r.customerName))].sort().map((v) => ({ value: v, label: v })), [allRows]);
  const orderIdOptions  = useMemo(() => [...new Set(allRows.map((r) => r.orderId).filter((id) => id && id !== "—"))].sort().map((v) => ({ value: v, label: v })), [allRows]);
  const woIdOptions     = useMemo(() => [...new Set(allRows.map((r) => r.woId))].sort().map((v) => ({ value: v, label: v })), [allRows]);

  const statusOptions = [
    { value: "delayed",  label: "Delayed" },
    { value: "urgent",   label: "Urgent" },
    { value: "on_track", label: "On Track" },
    { value: "covered",  label: "Covered" },
  ];

  const filteredRows = useMemo(() => {
    const now = new Date(); now.setHours(0, 0, 0, 0);
    return allRows.filter((r) => {
      if (filterProduct.length > 0 && !filterProduct.includes(r.productName)) return false;
      if (filterCustomer.length > 0 && !filterCustomer.includes(r.customerName)) return false;
      if (filterOrderId.length > 0 && !filterOrderId.includes(r.orderId)) return false;
      if (filterWoId.length > 0 && !filterWoId.includes(r.woId)) return false;
      if (filterStatus.length > 0 && !filterStatus.includes(r.statusKey)) return false;
      if (dateFilterType !== "all") {
        const d = new Date(r.estStart); d.setHours(0, 0, 0, 0);
        if (isNaN(d.getTime())) return false;
        const iso = toISO(d);
        if (dateFilterType === "last7") { const c = new Date(now); c.setDate(now.getDate() - 7); if (d < c || d > now) return false; }
        else if (dateFilterType === "last30") { const c = new Date(now); c.setDate(now.getDate() - 30); if (d < c || d > now) return false; }
        else if (dateFilterType === "next7") { const c = new Date(now); c.setDate(now.getDate() + 7); if (d < now || d > c) return false; }
        else if (dateFilterType === "next30") { const c = new Date(now); c.setDate(now.getDate() + 30); if (d < now || d > c) return false; }
        else if (dateFilterType === "custom" && customDateRange.start && customDateRange.end) {
          if (iso < customDateRange.start || iso > customDateRange.end) return false;
        }
      }
      return true;
    });
  }, [allRows, filterProduct, filterCustomer, filterOrderId, filterWoId, filterStatus, dateFilterType, customDateRange]);

  const toggleSort = (col) => {
    if (sortCol === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortCol(col); setSortDir("asc"); }
  };

  const sortedRows = useMemo(() => {
    if (!sortCol) return filteredRows;
    return [...filteredRows].sort((a, b) => {
      let cmp = 0;
      if (sortCol === "estStart") cmp = a.estStart.localeCompare(b.estStart);
      else if (sortCol === "status") cmp = (STATUS_ORDER[a.statusKey] ?? 99) - (STATUS_ORDER[b.statusKey] ?? 99);
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filteredRows, sortCol, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / rowsPerPage));
  const pagedRows  = sortedRows.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const handleClose = () => {
    setFilterProduct([]); setFilterCustomer([]); setFilterOrderId([]); setFilterWoId([]); setFilterStatus([]);
    setOpenFilterKey(null); setCurrentPage(1);
    setDateFilterType("all"); setCustomDateRange({ start: "", end: "" }); setShowDatePopover(false);
    setPoMenuOpenRowId(null); setIsSelectExistingPoOpen(false); setSelectPoRow(null);
    setSortCol(null); setSortDir("asc");
    onClose();
  };

  // PO vendor options — vendors that have at least one draft/need_revision PO
  const vendorOptions = useMemo(() => {
    const names = new Set(
      MOCK_PO_TABLE_DATA.filter(po => ["draft", "need_revision"].includes(po.statusKey)).map(po => po.vendorName)
    );
    return [...names].sort().map(v => ({ value: v, label: v }));
  }, []);

  const existingPoOptions = useMemo(() => {
    if (!selectedVendorName) return [];
    return MOCK_PO_TABLE_DATA.filter(po =>
      po.vendorName === selectedVendorName && ["draft", "need_revision"].includes(po.statusKey)
    ).map(po => ({ value: po.poNumber, label: `${po.poNumber} (${po.status})` }));
  }, [selectedVendorName]);

  const selectedPoDetail = useMemo(() => {
    if (!selectedExistingPoNumber) return null;
    return MOCK_PO_TABLE_DATA.find(po => po.poNumber === selectedExistingPoNumber) || null;
  }, [selectedExistingPoNumber]);

  const handleOpenSelectExistingPo = (row) => {
    setSelectPoRow(row);
    setSelectedVendorName("");
    setSelectedExistingPoNumber("");
    setPoMenuOpenRowId(null);
    setIsSelectExistingPoOpen(true);
  };

  const handleAttachExistingPo = () => {
    setIsSelectExistingPoOpen(false);
    setSelectPoRow(null);
    setSelectedVendorName("");
    setSelectedExistingPoNumber("");
  };

  if (!materialData) return null;

  const leftShadow  = scrollShadows.left  ? "4px 0 8px -4px rgba(0,0,0,0.12)"  : "none";
  const rightShadow = scrollShadows.right ? "-4px 0 8px -4px rgba(0,0,0,0.12)" : "none";

  return (
    <>
      {/* Backdrop */}
      <div
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.28)", zIndex: 20000, opacity: isOpen ? 1 : 0, transition: "opacity 0.2s ease-in-out", pointerEvents: isOpen ? "auto" : "none" }}
        onClick={handleClose}
      />

      {/* Drawer panel */}
      <div
        style={{ position: "fixed", top: 0, right: 0, width: "900px", height: "100%", background: "var(--neutral-surface-primary)", display: "flex", flexDirection: "column", zIndex: 20001, transform: (isOpen && !isSelectExistingPoOpen) ? "translateX(0)" : "translateX(100%)", transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)", boxShadow: "-4px 0 16px rgba(0,0,0,0.12)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: "24px", borderBottom: ROW_BORDER, display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <span style={{ fontSize: "var(--text-title-1)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>
            Material Breakdown
          </span>
          <IconButton icon={CloseIcon} onClick={handleClose} size="small" color="var(--neutral-on-surface-primary)" />
        </div>

        {/* Info section */}
        <div style={{ padding: "16px 24px", flexShrink: 0 }}>
          <div style={{ padding: "16px", borderRadius: "var(--radius-card)", border: ROW_BORDER, display: "flex", gap: "24px" }}>
            <LabelValue label="Material Name" value={materialData.materialName} />
            <div style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-secondary)" }}>Material SKU</span>
              <span onClick={() => window.open(`/materials/${materialData.sku}`, "_blank")} style={{ fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--feature-brand-primary)", textDecoration: "underline", cursor: "pointer" }}>
                {materialData.sku}
              </span>
            </div>
            <LabelValue label="On-Hand Stock" value={materialData.onHandStock.toLocaleString()} />
            <LabelValue label="Incoming PO" value={(materialData.incomingPoStock || 0).toLocaleString()} />
          </div>
        </div>

        {/* Filter bar */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "0 24px 12px", flexShrink: 0, borderBottom: ROW_BORDER }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {[
              { key: "woId",     label: "WO ID",         value: filterWoId,    options: woIdOptions,    onChange: setFilterWoId    },
              { key: "orderId",  label: "Order ID",      value: filterOrderId, options: orderIdOptions, onChange: setFilterOrderId },
              { key: "product",  label: "Product",       value: filterProduct, options: productOptions, onChange: setFilterProduct },
              { key: "customer", label: "Customer",      value: filterCustomer,options: customerOptions,onChange: setFilterCustomer },
            ].map(({ key, label, value, options, onChange }) => (
              <div key={key} onClick={(e) => { const rect = e.currentTarget.getBoundingClientRect(); setPopoverTriggerRect(rect); setOpenFilterKey((prev) => prev === key ? null : key); }}>
                <FilterPill label={label} active={value.length > 0} isOpen={openFilterKey === key} count={value.length} />
              </div>
            ))}

            {openFilterKey === "woId"     && <FilterPopoverCheckbox title="WO ID" options={woIdOptions}     value={filterWoId}     onChange={(v) => { setFilterWoId(v);     setCurrentPage(1); }} onClose={() => setOpenFilterKey(null)} triggerRect={popoverTriggerRect} />}
            {openFilterKey === "orderId"  && <FilterPopoverCheckbox title="Order ID"      options={orderIdOptions}  value={filterOrderId}  onChange={(v) => { setFilterOrderId(v);  setCurrentPage(1); }} onClose={() => setOpenFilterKey(null)} triggerRect={popoverTriggerRect} />}
            {openFilterKey === "product"  && <FilterPopoverCheckbox title="Product"       options={productOptions}  value={filterProduct}  onChange={(v) => { setFilterProduct(v);  setCurrentPage(1); }} onClose={() => setOpenFilterKey(null)} triggerRect={popoverTriggerRect} />}
            {openFilterKey === "customer" && <FilterPopoverCheckbox title="Customer"      options={customerOptions} value={filterCustomer} onChange={(v) => { setFilterCustomer(v); setCurrentPage(1); }} onClose={() => setOpenFilterKey(null)} triggerRect={popoverTriggerRect} />}
            {openFilterKey === "status"   && <FilterPopoverCheckbox title="Status"        options={statusOptions}   value={filterStatus}   onChange={(v) => { setFilterStatus(v);   setCurrentPage(1); }} onClose={() => setOpenFilterKey(null)} triggerRect={popoverTriggerRect} searchable={false} />}

            {/* Est. Start */}
            <div style={{ position: "relative" }}>
              <div onClick={() => setShowDatePopover((p) => !p)}>
                <FilterPill label="Est. Start" active={dateFilterType !== "all"} isOpen={showDatePopover} count={dateFilterType !== "all" ? 1 : 0} />
              </div>
              {showDatePopover && (
                <StartDatePopover
                  dateFilterType={dateFilterType}
                  setDateFilterType={(v) => { setDateFilterType(v); setCurrentPage(1); }}
                  customDateRange={customDateRange}
                  setCustomDateRange={setCustomDateRange}
                  onClose={() => setShowDatePopover(false)}
                />
              )}
            </div>

            {/* Status filter */}
            <div onClick={(e) => { const rect = e.currentTarget.getBoundingClientRect(); setPopoverTriggerRect(rect); setOpenFilterKey((prev) => prev === "status" ? null : "status"); }}>
              <FilterPill label="Status" active={filterStatus.length > 0} isOpen={openFilterKey === "status"} count={filterStatus.length} />
            </div>
          </div>
        </div>

        {/* Table */}
        <div ref={scrollerRef} style={{ flex: 1, minHeight: 0, overflowX: "auto", overflowY: "auto" }}>
          <div style={{ minWidth: `${TABLE_MIN_W}px`, display: "inline-flex", flexDirection: "column", width: "100%" }}>

            {/* Header */}
            <div style={{ display: "flex", borderBottom: ROW_BORDER, position: "sticky", top: 0, zIndex: 3, background: "var(--neutral-surface-primary)" }}>
              <div style={{ ...thBase(WO_ID_W, { paddingLeft: "24px" }), position: "sticky", left: 0, zIndex: 4, background: "var(--neutral-surface-primary)", boxShadow: leftShadow, transition: "box-shadow 0.2s ease" }}>WO ID</div>
              <div style={thBase(ORDER_ID_W)}>Order ID</div>
              <div style={thBase(PRODUCT_W)}>Product</div>
              <div style={thBase(CUSTOMER_W)}>Customer</div>
              <div onClick={() => toggleSort("estStart")} style={{ ...thBase(EST_W), cursor: "pointer", userSelect: "none", gap: "6px" }}>
                Est. Start
                <ChevronDownIcon
                  size={14}
                  color={sortCol === "estStart" ? "var(--feature-brand-primary)" : "var(--neutral-on-surface-tertiary)"}
                  style={{ transform: sortCol === "estStart" && sortDir === "asc" ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
                />
              </div>
              <div style={thBase(DEMAND_W)}>Demand</div>
              <div style={thBase(NEED_W)}>Need to Buy</div>
              <div onClick={() => toggleSort("status")} style={{ ...thBase(STATUS_W), cursor: "pointer", userSelect: "none", gap: "6px", position: "sticky", right: ACTION_W, zIndex: 4, background: "var(--neutral-surface-primary)", boxShadow: rightShadow, transition: "box-shadow 0.2s ease" }}>
                Status
                <ChevronDownIcon
                  size={14}
                  color={sortCol === "status" ? "var(--feature-brand-primary)" : "var(--neutral-on-surface-tertiary)"}
                  style={{ transform: sortCol === "status" && sortDir === "asc" ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
                />
              </div>
              <div style={{ ...thBase(ACTION_W, { paddingRight: "24px", justifyContent: "center" }), position: "sticky", right: 0, zIndex: 4, background: "var(--neutral-surface-primary)" }}>Action</div>
            </div>

            {/* Body */}
            {pagedRows.length === 0 && filteredRows.length === 0 ? (
              <div style={{ padding: "48px 0", textAlign: "center", color: "var(--neutral-on-surface-tertiary)", fontSize: "var(--text-title-3)" }}>
                No work orders match the current filters.
              </div>
            ) : pagedRows.map((row, idx) => (
              <div key={`${row.woId}-${idx}`} style={{ display: "flex", borderBottom: ROW_BORDER, background: "var(--neutral-surface-primary)" }}>
                {/* WO ID — sticky left */}
                <div style={{ ...cellBase(WO_ID_W, { paddingLeft: "24px" }), position: "sticky", left: 0, zIndex: 2, background: "inherit", boxShadow: leftShadow, transition: "box-shadow 0.2s ease", alignSelf: "stretch" }}>
                  <span style={linkStyle} onClick={() => window.open(`/work-order/${row.woId}`, "_blank")}>{row.woId}</span>
                </div>

                <div style={cellBase(ORDER_ID_W)}>
                  <span style={linkStyle} onClick={() => window.open(`/sales-order/${row.orderId}`, "_blank")}>{row.orderId}</span>
                </div>

                <div style={{ ...cellBase(PRODUCT_W), flexDirection: "column", alignItems: "flex-start", gap: "2px", paddingTop: "10px", paddingBottom: "10px" }}>
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", width: "100%", fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-primary)" }}>{row.productName}</span>
                  <span style={{ ...linkStyle, fontSize: "var(--text-body)" }} onClick={() => window.open(`/materials/${row.sku}`, "_blank")}>{row.sku}</span>
                </div>

                <div style={{ ...cellBase(CUSTOMER_W), flexDirection: "column", alignItems: "flex-start", gap: "2px", paddingTop: "10px", paddingBottom: "10px" }}>
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", width: "100%", fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-primary)" }}>{row.customerName}</span>
                  {MOCK_CUSTOMER_PIC_MAP[row.customerName] && (
                    <span style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", width: "100%" }}>
                      {MOCK_CUSTOMER_PIC_MAP[row.customerName]}
                    </span>
                  )}
                </div>

                {/* Est. Start */}
                <div style={{ ...cellBase(EST_W), alignItems: "flex-start", paddingTop: "10px", paddingBottom: "10px", flexDirection: "column" }}>
                  <span style={{ fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-primary)" }}>{row.estStart}</span>
                  {row.isStarted && <span style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-secondary)" }}>Started</span>}
                </div>

                <div style={{ ...cellBase(DEMAND_W, { fontWeight: "var(--font-weight-semi-bold)" }), alignItems: "flex-start", paddingTop: "10px", paddingBottom: "10px" }}>
                  {row.demand.toLocaleString()} pcs
                </div>

                <div style={{ ...cellBase(NEED_W, { fontWeight: "var(--font-weight-bold)", color: row.needToBuy > 0 ? "var(--status-red-primary)" : "var(--neutral-on-surface-secondary)" }), alignItems: "flex-start", paddingTop: "10px", paddingBottom: "10px" }}>
                  {`${row.needToBuy.toLocaleString()} pcs`}
                </div>

                {/* Status — sticky right (behind Action) */}
                <div style={{ ...cellBase(STATUS_W), position: "sticky", right: ACTION_W, zIndex: 2, background: "inherit", boxShadow: rightShadow, transition: "box-shadow 0.2s ease", alignSelf: "stretch" }}>
                  <UrgencyBadge status={row.statusKey} />
                </div>

                {/* Action — sticky rightmost with 2-option dropdown */}
                <div style={{ ...cellBase(ACTION_W, { paddingRight: "24px", justifyContent: "center" }), position: "sticky", right: 0, zIndex: 2, background: "inherit", alignSelf: "stretch" }}>
                  {row.needToBuy > 0 ? (
                    <div data-po-menu>
                      <Button
                        variant="secondary"
                        size="small"
                        rightIcon={ChevronDownIcon}
                        onClick={(e) => openPoMenu(row.woId, e.currentTarget)}
                      >
                        Create PO
                      </Button>
                    </div>
                  ) : (
                    <Button variant="secondary" size="small" disabled>Create PO</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ borderTop: ROW_BORDER, flexShrink: 0 }}>
          <TablePaginationFooter
            totalRows={filteredRows.length}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(n) => { setRowsPerPage(n); setCurrentPage(1); }}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>

        {/* Row-level PO menu — rendered outside scroll container to avoid overflow clipping */}
        {poMenuOpenRowId && (() => {
          const menuRow = pagedRows.find(r => r.woId === poMenuOpenRowId);
          if (!menuRow) return null;
          return (
            <>
              <div style={{ position: "fixed", inset: 0, zIndex: 29999 }} onClick={() => setPoMenuOpenRowId(null)} />
              <div data-po-menu style={{ position: "fixed", top: poMenuPos.top ?? "auto", bottom: poMenuPos.bottom ?? "auto", right: poMenuPos.right, width: "180px", background: "var(--neutral-surface-primary)", border: ROW_BORDER, borderRadius: "var(--radius-card)", boxShadow: "var(--elevation-sm)", overflow: "hidden", zIndex: 30000 }}>
                <div onClick={(e) => { e.stopPropagation(); setPoMenuOpenRowId(null); onCreatePo({ materialName: materialData.materialName, sku: materialData.sku, needToBuy: menuRow.needToBuy, urgencyStatus: menuRow.statusKey }); }} onMouseEnter={(e) => (e.currentTarget.style.background = "var(--neutral-surface-grey-lighter)")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")} style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-primary)" }}>
                  <AddIcon size={16} /> Create New PO
                </div>
                <div onClick={(e) => { e.stopPropagation(); handleOpenSelectExistingPo(menuRow); }} onMouseEnter={(e) => (e.currentTarget.style.background = "var(--neutral-surface-grey-lighter)")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")} style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-primary)", borderTop: ROW_BORDER }}>
                  <DocumentIcon size={16} /> Select Existing PO
                </div>
              </div>
            </>
          );
        })()}
      </div>

      {/* Select Existing PO Drawer — fixed position, replaces current drawer */}
      {isSelectExistingPoOpen && (
        <>
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.28)", zIndex: 22000 }} onClick={() => { setIsSelectExistingPoOpen(false); setSelectPoRow(null); setSelectedVendorName(""); setSelectedExistingPoNumber(""); }} />
          <div style={{ position: "fixed", top: 0, right: 0, height: "100%", width: selectedExistingPoNumber ? "900px" : "450px", background: "var(--neutral-surface-primary)", display: "flex", flexDirection: "row", zIndex: 22001, boxShadow: "-4px 0 16px rgba(0,0,0,0.12)", transition: "width 0.3s ease" }}>
            <div style={{ flex: selectedExistingPoNumber ? "0 0 450px" : "1", display: "flex", flexDirection: "column", borderRight: selectedExistingPoNumber ? ROW_BORDER : "none", background: "var(--neutral-surface-primary)", minWidth: 0, overflow: "hidden" }}>
              {/* Header */}
              <div style={{ padding: "20px 24px", minHeight: "73px", borderBottom: ROW_BORDER, display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
                <IconButton icon={ChevronLeft} onClick={() => { setIsSelectExistingPoOpen(false); setSelectPoRow(null); setSelectedVendorName(""); setSelectedExistingPoNumber(""); }} size="small" color="var(--neutral-on-surface-primary)" />
                <span style={{ fontSize: "var(--text-title-1)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>Select Existing Purchase Order</span>
              </div>
              
              <div style={{ flex: "1", padding: "24px 32px", display: "flex", flexDirection: "column", gap: "24px", overflowY: "auto" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <label style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-primary)" }}>
                      <span style={{ color: "var(--status-red-primary)" }}>*</span> Vendor
                    </label>
                    <DropdownSelect
                      value={selectedVendorName}
                      onChange={(v) => { setSelectedVendorName(v); setSelectedExistingPoNumber(""); }}
                      placeholder="Select vendor"
                      options={vendorOptions}
                      menuStyle={{ zIndex: 30000 }}
                    />
                  </div>
                  {selectedVendorName && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <label style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-primary)" }}>
                        <span style={{ color: "var(--status-red-primary)" }}>*</span> Purchase Order
                      </label>
                      <DropdownSelect
                        value={selectedExistingPoNumber}
                        onChange={setSelectedExistingPoNumber}
                        placeholder="Select purchase order"
                        options={existingPoOptions}
                        menuStyle={{ zIndex: 30000 }}
                      />
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", gap: "12px", marginTop: "auto", paddingTop: "12px" }}>
                  <Button variant="outlined" size="large" style={{ flex: 1 }} onClick={() => { setIsSelectExistingPoOpen(false); setSelectPoRow(null); setSelectedVendorName(""); setSelectedExistingPoNumber(""); }}>
                    Cancel
                  </Button>
                  <Button variant="filled" size="large" style={{ flex: 1 }} disabled={!selectedExistingPoNumber} onClick={handleAttachExistingPo}>
                    Assign PO
                  </Button>
                </div>
              </div>
            </div>

            {/* PO Preview panel */}
            {selectedExistingPoNumber && selectedPoDetail && (
              <div style={{ flex: "1", background: "var(--neutral-surface-grey-lighter)", borderLeft: ROW_BORDER, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
                <div style={{ padding: "20px 32px", minHeight: "73px", borderBottom: ROW_BORDER, background: "var(--neutral-surface-primary)", display: "flex", alignItems: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: "var(--text-title-2)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>Purchase Order Preview</span>
                </div>
                <div style={{ padding: "24px 32px", display: "flex", flexDirection: "column", gap: "20px", overflowY: "auto", flex: 1 }}>
                  {/* PO header */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontSize: "var(--text-title-2)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>{selectedPoDetail.poNumber}</div>
                      <div style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-tertiary)", marginTop: "4px" }}>{selectedPoDetail.vendorName}</div>
                    </div>
                    <StatusBadge variant={selectedPoDetail.sBadge}>{selectedPoDetail.status}</StatusBadge>
                  </div>
                  {/* PO Information */}
                  <div style={{ background: "var(--neutral-surface-primary)", border: ROW_BORDER, borderRadius: "12px", padding: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>
                    <span style={{ fontSize: "var(--text-body)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>Purchase Order Information</span>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "16px" }}>
                      {[
                        ["PO Date", selectedPoDetail.createdDate || "-"],
                        ["Expected Delivery Date", selectedPoDetail.expectedDeliveryDate || "-"],
                        ["Currency", "IDR"],
                        ["Created By", selectedPoDetail.createdBy || "Joko"],
                      ].map(([label, val]) => (
                        <div key={label} style={{ display: "flex", flexDirection: "column", gap: "4px", minWidth: 0 }}>
                          <span style={{ fontSize: "var(--text-desc)", color: "var(--neutral-on-surface-tertiary)" }}>{label}</span>
                          <span style={{ fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)", wordBreak: "break-word", whiteSpace: "pre-line", overflowWrap: "anywhere" }}>{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Vendor Information */}
                  {(() => {
                    const vi = MOCK_VENDOR_INFO[selectedPoDetail.vendorName];
                    if (!vi) return null;
                    return (
                      <div style={{ background: "var(--neutral-surface-primary)", border: ROW_BORDER, borderRadius: "12px", padding: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>
                        <span style={{ fontSize: "var(--text-body)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>Vendor Information</span>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "16px" }}>
                          {[["Vendor Name", selectedPoDetail.vendorName], ["Phone Number", vi.phone], ["Email address", vi.email], ["Address", vi.address]].map(([label, val]) => (
                            <div key={label} style={{ display: "flex", flexDirection: "column", gap: "4px", minWidth: 0 }}>
                              <span style={{ fontSize: "var(--text-desc)", color: "var(--neutral-on-surface-tertiary)" }}>{label}</span>
                              <span style={{ fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)", wordBreak: "break-word", whiteSpace: "pre-line", overflowWrap: "anywhere" }}>{val}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                  {/* Ship To */}
                  <div style={{ background: "var(--neutral-surface-primary)", border: ROW_BORDER, borderRadius: "12px", padding: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>
                    <span style={{ fontSize: "var(--text-body)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>Ship To</span>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "16px" }}>
                      {[["Recipient Name", SHIP_TO_DEFAULT.name], ["Phone Number", SHIP_TO_DEFAULT.phone], ["Email", SHIP_TO_DEFAULT.email], ["Address", SHIP_TO_DEFAULT.address]].map(([label, val]) => (
                        <div key={label} style={{ display: "flex", flexDirection: "column", gap: "4px", minWidth: 0 }}>
                          <span style={{ fontSize: "var(--text-desc)", color: "var(--neutral-on-surface-tertiary)" }}>{label}</span>
                          <span style={{ fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)", wordBreak: "break-word", whiteSpace: "pre-line", overflowWrap: "anywhere" }}>{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Purchase Order Lines */}
                  {selectedPoDetail.lines?.length > 0 && (() => {
                    const fmt = (n) => `IDR ${Number(n).toLocaleString("id-ID")}`;
                    const subtotal = selectedPoDetail.subtotal || selectedPoDetail.lines.reduce((s, l) => s + (l.qty || 0) * (l.price || 0), 0);
                    const taxRate = selectedPoDetail.taxRate ?? 11;
                    const taxAmount = Math.round(subtotal * taxRate / 100);
                    const feeAmount = selectedPoDetail.feeAmount || 0;
                    const total = subtotal + taxAmount + feeAmount;
                    return (
                      <>
                        <div style={{ background: "var(--neutral-surface-primary)", border: ROW_BORDER, borderRadius: "12px", padding: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>
                          <span style={{ fontSize: "var(--text-body)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>Purchase Order Lines</span>
                          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            {selectedPoDetail.lines.map((line, i) => {
                              const lineSubtotal = (line.qty || 0) * (line.price || 0);
                              return (
                                <div key={i} style={{ border: ROW_BORDER, borderRadius: "12px", padding: "14px", display: "flex", flexDirection: "column", gap: "14px" }}>
                                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "4px", minWidth: 0 }}>
                                      <span style={{ fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)", wordBreak: "break-word" }}>{line.item || "-"}</span>
                                      <span style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-tertiary)" }}>{line.code}</span>
                                    </div>
                                  </div>
                                  {line.desc && (
                                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                      <span style={{ fontSize: "var(--text-desc)", color: "var(--neutral-on-surface-tertiary)" }}>Description</span>
                                      <span style={{ fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)", wordBreak: "break-word", whiteSpace: "pre-line" }}>{line.desc}</span>
                                    </div>
                                  )}
                                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                                    {line.woRef && line.woRef !== "-" && <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}><span style={{ fontSize: "var(--text-desc)", color: "var(--neutral-on-surface-tertiary)" }}>WO Ref</span><span style={{ fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>{line.woRef}</span></div>}
                                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}><span style={{ fontSize: "var(--text-desc)", color: "var(--neutral-on-surface-tertiary)" }}>Quantity</span><span style={{ fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>{line.qty} pcs</span></div>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}><span style={{ fontSize: "var(--text-desc)", color: "var(--neutral-on-surface-tertiary)" }}>Unit Price</span><span style={{ fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>{fmt(line.price)}</span></div>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}><span style={{ fontSize: "var(--text-desc)", color: "var(--neutral-on-surface-tertiary)" }}>Subtotal</span><span style={{ fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>{fmt(lineSubtotal)}</span></div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                        {/* Summary */}
                        <div style={{ background: "var(--neutral-surface-primary)", border: ROW_BORDER, borderRadius: "12px", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                          <span style={{ fontSize: "var(--text-body)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>Summary</span>
                          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            {[["Subtotal", fmt(subtotal)], [`Tax (${taxRate}%)`, fmt(taxAmount)], ["Fees", fmt(feeAmount)]].map(([label, val]) => (
                              <div key={label} style={{ display: "flex", justifyContent: "space-between" }}>
                                <span style={{ fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-tertiary)" }}>{label}</span>
                                <span style={{ fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>{val}</span>
                              </div>
                            ))}
                            <div style={{ display: "flex", justifyContent: "space-between", borderTop: ROW_BORDER, paddingTop: "8px", marginTop: "4px" }}>
                              <span style={{ fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>Total</span>
                              <span style={{ fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>{fmt(total)}</span>
                            </div>
                          </div>
                        </div>
                        {/* Notes & Terms */}
                        {(selectedPoDetail.notes || selectedPoDetail.paymentTerms) && (
                          <div style={{ background: "var(--neutral-surface-primary)", border: ROW_BORDER, borderRadius: "12px", padding: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>
                            <span style={{ fontSize: "var(--text-body)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>Notes & Terms</span>
                            {selectedPoDetail.notes && (
                              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                <span style={{ fontSize: "var(--text-desc)", color: "var(--neutral-on-surface-tertiary)" }}>Notes</span>
                                <span style={{ fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)", wordBreak: "break-word", whiteSpace: "pre-line" }}>{selectedPoDetail.notes}</span>
                              </div>
                            )}
                            {selectedPoDetail.paymentTerms && (
                              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                <span style={{ fontSize: "var(--text-desc)", color: "var(--neutral-on-surface-tertiary)" }}>Terms</span>
                                <span style={{ fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)", wordBreak: "break-word", whiteSpace: "pre-line" }}>{selectedPoDetail.paymentTerms}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
};
