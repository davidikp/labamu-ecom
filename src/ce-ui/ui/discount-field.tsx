"use client"

import * as React from "react"
import { cn, toTestId } from "../lib/utils"

export const DiscountField: React.FC<{
  type?: "percent" | "nominal"
  onTypeChange?: (type: "percent" | "nominal") => void
  value?: string
  onChange?: (value: string) => void
  disabled?: boolean
  error?: boolean
  errorText?: string
  className?: string
  testId?: string
}> = ({ type = "percent", onTypeChange, value = "", onChange, disabled, error, errorText, className, testId }) => {
  const isNominal = type === "nominal"
  const baseId = toTestId(testId, "discount_field")

  return (
    <div className={cn("flex flex-col gap-1", className)} data-testid={baseId}>
      <div className="flex gap-2 items-center">
        <div
          className={cn(
            "flex p-1 border rounded-lb-input h-[46px] flex-shrink-0",
            disabled ? "border-lb-line-1" : "border-lb-brand"
          )}
        >
          {(["nominal", "percent"] as const).map((t) => (
            <button
              key={t}
              disabled={disabled}
              onClick={() => !disabled && onTypeChange?.(t)}
              className={cn(
                "px-3 rounded-lb-sm font-lb text-[14px]",
                "font-lb-regular transition-colors duration-150 h-full border-none cursor-pointer",
                type === t
                  ? disabled
                    ? "bg-lb-surface-grey text-lb-on-surface-3"
                    : "bg-lb-brand text-lb-brand-on"
                  : disabled
                    ? "bg-transparent text-lb-on-surface-3"
                    : "bg-transparent text-lb-brand"
              )}
              type="button"
              data-testid={`${baseId}_${t}`}
            >
              {t === "nominal" ? "IDR" : "%"}
            </button>
          ))}
        </div>

        <div className="relative flex-1">
          {isNominal && (
            <span className={cn("absolute left-3 top-1/2 -translate-y-1/2 font-lb text-[14px] leading-none", disabled ? "text-lb-on-surface-3" : "text-lb-on-surface")}>
              IDR
            </span>
          )}
          <input
            type="number"
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            disabled={disabled}
            placeholder="0"
            data-testid={`${baseId}_input`}
            className={cn(
              "w-full h-[46px] rounded-lb-input border",
              "font-lb text-[14px] text-lb-on-surface text-right",
              "outline-none transition-all duration-200",
              isNominal ? "pl-14 pr-3" : "pl-3 pr-10",
              error
                ? "border-lb-red focus:border-lb-red focus:shadow-[0_0_0_3px_theme(colors.lb-red-bg)]"
                : "border-lb-line-1 hover:border-lb-line-2 focus:border-lb-brand focus:shadow-[0_0_0_3px_theme(colors.lb-brand-light)]",
              disabled && "bg-lb-surface-grey text-lb-on-surface-3 cursor-not-allowed"
            )}
          />
          {!isNominal && (
            <span className={cn("absolute right-3 top-1/2 -translate-y-1/2 font-lb text-[14px] leading-none", disabled ? "text-lb-on-surface-3" : "text-lb-on-surface")}>
              %
            </span>
          )}
        </div>
      </div>
      {errorText && <span className="font-lb text-[12px] text-lb-red">{errorText}</span>}
    </div>
  )
}

export default DiscountField

