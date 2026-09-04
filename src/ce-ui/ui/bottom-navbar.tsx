"use client"

import * as React from "react"
import { cn, toTestId } from "../lib/utils"

export interface BottomNavItem {
  id: string
  label: string
  icon: React.ReactNode
  badge?: number
}

export const BottomNavbar: React.FC<{
  items: BottomNavItem[]
  activeId: string
  onNavigate: (id: string) => void
  className?: string
  testId?: string
}> = ({ items, activeId, onNavigate, className, testId }) => (
  <nav
    className={cn("fixed bottom-0 left-0 right-0 z-[100] flex", "bg-lb-surface border-t border-lb-line-1 shadow-lb", className)}
    data-testid={toTestId(testId, "bottom_navbar")}
  >
    {items.map((item) => {
      const active = item.id === activeId
      return (
        <button
          key={item.id}
          data-testid={`${toTestId(testId, "bottom_navbar")}_item_${item.id}`}
          onClick={() => onNavigate(item.id)}
          className="flex-1 flex flex-col items-center justify-center gap-1 py-2 h-16 border-none bg-transparent cursor-pointer transition-colors duration-150"
          type="button"
        >
          <div className="relative">
            <span className={cn("w-6 h-6 flex items-center justify-center", active ? "text-lb-brand" : "text-lb-on-surface-3")}>
              {item.icon}
            </span>
            {item.badge != null && item.badge > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-lb-red text-lb-on-surface-rev text-[10px] font-lb-bold rounded-lb-pill flex items-center justify-center font-lb">
                {item.badge > 99 ? "99+" : item.badge}
              </span>
            )}
          </div>
          <span className={cn("font-lb text-[10px] leading-[16px] tracking-[0.0688px]", active ? "text-lb-brand font-lb-bold" : "text-lb-on-surface-3 font-lb-regular")}>
            {item.label}
          </span>
        </button>
      )
    })}
  </nav>
)

export default BottomNavbar

