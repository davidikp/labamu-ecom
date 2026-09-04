"use client"

import * as React from "react"
import { cn, toTestId } from "../lib/utils"

export interface SideTabItem {
  value: string
  label: string
  /** Optional badge rendered to the right of the label. */
  badge?: React.ReactNode
  disabled?: boolean
}

export interface SideTabsProps {
  items: SideTabItem[]
  value?: string
  onChange?: (value: string) => void
  className?: string
  testId?: string
}

export const SideTabs: React.FC<SideTabsProps> = ({
  items,
  value,
  onChange,
  className,
  testId,
}) => (
  <div className={cn("flex flex-col", className)} data-testid={toTestId(testId, "side_tabs")}>
    {items.map((item) => {
      const isActive = value === item.value
      const isDisabled = item.disabled

      return (
        <button
          key={item.value}
          type="button"
          disabled={isDisabled}
          onClick={() => !isDisabled && onChange?.(item.value)}
          className={cn(
            "w-full flex items-center justify-between gap-3 py-3.5 pr-5 text-left",
            "font-lb text-[14px] leading-[20px] tracking-[0.0962px]",
            "border-l-[3px] transition-colors duration-150 outline-none",
            "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-lb-brand",
            isActive
              ? "border-lb-brand bg-lb-brand-dark text-lb-brand font-lb-bold pl-[calc(1.25rem-3px)]"
              : isDisabled
                ? "border-transparent text-lb-on-surface-3 cursor-not-allowed pl-5"
                : "border-transparent text-lb-on-surface hover:bg-lb-surface-grey pl-5",
          )}
        >
          <span>{item.label}</span>
          {item.badge && <span className="flex-shrink-0">{item.badge}</span>}
        </button>
      )
    })}
  </div>
)

export default SideTabs
