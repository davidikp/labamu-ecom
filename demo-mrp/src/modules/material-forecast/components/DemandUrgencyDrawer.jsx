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
import {
  MOCK_DEMAND_URGENCY_ROWS,
  MOCK_UNSCHEDULED_WO_ROWS,
  MOCK_CUSTOMER_PIC_MAP,
  MOCK_PRODUCT_SKU_MAP,
} from "../mock/materialForecastMocks.js";
import { MOCK_PO_TABLE_DATA } from "../../purchase-order/mock/purchaseOrderMocks.js";
import { formatNumberWithCommas } from "../../../utils/format/formatUtils.js";

const ROW_BORDER = "1px solid var(--neutral-line-separator-1)";

const MOCK_VENDOR_INFO = {
  "PT Mitra Sejahtera":  { phone: "08123456789", email: "contact@mitra.com",        address: "Jl. Sudirman No.1, Jakarta Pusat, 10220" },
  "CV Kayu Makmur":      { phone: "02198765432", email: "info@kayumakmur.co.id",    address: "Jl. Industri No.5, Bekasi, 17530" },
  "Bintang Sejahtera":   { phone: "02155512345", email: "order@bintangsejahtera.id", address: "Jl. Raya Bogor Km.12, Depok, 16436" },
  "PT Cahaya Abadi":     { phone: "02177889900", email: "procurement@cahayaabadi.com", address: "Jl. Gatot Subroto No.88, Jakarta Selatan, 12930" },
};
const SHIP_TO_DEFAULT = { name: "Labamu Manufacturing", phone: "+62 21 555 1234", email: "procurement@labamu.com", address: "Jl. Industri Utama Kav.9, South Tangerang, Banten" };

// ── filterMode config ──────────────────────────────────────────────────────────
const MODE_CONFIG = {
  urgentToBuy: {
    title: "Urgent to Buy",
    banner: {
      bg: "var(--status-red-container)",
      iconColor: "var(--status-red-primary)",
      title: "Urgent — Order Soon",
      body: "These materials need to be purchased now. Their work orders start within the urgency threshold you configured.",
    },
  },
  delayedWo: {
    title: "Delayed Work Orders",
    banner: {
      bg: "var(--neutral-surface-grey-lighter, #F5F5F5)",
      iconColor: "var(--neutral-on-surface-secondary)",
      title: "Delayed — Work Orders Behind Schedule",
      body: "These work orders have passed their estimated start date and have not been started. Review and take action to minimize production impact.",
    },
  },
  unscheduledWo: {
    title: "Unscheduled Work Orders",
    banner: null,
  },
};

// ── Column widths ──────────────────────────────────────────────────────────────
const CHECKBOX_W  = 44;
const WO_ID_W     = 120;
const ORDER_ID_W  = 100;
const EST_W       = 100;
const DEMAND_W    = 80;
const NEED_W      = 100;
const ACTION_W    = 130;

// Minimum widths for flex-fill columns
const MATERIAL_MIN_W = 140;
const PRODUCT_MIN_W  = 140;
const CUSTOMER_MIN_W = 130;

const TABLE_MIN_W_FULL = CHECKBOX_W + WO_ID_W + ORDER_ID_W + MATERIAL_MIN_W + PRODUCT_MIN_W + CUSTOMER_MIN_W + EST_W + DEMAND_W + NEED_W + ACTION_W;
const TABLE_MIN_W_UNSCHEDULED = CHECKBOX_W + WO_ID_W + ORDER_ID_W + MATERIAL_MIN_W + PRODUCT_MIN_W + CUSTOMER_MIN_W + DEMAND_W;

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
  fontWeight: "var(--font-weight-bold)",
  minHeight: "49px",
  whiteSpace: "nowrap",
});

const linkStyle = {
  color: "var(--feature-brand-primary)",
  cursor: "pointer",
  textDecoration: "underline",
  fontSize: "var(--text-title-3)",
};

// ── Date helpers ───────────────────────────────────────────────────────────────
const parseShortDate = (str) => {
  if (!str) return null;
  const d = new Date(`${str} ${new Date().getFullYear()}`);
  return isNaN(d.getTime()) ? null : d;
};
const toISO = (d) => {
  if (!d) return "";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const fmtWoStartDate = (str) => {
  if (!str) return str;
  const d = parseShortDate(str);
  return d ? toISO(d) : str;
};

// ── Est. Start popover ────────────────────────────────────────────────────
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
export const DemandUrgencyDrawer = ({ isOpen, onClose, filterMode, urgencyDaysInAdvance = 5, onCreatePo }) => {
  const [woIdFilter, setWoIdFilter] = useState([]);
  const [orderIdFilter, setOrderIdFilter] = useState([]);
  const [materialFilter, setMaterialFilter] = useState([]);
  const [productFilter, setProductFilter] = useState([]);
  const [customerFilter, setCustomerFilter] = useState([]);
  const [dateFilterType, setDateFilterType] = useState("all");
  const [customDateRange, setCustomDateRange] = useState({ start: "", end: "" });
  const [showDatePopover, setShowDatePopover] = useState(false);
  const [sortDir, setSortDir] = useState(null); // null | "asc" | "desc" for estStart
  const [openFilterKey, setOpenFilterKey] = useState(null);
  const [popoverTriggerRect, setPopoverTriggerRect] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedIds, setSelectedIds] = useState([]);

  // 2-option PO state
  const [poMenuOpenRowId, setPoMenuOpenRowId] = useState(null);
  const [poMenuPos, setPoMenuPos] = useState({ top: null, bottom: null, right: 0 });
  const [isSelectExistingPoOpen, setIsSelectExistingPoOpen] = useState(false);
  const [selectPoRow, setSelectPoRow] = useState(null);
  const [selectedVendorName, setSelectedVendorName] = useState("");
  const [selectedExistingPoNumber, setSelectedExistingPoNumber] = useState("");

  const scrollerRef = useRef(null);
  const [scrollShadows, setScrollShadows] = useState({ left: false, right: false });

  useEffect(() => {
    const handleScroll = () => {
      if (!scrollerRef.current) return;
      const { scrollLeft, scrollWidth, clientWidth } = scrollerRef.current;
      setScrollShadows({ left: scrollLeft > 0, right: scrollLeft < scrollWidth - clientWidth - 2 });
    };
    const scroller = scrollerRef.current;
    if (scroller) { scroller.addEventListener("scroll", handleScroll); handleScroll(); }
    return () => scroller?.removeEventListener("scroll", handleScroll);
  }, [isOpen, filterMode]);

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

  const isUnscheduled = filterMode === "unscheduledWo";

  const cfg = MODE_CONFIG[filterMode] || MODE_CONFIG.urgentToBuy;

  // ── Source rows based on filterMode ──────────────────────────────────────────
  const sourceRows = useMemo(() => {
    if (isUnscheduled) {
      return MOCK_UNSCHEDULED_WO_ROWS.map(r => ({
        id: `unsch-${r.woId}-${r.sku}`,
        woId: r.woId,
        orderId: r.orderId,
        materialName: r.materialName,
        sku: r.sku,
        productName: r.productName,
        customer: r.customer,
        woStartDate: null,
        demandQty: r.qty,
        needToBuy: null,
      }));
    }

    const today = new Date(); today.setHours(0, 0, 0, 0);

    if (filterMode === "delayedWo") {
      return MOCK_DEMAND_URGENCY_ROWS.filter(r => r.isDelayed);
    }

    // urgentToBuy: needToBuy > 0 AND start date within urgencyDaysInAdvance
    return MOCK_DEMAND_URGENCY_ROWS.filter(r => {
      if (r.needToBuy <= 0 || r.isDelayed) return false;
      const d = parseShortDate(r.woStartDate);
      if (!d) return false;
      d.setHours(0, 0, 0, 0);
      return (d - today) / 86400000 <= urgencyDaysInAdvance;
    });
  }, [filterMode, urgencyDaysInAdvance, isUnscheduled]);

  const woIdOptions     = useMemo(() => [...new Set(sourceRows.map((r) => r.woId).filter(Boolean))].sort().map((v) => ({ value: v, label: v })), [sourceRows]);
  const orderIdOptions  = useMemo(() => [...new Set(sourceRows.map((r) => r.orderId).filter(Boolean))].sort().map((v) => ({ value: v, label: v })), [sourceRows]);
  const materialOptions = useMemo(() => {
    const seen = new Map();
    sourceRows.forEach((r) => { if (!seen.has(r.materialName)) seen.set(r.materialName, r.sku); });
    return [...seen.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([name, sku]) => ({ value: name, label: name, subLabel: sku }));
  }, [sourceRows]);
  const productOptions = useMemo(() => {
    const seen = new Map();
    sourceRows.forEach((r) => { if (!seen.has(r.productName)) seen.set(r.productName, MOCK_PRODUCT_SKU_MAP[r.productName] || ""); });
    return [...seen.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([name, sku]) => ({ value: name, label: name, subLabel: sku || undefined }));
  }, [sourceRows]);
  const customerOptions = useMemo(() => {
    const seen = new Map();
    sourceRows.forEach((r) => { if (!seen.has(r.customer)) seen.set(r.customer, MOCK_CUSTOMER_PIC_MAP[r.customer] || ""); });
    return [...seen.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([name, pic]) => ({ value: name, label: name, subLabel: pic || undefined }));
  }, [sourceRows]);

  const dateFilterActive = dateFilterType !== "all" && !isUnscheduled;

  const filteredRows = useMemo(() => {
    const now = new Date(); now.setHours(0, 0, 0, 0);
    return sourceRows.filter((row) => {
      if (woIdFilter.length > 0 && !woIdFilter.includes(row.woId)) return false;
      if (orderIdFilter.length > 0 && !orderIdFilter.includes(row.orderId)) return false;
      if (materialFilter.length > 0 && !materialFilter.includes(row.materialName)) return false;
      if (productFilter.length > 0 && !productFilter.includes(row.productName)) return false;
      if (customerFilter.length > 0 && !customerFilter.includes(row.customer)) return false;
      if (!isUnscheduled && dateFilterType !== "all" && row.woStartDate) {
        const startDate = parseShortDate(row.woStartDate);
        if (!startDate) return false;
        const isoStart = toISO(startDate);
        if (dateFilterType === "last7") { const c = new Date(now); c.setDate(now.getDate() - 7); if (startDate < c || startDate > now) return false; }
        else if (dateFilterType === "last30") { const c = new Date(now); c.setDate(now.getDate() - 30); if (startDate < c || startDate > now) return false; }
        else if (dateFilterType === "next7") { const c = new Date(now); c.setDate(now.getDate() + 7); if (startDate < now || startDate > c) return false; }
        else if (dateFilterType === "next30") { const c = new Date(now); c.setDate(now.getDate() + 30); if (startDate < now || startDate > c) return false; }
        else if (dateFilterType === "custom" && customDateRange.start && customDateRange.end) {
          if (isoStart < customDateRange.start || isoStart > customDateRange.end) return false;
        }
      }
      return true;
    });
  }, [sourceRows, woIdFilter, orderIdFilter, materialFilter, productFilter, customerFilter, dateFilterType, customDateRange, isUnscheduled]);

  const sortedRows = useMemo(() => {
    if (!sortDir || isUnscheduled) return filteredRows;
    return [...filteredRows].sort((a, b) => {
      const da = parseShortDate(a.woStartDate);
      const db = parseShortDate(b.woStartDate);
      if (!da && !db) return 0;
      if (!da) return 1;
      if (!db) return -1;
      return sortDir === "asc" ? da - db : db - da;
    });
  }, [filteredRows, sortDir, isUnscheduled]);

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / rowsPerPage));
  const pagedRows  = sortedRows.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const allPagedSelectable = isUnscheduled ? [] : pagedRows.filter((r) => r.needToBuy > 0);
  const allPagedSelected   = allPagedSelectable.length > 0 && allPagedSelectable.every((r) => selectedIds.includes(r.id));
  const somePagedSelected  = allPagedSelectable.some((r) => selectedIds.includes(r.id));

  const toggleRow  = (id) => { setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]); };
  const toggleAll  = () => {
    if (allPagedSelected) {
      setSelectedIds((prev) => prev.filter((id) => !allPagedSelectable.find((r) => r.id === id)));
    } else {
      const toAdd = allPagedSelectable.map((r) => r.id).filter((id) => !selectedIds.includes(id));
      setSelectedIds((prev) => [...prev, ...toAdd]);
    }
  };

  const handleClose = () => {
    setWoIdFilter([]); setOrderIdFilter([]); setMaterialFilter([]); setProductFilter([]); setCustomerFilter([]);
    setDateFilterType("all"); setCustomDateRange({ start: "", end: "" }); setOpenFilterKey(null); setCurrentPage(1);
    setSelectedIds([]); setPoMenuOpenRowId(null); setIsSelectExistingPoOpen(false); setSelectPoRow(null);
    setSortDir(null);
    onClose();
  };

  const buildPoRow = (row) => ({
    woId: row.woId,
    demandQty: row.demandQty,
    materialName: row.materialName,
    sku: row.sku,
    needToBuy: row.needToBuy,
    urgencyStatus: filterMode === "urgentToBuy" ? "urgent" : filterMode,
  });

  const handleSingleCreatePo = (row) => {
    setSelectedIds([]); setPoMenuOpenRowId(null);
    onCreatePo([buildPoRow(row)]);
  };

  const [bulkMenuOpen, setBulkMenuOpen] = useState(false);
  const [bulkMenuPos, setBulkMenuPos] = useState({ top: null, bottom: null, left: 0 });

  const openBulkMenu = (btnEl) => {
    const rect = btnEl.getBoundingClientRect();
    const menuHeight = 96;
    if (window.innerHeight - rect.bottom < menuHeight + 8) {
      setBulkMenuPos({ bottom: window.innerHeight - rect.top + 4, top: null, right: window.innerWidth - rect.right });
    } else {
      setBulkMenuPos({ top: rect.bottom + 4, bottom: null, right: window.innerWidth - rect.right });
    }
    setBulkMenuOpen(true);
  };

  const handleBulkCreateNewPo = () => {
    setBulkMenuOpen(false);
    const selected = filteredRows.filter((r) => selectedIds.includes(r.id));
    setSelectedIds([]);
    onCreatePo(selected.map(buildPoRow));
  };

  const handleBulkSelectExistingPo = () => {
    setBulkMenuOpen(false);
    setSelectPoRow(null);
    setSelectedVendorName("");
    setSelectedExistingPoNumber("");
    setIsSelectExistingPoOpen(true);
  };

  // PO vendor options
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

  const selectedPoDetail = useMemo(() => {
    if (!selectedExistingPoNumber) return null;
    return MOCK_PO_TABLE_DATA.find(po => po.poNumber === selectedExistingPoNumber) || null;
  }, [selectedExistingPoNumber]);

  const leftShadow  = scrollShadows.left  ? "4px 0 8px -4px rgba(0,0,0,0.12)"  : "none";
  const rightShadow = scrollShadows.right ? "-4px 0 8px -4px rgba(0,0,0,0.12)" : "none";

  const TABLE_MIN_W = isUnscheduled ? TABLE_MIN_W_UNSCHEDULED : TABLE_MIN_W_FULL;

  const filterDefs = [
    { key: "woId",     label: "WO ID",    value: woIdFilter,     options: woIdOptions,     onChange: setWoIdFilter     },
    { key: "orderId",  label: "Order ID", value: orderIdFilter,  options: orderIdOptions,  onChange: setOrderIdFilter  },
    { key: "material", label: "Material", value: materialFilter, options: materialOptions, onChange: setMaterialFilter },
    { key: "customer", label: "Customer", value: customerFilter, options: customerOptions, onChange: setCustomerFilter },
    { key: "product",  label: "Product",  value: productFilter,  options: productOptions,  onChange: setProductFilter  },
  ];

  return (
    <>
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.28)", zIndex: 20000, opacity: isOpen ? 1 : 0, transition: "opacity 0.2s ease-in-out", pointerEvents: isOpen ? "auto" : "none" }} onClick={handleClose} />

      <div
        style={{ position: "fixed", top: 0, right: 0, width: "900px", height: "100%", background: "var(--neutral-surface-primary)", display: "flex", flexDirection: "column", zIndex: 20001, transform: (isOpen && !isSelectExistingPoOpen) ? "translateX(0)" : "translateX(100%)", transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)", boxShadow: "-4px 0 16px rgba(0,0,0,0.12)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: "24px", borderBottom: ROW_BORDER, display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <span style={{ fontSize: "var(--text-title-1)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>{cfg.title}</span>
          <IconButton icon={CloseIcon} onClick={handleClose} size="small" color="var(--neutral-on-surface-primary)" />
        </div>

        {/* Banner */}
        {cfg.banner && (
          <div style={{ padding: "16px 24px 0", flexShrink: 0 }}>
            <div style={{ background: cfg.banner.bg, borderRadius: "12px", padding: "16px 20px", display: "flex", gap: "16px", alignItems: "flex-start" }}>
              <div style={{ marginTop: "2px", flexShrink: 0 }}><Info size={20} color={cfg.banner.iconColor} /></div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <span style={{ fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-semi-bold)", color: cfg.banner.iconColor }}>{cfg.banner.title}</span>
                <span style={{ fontSize: "var(--text-body)", color: cfg.banner.iconColor, lineHeight: "1.6" }}>{cfg.banner.body}</span>
              </div>
            </div>
          </div>
        )}

        {/* Filter bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", padding: "16px 24px 12px", borderBottom: ROW_BORDER, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {filterDefs.map(({ key, label, value, options, onChange }) => (
              <div key={key} onClick={(e) => { const rect = e.currentTarget.getBoundingClientRect(); setPopoverTriggerRect(rect); setOpenFilterKey((prev) => prev === key ? null : key); }}>
                <FilterPill label={label} active={value.length > 0} isOpen={openFilterKey === key} count={value.length} />
              </div>
            ))}
            {filterDefs.map(({ key, label, value, options, onChange }) =>
              openFilterKey === key ? (
                <FilterPopoverCheckbox key={key} title={label} options={options} value={value} onChange={(v) => { onChange(v); setCurrentPage(1); }} onClose={() => setOpenFilterKey(null)} triggerRect={popoverTriggerRect} />
              ) : null
            )}

            {/* Est. Start — hidden for unscheduled */}
            {!isUnscheduled && (
              <div style={{ position: "relative" }}>
                <div onClick={() => setShowDatePopover((p) => !p)}>
                  <FilterPill label="Est. Start" active={dateFilterActive} isOpen={showDatePopover} count={dateFilterActive ? 1 : 0} />
                </div>
                {showDatePopover && <StartDatePopover dateFilterType={dateFilterType} setDateFilterType={(v) => { setDateFilterType(v); setCurrentPage(1); }} customDateRange={customDateRange} setCustomDateRange={setCustomDateRange} onClose={() => setShowDatePopover(false)} />}
              </div>
            )}
          </div>
        </div>

        {/* Selection action bar — not shown for unscheduled */}
        {!isUnscheduled && selectedIds.length > 0 && (
          <div style={{ padding: "10px 24px", borderBottom: ROW_BORDER, background: "var(--feature-brand-container)", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
            <span style={{ fontSize: "var(--text-title-3)", color: "var(--feature-brand-primary)", fontWeight: "var(--font-weight-semi-bold)" }}>
              {selectedIds.length} row{selectedIds.length !== 1 ? "s" : ""} selected
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Button variant="tertiary" size="small" onClick={() => setSelectedIds([])}>Clear</Button>
              <div style={{ position: "relative" }} data-po-menu>
                <Button variant="filled" size="small" rightIcon={ChevronDownIcon} onClick={(e) => openBulkMenu(e.currentTarget)}>
                  Create PO for Selected
                </Button>
                {bulkMenuOpen && (
                  <>
                    <div style={{ position: "fixed", inset: 0, zIndex: 29999 }} onClick={() => setBulkMenuOpen(false)} />
                    <div style={{ position: "fixed", top: bulkMenuPos.top ?? "auto", bottom: bulkMenuPos.bottom ?? "auto", right: bulkMenuPos.right, width: "180px", background: "var(--neutral-surface-primary)", border: ROW_BORDER, borderRadius: "var(--radius-card)", boxShadow: "var(--elevation-sm)", overflow: "hidden", zIndex: 30000 }}>
                      <div onClick={handleBulkCreateNewPo} onMouseEnter={(e) => (e.currentTarget.style.background = "var(--neutral-surface-grey-lighter)")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")} style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-primary)" }}>
                        <AddIcon size={16} /> Create New PO
                      </div>
                      <div onClick={handleBulkSelectExistingPo} onMouseEnter={(e) => (e.currentTarget.style.background = "var(--neutral-surface-grey-lighter)")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")} style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-primary)", borderTop: ROW_BORDER }}>
                        <DocumentIcon size={16} /> Select Existing PO
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        <div ref={scrollerRef} style={{ flex: 1, minHeight: 0, overflowX: "auto", overflowY: "auto" }}>
          <div style={{ minWidth: `${TABLE_MIN_W}px`, display: "inline-flex", flexDirection: "column", width: "100%" }}>

            {/* Header */}
            <div style={{ display: "flex", borderBottom: ROW_BORDER, position: "sticky", top: 0, zIndex: 3, background: "var(--neutral-surface-primary)" }}>
              {/* Checkbox — hidden for unscheduled */}
              {!isUnscheduled && (
                <div style={{ ...thBase(CHECKBOX_W, { padding: "0 12px", justifyContent: "center" }), position: "sticky", left: 0, zIndex: 4, background: "var(--neutral-surface-primary)" }}>
                  <input type="checkbox" checked={allPagedSelected} ref={(el) => { if (el) el.indeterminate = somePagedSelected && !allPagedSelected; }} onChange={toggleAll} style={{ width: "16px", height: "16px", cursor: "pointer", accentColor: "var(--feature-brand-primary)" }} />
                </div>
              )}
              <div style={{ ...thBase(WO_ID_W, { paddingLeft: "24px" }), position: "sticky", left: isUnscheduled ? 0 : `${CHECKBOX_W}px`, zIndex: 4, background: "var(--neutral-surface-primary)", boxShadow: leftShadow, transition: "box-shadow 0.2s ease" }}>WO ID</div>
              <div style={thBase(ORDER_ID_W)}>Order ID</div>
              <div style={{ ...thBase(0), flex: 1, minWidth: `${MATERIAL_MIN_W}px` }}>Material</div>
              <div style={{ ...thBase(0), flex: 1, minWidth: `${PRODUCT_MIN_W}px` }}>Product</div>
              <div style={{ ...thBase(0), flex: 1, minWidth: `${CUSTOMER_MIN_W}px` }}>Customer</div>
              {!isUnscheduled && (
                <div onClick={() => setSortDir(d => d === "asc" ? "desc" : "asc")} style={{ ...thBase(EST_W), cursor: "pointer", userSelect: "none", gap: "6px" }}>
                  Est. Start
                  <ChevronDownIcon
                    size={14}
                    color={sortDir ? "var(--feature-brand-primary)" : "var(--neutral-on-surface-tertiary)"}
                    style={{ transform: sortDir === "asc" ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
                  />
                </div>
              )}
              <div style={thBase(DEMAND_W)}>Demand</div>
              {isUnscheduled && <div style={{ width: "24px", flexShrink: 0 }} />}
              {!isUnscheduled && <div style={thBase(NEED_W)}>Need to Buy</div>}
              {!isUnscheduled && (
                <div style={{ ...thBase(ACTION_W, { paddingRight: "24px", justifyContent: "center" }), position: "sticky", right: 0, zIndex: 4, background: "var(--neutral-surface-primary)", boxShadow: rightShadow, transition: "box-shadow 0.2s ease" }}>Action</div>
              )}
            </div>

            {/* Body */}
            {filteredRows.length === 0 ? (
              <div style={{ padding: "48px 0", textAlign: "center", color: "var(--neutral-on-surface-tertiary)", fontSize: "var(--text-title-3)" }}>
                No rows found.
              </div>
            ) : pagedRows.map((row) => {
              const isSelected = selectedIds.includes(row.id);
              return (
                <div key={row.id} style={{ display: "flex", borderBottom: ROW_BORDER, background: isSelected ? "var(--feature-brand-container)" : "var(--neutral-surface-primary)" }}>
                  {/* Checkbox */}
                  {!isUnscheduled && (
                    <div style={{ ...cellBase(CHECKBOX_W, { padding: "0 12px", justifyContent: "center" }), position: "sticky", left: 0, zIndex: 2, background: "inherit", alignSelf: "stretch" }}>
                      <input type="checkbox" checked={isSelected} onChange={() => toggleRow(row.id)} disabled={row.needToBuy === 0} style={{ width: "16px", height: "16px", cursor: row.needToBuy === 0 ? "not-allowed" : "pointer", accentColor: "var(--feature-brand-primary)", opacity: row.needToBuy === 0 ? 0.4 : 1 }} />
                    </div>
                  )}

                  {/* WO ID */}
                  <div style={{ ...cellBase(WO_ID_W, { paddingLeft: "24px" }), position: "sticky", left: isUnscheduled ? 0 : `${CHECKBOX_W}px`, zIndex: 2, background: "inherit", boxShadow: leftShadow, transition: "box-shadow 0.2s ease", alignSelf: "stretch" }}>
                    <span style={linkStyle} onClick={() => window.open(`/work-order/${row.woId}`, "_blank")}>{row.woId}</span>
                  </div>

                  <div style={cellBase(ORDER_ID_W)}>
                    <span style={linkStyle} onClick={() => window.open(`/sales-order/${row.orderId}`, "_blank")}>{row.orderId}</span>
                  </div>

                  <div style={{ flex: 1, minWidth: `${MATERIAL_MIN_W}px`, boxSizing: "border-box", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "2px", padding: "10px 12px", fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-primary)" }}>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", width: "100%" }}>{row.materialName}</span>
                    <span style={{ ...linkStyle, fontSize: "var(--text-body)" }} onClick={() => window.open(`/materials/${row.sku}`, "_blank")}>{row.sku}</span>
                  </div>

                  <div style={{ flex: 1, minWidth: `${PRODUCT_MIN_W}px`, boxSizing: "border-box", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "2px", padding: "10px 12px", fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-primary)" }}>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", width: "100%" }}>{row.productName}</span>
                    {MOCK_PRODUCT_SKU_MAP[row.productName] && (
                      <span style={{ ...linkStyle, fontSize: "var(--text-body)" }} onClick={() => window.open(`/products/${MOCK_PRODUCT_SKU_MAP[row.productName]}`, "_blank")}>{MOCK_PRODUCT_SKU_MAP[row.productName]}</span>
                    )}
                  </div>

                  <div style={{ flex: 1, minWidth: `${CUSTOMER_MIN_W}px`, boxSizing: "border-box", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "2px", padding: "10px 12px", fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-primary)" }}>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", width: "100%" }}>{row.customer}</span>
                    {MOCK_CUSTOMER_PIC_MAP[row.customer] && (
                      <span style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", width: "100%" }}>{MOCK_CUSTOMER_PIC_MAP[row.customer]}</span>
                    )}
                  </div>

                  {!isUnscheduled && (
                    <div style={{ ...cellBase(EST_W), alignItems: "flex-start", paddingTop: "10px", paddingBottom: "10px" }}>{fmtWoStartDate(row.woStartDate)}</div>
                  )}

                  <div style={{ ...cellBase(DEMAND_W, { fontWeight: "var(--font-weight-semi-bold)" }), alignItems: "flex-start", paddingTop: "10px", paddingBottom: "10px" }}>{formatNumberWithCommas(row.demandQty)} pcs</div>
                  {isUnscheduled && <div style={{ width: "24px", flexShrink: 0 }} />}

                  {!isUnscheduled && (
                    <div style={{ ...cellBase(NEED_W, { fontWeight: "var(--font-weight-bold)", color: row.needToBuy > 0 ? "var(--status-red-primary)" : "var(--neutral-on-surface-secondary)" }), alignItems: "flex-start", paddingTop: "10px", paddingBottom: "10px" }}>
                      {row.needToBuy > 0 ? `${formatNumberWithCommas(row.needToBuy)} pcs` : filterMode === "delayedWo" ? "0" : "Covered"}
                    </div>
                  )}

                  {/* Action — 2-option dropdown, hidden for unscheduled */}
                  {!isUnscheduled && (
                    <div style={{ ...cellBase(ACTION_W, { paddingRight: "24px", justifyContent: "center" }), position: "sticky", right: 0, zIndex: 2, background: "inherit", alignSelf: "stretch", boxShadow: rightShadow, transition: "box-shadow 0.2s ease" }}>
                      {row.needToBuy > 0 ? (
                        <div data-po-menu>
                          <Button variant="secondary" size="small" rightIcon={ChevronDownIcon} onClick={(e) => openPoMenu(row.id, e.currentTarget)}>
                            Create PO
                          </Button>
                        </div>
                      ) : (
                        <Button variant="secondary" size="small" disabled>Create PO</Button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
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
          const menuRow = pagedRows.find(r => r.id === poMenuOpenRowId);
          if (!menuRow) return null;
          return (
            <>
              <div style={{ position: "fixed", inset: 0, zIndex: 29999 }} onClick={() => setPoMenuOpenRowId(null)} />
              <div data-po-menu style={{ position: "fixed", top: poMenuPos.top ?? "auto", bottom: poMenuPos.bottom ?? "auto", right: poMenuPos.right, width: "180px", background: "var(--neutral-surface-primary)", border: ROW_BORDER, borderRadius: "var(--radius-card)", boxShadow: "var(--elevation-sm)", overflow: "hidden", zIndex: 30000 }}>
                <div onClick={(e) => { e.stopPropagation(); handleSingleCreatePo(menuRow); }} onMouseEnter={(e) => (e.currentTarget.style.background = "var(--neutral-surface-grey-lighter)")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")} style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-primary)" }}>
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
