"use client"

import * as React from "react"
import { cn, toTestId } from "../lib/utils"

export const StickyHeader: React.FC<{
  title: string
  onBack?: () => void
  rightAction?: React.ReactNode
  className?: string
  testId?: string
}> = ({ title, onBack, rightAction, className, testId }) => (
  <div
    data-testid={toTestId(testId, "sticky_header")}
    className={cn(
      "sticky top-0 z-[100] h-14 px-4 flex items-center gap-3",
      "bg-lb-surface border-b border-lb-line-1",
      "shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]",
      className
    )}
  >
    {onBack && (
      <button
        onClick={onBack}
        className="w-10 h-10 flex items-center justify-center rounded-lb-sm border-none bg-transparent text-lb-on-surface cursor-pointer hover:bg-lb-surface-grey transition-colors duration-150"
        type="button"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path
            d="M12.5 15L7.5 10L12.5 5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    )}
    <h1 className="flex-1 font-lb text-[18px] font-lb-bold text-lb-on-surface leading-[26px] tracking-[0.1238px] truncate">
      {title}
    </h1>
    {rightAction}
  </div>
)

export default StickyHeader

