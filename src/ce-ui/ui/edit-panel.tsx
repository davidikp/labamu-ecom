"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn, toTestId } from "../lib/utils"
import { Tabs, type Tab } from "./tabs"
import { MainBtn } from "./main-btn"
import { Separator } from "./separator"

export interface EditPanelAction {
  label: string
  onClick: () => void
  disabled?: boolean
  loading?: boolean
}

export interface EditPanelSection {
  /** Uppercase section heading rendered above the content. */
  title?: string
  content: React.ReactNode
}

export interface EditPanelProps {
  open: boolean
  onClose: () => void
  /** Uppercase label shown in the header. Defaults to "Edit". */
  title?: string
  /** Optional subtitle rendered below the title. */
  description?: string
  /** Tabs rendered below the header. Uncontrolled when activeTab/onTabChange are omitted. */
  tabs?: Tab[]
  activeTab?: string
  onTabChange?: (id: string) => void
  /** Named sections with their own headings. Use when the form is divided into logical groups. */
  sections?: EditPanelSection[]
  /** Free-form content rendered in the scrollable area — used instead of sections. */
  children?: React.ReactNode
  /** Primary footer action (e.g. Save). Rendered as a primary MainBtn. */
  primaryAction?: EditPanelAction
  /** Secondary footer action (e.g. Cancel). Rendered as a secondary MainBtn. */
  secondaryAction?: EditPanelAction
  className?: string
  testId?: string
}

export const EditPanel: React.FC<EditPanelProps> = ({
  open,
  onClose,
  title = "Edit",
  description,
  tabs,
  activeTab,
  onTabChange,
  sections,
  children,
  primaryAction,
  secondaryAction,
  className,
  testId,
}) => {
  const [internalActiveTab, setInternalActiveTab] = React.useState(tabs?.[0]?.id ?? "")
  const resolvedActiveTab = activeTab ?? internalActiveTab
  const resolvedOnTabChange = onTabChange ?? setInternalActiveTab

  if (!open) return null

  const hasFooter = primaryAction || secondaryAction

  return (
    <div
      data-testid={toTestId(testId, "edit_panel")}
      className={cn(
        "flex flex-col bg-lb-surface border-l border-lb-line-1",
        "h-full min-h-0",
        className
      )}
    >
      {/* ── Header ── */}
      <div className="flex-none flex items-start justify-between px-6 py-4 border-b border-lb-line-1 gap-3">
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="font-lb text-[11px] font-lb-bold text-lb-on-surface-3 uppercase tracking-widest">
            {title}
          </span>
          {description && (
            <p className="font-lb text-[13px] text-lb-on-surface-2 leading-[18px] m-0">
              {description}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close panel"
          className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full text-lb-on-surface-2 hover:bg-lb-surface-grey transition-colors cursor-pointer border-none bg-transparent"
        >
          <X size={16} aria-hidden="true" />
        </button>
      </div>

      {/* ── Tabs ── */}
      {tabs && tabs.length > 0 && (
        <div className="flex-none">
          <Tabs
            tabs={tabs}
            activeTab={resolvedActiveTab}
            onChange={resolvedOnTabChange}
          />
        </div>
      )}

      {/* ── Scrollable content ── */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {sections && sections.length > 0
          ? sections.map((section, i) => (
              <React.Fragment key={i}>
                {i > 0 && <Separator />}
                <div className="px-6 py-5">
                  {section.title && (
                    <p className="font-lb text-[11px] font-lb-bold text-lb-on-surface-3 uppercase tracking-widest mb-4 m-0">
                      {section.title}
                    </p>
                  )}
                  {section.content}
                </div>
              </React.Fragment>
            ))
          : children && <div className="px-6 py-5">{children}</div>}
      </div>

      {/* ── Footer ── */}
      {hasFooter && (
        <div className="flex-none border-t border-lb-line-1 px-6 py-4 flex items-center gap-3">
          {secondaryAction && (
            <MainBtn
              className="flex-1"
              variant="secondary"
              size="lg"
              label={secondaryAction.label}
              disabled={secondaryAction.disabled}
              loading={secondaryAction.loading}
              onClick={secondaryAction.onClick}
            />
          )}
          {primaryAction && (
            <MainBtn
              className="flex-1"
              variant="primary"
              size="lg"
              label={primaryAction.label}
              disabled={primaryAction.disabled}
              loading={primaryAction.loading}
              onClick={primaryAction.onClick}
            />
          )}
        </div>
      )}
    </div>
  )
}

export default EditPanel
