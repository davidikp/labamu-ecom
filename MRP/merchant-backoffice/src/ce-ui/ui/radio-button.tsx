"use client"

import * as React from "react"
import { cn, toTestId } from "../lib/utils"

export interface RadioButtonProps {
  checked?: boolean
  onChange?: () => void
  disabled?: boolean
  label?: string
  className?: string
  testId?: string
}

export const RadioButton = React.forwardRef<HTMLButtonElement, RadioButtonProps>(
  ({ checked = false, onChange, disabled = false, label, className, testId }, ref) => (
    <label
      className={cn(
        "inline-flex items-center gap-2",
        disabled ? "cursor-not-allowed" : "cursor-pointer",
        className
      )}
    >
      <button
        ref={ref}
        role="radio"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange?.()}
        data-testid={toTestId(testId, "radio_button")}
        className={cn(
          "w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0",
          "transition-colors duration-150 outline-none",
          "focus-visible:ring-2 focus-visible:ring-lb-brand-light",
          checked && !disabled
            ? "bg-lb-surface border-lb-brand"
            : disabled
              ? "bg-lb-surface-grey border-lb-line-1"
              : "bg-lb-surface border-lb-line-2"
        )}
      >
        {checked && <span className={cn("w-2.5 h-2.5 rounded-full", disabled ? "bg-lb-line-2" : "bg-lb-brand")} />}
      </button>
      {label && (
        <span className="font-lb text-[14px] text-lb-on-surface leading-[20px] tracking-[0.0962px]">
          {label}
        </span>
      )}
    </label>
  )
)
RadioButton.displayName = "RadioButton"

export default RadioButton

