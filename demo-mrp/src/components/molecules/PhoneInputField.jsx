import React, { useState } from "react";
import { COUNTRY_CODE_OPTIONS } from "../../constants/appConstants.js";
import { ChevronDownIcon } from "../icons/Icons.jsx";
import { TableSearchField } from "./TableSearchField.jsx";
import { FormField } from "./FormField.jsx";
import {
  UnifiedInputShell,
  baseInputBorderColor,
  blurInputFrame,
  focusInputFrame,
} from "../atoms/index.js";

export const PhoneInputField = ({
  label,
  required = false,
  value = "",
  onChange,
  disabled,
  error,
  helperText,
}) => {
  const normalizePhoneValue = (input) => {
    if (!input) return { countryCode: "+62", number: "" };
    const matched = COUNTRY_CODE_OPTIONS.find(
      (opt) => input.startsWith(`${opt.code} `) || input === opt.code
    );
    if (matched) {
      const nextNumber = input
        .replace(`${matched.code} `, "")
        .replace(matched.code, "")
        .trim();
      return { countryCode: matched.code, number: nextNumber };
    }
    return { countryCode: "+62", number: input.trim() };
  };

  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0, width: 300, placement: "bottom" });
  const parsedValue = normalizePhoneValue(value);
  const selectedOption =
    COUNTRY_CODE_OPTIONS.find((opt) => opt.code === parsedValue.countryCode) ||
    COUNTRY_CODE_OPTIONS[0];
  const filteredOptions = COUNTRY_CODE_OPTIONS.filter((opt) => {
    const q = search.toLowerCase();
    return (
      opt.code.toLowerCase().includes(q) || opt.label.toLowerCase().includes(q)
    );
  });

  const emitChange = (nextCountryCode, nextNumber) => {
    const composed = nextNumber?.trim()
      ? `${nextCountryCode} ${nextNumber.trim()}`
      : nextCountryCode;
    onChange?.(composed);
  };

  const updatePopoverPosition = (el) => {
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const estimatedHeight = 400;
    const padding = 12;
    const openAbove = 
      window.innerHeight - rect.bottom < estimatedHeight + 16 &&
      rect.top > estimatedHeight + 16;
    
    setPopoverPos({
      top: openAbove ? rect.top - estimatedHeight - padding : rect.bottom + padding,
      left: Math.min(rect.left, window.innerWidth - 316),
      width: Math.min(300, window.innerWidth - 32),
      placement: openAbove ? "top" : "bottom",
    });
  };

  return (
    <FormField
      label={label}
      required={required}
      error={error}
      helperText={helperText}
    >
      <UnifiedInputShell
        disabled={disabled}
        hasError={!!error}
        style={{ position: "relative", zIndex: isOpen ? 200 : "auto" }}
        onFocus={(e) => focusInputFrame(e.currentTarget)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) {
            blurInputFrame(e.currentTarget, !!disabled, !!error);
          }
        }}
      >
        <div style={{ position: "relative", flexShrink: 0 }}>
          <button
            type="button"
            disabled={disabled}
            onClick={(e) => {
              if (disabled) return;
              const nextOpen = !isOpen;
              if (nextOpen) updatePopoverPosition(e.currentTarget);
              setIsOpen(nextOpen);
            }}
            style={{
              background: "transparent",
              border: "none",
              padding: 0,
              display: "flex",
              alignItems: "center",
              gap: "8px",
              cursor: disabled ? "not-allowed" : "pointer",
              color: disabled
                ? "var(--neutral-on-surface-tertiary)"
                : "var(--neutral-on-surface-primary)",
              fontSize: "var(--text-subtitle-1)",
              fontFamily: "Lato, sans-serif",
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: "18px", lineHeight: 1 }}>
              {selectedOption.flag}
            </span>
            <span style={{ whiteSpace: "nowrap" }}>{selectedOption.code}</span>
            <ChevronDownIcon
              size={18}
              color="var(--neutral-on-surface-secondary)"
              style={{
                transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s ease",
              }}
            />
          </button>

          {isOpen && !disabled ? (
            <>
              <div
                style={{ position: "fixed", inset: 0, zIndex: 9998 }}
                onClick={() => {
                  setIsOpen(false);
                  setSearch("");
                }}
              />
              <div
                style={{
                  position: "fixed",
                  top: `${popoverPos.top}px`,
                  left: `${popoverPos.left}px`,
                  width: `${popoverPos.width}px`,
                  maxHeight: "400px",
                  display: "flex",
                  flexDirection: "column",
                  background: "var(--neutral-surface-primary)",
                  border: `1px solid ${baseInputBorderColor}`,
                  borderRadius: "16px",
                  boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.12)",
                  zIndex: 9999,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    padding: "16px 20px",
                    borderBottom: `1px solid ${baseInputBorderColor}`,
                  }}
                >
                  <TableSearchField
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search country or code..."
                    width="100%"
                    minWidth="0"
                    fontSize="14px"
                  />
                </div>
                <div style={{ maxHeight: "320px", overflowY: "auto" }}>
                  {filteredOptions.map((opt, index) => (
                    <div
                      key={opt.code}
                      onClick={() => {
                        emitChange(opt.code, parsedValue.number);
                        setIsOpen(false);
                        setSearch("");
                      }}
                      onMouseEnter={(e) =>
                      (e.currentTarget.style.background =
                        "var(--neutral-surface-grey-lighter)")
                      }
                      onMouseLeave={(e) =>
                      (e.currentTarget.style.background =
                        "var(--neutral-surface-primary)")
                      }
                      style={{
                        borderTop:
                          index === 0
                            ? "none"
                            : `1px solid ${baseInputBorderColor}`,
                        padding: "12px 20px",
                        display: "flex",
                        alignItems: "center",
                        gap: "14px",
                        cursor: "pointer",
                      }}
                    >
                      <span style={{ fontSize: "20px", lineHeight: 1 }}>
                        {opt.flag}
                      </span>
                      <span
                        style={{
                          fontSize: "14px",
                          color: "var(--neutral-on-surface-primary)",
                          minWidth: "44px",
                        }}
                      >
                        {opt.code}
                      </span>
                      <span
                        style={{
                          fontSize: "14px",
                          color: "var(--neutral-on-surface-secondary)",
                        }}
                      >
                        {opt.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : null}
        </div>
        <input
          type="text"
          placeholder="Input phone number"
          value={parsedValue.number}
          onChange={(e) => {
            let nextValue = e.target.value;
            if (nextValue.startsWith("0")) {
              nextValue = nextValue.slice(1);
            }
            emitChange(selectedOption.code, nextValue);
          }}
          disabled={disabled}
          style={{
            flex: 1,
            height: "100%",
            minWidth: 0,
            border: "none",
            outline: "none",
            padding: 0,
            background: "transparent",
            fontSize: "var(--text-subtitle-1)",
            color: disabled
              ? "var(--neutral-on-surface-tertiary)"
              : parsedValue.number
                ? "var(--neutral-on-surface-primary)"
                : "var(--neutral-on-surface-tertiary)",
            fontFamily: "Lato, sans-serif",
          }}
        />
      </UnifiedInputShell>
    </FormField>
  );
};
