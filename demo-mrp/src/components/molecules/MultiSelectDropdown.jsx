import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDownIcon, SearchIcon } from "../icons/Icons.jsx";
import { Checkbox } from "../atoms/Checkbox.jsx";

export const MultiSelectDropdown = ({
  value = [],
  onChange,
  options = [],
  placeholder = "Select options",
  searchable = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
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
      // Position the popover slightly above the button to match "filter popover should be at the top" request
      // Position the popover below the button
      const topPos = rect.bottom + 8; 
      
      setPopoverStyle({
        top: topPos,
        left: rect.left,
        width: "280px"
      });
    } else {
      setSearchTerm("");
    }
  }, [isOpen]);

  const visibleOptions = searchable && searchTerm
    ? options.filter(opt => {
        const q = searchTerm.toLowerCase();
        return opt.value !== "all" && (
          opt.label.toLowerCase().includes(q) ||
          (opt.subLabel && opt.subLabel.toLowerCase().includes(q))
        );
      })
    : options.filter(opt => opt.value !== "all");

  const toggleOption = (val) => {
    if (value.includes(val)) {
      onChange(value.filter(v => v !== val));
    } else {
      onChange([...value, val]);
    }
  };

  const hasValue = value.length > 0;

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          height: "40px",
          padding: "0 16px",
          borderRadius: "8px",
          border: `1px solid ${hasValue || isOpen ? "var(--feature-brand-primary)" : "var(--neutral-line-separator-1)"}`,
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
          fontWeight: hasValue || isOpen ? "bold" : "normal",
          color: hasValue || isOpen ? "var(--feature-brand-primary)" : "#A1A1A1",
          whiteSpace: "nowrap",
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}>
          {hasValue && (
            <div style={{
              background: "var(--feature-brand-primary)",
              color: "white",
              borderRadius: "50%",
              width: "20px",
              height: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "11px",
              fontWeight: "bold"
            }}>
              {value.length}
            </div>
          )}
          {placeholder}
        </span>
        <ChevronDownIcon size={16} color={hasValue || isOpen ? "var(--feature-brand-primary)" : "var(--neutral-on-surface-secondary)"} style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
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
          <div style={{ padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: "bold", fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-primary)" }}>{placeholder}</span>
            {hasValue && (
              <button onClick={() => onChange([])} style={{ border: "none", background: "none", color: "var(--status-red-primary)", fontSize: "12px", fontWeight: "bold", cursor: "pointer" }}>
                Remove Filter
              </button>
            )}
          </div>
          {searchable && (
            <div style={{ padding: "0 16px 8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "var(--neutral-surface-grey-lighter)", padding: "8px 12px", borderRadius: "8px" }}>
                <SearchIcon size={16} color="var(--neutral-on-surface-tertiary)" />
                <input 
                  autoFocus
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  style={{ border: "none", background: "none", outline: "none", width: "100%", fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-primary)" }}
                />
              </div>
            </div>
          )}
          <div style={{ overflowY: "auto", padding: "8px", maxHeight: "176px" }}>
            {visibleOptions.length > 0 ? visibleOptions.map(opt => (
              <div 
                key={opt.value}
                onClick={() => toggleOption(opt.value)}
                style={{
                  display: "flex", alignItems: "center", gap: "12px", padding: "10px 12px",
                  cursor: "pointer", borderRadius: "8px",
                  background: value.includes(opt.value) ? "var(--feature-brand-container-lighter)" : "transparent",
                  transition: "background 0.2s"
                }}
                onMouseEnter={e => {
                  if (!value.includes(opt.value)) e.currentTarget.style.background = "var(--neutral-surface-grey-lighter)";
                }}
                onMouseLeave={e => {
                  if (!value.includes(opt.value)) e.currentTarget.style.background = "transparent";
                }}
              >
                <Checkbox checked={value.includes(opt.value)} onChange={() => toggleOption(opt.value)} />
                <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
                  <span style={{ fontSize: "var(--text-title-3)", fontWeight: value.includes(opt.value) ? "bold" : "normal", color: "var(--neutral-on-surface-primary)" }}>{opt.label}</span>
                  {opt.subLabel && (
                    <span style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-tertiary)" }}>{opt.subLabel}</span>
                  )}
                </div>
              </div>
            )) : (
              <div style={{ padding: "16px", textAlign: "center", color: "var(--neutral-on-surface-secondary)", fontSize: "var(--text-title-3)" }}>
                No options found
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
