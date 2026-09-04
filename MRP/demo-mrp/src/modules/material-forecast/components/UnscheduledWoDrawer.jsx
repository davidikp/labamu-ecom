import React, { useState, useMemo, useRef, useEffect } from "react";
import { CloseIcon } from "../../../components/icons/Icons.jsx";
import { IconButton } from "../../../components/common/IconButton.jsx";
import { TableSearchField } from "../../../components/table/TableSearchField.jsx";
import { TablePaginationFooter } from "../../../components/table/TablePaginationFooter.jsx";
import { FilterMenu } from "../../../components/molecules/FilterMenu.jsx";
import { MOCK_UNSCHEDULED_WOS, MOCK_CUSTOMER_PIC_MAP, MOCK_PRODUCT_SKU_MAP } from "../mock/materialForecastMocks.js";
import { formatNumberWithCommas } from "../../../utils/format/formatUtils.js";

const ROW_BORDER = "1px solid var(--neutral-line-separator-1)";

// ── Column widths ────────────────────────────────────────────────────────────
const WO_ID_W    = 120;
const ORDER_ID_W = 100;
const DEMAND_W   = 110;

// Minimum widths for fill columns
const MATERIAL_MIN_W = 150;
const PRODUCT_MIN_W  = 150;
const CUSTOMER_MIN_W = 150;

const TABLE_MIN_W = WO_ID_W + ORDER_ID_W + PRODUCT_MIN_W + CUSTOMER_MIN_W + DEMAND_W;

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

const linkStyle = {
  color: "var(--feature-brand-primary)",
  cursor: "pointer",
  textDecoration: "underline",
  fontSize: "var(--text-title-3)",
};

const LabelValue = ({ label, value }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1, minWidth: 0 }}>
    <span style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-secondary)" }}>{label}</span>
    <div style={{ fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>{value}</div>
  </div>
);

export const UnscheduledWoDrawer = ({ isOpen, onClose, materialData, pageFilters = {} }) => {
  const [filterProduct, setFilterProduct] = useState([]);
  const [filterCustomer, setFilterCustomer] = useState([]);
  const [filterOrderId, setFilterOrderId] = useState([]);
  const [filterWoId, setFilterWoId] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

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

  const allRows = useMemo(() => {
    if (!materialData) return [];
    return MOCK_UNSCHEDULED_WOS[materialData.sku] || [];
  }, [materialData]);

  const productOptions = useMemo(() => [...new Set(allRows.map(r => r.productName))].sort().map(v => ({ value: v, label: v, subLabel: MOCK_PRODUCT_SKU_MAP[v] || "" })), [allRows]);
  const customerOptions = useMemo(() => [...new Set(allRows.map(r => r.customer))].sort().map(v => ({ value: v, label: v, subLabel: MOCK_CUSTOMER_PIC_MAP[v] || "" })), [allRows]);
  const orderIdOptions  = useMemo(() => [...new Set(allRows.map(r => r.orderId).filter(Boolean))].sort().map(v => ({ value: v, label: v })), [allRows]);
  const woIdOptions     = useMemo(() => [...new Set(allRows.map(r => r.woId))].sort().map(v => ({ value: v, label: v })), [allRows]);

  const filteredRows = useMemo(() => {
    return allRows.filter(r => {
      if (filterProduct.length > 0  && !filterProduct.includes(r.productName)) return false;
      if (filterCustomer.length > 0 && !filterCustomer.includes(r.customer))   return false;
      if (filterOrderId.length > 0  && !filterOrderId.includes(r.orderId))     return false;
      if (filterWoId.length > 0     && !filterWoId.includes(r.woId))           return false;
      return true;
    });
  }, [allRows, filterProduct, filterCustomer, filterOrderId, filterWoId]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / rowsPerPage));
  const pagedRows  = filteredRows.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const handleClose = () => {
    setFilterProduct([]); setFilterCustomer([]); setFilterOrderId([]); setFilterWoId([]);
    setCurrentPage(1); onClose();
  };

  const leftShadow  = scrollShadows.left  ? "4px 0 8px -4px rgba(0,0,0,0.12)"  : "none";
  const rightShadow = scrollShadows.right ? "-4px 0 8px -4px rgba(0,0,0,0.12)" : "none";

  if (!materialData) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.28)", zIndex: 20000, opacity: isOpen ? 1 : 0, transition: "opacity 0.2s ease-in-out", pointerEvents: isOpen ? "auto" : "none" }}
        onClick={handleClose}
      />

      {/* Drawer — same 900px as MaterialBreakdownDrawer */}
      <div
        style={{ position: "fixed", top: 0, right: 0, width: "900px", height: "100%", background: "var(--neutral-surface-primary)", display: "flex", flexDirection: "column", zIndex: 20001, transform: isOpen ? "translateX(0)" : "translateX(100%)", transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)", boxShadow: "-4px 0 16px rgba(0,0,0,0.12)" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: "24px", borderBottom: ROW_BORDER, display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <span style={{ fontSize: "var(--text-title-1)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>
            Unscheduled Work Orders
          </span>
          <IconButton icon={CloseIcon} onClick={handleClose} size="small" color="var(--neutral-on-surface-primary)" />
        </div>

        {/* Info card */}
        <div style={{ padding: "16px 24px", flexShrink: 0 }}>
          <div style={{ padding: "16px", borderRadius: "var(--radius-card)", border: ROW_BORDER, display: "flex", gap: "24px" }}>
            <LabelValue label="Material Name" value={materialData.materialName} />
            <LabelValue label="Material SKU" value={materialData.sku} />
            <LabelValue label="On-Hand Stock" value={materialData.onHandStock != null ? formatNumberWithCommas(materialData.onHandStock) : "—"} />
            <LabelValue label="Incoming PO" value={materialData.incomingPoStock != null ? formatNumberWithCommas(materialData.incomingPoStock) : "—"} />
          </div>
        </div>

        {/* Filter bar */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "0 24px 12px", flexShrink: 0, borderBottom: ROW_BORDER }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <FilterMenu label="WO ID" multiple options={woIdOptions} values={filterWoId} onChangeMultiple={setFilterWoId} />
            <FilterMenu label="Order ID" multiple options={orderIdOptions} values={filterOrderId} onChangeMultiple={setFilterOrderId} />
            <FilterMenu label="Product" multiple options={productOptions.map(o => ({ value: o.value, label: o.label }))} values={filterProduct} onChangeMultiple={setFilterProduct} />
            <FilterMenu label="Customer" multiple options={customerOptions.map(o => ({ value: o.value, label: o.label }))} values={filterCustomer} onChangeMultiple={setFilterCustomer} />
          </div>
        </div>

        {/* Table — same flex-row as MaterialBreakdownDrawer */}
        <div ref={scrollerRef} style={{ flex: 1, minHeight: 0, overflowX: "auto", overflowY: "auto" }}>
          <div style={{ minWidth: `${TABLE_MIN_W}px`, display: "inline-flex", flexDirection: "column", width: "100%" }}>

            {/* Header */}
            <div style={{ display: "flex", borderBottom: ROW_BORDER, position: "sticky", top: 0, zIndex: 3, background: "var(--neutral-surface-primary)" }}>
              <div style={{ ...thBase(WO_ID_W, { paddingLeft: "24px" }), position: "sticky", left: 0, zIndex: 4, background: "var(--neutral-surface-primary)", boxShadow: leftShadow, transition: "box-shadow 0.2s ease" }}>WO ID</div>
              <div style={thBase(ORDER_ID_W)}>Order ID</div>
              <div style={{ ...thBase(0), flex: 1, minWidth: `${PRODUCT_MIN_W}px` }}>Product</div>
              <div style={{ ...thBase(0), flex: 1, minWidth: `${CUSTOMER_MIN_W}px` }}>Customer</div>
              <div style={thBase(DEMAND_W, { paddingRight: "24px" })}>Demand</div>
            </div>

            {/* Body */}
            {filteredRows.length === 0 ? (
              <div style={{ padding: "48px 0", textAlign: "center", color: "var(--neutral-on-surface-tertiary)", fontSize: "var(--text-title-3)" }}>
                {allRows.length === 0 ? "No unscheduled work orders for this material." : "No work orders match the current filters."}
              </div>
            ) : pagedRows.map((row, idx) => (
              <div key={`${row.woId}-${idx}`} style={{ display: "flex", borderBottom: ROW_BORDER, background: "var(--neutral-surface-primary)" }}>

                {/* WO ID — sticky left */}
                <div style={{ ...cellBase(WO_ID_W, { paddingLeft: "24px" }), position: "sticky", left: 0, zIndex: 2, background: "inherit", boxShadow: leftShadow, transition: "box-shadow 0.2s ease", alignSelf: "stretch" }}>
                  <span style={linkStyle} onClick={() => window.open(`/work-order/${row.woId}`, "_blank")}>{row.woId}</span>
                </div>

                {/* Order ID */}
                <div style={cellBase(ORDER_ID_W)}>
                  <span style={linkStyle} onClick={() => window.open(`/sales-order/${row.orderId}`, "_blank")}>{row.orderId}</span>
                </div>

                {/* Product + SKU secondary clickable */}
                <div style={{ flex: 1, minWidth: `${PRODUCT_MIN_W}px`, boxSizing: "border-box", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "2px", padding: "10px 12px", fontSize: "var(--text-title-3)" }}>
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", width: "100%", fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-primary)" }}>
                    {row.productName}
                  </span>
                  {MOCK_PRODUCT_SKU_MAP[row.productName] && (
                    <span style={{ ...linkStyle, fontSize: "var(--text-body)" }} onClick={() => window.open(`/products/${MOCK_PRODUCT_SKU_MAP[row.productName]}`, "_blank")}>
                      {MOCK_PRODUCT_SKU_MAP[row.productName]}
                    </span>
                  )}
                </div>

                {/* Customer + PIC secondary */}
                <div style={{ flex: 1, minWidth: `${CUSTOMER_MIN_W}px`, boxSizing: "border-box", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "2px", padding: "10px 12px", fontSize: "var(--text-title-3)" }}>
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", width: "100%", fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-primary)" }}>
                    {row.customer}
                  </span>
                  {MOCK_CUSTOMER_PIC_MAP[row.customer] && (
                    <span style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", width: "100%" }}>
                      {MOCK_CUSTOMER_PIC_MAP[row.customer]}
                    </span>
                  )}
                </div>

                {/* Demand / Qty */}
                <div style={cellBase(DEMAND_W, { fontWeight: "var(--font-weight-semi-bold)", paddingRight: "24px" })}>
                  {row.qty.toLocaleString()}
                </div>
              </div>
            ))}
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
      </div>
    </>
  );
};
