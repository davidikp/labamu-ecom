import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

// A select field you can type directly into to filter (rather than opening a
// separate search box inside the popover, like ce-ui's Dropdown does). The
// option list is portaled to document.body and positioned with a fixed
// bounding-box lookup so it always renders above modal content instead of
// being clipped by the modal's overflow.
export const SearchableSelectField = ({ label, required, value, onChange, options, placeholder, disabled }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef(null);
  const [menuStyle, setMenuStyle] = useState({});

  const selectedLabel = options.find((o) => o.value === value)?.label || "";

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  useEffect(() => {
    const handleOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  useEffect(() => {
    if (!open || !containerRef.current) return;
    const updatePosition = () => {
      const rect = containerRef.current.getBoundingClientRect();
      setMenuStyle({ position: "fixed", top: rect.bottom + 4, left: rect.left, width: rect.width, zIndex: 10000 });
    };
    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open]);

  const filtered = query ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase())) : options;

  const handleSelect = (opt) => {
    onChange(opt.value);
    setQuery("");
    setOpen(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px", width: "100%" }}>
      {label ? (
        <div style={{ display: "flex", gap: "4px" }}>
          {required ? <span style={{ color: "var(--status-red-primary)", fontSize: "14px" }}>*</span> : null}
          <span style={{ fontSize: "14px", color: "var(--neutral-on-surface-primary)" }}>{label}</span>
        </div>
      ) : null}
      <div ref={containerRef} style={{ position: "relative", width: "100%" }}>
        <input
          value={open ? query : selectedLabel}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!open) setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          style={{
            width: "100%",
            height: "48px",
            padding: "0 16px",
            borderRadius: "8px",
            border: `1px solid ${open ? "var(--feature-brand-primary)" : "var(--neutral-line-separator-1)"}`,
            fontSize: "14px",
            color: "var(--neutral-on-surface-primary)",
            outline: "none",
            boxSizing: "border-box",
            background: disabled ? "var(--neutral-surface-grey-lighter)" : "var(--neutral-surface-primary)",
          }}
        />
      </div>
      {open && !disabled && typeof document !== "undefined"
        ? createPortal(
            <div
              style={{
                ...menuStyle,
                background: "var(--neutral-surface-primary)",
                border: "1px solid var(--neutral-line-separator-1)",
                borderRadius: "8px",
                boxShadow: "0px 4px 12px rgba(0,0,0,0.12)",
                maxHeight: "260px",
                overflowY: "auto",
                padding: "4px",
              }}
            >
              {filtered.length ? (
                filtered.map((opt) => (
                  <div
                    key={opt.value}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelect(opt);
                    }}
                    onMouseEnter={(e) => {
                      if (opt.value !== value) e.currentTarget.style.background = "var(--neutral-surface-grey-lighter)";
                    }}
                    onMouseLeave={(e) => {
                      if (opt.value !== value) e.currentTarget.style.background = "transparent";
                    }}
                    style={{
                      padding: "10px 12px",
                      borderRadius: "6px",
                      fontSize: "14px",
                      cursor: "pointer",
                      background: opt.value === value ? "var(--feature-brand-container-lighter)" : "transparent",
                      color: opt.value === value ? "var(--feature-brand-primary)" : "var(--neutral-on-surface-primary)",
                    }}
                  >
                    {opt.label}
                  </div>
                ))
              ) : (
                <div style={{ padding: "10px 12px", fontSize: "14px", color: "var(--neutral-on-surface-tertiary)" }}>
                  No results
                </div>
              )}
            </div>,
            document.body
          )
        : null}
    </div>
  );
};
