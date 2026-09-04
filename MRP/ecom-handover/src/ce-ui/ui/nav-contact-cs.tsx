"use client"

import * as React from "react"
import { ChevronRight, MessageCircleQuestion } from "lucide-react"
import { cn, toTestId } from "../lib/utils"

// ── Types ─────────────────────────────────────────────────────────────────────

export interface NavContactCSProps {
  /** Button label. Defaults to "Hubungi CS Labamu". */
  label?: string
  /** When true, renders icon-only mode (collapsed sidebar). */
  collapsed?: boolean
  onClick?: () => void
  /** Override the left icon. Defaults to MessageCircleQuestion. */
  icon?: React.ReactNode
  className?: string
  testId?: string
}

// ── NavContactCS ──────────────────────────────────────────────────────────────

export const NavContactCS: React.FC<NavContactCSProps> = ({
  label = "Hubungi CS Labamu",
  collapsed = false,
  onClick,
  icon,
  className,
  testId,
}) => (
  <button
    type="button"
    onClick={onClick}
    data-testid={toTestId(testId, "nav_contact_cs")}
    className={cn(
      "flex items-center justify-center",
      "bg-[linear-gradient(135deg,#FFD337,#FFBF1C)] text-lb-on-surface",
      "font-lb font-lb-bold text-[12px] leading-[20px]",
      "transition-opacity hover:opacity-90 active:opacity-80",
      collapsed
        ? "w-10 h-10 rounded-[10px]"
        : "w-full gap-3 px-4 py-3 rounded-[12px]",
      className
    )}
  >
    <span className="shrink-0 flex items-center justify-center">
      {icon ?? <MessageCircleQuestion className="w-6 h-6" />}
    </span>
    {!collapsed && (
      <>
        <span className="flex-1 text-left truncate">{label}</span>
        <ChevronRight className="w-4 h-4 shrink-0" />
      </>
    )}
  </button>
)

export default NavContactCS
