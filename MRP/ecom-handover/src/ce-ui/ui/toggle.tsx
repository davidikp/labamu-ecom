"use client"

import * as React from "react"
import { cn, toTestId } from "../lib/utils"
import { FieldDesktopRow } from "./field-desktop"

export interface ToggleProps {
  checked?: boolean
  onChange?: (checked: boolean) => void
  disabled?: boolean
  size?: "big" | "small"
  label?: string
  required?: boolean
  helperText?: string
  tooltip?: string
  fieldDesktop?: boolean
  className?: string
  testId?: string
}

export const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(
  ({ checked = false, onChange, disabled = false, size = "big", label, required, helperText, tooltip, fieldDesktop = false, className, testId }, ref) => {
    const isBig = size === "big"
    const trackBg = disabled
      ? checked
        ? "bg-lb-line-1"
        : "bg-lb-surface-grey"
      : checked
        ? "bg-lb-brand"
        : "bg-lb-surface-grey"
    const trackBorder = checked
      ? "border border-transparent"
      : disabled
        ? "border border-lb-line-1"
        : "border border-transparent"
    // Track padding is 3px on both sides.
    // big: 51 - 26 - 6 = 19px, small: 40 - 18 - 6 = 16px
    const knobTranslate = checked ? (isBig ? "translate-x-[19px]" : "translate-x-[16px]") : "translate-x-0"

    const toggleBtn = (
      <button
        ref={ref}
        data-testid={toTestId(testId, "toggle")}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange?.(!checked)}
        className={cn(
          "relative rounded-lb-pill transition-colors duration-200",
          "focus-visible:ring-2 focus-visible:ring-lb-brand-light focus-visible:ring-offset-2 focus-visible:ring-offset-lb-surface outline-none",
          isBig ? "w-[51px] h-[32px]" : "w-[40px] h-[24px]",
          trackBg,
          trackBorder,
          disabled && "cursor-not-allowed",
          className
        )}
      >
        <span
          className={cn(
            "absolute top-1/2 -translate-y-1/2 left-[3px] bg-lb-surface rounded-full",
            checked ? "border border-transparent" : "border border-transparent",
            "shadow-[0_4px_4px_rgba(0,0,0,0.15)] transition-transform duration-200",
            isBig ? "w-[26px] h-[26px]" : "w-[18px] h-[18px]",
            knobTranslate
          )}
        />
      </button>
    )

    return fieldDesktop ? (
      <FieldDesktopRow label={label ?? ""} required={required} helperText={helperText} tooltip={tooltip}>
        {toggleBtn}
      </FieldDesktopRow>
    ) : toggleBtn
  }
)
Toggle.displayName = "Toggle"

export default Toggle

