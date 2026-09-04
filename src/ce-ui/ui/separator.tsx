"use client"

import * as React from "react"
import { cn, toTestId } from "../lib/utils"

export const Separator: React.FC<{ variant?: "thin" | "thick"; className?: string; testId?: string }> = ({
  variant = "thin",
  className,
  testId,
}) => (
  <div
    role="separator"
    className={cn("w-full", variant === "thin" ? "h-px bg-lb-line-1" : "h-1 bg-lb-surface-grey", className)}
    data-testid={toTestId(testId, "separator")}
  />
)

export default Separator

