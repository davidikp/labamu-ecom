"use client"

import * as React from "react"
import { cn } from "../lib/utils"
import { ListScreen, type ListScreenProps } from "./list-screen"
import { DetailPanel, type DetailSection, type DetailPanelAction } from "./detail-panel"
import { type Tab } from "./tabs"

export interface DetailScreenProps<T extends { id: string | number }>
  extends Omit<ListScreenProps<T>, "className"> {
  // ── Layout ──────────────────────────────────────────────────────────────────
  /** Outer flex-row wrapper className. */
  className?: string
  /** className forwarded to the inner ListScreen. */
  listClassName?: string

  // ── Panel visibility ────────────────────────────────────────────────────────
  panelOpen: boolean
  onPanelClose: () => void

  // ── Panel header ────────────────────────────────────────────────────────────
  panelTitle?: string
  onPanelEdit?: () => void
  panelEditLabel?: string

  // ── Panel tabs ──────────────────────────────────────────────────────────────
  panelTabs?: Tab[]
  panelActiveTab?: string
  onPanelTabChange?: (id: string) => void

  // ── Panel content ───────────────────────────────────────────────────────────
  panelSections: DetailSection[]

  // ── Panel footer ────────────────────────────────────────────────────────────
  panelFooterActions?: DetailPanelAction[]
  panelOnDownload?: () => void
  panelCtaLabel?: string
  onPanelCta?: () => void

  // ── Panel layout ─────────────────────────────────────────────────────────────
  /** Width of the detail panel. Defaults to "40vw" (40% of screen width). */
  panelWidth?: string
  panelClassName?: string
  panelTestId?: string
}

const ANIMATION_DURATION = 300

export function DetailScreen<T extends { id: string | number }>({
  // Layout
  className,
  listClassName,
  // Panel
  panelOpen,
  onPanelClose,
  panelTitle,
  onPanelEdit,
  panelEditLabel,
  panelTabs,
  panelActiveTab,
  onPanelTabChange,
  panelSections,
  panelFooterActions,
  panelOnDownload,
  panelCtaLabel,
  onPanelCta,
  panelWidth = "40vw",
  panelClassName,
  panelTestId,
  // All ListScreen props (spread through)
  ...listProps
}: DetailScreenProps<T>) {
  // mounted keeps the panel in the DOM during the exit animation
  const [mounted, setMounted] = React.useState(panelOpen)
  // visible drives the CSS transition (width 0 ↔ panelWidth)
  const [visible, setVisible] = React.useState(panelOpen)

  React.useEffect(() => {
    if (panelOpen) {
      setMounted(true)
      // defer so the browser renders width:0 before transitioning to panelWidth
      const id = setTimeout(() => setVisible(true), 10)
      return () => clearTimeout(id)
    } else {
      setVisible(false)
      const id = setTimeout(() => setMounted(false), ANIMATION_DURATION)
      return () => clearTimeout(id)
    }
  }, [panelOpen])

  return (
    <div className={cn("flex h-full min-h-0", className)}>
      {/* ── List ── */}
      <div className="flex-1 min-w-0 px-6 py-4">
        <ListScreen<T> {...listProps} className={listClassName} />
      </div>

      {/* ── Detail panel with slide-in/out animation ── */}
      {mounted && (
        <div
          className="shrink-0 h-full overflow-hidden"
          style={{
            width: visible ? panelWidth : "0px",
            transition: `width ${ANIMATION_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1)`,
          }}
        >
          <div className="h-full" style={{ width: panelWidth }}>
            <DetailPanel
              open
              onClose={onPanelClose}
              title={panelTitle}
              onEdit={onPanelEdit}
              editLabel={panelEditLabel}
              tabs={panelTabs}
              activeTab={panelActiveTab}
              onTabChange={onPanelTabChange}
              sections={panelSections}
              footerActions={panelFooterActions}
              onDownload={panelOnDownload}
              ctaLabel={panelCtaLabel}
              onCta={onPanelCta}
              testId={panelTestId}
              className={cn("h-full", panelClassName)}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default DetailScreen
