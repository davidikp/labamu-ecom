"use client"

import * as React from "react"
import { CircleHelp } from "lucide-react"
import { cn, toTestId } from "../lib/utils"
import { Tooltip } from "./tooltip"

export const FieldDesktopRow: React.FC<{
  label: string
  required?: boolean
  helperText?: string
  tooltip?: string
  children: React.ReactNode
  className?: string
  testId?: string
}> = ({ label, required, helperText, tooltip, children, className, testId }) => (
  <div className={cn("flex gap-11 items-start", className)} data-testid={toTestId(testId, "field_desktop_row")}>
    <div className="w-[240px] flex-shrink-0 flex flex-col gap-1 pt-3">
      <div className="flex items-center gap-0.5">
        {required && <span className="font-lb text-[14px] font-lb-bold text-lb-red">*</span>}
        <span className="font-lb text-[14px] text-lb-on-surface leading-[20px] tracking-[0.0962px]">
          {label}
        </span>
        {tooltip && (
          <Tooltip content={tooltip} placement="top">
            <CircleHelp size={14} className="text-lb-on-surface-3 ml-1 cursor-default" aria-label={tooltip} />
          </Tooltip>
        )}
      </div>
      {helperText && <span className="font-lb text-[12px] text-lb-on-surface-2 leading-[18px] italic">{helperText}</span>}
    </div>
    <div className="w-[552px] flex-shrink-0">{children}</div>
  </div>
)

export const FieldDesktop: React.FC<{ children: React.ReactNode; className?: string; testId?: string }> = ({
  children,
  className,
  testId,
}) => (
  <div className={cn("flex flex-col gap-5", className)} data-testid={toTestId(testId, "field_desktop")}>
    {children}
  </div>
)

export default FieldDesktop
