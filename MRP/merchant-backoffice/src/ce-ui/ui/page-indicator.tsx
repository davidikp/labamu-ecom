"use client"

import * as React from "react"
import { cn, toTestId } from "../lib/utils"

export const PageIndicator: React.FC<{
  count: number
  active: number
  variant?: "dark" | "light"
  className?: string
  testId?: string
}> = ({ count, active, variant = "dark", className, testId }) => (
  <div className={cn("flex items-center gap-1.5", className)} data-testid={toTestId(testId, "page_indicator")}>
    {Array.from({ length: count }).map((_, i) => (
      <span
        key={i}
        className="w-1.5 h-1.5 rounded-full transition-colors duration-200"
        style={{
          backgroundColor:
            i === active
              ? variant === "dark"
                ? "rgba(40,40,40,0.40)"
                : "rgba(255,255,255,1.0)"
              : variant === "dark"
                ? "rgba(40,40,40,0.10)"
                : "rgba(255,255,255,0.30)",
        }}
      />
    ))}
  </div>
)

export default PageIndicator

