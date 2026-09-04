import React from "react";
import { ChevronDownIcon } from "../icons/Icons.jsx";

const FilterPill = ({ label, active = false, isOpen = false, count = 0, size = "sm" }) => {
  const isHighlighted = active || isOpen;
  const showCount = active && count > 0;

  const isLg = size === "lg";
  const height = isLg ? "48px" : "36px";
  const padding = showCount 
    ? (isLg ? "0 16px 0 12px" : "0 12px 0 8px") 
    : (isLg ? "0 16px" : "0 12px");
  const fontSize = isLg ? "15px" : "13px";
  const gap = "8px";
  const badgeSize = isLg ? "24px" : "20px";
  const badgeFontSize = isLg ? "12px" : "11px";

  return (
    <div
      className="ds-filter-pill"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: gap,
        height: height,
        padding: padding,
        borderRadius: "8px",
        fontSize: fontSize,
        fontWeight: "400",
        whiteSpace: "nowrap",
        cursor: "pointer",
        background: "var(--neutral-surface-primary)",
        border: `1px solid ${isHighlighted ? "var(--feature-brand-primary)" : "var(--neutral-line-separator-2)"}`,
        color: isHighlighted ? "var(--feature-brand-primary)" : "var(--neutral-on-surface-tertiary)",
        transition: "all 0.15s ease",
      }}
      onMouseEnter={(e) => {
        if (!isHighlighted) e.currentTarget.style.borderColor = "var(--feature-brand-primary)";
      }}
      onMouseLeave={(e) => {
        if (!isHighlighted) e.currentTarget.style.borderColor = "var(--neutral-line-separator-2)";
      }}
    >
      {showCount ? (
        <span
          className="ds-filter-pill__count"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: badgeSize,
            height: badgeSize,
            borderRadius: "50%",
            background: "var(--feature-brand-primary)",
            color: "#FFFFFF",
            fontSize: badgeFontSize,
            fontWeight: "bold",
            flexShrink: 0,
          }}
        >
          {count}
        </span>
      ) : null}
      <span style={{ lineHeight: "1" }}>{label}</span>
      <ChevronDownIcon
        size={isLg ? 18 : 16}
        color="currentColor"
        style={{
          transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          transition: "transform 0.2s ease",
          flexShrink: 0,
        }}
      />
    </div>
  );
};

export { FilterPill };
