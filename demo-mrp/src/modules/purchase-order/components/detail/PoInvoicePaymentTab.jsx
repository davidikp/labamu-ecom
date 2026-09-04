import React, { useState, useEffect } from "react";
import { Plus } from "../../../../components/icons/Icons.jsx";
import { TablePaginationFooter } from "../../../../components/table/TablePaginationFooter.jsx";
import { formatCurrency } from "../../../../utils/format/formatUtils.js";
import {
  Button,
  StatusBadge,
  TableSearchField,
} from "./shared/PoDetailSharedComponents.jsx";
import { FilterPill } from "../../../../components/common/FilterPill.jsx";
import { DateRangeInputControl } from "../DateRangeInputControl.jsx";

const RadialBarChart = ({ items, totalValue, centerLabel, centerValue, size = 180 }) => {
  const center = size / 2;
  const gap = 16;
  const outermostRadius = (size - 16) / 2;
  const baseRadius = outermostRadius - ((items.length - 1) * gap);

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
        {items.map((item, index) => {
          const radius = baseRadius + (index * gap);
          const circumference = 2 * Math.PI * radius;
          const validTotal = totalValue > 0 ? totalValue : 1;
          const percentage = Math.min((item.value / validTotal) * 100, 100);

          return (
            <React.Fragment key={index}>
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke="var(--neutral-surface-grey-lighter)"
                strokeWidth="6"
              />
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={item.color}
                strokeWidth="6"
                strokeDasharray={`${(percentage / 100) * circumference} ${circumference}`}
                strokeDashoffset={0}
                strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 1s ease-in-out" }}
              />
            </React.Fragment>
          );
        })}
      </svg>
      <div style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        textAlign: "center",
        width: "100%"
      }}>
        <div style={{ fontSize: "11px", color: "var(--neutral-on-surface-secondary)", marginBottom: "4px" }}>{centerLabel}</div>
        <div style={{ fontSize: "16px", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>{centerValue}</div>
      </div>
    </div>
  );
};

const PoInvoicePaymentTab = ({
  // Data
  outstandingAmount,
  currency,
  total,
  poInvoicedRatio,
  totalInvoiced,
  totalPaid,
  poGap,
  overdueAmount,
  invoiceSearch,
  currentStatus,
  invoices,
  invoiceCurrentPage,
  invoiceRowsPerPage,
  // Handlers
  setInvoiceSearch,
  setShowAddInvoiceDrawer,
  setSelectedInvoiceForDetail,
  setActiveInvoiceTab,
  setShowInvoiceDetailDrawer,
  setExpandedInvoiceItems,
  setExpandedInvoicePayments,
  setInvoiceCurrentPage,
  setInvoiceRowsPerPage,
  // Helpers
  getInvoiceMetrics,
  getAgingStatus,
  getInvoiceStatus,
}) => {
  const [openFilterKey, setOpenFilterKey] = useState(null);
  const [dateFilterType, setDateFilterType] = useState("all");
  const [customDateRange, setCustomDateRange] = useState({ start: "", end: "" });
  const [popoverTriggerRect, setPopoverTriggerRect] = useState(null);

  const parsedDate = (value) => {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  };
  const now = new Date("2026-03-31");

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch = inv.number.toLowerCase().includes(invoiceSearch.toLowerCase());
    let matchesDate = true;
    const rowDate = parsedDate(inv.date);

    if (dateFilterType === "last7" && rowDate) {
      const start = new Date(now);
      start.setDate(now.getDate() - 7);
      matchesDate = rowDate >= start && rowDate <= now;
    } else if (dateFilterType === "last30" && rowDate) {
      const start = new Date(now);
      start.setDate(now.getDate() - 30);
      matchesDate = rowDate >= start && rowDate <= now;
    } else if (
      dateFilterType === "custom" &&
      rowDate &&
      customDateRange.start &&
      customDateRange.end
    ) {
      const start = parsedDate(customDateRange.start);
      const end = parsedDate(customDateRange.end);
      if (start && end) matchesDate = rowDate >= start && rowDate <= end;
    }

    return matchesSearch && matchesDate;
  });

  const totalPages = Math.max(1, Math.ceil(filteredInvoices.length / invoiceRowsPerPage));
  const visibleInvoices = filteredInvoices.slice(
    (invoiceCurrentPage - 1) * invoiceRowsPerPage,
    invoiceCurrentPage * invoiceRowsPerPage
  );

  useEffect(() => {
    setInvoiceCurrentPage(1);
  }, [dateFilterType, customDateRange.start, customDateRange.end, invoiceSearch, invoiceRowsPerPage]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", gap: "24px" }}>
        {/* PO Invoice Overview Card with Radial Progress Chart */}
        <div style={{
          flex: "2",
          background: "var(--neutral-surface-primary)",
          borderRadius: "var(--radius-card)",
          border: "1px solid var(--neutral-line-separator-1)",
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          justifyContent: "space-between"
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <span style={{ fontSize: "var(--text-title-2)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>
              PO Invoice Overview
            </span>
            <span style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-tertiary)", lineHeight: "1.4" }}>
              Track purchase order value, invoiced amount, and payments.
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "32px", marginTop: "8px" }}>
            <RadialBarChart 
              totalValue={total}
              centerLabel="PO Value"
              centerValue={total >= 1000000 ? `${(total / 1000000).toFixed(1)}M` : formatCurrency(total, currency).replace(currency + " ", "")}
              size={180}
              items={[
                { label: "Paid to Vendor", value: totalPaid, color: "var(--status-green-primary)" },
                { label: "Total Invoiced", value: totalInvoiced, color: "var(--feature-brand-primary)" },
              ]}
            />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center", 
                fontSize: "13px",
                marginBottom: "2px"
              }}>
                <span style={{ color: "var(--neutral-on-surface-secondary)", fontWeight: "500" }}>Total PO Value</span>
                <span style={{ color: "var(--neutral-on-surface-primary)", fontWeight: "700" }}>{formatCurrency(total, currency)}</span>
              </div>
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center", 
                fontSize: "13px",
                paddingBottom: "8px",
                borderBottom: "1px solid var(--neutral-line-separator-1)",
                marginBottom: "2px"
              }}>
                <span style={{ color: "var(--neutral-on-surface-secondary)", fontWeight: "500" }}>Uninvoiced Amount</span>
                <span style={{ fontWeight: "600", color: "var(--neutral-on-surface-primary)" }}>{formatCurrency(poGap, currency)}</span>
              </div>
              {[
                { label: "Total Invoiced", color: "var(--feature-brand-primary)", value: totalInvoiced },
                { label: "Paid to Vendor", color: "var(--status-green-primary)", value: totalPaid },
              ].map((item, idx) => (
                <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "2px", background: item.color }} />
                    <span style={{ color: "var(--neutral-on-surface-secondary)" }}>{item.label}</span>
                    {item.label === "Total Invoiced" && totalInvoiced > total && (
                      <div style={{ marginLeft: "6px", display: "inline-flex" }}>
                        <StatusBadge variant="orange-light">Mismatch</StatusBadge>
                      </div>
                    )}
                  </div>
                  <span style={{ fontWeight: "600", color: "var(--neutral-on-surface-primary)" }}>{formatCurrency(item.value, currency)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stacked Outstanding & Overdue Cards Column */}
        <div style={{
          flex: "1",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}>
          {/* Outstanding Card */}
          <div style={{
            flex: "1",
            background: "var(--neutral-surface-primary)",
            borderRadius: "var(--radius-card)",
            border: "1px solid var(--neutral-line-separator-1)",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <span style={{ fontSize: "var(--text-title-2)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>
                Outstanding
              </span>
              <span style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-tertiary)", lineHeight: "1.4" }}>
                Remaining unpaid invoice balance.
              </span>
            </div>
            <span style={{ fontSize: "var(--text-large-title)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)", marginTop: "12px" }}>
              {formatCurrency(outstandingAmount, currency)}
            </span>
          </div>

          {/* Overdue Card */}
          <div style={{
            flex: "1",
            background: "var(--neutral-surface-primary)",
            borderRadius: "var(--radius-card)",
            border: "1px solid var(--neutral-line-separator-1)",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <span style={{ fontSize: "var(--text-title-2)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>
                Overdue
              </span>
              <span style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-tertiary)", lineHeight: "1.4" }}>
                Outstanding amount that has passed its due date.
              </span>
            </div>
            <span style={{ fontSize: "var(--text-large-title)", fontWeight: "var(--font-weight-bold)", color: overdueAmount > 0 ? "var(--status-red-primary)" : "var(--neutral-on-surface-primary)", marginTop: "12px" }}>
              {formatCurrency(overdueAmount, currency)}
            </span>
          </div>
        </div>
      </div>

      <div
        style={{
          background: "var(--neutral-surface-primary)",
          borderRadius: "var(--radius-card)",
          border: "1px solid var(--neutral-line-separator-1)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            padding: "20px 24px 0 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "var(--text-title-2)",
              fontWeight: "var(--font-weight-bold)",
              color: "var(--neutral-on-surface-primary)",
            }}
          >
            Invoice / AP List
          </h2>
          <Button
            variant="filled"
            leftIcon={Plus}
            size="small"
            onClick={() => setShowAddInvoiceDrawer(true)}
            disabled={
              currentStatus !== "Issued" && currentStatus !== "Completed"
            }
          >
            Add Invoice
          </Button>
        </div>
        <div
          style={{
            padding: "16px 24px 20px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ position: "relative" }}>
            <div
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setPopoverTriggerRect(rect);
                setOpenFilterKey((prev) =>
                  prev === "invoiceDate" ? null : "invoiceDate"
                );
              }}
            >
              <FilterPill
                label="Invoice Date"
                active={dateFilterType !== "all"}
                isOpen={openFilterKey === "invoiceDate"}
                count={dateFilterType !== "all" ? 1 : 0}
              />
            </div>

            {openFilterKey === "invoiceDate" ? (
              <>
                <div
                  style={{ position: "fixed", inset: 0, zIndex: 80 }}
                  onClick={() => setOpenFilterKey(null)}
                />
                <div
                  style={{
                    position: "fixed",
                    top: popoverTriggerRect
                      ? `${popoverTriggerRect.bottom + 8}px`
                      : "160px",
                    left: popoverTriggerRect ? `${popoverTriggerRect.left}px` : "0",
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
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "var(--text-title-2)",
                        fontWeight: "var(--font-weight-bold)",
                      }}
                    >
                      Invoice Date
                    </span>
                    <button
                      onClick={() => {
                        setDateFilterType("all");
                        setCustomDateRange({ start: "", end: "" });
                        setOpenFilterKey(null);
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        padding: 0,
                        color: "var(--status-red-primary)",
                        cursor: "pointer",
                        fontSize: "var(--text-body)",
                        fontWeight: "var(--font-weight-bold)",
                      }}
                    >
                      Remove Filter
                    </button>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {[
                      { key: "all", label: "All" },
                      { key: "last7", label: "Last 7 days" },
                      { key: "last30", label: "Last 30 days" },
                      { key: "custom", label: "Custom date" },
                    ].map((opt) => (
                      <label
                        key={opt.key}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          cursor: "pointer",
                          fontSize: "var(--text-title-3)",
                        }}
                      >
                        <input
                          type="radio"
                          checked={dateFilterType === opt.key}
                          onChange={() => setDateFilterType(opt.key)}
                        />
                        <span>{opt.label}</span>
                      </label>
                    ))}
                    {dateFilterType === "custom" ? (
                      <DateRangeInputControl
                        value={customDateRange}
                        onChange={(e) => setCustomDateRange(e.target.value)}
                      />
                    ) : null}
                  </div>
                </div>
              </>
            ) : null}
          </div>
          <TableSearchField
            value={invoiceSearch}
            onChange={(e) => setInvoiceSearch(e.target.value)}
            placeholder="Search invoice number..."
            width="240px"
          />
        </div>

        <div
          style={{
            width: "100%",
            overflowX: filteredInvoices.length > 0 ? "auto" : "hidden",
          }}
        >
          <div
            style={{
              minWidth: "1000px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Table Header */}
            {filteredInvoices.length > 0 && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.2fr 1fr 1fr 1fr 2.5fr 1.2fr 1fr",
                  gap: "12px",
                  padding: "0 24px",
                  height: "49px",
                  alignItems: "center",
                  background: "var(--neutral-surface-primary)",
                  position: "relative",
                  fontSize: "var(--text-title-3)",
                  fontWeight: "var(--font-weight-bold)",
                  color: "var(--neutral-on-surface-primary)",
                  borderBottom: "1px solid var(--neutral-line-separator-1)",
                }}
              >
                <span>Invoice No</span>
                <span>Invoice Date</span>
                <span>Payment Terms</span>
                <span>Due Date</span>
                <span>Settlement Progress</span>
                <span>Aging Status</span>
                <span>Invoice Status</span>
              </div>
            )}

            {/* Table Body */}
            {filteredInvoices.length > 0 ? (
              visibleInvoices.map((inv, idx, arr) => {
                  const metrics = getInvoiceMetrics(inv);
                  const aging = getAgingStatus(inv.dueDate, metrics.outstanding);
                  const status = getInvoiceStatus(inv, metrics);
                  const invPaidRatio =
                    inv.amount > 0 ? Math.min(metrics.paid / inv.amount, 1) : 0;

                  return (
                    <div
                      key={inv.id}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1.2fr 1fr 1fr 1fr 2.5fr 1.2fr 1fr",
                        gap: "12px",
                        padding: "0 24px",
                        minHeight: "64px",
                        alignItems: "center",
                        background: "var(--neutral-surface-primary)",
                        position: "relative",
                        borderBottom:
                          idx === arr.length - 1
                            ? "none"
                            : "1px solid var(--neutral-line-separator-1)",
                        fontSize: "14px",
                        cursor: "pointer",
                        transition: "background-color 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor =
                          "var(--neutral-surface-grey-lighter)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor =
                          "var(--neutral-surface-primary)";
                      }}
                      onClick={() => {
                        setSelectedInvoiceForDetail(inv);
                        setActiveInvoiceTab("Item Lines");
                        setShowInvoiceDetailDrawer(true);
                        setExpandedInvoiceItems([]);
                        setExpandedInvoicePayments([]);
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "2px",
                          padding: "8px 0",
                        }}
                      >
                        <span style={{ fontWeight: "var(--font-weight-bold)" }}>
                          {inv.number}
                        </span>
                      </div>
                      <div>{inv.date}</div>
                      <div>{inv.terms}</div>
                      <div>{inv.dueDate}</div>

                      {/* Settlement Progress Column */}
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "8px",
                          padding: "8px 0",
                        }}
                      >
                        <div
                          style={{
                            height: "6px",
                            background: "var(--neutral-surface-grey-lighter)",
                            borderRadius: "3px",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${invPaidRatio * 100}%`,
                              height: "100%",
                              background: (() => {
                                const pct = invPaidRatio * 100;
                                if (pct >= 100) return "var(--status-green-primary)";
                                if (pct >= 75) return "var(--feature-brand-primary)";
                                if (pct >= 50) return "var(--status-yellow-primary)";
                                if (pct >= 25) return "var(--status-orange-primary)";
                                return "var(--status-red-primary)";
                              })(),
                              borderRadius: "3px",
                            }}
                          />
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            color: "var(--neutral-on-surface-tertiary)",
                            width: "100%",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "2px",
                              flex: 1,
                            }}
                          >
                            <span style={{ fontSize: "10px" }}>Paid</span>
                            <span
                              style={{
                                color: (() => {
                                  const pct = invPaidRatio * 100;
                                  if (pct >= 100) return "var(--status-green-primary)";
                                  if (pct >= 75) return "var(--feature-brand-primary)";
                                  if (pct >= 50) return "var(--status-yellow-primary)";
                                  if (pct >= 25) return "var(--status-orange-primary)";
                                  return "var(--status-red-primary)";
                                })(),
                                fontWeight: "var(--font-weight-bold)",
                                fontSize: "11px",
                              }}
                            >
                              {formatCurrency(metrics.paid, currency)}
                            </span>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "2px",
                              alignItems: "center",
                              flex: 1,
                            }}
                          >
                            <span style={{ fontSize: "10px" }}>
                              Outstanding
                            </span>
                            <span
                              style={{
                                color: "var(--neutral-on-surface-primary)",
                                fontWeight: "var(--font-weight-bold)",
                                fontSize: "11px",
                              }}
                            >
                              {formatCurrency(metrics.outstanding, currency)}
                            </span>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "2px",
                              alignItems: "flex-end",
                              flex: 1,
                            }}
                          >
                            <span style={{ fontSize: "10px" }}>Total</span>
                            <span
                              style={{
                                color: "var(--neutral-on-surface-primary)",
                                fontWeight: "var(--font-weight-bold)",
                                fontSize: "11px",
                              }}
                            >
                              {formatCurrency(inv.amount, currency)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: "flex", justifyContent: "flex-start", minWidth: 0 }}>
                        <StatusBadge variant={aging.variant}>
                          {aging.text}
                        </StatusBadge>
                      </div>
                      <div style={{ display: "flex", justifyContent: "flex-start", minWidth: 0 }}>
                        <StatusBadge variant={status.variant}>
                          {status.text}
                        </StatusBadge>
                      </div>
                    </div>
                  );
                })
            ) : (
              <div
                style={{
                  padding: "48px 24px",
                  textAlign: "center",
                  color: "var(--neutral-on-surface-tertiary)",
                  fontSize: "var(--text-title-3)",
                  background: "var(--neutral-surface-primary)",
                  border: "1.5px dashed var(--neutral-line-separator-1)",
                  borderRadius: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: "120px",
                  margin: "0 24px",
                }}
              >
                {invoiceSearch
                  ? "No invoices found matching your search."
                  : "No invoices recorded yet."}
              </div>
            )}
          </div>
        </div>

        {/* Pagination Footer */}
        <div style={{ padding: "0 4px" }}>
          <TablePaginationFooter
            currentPage={invoiceCurrentPage}
            totalPages={totalPages}
            rowsPerPage={invoiceRowsPerPage}
            totalRows={filteredInvoices.length}
            onPageChange={setInvoiceCurrentPage}
            onRowsPerPageChange={setInvoiceRowsPerPage}
            style={{
              borderTop:
                filteredInvoices.length === 0
                  ? "none"
                  : "1px solid var(--neutral-line-separator-1)",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default PoInvoicePaymentTab;
