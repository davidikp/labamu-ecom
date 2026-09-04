import React, { useEffect, useRef, useState } from "react";
import { AddIcon, CalendarIcon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, CloudUploadIcon, CloseIcon } from "../../../components/icons/Icons.jsx";
import { Button } from "../../../components/common/Button.jsx";
import { Checkbox } from "../../../components/common/Checkbox.jsx";
import { StatusBadge } from "../../../components/common/StatusBadge.jsx";
import { DropdownSelect } from "../../../components/common/DropdownSelect.jsx";
import { FormField, InputField, UnifiedInputShell, PhoneInputField, inputFrameStyle, inputControlStyle, focusInputFrame, blurInputFrame } from "../../../components/index.js";
import { TableSearchField } from "../../../components/table/TableSearchField.jsx";
import { UploadDropzone } from "../../../components/index.js";
import { COUNTRY_CODE_OPTIONS, DATE_PICKER_MONTHS, DATE_PICKER_POPOVER_WIDTH, DATE_PICKER_WEEKDAYS, FILE_DESCRIPTION_MAX_LENGTH } from "../../../constants/appConstants.js";
import { buildCalendarDays, formatIsoDateString, parseIsoDateString } from "../../../utils/date/dateUtils.js";
import { formatNumberWithCommas, parseNumberFromCommas } from "../../../utils/format/formatUtils.js";
import { createImageUploadRecord, createSyntheticInputEvent, getDocumentPrimaryLabel, getFileExtension, getImageUploadName, getImageUploadPreviewUrl, normalizeProofDocuments } from "../../../utils/upload/uploadUtils.js";

const getProgressColor = (pct) => {
  if (pct >= 100) return "var(--status-green-primary)";
  if (pct >= 75) return "var(--feature-brand-primary)";
  if (pct >= 50) return "var(--status-yellow-primary)";
  if (pct >= 25) return "var(--status-orange-primary)";
  return "var(--status-red-primary)";
};

const ProgressRing = ({ percentage, color = "inherit", strokeColor }) => {
  const radius = 6;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const resolvedStroke = strokeColor || getProgressColor(percentage);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        style={{ transform: "rotate(-90deg)" }}
      >
        <circle
          cx="8"
          cy="8"
          r={radius}
          fill="none"
          stroke="var(--neutral-line-separator-2)"
          strokeWidth="2"
        />
        <circle
          cx="8"
          cy="8"
          r={radius}
          fill="none"
          stroke={resolvedStroke}
          strokeWidth="2"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>
      <span style={{ color }}>{percentage}%</span>
    </div>
  );
};

const Tooltip = ({ content, children, style = {}, showOnlyIfTruncated = false, align = "center" }) => {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef(null);

  const handleMouseEnter = () => {
    if (showOnlyIfTruncated && containerRef.current) {
      const element = containerRef.current.firstElementChild || containerRef.current;
      const isTruncated = element.scrollWidth > element.clientWidth;
      if (!isTruncated) return;
    }
    setIsVisible(true);
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        ...style,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible ? (
        <div
          style={{
            position: "absolute",
            bottom: "100%",
            left: align === "right" ? "auto" : "50%",
            right: align === "right" ? "0" : "auto",
            transform: align === "right" ? "none" : "translateX(-50%)",
            marginBottom: "8px",
            width: "max-content",
            padding: "8px 12px",
            borderRadius: "8px",
            background: "var(--neutral-on-surface-primary)",
            color: "var(--neutral-surface-primary)",
            fontSize: "var(--text-desc)",
            lineHeight: "1.6",
            boxShadow: "var(--elevation-sm)",
            zIndex: 1000,
            textAlign: "center",
            pointerEvents: "none",
          }}
        >
          {content}
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: align === "right" ? "auto" : "50%",
              right: align === "right" ? "12px" : "auto",
              transform: align === "right" ? "none" : "translateX(-50%)",
              borderWidth: "6px",
              borderStyle: "solid",
              borderColor:
                "var(--neutral-on-surface-primary) transparent transparent transparent",
            }}
          />
        </div>
      ) : null}
    </div>
  );
};

const LabelValue = ({ label, value, badge }) => {
  const displayValue =
    React.isValidElement(value) ? value : (typeof value === "object" && value !== null ? JSON.stringify(value) : value);

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



const DateInputControl = ({
  value = "",
  onChange,
  disabled = false,
  hasError = false,
  placeholder = "yyyy-mm-dd",
  fieldHeight = "48px",
  borderRadius = "10px",
  fontSize = "var(--text-subtitle-1)",
  minDate = "",
  maxDate = "",
  style = {},
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
                  : "var(--neutral-line-separator-1)"
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
        <CalendarIcon
          size={18}
          color={
            disabled
              ? "var(--neutral-line-outline)"
              : "var(--neutral-on-surface-secondary)"
          }
        />
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
                        color: isSelected
                          ? "var(--feature-brand-on-primary)"
                          : isToday
                            ? "var(--feature-brand-primary)"
                            : isDisabled
                              ? "var(--neutral-line-separator-2)"
                              : day.isCurrentMonth
                                ? "var(--neutral-on-surface-primary)"
                                : "var(--neutral-line-separator-2)",
                        fontSize: "var(--text-subtitle-1)",
                        fontWeight: isToday || isSelected ? "var(--font-weight-bold)" : "var(--font-weight-regular)",
                        cursor: isDisabled ? "not-allowed" : "pointer",
                        position: "relative",
                        opacity: isDisabled ? 0.4 : 1,
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

const DateRangeInputControl = ({
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

function isRangePart(s, e) { return s || e; }



const openDocumentLink = (doc, fallbackHandler) => {
  if (doc?.previewUrl && typeof window !== "undefined") {
    window.open(doc.previewUrl, "_blank", "noopener,noreferrer");
    return;
  }
  fallbackHandler?.(doc);
};

const DocumentTypeBadge = ({ fileName = "", type = "", size = "default" }) => {
  const normalizedType = (
    getFileExtension(fileName) ||
    (type === "pdf" ? "PDF" : type === "image" ? "JPG" : "DOC")
  ).toUpperCase();
  const palette = {
    DOC: { bg: "#6E90C7", fold: "#A8BFE2" },
    XLS: { bg: "#0D7C44", fold: "#56B182" },
    PDF: { bg: "#E0001B", fold: "#F3A0AA" },
    ZIP: { bg: "#D4D100", fold: "#ECE87A" },
    JPG: { bg: "#FF980C", fold: "#FFD39C" },
    JPEG: { bg: "#FF980C", fold: "#FFD39C" },
    PNG: { bg: "#456FB4", fold: "#A9BDE2" },
    SVG: { bg: "#605CED", fold: "#AFAEFF" },
    WEBP: { bg: "#767F90", fold: "#AEB5C1" },
  }[normalizedType] || { bg: "#6E90C7", fold: "#A8BFE2" };
  const sizeMap = {
    compact: {
      width: 28,
      height: 32,
      fontSize: "4.8px",
      fold: 9,
      paddingBottom: "7px",
      radius: "6px",
    },
    preview: {
      width: 34,
      height: 40,
      fontSize: "7px",
      fold: 10,
      paddingBottom: "8px",
      radius: "7px",
    },
    default: {
      width: 30,
      height: 36,
      fontSize: "6.6px",
      fold: 10,
      paddingBottom: "7px",
      radius: "7px",
    },
  }[size] || {
    width: 30,
    height: 36,
    fontSize: "6.6px",
    fold: 10,
    paddingBottom: "7px",
    radius: "7px",
  };

  return (
    <div
      style={{
        width: sizeMap.width,
        height: sizeMap.height,
        borderRadius: sizeMap.radius,
        background: palette.bg,
        position: "relative",
        flexShrink: 0,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        paddingBottom: sizeMap.paddingBottom,
        boxSizing: "border-box",
        overflow: "hidden",
        clipPath:
          "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: 0,
          height: 0,
          borderLeft: `${sizeMap.fold}px solid transparent`,
          borderTop: `${sizeMap.fold}px solid ${palette.fold}`,
        }}
      />
      <span
        style={{
          fontSize: sizeMap.fontSize,
          fontWeight: "var(--font-weight-bold)",
          color: "#fff",
          lineHeight: 1,
          letterSpacing: "0.18px",
        }}
      >
        {normalizedType.slice(0, 4)}
      </span>
    </div>
  );
};

const UploadDescriptionCard = ({
  file,
  onRemove,
  onDescriptionChange,
  descriptionRequired = false,
  descriptionError = "",
  hideDescriptionField = false,
}) => (
  <div
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
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
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
              gap: "2px",
              fontSize: "var(--text-body)",
            }}
          >
            {descriptionRequired ? (
              <span style={{ color: "var(--status-red-primary)" }}>*</span>
            ) : null}
            <span style={{ color: "var(--neutral-on-surface-primary)" }}>
              File Description
            </span>
          </div>
          <span
            style={{
              fontSize: "var(--text-body)",
              color: "var(--neutral-on-surface-tertiary)",
            }}
          >
            {(file?.description || "").length}/{FILE_DESCRIPTION_MAX_LENGTH}
          </span>
        </div>
        <input
          type="text"
          value={file?.description || ""}
          maxLength={FILE_DESCRIPTION_MAX_LENGTH}
          placeholder="Enter File Description"
          onChange={(e) => onDescriptionChange?.(e.target.value)}
          style={{
            height: "48px",
            padding: "0 16px",
            width: "100%",
            ...inputFrameStyle(false, !!descriptionError),
            ...inputControlStyle(false, !!file?.description),
            background: "var(--neutral-surface-primary)",
          }}
          onFocus={(e) => focusInputFrame(e.currentTarget)}
          onBlur={(e) =>
            blurInputFrame(e.currentTarget, false, !!descriptionError)
          }
        />
        {descriptionError ? (
          <span
            style={{
              fontSize: "var(--text-body)",
              color: "var(--status-red-primary)",
            }}
          >
            {descriptionError}
          </span>
        ) : null}
      </div>
    ) : null}
  </div>
);

const ImageUploadField = ({
  label = "Images",
  images = [],
  maxFiles = 1,
  disabled = false,
  error = "",
  helperText = "",
  onFilesSelected,
  onRemove,
}) => {
  const normalizedImages = images
    .map((image) => createImageUploadRecord(image))
    .filter(Boolean)
    .slice(0, maxFiles);
  const canAddMore = !disabled && normalizedImages.length < maxFiles;

  const handleIncomingFiles = (fileList) => {
    if (disabled) return;
    const nextFiles = Array.from(fileList || []).slice(
      0,
      Math.max(0, maxFiles - normalizedImages.length)
    );
    if (nextFiles.length === 0) return;
    onFilesSelected?.(nextFiles);
  };

  const renderEmptyTile = () => (
    <label
      onDragOver={(e) => {
        if (disabled) return;
        e.preventDefault();
      }}
      onDrop={(e) => {
        if (disabled) return;
        e.preventDefault();
        handleIncomingFiles(e.dataTransfer?.files);
      }}
      style={{
        width: "120px",
        height: "120px",
        borderRadius: "12px",
        border: `1px dashed ${error ? "var(--status-red-primary)" : "#A9A9A9"}`,
        background: "var(--neutral-surface-primary)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: disabled ? "not-allowed" : "pointer",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: "36px",
          height: "36px",
          borderRadius: "999px",
          background: "var(--neutral-surface-grey-lighter)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <AddIcon size={20} color="var(--neutral-on-surface-tertiary)" />
      </div>
      <input
        type="file"
        accept=".jpg,.jpeg,.png,.webp"
        multiple={maxFiles > 1}
        disabled={disabled}
        style={{ display: "none" }}
        onChange={(e) => {
          handleIncomingFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </label>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <span
        style={{
          fontSize: "var(--text-title-3)",
          color: "var(--neutral-on-surface-secondary)",
        }}
      >
        {label}
      </span>

      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
        {normalizedImages.map((image, index) => {
          const previewUrl = getImageUploadPreviewUrl(image);
          const imageName = getImageUploadName(image);
          return (
            <div
              key={image.id || `${imageName}-${index}`}
              style={{
                position: "relative",
                width: "120px",
                height: "120px",
                borderRadius: "12px",
                border:
                  index === 0
                    ? "2px solid var(--feature-brand-primary)"
                    : "1px solid var(--neutral-line-separator-2)",
                padding: "4px",
                background: "var(--neutral-surface-primary)",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "12px",
                  background: "var(--neutral-surface-grey-lighter)",
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt={imageName}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <span
                    style={{
                      padding: "0 10px",
                      textAlign: "center",
                      fontSize: "var(--text-body)",
                      color: "var(--neutral-on-surface-secondary)",
                      lineHeight: "18px",
                      wordBreak: "break-word",
                    }}
                  >
                    {imageName || "Image"}
                  </span>
                )}
              </div>
              {!disabled ? (
                <button
                  type="button"
                  onClick={() => onRemove?.(image)}
                  style={{
                    position: "absolute",
                    top: "-10px",
                    right: "-10px",
                    width: "28px",
                    height: "28px",
                    borderRadius: "999px",
                    border: "1px solid var(--status-red-primary)",
                    background: "var(--neutral-surface-primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  <CloseIcon size={14} color="var(--status-red-primary)" />
                </button>
              ) : null}
            </div>
          );
        })}

        {canAddMore ? renderEmptyTile() : null}
      </div>

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

      {helperText ? (
        <span
          style={{
            fontSize: "var(--text-body)",
            color: "var(--neutral-on-surface-secondary)",
          }}
        >
          {helperText}
        </span>
      ) : null}
    </div>
  );
};

const ProofDocumentList = ({ documents = [], onDocumentClick }) => {
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
              display: "flex",
              flexDirection: "column",
              gap: "2px",
              alignItems: "flex-start",
              background: "transparent",
              border: "none",
              padding: 0,
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            <Tooltip content={getDocumentPrimaryLabel(doc)} showOnlyIfTruncated align="right" style={{ display: "block", width: "100%", minWidth: 0 }}>
              <span
                style={{
                  display: "block",
                  width: "100%",
                  fontSize: "var(--text-title-3)",
                  fontWeight: "var(--font-weight-bold)",
                  color: "var(--feature-brand-primary)",
                  lineHeight: "20px",
                  letterSpacing: "0.09625px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {getDocumentPrimaryLabel(doc)}
              </span>
            </Tooltip>
            <Tooltip content={doc.name} showOnlyIfTruncated align="right" style={{ display: "block", width: "100%", minWidth: 0 }}>
              <span
                style={{
                  display: "block",
                  width: "100%",
                  fontSize: "var(--text-body)",
                  color: "var(--feature-brand-primary)",
                  lineHeight: "18px",
                  letterSpacing: "0.0825px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {doc.name}
              </span>
            </Tooltip>
          </button>
        </div>
      ))}
    </div>
  );
};

const InputGroup = ({
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
    <FormField
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
    </FormField>
  );
};

const SectionCard = ({ title, children, rightAction }) => (
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

const Card = ({ children, style = {} }) => (
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


const fieldStyle = (disabled = false, hasValue = false, hasError = false) => ({
  height: "46px",
  padding: "0 16px",
  width: "100%",
  border: "none",
  background: "transparent",
  ...inputFrameStyle(disabled, hasError),
  ...inputControlStyle(disabled, hasValue),
});

const textareaFieldStyle = (
  disabled = false,
  hasValue = false,
  hasError = false
) => ({
  minHeight: "88px",
  padding: "12px 16px",
  width: "100%",
  resize: "vertical",
  border: "none",
  background: "transparent",
  ...inputFrameStyle(disabled, hasError),
  ...inputControlStyle(disabled, hasValue),
});

const selectFieldStyle = (
  disabled = false,
  hasValue = false,
  hasError = false
) => ({
  height: "46px",
  padding: "0 40px 0 16px",
  width: "100%",
  appearance: "none",
  WebkitAppearance: "none",
  MozAppearance: "none",
  cursor: disabled ? "not-allowed" : "pointer",
  border: "1px solid transparent",
  background: disabled
    ? "var(--neutral-surface-grey-lighter)"
    : "var(--neutral-surface-primary)",
  ...inputFrameStyle(disabled, hasError),
  ...inputControlStyle(disabled, hasValue),
});
export { ProgressRing, Tooltip, LabelValue, FormField, UnifiedInputShell, PhoneInputField, DateInputControl, DateRangeInputControl, InputField, DocumentTypeBadge, UploadDropzone, UploadDescriptionCard, ImageUploadField, ProofDocumentList, InputGroup, SectionCard, Card, inputFrameStyle, inputControlStyle, focusInputFrame, blurInputFrame, fieldStyle, textareaFieldStyle, selectFieldStyle, openDocumentLink };
