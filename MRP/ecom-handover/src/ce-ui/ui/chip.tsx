"use client"

import * as React from "react"
import { cn, toTestId } from "../lib/utils"

export const Chip: React.FC<{
  label: string
  selected?: boolean
  onSelect?: () => void
  onRemove?: () => void
  icon?: React.ReactNode
  disabled?: boolean
  className?: string
  testId?: string
}> = ({ label, selected, onSelect, onRemove, icon, disabled, className, testId }) => (
  <button
    data-testid={toTestId(testId, "chip")}
    onClick={() => !disabled && onSelect?.()}
    disabled={disabled}
    type="button"
    className={cn(
      "inline-flex items-center gap-2 py-3 px-6 rounded-lb-pill border",
      "font-lb text-[14px] leading-[18px] tracking-[0.0825px]",
      "transition-all duration-150 outline-none",
      "focus-visible:ring-2 focus-visible:ring-lb-brand-light focus-visible:ring-offset-1",
      "[&_svg]:transition-colors [&_svg]:duration-150",

      !disabled && !selected &&
        "bg-lb-surface border-lb-line-1 text-lb-on-surface font-lb-regular hover:border-lb-brand hover:text-lb-brand cursor-pointer",
      !disabled && selected &&
        "bg-lb-brand-light border-lb-brand text-lb-brand font-lb-bold cursor-pointer",
      disabled &&
        "bg-lb-surface-grey border-transparent text-lb-on-surface-3 cursor-not-allowed",

      className
    )}
  >
    {icon && (
      <span className="shrink-0 inline-flex items-center justify-center w-5 h-5">
        {icon}
      </span>
    )}
    <span>{label}</span>
    {onRemove && selected && !disabled && (
      <span
        onClick={(e) => { e.stopPropagation(); onRemove() }}
        className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-lb-brand/10 transition-colors"
      >
        <svg width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden="true">
          <path d="M6 2L2 6M2 2l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </span>
    )}
  </button>
)

export default Chip
