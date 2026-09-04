import React, { useState, useMemo, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRightIcon } from "../../../components/icons/Icons.jsx";
import { StatusBadge } from "../../../components/atoms/StatusBadge.jsx";
import { TableSearchField } from "../../../components/table/TableSearchField.jsx";
import { TablePaginationFooter } from "../../../components/table/TablePaginationFooter.jsx";
import { FilterPill } from "../../../components/common/FilterPill.jsx";
import { FilterPopoverCheckbox } from "../../../components/molecules/FilterPopoverCheckbox.jsx";
import { DateRangeInputControl } from "../../purchase-order/components/DateRangeInputControl.jsx";
import { Button } from "../../../components/common/Button.jsx";
import { MOCK_DEMAND_URGENCY_ROWS } from "../mock/materialForecastMocks.js";
import { CreatePoDrawer } from "../components/CreatePoDrawer.jsx";

const STATUS_CONFIG = {
  overdue:   { label: "Overdue",   badgeVariant: "red-light" },
  urgent:    { label: "Urgent",    badgeVariant: "orange-light" },
  this_week: { label: "This Week", badgeVariant: "blue-light" },
};

const TITLE_MAP = {
  Overdue:     "Overdue to Order",
  Urgent:      "Urgent to Order",
  "This Week": "Order This Week",
};

const STATUS_FILTER_MAP = {
  Overdue:   "overdue",
  Urgent:    "urgent",
  "This Week": "this_week",
};

// Parse "Jun 30" → Date (current year)
const parseShortDate = (str) => {
  if (!str) return null;
  const d = new Date(`${str} ${new Date().getFullYear()}`);
  return isNaN(d.getTime()) ? null : d;
};

const toISO = (d) => {
  if (!d) return "";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const WoStartDateFilterPopover = ({ dateFilterType, setDateFilterType, customDateRange, setCustomDateRange, onClose }) => {
  const popoverRef = useRef(null);
  useEffect(() => {
    const handler = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div
      ref={popoverRef}
      style={{
        position: "absolute",
        top: "calc(100% + 8px)",
        left: 0,
        width: "360px",
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
          WO Start Date
        </span>
        <button
          onClick={() => { setDateFilterType("all"); setCustomDateRange({ start: "", end: "" }); onClose(); }}
          style={{ background: "none", border: "none", padding: 0, color: "var(--status-red-primary)", cursor: "pointer", fontSize: "var(--text-body)", fontWeight: "var(--font-weight-bold)" }}
        >
          Remove Filter
        </button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {[
          { key: "all",    label: "All" },
          { key: "last7",  label: "Last 7 days" },
          { key: "last30", label: "Last 30 days" },
          { key: "next7",  label: "Next 7 days" },
          { key: "next30", label: "Next 30 days" },
          { key: "custom", label: "Custom date" },
        ].map((opt) => (
          <label key={opt.key} style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", fontSize: "var(--text-title-3)" }}>
            <input type="radio" checked={dateFilterType === opt.key} onChange={() => setDateFilterType(opt.key)} />
            <span>{opt.label}</span>
          </label>
        ))}
        {dateFilterType === "custom" && (
          <DateRangeInputControl
            value={customDateRange}
            onChange={(e) => setCustomDateRange(e.target.value)}
            fieldHeight="40px"
            fontSize="14px"
          />
        )}
      </div>
    </div>
  );
};

export const DemandUrgencyDetailPage = ({ onNavigate, statusType, showPoSnackbar }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [orderIdFilter, setOrderIdFilter] = useState([]);
  const [materialFilter, setMaterialFilter] = useState([]);
  const [productFilter, setProductFilter] = useState([]);
  const [customerFilter, setCustomerFilter] = useState([]);
  const [dateFilterType, setDateFilterType] = useState("all");
  const [customDateRange, setCustomDateRange] = useState({ start: "", end: "" });
  const [showDatePopover, setShowDatePopover] = useState(false);
  const [openFilterKey, setOpenFilterKey] = useState(null);
  const [popoverTriggerRect, setPopoverTriggerRect] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isCreatePoOpen, setIsCreatePoOpen] = useState(false);
  const [createPoMaterial, setCreatePoMaterial] = useState(null);

  const pageTitle = TITLE_MAP[statusType] || statusType;
  const statusKey = STATUS_FILTER_MAP[statusType];

  const sourceRows = useMemo(() =>
    MOCK_DEMAND_URGENCY_ROWS.filter((r) => r.status === statusKey),
  [statusKey]);

  const orderIdOptions = useMemo(() =>
    [...new Set(sourceRows.map((r) => r.orderId).filter(Boolean))].sort().map((v) => ({ value: v, label: v })),
  [sourceRows]);

  const materialOptions = useMemo(() =>
    [...new Set(sourceRows.map((r) => r.materialName))].sort().map((m) => ({ value: m, label: m })),
  [sourceRows]);

  const productOptions = useMemo(() =>
    [...new Set(sourceRows.map((r) => r.productName))].sort().map((p) => ({ value: p, label: p })),
  [sourceRows]);

  const customerOptions = useMemo(() =>
    [...new Set(sourceRows.map((r) => r.customer))].sort().map((c) => ({ value: c, label: c })),
  [sourceRows]);

  const dateFilterActive = dateFilterType !== "all";
  const dateFilterCount = dateFilterActive ? 1 : 0;

  const filtered = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    return sourceRows.filter((row) => {
      if (searchQuery && !row.woId.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (orderIdFilter.length > 0 && !orderIdFilter.includes(row.orderId)) return false;
      if (materialFilter.length > 0 && !materialFilter.includes(row.materialName)) return false;
      if (productFilter.length > 0 && !productFilter.includes(row.productName)) return false;
      if (customerFilter.length > 0 && !customerFilter.includes(row.customer)) return false;

      if (dateFilterType !== "all") {
        const startDate = parseShortDate(row.woStartDate);
        if (!startDate) return false;
        const isoStart = toISO(startDate);

        if (dateFilterType === "last7") {
          const cutoff = new Date(now); cutoff.setDate(now.getDate() - 7);
          if (startDate < cutoff || startDate > now) return false;
        } else if (dateFilterType === "last30") {
          const cutoff = new Date(now); cutoff.setDate(now.getDate() - 30);
          if (startDate < cutoff || startDate > now) return false;
        } else if (dateFilterType === "next7") {
          const cutoff = new Date(now); cutoff.setDate(now.getDate() + 7);
          if (startDate < now || startDate > cutoff) return false;
        } else if (dateFilterType === "next30") {
          const cutoff = new Date(now); cutoff.setDate(now.getDate() + 30);
          if (startDate < now || startDate > cutoff) return false;
        } else if (dateFilterType === "custom" && customDateRange.start && customDateRange.end) {
          if (isoStart < customDateRange.start || isoStart > customDateRange.end) return false;
        }
      }

      return true;
    });
  }, [sourceRows, searchQuery, materialFilter, productFilter, customerFilter, dateFilterType, customDateRange]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const paginated = filtered.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const hasActiveFilters =
    orderIdFilter.length > 0 ||
    materialFilter.length > 0 ||
    productFilter.length > 0 ||
    customerFilter.length > 0 ||
    dateFilterActive;

  const linkStyle = {
    color: "var(--feature-brand-primary)",
    cursor: "pointer",
    textDecoration: "underline",
    fontSize: "var(--text-title-3)",
  };

  return (
    <>
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
      {/* Header */}
      <div style={{ flexShrink: 0 }}>
        <div
          style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", marginLeft: "-4px", marginBottom: "8px" }}
          onClick={() => onNavigate("list")}
        >
          <ChevronLeft size={28} color="var(--neutral-on-surface-primary)" />
          <h1 style={{ margin: 0, fontSize: "var(--text-large-title)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>
            {pageTitle}
          </h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-secondary)" }}>
          <span style={{ cursor: "pointer" }} onClick={() => onNavigate("list")}>Material Planning</span>
          <ChevronRightIcon size={14} color="var(--neutral-on-surface-tertiary)" />
          <span>{pageTitle}</span>
        </div>
      </div>

      {/* Table Card */}
      <div
        style={{
          background: "var(--neutral-surface-primary)",
          borderRadius: "var(--radius-card)",
          border: "1px solid var(--neutral-line-separator-1)",
          display: "flex",
          flexDirection: "column",
          flex: 1,
          overflow: "hidden",
          minHeight: 0,
        }}
      >
        {/* Filter Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            padding: "16px 24px",
            borderBottom: hasActiveFilters ? "none" : "1px solid var(--neutral-line-separator-1)",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            {/* Order ID — first */}
            {[
              { key: "orderId",  label: "Order ID", value: orderIdFilter,  options: orderIdOptions,  onChange: (v) => { setOrderIdFilter(v);  setCurrentPage(1); } },
              { key: "material", label: "Material",  value: materialFilter, options: materialOptions, onChange: (v) => { setMaterialFilter(v); setCurrentPage(1); } },
              { key: "customer", label: "Customer",  value: customerFilter, options: customerOptions, onChange: (v) => { setCustomerFilter(v); setCurrentPage(1); } },
              { key: "product",  label: "Product",   value: productFilter,  options: productOptions,  onChange: (v) => { setProductFilter(v);  setCurrentPage(1); } },
            ].map(({ key, label, value, options, onChange }) => (
              <div
                key={key}
                onClick={(e) => { const rect = e.currentTarget.getBoundingClientRect(); setPopoverTriggerRect(rect); setOpenFilterKey((prev) => prev === key ? null : key); }}
              >
                <FilterPill label={label} active={value.length > 0} isOpen={openFilterKey === key} count={value.length} />
              </div>
            ))}

            {openFilterKey === "orderId"  && <FilterPopoverCheckbox title="Order ID" options={orderIdOptions}  value={orderIdFilter}  onChange={(v) => { setOrderIdFilter(v);  setCurrentPage(1); }} onClose={() => setOpenFilterKey(null)} triggerRect={popoverTriggerRect} />}
            {openFilterKey === "material" && <FilterPopoverCheckbox title="Material" options={materialOptions} value={materialFilter} onChange={(v) => { setMaterialFilter(v); setCurrentPage(1); }} onClose={() => setOpenFilterKey(null)} triggerRect={popoverTriggerRect} />}
            {openFilterKey === "customer" && <FilterPopoverCheckbox title="Customer" options={customerOptions} value={customerFilter} onChange={(v) => { setCustomerFilter(v); setCurrentPage(1); }} onClose={() => setOpenFilterKey(null)} triggerRect={popoverTriggerRect} />}
            {openFilterKey === "product"  && <FilterPopoverCheckbox title="Product"  options={productOptions}  value={productFilter}  onChange={(v) => { setProductFilter(v);  setCurrentPage(1); }} onClose={() => setOpenFilterKey(null)} triggerRect={popoverTriggerRect} />}

            {/* WO Start Date filter */}
            <div style={{ position: "relative" }}>
              <div onClick={() => setShowDatePopover((p) => !p)}>
                <FilterPill label="WO Start Date" active={dateFilterActive} isOpen={showDatePopover} count={dateFilterCount} />
              </div>
              {showDatePopover && (
                <WoStartDateFilterPopover
                  dateFilterType={dateFilterType}
                  setDateFilterType={(v) => { setDateFilterType(v); setCurrentPage(1); }}
                  customDateRange={customDateRange}
                  setCustomDateRange={setCustomDateRange}
                  onClose={() => setShowDatePopover(false)}
                />
              )}
            </div>
          </div>

          <TableSearchField
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            placeholder="Search WO ID..."
            width="260px"
          />
        </div>

        {/* Filter Pills Row */}
        {hasActiveFilters && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 24px 12px",
              flexWrap: "wrap",
              borderBottom: "1px solid var(--neutral-line-separator-1)",
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-secondary)" }}>Active filters:</span>
            {orderIdFilter.map((id) => (
              <FilterPill key={`oid-${id}`} label={id} active={true} onRemove={() => setOrderIdFilter((prev) => prev.filter((x) => x !== id))} />
            ))}
            {materialFilter.map((m) => (
              <FilterPill key={`mat-${m}`} label={m} active={true} onRemove={() => setMaterialFilter((prev) => prev.filter((x) => x !== m))} />
            ))}
            {productFilter.map((p) => (
              <FilterPill key={`prod-${p}`} label={p} active={true} onRemove={() => setProductFilter((prev) => prev.filter((x) => x !== p))} />
            ))}
            {customerFilter.map((c) => (
              <FilterPill key={`cust-${c}`} label={c} active={true} onRemove={() => setCustomerFilter((prev) => prev.filter((x) => x !== c))} />
            ))}
            {dateFilterActive && (
              <FilterPill
                label="WO Start Date"
                active={true}
                onRemove={() => { setDateFilterType("all"); setCustomDateRange({ start: "", end: "" }); }}
              />
            )}
          </div>
        )}

        {/* Table */}
        <div style={{ overflowX: "auto", overflowY: "auto", flex: 1 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
            <thead>
              <tr
                style={{
                  position: "sticky",
                  top: 0,
                  zIndex: 10,
                  background: "var(--neutral-surface-primary)",
                  borderBottom: "1px solid var(--neutral-line-separator-1)",
                }}
              >
                {[
                  { label: "Material",      w: "18%" },
                  { label: "Product",       w: "17%" },
                  { label: "WO ID",         w: "10%" },
                  { label: "Order ID",      w: "10%" },
                  { label: "Customer",      w: "17%" },
                  { label: "WO Start Date", w: "11%" },
                  { label: "Demand",        w: "8%"  },
                  { label: "Need to Buy",   w: "9%"  },
                  { label: "Create PO",     w: "10%" },
                ].map((col) => (
                  <th
                    key={col.label}
                    style={{
                      width: col.w,
                      padding: "16px 12px",
                      textAlign: "left",
                      fontWeight: "var(--font-weight-bold)",
                      fontSize: "var(--text-title-3)",
                      color: "var(--neutral-on-surface-primary)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map((row) => {
                const cfg = STATUS_CONFIG[row.status];
                return (
                  <tr
                    key={row.id}
                    style={{ borderBottom: "1px solid var(--neutral-line-separator-1)", transition: "background 0.15s ease" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "var(--neutral-surface-grey-lighter)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = ""; }}
                  >
                    {/* Material */}
                    <td style={{ padding: "16px 12px", verticalAlign: "middle" }}>
                      <div style={{ fontWeight: "var(--font-weight-semi-bold)", fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-primary)" }}>
                        {row.materialName}
                      </div>
                      <div style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-secondary)", marginTop: "2px" }}>
                        {row.sku}
                      </div>
                    </td>

                    {/* Product */}
                    <td style={{ padding: "16px 12px", verticalAlign: "middle", fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-primary)" }}>
                      {row.productName}
                    </td>

                    {/* WO ID */}
                    <td style={{ padding: "16px 12px", verticalAlign: "middle" }}>
                      <span style={linkStyle}>{row.woId}</span>
                    </td>

                    {/* Order ID */}
                    <td style={{ padding: "16px 12px", verticalAlign: "middle" }}>
                      <span style={linkStyle}>{row.orderId}</span>
                    </td>

                    {/* Customer */}
                    <td style={{ padding: "16px 12px", verticalAlign: "middle", fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-primary)" }}>
                      {row.customer}
                    </td>

                    {/* WO Start Date */}
                    <td style={{ padding: "16px 12px", verticalAlign: "middle", fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-primary)" }}>
                      {row.woStartDate}
                    </td>

                    {/* Demand */}
                    <td style={{ padding: "16px 12px", verticalAlign: "middle", fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-primary)" }}>
                      {row.demandQty} pcs
                    </td>

                    {/* Need to Buy */}
                    <td style={{ padding: "16px 12px", verticalAlign: "middle", fontSize: "var(--text-title-3)" }}>
                      {row.needToBuy > 0 ? (
                        <span style={{ color: "var(--status-red-primary)", fontWeight: "var(--font-weight-semi-bold)" }}>
                          {row.needToBuy} pcs
                        </span>
                      ) : (
                        <span style={{ color: "var(--status-green-primary)", fontWeight: "var(--font-weight-semi-bold)" }}>
                          Covered
                        </span>
                      )}
                    </td>

                    {/* Create PO */}
                    <td style={{ padding: "16px 12px", verticalAlign: "middle" }}>
                      <Button
                        variant="filled"
                        size="small"
                        disabled={row.needToBuy === 0}
                        onClick={() => {
                          setCreatePoMaterial({ materialName: row.materialName, sku: row.sku, needToBuy: row.needToBuy });
                          setIsCreatePoOpen(true);
                        }}
                      >
                        Create PO
                      </Button>
                    </td>
                  </tr>
                );
              })}

              {paginated.length === 0 && (
                <tr>
                  <td colSpan={9} style={{ padding: "48px 24px", textAlign: "center", color: "var(--neutral-on-surface-tertiary)", fontSize: "var(--text-title-3)" }}>
                    No demand rows found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={{ borderTop: "1px solid var(--neutral-line-separator-1)", flexShrink: 0 }}>
          <TablePaginationFooter
            totalRows={filtered.length}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(n) => { setRowsPerPage(n); setCurrentPage(1); }}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>

    <CreatePoDrawer
      isOpen={isCreatePoOpen}
      onClose={() => setIsCreatePoOpen(false)}
      showBack={false}
      initialMaterial={createPoMaterial}
      showPoSnackbar={showPoSnackbar}
    />
    </>
  );
};
