"use client"

import * as React from "react"
import { cn, toTestId } from "../lib/utils"

export interface Tab {
  id: string
  label: string
  count?: number
}

export const Tabs: React.FC<{
  tabs: Tab[]
  activeTab: string
  onChange: (id: string) => void
  className?: string
  testId?: string
}> = ({ tabs, activeTab, onChange, className, testId }) => (
  <div
    className={cn("flex border-b border-lb-line-1 overflow-x-auto", className)}
    role="tablist"
    aria-orientation="horizontal"
    data-testid={toTestId(testId, "tabs")}
  >
    {tabs.map((tab) => {
      const isActive = tab.id === activeTab
      return (
        <button
          key={tab.id}
          role="tab"
          aria-selected={isActive}
          data-testid={`${toTestId(testId, "tabs")}_tab_${tab.id}`}
          onClick={() => onChange(tab.id)}
          className={cn(
            "relative flex items-center gap-1.5 px-4 h-11 flex-shrink-0",
            "font-lb text-[14px] leading-[20px] tracking-[0.0962px]",
            "border-none bg-transparent cursor-pointer transition-colors duration-150",
            isActive ? "text-lb-brand font-lb-bold" : "text-lb-on-surface-2 font-lb-regular hover:text-lb-on-surface"
          )}
          type="button"
        >
          {tab.label}
          {tab.count != null && (
            <span
              className={cn(
                "text-[12px] font-lb-bold px-2 py-0.5 rounded-lb-pill",
                isActive ? "bg-lb-brand-dark text-lb-brand" : "bg-lb-grey-bg text-lb-grey-text"
              )}
            >
              {tab.count}
            </span>
          )}
          {isActive && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-lb-brand rounded-t-full" />}
        </button>
      )
    })}
  </div>
)

export default Tabs

