"use client"

import * as React from "react"
import ReactDOM from "react-dom"
import { Bell, ChevronDown, LogOut, User } from "lucide-react"
import { cn, toTestId } from "../lib/utils"
import { NotificationPanel } from "./notification-panel"
import type { NotificationItem } from "./notification-panel"

// ── Types ─────────────────────────────────────────────────────────────────────

export interface TopHeaderProps {
  userName: string
  userRole: string
  /** Notification count. Numbers > 99 display as "99+". 0 or undefined hides the badge. */
  notificationCount?: number
  /**
   * When provided, clicking the bell opens the built-in notification panel.
   * When omitted, `onNotificationClick` is called instead.
   */
  notifications?: NotificationItem[]
  /** Label for the "read all" action inside the notification panel. */
  readAllLabel?: string
  onReadAll?: () => void
  /** Called when the bell is clicked and `notifications` prop is NOT provided. */
  onNotificationClick?: () => void
  onProfileClick?: () => void
  onLogoutClick?: () => void
  className?: string
  testId?: string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmtCount = (n: number): string => (n > 99 ? "99+" : String(n))

// ── TopHeader ─────────────────────────────────────────────────────────────────

export const TopHeader: React.FC<TopHeaderProps> = ({
  userName,
  userRole,
  notificationCount,
  notifications,
  readAllLabel,
  onReadAll,
  onNotificationClick,
  onProfileClick,
  onLogoutClick,
  className,
  testId,
}) => {
  const [menuOpen, setMenuOpen] = React.useState(false)
  const [menuPos, setMenuPos] = React.useState({ top: 0, right: 0 })
  const userBtnRef = React.useRef<HTMLButtonElement>(null)
  const menuRef = React.useRef<HTMLDivElement>(null)

  const [notifOpen, setNotifOpen] = React.useState(false)
  const [notifPos, setNotifPos] = React.useState({ top: 0, right: 0 })
  const bellBtnRef = React.useRef<HTMLButtonElement>(null)
  const notifRef = React.useRef<HTMLDivElement>(null)

  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])

  // ── Outside-click: user menu ──────────────────────────────────────────────
  React.useEffect(() => {
    if (!menuOpen) return
    const handler = (e: MouseEvent) => {
      const t = e.target as Node
      if (!userBtnRef.current?.contains(t) && !menuRef.current?.contains(t)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [menuOpen])

  // ── Outside-click: notification panel ────────────────────────────────────
  React.useEffect(() => {
    if (!notifOpen) return
    const handler = (e: MouseEvent) => {
      const t = e.target as Node
      if (!bellBtnRef.current?.contains(t) && !notifRef.current?.contains(t)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [notifOpen])

  // ── Open helpers ──────────────────────────────────────────────────────────
  const openMenu = () => {
    if (userBtnRef.current) {
      const r = userBtnRef.current.getBoundingClientRect()
      setMenuPos({ top: r.bottom + 8, right: window.innerWidth - r.right })
    }
    setNotifOpen(false)
    setMenuOpen(true)
  }

  const handleBellClick = () => {
    if (notifications) {
      if (bellBtnRef.current) {
        const r = bellBtnRef.current.getBoundingClientRect()
        setNotifPos({ top: r.bottom + 8, right: window.innerWidth - r.right })
      }
      setMenuOpen(false)
      setNotifOpen((prev) => !prev)
    } else {
      onNotificationClick?.()
    }
  }

  const hasBadge = typeof notificationCount === "number" && notificationCount > 0

  return (
    <header
      data-testid={toTestId(testId, "top_header")}
      className={cn(
        "h-16 flex items-center justify-end px-4 gap-3",
        "bg-lb-surface border-b border-lb-line-1 shrink-0",
        className
      )}
    >
      {/* Bell button */}
      <button
        ref={bellBtnRef}
        type="button"
        onClick={handleBellClick}
        aria-label="Notifications"
        aria-expanded={notifications ? notifOpen : undefined}
        className={cn(
          "relative w-9 h-9 flex items-center justify-center rounded-lb-sm text-lb-on-surface-2 transition-colors",
          notifOpen ? "bg-lb-surface-grey" : "hover:bg-lb-surface-grey"
        )}
      >
        <Bell className="w-5 h-5" />
        {hasBadge && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-orange-400 text-white font-lb font-lb-bold text-[9px] leading-none pointer-events-none">
            {fmtCount(notificationCount!)}
          </span>
        )}
      </button>

      {/* Mobile separator */}
      <div className="md:hidden h-6 w-px bg-lb-line-1 shrink-0" />

      {/* User menu button */}
      <button
        ref={userBtnRef}
        type="button"
        onClick={() => (menuOpen ? setMenuOpen(false) : openMenu())}
        aria-expanded={menuOpen}
        aria-haspopup="menu"
        className={cn(
          "flex items-center gap-2 pl-2 pr-1 py-1.5 rounded-lb-sm transition-colors",
          menuOpen ? "bg-lb-surface-grey" : "hover:bg-lb-surface-grey"
        )}
      >
        <div className="text-right leading-tight">
          <p className="font-lb font-lb-bold text-[14px] text-lb-on-surface max-w-[20ch] truncate">{userName}</p>
          <p className="font-lb text-[12px] text-lb-on-surface-3">{userRole}</p>
        </div>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-lb-on-surface-2 shrink-0 transition-transform duration-200",
            menuOpen && "rotate-180"
          )}
        />
      </button>

      {mounted && (
        <>
          {/* Notification panel portal */}
          {notifications && notifOpen &&
            ReactDOM.createPortal(
              <div
                ref={notifRef}
                className="fixed z-[200]"
                style={{ top: notifPos.top, right: notifPos.right }}
              >
                <NotificationPanel
                  items={notifications}
                  readAllLabel={readAllLabel}
                  onReadAll={onReadAll ? () => { setNotifOpen(false); onReadAll() } : undefined}
                />
              </div>,
              document.body
            )}

          {/* User menu dropdown portal */}
          {menuOpen &&
            ReactDOM.createPortal(
              <div
                ref={menuRef}
                role="menu"
                className="fixed z-[200] min-w-[180px] bg-lb-surface border border-lb-line-1 rounded-lb-sm shadow-lb overflow-hidden"
                style={{ top: menuPos.top, right: menuPos.right }}
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => { setMenuOpen(false); onProfileClick?.() }}
                  className="w-full flex items-center gap-3 px-4 py-3 font-lb text-[14px] text-lb-on-surface hover:bg-lb-surface-grey transition-colors text-left"
                >
                  <User className="w-4 h-4 text-lb-on-surface-2 shrink-0" />
                  <span>Profile</span>
                </button>

                <div className="h-px bg-lb-line-1" />

                <button
                  type="button"
                  role="menuitem"
                  onClick={() => { setMenuOpen(false); onLogoutClick?.() }}
                  className="w-full flex items-center gap-3 px-4 py-3 font-lb text-[14px] text-lb-red hover:bg-lb-red-bg transition-colors text-left"
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                  <span>Log Out</span>
                  
                </button>
              </div>,
              document.body
            )}
        </>
      )}
    </header>
  )
}

export default TopHeader
