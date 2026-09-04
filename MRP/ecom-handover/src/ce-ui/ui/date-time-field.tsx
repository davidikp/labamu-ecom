"use client"

import * as React from "react"
import * as ReactDOM from "react-dom"
import { Calendar } from "lucide-react"
import { cn, toTestId } from "../lib/utils"
import { DateTimePicker } from "./date-time-picker"

// ── helpers ───────────────────────────────────────────────────────────────────

const MONTH_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]

function formatDateTime(d: Date, format: "12h" | "24h") {
  const datePart = `${d.getDate()} ${MONTH_SHORT[d.getMonth()]} ${d.getFullYear()}`
  const hours24 = d.getHours()
  const minutes = String(d.getMinutes()).padStart(2, "0")
  if (format === "12h") {
    const period = hours24 >= 12 ? "PM" : "AM"
    const hours12 = hours24 % 12 || 12
    return `${datePart}, ${hours12}:${minutes} ${period}`
  }
  return `${datePart}, ${String(hours24).padStart(2, "0")}:${minutes}`
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface DateTimeFieldProps {
  label?: string
  placeholder?: string
  required?: boolean
  helperText?: string
  errorText?: string
  disabled?: boolean
  value?: Date | null
  onChange?: (date: Date | null) => void
  /** Hour format passed through to the underlying DateTimePicker. Default: "24h" */
  format?: "12h" | "24h"
  /** Minute increment step passed through to the underlying DateTimePicker. Default: 1 */
  minuteStep?: number
  /** Passed through to the underlying DateTimePicker — disallows any date/time before this moment. */
  minDate?: Date
  showWeekNumbers?: boolean
  size?: "lg" | "md"
  fieldVariant?: "outlined" | "filled"
  className?: string
  testId?: string
}

// ── DateTimeField ─────────────────────────────────────────────────────────────
// Same trigger+popover wrapper pattern as DateField, but around
// DateTimePicker (calendar + time column) instead of the date-only
// DatePicker — for scheduling flows where a bare date isn't enough.

export const DateTimeField: React.FC<DateTimeFieldProps> = ({
  label,
  placeholder,
  required,
  helperText,
  errorText,
  disabled = false,
  value,
  onChange,
  format = "24h",
  minuteStep = 1,
  minDate,
  showWeekNumbers,
  size = "lg",
  fieldVariant = "outlined",
  className,
  testId,
}) => {
  const [open, setOpen] = React.useState(false)
  // Fixed-viewport coordinates for the portaled popover (see the render
  // below for why it's portaled at all) — `right` anchors the popover's
  // right edge to the trigger's right edge (this widget is wide enough that
  // a field sitting near the right edge of its container, e.g. a narrow
  // sidebar card, would otherwise push the popover half off-screen), and
  // `top`/`bottom` flip based on available vertical space.
  const [coords, setCoords] = React.useState<{ top?: number; bottom?: number; right: number } | null>(null)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const triggerRef = React.useRef<HTMLButtonElement>(null)
  const popoverRef = React.useRef<HTMLDivElement>(null)

  // Close on outside click — checks both the trigger's container AND the
  // portaled popover (the latter lives outside `containerRef`'s DOM
  // subtree once rendered into document.body, so it needs its own check or
  // every click inside the calendar/time widget would immediately close it).
  React.useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      const target = e.target as Node
      if (containerRef.current?.contains(target)) return
      if (popoverRef.current?.contains(target)) return
      setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  // Close on Escape
  React.useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false) }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [open])

  // Position the popover against the trigger's current on-screen rect.
  // Estimating rather than measuring the popover itself (it isn't mounted
  // yet at this point) — a fixed 340px height guess is a safe overestimate
  // for the calendar+time widget, good enough to decide "flip up or not".
  React.useEffect(() => {
    if (!open || !triggerRef.current) { setCoords(null); return }
    const rect = triggerRef.current.getBoundingClientRect()
    const estimatedHeight = 340
    const spaceBelow = window.innerHeight - rect.bottom
    const openUpward = spaceBelow < estimatedHeight && rect.top > spaceBelow
    setCoords({
      right: Math.max(8, window.innerWidth - rect.right),
      ...(openUpward ? { bottom: window.innerHeight - rect.top + 4 } : { top: rect.bottom + 4 }),
    })
  }, [open])

  const hasError = !!errorText
  const isOpen = open && !disabled
  const displayValue = value ? formatDateTime(value, format) : ""

  const triggerClass = cn(
    "w-full font-lb rounded-lb-input border transition-all duration-200 outline-none",
    "flex items-center justify-between cursor-pointer",
    "text-left select-none",
    size === "lg"
      ? "h-12 px-4 text-[16px] leading-[22px] tracking-[0.11px]"
      : "h-10 px-3 text-[14px] leading-[20px] tracking-[0.0962px]",
    fieldVariant === "filled"
      ? "bg-lb-surface-grey border-lb-line-1"
      : "bg-lb-surface border-lb-line-1",
    disabled
      ? "bg-lb-surface-grey border-lb-line-1 text-lb-on-surface-3 cursor-not-allowed"
      : hasError
        ? cn(
            "border-lb-red hover:border-lb-red",
            isOpen && "shadow-[0_0_0_3px_theme(colors.lb-red-bg)]"
          )
        : cn(
            "hover:border-lb-line-2",
            isOpen
              ? "border-lb-brand shadow-[0_0_0_3px_theme(colors.lb-brand-light)]"
              : ""
          )
  )

  return (
    <div ref={containerRef} className={cn("flex flex-col gap-1 w-full", className)}>
      {label && (
        <div className="flex items-center gap-0.5">
          {required && (
            <span className="font-lb text-[14px] font-lb-bold text-lb-red">*</span>
          )}
          <span className="font-lb text-[12px] text-lb-on-surface leading-[18px] tracking-[0.0825px]">
            {label}
          </span>
        </div>
      )}

      <div className="relative">
        <button
          ref={triggerRef}
          type="button"
          disabled={disabled}
          onClick={() => {
            if (disabled) return
            const willOpen = !open
            // Prefill with "now" (clamped to minDate, if that's still ahead
            // of now) the first time this opens with nothing chosen yet —
            // otherwise the calendar/time widget shows today highlighted
            // and the current time pre-selected while the field itself
            // still reads as empty, which reads as unset when it isn't.
            if (willOpen && !value) {
              const now = new Date()
              onChange?.(minDate && minDate.getTime() > now.getTime() ? new Date(minDate) : now)
            }
            setOpen(willOpen)
          }}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          className={triggerClass}
          data-testid={toTestId(testId, "date_time_field")}
        >
          <span className={cn(!displayValue && "text-lb-on-surface-3")}>
            {displayValue || placeholder || "Select date and time"}
          </span>
          <Calendar
            size={size === "md" ? 16 : 18}
            className={cn("flex-shrink-0", disabled ? "text-lb-on-surface-3" : "text-lb-on-surface-2")}
          />
        </button>

        {isOpen && coords && ReactDOM.createPortal(
          <div
            ref={popoverRef}
            role="dialog"
            aria-modal="false"
            data-testid={testId ? `${testId}_popup` : "date_time_field_popup"}
            style={{ position: "fixed", top: coords.top, bottom: coords.bottom, right: coords.right, zIndex: 999 }}
          >
            <DateTimePicker
              value={value}
              onChange={onChange}
              format={format}
              minuteStep={minuteStep}
              minDate={minDate}
              showWeekNumbers={showWeekNumbers}
              testId={testId}
            />
          </div>,
          document.body
        )}
      </div>

      {(helperText || errorText) && (
        <span
          className={cn(
            "font-lb text-[12px] leading-[18px] tracking-[0.0825px]",
            hasError ? "text-lb-red" : "text-lb-on-surface-3"
          )}
        >
          {errorText || helperText}
        </span>
      )}
    </div>
  )
}

export default DateTimeField
