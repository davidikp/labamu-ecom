"use client"

import * as React from "react"
import { cn, toTestId } from "../lib/utils"

export interface CheckboxProps {
  checked?: boolean | "indeterminate"
  onChange?: (checked: boolean) => void
  disabled?: boolean
  label?: string
  className?: string
  testId?: string
}

export const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
  ({ checked = false, onChange, disabled = false, label, className, testId }, ref) => {
    const isChecked = checked === true
    const isIndeterminate = checked === "indeterminate"
    const filled = isChecked || isIndeterminate

    return (
      <label
        data-testid={toTestId(testId, "checkbox")}
        className={cn(
          "inline-flex items-center gap-2",
          disabled ? "cursor-not-allowed" : "cursor-pointer",
          className
        )}
      >
        <button
          ref={ref}
          role="checkbox"
          aria-checked={isIndeterminate ? "mixed" : isChecked}
          disabled={disabled}
          onClick={() => !disabled && onChange?.(!isChecked)}
          className={cn(
            "w-6 h-6 rounded-lb-xs border flex items-center justify-center flex-shrink-0",
            "transition-colors duration-150 outline-none",
            "focus-visible:ring-2 focus-visible:ring-lb-brand-light",
            filled && !disabled
              ? "bg-lb-brand border-lb-brand"
              : disabled
                ? "bg-lb-surface-grey border-lb-line-1"
                : "bg-lb-surface border-lb-line-2"
          )}
        >
          {isChecked && (
            <svg width="14" height="11" viewBox="0 0 14 11" fill="none" aria-hidden="true">
              <path
                d="M1 5.5L5 9.5L13 1.5"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
          {isIndeterminate && (
            <svg width="10" height="2" viewBox="0 0 10 2" fill="none" aria-hidden="true">
              <path d="M1 1H9" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          )}
        </button>
        {label && (
          <span className="font-lb text-[14px] text-lb-on-surface leading-[20px] tracking-[0.0962px]">
            {label}
          </span>
        )}
      </label>
    )
  }
)
Checkbox.displayName = "Checkbox"

export default Checkbox

