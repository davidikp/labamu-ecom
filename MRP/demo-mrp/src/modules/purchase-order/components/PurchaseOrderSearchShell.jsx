import React from "react";

export const PurchaseOrderSearchShell = ({
  children,
  disabled = false,
  hasError = false,
  style = {},
}) => (
  <div
    style={{
      minHeight: "46px",
      height: "auto",
      width: "100%",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      border: `1px solid ${hasError
          ? "var(--status-red-primary)"
          : disabled
            ? "var(--neutral-line-outline)"
            : "#e9e9e9"
        }`,
      borderRadius: "10px",
      background: disabled
        ? "var(--neutral-surface-grey-lighter)"
        : "var(--neutral-surface-primary)",
      padding: "0 16px",
      transition: "border-color 0.2s ease, box-shadow 0.2s ease",
      boxSizing: "border-box",
      overflow: "visible",
      ...style,
    }}
  >
    {children}
  </div>
);
