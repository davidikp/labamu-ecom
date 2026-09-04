
import React, { useMemo } from "react";
import { 
  ChevronRight, 
  Info, 
  CheckCircleIcon, 
  CreditCard,
  Building2,
  FileText,
  Calendar,
  ShoppingCart,
  HelpCircle,
} from "../../../components/icons/Icons.jsx";
const CheckCircle = CheckCircleIcon;
const AlertCircle = Info;
const ArrowUpRight = ChevronRight;
const Clock = Calendar;
import { MOCK_REPORT_POS } from "../mock/reportMocks";
import { formatCurrency, formatNumberWithCommas } from "../../../utils/format/formatUtils";
import { DonutChart } from "../components/DonutChart";
import { StatusBadge } from "../../../components/common/StatusBadge";
import { Button } from "../../../components/common/Button";
import { Tooltip } from "../../../components/common/Tooltip";

const InfoTooltip = ({ content }) => (
  <Tooltip content={content}>
    <span
      onClick={(e) => e.stopPropagation()}
      style={{ display: "inline-flex", alignItems: "center", cursor: "help" }}
    >
      <Info size={14} color="var(--neutral-on-surface-tertiary)" />
    </span>
  </Tooltip>
);

const RadialBarChart = ({ items, totalValue, centerLabel, centerValue, size = 180 }) => {
  const center = size / 2;
  const gap = 16;
  const outermostRadius = (size - 16) / 2; // Match DonutChart's outer boundary (82)
  const baseRadius = outermostRadius - ((items.length - 1) * gap);

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
        {items.map((item, index) => {
          const radius = baseRadius + (index * gap);
          const circumference = 2 * Math.PI * radius;
          const percentage = Math.min((item.value / totalValue) * 100, 100);
          const offset = circumference - (percentage / 100) * circumference;

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

const SummaryCard = ({ label, icon: Icon, onClick, tooltip }) => (
  <div 
    onClick={onClick}
    style={{
      background: "var(--neutral-surface-primary)",
      borderRadius: "16px",
      border: "1px solid var(--neutral-line-separator-1)",
      display: "flex",
      alignItems: "center",
      padding: "16px 20px",
      flex: 1,
      cursor: onClick ? "pointer" : "default",
      transition: "all 0.2s ease",
      gap: "12px"
    }}
    onMouseEnter={(e) => {
      if (onClick) {
        e.currentTarget.style.borderColor = "var(--feature-brand-primary)";
        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.05)";
      }
    }}
    onMouseLeave={(e) => {
      if (onClick) {
        e.currentTarget.style.borderColor = "var(--neutral-line-separator-1)";
        e.currentTarget.style.boxShadow = "none";
      }
    }}
  >
    <div style={{
      width: "36px",
      height: "36px",
      borderRadius: "50%",
      background: "var(--neutral-surface-grey-lighter)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0
    }}>
      <Icon size={20} color="var(--neutral-on-surface-primary)" />
    </div>
    
    <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1 }}>
      <span style={{
        fontSize: "14px",
        color: "var(--neutral-on-surface-primary)",
        fontWeight: "var(--font-weight-bold)"
      }}>
        {label}
      </span>
      {tooltip && <InfoTooltip content={tooltip} />}
    </div>

    {onClick && (
      <ChevronRight size={20} color="var(--neutral-on-surface-tertiary)" />
    )}
  </div>
);

const SectionHeader = ({ title, tooltip }) => (
  <div style={{
    padding: "16px 24px",
    borderBottom: "1px solid var(--neutral-line-separator-1)",
    marginBottom: "24px",
    marginLeft: "-24px",
    marginRight: "-24px",
    marginTop: "-24px",
    display: "flex",
    alignItems: "center",
    gap: "8px"
  }}>
    <h3 style={{ fontSize: "16px", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)", margin: 0 }}>
      {title}
    </h3>
    {tooltip && <InfoTooltip content={tooltip} />}
  </div>
);

const ProcurementAPReportPage = ({ onNavigate }) => {
  const currency = "IDR";

  // Calculations
  const metrics = useMemo(() => {
    const today = new Date();
    
    let totalPoValue = 0;
    let openPoCount = 0;
    let totalMatchedToInvoice = 0;
    let totalPaidToVendor = 0;
    let overdueAp = 0;
    let criticalOverdueCount = 0;

    const agingBuckets = {
      notDue: 0,
      late1_30: 0,
      late31_60: 0,
      late61_90: 0,
      late90Plus: 0
    };

    const vendorExposure = {};
    const invoicesDueSoon = [];

    MOCK_REPORT_POS.forEach(po => {
      totalPoValue += po.amount;
      if (po.status !== "Completed" && po.status !== "Canceled") {
        openPoCount++;
      }

      po.invoices.forEach(inv => {
        totalMatchedToInvoice += inv.amount;
        const invPaid = inv.payments.reduce((sum, p) => sum + p.amount, 0);
        totalPaidToVendor += invPaid;

        const outstanding = inv.amount - invPaid;
        const dueDate = new Date(inv.dueDate);
        const diffTime = today - dueDate;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (outstanding > 0) {
          // Vendor Exposure
          vendorExposure[po.vendorName] = (vendorExposure[po.vendorName] || 0) + outstanding;

          // Invoices due soon (next 7 days)
          const daysToDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
          if (daysToDue >= 0 && daysToDue <= 7) {
            invoicesDueSoon.push({ ...inv, vendorName: po.vendorName, daysToDue });
          }

          // Aging
          if (diffDays <= 0) {
            agingBuckets.notDue += outstanding;
          } else {
            overdueAp += outstanding;
            if (diffDays > 90) criticalOverdueCount++;
            
            if (diffDays <= 30) agingBuckets.late1_30 += outstanding;
            else if (diffDays <= 60) agingBuckets.late31_60 += outstanding;
            else if (diffDays <= 90) agingBuckets.late61_90 += outstanding;
            else agingBuckets.late90Plus += outstanding;
          }
        }
      });
    });

    const largestVendor = Object.entries(vendorExposure).reduce((a, b) => (a[1] > b[1] ? a : b), ["None", 0]);

    // Ensure all buckets have some demo values if requested for visualization
    const demoBuckets = {
      notDue: agingBuckets.notDue || 4500000,
      late1_30: agingBuckets.late1_30 || 14500000,
      late31_60: agingBuckets.late31_60 || 3200000,
      late61_90: agingBuckets.late61_90 || 1800000,
      late90Plus: agingBuckets.late90Plus || 850000
    };

    const totalDemoOutstanding = Object.values(demoBuckets).reduce((s, v) => s + v, 0);

    return {
      totalPoValue,
      openPoCount,
      totalMatchedToInvoice,
      totalPaidToVendor,
      outstandingAp: totalDemoOutstanding, // Use demo total for visualization sync
      overdueAp,
      criticalOverdueCount,
      agingBuckets: demoBuckets,
      largestVendor,
      invoicesDueSoonCount: invoicesDueSoon.length,
      overduePercentage: totalMatchedToInvoice > 0 ? (overdueAp / (totalMatchedToInvoice - totalPaidToVendor)) * 100 : 0
    };
  }, []);

  const donutData = [
    { label: "Not Due", value: metrics.agingBuckets.notDue, color: "var(--feature-brand-primary)" },
    { label: "Late 1-30 days", value: metrics.agingBuckets.late1_30, color: "var(--status-yellow-primary)" },
    { label: "Late 31-60 days", value: metrics.agingBuckets.late31_60, color: "var(--status-orange-primary)" },
    { label: "Late 61-90 days", value: metrics.agingBuckets.late61_90, color: "#E05252" },
    { label: "Late 90+ days", value: metrics.agingBuckets.late90Plus, color: "var(--status-red-primary)" },
  ].filter(d => d.value > 0);

  // Operational Attention logic
  const operationalIssues = useMemo(() => {
    return [
      { label: "PO with No Invoice Yet", count: MOCK_REPORT_POS.filter(po => po.invoices.length === 0 && po.status === "Issued").length },
      { label: "PO Partially Invoiced", count: MOCK_REPORT_POS.filter(po => {
        const invoicedAmount = po.invoices.reduce((s, i) => s + i.amount, 0);
        return invoicedAmount > 0 && invoicedAmount < po.amount;
      }).length },
      { label: "PO Fully Invoiced But Not Fully Paid", count: MOCK_REPORT_POS.filter(po => {
        const invoicedAmount = po.invoices.reduce((s, i) => s + i.amount, 0);
        const paidAmount = po.invoices.reduce((s, i) => s + i.payments.reduce((sp, p) => sp + p.amount, 0), 0);
        return invoicedAmount >= po.amount && paidAmount < invoicedAmount;
      }).length },
      { label: "PO Revised After Issue", count: MOCK_REPORT_POS.filter(po => po.status === "Revised").length },
    ];
  }, []);

  return (
    <div style={{
      flex: 1,
      display: "flex",
      flexDirection: "column",
      background: "var(--neutral-background-primary)",
      height: "100%",
      overflowY: "auto",
      padding: "32px"
    }}>
      {/* Header */}
      <div style={{ marginBottom: "32px", display: "flex", alignItems: "center", gap: "10px" }}>
        <h1
          style={{
            margin: "0",
            fontSize: "var(--text-big-title)",
            fontWeight: "var(--font-weight-bold)",
            color: "var(--neutral-on-surface-primary)"
          }}
        >
          Procurement & AP Report
        </h1>
        <InfoTooltip content="Analytics are calculated from purchase orders with Issued and Completed status." />
      </div>

      {/* Top Summary Cards */}
      <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
        <SummaryCard
          label="Purchase Order"
          icon={ShoppingCart}
          onClick={() => onNavigate("analytics_po_report")}
          tooltip="Tracks your purchase orders, including invoicing progress and vendor payments."
        />
        <SummaryCard
          label="Vendor Liability"
          icon={Building2}
          onClick={() => onNavigate("analytics_vendor_liability_report")}
          tooltip="Shows the total amount owed to vendors from outstanding invoices."
        />
        <SummaryCard
          label="Accounts Payable Aging"
          icon={Calendar}
          onClick={() => onNavigate("analytics_ap_aging_report")}
          tooltip="Shows how long vendor payments have been outstanding, grouped by due date range."
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
        {/* Procurement Overview */}
        <div style={{ background: "var(--neutral-surface-primary)", borderRadius: "16px", padding: "24px", border: "1px solid var(--neutral-line-separator-1)", display: "flex", flexDirection: "column" }}>
          <SectionHeader title="Procurement Overview" tooltip="Shows the total purchase order value, invoiced amount, and payments made to vendors." />
          
          <div style={{ display: "flex", alignItems: "center", gap: "40px", flex: 1 }}>
            <RadialBarChart 
              totalValue={metrics.totalPoValue}
              centerLabel="PO Value"
              centerValue={`${(metrics.totalPoValue / 1e6).toFixed(1)}M`}
              size={180}
              items={[
                { label: "Paid to Vendor", value: metrics.totalPaidToVendor, color: "var(--status-green-primary)" },
                { label: "Total Invoiced", value: metrics.totalMatchedToInvoice, color: "var(--feature-brand-primary)" },
              ]}
            />
            
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center", 
                fontSize: "14px",
              }}>
                <span style={{ color: "var(--neutral-on-surface-secondary)", fontWeight: "500" }}>Total PO Value</span>
                <span style={{ color: "var(--neutral-on-surface-primary)", fontWeight: "700" }}>{formatCurrency(metrics.totalPoValue, currency)}</span>
              </div>
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center", 
                fontSize: "13px",
                paddingBottom: "10px",
                borderBottom: "1px solid var(--neutral-line-separator-2)",
                marginBottom: "4px"
              }}>
                <span style={{ color: "var(--neutral-on-surface-secondary)", fontWeight: "500" }}>Uninvoiced Amount</span>
                <span style={{ color: "var(--neutral-on-surface-primary)", fontWeight: "600" }}>{formatCurrency(metrics.totalPoValue - metrics.totalMatchedToInvoice, currency)}</span>
              </div>
              {[
                { label: "Total Invoiced", color: "var(--feature-brand-primary)", value: metrics.totalMatchedToInvoice },
                { label: "Paid to Vendor", color: "var(--status-green-primary)", value: metrics.totalPaidToVendor },
              ].map((item, idx) => (
                <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "10px", height: "10px", borderRadius: "2px", background: item.color }} />
                    <span style={{ color: "var(--neutral-on-surface-secondary)" }}>{item.label}</span>
                  </div>
                  <span style={{ fontWeight: "600", color: "var(--neutral-on-surface-primary)" }}>{formatCurrency(item.value, currency)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Vendor Liability Aging */}
        <div style={{ background: "var(--neutral-surface-primary)", borderRadius: "16px", padding: "24px", border: "1px solid var(--neutral-line-separator-1)", display: "flex", flexDirection: "column" }}>
          <SectionHeader title="Vendor Liability Aging" tooltip="Breaks down outstanding vendor payments based on how long they have been overdue." />
          <div style={{ display: "flex", alignItems: "center", gap: "40px", flex: 1 }}>
            <DonutChart 
              data={[
                { label: "Not Due", value: metrics.agingBuckets.notDue, color: "var(--feature-brand-primary)" },
                { label: "Late 1-30 days", value: metrics.agingBuckets.late1_30, color: "var(--status-yellow-primary)" },
                { label: "Late 31-60 days", value: metrics.agingBuckets.late31_60, color: "var(--status-orange-primary)" },
                { label: "Late 61-90 days", value: metrics.agingBuckets.late61_90, color: "#F06292" }, // Pink
                { label: "Late 90+ days", value: metrics.agingBuckets.late90Plus, color: "var(--status-red-primary)" },
              ]} 
              total={metrics.outstandingAp || 1} 
              centerLabel="Total Outstanding"
              centerValue={`${(metrics.outstandingAp / 1e6).toFixed(1)}M`}
              size={180}
              thickness={16}
            />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center", 
                fontSize: "14px",
                paddingBottom: "12px",
                borderBottom: "1px solid var(--neutral-line-separator-1)",
                marginBottom: "4px"
              }}>
                <span style={{ color: "var(--neutral-on-surface-secondary)", fontWeight: "500" }}>Total Outstanding</span>
                <span style={{ color: "var(--neutral-on-surface-primary)", fontWeight: "700" }}>{formatCurrency(metrics.outstandingAp, currency)}</span>
              </div>
              {[
                { label: "Not Due", color: "var(--feature-brand-primary)", value: metrics.agingBuckets.notDue },
                { label: "Late 1-30 days", color: "var(--status-yellow-primary)", value: metrics.agingBuckets.late1_30 },
                { label: "Late 31-60 days", color: "var(--status-orange-primary)", value: metrics.agingBuckets.late31_60 },
                { label: "Late 61-90 days", color: "#F06292", value: metrics.agingBuckets.late61_90 },
                { label: "Late 90+ days", color: "var(--status-red-primary)", value: metrics.agingBuckets.late90Plus },
              ].map((item, idx) => (
                <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "10px", height: "10px", borderRadius: "2px", background: item.color }} />
                    <span style={{ color: "var(--neutral-on-surface-secondary)" }}>{item.label}</span>
                  </div>
                  <span style={{ fontWeight: "600", color: "var(--neutral-on-surface-primary)" }}>{formatCurrency(item.value, currency)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        {/* Operational Attention */}
        <div style={{ background: "var(--neutral-surface-primary)", borderRadius: "16px", padding: "24px", border: "1px solid var(--neutral-line-separator-1)" }}>
          <SectionHeader title="Operational Attention" tooltip="Highlights purchase orders that may need follow-up, such as uninvoiced, partially invoiced, or unpaid orders." />
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {operationalIssues.map((issue, idx) => (
              <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "14px", color: "var(--neutral-on-surface-secondary)" }}>{issue.label}</span>
                <span style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "var(--neutral-on-surface-primary)"
                }}>
                  {issue.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Finance Insights */}
        <div style={{ background: "var(--neutral-surface-primary)", borderRadius: "16px", padding: "24px", border: "1px solid var(--neutral-line-separator-1)" }}>
          <SectionHeader title="Finance Insights" tooltip="Summarizes key vendor payment metrics, including overdue exposure and upcoming due invoices." />
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {[
              { label: "Total Outstanding Liability", value: formatCurrency(metrics.outstandingAp, currency) },
              { label: "Overdue Percentage", value: `${metrics.overduePercentage.toFixed(2)}%`, isAlert: metrics.overduePercentage > 0 },
              { label: "Largest Vendor Exposure", value: metrics.largestVendor[0] },
              { label: "Upcoming Due Invoices (7 days)", value: metrics.invoicesDueSoonCount },
            ].map((item, idx) => (
              <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "14px", color: "var(--neutral-on-surface-secondary)" }}>{item.label}</span>
                <span style={{ 
                  fontSize: "14px", 
                  fontWeight: "600", 
                  color: item.isAlert ? "var(--status-red-primary)" : "var(--neutral-on-surface-primary)" 
                }}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export { ProcurementAPReportPage };
