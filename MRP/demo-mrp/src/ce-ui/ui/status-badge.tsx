"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn, toTestId } from "../lib/utils"

const statusBadgeVariants = cva(
  "inline-flex items-center gap-1 px-2 py-0.5 rounded-lb-xs font-lb text-[14px] font-lb-regular leading-[18px] tracking-[0.0825px] whitespace-nowrap",
  {
    variants: {
      color: {
        grey: "",
        green: "",
        yellow: "",
        orange: "",
        red: "",
        blue: "",
      },
      tone: {
        solid: "",
        soft: "",
      },
    },
    compoundVariants: [
      { color: "grey", tone: "solid", class: "bg-lb-grey text-lb-on-surface-rev" },
      { color: "green", tone: "solid", class: "bg-lb-green text-lb-on-surface-rev" },
      { color: "yellow", tone: "solid", class: "bg-lb-yellow text-lb-on-surface-rev" },
      { color: "orange", tone: "solid", class: "bg-lb-orange text-lb-on-surface-rev" },
      { color: "red", tone: "solid", class: "bg-lb-red text-lb-on-surface-rev" },
      { color: "blue", tone: "solid", class: "bg-lb-brand text-lb-on-surface-rev" },
      { color: "grey", tone: "soft", class: "bg-lb-grey-bg text-lb-grey-text" },
      { color: "green", tone: "soft", class: "bg-lb-green-bg text-lb-green-text" },
      { color: "yellow", tone: "soft", class: "bg-lb-yellow-bg text-lb-yellow-text" },
      { color: "orange", tone: "soft", class: "bg-lb-orange-bg text-lb-orange-text" },
      { color: "red", tone: "soft", class: "bg-lb-red-bg text-lb-red-text" },
      { color: "blue", tone: "soft", class: "bg-lb-brand-light text-lb-brand-hover" },
    ],
    defaultVariants: { color: "grey", tone: "solid" },
  }
)

export interface StatusBadgeProps extends Omit<VariantProps<typeof statusBadgeVariants>, "color"> {
  /**
   * Backward-compatible alias for color.
   */
  variant?: VariantProps<typeof statusBadgeVariants>["color"]
  color?: VariantProps<typeof statusBadgeVariants>["color"]
  label: string
  dot?: boolean
  className?: string
  testId?: string
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  label,
  variant,
  color,
  tone,
  dot = false,
  className,
  testId,
}) => (
  <span
    className={cn(statusBadgeVariants({ color: color ?? variant, tone }), className)}
    data-testid={toTestId(testId, "status_badge")}
  >
    {dot && <span className="w-1.5 h-1.5 rounded-full bg-current flex-shrink-0" />}
    {label}
  </span>
)

export default StatusBadge

