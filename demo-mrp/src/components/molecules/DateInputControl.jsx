import React, { useState, useEffect, useRef } from "react";
import { DATE_PICKER_MONTHS, DATE_PICKER_POPOVER_WIDTH, DATE_PICKER_WEEKDAYS } from "../../constants/appConstants.js";
import {
  buildCalendarDays,
  formatIsoDateString,
  parseIsoDateString,
} from "../../utils/date/dateUtils.js";
import { createSyntheticInputEvent } from "../../utils/upload/uploadUtils.js";
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon, CloseIcon } from "../icons/Icons.jsx";
import { baseInputBorderColor } from "../atoms/index.js";

export const DateInputControl = ({
  value = "",
  onChange,
  disabled = false,
  hasError = false,
  placeholder = "yyyy-mm-dd",
  fieldHeight = "48px",
  borderRadius = "10px",
  fontSize = "var(--text-subtitle-1)",
  style = {},
  minDate,
  maxDate,
}) => {
  const triggerRef = useRef(null);
  const popoverRef = useRef(null);
  const todayIso = formatIsoDateString(new Date());
  const selectedDate = parseIsoDateString(value);
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(
    selectedDate || parseIsoDateString(todayIso) || new Date()
  );
  const [popoverPos, setPopoverPos] = useState({
    top: 0,
    left: 0,
    width: 360,
    placement: "bottom",
  });
  const [selectionMode, setSelectionMode] = useState("days"); // "days", "months", "years"

  const updatePopoverPosition = () => {
    if (!triggerRef.current || typeof window === "undefined") return;
    const rect = triggerRef.current.getBoundingClientRect();
    const width = Math.max(
      360,
      Math.min(DATE_PICKER_POPOVER_WIDTH, window.innerWidth - 16)
    );
    const estimatedHeight = 360;
    const openAbove =
      window.innerHeight - rect.bottom < estimatedHeight + 16 &&
      rect.top > estimatedHeight + 16;
    const maxLeft = Math.max(8, window.innerWidth - width - 8);
    const leftAlign = rect.left;
    const left = Math.min(Math.max(8, leftAlign), maxLeft);
    setPopoverPos({
      left,
      top: openAbove ? rect.top - 8 : rect.bottom + 8,
      width,
      placement: openAbove ? "top" : "bottom",
    });
  };

  useEffect(() => {
    if (!isOpen) return;
    updatePopoverPosition();

    const handlePointerDown = (event) => {
      if (
        triggerRef.current?.contains(event.target) ||
        popoverRef.current?.contains(event.target)
      ) {
        return;
      }
      setIsOpen(false);
    };

    const handleViewportChange = () => updatePopoverPosition();

    document.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
    };
  }, [isOpen]);

  const calendarDays = buildCalendarDays(viewDate);
  const monthLabel = DATE_PICKER_MONTHS[viewDate.getMonth()];
  const yearLabel = viewDate.getFullYear();

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => {
          if (disabled) return;
          setViewDate(selectedDate || new Date());
          setIsOpen((prev) => !prev);
        }}
        style={{
          width: "100%",
          height: fieldHeight,
          border: `1px solid ${
            hasError
              ? "var(--status-red-primary)"
              : isOpen
                ? "var(--feature-brand-primary)"
                : disabled
                  ? "var(--neutral-line-outline)"
                  : baseInputBorderColor
          }`,
          borderRadius,
          background: disabled
            ? "var(--neutral-surface-grey-lighter)"
            : "var(--neutral-surface-primary)",
          boxShadow: isOpen ? "0 0 0 3px rgba(0, 104, 255, 0.08)" : "none",
          padding: "0 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          cursor: disabled ? "not-allowed" : "pointer",
          textAlign: "left",
          transition: "border-color 0.2s ease, box-shadow 0.2s ease",
          ...style,
        }}
      >
        <span
          style={{
            fontSize,
            color: disabled
              ? "var(--neutral-on-surface-tertiary)"
              : value
                ? "var(--neutral-on-surface-primary)"
                : "var(--neutral-on-surface-tertiary)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {value || placeholder}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {value && !disabled && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                if (onChange) onChange(createSyntheticInputEvent(""));
              }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "2px",
                borderRadius: "50%",
                background: "var(--neutral-surface-grey-lighter)",
                cursor: "pointer",
                color: "var(--neutral-on-surface-secondary)",
              }}
            >
              <CloseIcon size={14} color="var(--neutral-on-surface-secondary)" />
            </div>
          )}
          <CalendarIcon
            size={18}
            color={
              disabled
                ? "var(--neutral-line-outline)"
                : "var(--neutral-on-surface-secondary)"
            }
          />
        </div>
      </button>

      {isOpen ? (
        <div
          ref={popoverRef}
          style={{
            position: "fixed",
            top: `${popoverPos.top}px`,
            left: `${popoverPos.left}px`,
            width: `${popoverPos.width}px`,
            transform:
              popoverPos.placement === "top" ? "translateY(-100%)" : "none",
            background: "var(--neutral-surface-primary)",
            border: "1px solid var(--neutral-line-separator-2)",
            borderRadius: "12px",
            boxShadow: "0px 6px 15px -2px rgba(16, 24, 40, 0.08)",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            zIndex: 10020,
          }}
        >
          {selectionMode === "days" ? (
            <>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  margin: "4px 8px 8px",
                  border: "1px solid var(--neutral-line-separator-1)",
                  borderRadius: "12px",
                  background: "var(--neutral-surface-primary)",
                }}
              >
                <button
                  type="button"
                  onClick={() =>
                    setViewDate(
                      new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1)
                    )
                  }
                  style={{
                    border: "none",
                    background: "transparent",
                    padding: "4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <ChevronLeftIcon size={18} color="var(--neutral-on-surface-secondary)" />
                </button>
                <div style={{ display: "flex", gap: "48px", alignItems: "center" }}>
                  <button
                    type="button"
                    onClick={() => setSelectionMode("months")}
                    style={{
                      border: "none",
                      background: "transparent",
                      fontSize: "var(--text-title-2)",
                      fontWeight: "var(--font-weight-bold)",
                      color: "var(--neutral-on-surface-primary)",
                      cursor: "pointer",
                      padding: "4px 8px",
                      borderRadius: "4px"
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "var(--neutral-surface-grey-lighter)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    {monthLabel.substring(0, 3).toUpperCase()}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectionMode("years")}
                    style={{
                      border: "none",
                      background: "transparent",
                      fontSize: "var(--text-title-2)",
                      fontWeight: "var(--font-weight-bold)",
                      color: "var(--neutral-on-surface-primary)",
                      cursor: "pointer",
                      padding: "4px 8px",
                      borderRadius: "4px"
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "var(--neutral-surface-grey-lighter)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    {yearLabel}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setViewDate(
                      new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1)
                    )
                  }
                  style={{
                    border: "none",
                    background: "transparent",
                    padding: "4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <ChevronRightIcon
                    size={18}
                    color="var(--neutral-on-surface-secondary)"
                  />
                </button>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
                  rowGap: "8px",
                  columnGap: "16px",
                  paddingTop: "4px",
                }}
              >
                {DATE_PICKER_WEEKDAYS.map((weekday) => (
                  <div
                    key={weekday}
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      padding: "8px 0",
                      fontSize: "var(--text-title-3)",
                      color: "var(--neutral-on-surface-secondary)",
                    }}
                  >
                    {weekday}
                  </div>
                ))}
              </div>

              <div
                style={{
                  height: "4px",
                  background: "var(--neutral-surface-grey-lighter)",
                  width: "100%",
                }}
              />

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
                  rowGap: "8px",
                  columnGap: "16px",
                }}
              >
                {calendarDays.map((day) => {
                  const isSelected = day.iso === value;
                  const isToday = day.iso === todayIso;
                  const isDisabled = (minDate && day.iso < minDate) || (maxDate && day.iso > maxDate);
                  
                  return (
                    <button
                      key={day.iso}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => {
                        if (isDisabled) return;
                        onChange?.(createSyntheticInputEvent(day.iso));
                        setIsOpen(false);
                      }}
                      style={{
                        width: "34px",
                        height: "34px",
                        margin: "0 auto",
                        border: "none",
                        borderRadius: "999px",
                        background: isSelected
                          ? "var(--feature-brand-primary)"
                          : isToday
                            ? "var(--feature-brand-container)"
                            : "transparent",
                        color: isDisabled
                          ? "var(--neutral-line-separator-2)"
                          : isSelected
                            ? "var(--feature-brand-on-primary)"
                            : isToday
                              ? "var(--feature-brand-primary)"
                              : day.isCurrentMonth
                                ? "var(--neutral-on-surface-primary)"
                                : "var(--neutral-line-separator-2)",
                        fontSize: "var(--text-subtitle-1)",
                        fontWeight: isToday || isSelected ? "var(--font-weight-bold)" : "var(--font-weight-regular)",
                        cursor: isDisabled ? "not-allowed" : "pointer",
                        position: "relative",
                        opacity: isDisabled ? 0.5 : 1
                      }}
                    >
                      {day.day}
                      {isToday && !isSelected && (
                        <div 
                          style={{
                            position: "absolute",
                            bottom: "4px",
                            left: "50%",
                            transform: "translateX(-50%)",
                            width: "4px",
                            height: "4px",
                            borderRadius: "50%",
                            background: "var(--feature-brand-primary)"
                          }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          ) : selectionMode === "months" ? (
            <div style={{ padding: "8px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
                {DATE_PICKER_MONTHS.map((m, idx) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      setViewDate(new Date(viewDate.getFullYear(), idx, 1));
                      setSelectionMode("days");
                    }}
                    style={{
                      padding: "12px 8px",
                      border: "none",
                      borderRadius: "8px",
                      background: viewDate.getMonth() === idx ? "var(--feature-brand-primary)" : "transparent",
                      color: viewDate.getMonth() === idx ? "var(--feature-brand-on-primary)" : "var(--neutral-on-surface-primary)",
                      fontSize: "var(--text-title-3)",
                      fontWeight: "500",
                      cursor: "pointer"
                    }}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ padding: "8px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
                {Array.from({ length: 12 }, (_, i) => viewDate.getFullYear() - 5 + i).map(y => (
                  <button
                    key={y}
                    type="button"
                    onClick={() => {
                      setViewDate(new Date(y, viewDate.getMonth(), 1));
                      setSelectionMode("days");
                    }}
                    style={{
                      padding: "12px 8px",
                      border: "none",
                      borderRadius: "8px",
                      background: viewDate.getFullYear() === y ? "var(--feature-brand-primary)" : "transparent",
                      color: viewDate.getFullYear() === y ? "var(--feature-brand-on-primary)" : "var(--neutral-on-surface-primary)",
                      fontSize: "var(--text-title-3)",
                      fontWeight: "500",
                      cursor: "pointer"
                    }}
                  >
                    {y}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </>
  );
};
