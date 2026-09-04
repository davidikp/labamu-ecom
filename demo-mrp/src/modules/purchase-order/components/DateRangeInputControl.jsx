import React, { useEffect, useRef, useState } from "react";
import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "../../../components/icons/Icons.jsx";
import {
  buildCalendarDays,
  parseIsoDateString,
} from "../../../utils/date/dateUtils.js";
import {
  DATE_PICKER_MONTHS,
} from "../../../constants/appConstants.js";

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
    top: 0,
    left: 0,
    width: 660,
    placement: "bottom",
  });

  const updatePopoverPosition = () => {
    if (!triggerRef.current || typeof window === "undefined") return;
    const rect = triggerRef.current.getBoundingClientRect();
    const width = 660;
    const estimatedHeight = 360;
    const openAbove =
      window.innerHeight - rect.bottom < estimatedHeight + 16 &&
      rect.top > estimatedHeight + 16;
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

  const nextMonthView = new Date(
    viewDate.getFullYear(),
    viewDate.getMonth() + 1,
    1
  );
  const calendars = [
    { date: viewDate, days: buildCalendarDays(viewDate) },
    { date: nextMonthView, days: buildCalendarDays(nextMonthView) },
  ];

  const displayValue = value.start && value.end
    ? `${value.start} - ${value.end}`
    : value.start
      ? `${value.start} - ...`
      : "";

  const renderMonth = (monthDate, days, isFirst) => {
    const monthLabel = DATE_PICKER_MONTHS[monthDate.getMonth()];
    const yearLabel = monthDate.getFullYear();

    return (
      <div style={{ flex: 1, minWidth: "280px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
            padding: "0 4px",
          }}
        >
          {isFirst ? (
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
                cursor: "pointer",
                padding: "4px",
              }}
            >
              <ChevronLeftIcon size={20} />
            </button>
          ) : (
            <div style={{ width: 28 }} />
          )}
          <span
            style={{
              fontWeight: "bold",
              fontSize: "16px",
              textTransform: "uppercase",
              letterSpacing: "1px",
            }}
          >
            {monthLabel} {yearLabel}
          </span>
          {!isFirst ? (
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
                cursor: "pointer",
                padding: "4px",
              }}
            >
              <ChevronRightIcon size={20} />
            </button>
          ) : (
            <div style={{ width: 28 }} />
          )}
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: "0",
            textAlign: "center",
            fontSize: "13px",
            color: "var(--neutral-on-surface-tertiary)",
            marginBottom: "8px",
          }}
        >
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} style={{ paddingBottom: "8px" }}>
              {day}
            </div>
          ))}
        </div>
        <div
          style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "0" }}
        >
          {days.map((day) => {
            const inMonth = day.isCurrentMonth;
            const isStart = inMonth && day.iso === value.start;
            const isEnd = inMonth && day.iso === value.end;
            const inRange =
              inMonth && value.start && value.end && day.iso > value.start && day.iso < value.end;

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
                    const range =
                      day.iso < value.start
                        ? { start: day.iso, end: value.start }
                        : { start: value.start, end: day.iso };
                    onChange?.({ target: { value: range } });
                    setIsOpen(false);
                  }
                }}
                style={{
                  height: "40px",
                  border: "none",
                  borderRadius: borderRadiusStyle,
                  background:
                    isStart || isEnd
                      ? "var(--feature-brand-primary)"
                      : inRange
                        ? "var(--feature-brand-container-lighter)"
                        : "transparent",
                  color:
                    isStart || isEnd
                      ? "#fff"
                      : inMonth
                        ? inRange
                          ? "var(--feature-brand-primary)"
                          : "var(--neutral-on-surface-primary)"
                        : "var(--neutral-line-separator-2)",
                  cursor: inMonth ? "pointer" : "default",
                  fontSize: "14px",
                  position: "relative",
                  fontWeight: isStart || isEnd ? "bold" : "normal",
                  transition: "background 0.2s",
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
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          cursor: "pointer",
          textAlign: "left",
          ...style,
        }}
      >
        <span
          style={{
            fontSize,
            color: value.start
              ? "var(--neutral-on-surface-primary)"
              : "var(--neutral-on-surface-tertiary)",
          }}
        >
          {displayValue || placeholder}
        </span>
        <CalendarIcon size={18} color="var(--neutral-on-surface-secondary)" />
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
            border: "1px solid var(--neutral-line-separator-1)",
            borderRadius: "16px",
            boxShadow: "var(--elevation-lg)",
            padding: "24px",
            zIndex: 10020,
            display: "flex",
            gap: "24px",
          }}
        >
          {calendars.map((cal, idx) => (
            <React.Fragment key={idx}>
              {renderMonth(cal.date, cal.days, idx === 0)}
              {idx === 0 ? (
                <div
                  style={{
                    width: "1px",
                    background: "var(--neutral-line-separator-2)",
                    margin: "0 8px",
                  }}
                />
              ) : null}
            </React.Fragment>
          ))}
        </div>
      ) : null}
    </>
  );
};
