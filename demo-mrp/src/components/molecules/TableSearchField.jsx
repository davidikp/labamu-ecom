import React, { useState } from "react";
import { SearchIcon } from "../icons/Icons.jsx";

const TableSearchField = ({
  value = "",
  onChange,
  placeholder,
  width = "360px",
  minWidth = "280px",
  fontSize = "14px",
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div
      className="ds-table-search"
      style={{
        display: "flex",
        alignItems: "center",
        width: width,
        minWidth: minWidth,
        height: "36px", // FE Ref search inputs usually 36px (h-9)
        padding: "0 12px",
        gap: "8px",
        background: "var(--neutral-surface-primary)",
        border: `1px solid ${isFocused ? "var(--feature-brand-primary)" : "var(--neutral-line-separator-1)"}`,
        borderRadius: "8px", // rounded-lb-sm
        transition: "border-color 0.15s ease",
      }}
    >
      <SearchIcon
        size={16}
        color="var(--neutral-on-surface-tertiary)"
        style={{ flexShrink: 0 }}
      />
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={{
          flex: 1,
          border: "none",
          outline: "none",
          background: "transparent",
          fontSize: fontSize,
          color: value
            ? "var(--neutral-on-surface-primary)"
            : "var(--neutral-on-surface-secondary)",
          minWidth: 0,
        }}
      />
    </div>
  );
};

export { TableSearchField };
