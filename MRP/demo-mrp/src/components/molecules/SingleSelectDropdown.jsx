import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDownIcon } from "../icons/Icons.jsx";

export const SingleSelectDropdown = ({
  value,
  onChange,
  options = [],
  placeholder = "Select",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const popoverRef = useRef(null);
  const [popoverStyle, setPopoverStyle] = useState({});

  useEffect(() => {
    const handleOutside = (e) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target) &&
        popoverRef.current &&
        !popoverRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setPopoverStyle({ top: rect.bottom + 8, left: rect.left, width: "200px" });
    }
  }, [isOpen]);

  const selectedLabel = options.find((o) => o.value === value)?.label || placeholder;
  const hasValue = value != null;

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          height: "40px",
          padding: "0 16px",
          borderRadius: "8px",
          border: `1px solid ${isOpen ? "var(--feature-brand-primary)" : "var(--neutral-line-separator-1)"}`,
          background: "var(--neutral-surface-primary)",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          cursor: "pointer",
          transition: "border-color 0.15s ease",
        }}
      >
        <span style={{
          fontSize: "var(--text-title-3)",
          fontWeight: isOpen ? "bold" : "normal",
          color: isOpen ? "var(--feature-brand-primary)" : "var(--neutral-on-surface-primary)",
          whiteSpace: "nowrap",
        }}>
          {selectedLabel}
        </span>
        <ChevronDownIcon
          size={16}
          color={isOpen ? "var(--feature-brand-primary)" : "var(--neutral-on-surface-secondary)"}
          style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
        />
      </button>

      {isOpen && typeof document !== "undefined" && createPortal(
        <div
          ref={popoverRef}
          style={{
            position: "fixed",
            top: popoverStyle.top,
            left: popoverStyle.left,
            width: popoverStyle.width,
            background: "white",
            border: "1px solid var(--neutral-line-separator-1)",
            borderRadius: "8px",
            boxShadow: "0px 4px 12px rgba(0,0,0,0.08)",
            zIndex: 100000,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ padding: "12px 16px" }}>
            <span style={{ fontWeight: "bold", fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-primary)" }}>{placeholder}</span>
          </div>
          <div style={{ overflowY: "auto", padding: "8px", maxHeight: "176px" }}>
            {options.map((opt) => (
              <div
                key={opt.value}
                onClick={() => { onChange(opt.value); setIsOpen(false); }}
                style={{
                  display: "flex", alignItems: "center", padding: "10px 12px",
                  cursor: "pointer", borderRadius: "8px",
                  background: value === opt.value ? "var(--feature-brand-container-lighter)" : "transparent",
                  transition: "background 0.2s",
                  fontSize: "var(--text-title-3)",
                  fontWeight: value === opt.value ? "bold" : "normal",
                  color: value === opt.value ? "var(--feature-brand-primary)" : "var(--neutral-on-surface-primary)",
                }}
                onMouseEnter={(e) => {
                  if (value !== opt.value) e.currentTarget.style.background = "var(--neutral-surface-grey-lighter)";
                }}
                onMouseLeave={(e) => {
                  if (value !== opt.value) e.currentTarget.style.background = "transparent";
                }}
              >
                {opt.label}
              </div>
            ))}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
