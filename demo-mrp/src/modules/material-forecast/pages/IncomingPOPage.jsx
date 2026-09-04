import React, { useState, useMemo, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRightIcon } from "../../../components/icons/Icons.jsx";
import { ListStatusCounterCard } from "../../../components/common/ListStatusCounterCard.jsx";
import { StatusBadge } from "../../../components/atoms/StatusBadge.jsx";
import { TableSearchField } from "../../../components/table/TableSearchField.jsx";
import { TablePaginationFooter } from "../../../components/table/TablePaginationFooter.jsx";
import { MultiSelectDropdown } from "../../../components/common/MultiSelectDropdown.jsx";
import { FilterPill } from "../../../components/common/FilterPill.jsx";
import { DateRangeInputControl } from "../../purchase-order/components/DateRangeInputControl.jsx";
import { MOCK_INCOMING_PO, MOCK_INCOMING_PO_COUNTERS } from "../mock/materialForecastMocks.js";

const URGENCY_CONFIG = {
  late:      { label: "Late",      badgeVariant: "red-light" },
  urgent:    { label: "< 3 Days",  badgeVariant: "orange-light" },
  this_week: { label: "This Week", badgeVariant: "green-light" },
  next_week: { label: "Next Week", badgeVariant: "blue-light" },
  later:     { label: ">2 Weeks",  badgeVariant: "grey-light" },
};

const ReceiptProgress = ({ received, requested }) => {
  const pct = requested > 0 ? Math.min((received / requested) * 100, 100) : 0;
  const remaining = Math.max(0, requested - received);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px", paddingRight: "8px" }}>
      <div style={{ height: "6px", background: "var(--neutral-surface-grey-lighter)", borderRadius: "3px", overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            background: "var(--status-green-primary)",
            width: `${pct}%`,
            transition: "width 0.3s ease",
            borderRadius: "3px",
          }}
        />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", color: "var(--neutral-on-surface-tertiary)" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "2px", flex: 1 }}>
          <span style={{ fontSize: "10px" }}>Received</span>
          <span style={{ color: "var(--status-green-primary)", fontWeight: "var(--font-weight-bold)", fontSize: "11px" }}>{received} pcs</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "2px", alignItems: "center", flex: 1 }}>
          <span style={{ fontSize: "10px" }}>Remaining</span>
          <span style={{ color: "var(--neutral-on-surface-primary)", fontWeight: "var(--font-weight-bold)", fontSize: "11px" }}>{remaining} pcs</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "2px", alignItems: "flex-end", flex: 1 }}>
          <span style={{ fontSize: "10px" }}>Assigned</span>
          <span style={{ color: "var(--neutral-on-surface-primary)", fontWeight: "var(--font-weight-bold)", fontSize: "11px" }}>{requested} pcs</span>
        </div>
      </div>
    </div>
  );
};

// Parse "Jun 09, 2026" → Date
const parseDisplayDate = (str) => {
  if (!str) return null;
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
};

// Convert Date → ISO string "YYYY-MM-DD"
const toISO = (d) => {
  if (!d) return "";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const EstArrivalFilterPopover = ({ dateFilterType, setDateFilterType, customDateRange, setCustomDateRange, onClose }) => {
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
          Est. Arrival
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

export const IncomingPOPage = ({ onNavigate }) => {
  const [expandedRows, setExpandedRows] = useState({});
  const [activeFilter, setActiveFilter] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [materialFilter, setMaterialFilter] = useState([]);
  const [vendorFilter, setVendorFilter] = useState([]);
  const [dateFilterType, setDateFilterType] = useState("all");
  const [customDateRange, setCustomDateRange] = useState({ start: "", end: "" });
  const [showDatePopover, setShowDatePopover] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const toggleRow = (id) =>
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleFilterClick = (key) => {
    setActiveFilter((prev) => (prev === key ? null : key));
    setCurrentPage(1);
  };

  const materialOptions = useMemo(() =>
    [...new Set(MOCK_INCOMING_PO.map((p) => p.material))].map((m) => ({ value: m, label: m })),
  []);

  const vendorOptions = useMemo(() =>
    [...new Set(MOCK_INCOMING_PO.map((p) => p.vendor))].map((v) => ({ value: v, label: v })),
  []);

  const dateFilterActive = dateFilterType !== "all";
  const dateFilterCount = dateFilterActive ? 1 : 0;

  const filtered = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    return MOCK_INCOMING_PO.filter((po) => {
      if (activeFilter && po.urgency !== activeFilter) return false;
      if (searchQuery && !po.id.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (materialFilter.length > 0 && !materialFilter.includes(po.material)) return false;
      if (vendorFilter.length > 0 && !vendorFilter.includes(po.vendor)) return false;

      if (dateFilterType !== "all") {
        const arrivalDate = parseDisplayDate(po.estArrival);
        if (!arrivalDate) return false;
        const isoArrival = toISO(arrivalDate);

        if (dateFilterType === "last7") {
          const cutoff = new Date(now); cutoff.setDate(now.getDate() - 7);
          if (arrivalDate < cutoff || arrivalDate > now) return false;
        } else if (dateFilterType === "last30") {
          const cutoff = new Date(now); cutoff.setDate(now.getDate() - 30);
          if (arrivalDate < cutoff || arrivalDate > now) return false;
        } else if (dateFilterType === "next7") {
          const cutoff = new Date(now); cutoff.setDate(now.getDate() + 7);
          if (arrivalDate < now || arrivalDate > cutoff) return false;
        } else if (dateFilterType === "next30") {
          const cutoff = new Date(now); cutoff.setDate(now.getDate() + 30);
          if (arrivalDate < now || arrivalDate > cutoff) return false;
        } else if (dateFilterType === "custom" && customDateRange.start && customDateRange.end) {
          if (isoArrival < customDateRange.start || isoArrival > customDateRange.end) return false;
        }
      }

      return true;
    });
  }, [activeFilter, searchQuery, materialFilter, vendorFilter, dateFilterType, customDateRange]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const paginated = filtered.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const counters = [
    { key: "late",      label: "Late",      count: MOCK_INCOMING_PO_COUNTERS.late,     badgeVariant: "red-light" },
    { key: "urgent",    label: "< 3 Days",  count: MOCK_INCOMING_PO_COUNTERS.urgent,   badgeVariant: "orange-light" },
    { key: "this_week", label: "This Week", count: MOCK_INCOMING_PO_COUNTERS.thisWeek, badgeVariant: "green-light" },
    { key: "next_week", label: "Next Week", count: MOCK_INCOMING_PO_COUNTERS.nextWeek, badgeVariant: "blue-light" },
    { key: "later",     label: ">2 Weeks",  count: MOCK_INCOMING_PO_COUNTERS.later,    badgeVariant: "grey-light" },
  ];

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
      {/* Header */}
      <div style={{ flexShrink: 0 }}>
        <div
          style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", marginLeft: "-4px", marginBottom: "8px" }}
          onClick={() => onNavigate("list")}
        >
          <ChevronLeft size={28} color="var(--neutral-on-surface-primary)" />
          <h1 style={{ margin: 0, fontSize: "var(--text-large-title)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>
            Incoming Purchase Order
          </h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-secondary)" }}>
          <span style={{ cursor: "pointer" }} onClick={() => onNavigate("list")}>Material Forecast</span>
          <ChevronRightIcon size={14} color="var(--neutral-on-surface-tertiary)" />
          <span>Incoming Purchase Order</span>
        </div>
      </div>

      {/* Counter Cards */}
      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", flexShrink: 0 }}>
        {counters.map((c) => (
          <ListStatusCounterCard
            key={c.key}
            label={c.label}
            count={c.count}
            badgeVariant={c.badgeVariant}
            active={activeFilter === c.key}
            onClick={() => handleFilterClick(c.key)}
          />
        ))}
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
        {/* Filter Bar: filters left, search right */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            padding: "16px 24px",
            borderBottom: "1px solid var(--neutral-line-separator-1)",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <MultiSelectDropdown
              placeholder="Material"
              value={materialFilter}
              options={materialOptions}
              onChange={(v) => { setMaterialFilter(v); setCurrentPage(1); }}
              searchable={true}
            />
            <MultiSelectDropdown
              placeholder="Vendor"
              value={vendorFilter}
              options={vendorOptions}
              onChange={(v) => { setVendorFilter(v); setCurrentPage(1); }}
              searchable={true}
            />

            {/* Est. Arrival FilterPill + popover */}
            <div style={{ position: "relative" }}>
              <div onClick={() => setShowDatePopover((p) => !p)}>
                <FilterPill
                  label="Est. Arrival"
                  active={dateFilterActive}
                  isOpen={showDatePopover}
                  count={dateFilterCount}
                />
              </div>
              {showDatePopover && (
                <EstArrivalFilterPopover
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
            placeholder="Search PO number..."
            width="260px"
          />
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto", overflowY: "auto", flex: 1 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "860px" }}>
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
                <th style={{ width: "52px", padding: "16px 0 16px 16px" }} />
                {[
                  { label: "PO Number",        w: 140 },
                  { label: "Material",         w: 220 },
                  { label: "Vendor",           w: 180 },
                  { label: "Est. Arrival",     w: 150 },
                  { label: "Receipt Progress", w: 180 },
                  { label: "Status",            w: 130 },
                ].map((col) => (
                  <th
                    key={col.label}
                    style={{
                      width: col.w,
                      minWidth: col.w,
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
              {paginated.map((po) => {
                const isExpanded = !!expandedRows[po.id];
                const cfg = URGENCY_CONFIG[po.urgency];
                return (
                  <React.Fragment key={po.id}>
                    <tr
                      onClick={() => toggleRow(po.id)}
                      style={{ borderBottom: "1px solid var(--neutral-line-separator-1)", cursor: "pointer", transition: "background 0.15s ease" }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "var(--neutral-surface-grey-lighter)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = ""; }}
                    >
                      <td style={{ padding: "16px 0 16px 16px", verticalAlign: "middle", textAlign: "center", width: "52px" }}>
                        <div
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                            transition: "transform 0.2s ease",
                          }}
                        >
                          <ChevronRightIcon size={16} color="var(--neutral-on-surface-tertiary)" />
                        </div>
                      </td>

                      <td style={{ padding: "16px 12px", verticalAlign: "middle" }} onClick={(e) => e.stopPropagation()}>
                        <span
                          style={{ fontSize: "var(--text-title-3)", color: "var(--feature-brand-primary)", cursor: "pointer", fontWeight: "var(--font-weight-semi-bold)" }}
                          onClick={() => onNavigate("po_detail", { poNumber: po.id })}
                        >
                          {po.id}
                        </span>
                      </td>

                      <td style={{ padding: "16px 12px", verticalAlign: "middle" }}>
                        <div style={{ fontWeight: "var(--font-weight-semi-bold)", fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-primary)" }}>
                          {po.material}
                        </div>
                        <div
                          style={{ fontSize: "var(--text-body)", color: "var(--feature-brand-primary)", marginTop: "2px", cursor: "pointer" }}
                          onClick={(e) => { e.stopPropagation(); onNavigate("material_detail", { sku: po.sku }); }}
                        >
                          {po.sku}
                        </div>
                      </td>

                      <td style={{ padding: "16px 12px", verticalAlign: "middle", fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-primary)" }}>
                        {po.vendor}
                      </td>
                      <td style={{ padding: "16px 12px", verticalAlign: "middle", fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-primary)" }}>
                        {po.estArrival}
                      </td>
                      <td style={{ padding: "16px 12px", verticalAlign: "middle" }}>
                        <ReceiptProgress received={po.received} requested={po.requested} />
                      </td>
                      <td style={{ padding: "16px 12px", verticalAlign: "middle" }}>
                        <StatusBadge variant={cfg.badgeVariant}>{cfg.label}</StatusBadge>
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr style={{ background: "var(--neutral-surface-grey-lighter)" }}>
                        <td colSpan={7} style={{ padding: "0 24px 16px 52px" }}>
                          {po.receipts.length === 0 ? (
                            <div style={{ padding: "12px 0", fontSize: "var(--text-body)", color: "var(--neutral-on-surface-tertiary)" }}>
                              No receipts recorded yet.
                            </div>
                          ) : (
                            <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "8px" }}>
                              <thead>
                                <tr>
                                  {["Date & Time", "Receipt ID", "Receipt Qty"].map((h) => (
                                    <th
                                      key={h}
                                      style={{
                                        textAlign: "left",
                                        padding: "8px 12px",
                                        fontSize: "var(--text-body)",
                                        fontWeight: "var(--font-weight-semi-bold)",
                                        color: "var(--neutral-on-surface-secondary)",
                                        borderBottom: "1px solid var(--neutral-line-separator-1)",
                                      }}
                                    >
                                      {h}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {po.receipts.map((r) => (
                                  <tr key={r.receiptId}>
                                    <td style={{ padding: "10px 12px", fontSize: "var(--text-body)", color: "var(--neutral-on-surface-primary)" }}>{r.dateTime}</td>
                                    <td style={{ padding: "10px 12px", fontSize: "var(--text-body)", color: "var(--neutral-on-surface-primary)" }}>{r.receiptId}</td>
                                    <td style={{ padding: "10px 12px", fontSize: "var(--text-body)", color: "var(--neutral-on-surface-primary)" }}>{r.qty}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}

              {paginated.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: "48px 24px", textAlign: "center", color: "var(--neutral-on-surface-tertiary)", fontSize: "var(--text-title-3)" }}>
                    No purchase orders found.
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
  );
};
