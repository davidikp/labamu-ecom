"use client"

import * as React from "react"
import { cn, toTestId } from "../lib/utils"

export const StickyAction: React.FC<{
  platform?: "mobile" | "tablet" | "desktop"
  hasScroll?: boolean
  primaryAction?: { label: string; onClick: () => void; disabled?: boolean; size?: "md" | "lg" }
  secondaryAction?: { label: string; onClick: () => void; disabled?: boolean }
  iconAction?: { icon: React.ReactNode; onClick: () => void }
  destructiveAction?: { label: string; onClick: () => void }
  subtotal?: { label: string; amount: string }
  className?: string
  testId?: string
}> = ({
  platform = "mobile",
  hasScroll = false,
  primaryAction,
  secondaryAction,
  iconAction,
  destructiveAction,
  subtotal,
  className,
  testId,
}) => {
  const showBg = platform !== "mobile" || hasScroll
  return (
    <div
      data-testid={toTestId(testId, "sticky_action")}
      className={cn(
        "sticky bottom-0 z-[100]",
        showBg && "bg-lb-surface border-t border-lb-line-1 shadow-lb",
        platform === "mobile" && "px-4 py-3 flex flex-col gap-2",
        platform === "tablet" && "px-5 py-3 flex justify-between items-center gap-4",
        platform === "desktop" && "px-6 py-3 flex justify-between items-center gap-6",
        className
      )}
    >
      {platform !== "desktop" && (
        <div className="flex items-center gap-2 ml-auto">
          {iconAction && (
            <button
              onClick={iconAction.onClick}
              className="w-11 h-11 flex items-center justify-center rounded-lb-sm border border-lb-brand bg-lb-surface text-lb-brand hover:bg-lb-brand-light transition-colors duration-150 cursor-pointer flex-shrink-0"
              type="button"
            >
              {iconAction.icon}
            </button>
          )}
          {subtotal && platform === "tablet" && (
            <div className="flex flex-col gap-0.5 mr-auto">
              <span className="font-lb text-[10px] text-lb-on-surface-2 leading-[16px]">{subtotal.label}</span>
              <span className="font-lb text-[16px] font-lb-bold text-lb-on-surface">{subtotal.amount}</span>
            </div>
          )}
          {secondaryAction && (
            <button
              onClick={secondaryAction.onClick}
              disabled={secondaryAction.disabled}
              className="h-11 px-6 rounded-lb-sm border border-lb-brand bg-lb-surface text-lb-brand font-lb text-[16px] font-lb-regular hover:enabled:bg-lb-brand-light disabled:bg-lb-surface-grey disabled:text-lb-on-surface-3 disabled:border-lb-line-1 transition-colors duration-150 cursor-pointer"
              type="button"
            >
              {secondaryAction.label}
            </button>
          )}
          {primaryAction && (
            <button
              onClick={primaryAction.onClick}
              disabled={primaryAction.disabled}
              className="h-11 px-6 rounded-lb-sm bg-lb-brand text-lb-brand-on font-lb text-[16px] font-lb-regular hover:enabled:bg-lb-brand-hover disabled:bg-lb-surface-grey disabled:text-lb-on-surface-3 transition-colors duration-150 border-none cursor-pointer"
              type="button"
            >
              {primaryAction.label}
            </button>
          )}
        </div>
      )}

      {platform === "desktop" && (
        <>
          {destructiveAction && (
            <button
              onClick={destructiveAction.onClick}
              className="font-lb text-[14px] font-lb-bold text-lb-red bg-transparent border-none cursor-pointer hover:underline"
              type="button"
            >
              {destructiveAction.label}
            </button>
          )}
          <div className="flex items-center gap-2 ml-auto">
            {secondaryAction && (
              <button
                onClick={secondaryAction.onClick}
                disabled={secondaryAction.disabled}
                className="h-[50px] px-6 rounded-lb-btn border border-lb-brand bg-lb-surface text-lb-brand font-lb text-[16px] font-lb-regular hover:enabled:bg-lb-brand-light disabled:opacity-50 transition-colors duration-150 cursor-pointer"
                type="button"
              >
                {secondaryAction.label}
              </button>
            )}
            {primaryAction && (
              <button
                onClick={primaryAction.onClick}
                disabled={primaryAction.disabled}
                className="h-[50px] px-6 rounded-lb-btn bg-lb-brand text-lb-brand-on font-lb text-[16px] font-lb-regular hover:enabled:bg-lb-brand-hover disabled:bg-lb-surface-grey disabled:text-lb-on-surface-3 transition-colors duration-150 border-none cursor-pointer"
                type="button"
              >
                {primaryAction.label}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default StickyAction

