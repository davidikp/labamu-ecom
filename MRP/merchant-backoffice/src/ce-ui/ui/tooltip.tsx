"use client"

import * as React from "react"
import * as ReactDOM from "react-dom"
import { cn, toTestId } from "../lib/utils"

export const Tooltip: React.FC<{
  content: string
  children: React.ReactNode
  placement?: "top" | "bottom"
  className?: string
  testId?: string
}> = ({ content, children, placement = "top", className, testId }) => {
  const triggerRef = React.useRef<HTMLDivElement>(null)
  const [visible, setVisible] = React.useState(false)
  const [coords, setCoords] = React.useState({ top: 0, left: 0 })

  function show() {
    const rect = triggerRef.current!.getBoundingClientRect()
    setCoords({
      top: placement === "top" ? rect.top - 10 : rect.bottom + 10,
      left: rect.left + rect.width / 2,
    })
    setVisible(true)
  }

  function hide() {
    setVisible(false)
  }

  const tooltipEl = visible
    ? ReactDOM.createPortal(
        <div
          style={{
            position: "fixed",
            top: coords.top,
            left: coords.left,
            transform: placement === "top" ? "translate(-50%, -100%)" : "translate(-50%, 0)",
            zIndex: 999,
          }}
          className={cn(
            "px-3 py-2 rounded-lb-sm",
            "bg-lb-on-surface text-lb-on-surface-rev",
            "font-lb text-[12px] leading-[18px] whitespace-nowrap",
            "shadow-lb pointer-events-none"
          )}
        >
          <span
            aria-hidden="true"
            className={cn(
              "absolute left-1/2 -translate-x-1/2 w-0 h-0 block",
              placement === "top"
                ? "-bottom-[6px] border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-lb-on-surface"
                : "-top-[6px] border-l-[6px] border-r-[6px] border-b-[6px] border-l-transparent border-r-transparent border-b-lb-on-surface"
            )}
          />
          {content}
        </div>,
        document.body
      )
    : null

  return (
    <div
      ref={triggerRef}
      className={cn("relative inline-flex", className)}
      data-testid={toTestId(testId, "tooltip")}
      onMouseEnter={show}
      onMouseLeave={hide}
    >
      {children}
      {tooltipEl}
    </div>
  )
}

export default Tooltip
