import React from "react";

// Local section/card/table style helpers for the Bill of Materials module,
// mirroring the pattern in modules/purchase-order/components/detail/shared/PoDetailSharedComponents.jsx
// (kept module-local rather than imported cross-module, per that file's own convention).

// Same ABC classification pill used in modules/materials/pages/MaterialsListPage.jsx
// (getABCBadge) — copied rather than imported since that helper isn't exported
// from a shared location.
export const AbcClassificationBadge = ({ classification }) => {
  let color = "var(--status-grey-primary)";
  let bg = "var(--status-grey-container)";

  if (classification === "A") {
    color = "var(--status-red-primary)";
    bg = "var(--status-red-container)";
  } else if (classification === "B") {
    color = "var(--feature-brand-primary)";
    bg = "var(--feature-brand-container-lighter)";
  } else if (classification === "C") {
    color = "var(--status-green-primary)";
    bg = "var(--status-green-container)";
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        padding: "4px 12px",
        borderRadius: "var(--radius-full)",
        background: bg,
        width: "fit-content",
      }}
    >
      <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: color }} />
      <span style={{ fontSize: "var(--text-body)", fontWeight: "var(--font-weight-bold)", color }}>
        {classification}
      </span>
    </div>
  );
};

export const SectionCard = ({ title, children, rightAction }) => (
  <div
    style={{
      background: "var(--neutral-surface-primary)",
      borderRadius: "var(--radius-card)",
      border: "1px solid var(--neutral-line-separator-1)",
      padding: "24px",
      display: "flex",
      flexDirection: "column",
      gap: "24px",
    }}
  >
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <div
          style={{
            width: "4px",
            height: "20px",
            background: "var(--feature-brand-primary)",
            borderRadius: "2px",
          }}
        />
        <h2
          style={{
            margin: 0,
            fontSize: "var(--text-title-1)",
            fontWeight: "var(--font-weight-bold)",
            color: "var(--neutral-on-surface-primary)",
          }}
        >
          {title}
        </h2>
      </div>
      {rightAction ? <div>{rightAction}</div> : null}
    </div>
    {children}
  </div>
);

// Card matching the Purchase Order detail page's section pattern (bordered,
// radius 16px, bold title with no accent bar) — see
// modules/purchase-order/pages/PurchaseOrderDetailPage.jsx "Purchase Order
// Lines" / "Summary" sections. Distinct from SectionCard (accent bar),
// which is still used on the BOM create/edit form.
export const DetailCard = ({ title, children, rightAction }) => (
  <div
    style={{
      background: "var(--neutral-surface-primary)",
      borderRadius: "16px",
      border: "1px solid var(--neutral-line-separator-1)",
      overflow: "hidden",
    }}
  >
    {title ? (
      <div
        style={{
          padding: "24px 24px 0 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <span style={{ fontSize: "var(--text-title-2)", fontWeight: "var(--font-weight-bold)" }}>{title}</span>
        {rightAction ? <div>{rightAction}</div> : null}
      </div>
    ) : null}
    <div style={{ padding: "20px 24px 24px 24px", display: "flex", flexDirection: "column", gap: "24px" }}>
      {children}
    </div>
  </div>
);

// Grid-table style helpers matching the "Purchase Order Lines" table layout
// (header row with a bottom-border rule, rows separated by borders, no
// individually-boxed table shell).
export const detailTableHeaderRowStyle = (gridTemplateColumns) => ({
  display: "grid",
  gridTemplateColumns,
  gap: "8px",
  padding: "0 16px",
  height: "49px",
  alignItems: "center",
  position: "relative",
  width: "100%",
  boxSizing: "border-box",
  fontSize: "var(--text-title-3)",
  fontWeight: "var(--font-weight-bold)",
  color: "var(--neutral-on-surface-primary)",
  borderBottom: "1px solid var(--neutral-line-separator-1)",
});

export const detailTableRowStyle = (gridTemplateColumns, isLast) => ({
  display: "grid",
  gridTemplateColumns,
  gap: "8px",
  padding: "0 16px",
  minHeight: "64px",
  alignItems: "center",
  width: "100%",
  boxSizing: "border-box",
  borderBottom: isLast ? "none" : "1px solid var(--neutral-line-separator-1)",
});

export const LabelValue = ({ label, value }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
    <span style={{ fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-tertiary)" }}>
      {label}
    </span>
    <span
      style={{
        fontSize: "var(--text-title-2)",
        fontWeight: "var(--font-weight-medium)",
        color: "var(--neutral-on-surface-primary)",
      }}
    >
      {value ?? "-"}
    </span>
  </div>
);

export const cellStyle = (overrides) => ({
  minWidth: 0,
  height: "56px",
  padding: "0 12px",
  display: "flex",
  alignItems: "center",
  fontSize: "var(--text-title-3)",
  color: "var(--neutral-on-surface-primary)",
  ...overrides,
});

export const systemTableShellStyle = {
  display: "flex",
  flexDirection: "column",
  border: "1px solid var(--neutral-line-separator-1)",
  borderRadius: "12px",
  overflow: "hidden",
  background: "var(--neutral-surface-primary)",
};

export const systemTableHeaderCellStyle = (overrides = {}) => ({
  minWidth: 0,
  height: "49px",
  display: "flex",
  alignItems: "center",
  padding: "0 12px",
  fontSize: "var(--text-title-3)",
  fontWeight: "var(--font-weight-bold)",
  color: "var(--neutral-on-surface-primary)",
  boxSizing: "border-box",
  ...overrides,
});

export const systemTableCellStyle = (overrides = {}) => ({
  minWidth: 0,
  minHeight: "56px",
  display: "flex",
  alignItems: "center",
  padding: "0 12px",
  fontSize: "var(--text-title-3)",
  color: "var(--neutral-on-surface-primary)",
  boxSizing: "border-box",
  ...overrides,
});

export const systemTableEmptyStateStyle = {
  padding: "32px 24px",
  textAlign: "center",
  fontSize: "var(--text-title-3)",
  color: "var(--neutral-on-surface-tertiary)",
};
