"use client"

import * as React from "react"
import ReactDOM from "react-dom"
import { cn, toTestId } from "../lib/utils"
import { Menu, X, ChevronDown, ChevronRight } from "lucide-react"
import { LabamuLogo } from "../icons/labamu-logo"
import { LabamuWordmark } from "../icons/labamu-wordmark"

// ── Types ─────────────────────────────────────────────────────────────────────

export interface NavAccount {
  id: string
  label: string
  /** Display label for type badge, e.g. "HOLDING" | "ENTITY" */
  type: string
}

export interface NavChildItem {
  id: string
  label: string
  /** Notification badge. Numbers > 99 display as "99+" */
  badge?: number | string
  /** Disables the item — grayed out, not clickable */
  disabled?: boolean
}

export interface NavItem {
  id: string
  label: string
  icon: React.ReactNode
  /** Notification badge. Numbers > 99 display as "99+" */
  badge?: number | string
  /** Disables the item — grayed out, not clickable */
  disabled?: boolean
  /**
   * Renders a section heading above this item.
   * In collapsed (icon-only) mode a thin divider line is shown instead.
   */
  sectionTitle?: string
  children?: NavChildItem[]
}

export interface DesktopNavbarProps {
  items: NavItem[]
  activeId: string
  onNavigate: (id: string) => void
  logo?: React.ReactNode
  /** Full-width logo image shown when the sidebar is expanded */
  logoSrc?: string
  /** Square icon image shown when the sidebar is collapsed */
  logoCollapsedSrc?: string
  // Account switcher
  accounts?: NavAccount[]
  activeAccountId?: string
  onAccountChange?: (account: NavAccount) => void
  // Collapse (controlled or uncontrolled)
  collapsed?: boolean
  defaultCollapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
  // Mobile drawer (controlled or uncontrolled)
  mobileOpen?: boolean
  defaultMobileOpen?: boolean
  onMobileOpenChange?: (open: boolean) => void
  /** Show the built-in floating mobile hamburger button. Defaults to true. */
  showMobileToggle?: boolean
  footer?: React.ReactNode
  className?: string
  testId?: string
}

// ── Default logo ──────────────────────────────────────────────────────────────

const DefaultLogo: React.FC<{ collapsed: boolean; src?: string; collapsedSrc?: string }> = ({
  collapsed,
  src,
  collapsedSrc,
}) => {
  const iconSrc = collapsedSrc ?? src

  return collapsed ? (
    <div className="w-9 h-9 rounded-lb-sm flex items-center justify-center shrink-0 overflow-hidden">
      {iconSrc
        ? <img src={iconSrc} alt="Logo" className="w-full h-full object-contain" />
        : <LabamuLogo width={24} height={24} />
      }
    </div>
  ) : (
    <div className="flex items-center gap-2 min-w-0">
      {src
        ? <img src={src} alt="Logo" className="h-8 max-w-full object-contain" />
        : <LabamuWordmark height={42} className="max-w-full" />
      }
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtBadge(badge: number | string | undefined): string | null {
  if (badge === undefined || badge === null) return null
  if (typeof badge === "number") return badge > 0 ? (badge > 99 ? "99+" : String(badge)) : null
  return String(badge) || null
}

/** Circular badge used next to child / parent labels */
const BadgePill: React.FC<{ value: number | string }> = ({ value }) => {
  const text = fmtBadge(value)
  if (!text) return null
  return (
    <span className="inline-flex items-center justify-center min-w-[24px] h-[24px] px-1.5 rounded-full bg-orange-400 text-white font-lb text-[10px] font-lb-bold leading-none shrink-0">
      {text}
    </span>
  )
}

/** Tiny dot/count overlay on top-right of an icon (collapsed mode) */
const BadgeDot: React.FC<{ value: number | string }> = ({ value }) => {
  const text = fmtBadge(value)
  if (!text) return null
  const isNumber = typeof value === "number" || /^\d+\+?$/.test(String(value))
  return (
    <span
      className={cn(
        "absolute -top-1 -right-1 flex items-center justify-center rounded-full bg-orange-400 text-white font-lb font-lb-bold leading-none pointer-events-none",
        isNumber && text.length <= 2 ? "w-[14px] h-[14px] text-[8px]" : "min-w-[14px] h-[14px] px-0.5 text-[8px]"
      )}
    >
      {text}
    </span>
  )
}

// ── AccountSwitcher ───────────────────────────────────────────────────────────

const AccountSwitcher: React.FC<{
  accounts: NavAccount[]
  activeAccountId?: string
  onAccountChange?: (account: NavAccount) => void
}> = ({ accounts, activeAccountId, onAccountChange }) => {
  const [open, setOpen] = React.useState(false)
  const [dropPos, setDropPos] = React.useState({ top: 0, left: 0, width: 0 })
  const buttonRef = React.useRef<HTMLButtonElement>(null)
  const dropRef = React.useRef<HTMLDivElement>(null)
  const active = accounts.find((a) => a.id === activeAccountId) || accounts[0]

  const openDrop = () => {
    const r = buttonRef.current!.getBoundingClientRect()
    setDropPos({ top: r.bottom + 4, left: r.left, width: r.width })
    setOpen(true)
  }

  React.useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      const t = e.target as Node
      if (!buttonRef.current?.contains(t) && !dropRef.current?.contains(t)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={() => (open ? setOpen(false) : openDrop())}
      className={cn(
        "w-full flex items-center gap-2 px-3 py-2.5 rounded-lb-sm border transition-colors font-lb text-left",
        open
          ? "border-lb-brand bg-lb-brand-light"
          : "border-lb-line-1 hover:border-lb-line-2 bg-lb-surface"
      )}
    >
      <div className="flex-1 min-w-0">
        <p className="font-lb text-[10px] uppercase tracking-wider text-lb-on-surface-3 leading-none mb-[3px]">
          {active.type}
        </p>
        <p className="font-lb text-[14px] font-lb-bold text-lb-on-surface leading-snug truncate">
          {active.label}
        </p>
      </div>
      <ChevronDown
        className={cn(
          "w-4 h-4 text-lb-on-surface-2 shrink-0 transition-transform duration-200",
          open && "rotate-180"
        )}
      />
      {open &&
        ReactDOM.createPortal(
          <div
            ref={dropRef}
            className="fixed z-[200] bg-lb-surface border border-lb-line-1 rounded-lb-sm shadow-lb overflow-hidden"
            style={{ top: dropPos.top, left: dropPos.left, width: dropPos.width }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="max-h-[300px] overflow-y-auto overscroll-contain">
              {accounts.map((acc) => {
                const isCurrent = acc.id === active.id
                return (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onAccountChange?.(acc)
                      setOpen(false)
                    }}
                    className={cn(
                      "w-full flex flex-col gap-[3px] px-4 py-3 text-left transition-colors",
                      isCurrent ? "bg-lb-brand-light" : "hover:bg-lb-surface-grey"
                    )}
                  >
                    <span
                      className={cn(
                        "font-lb text-[10px] uppercase tracking-wider",
                        isCurrent ? "text-lb-brand/70" : "text-lb-on-surface-3"
                      )}
                    >
                      {acc.type}
                    </span>
                    <span
                      className={cn(
                        "font-lb text-[14px] font-lb-bold",
                        isCurrent ? "text-lb-brand" : "text-lb-on-surface"
                      )}
                    >
                      {acc.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>,
          document.body
        )}
    </button>
  )
}

// ── DesktopNavbar ─────────────────────────────────────────────────────────────

export const DesktopNavbar: React.FC<DesktopNavbarProps> = ({
  items,
  activeId,
  onNavigate,
  logo,
  logoSrc,
  logoCollapsedSrc,
  accounts,
  activeAccountId,
  onAccountChange,
  collapsed: collapsedProp,
  defaultCollapsed = false,
  onCollapsedChange,
  mobileOpen: mobileOpenProp,
  defaultMobileOpen = false,
  onMobileOpenChange,
  showMobileToggle = true,
  footer,
  className,
  testId,
}) => {
  // ── Controlled / uncontrolled collapsed ──────────────────────────────────────
  const [collapsedInt, setCollapsedInt] = React.useState(defaultCollapsed)
  const isCollapsedControlled = collapsedProp !== undefined
  const collapsed = isCollapsedControlled ? collapsedProp! : collapsedInt
  const setCollapsed = React.useCallback(
    (v: boolean) => {
      if (!isCollapsedControlled) setCollapsedInt(v)
      onCollapsedChange?.(v)
    },
    [isCollapsedControlled, onCollapsedChange]
  )

  // ── Controlled / uncontrolled mobile open ────────────────────────────────────
  const [mobileInt, setMobileInt] = React.useState(defaultMobileOpen)
  const isMobileControlled = mobileOpenProp !== undefined
  const mobileOpen = isMobileControlled ? mobileOpenProp! : mobileInt
  const setMobileOpen = React.useCallback(
    (v: boolean) => {
      if (!isMobileControlled) setMobileInt(v)
      onMobileOpenChange?.(v)
    },
    [isMobileControlled, onMobileOpenChange]
  )

  // ── Expanded children (desktop expanded mode) ────────────────────────────────
  const [expanded, setExpanded] = React.useState<string[]>([])

  // ── Collapsed flyout ─────────────────────────────────────────────────────────
  const [flyout, setFlyout] = React.useState<NavItem | null>(null)
  const [flyoutPos, setFlyoutPos] = React.useState({ top: 0, left: 0 })
  const flyoutTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Client mount guard (for portals) ─────────────────────────────────────────
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])

  // ── Body scroll lock ─────────────────────────────────────────────────────────
  React.useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [mobileOpen])

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const isActive = (id: string) => id === activeId
  const hasActiveChild = (item: NavItem) => item.children?.some((c) => isActive(c.id)) ?? false
  const isParentActive = (item: NavItem) => isActive(item.id) || hasActiveChild(item)

  const getItemExpanded = (item: NavItem, isMobile: boolean) => {
    if (collapsed && !isMobile) return false
    return expanded.includes(item.id) || hasActiveChild(item)
  }

  // ── Flyout handlers ──────────────────────────────────────────────────────────
  const showFlyout = (item: NavItem, e: React.MouseEvent<HTMLButtonElement>) => {
    clearTimeout(flyoutTimer.current as ReturnType<typeof setTimeout>)
    const r = e.currentTarget.getBoundingClientRect()
    setFlyoutPos({ top: r.top, left: r.right + 6 })
    setFlyout(item)
  }
  const hideFlyout = () => { flyoutTimer.current = setTimeout(() => setFlyout(null), 120) }
  const keepFlyout = () => { clearTimeout(flyoutTimer.current as ReturnType<typeof setTimeout>) }

  // ── Nav item click ───────────────────────────────────────────────────────────
  const handleItemClick = (item: NavItem, closeMobile: boolean) => {
    if (item.children) {
      // Open this parent, close all others (accordion)
      setExpanded([item.id])
      const firstChild = item.children.find((c) => !c.disabled)
      if (firstChild) {
        onNavigate(firstChild.id)
        if (closeMobile) setMobileOpen(false)
      }
    } else {
      // Clicking a leaf item closes all open parents
      setExpanded([])
      onNavigate(item.id)
      if (closeMobile) setMobileOpen(false)
    }
  }

  const handleChevronClick = (e: React.MouseEvent, item: NavItem) => {
    e.stopPropagation()
    // Toggle this parent, close all others (accordion)
    setExpanded((prev) => prev.includes(item.id) ? [] : [item.id])
  }

  const handleChildClick = (childId: string, closeMobile: boolean) => {
    onNavigate(childId)
    if (closeMobile) setMobileOpen(false)
  }

  // ── Nav items renderer ───────────────────────────────────────────────────────
  const renderNavItems = (isMobile: boolean) =>
    items.map((item) => {
      const parentActive = isParentActive(item)
      const itemExpanded = getItemExpanded(item, isMobile)
      const iconOnly = collapsed && !isMobile

      return (
        <div key={item.id}>
          {/* Section title / divider */}
          {item.sectionTitle && (
            iconOnly ? (
              <div className="mx-2 my-2 h-px bg-lb-line-1" />
            ) : (
              <div className="px-3 pt-3 pb-1">
                <span className="font-lb text-[10px] uppercase tracking-wider text-lb-on-surface-3">
                  {item.sectionTitle}
                </span>
              </div>
            )
          )}

          {/* Parent button */}
          <button
            type="button"
            disabled={item.disabled}
            onClick={() => !item.disabled && handleItemClick(item, isMobile)}
            onMouseEnter={iconOnly && !item.disabled ? (e) => showFlyout(item, e) : undefined}
            onMouseLeave={iconOnly && !item.disabled ? hideFlyout : undefined}
            className={cn(
              "relative w-full flex items-center rounded-lb-sm",
              "font-lb text-[14px] leading-[20px] tracking-[0.0962px]",
              "border-none transition-colors duration-150",
              iconOnly ? "h-12 justify-center px-0" : "h-12 gap-3 px-3 text-left",
              item.disabled
                ? "text-lb-on-surface-3 cursor-not-allowed"
                : parentActive && iconOnly && !item.children
                ? "bg-lb-brand text-white cursor-pointer"
                : parentActive && iconOnly && item.children
                ? "bg-lb-brand text-white cursor-pointer"
                : parentActive && item.children
                ? "bg-transparent text-lb-brand font-lb-bold cursor-pointer"
                : parentActive
                ? "bg-lb-brand-light text-lb-brand font-lb-bold cursor-pointer"
                : "bg-transparent text-lb-on-surface hover:bg-lb-surface-grey cursor-pointer"
            )}
            aria-current={parentActive && !item.disabled ? "page" : undefined}
          >
            {/* Active indicator bar — expanded mode */}
            {parentActive && !item.disabled && !iconOnly && (
              <span className="absolute left-0 top-2 bottom-2 w-1 bg-lb-brand rounded-r-full" />
            )}

            {/* Active indicator dot — collapsed mode, parent with active child */}
            {iconOnly && hasActiveChild(item) && !item.disabled && (
              <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-lb-brand" />
            )}

            {/* Icon with optional badge dot (collapsed only) */}
            <span className="relative w-5 h-5 shrink-0 flex items-center justify-center">
              {item.icon}
              {iconOnly && item.badge !== undefined && !item.disabled && (
                <BadgeDot value={item.badge} />
              )}
            </span>

            {/* Label, badge pill, and expand chevron */}
            {!iconOnly && (
              <>
                <span className="flex-1 text-left truncate">{item.label}</span>
                {item.badge !== undefined && !item.disabled && (
                  <BadgePill value={item.badge} />
                )}
                {item.children && (
                  <span
                    onClick={(e) => handleChevronClick(e, item)}
                    className="p-1 -m-1 rounded shrink-0"
                  >
                    <ChevronDown
                      className={cn(
                        "w-4 h-4 transition-transform duration-200",
                        itemExpanded && "rotate-180"
                      )}
                      aria-hidden="true"
                    />
                  </span>
                )}
              </>
            )}
          </button>

          {/* Children (expanded desktop or mobile) */}
          {!iconOnly && item.children && (
            <div
              className={cn(
                "overflow-hidden transition-all duration-300",
                itemExpanded ? "max-h-[600px]" : "max-h-0"
              )}
            >
              {item.children.map((child) => {
                const childActive = isActive(child.id)
                return (
                  <div key={child.id} className="pl-5">
                    <button
                      type="button"
                      disabled={child.disabled}
                      onClick={() => !child.disabled && handleChildClick(child.id, isMobile)}
                      className={cn(
                        "w-full h-11 flex items-center pl-9 pr-3 rounded-lb-sm",
                        "font-lb text-[14px] leading-[20px] tracking-[0.0962px]",
                        "border-none transition-colors duration-150 text-left",
                        child.disabled
                          ? "text-lb-on-surface-3 cursor-not-allowed"
                          : childActive
                          ? "text-lb-brand font-lb-bold bg-lb-brand-light cursor-pointer"
                          : "text-lb-on-surface hover:bg-lb-surface-grey cursor-pointer"
                      )}
                      aria-current={childActive && !child.disabled ? "page" : undefined}
                    >
                      <span className="flex-1 truncate">{child.label}</span>
                      {child.badge !== undefined && !child.disabled && (
                        <BadgePill value={child.badge} />
                      )}
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )
    })

  // ── Shared sidebar body ──────────────────────────────────────────────────────
  const sidebarBody = (isMobile: boolean) => {
    const iconOnly = collapsed && !isMobile
    return (
      <>
        {/* Header: logo + mobile close */}
        <div
          className={cn(
            "h-16 flex items-center shrink-0 border-b border-lb-line-1",
            iconOnly ? "justify-center px-2" : "px-4 gap-2"
          )}
        >
          <div className={cn("min-w-0 overflow-hidden", !iconOnly && "flex-1")}>
            {logo ?? <DefaultLogo collapsed={iconOnly} src={logoSrc} collapsedSrc={logoCollapsedSrc} />}
          </div>
          {isMobile && (
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="w-8 h-8 flex items-center justify-center rounded-lb-sm text-lb-on-surface-2 hover:bg-lb-surface-grey transition-colors shrink-0"
              aria-label="Close navigation"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Account switcher (hidden when desktop collapsed) */}
        {accounts && accounts.length > 0 && !iconOnly && (
          <div className="px-3 pt-3 pb-1 shrink-0">
            <AccountSwitcher
              accounts={accounts}
              activeAccountId={activeAccountId}
              onAccountChange={onAccountChange}
            />
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-3 flex flex-col gap-0.5">
          {renderNavItems(isMobile)}
        </nav>

        {/* Bottom collapse toggle (desktop only) */}
        {/* Bottom collapse toggle (desktop only) — sits above footer */}
        {!isMobile && (
          <div className="border-t border-lb-line-1 pt-3 px-3 pb-1 shrink-0 flex justify-start">
            <button
              type="button"
              onClick={() => setCollapsed(!collapsed)}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-lb-brand-light text-lb-on-surface-2 hover:bg-lb-line-1 transition-colors"
            >
              <ChevronRight
                className={cn(
                  "w-4 h-4 transition-transform duration-300",
                  !collapsed && "rotate-180"
                )}
              />
            </button>
          </div>
        )}

        {/* Footer */}
        {footer && (
          <div
            className={cn(
              "px-3 pb-3 pt-2 shrink-0",
              isMobile && "border-t border-lb-line-1 pt-3",
              iconOnly && "flex justify-center"
            )}
          >
            {footer}
          </div>
        )}

        
      </>
    )
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col bg-lb-surface border-r border-lb-line-1 h-full flex-shrink-0",
          "transition-[width] duration-300 overflow-hidden",
          collapsed ? "w-[64px]" : "w-[240px]",
          className
        )}
        data-testid={toTestId(testId, "desktop_navbar")}
      >
        {sidebarBody(false)}
      </aside>

      {/* Portals (client only) */}
      {mounted && (
        <>
          {/* Mobile backdrop */}
          {ReactDOM.createPortal(
            <div
              className={cn(
                "fixed inset-0 z-[55] bg-black/40 transition-opacity duration-300 md:hidden",
                mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
              )}
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />,
            document.body
          )}

          {/* Mobile drawer */}
          {ReactDOM.createPortal(
            <aside
              className={cn(
                "flex md:hidden flex-col bg-lb-surface border-r border-lb-line-1",
                "fixed inset-y-0 left-0 z-[56] w-[280px]",
                "transition-transform duration-300",
                mobileOpen ? "translate-x-0" : "-translate-x-full"
              )}
              role="dialog"
              aria-modal="true"
              aria-hidden={!mobileOpen}
            >
              {sidebarBody(true)}
            </aside>,
            document.body
          )}

          {/* Mobile hamburger trigger */}
          {showMobileToggle &&
            ReactDOM.createPortal(
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className={cn(
                  "fixed top-3 left-3 z-[54] md:hidden",
                  "w-10 h-10 flex items-center justify-center",
                  "bg-lb-surface rounded-lb-sm shadow-lb border border-lb-line-1",
                  "text-lb-on-surface transition-all hover:bg-lb-surface-grey",
                  mobileOpen ? "opacity-0 pointer-events-none" : "opacity-100"
                )}
                aria-label="Open navigation"
              >
                <Menu className="w-5 h-5" />
              </button>,
              document.body
            )}

          {/* Collapsed flyout */}
          {collapsed &&
            flyout &&
            ReactDOM.createPortal(
              <div
                className="fixed z-[100] bg-lb-surface border border-lb-line-1 rounded-lb-sm shadow-lb overflow-hidden min-w-[168px]"
                style={{ top: flyoutPos.top, left: flyoutPos.left }}
                onMouseEnter={keepFlyout}
                onMouseLeave={hideFlyout}
              >
                {!flyout.children ? (
                  /* Leaf item — entire panel is a clickable row */
                  <button
                    type="button"
                    onClick={() => { onNavigate(flyout.id); setFlyout(null) }}
                    className={cn(
                      "relative w-full flex items-center gap-2 px-4 py-3 font-lb text-[14px] transition-colors",
                      isParentActive(flyout)
                        ? "text-lb-brand font-lb-bold bg-lb-brand-light cursor-pointer"
                        : "text-lb-on-surface hover:bg-lb-surface-grey cursor-pointer"
                    )}
                  >
                    {isParentActive(flyout) && (
                      <span className="absolute left-0 top-2 bottom-2 w-1 bg-lb-brand rounded-r-full" />
                    )}
                    <span className="flex-1">{flyout.label}</span>
                    {flyout.badge !== undefined && (
                      <BadgePill value={flyout.badge} />
                    )}
                  </button>
                ) : (
                  /* Parent item — header + child rows */
                  <>
                    <div className="px-4 py-2 font-lb text-[11px] uppercase tracking-wider text-lb-on-surface-3 bg-lb-surface-grey border-b border-lb-line-1 text-left">
                      {flyout.label}
                    </div>
                    {flyout.children.map((child) => {
                      const childActive = isActive(child.id)
                      return (
                        <button
                          key={child.id}
                          type="button"
                          disabled={child.disabled}
                          onClick={() => { onNavigate(child.id); setFlyout(null) }}
                          className={cn(
                            "w-full flex items-center gap-2 px-4 py-2.5 font-lb text-[14px] transition-colors text-left",
                            child.disabled
                              ? "text-lb-on-surface-3 cursor-not-allowed"
                              : childActive
                              ? "text-lb-brand font-lb-bold bg-lb-brand-light cursor-pointer"
                              : "text-lb-on-surface hover:bg-lb-surface-grey cursor-pointer"
                          )}
                        >
                          <span className="flex-1">{child.label}</span>
                          {child.badge !== undefined && !child.disabled && (
                            <BadgePill value={child.badge} />
                          )}
                        </button>
                      )
                    })}
                  </>
                )}
              </div>,
              document.body
            )}
        </>
      )}
    </>
  )
}

export default DesktopNavbar
