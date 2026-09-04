import React, { useState, useMemo, useRef, useEffect } from "react";
import { CloseIcon, AddIcon, DocumentIcon, ChevronDownIcon, ChevronLeft } from "../../../components/icons/Icons.jsx";
import { IconButton } from "../../../components/common/IconButton.jsx";
import { Button } from "../../../components/common/Button.jsx";
import { TableSearchField } from "../../../components/table/TableSearchField.jsx";
import { TablePaginationFooter } from "../../../components/table/TablePaginationFooter.jsx";
import { FilterMenu } from "../../../components/molecules/FilterMenu.jsx";
import { DropdownSelect } from "../../../components/common/DropdownSelect.jsx";
import { StatusBadge } from "../../../components/common/StatusBadge.jsx";
import { MOCK_DEMAND_URGENCY_ROWS } from "../mock/materialForecastMocks.js";
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

const parseShortDate = (str) => {
  if (!str) return null;
  const d = new Date(`${str} ${new Date().getFullYear()}`);
  return isNaN(d.getTime()) ? null : d;
};

const fmtDate = (str) => {
  const d = parseShortDate(str);
  if (!d) return "—";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const CHECKBOX_W   = 44;
const WO_ID_W      = 110;
const ORDER_ID_W   = 110;
const EST_W        = 120;
const NEED_W       = 120;
const ACTION_W     = 130;
const MATERIAL_MIN_W = 150;

const TABLE_MIN_W = CHECKBOX_W + MATERIAL_MIN_W + WO_ID_W + ORDER_ID_W + EST_W + NEED_W + ACTION_W;

const cellBase = (width, extra = {}) => ({
  width: width ? `${width}px` : undefined,
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

export const MaterialsToBuyDrawer = ({ isOpen, onClose, urgencyDaysInAdvance = 5, onCreatePo }) => {
  const [materialFilter, setMaterialFilter] = useState([]);
  const [woIdFilter, setWoIdFilter]       = useState([]);
  const [orderIdFilter, setOrderIdFilter] = useState([]);
  const [estStartFilter, setEstStartFilter] = useState([]);
  const [currentPage, setCurrentPage]     = useState(1);
  const [rowsPerPage, setRowsPerPage]     = useState(10);
  const [selectedIds, setSelectedIds]     = useState([]);
  const [estStartSortDir, setEstStartSortDir] = useState(null); // null | "asc" | "desc"

  const [poMenuOpenRowId, setPoMenuOpenRowId] = useState(null);
  const [poMenuPos, setPoMenuPos]             = useState({ top: null, bottom: null, right: 0 });
  const [bulkMenuOpen, setBulkMenuOpen]       = useState(false);
  const [bulkMenuPos, setBulkMenuPos]         = useState({ top: null, bottom: null, right: 0 });

  // Select Existing PO state
  const [isSelectExistingPoOpen, setIsSelectExistingPoOpen] = useState(false);
  const [selectPoRow, setSelectPoRow]                       = useState(null);
  const [selectedVendorName, setSelectedVendorName]         = useState("");
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
  }, [isOpen]);

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

  const allRows = useMemo(() =>
    MOCK_DEMAND_URGENCY_ROWS
      .filter(r => r.needToBuy > 0 && !r.isDelayed)
      .sort((a, b) => {
        const da = parseShortDate(a.woStartDate);
        const db = parseShortDate(b.woStartDate);
        if (!da && !db) return 0;
        if (!da) return 1;
        if (!db) return -1;
        return da - db;
      }),
    []
  );

  const materialOptions = useMemo(() => {
    const seen = new Map();
    allRows.forEach(r => { if (!seen.has(r.materialName)) seen.set(r.materialName, r.sku); });
    return [...seen.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([name, sku]) => ({ value: name, label: name, subLabel: sku }));
  }, [allRows]);
  const woIdOptions     = useMemo(() => [...new Set(allRows.map(r => r.woId))].sort().map(v => ({ value: v, label: v })), [allRows]);
  const orderIdOptions  = useMemo(() => [...new Set(allRows.map(r => r.orderId))].sort().map(v => ({ value: v, label: v })), [allRows]);
  const estStartOptions = useMemo(() => [...new Set(allRows.map(r => fmtDate(r.woStartDate)).filter(s => s !== "—"))].sort().map(v => ({ value: v, label: v })), [allRows]);

  const filteredRows = useMemo(() => {
    return allRows.filter(r => {
      if (materialFilter.length > 0 && !materialFilter.includes(r.materialName))        return false;
      if (woIdFilter.length > 0     && !woIdFilter.includes(r.woId))                    return false;
      if (orderIdFilter.length > 0  && !orderIdFilter.includes(r.orderId))              return false;
      if (estStartFilter.length > 0 && !estStartFilter.includes(fmtDate(r.woStartDate))) return false;
      return true;
    });
  }, [allRows, materialFilter, woIdFilter, orderIdFilter, estStartFilter]);

  const sortedRows = useMemo(() => {
    if (!estStartSortDir) return filteredRows;
    return [...filteredRows].sort((a, b) => {
      const da = parseShortDate(a.woStartDate);
      const db = parseShortDate(b.woStartDate);
      if (!da && !db) return 0;
      if (!da) return 1;
      if (!db) return -1;
      return estStartSortDir === "asc" ? da - db : db - da;
    });
  }, [filteredRows, estStartSortDir]);

  const totalPages       = Math.max(1, Math.ceil(sortedRows.length / rowsPerPage));
  const pagedRows        = sortedRows.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
  const allPagedSelectable = pagedRows;
  const allPagedSelected   = allPagedSelectable.length > 0 && allPagedSelectable.every(r => selectedIds.includes(r.id));
  const somePagedSelected  = allPagedSelectable.some(r => selectedIds.includes(r.id));

  const toggleRow = (id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleAll = () => {
    if (allPagedSelected) {
      setSelectedIds(prev => prev.filter(id => !allPagedSelectable.find(r => r.id === id)));
    } else {
      const toAdd = allPagedSelectable.map(r => r.id).filter(id => !selectedIds.includes(id));
      setSelectedIds(prev => [...prev, ...toAdd]);
    }
  };

  const buildPoRow = (row) => ({
    woId: row.woId,
    demandQty: row.demandQty,
    materialName: row.materialName,
    sku: row.sku,
    needToBuy: row.needToBuy,
    urgencyStatus: "materialsToBuy",
  });

  const handleSingleCreatePo = (row) => {
    setPoMenuOpenRowId(null);
    onCreatePo && onCreatePo([buildPoRow(row)]);
  };

  const handleOpenSelectExistingPo = (row) => {
    setSelectPoRow(row);
    setSelectedVendorName("");
    setSelectedExistingPoNumber("");
    setPoMenuOpenRowId(null);
    setIsSelectExistingPoOpen(true);
  };

  const handleBulkCreateNewPo = () => {
    setBulkMenuOpen(false);
    const selected = filteredRows.filter(r => selectedIds.includes(r.id));
    setSelectedIds([]);
    onCreatePo && onCreatePo(selected.map(buildPoRow));
  };

  const handleBulkSelectExistingPo = () => {
    setBulkMenuOpen(false);
    setSelectPoRow(null);
    setSelectedVendorName("");
    setSelectedExistingPoNumber("");
    setIsSelectExistingPoOpen(true);
  };

  const handleAttachExistingPo = () => {
    setIsSelectExistingPoOpen(false);
    setSelectPoRow(null);
    setSelectedVendorName("");
    setSelectedExistingPoNumber("");
  };

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

  const handleClose = () => {
    setMaterialFilter([]); setWoIdFilter([]); setOrderIdFilter([]); setEstStartFilter([]);
    setOpenFilterKey(null); setCurrentPage(1); setSelectedIds([]);
    setPoMenuOpenRowId(null); setBulkMenuOpen(false);
    setIsSelectExistingPoOpen(false); setSelectPoRow(null);
    setSelectedVendorName(""); setSelectedExistingPoNumber("");
    setEstStartSortDir(null);
    onClose();
  };

  const leftShadow  = scrollShadows.left  ? "4px 0 8px -4px rgba(0,0,0,0.12)"  : "none";
  const rightShadow = scrollShadows.right ? "-4px 0 8px -4px rgba(0,0,0,0.12)" : "none";

  const filterDefs = [
    { key: "material", label: "Material",  value: materialFilter, options: materialOptions, onChange: setMaterialFilter },
    { key: "woId",     label: "WO ID",     value: woIdFilter,     options: woIdOptions,     onChange: setWoIdFilter     },
    { key: "orderId",  label: "Order ID",  value: orderIdFilter,  options: orderIdOptions,  onChange: setOrderIdFilter  },
    { key: "estStart", label: "Est. Start", value: estStartFilter, options: estStartOptions, onChange: setEstStartFilter },
  ];

  return (
    <>
      <div
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.28)", zIndex: 20000, opacity: isOpen ? 1 : 0, transition: "opacity 0.2s ease-in-out", pointerEvents: isOpen ? "auto" : "none" }}
        onClick={handleClose}
      />
      <div
        style={{ position: "fixed", top: 0, right: 0, width: "900px", height: "100%", background: "var(--neutral-surface-primary)", display: "flex", flexDirection: "column", zIndex: 20001, transform: (isOpen && !isSelectExistingPoOpen) ? "translateX(0)" : "translateX(100%)", transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)", boxShadow: "-4px 0 16px rgba(0,0,0,0.12)" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: "24px", borderBottom: ROW_BORDER, display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <span style={{ fontSize: "var(--text-title-1)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>
            Materials to Buy
          </span>
          <IconButton icon={CloseIcon} onClick={handleClose} size="small" color="var(--neutral-on-surface-primary)" />
        </div>

        {/* Filter bar */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "16px 24px 12px", borderBottom: ROW_BORDER, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {filterDefs.map(({ key, label, value, options, onChange }) => (
              <FilterMenu key={key} label={label} multiple options={options.map(o => ({ value: o.value, label: o.label }))} values={value} onChangeMultiple={v => { onChange(v); setCurrentPage(1); }} />
            ))}
          </div>
        </div>

        {/* Bulk action bar */}
        {selectedIds.length > 0 && (
          <div style={{ padding: "10px 24px", borderBottom: ROW_BORDER, background: "var(--feature-brand-container)", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
            <span style={{ fontSize: "var(--text-title-3)", color: "var(--feature-brand-primary)", fontWeight: "var(--font-weight-semi-bold)" }}>
              {selectedIds.length} row{selectedIds.length !== 1 ? "s" : ""} selected
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Button variant="tertiary" size="small" onClick={() => setSelectedIds([])}>Clear</Button>
              <div style={{ position: "relative" }} data-po-menu>
                <Button variant="filled" size="small" rightIcon={ChevronDownIcon} onClick={e => openBulkMenu(e.currentTarget)}>
                  Create PO for Selected
                </Button>
                {bulkMenuOpen && (
                  <>
                    <div style={{ position: "fixed", inset: 0, zIndex: 29999 }} onClick={() => setBulkMenuOpen(false)} />
                    <div style={{ position: "fixed", top: bulkMenuPos.top ?? "auto", bottom: bulkMenuPos.bottom ?? "auto", right: bulkMenuPos.right, width: "180px", background: "var(--neutral-surface-primary)", border: ROW_BORDER, borderRadius: "var(--radius-card)", boxShadow: "var(--elevation-sm)", overflow: "hidden", zIndex: 30000 }}>
                      <div onClick={handleBulkCreateNewPo} onMouseEnter={e => (e.currentTarget.style.background = "var(--neutral-surface-grey-lighter)")} onMouseLeave={e => (e.currentTarget.style.background = "transparent")} style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-primary)" }}>
                        <AddIcon size={16} /> Create New PO
                      </div>
                      <div onClick={handleBulkSelectExistingPo} onMouseEnter={e => (e.currentTarget.style.background = "var(--neutral-surface-grey-lighter)")} onMouseLeave={e => (e.currentTarget.style.background = "transparent")} style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-primary)", borderTop: ROW_BORDER }}>
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
              <div style={{ ...thBase(CHECKBOX_W, { padding: "0 12px", justifyContent: "center" }), position: "sticky", left: 0, zIndex: 4, background: "var(--neutral-surface-primary)" }}>
                <input type="checkbox" checked={allPagedSelected} ref={el => { if (el) el.indeterminate = somePagedSelected && !allPagedSelected; }} onChange={toggleAll} style={{ width: "16px", height: "16px", cursor: "pointer", accentColor: "var(--feature-brand-primary)" }} />
              </div>
              <div style={{ ...thBase(0, { paddingLeft: "8px" }), flex: 1, minWidth: `${MATERIAL_MIN_W}px` }}>Material</div>
              <div style={thBase(WO_ID_W)}>WO ID</div>
              <div style={thBase(ORDER_ID_W)}>Order ID</div>
              <div onClick={() => setEstStartSortDir(d => d === "asc" ? "desc" : "asc")} style={{ ...thBase(EST_W), cursor: "pointer", userSelect: "none", gap: "6px" }}>
                Est. Start
                <ChevronDownIcon
                  size={14}
                  color={estStartSortDir ? "var(--feature-brand-primary)" : "var(--neutral-on-surface-tertiary)"}
                  style={{ transform: estStartSortDir === "asc" ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
                />
              </div>
              <div style={thBase(NEED_W)}>Need to Buy</div>
              <div style={{ ...thBase(ACTION_W, { paddingRight: "24px", justifyContent: "center" }), position: "sticky", right: 0, zIndex: 4, background: "var(--neutral-surface-primary)", boxShadow: rightShadow, transition: "box-shadow 0.2s ease" }}>Action</div>
            </div>

            {/* Body */}
            {filteredRows.length === 0 ? (
              <div style={{ padding: "48px 0", textAlign: "center", color: "var(--neutral-on-surface-tertiary)", fontSize: "var(--text-title-3)" }}>
                No materials to buy found.
              </div>
            ) : pagedRows.map((row) => {
              const isSelected = selectedIds.includes(row.id);
              return (
                <div key={row.id} style={{ display: "flex", borderBottom: ROW_BORDER, background: isSelected ? "var(--feature-brand-container)" : "var(--neutral-surface-primary)" }}>
                  {/* Checkbox */}
                  <div style={{ ...cellBase(CHECKBOX_W, { padding: "0 12px", justifyContent: "center" }), position: "sticky", left: 0, zIndex: 2, background: "inherit", alignSelf: "stretch" }}>
                    <input type="checkbox" checked={isSelected} onChange={() => toggleRow(row.id)} style={{ width: "16px", height: "16px", cursor: "pointer", accentColor: "var(--feature-brand-primary)" }} />
                  </div>
                  {/* Material + SKU */}
                  <div style={{ flex: 1, minWidth: `${MATERIAL_MIN_W}px`, boxSizing: "border-box", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "2px", padding: "10px 12px 10px 8px", fontSize: "var(--text-title-3)" }}>
                    <span style={{ fontWeight: "var(--font-weight-semi-bold)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", width: "100%", color: "var(--neutral-on-surface-primary)" }}>{row.materialName}</span>
                    <span style={{ ...linkStyle, fontSize: "var(--text-body)" }} onClick={() => window.open(`/materials/${row.sku}`, "_blank")}>{row.sku}</span>
                  </div>
                  {/* WO ID */}
                  <div style={cellBase(WO_ID_W)}>
                    <span style={linkStyle} onClick={() => window.open(`/work-order/${row.woId}`, "_blank")}>{row.woId}</span>
                  </div>
                  {/* Order ID */}
                  <div style={cellBase(ORDER_ID_W)}>
                    <span style={linkStyle} onClick={() => window.open(`/sales-order/${row.orderId}`, "_blank")}>{row.orderId}</span>
                  </div>
                  {/* Est. Start */}
                  <div style={cellBase(EST_W)}>{fmtDate(row.woStartDate)}</div>
                  {/* Need to Buy */}
                  <div style={cellBase(NEED_W, { fontWeight: "var(--font-weight-bold)", color: "var(--status-red-primary)" })}>
                    {formatNumberWithCommas(row.needToBuy)} pcs
                  </div>
                  {/* Action */}
                  <div style={{ ...cellBase(ACTION_W, { paddingRight: "24px", justifyContent: "center" }), position: "sticky", right: 0, zIndex: 2, background: "inherit", alignSelf: "stretch", boxShadow: rightShadow, transition: "box-shadow 0.2s ease" }}>
                    <div data-po-menu>
                      <Button variant="secondary" size="small" rightIcon={ChevronDownIcon} onClick={e => openPoMenu(row.id, e.currentTarget)}>
                        Create PO
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ borderTop: ROW_BORDER, flexShrink: 0 }}>
          <TablePaginationFooter
            totalRows={filteredRows.length}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={n => { setRowsPerPage(n); setCurrentPage(1); }}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>

        {/* Per-row PO menu — rendered outside scroll container to avoid overflow clipping */}
        {poMenuOpenRowId && (() => {
          const menuRow = pagedRows.find(r => r.id === poMenuOpenRowId);
          if (!menuRow) return null;
          return (
            <>
              <div style={{ position: "fixed", inset: 0, zIndex: 29999 }} onClick={() => setPoMenuOpenRowId(null)} />
              <div data-po-menu style={{ position: "fixed", top: poMenuPos.top ?? "auto", bottom: poMenuPos.bottom ?? "auto", right: poMenuPos.right, width: "180px", background: "var(--neutral-surface-primary)", border: ROW_BORDER, borderRadius: "var(--radius-card)", boxShadow: "var(--elevation-sm)", overflow: "hidden", zIndex: 30000 }}>
                <div onClick={e => { e.stopPropagation(); handleSingleCreatePo(menuRow); }} onMouseEnter={e => (e.currentTarget.style.background = "var(--neutral-surface-grey-lighter)")} onMouseLeave={e => (e.currentTarget.style.background = "transparent")} style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-primary)" }}>
                  <AddIcon size={16} /> Create New PO
                </div>
                <div onClick={e => { e.stopPropagation(); handleOpenSelectExistingPo(menuRow); }} onMouseEnter={e => (e.currentTarget.style.background = "var(--neutral-surface-grey-lighter)")} onMouseLeave={e => (e.currentTarget.style.background = "transparent")} style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-primary)", borderTop: ROW_BORDER }}>
                  <DocumentIcon size={16} /> Select Existing PO
                </div>
              </div>
            </>
          );
        })()}
      </div>

      {/* Select Existing PO Drawer */}
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
                      onChange={v => { setSelectedVendorName(v); setSelectedExistingPoNumber(""); }}
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
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontSize: "var(--text-title-2)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>{selectedPoDetail.poNumber}</div>
                      <div style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-tertiary)", marginTop: "4px" }}>{selectedPoDetail.vendorName}</div>
                    </div>
                    <StatusBadge variant={selectedPoDetail.sBadge}>{selectedPoDetail.status}</StatusBadge>
                  </div>
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
