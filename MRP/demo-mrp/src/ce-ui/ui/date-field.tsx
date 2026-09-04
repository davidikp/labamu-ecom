"use client"

import * as React from "react"
import { Calendar } from "lucide-react"
import { cn, toTestId } from "../lib/utils"
import { DatePicker } from "./date-picker"

// ── helpers ───────────────────────────────────────────────────────────────────

const MONTH_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]

function formatDate(d: Date) {
  return `${d.getDate()} ${MONTH_SHORT[d.getMonth()]} ${d.getFullYear()}`
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface DateFieldBase {
  label?: string
  placeholder?: string
  required?: boolean
  helperText?: string
  errorText?: string
  disabled?: boolean
  showWeekNumbers?: boolean
  minDate?: Date
  maxDate?: Date
  size?: "lg" | "md"
  fieldVariant?: "outlined" | "filled"
  className?: string
  testId?: string
}

export interface DateFieldSingleProps extends DateFieldBase {
  variant?: "single"
  value?: Date | null
  onChange?: (date: Date | null) => void
}

export interface DateFieldRangeProps extends DateFieldBase {
  variant: "range"
  startDate?: Date | null
  endDate?: Date | null
  onChange?: (start: Date | null, end: Date | null) => void
}

export type DateFieldProps = DateFieldSingleProps | DateFieldRangeProps

// ── DateField ─────────────────────────────────────────────────────────────────

export const DateField: React.FC<DateFieldProps> = (props) => {
  const {
    label,
    placeholder,
    required,
    helperText,
    errorText,
    disabled = false,
    showWeekNumbers,
    minDate,
    maxDate,
    size = "lg",
    fieldVariant = "outlined",
    className,
    testId,
  } = props

  const [open, setOpen] = React.useState(false)
  const [popoverSide, setPopoverSide] = React.useState<"bottom" | "top">("bottom")
  const containerRef = React.useRef<HTMLDivElement>(null)
  const triggerRef = React.useRef<HTMLButtonElement>(null)
  const popoverRef = React.useRef<HTMLDivElement>(null)

  // Close on outside click
  React.useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false)
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

  // Flip above if not enough space below
  React.useEffect(() => {
    if (!open || !triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    const spaceBelow = window.innerHeight - rect.bottom
    setPopoverSide(spaceBelow < 320 ? "top" : "bottom")
  }, [open])

  const hasError = !!errorText
  const isOpen = open && !disabled

  // ── Trigger display text ────────────────────────────────────────────────────
  let displayValue = ""
  if (props.variant === "range") {
    const { startDate, endDate } = props
    if (startDate && endDate) displayValue = `${formatDate(startDate)} – ${formatDate(endDate)}`
    else if (startDate) displayValue = `${formatDate(startDate)} – ...`
  } else {
    const { value } = props as DateFieldSingleProps
    if (value) displayValue = formatDate(value)
  }

  // ── Shared trigger styles ───────────────────────────────────────────────────
  const triggerClass = cn(
    "w-full font-lb rounded-lb-input border transition-all duration-200 outline-none",
    "flex items-center justify-between cursor-pointer",
    "text-left select-none",
    size === "lg"
      ? "h-12 px-4 text-[16px] leading-[22px] tracking-[0.11px]"
      : "h-10 px-3 text-[14px] leading-[20px] tracking-[0.0962px]",
    // Filled vs outlined
    fieldVariant === "filled"
      ? "bg-lb-surface-grey border-lb-line-1"
      : "bg-lb-surface border-lb-line-1",
    // States
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

  // ── Range onChange: auto-close when end is picked ───────────────────────────
  const handleRangeChange = (start: Date | null, end: Date | null) => {
    ;(props as DateFieldRangeProps).onChange?.(start, end)
    if (start && end) setOpen(false)
  }

  // ── Single onChange: auto-close when date is picked ────────────────────────
  const handleSingleChange = (date: Date | null) => {
    ;(props as DateFieldSingleProps).onChange?.(date)
    if (date) setOpen(false)
  }

  return (
    <div
      ref={containerRef}
      className={cn("flex flex-col gap-1 w-full", className)}
    >
      {/* Label */}
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

      {/* Trigger + Popover wrapper */}
      <div className="relative">
        {/* Trigger button */}
        <button
          ref={triggerRef}
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setOpen(o => !o)}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          className={triggerClass}
          data-testid={toTestId(testId, "date_field")}
        >
          <span className={cn(!displayValue && "text-lb-on-surface-3")}>
            {displayValue || placeholder || (props.variant === "range" ? "Select date range" : "Select date")}
          </span>
          <Calendar
            size={size === "md" ? 16 : 18}
            className={cn(
              "flex-shrink-0",
              disabled ? "text-lb-on-surface-3" : "text-lb-on-surface-2"
            )}
          />
        </button>

        {/* Popover */}
        {isOpen && (
          <div
            ref={popoverRef}
            role="dialog"
            aria-modal="false"
            data-testid={testId ? `${testId}_popup` : "date_field_popup"}
            className={cn(
              "absolute z-50",
              props.variant === "range" ? "left-0" : "left-0",
              popoverSide === "top" ? "bottom-full mb-1" : "top-full mt-1"
            )}
          >
            {props.variant === "range" ? (
              <DatePicker
                variant="range"
                startDate={props.startDate}
                endDate={props.endDate}
                onChange={handleRangeChange}
                showWeekNumbers={showWeekNumbers}
                minDate={minDate}
                maxDate={maxDate}
                testId={testId}
              />
            ) : (
              <DatePicker
                value={(props as DateFieldSingleProps).value}
                onChange={handleSingleChange}
                showWeekNumbers={showWeekNumbers}
                minDate={minDate}
                maxDate={maxDate}
                testId={testId}
              />
            )}
          </div>
        )}
      </div>

      {/* Helper / Error text */}
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

export default DateField
