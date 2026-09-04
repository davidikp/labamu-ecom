import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarIcon,
  CloudUploadIcon,
  AddIcon,
  CloseIcon,
} from "../../../../../components/icons/Icons.jsx";
import {
  COUNTRY_CODE_OPTIONS,
  DATE_PICKER_MONTHS,
  DATE_PICKER_POPOVER_WIDTH,
  FILE_DESCRIPTION_MAX_LENGTH,
} from "../../../../../constants/appConstants.js";
import {
  baseInputBorderColor,
  blurInputFrame,
  focusInputFrame,
  inputControlStyle,
  inputFrameStyle,
} from "../../../styles/purchaseOrderInputStyles.js";
import { DocumentTypeBadge } from "../../DocumentTypeBadge.jsx";
import {
  formatNumberWithCommas,
  parseNumberFromCommas,
} from "../../../../../utils/format/formatUtils.js";
import {
  buildCalendarDays,
  formatIsoDateString,
  parseIsoDateString,
} from "../../../../../utils/date/dateUtils.js";
import {
  createImageUploadRecord,
  createSyntheticInputEvent,
  getImageUploadName,
  getImageUploadPreviewUrl,
  normalizeProofDocuments,
  getDocumentPrimaryLabel,
} from "../../../../../utils/upload/uploadUtils.js";
import { Button } from "../../../../../components/common/Button.jsx";
import { StatusBadge } from "../../../../../components/common/StatusBadge.jsx";
import { TableSearchField } from "../../../../../components/table/TableSearchField.jsx";
import { Tooltip, UnifiedInputShell, FormField, LabelValue, PhoneInputField, DateInputControl, InputField } from "../../../../../components/index.js";

export { Button, StatusBadge, TableSearchField, Tooltip, UnifiedInputShell, FormField, LabelValue, PhoneInputField, DateInputControl, InputField };

// Tooltip Component (Local implementation with checkTruncation support)
export const LocalTooltip = ({ content, children, style = {}, checkTruncation = false }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);

  const updateCoords = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.top,
        left: rect.left + rect.width / 2,
      });
    }
  };

  useEffect(() => {
    if (isVisible) {
      updateCoords();
      window.addEventListener("scroll", updateCoords, true);
      window.addEventListener("resize", updateCoords);
    }
    return () => {
      window.removeEventListener("scroll", updateCoords, true);
      window.removeEventListener("resize", updateCoords);
    };
  }, [isVisible]);

  return (
    <div
      ref={triggerRef}
      style={{
        position: "relative",
        display: "inline-block",
        width: "max-content",
        minWidth: 0,
        ...style,
      }}
      onMouseEnter={() => {
        if (checkTruncation && triggerRef.current) {
          const element = triggerRef.current.firstElementChild;
          if (element) {
            const isTruncated =
              element.scrollHeight > element.clientHeight + 1 ||
              element.scrollWidth > element.clientWidth + 1;
            if (!isTruncated) return;
          }
        }
        setIsVisible(true);
      }}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible &&
        createPortal(
          <div
            style={{
              position: "fixed",
              top: coords.top - 8,
              left: coords.left,
              transform: "translate(-50%, -100%)",
              width: "max-content",
              maxWidth: "400px",
              zIndex: 10001,
              whiteSpace: "normal",
              padding: "8px 12px",
              borderRadius: "8px",
              background: "var(--neutral-on-surface-primary)",
              color: "var(--neutral-surface-primary)",
              fontSize: "var(--text-desc)",
              lineHeight: "1.6",
              boxShadow: "var(--elevation-sm)",
              textAlign: "left",
              pointerEvents: "none",
            }}
          >
            {content}
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: "50%",
                transform: "translateX(-50%)",
                borderWidth: "6px",
                borderStyle: "solid",
                borderColor:
                  "var(--neutral-on-surface-primary) transparent transparent transparent",
              }}
            />
          </div>,
          document.body
        )}
    </div>
  );
};


// FormField Component
export const LocalFormField = ({
  label,
  required = false,
  children,
  error,
  helperText,
  headerRight,
  labelFontSize,
  headerRightFontSize,
  headerRightColor,
}) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: "8px",
      width: "100%",
    }}
  >
    {(label || headerRight) && (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "2px",
            fontSize: labelFontSize || "var(--text-body)",
            fontWeight: "var(--font-weight-regular)",
          }}
        >
          {required && (
            <span style={{ color: "var(--status-red-primary)" }}>*</span>
          )}
          {label && (
            <span style={{ color: "var(--neutral-on-surface-primary)" }}>
              {label}
            </span>
          )}
        </div>
        {headerRight && (
          <span
            style={{
              fontSize: headerRightFontSize || "var(--text-desc)",
              color: headerRightColor || "var(--neutral-on-surface-tertiary)",
            }}
          >
            {headerRight}
          </span>
        )}
      </div>
    )}
    {children}
    {error ? (
      <span
        style={{
          fontSize: "var(--text-body)",
          color: "var(--status-red-primary)",
        }}
      >
        {error}
      </span>
    ) : null}
    {!error && helperText ? (
      <span
        style={{
          fontSize: "var(--text-desc)",
          color: "var(--neutral-on-surface-secondary)",
        }}
      >
        {helperText}
      </span>
    ) : null}
  </div>
);

/*
// DateInputControl Component
export const DateInputControl = ({
  value,
  onChange,
  disabled = false,
  hasError = false,
  placeholder = "yyyy-mm-dd",
  fieldHeight = "48px",
  borderRadius = "10px",
  fontSize = "var(--text-subtitle-1)",
  style = {},
  maxDate,
  baseInputBorderColor = "var(--neutral-line-separator-1)",
}) => {
  const triggerRef = useRef(null);
  const popoverRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(value ? parseIsoDateString(value) : new Date());
  const [selectionMode, setSelectionMode] = useState("days");
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0, width: 320, placement: "bottom" });
  const todayIso = formatIsoDateString(new Date());

  const updatePopoverPosition = () => {
    if (!triggerRef.current || typeof window === "undefined") return;
    const rect = triggerRef.current.getBoundingClientRect();
    const width = 320;
    const estimatedHeight = 360;
    const openAbove = window.innerHeight - rect.bottom < estimatedHeight + 16 && rect.top > estimatedHeight + 16;
    const left = rect.left;
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
      if (triggerRef.current?.contains(event.target) || popoverRef.current?.contains(event.target)) return;
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
                {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((weekday) => (
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
                  height: "1px",
                  background: "var(--neutral-line-separator-1)",
                  width: "100%",
                  margin: "12px 0"
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
                  const isFuture = maxDate ? day.iso > maxDate : false;
                  
                  return (
                    <button
                      key={day.iso}
                      type="button"
                      disabled={isFuture}
                      onClick={() => {
                        if (isFuture) return;
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
                        color: isFuture
                          ? "var(--neutral-on-surface-tertiary)"
                          : isSelected
                            ? "var(--feature-brand-on-primary)"
                            : isToday
                              ? "var(--feature-brand-primary)"
                              : day.isCurrentMonth
                                ? "var(--neutral-on-surface-primary)"
                                : "var(--neutral-line-separator-2)",
                        fontSize: "var(--text-subtitle-1)",
                        fontWeight: isToday || isSelected ? "var(--font-weight-bold)" : "var(--font-weight-regular)",
                        cursor: isFuture ? "not-allowed" : "pointer",
                        position: "relative",
                        opacity: isFuture ? 0.35 : 1,
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
*/

// DateRangeInputControl Component
export const DateRangeInputControl = ({
  value = { start: "", end: "" },
  onChange,
  disabled = false,
  hasError = false,
  placeholder = "yyyy-mm-dd - yyyy-mm-dd",
  fieldHeight = "48px",
  borderRadius = "10px",
  fontSize = "var(--text-subtitle-1)",
  style = {},
}) => {
  const triggerRef = useRef(null);
  const popoverRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const startObj = value.start ? parseIsoDateString(value.start) : null;
  const [viewDate, setViewDate] = useState(startObj || new Date());
  const [selecting, setSelecting] = useState("start");

  const [popoverPos, setPopoverPos] = useState({
    top: 0, left: 0, width: 660, placement: "bottom",
  });

  const updatePopoverPosition = () => {
    if (!triggerRef.current || typeof window === "undefined") return;
    const rect = triggerRef.current.getBoundingClientRect();
    const width = 660;
    const estimatedHeight = 360;
    const openAbove = window.innerHeight - rect.bottom < estimatedHeight + 16 && rect.top > estimatedHeight + 16;
    const maxLeft = Math.max(8, window.innerWidth - width - 8);
    const centeredLeft = rect.left + rect.width / 2 - width / 2;
    const left = Math.min(Math.max(8, centeredLeft), maxLeft);
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
      if (triggerRef.current?.contains(event.target) || popoverRef.current?.contains(event.target)) return;
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

  const nextMonthView = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);
  const calendars = [
    { date: viewDate, days: buildCalendarDays(viewDate) },
    { date: nextMonthView, days: buildCalendarDays(nextMonthView) }
  ];

  const displayValue = value.start && value.end ? `${value.start} - ${value.end}` : value.start ? `${value.start} - ...` : "";

  const renderMonth = (monthDate, days, isFirst) => {
    const monthLabel = DATE_PICKER_MONTHS[monthDate.getMonth()];
    const yearLabel = monthDate.getFullYear();

    return (
      <div style={{ flex: 1, minWidth: "280px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", padding: "0 4px" }}>
          {isFirst ? (
            <button type="button" onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))} style={{ border: "none", background: "transparent", cursor: "pointer", padding: "4px" }}><ChevronLeftIcon size={20} /></button>
          ) : <div style={{ width: 28 }} />}
          <span style={{ fontWeight: "bold", fontSize: "16px", textTransform: "uppercase", letterSpacing: "1px" }}>{monthLabel} {yearLabel}</span>
          {!isFirst ? (
            <button type="button" onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))} style={{ border: "none", background: "transparent", cursor: "pointer", padding: "4px" }}><ChevronRightIcon size={20} /></button>
          ) : <div style={{ width: 28 }} />}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "0", textAlign: "center", fontSize: "13px", color: "var(--neutral-on-surface-tertiary)", marginBottom: "8px" }}>
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => <div key={d} style={{ paddingBottom: "8px" }}>{d}</div>)}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "0" }}>
          {days.map(day => {
            const inMonth = day.isCurrentMonth;
            const isStart = inMonth && day.iso === value.start;
            const isEnd = inMonth && day.iso === value.end;
            const inRange = inMonth && value.start && value.end && day.iso > value.start && day.iso < value.end;
            
            let borderRadiusStyle = "0";
            if (isStart && isEnd) borderRadiusStyle = "99px";
            else if (isStart) borderRadiusStyle = "99px 0 0 99px";
            else if (isEnd) borderRadiusStyle = "0 99px 99px 0";
            else if (!inRange) borderRadiusStyle = "99px";

            return (
              <button
                key={day.iso}
                type="button"
                onClick={() => {
                  if (!inMonth) return;
                  if (selecting === "start") {
                    onChange?.({ target: { value: { start: day.iso, end: "" } } });
                    setSelecting("end");
                  } else {
                    const range = day.iso < value.start ? { start: day.iso, end: value.start } : { start: value.start, end: day.iso };
                    onChange?.({ target: { value: range } });
                    setIsOpen(false);
                  }
                }}
                style={{
                  height: "40px",
                  border: "none",
                  borderRadius: borderRadiusStyle,
                  background: (isStart || isEnd) ? "var(--feature-brand-primary)" : inRange ? "var(--feature-brand-container-lighter)" : "transparent",
                  color: (isStart || isEnd) ? "#fff" : inMonth ? (inRange ? "var(--feature-brand-primary)" : "var(--neutral-on-surface-primary)") : "var(--neutral-line-separator-2)",
                  cursor: inMonth ? "pointer" : "default",
                  fontSize: "14px",
                  position: "relative",
                  fontWeight: (isStart || isEnd) ? "bold" : "normal",
                  transition: "background 0.2s"
                }}
              >
                {day.day}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => {
          if (disabled) return;
          setIsOpen((prev) => !prev);
          setSelecting("start");
        }}
        style={{
          width: "100%",
          height: fieldHeight,
          border: `1px solid ${hasError ? "var(--status-red-primary)" : isOpen ? "var(--feature-brand-primary)" : "var(--neutral-line-separator-1)"}`,
          borderRadius,
          background: "var(--neutral-surface-primary)",
          padding: "0 16px",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px",
          cursor: "pointer", textAlign: "left",
          ...style,
        }}
      >
        <span style={{ fontSize, color: value.start ? "var(--neutral-on-surface-primary)" : "var(--neutral-on-surface-tertiary)" }}>
          {displayValue || placeholder}
        </span>
        <CalendarIcon size={18} color="var(--neutral-on-surface-secondary)" />
      </button>

      {isOpen && (
        <div
          ref={popoverRef}
          style={{
            position: "fixed",
            top: `${popoverPos.top}px`,
            left: `${popoverPos.left}px`,
            width: `${popoverPos.width}px`,
            transform: popoverPos.placement === "top" ? "translateY(-100%)" : "none",
            background: "var(--neutral-surface-primary)",
            border: "1px solid var(--neutral-line-separator-1)",
            borderRadius: "16px",
            boxShadow: "var(--elevation-lg)",
            padding: "24px",
            zIndex: 10020,
            display: "flex",
            gap: "24px"
          }}
        >
          {calendars.map((cal, idx) => (
            <React.Fragment key={idx}>
              {renderMonth(cal.date, cal.days, idx === 0)}
              {idx === 0 && <div style={{ width: "1px", background: "var(--neutral-line-separator-2)", margin: "0 8px" }} />}
            </React.Fragment>
          ))}
        </div>
      )}
    </>
  );
};

export { UploadDropzone } from "../../../../../components/index.js";

// UploadDescriptionCard Component
export const UploadDescriptionCard = ({
  file,
  description,
  onRemove,
  onDescriptionChange,
  descriptionRequired = false,
  descriptionError = "",
  hideDescriptionField = false,
}) => (
  <div
    id={file?.id}
    style={{
      border: "1px solid var(--neutral-line-separator-1)",
      borderRadius: "24px",
      padding: "20px 24px",
      display: "flex",
      flexDirection: "column",
      gap: "18px",
      background: "var(--neutral-surface-primary)",
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          minWidth: 0,
        }}
      >
        <DocumentTypeBadge fileName={file?.name} type={file?.type} />
        <span
          style={{
            fontSize: "var(--text-title-3)",
            lineHeight: "20px",
            letterSpacing: "0.09625px",
            fontWeight: "var(--font-weight-regular)",
            color: "var(--neutral-on-surface-primary)",
            minWidth: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {file?.name || "-"}
        </span>
      </div>
      {onRemove ? (
        <Button variant="danger" size="small" onClick={onRemove}>
          Remove
        </Button>
      ) : null}
    </div>

    {!hideDescriptionField ? (
      <InputField
        label="File Description"
        required={descriptionRequired}
        value={description !== undefined ? description : (file?.description || "")}
        onChange={(e) => onDescriptionChange?.(e.target.value)}
        placeholder="Enter File Description"
        maxLength={FILE_DESCRIPTION_MAX_LENGTH}
        headerRight={`${(description !== undefined ? description : (file?.description || "")).length}/${FILE_DESCRIPTION_MAX_LENGTH}`}
        error={descriptionError}
      />
    ) : null}
  </div>
);

const openDocumentLink = (doc, fallbackHandler) => {
  if (doc?.previewUrl && typeof window !== "undefined") {
    window.open(doc.previewUrl, "_blank", "noopener,noreferrer");
    return;
  }
  fallbackHandler?.(doc);
};

// ProofDocumentList Component
export const ProofDocumentList = ({ documents = [], onDocumentClick }) => {
  const normalizedDocuments = normalizeProofDocuments(documents);

  if (normalizedDocuments.length === 0) {
    return (
      <span
        style={{
          fontSize: "var(--text-title-3)",
          color: "var(--neutral-on-surface-secondary)",
        }}
      >
        -
      </span>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        gap: "8px",
      }}
    >
      {normalizedDocuments.map((doc, index) => (
        <div
          key={doc.id || `${doc.name}-${index}`}
          style={{ display: "flex", alignItems: "center", gap: "12px" }}
        >
          <DocumentTypeBadge
            fileName={doc.name}
            type={doc.type}
            size="compact"
          />
          <button
            type="button"
            onClick={() => openDocumentLink(doc, onDocumentClick)}
            style={{
              minWidth: 0,
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: "2px",
              alignItems: "flex-start",
              background: "transparent",
              border: "none",
              padding: 0,
              cursor: "pointer",
              textAlign: "left",
              width: "100%",
              overflow: "hidden",
            }}
          >
            <LocalTooltip content={getDocumentPrimaryLabel(doc)} position="top" style={{ display: "block", width: "100%" }}>
              <span
                style={{
                  fontSize: "var(--text-title-3)",
                  fontWeight: "var(--font-weight-bold)",
                  color: "var(--feature-brand-primary)",
                  lineHeight: "20px",
                  letterSpacing: "0.09625px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  width: "100%",
                  display: "block",
                }}
              >
                {getDocumentPrimaryLabel(doc)}
              </span>
            </LocalTooltip>
            <LocalTooltip content={doc.name} position="top" style={{ display: "block", width: "100%" }}>
              <span
                style={{
                  fontSize: "var(--text-body)",
                  color: "var(--feature-brand-primary)",
                  lineHeight: "18px",
                  letterSpacing: "0.0825px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  width: "100%",
                  display: "block",
                }}
              >
                {doc.name}
              </span>
            </LocalTooltip>
          </button>
        </div>
      ))}
    </div>
  );
};

// InputGroup Component
export const InputGroup = ({
  label,
  required = false,
  prefix,
  suffix,
  value,
  onChange,
  placeholder,
  disabled = false,
  type = "text",
  hasError = false,
  error,
  helperText,
  inputStyle = {},
  containerStyle = {},
  prefixStyle = {},
  suffixStyle = {},
  ...rest
}) => {
  return (
    <LocalFormField
      label={label}
      required={required}
      error={error}
      helperText={helperText}
    >
      <UnifiedInputShell
        disabled={disabled}
        hasError={hasError || !!error}
        style={containerStyle}
        onFocus={(e) => focusInputFrame(e.currentTarget)}
        onBlur={(e) =>
          blurInputFrame(e.currentTarget, disabled, hasError || !!error)
        }
      >
        {prefix ? (
          <span
            style={{
              fontSize: "var(--text-subtitle-1)",
              color: disabled
                ? "var(--neutral-on-surface-tertiary)"
                : "var(--neutral-on-surface-secondary)",
              whiteSpace: "nowrap",
              flexShrink: 0,
              ...prefixStyle,
            }}
          >
            {prefix}
          </span>
        ) : null}

        <input
          type={type === "number" ? "text" : type}
          value={type === "number" ? formatNumberWithCommas(value) : value}
          onChange={(e) => {
            if (type === "number") {
              const rawValue = parseNumberFromCommas(e.target.value);
              if (rawValue === "" || !isNaN(rawValue) || rawValue === "-") {
                onChange({ ...e, target: { ...e.target, value: rawValue } });
              }
            } else {
              onChange(e);
            }
          }}
          placeholder={placeholder}
          disabled={disabled}
          {...rest}
          style={{
            flex: 1,
            height: "100%",
            minWidth: 0,
            border: "none",
            outline: "none",
            background: "transparent",
            padding: 0,
            fontSize: "var(--text-subtitle-1)",
            color: disabled
              ? "var(--neutral-on-surface-tertiary)"
              : value
                ? "var(--neutral-on-surface-primary)"
                : "var(--neutral-on-surface-tertiary)",
            fontFamily: "Lato, sans-serif",
            boxSizing: "border-box",
            ...inputStyle,
          }}
        />

        {suffix ? (
          <span
            style={{
              fontSize: "var(--text-subtitle-1)",
              color: disabled
                ? "var(--neutral-on-surface-tertiary)"
                : "var(--neutral-on-surface-secondary)",
              whiteSpace: "nowrap",
              flexShrink: 0,
              ...suffixStyle,
            }}
          >
            {suffix}
          </span>
        ) : null}
      </UnifiedInputShell>
    </LocalFormField>
  );
};

// SectionCard Component
export const SectionCard = ({ title, children, rightAction }) => (
  <div
    style={{
      background: "var(--neutral-surface-primary)",
      borderRadius: "var(--radius-card)",
      border: "1px solid var(--neutral-line-separator-1)",
      padding: "24px",
      display: "flex",
      flexDirection: "column",
      gap: "24px",
    }}
  >
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <div
          style={{
            width: "4px",
            height: "20px",
            background: "var(--feature-brand-primary)",
            borderRadius: "2px",
          }}
        />
        <h2
          style={{
            margin: 0,
            fontSize: "var(--text-title-1)",
            fontWeight: "var(--font-weight-bold)",
            color: "var(--neutral-on-surface-primary)",
          }}
        >
          {title}
        </h2>
      </div>
      {rightAction ? <div>{rightAction}</div> : null}
    </div>
    {children}
  </div>
);

// Card Component
export const Card = ({ children, style = {} }) => (
  <div
    style={{
      background: "var(--neutral-surface-primary)",
      borderRadius: "var(--radius-card)",
      border: "1px solid var(--neutral-line-separator-1)",
      padding: "24px",
      display: "flex",
      flexDirection: "column",
      gap: "20px",
      ...style,
    }}
  >
    {children}
  </div>
);

// Table Style Helpers
export const cellStyle = (overrides) => ({
  minWidth: 0,
  height: "56px",
  padding: "0 12px",
  display: "flex",
  alignItems: "center",
  fontSize: "var(--text-title-3)",
  color: "var(--neutral-on-surface-primary)",
  ...overrides,
});

export const systemTableShellStyle = {
  display: "flex",
  flexDirection: "column",
  border: "1px solid var(--neutral-line-separator-1)",
  borderRadius: "12px",
  overflow: "hidden",
  background: "var(--neutral-surface-primary)",
};

export const systemTableHeaderCellStyle = (overrides = {}) => ({
  minWidth: 0,
  height: "49px",
  display: "flex",
  alignItems: "center",
  padding: "0 12px",
  fontSize: "var(--text-title-3)",
  fontWeight: "var(--font-weight-bold)",
  color: "var(--neutral-on-surface-primary)",
  boxSizing: "border-box",
  ...overrides,
});

export const systemTableCellStyle = (overrides = {}) => ({
  minWidth: 0,
  minHeight: "56px",
  display: "flex",
  alignItems: "center",
  padding: "0 12px",
  fontSize: "var(--text-title-3)",
  color: "var(--neutral-on-surface-primary)",
  boxSizing: "border-box",
  ...overrides,
});

export const systemTableEmptyStateStyle = {
  padding: "32px 24px",
  textAlign: "center",
  fontSize: "var(--text-title-3)",
  color: "var(--neutral-on-surface-tertiary)",
};

export const poReferenceTableFrameStyle = {
  border: "none",
  borderRadius: "0",
  overflow: "hidden",
  width: "100%",
};

export const poReferenceTableScrollerStyle = {
  overflowX: "auto",
  width: "100%",
};

export const poReferenceTableInnerStyle = (minWidth = "100%") => ({
  minWidth,
  width: "100%",
  display: "flex",
  flexDirection: "column",
});

export const poReferenceTableHeaderRowStyle = (gridTemplateColumns, gap = "0", overrides = {}) => ({
  display: "grid",
  gridTemplateColumns,
  gap,
  padding: "0 16px",
  height: "49px",
  alignItems: "center",
  background: "var(--neutral-surface-primary)",
  borderBottom: "1px solid var(--neutral-line-separator-1)",
  fontSize: "var(--text-title-3)",
  fontWeight: "var(--font-weight-bold)",
  color: "var(--neutral-on-surface-primary)",
  ...overrides,
});

export const poReferenceTableRowStyle = (
  gridTemplateColumns,
  isLast = false,
  overrides = {}
) => ({
  display: "grid",
  gridTemplateColumns,
  gap: overrides.gap || "0",
  padding: "0 16px",
  minHeight: "64px",
  alignItems: "center",
  borderBottom: isLast ? "none" : "1px solid var(--neutral-line-separator-1)",
  background: "var(--neutral-surface-primary)",
  ...overrides,
});

export const poReferenceTableHeaderCellStyle = (overrides = {}) => ({
  minWidth: 0,
  display: "flex",
  alignItems: "center",
  ...overrides,
});

export const poReferenceTableCellStyle = (overrides = {}) => ({
  minWidth: 0,
  display: "flex",
  alignItems: "center",
  fontSize: "var(--text-title-3)",
  color: "var(--neutral-on-surface-primary)",
  ...overrides,
});

export const poReferenceTableEmptyStateStyle = {
  padding: "32px",
  textAlign: "center",
  fontSize: "var(--text-title-3)",
  color: "var(--neutral-on-surface-tertiary)",
  background: "var(--neutral-surface-primary)",
};

export const tabButtonStyle = (isActive) => ({
  height: "48px",
  padding: "0 28px",
  borderRadius: "100px",
  border: isActive
    ? "1px solid var(--feature-brand-primary)"
    : "1px solid transparent",
  background: isActive ? "#EAF1FF" : "var(--neutral-surface-primary)",
  color: isActive ? "var(--feature-brand-primary)" : "#7F7F7F",
  fontSize: "var(--text-title-2)",
  fontWeight: isActive
    ? "var(--font-weight-bold)"
    : "var(--font-weight-regular)",
  cursor: "pointer",
  transition: "all 0.18s ease",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  whiteSpace: "nowrap",
});
