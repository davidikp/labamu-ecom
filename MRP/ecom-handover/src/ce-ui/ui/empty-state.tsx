"use client"

import * as React from "react"
import { cn, toTestId } from "../lib/utils"

export const EmptyState: React.FC<{
  illustration?: React.ReactNode
  title: string
  description?: string
  action?: { label: string; onClick: () => void }
  className?: string
  testId?: string
}> = ({ illustration, title, description, action, className, testId }) => (
  <div
    className={cn("flex flex-col items-center justify-center gap-4 py-16 px-6 text-center", className)}
    data-testid={toTestId(testId, "empty_state")}
  >
    {illustration && <div className="w-40 h-40 flex items-center justify-center">{illustration}</div>}
    <div className="flex flex-col gap-2">
      <h3 className="font-lb text-[18px] font-lb-bold text-lb-on-surface leading-[26px] tracking-[0.1238px] m-0">
        {title}
      </h3>
      {description && (
        <p className="font-lb text-[14px] text-lb-on-surface-2 leading-[20px] tracking-[0.0962px] max-w-[280px] m-0">
          {description}
        </p>
      )}
    </div>
    {action && (
      <button
        onClick={action.onClick}
        className="h-11 px-6 rounded-lb-sm bg-lb-brand text-lb-brand-on font-lb text-[16px] font-lb-regular hover:bg-lb-brand-hover transition-colors duration-150 border-none cursor-pointer"
        type="button"
      >
        {action.label}
      </button>
    )}
  </div>
)

export default EmptyState

