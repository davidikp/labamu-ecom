"use client"

import * as React from "react"
import { ChevronRight, X } from "lucide-react"
import { cn, toTestId } from "../lib/utils"

export type FilterCardBadgeColor = "blue" | "green" | "yellow" | "orange" | "red" | "grey"

const badgeColorMap: Record<FilterCardBadgeColor, string> = {
  blue: "bg-lb-brand-dark text-lb-brand",
  green: "bg-lb-green-bg text-lb-green-text",
  yellow: "bg-lb-yellow-bg text-lb-yellow-text",
  orange: "bg-lb-orange-bg text-lb-orange-text",
  red: "bg-lb-red-bg text-lb-red-text",
  grey: "bg-lb-grey-bg text-lb-grey-text",
}

export interface FilterCardProps {
  label: string
  count?: number
  /** Badge color — defaults to "blue" */
  badgeColor?: FilterCardBadgeColor
  selected?: boolean
  onChange?: (selected: boolean) => void
  className?: string
  testId?: string
}

export const FilterCard: React.FC<FilterCardProps> = ({
  label,
  count,
  badgeColor = "blue",
  selected = false,
  onChange,
  className,
  testId,
}) => (
  <button
    data-testid={toTestId(testId, "filter_card")}
    onClick={() => onChange?.(!selected)}
    type="button"
    className={cn(
      "flex items-center justify-between gap-2 md:gap-3",
      "min-h-[40px] md:min-h-[52px] px-3 md:px-4 py-2 md:py-3 rounded-lb-card border",
      "font-lb cursor-pointer transition-all duration-150",
      selected
        ? "bg-lb-brand-light border-lb-brand text-lb-on-surface"
        : "bg-lb-surface border-lb-line-1 text-lb-on-surface hover:border-lb-line-2",
      className
    )}
  >
    <span className="flex-1 text-left text-[12px] md:text-[14px] font-lb-regular leading-[16px] md:leading-[20px]">
      {label}
    </span>

    <div className="flex items-center gap-1.5 md:gap-2 flex-shrink-0">
      {count !== undefined && (
        <span
          className={cn(
            "inline-flex items-center justify-center min-w-[22px] md:min-w-[28px] h-5 md:h-7 px-1.5 md:px-2 rounded-lb-sm",
            "text-[11px] md:text-[14px] font-lb-bold leading-[16px] md:leading-[20px]",
            badgeColorMap[badgeColor]
          )}
        >
          {count}
        </span>
      )}
      {selected
        ? <X className="text-lb-on-surface-2 w-[14px] h-[14px] md:w-[20px] md:h-[20px]" aria-hidden="true" />
        : <ChevronRight className="text-lb-on-surface-2 w-[14px] h-[14px] md:w-[20px] md:h-[20px]" aria-hidden="true" />
      }
    </div>
  </button>
)

export default FilterCard
