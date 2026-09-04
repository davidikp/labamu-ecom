"use client"

import * as React from "react"
import { cn, toTestId } from "../lib/utils"
import { MainBtn } from "./main-btn"

export const Popup: React.FC<{
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  platform?: "mobile" | "tablet" | "desktop"
  /** Header text alignment.
   *  - "center" (default): confirmation/alert modals
   *  - "left": form modals with input fields */
  align?: "center" | "left"
  primaryAction?: { label: string; onClick: () => void; disabled?: boolean; loading?: boolean; destructive?: boolean }
  secondaryAction?: { label: string; onClick: () => void; loading?: boolean }
  children?: React.ReactNode
  className?: string
  testId?: string
}> = ({
  open,
  onClose,
  title,
  description,
  platform = "mobile",
  align = "center",
  primaryAction,
  secondaryAction,
  children,
  className,
  testId,
}) => {
  React.useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  if (!open) return null

  const panelClass =
    {
      mobile: "w-full rounded-t-3xl rounded-b-none max-h-[680px]",
      tablet: "w-[480px] rounded-lb-card max-h-[90vh]",
      desktop: "w-[560px] rounded-lb-card max-h-[90vh]",
    }[platform] ?? "w-full"

  return (
    <div
      className={cn("fixed inset-0 z-[200] flex justify-center", platform === "mobile" ? "items-end" : "items-center")}
      data-testid={toTestId(testId, "popup")}
    >
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className={cn("relative bg-lb-surface shadow-lb flex flex-col overflow-hidden", panelClass, className)}>
        {platform === "mobile" && (
          <div className="w-10 h-1 rounded-lb-pill bg-lb-line-2 mx-auto mt-2 flex-shrink-0" />
        )}

        {(title || description) && (
          <div className={cn("relative px-6 pt-6 flex-shrink-0", align === "left" ? "text-left" : "text-center")}>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-6 h-6 flex items-center justify-center text-lb-on-surface hover:bg-lb-surface-grey transition-colors bg-transparent border-none cursor-pointer rounded-full"
              type="button"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
            {title && (
              <h2 className="font-lb text-[20px] font-lb-bold text-lb-on-surface leading-[30px] tracking-[0.1375px] m-0">
                {title}
              </h2>
            )}
            {description && (
              <p className="font-lb text-[14px] text-lb-on-surface-2 leading-[20px] tracking-[0.0962px] mt-2 mb-0">
                {description}
              </p>
            )}
          </div>
        )}

        {children && <div className="flex-1 overflow-y-auto px-6 py-4 min-h-0">{children}</div>}

        {(primaryAction || secondaryAction) && (
          <div className="px-6 py-4 border-t border-lb-line-1 bg-lb-surface flex gap-3 flex-shrink-0">
            {secondaryAction && (
              <MainBtn
                className="flex-1"
                variant="secondary"
                size="lg"
                label={secondaryAction.label}
                onClick={secondaryAction.onClick}
                loading={secondaryAction.loading}
              />
            )}
            {primaryAction && (
              <MainBtn
                className={cn(
                  "flex-1",
                  primaryAction.destructive && "!bg-lb-red hover:enabled:!bg-lb-red hover:enabled:!opacity-90"
                )}
                variant="primary"
                size="lg"
                label={primaryAction.label}
                onClick={primaryAction.onClick}
                disabled={primaryAction.disabled}
                loading={primaryAction.loading}
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Popup

