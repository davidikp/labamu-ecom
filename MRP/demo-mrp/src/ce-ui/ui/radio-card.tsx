"use client"

import * as React from "react"
import { cn, toTestId } from "../lib/utils"
import { FieldDesktopRow } from "./field-desktop"

export interface RadioCardOption {
  value: string
  label: string
  description?: string
  disabled?: boolean
}

export interface RadioCardProps {
  options: RadioCardOption[]
  value?: string
  onChange?: (value: string) => void
  disabled?: boolean
  label?: string
  required?: boolean
  helperText?: string
  tooltip?: string
  fieldDesktop?: boolean
  className?: string
  testId?: string
}

export const RadioCard: React.FC<RadioCardProps> = ({
  options,
  value,
  onChange,
  disabled = false,
  label,
  required,
  helperText,
  tooltip,
  fieldDesktop = false,
  className,
  testId,
}) => {
  const baseId = toTestId(testId, "radio_card")
  const cardContent = (
  <div
    className={cn("flex flex-wrap gap-3", className)}
    data-testid={baseId}
  >
    {options.map((opt) => {
      const checked = value === opt.value
      const isDisabled = disabled || opt.disabled

      return (
        <button
          key={opt.value}
          type="button"
          role="radio"
          aria-checked={checked}
          disabled={isDisabled}
          onClick={() => !isDisabled && onChange?.(opt.value)}
          data-testid={`${baseId}_${opt.value}`}
          className={cn(
            "flex items-start gap-3 text-left rounded-lg border-2 px-4 py-3 flex-1 min-w-[200px]",
            "transition-colors duration-150 outline-none",
            "focus-visible:ring-2 focus-visible:ring-lb-brand-light focus-visible:ring-offset-1",
            checked && !isDisabled && "border-lb-brand bg-lb-brand-dark",
            !checked && !isDisabled && "border-lb-line-1 bg-lb-surface hover:border-lb-line-2",
            isDisabled && "border-lb-line-1 bg-lb-surface-grey cursor-not-allowed",
          )}
        >
          <span
            className={cn(
              "mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors",
              checked && !isDisabled ? "border-lb-brand bg-lb-surface" : "",
              !checked && !isDisabled ? "border-lb-line-2 bg-lb-surface" : "",
              isDisabled ? "border-lb-line-1 bg-lb-surface-grey" : "",
            )}
          >
            {checked && (
              <span className={cn("w-2 h-2 rounded-full", isDisabled ? "bg-lb-line-2" : "bg-lb-brand")} />
            )}
          </span>

          <span className="flex flex-col gap-0.5">
            <span
              className={cn(
                "font-lb font-lb-bold text-[14px] leading-[20px] tracking-[0.0962px]",
                isDisabled ? "text-lb-on-surface-3" : "text-lb-on-surface",
              )}
            >
              {opt.label}
            </span>
            {opt.description && (
              <span
                className={cn(
                  "font-lb font-lb-regular text-[13px] leading-[18px] tracking-[0.0825px]",
                  isDisabled ? "text-lb-on-surface-3" : "text-lb-on-surface-2",
                )}
              >
                {opt.description}
              </span>
            )}
          </span>
        </button>
      )
    })}
  </div>
  )

  return fieldDesktop ? (
    <FieldDesktopRow label={label ?? ""} required={required} helperText={helperText} tooltip={tooltip}>
      {cardContent}
    </FieldDesktopRow>
  ) : cardContent
}

export default RadioCard
