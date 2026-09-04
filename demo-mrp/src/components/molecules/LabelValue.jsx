import React from "react";
import { StatusBadge } from "../atoms/StatusBadge.jsx";

export const LabelValue = ({ label, value, badge }) => {
  const displayValue =
    typeof value === "object" && value !== null ? JSON.stringify(value) : value;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <span
        style={{
          fontSize: "var(--text-body)",
          color: "var(--neutral-on-surface-secondary)",
        }}
      >
        {label}
      </span>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {badge ? (
          <StatusBadge variant={badge.variant}>{badge.text}</StatusBadge>
        ) : (
          <span
            style={{
              fontSize: "var(--text-title-3)",
              fontWeight: "var(--font-weight-bold)",
              color: "var(--neutral-on-surface-primary)",
            }}
          >
            {displayValue}
          </span>
        )}
      </div>
    </div>
  );
};
