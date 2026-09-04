import React, { useState } from "react";
import { createPortal } from "react-dom";
import { SearchIcon } from "../icons/Icons.jsx";
import { Checkbox } from "../atoms/Checkbox.jsx";

/**
 * Shared popover for multi-select checkbox filters.
 * Rendered via portal so it escapes overflow:hidden parents (drawers, tables).
 */
export const FilterPopoverCheckbox = ({
  title,
  options = [],      // [{ value, label, subLabel? }]
  value = [],        // selected values
  onChange,
  onClose,
  triggerRect,       // DOMRect from getBoundingClientRect()
  searchable = true,
  width = "320px",
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const visible = searchable && searchTerm
    ? options.filter((o) => {
        const q = searchTerm.toLowerCase();
        return o.label.toLowerCase().includes(q) || (o.subLabel && o.subLabel.toLowerCase().includes(q));
      })
    : options;

  const toggle = (val) => {
    onChange(value.includes(val) ? value.filter((v) => v !== val) : [...value, val]);
  };

  const top = triggerRect ? triggerRect.bottom + 8 : 160;
  const left = triggerRect ? triggerRect.left : 0;

  return createPortal(
    <>
      {/* Backdrop */}
      <div style={{ position: "fixed", inset: 0, zIndex: 99998 }} onClick={onClose} />

      {/* Popover */}
      <div
        style={{
          position: "fixed",
          top,
          left,
          width,
          background: "var(--neutral-surface-primary)",
          border: "1px solid var(--neutral-line-separator-1)",
          borderRadius: "var(--radius-card)",
          boxShadow: "var(--elevation-sm)",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          zIndex: 99999,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "var(--text-title-2)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>
            {title}
          </span>
          <button
            onClick={() => { onChange([]); onClose(); }}
            style={{ background: "none", border: "none", padding: 0, color: "var(--status-red-primary)", cursor: "pointer", fontSize: "var(--text-body)", fontWeight: "var(--font-weight-bold)" }}
          >
            Remove Filter
          </button>
        </div>

        {/* Search */}
        {searchable && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "var(--neutral-surface-grey-lighter)", padding: "8px 12px", borderRadius: "8px" }}>
            <SearchIcon size={16} color="var(--neutral-on-surface-tertiary)" />
            <input
              autoFocus
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ border: "none", background: "none", outline: "none", width: "100%", fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-primary)" }}
            />
          </div>
        )}

        {/* Options */}
        <div style={{ display: "flex", flexDirection: "column", gap: "4px", maxHeight: "240px", overflowY: "auto" }}>
          {visible.length === 0 ? (
            <div style={{ padding: "12px 0", textAlign: "center", color: "var(--neutral-on-surface-tertiary)", fontSize: "var(--text-title-3)" }}>No options found</div>
          ) : visible.map((opt) => (
            <label
              key={opt.value}
              onClick={() => toggle(opt.value)}
              style={{
                display: "flex", alignItems: "center", gap: "12px", padding: "8px 4px",
                cursor: "pointer", borderRadius: "6px",
                background: value.includes(opt.value) ? "var(--feature-brand-container-lighter)" : "transparent",
              }}
            >
              <Checkbox checked={value.includes(opt.value)} onChange={() => toggle(opt.value)} />
              <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
                <span style={{ fontSize: "var(--text-title-3)", fontWeight: value.includes(opt.value) ? "var(--font-weight-semi-bold)" : "normal", color: "var(--neutral-on-surface-primary)" }}>
                  {opt.label}
                </span>
                {opt.subLabel && (
                  <span style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-tertiary)" }}>{opt.subLabel}</span>
                )}
              </div>
            </label>
          ))}
        </div>
      </div>
    </>,
    document.body
  );
};
