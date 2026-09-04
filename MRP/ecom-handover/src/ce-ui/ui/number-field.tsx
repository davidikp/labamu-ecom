"use client"

import * as React from "react"
import { cva } from "class-variance-authority"
import { Minus, Plus } from "lucide-react"
import { cn, toTestId } from "../lib/utils"
import { FieldDesktopRow } from "./field-desktop"

// ── Variants ──────────────────────────────────────────────────────────────────

const numberFieldVariants = cva(
  [
    "flex items-center w-full font-lb rounded-lb-input border",
    "transition-all duration-200",
  ],
  {
    variants: {
      size: {
        lg: "h-12",
        md: "h-10",
      },
      state: {
        default: [
          "bg-lb-surface border-lb-line-1",
          "hover:border-lb-line-2",
          "focus-within:border-lb-brand focus-within:shadow-[0_0_0_3px_theme(colors.lb-brand-light)]",
        ],
        error: [
          "bg-lb-surface border-lb-red",
          "hover:border-lb-red",
          "focus-within:border-lb-red focus-within:shadow-[0_0_0_3px_theme(colors.lb-red-bg)]",
        ],
        success: [
          "bg-lb-surface border-lb-green",
          "hover:border-lb-green",
          "focus-within:border-lb-green",
        ],
        disabled: ["bg-lb-surface-grey border-lb-line-1 pointer-events-none"],
        readonly: ["bg-lb-surface-grey border-lb-line-1"],
      },
    },
    defaultVariants: { size: "lg", state: "default" },
  }
)

// ── Props ─────────────────────────────────────────────────────────────────────

export interface NumberFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "type"> {
  label?: string
  required?: boolean
  helperText?: string
  errorText?: string
  successText?: string
  size?: "lg" | "md"
  state?: "default" | "error" | "success" | "disabled" | "readonly"
  /** Show +/- stepper buttons on either side of the input. */
  showSteppers?: boolean
  /** Text/symbol rendered inside the left side of the field (e.g. "$"). */
  leftAddon?: React.ReactNode
  /** Text/symbol rendered inside the right side of the field (e.g. "kg"). */
  rightAddon?: React.ReactNode
  /** Format the displayed value with thousand separators (e.g. 100,000). Raw numeric value is still passed to onChange. */
  formatNumber?: boolean
  /** Maximum digits allowed after the decimal point. 0 blocks decimals entirely. */
  decimalPlaces?: number
  /** Allow negative values. Defaults to true. */
  allowNegative?: boolean
  tooltip?: string
  fieldDesktop?: boolean
  testId?: string
}

// ── Component ─────────────────────────────────────────────────────────────────

export const NumberField = React.forwardRef<HTMLInputElement, NumberFieldProps>(
  (
    {
      label,
      required,
      helperText,
      errorText,
      successText,
      size = "lg",
      state,
      showSteppers = false,
      leftAddon,
      rightAddon,
      formatNumber = false,
      decimalPlaces,
      allowNegative = true,
      tooltip,
      fieldDesktop = false,
      className,
      placeholder,
      disabled,
      readOnly,
      min,
      max,
      step = 1,
      value,
      onChange,
      onBlur,
      onFocus,
      testId,
      ...inputProps
    },
    ref
  ) => {
    const inputRef = React.useRef<HTMLInputElement | null>(null)
    const [isFocused, setIsFocused] = React.useState(false)

    const inputState = state ?? (errorText ? "error" : "default")
    const isDisabled = disabled || inputState === "disabled"
    const isReadOnly = readOnly || inputState === "readonly"

    const numericValue = value !== undefined && value !== "" ? Number(String(value).replace(/,/g, "")) : NaN
    const numMin = min !== undefined ? Number(min) : -Infinity
    const numMax = max !== undefined ? Number(max) : Infinity
    const numStep = Number(step)

    const enforceConstraints = (val: string): string => {
      let s = val
      if (!allowNegative) s = s.replace(/^-/, "")
      if (decimalPlaces !== undefined) {
        const [int, dec] = s.split(".")
        if (dec !== undefined) {
          s = decimalPlaces === 0 ? int : `${int}.${dec.slice(0, decimalPlaces)}`
        }
      }
      return s
    }

    const formatWithCommas = (val: string): string => {
      const negative = val.startsWith("-")
      const abs = negative ? val.slice(1) : val
      const [int, dec] = abs.split(".")
      const formattedInt = int.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
      let result: string
      if (dec !== undefined) {
        const truncated = decimalPlaces !== undefined ? dec.slice(0, decimalPlaces) : dec
        result = truncated ? `${formattedInt}.${truncated}` : formattedInt
      } else {
        result = formattedInt
      }
      return negative ? `-${result}` : result
    }

    const rawString = value !== undefined ? String(value).replace(/,/g, "") : undefined

    const displayValue = formatNumber
      ? isFocused
        ? rawString
        : rawString !== undefined && rawString !== "" && !isNaN(Number(rawString))
          ? formatWithCommas(rawString)
          : rawString
      : value

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!onChange) return
      const stripped = formatNumber ? e.target.value.replace(/,/g, "") : e.target.value
      const constrained = enforceConstraints(stripped)
      if (constrained !== e.target.value) {
        Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set?.call(e.target, constrained)
      }
      onChange(e)
    }

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      if (formatNumber) setIsFocused(true)
      ;(onFocus as React.FocusEventHandler<HTMLInputElement>)?.(e)
    }

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      if (formatNumber) setIsFocused(false)
      ;(onBlur as React.FocusEventHandler<HTMLInputElement>)?.(e)
    }

    const dispatchChange = (next: number) => {
      const input = inputRef.current
      if (!input) return
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set
      nativeInputValueSetter?.call(input, String(next))
      input.dispatchEvent(new Event("input", { bubbles: true }))
    }

    const handleDecrement = () => {
      if (isDisabled || isReadOnly) return
      const current = isNaN(numericValue) ? (isFinite(numMax) ? numMax : 0) : numericValue
      const next = Math.max(numMin, current - numStep)
      dispatchChange(next)
    }

    const handleIncrement = () => {
      if (isDisabled || isReadOnly) return
      const current = isNaN(numericValue) ? (isFinite(numMin) ? numMin : 0) : numericValue
      const next = Math.min(numMax, current + numStep)
      dispatchChange(next)
    }

    const atMin = !isNaN(numericValue) && numericValue <= numMin
    const atMax = !isNaN(numericValue) && numericValue >= numMax

    const stepperBtn = (onClick: () => void, disabled: boolean, icon: React.ReactNode, label: string) => (
      <button
        type="button"
        aria-label={label}
        tabIndex={-1}
        disabled={disabled || isDisabled || isReadOnly}
        onClick={onClick}
        className={cn(
          "flex items-center justify-center shrink-0 h-full transition-colors",
          size === "md" ? "w-9" : "w-10",
          disabled || isDisabled || isReadOnly
            ? "text-lb-on-surface-3 cursor-not-allowed"
            : "text-lb-on-surface-2 hover:bg-lb-brand-light hover:text-lb-brand cursor-pointer"
        )}
      >
        {icon}
      </button>
    )

    const fieldNode = (
      <div className="flex flex-col gap-1 w-full" data-testid={toTestId(testId, "number_field")}>
        {!fieldDesktop && label && (
          <div className="flex items-center gap-0.5">
            {required && (
              <span className="font-lb text-[14px] font-lb-bold text-lb-red">*</span>
            )}
            <span className="font-lb text-[12px] text-lb-on-surface leading-[18px] tracking-[0.0825px]">
              {label}
            </span>
          </div>
        )}

        <div className={cn(numberFieldVariants({ size, state: inputState }), className)}>
          {showSteppers && stepperBtn(
            handleDecrement,
            atMin,
            <Minus className={size === "md" ? "w-3.5 h-3.5" : "w-4 h-4"} />,
            "Decrease value"
          )}

          {showSteppers && (
            <span className="h-full w-px bg-lb-line-1 shrink-0" />
          )}

          {leftAddon && (
            <span
              className={cn(
                "flex items-center shrink-0 font-lb select-none",
                size === "md" ? "pl-2.5 text-[14px]" : "pl-3 text-[16px]",
                isDisabled ? "text-lb-on-surface-3" : "text-lb-on-surface-2"
              )}
            >
              {leftAddon}
            </span>
          )}

          <input
            ref={(node) => {
              inputRef.current = node
              if (typeof ref === "function") ref(node)
              else if (ref) (ref as React.RefObject<HTMLInputElement | null>).current = node
            }}
            type={formatNumber ? "text" : "number"}
            inputMode={formatNumber ? "numeric" : "decimal"}
            placeholder={placeholder}
            disabled={isDisabled}
            readOnly={isReadOnly}
            min={formatNumber ? undefined : min}
            max={formatNumber ? undefined : max}
            step={formatNumber ? undefined : step}
            value={displayValue}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            aria-label={label ?? "Number input"}
            data-testid={`${toTestId(testId, "number_field")}_input`}
            className={cn(
              "flex-1 min-w-0 h-full outline-none bg-transparent font-lb",
              "text-lb-on-surface placeholder:text-lb-on-surface-3",
              "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
              size === "md" ? "text-[14px] leading-[20px]" : "text-[16px] leading-[22px]",
              leftAddon ? (size === "md" ? "pl-1.5" : "pl-2") : (size === "md" ? "px-2.5" : "px-3"),
              rightAddon ? (size === "md" ? "pr-1.5" : "pr-2") : (showSteppers ? "" : size === "md" ? "pr-2.5" : "pr-3"),
              isDisabled ? "cursor-not-allowed text-lb-on-surface-3" : "",
              isReadOnly ? "cursor-default" : ""
            )}
            onKeyDown={(e) => {
              if (e.ctrlKey || e.metaKey) {
                ;(inputProps as any).onKeyDown?.(e)
                return
              }
              const nav = ["Backspace", "Delete", "Tab", "Escape", "Enter", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"]
              if (nav.includes(e.key)) {
                ;(inputProps as any).onKeyDown?.(e)
                return
              }
              if (e.key === "-") {
                if (!allowNegative) e.preventDefault()
              } else if (e.key === ".") {
                if (decimalPlaces === 0) e.preventDefault()
              } else if (/^\d$/.test(e.key)) {
                if (decimalPlaces !== undefined && decimalPlaces > 0) {
                  const raw = e.currentTarget.value.replace(/,/g, "")
                  const dotIdx = raw.indexOf(".")
                  if (dotIdx !== -1) {
                    const selStart = e.currentTarget.selectionStart ?? raw.length
                    const selEnd = e.currentTarget.selectionEnd ?? selStart
                    const decLen = raw.length - dotIdx - 1
                    if (selStart === selEnd && selStart > dotIdx && decLen >= decimalPlaces) {
                      e.preventDefault()
                    }
                  }
                }
              } else {
                e.preventDefault()
              }
              ;(inputProps as any).onKeyDown?.(e)
            }}
            {...inputProps}
          />

          {rightAddon && (
            <span
              className={cn(
                "flex items-center shrink-0 font-lb select-none",
                size === "md" ? "pr-2.5 text-[14px]" : "pr-3 text-[16px]",
                isDisabled ? "text-lb-on-surface-3" : "text-lb-on-surface-2"
              )}
            >
              {rightAddon}
            </span>
          )}

          {showSteppers && (
            <span className="h-full w-px bg-lb-line-1 shrink-0" />
          )}

          {showSteppers && stepperBtn(
            handleIncrement,
            atMax,
            <Plus className={size === "md" ? "w-3.5 h-3.5" : "w-4 h-4"} />,
            "Increase value"
          )}
        </div>

        {((fieldDesktop ? (errorText || successText) : (helperText || errorText || successText))) && (
          <span
            className={cn(
              "font-lb text-[12px] leading-[18px] tracking-[0.0825px]",
              errorText ? "text-lb-red" : successText ? "text-lb-green-text" : "text-lb-on-surface-3"
            )}
          >
            {errorText || successText || (!fieldDesktop ? helperText : undefined)}
          </span>
        )}
      </div>
    )

    return fieldDesktop ? (
      <FieldDesktopRow label={label ?? ""} required={required} helperText={helperText} tooltip={tooltip}>
        {fieldNode}
      </FieldDesktopRow>
    ) : fieldNode
  }
)

NumberField.displayName = "NumberField"

export default NumberField
