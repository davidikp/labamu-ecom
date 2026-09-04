"use client"

import * as React from "react"
import { cn, toTestId } from "../lib/utils"

export interface ChipTab {
  id: string
  label: string
  count?: number
  disabled?: boolean
}

export interface ChipTabsProps {
  tabs: ChipTab[]
  activeTab: string
  onChange: (id: string) => void
  size?: "sm" | "md"
  className?: string
  testId?: string
}

const sizeStyles = {
  md: {
    tab: "py-3 px-6 gap-2 text-[14px] leading-[18px] tracking-[0.0825px]",
    badge: "text-[12px] px-2 py-0.5",
  },
  sm: {
    tab: "py-1.5 px-4 gap-1.5 text-[12px] leading-[16px] tracking-[0.05px]",
    badge: "text-[11px] px-1.5 py-0.5",
  },
}

export const ChipTabs: React.FC<ChipTabsProps> = ({ tabs, activeTab, onChange, size = "md", className, testId }) => {
  const baseId = toTestId(testId, "chip_tabs")
  return (
  <div
    className={cn("flex items-center gap-2 overflow-x-auto", className)}
    role="tablist"
    aria-orientation="horizontal"
    data-testid={baseId}
  >
    {tabs.map((tab) => {
      const isActive = tab.id === activeTab
      return (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={isActive}
          disabled={tab.disabled}
          onClick={() => onChange(tab.id)}
          data-testid={`${baseId}_tab_${tab.id}`}
          className={cn(
            "inline-flex items-center rounded-lb-pill border whitespace-nowrap font-lb",
            "transition-all duration-150 outline-none",
            "focus-visible:ring-2 focus-visible:ring-lb-brand-light focus-visible:ring-offset-1",
            "disabled:bg-lb-surface-grey disabled:text-lb-on-surface-3 disabled:border-transparent disabled:cursor-not-allowed",
            sizeStyles[size].tab,
            isActive
              ? "bg-lb-brand-light border-lb-brand text-lb-brand font-lb-bold"
              : "bg-lb-surface border-lb-line-1 text-lb-on-surface font-lb-regular hover:border-lb-brand hover:text-lb-brand cursor-pointer"
          )}
        >
          <span>{tab.label}</span>
          {tab.count != null && (
            <span
              className={cn(
                "rounded-lb-pill font-lb-bold",
                sizeStyles[size].badge,
                isActive ? "bg-lb-brand-dark text-lb-brand" : "bg-lb-grey-bg text-lb-grey-text"
              )}
            >
              {tab.count}
            </span>
          )}
        </button>
      )
    })}
  </div>
  )
}

export default ChipTabs
