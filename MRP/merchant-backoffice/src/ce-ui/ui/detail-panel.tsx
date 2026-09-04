"use client"

import * as React from "react"
import { X, Pencil, Download } from "lucide-react"
import { cn, toTestId } from "../lib/utils"
import { Tabs, type Tab } from "./tabs"
import { MainBtn } from "./main-btn"
import { IconBtn } from "./icon-btn"
import { CTAButton } from "./cta-button"
import { Separator } from "./separator"

export interface DetailField {
  label: string
  value: React.ReactNode
}

export interface DetailSection {
  /** Uppercase section heading rendered above the fields. */
  title?: string
  fields: DetailField[]
}

export interface DetailPanelAction {
  label: string
  onClick: () => void
  variant?: "primary" | "secondary"
  disabled?: boolean
  loading?: boolean
}

export interface DetailPanelProps {
  open: boolean
  onClose: () => void
  /** Uppercase label shown in the top-left of the header. Defaults to "Detail". */
  title?: string
  /** When provided, renders an Edit button in the header. */
  onEdit?: () => void
  editLabel?: string
  /** Tabs rendered below the header. Uncontrolled when activeTab/onTabChange are omitted. */
  tabs?: Tab[]
  activeTab?: string
  onTabChange?: (id: string) => void
  sections: DetailSection[]
  /** Footer action buttons. Last item defaults to "primary", rest to "secondary". */
  footerActions?: DetailPanelAction[]
  /** When provided, renders a Download icon button as the first footer element. */
  onDownload?: () => void
  /** CTA link rendered below the footer action buttons. */
  ctaLabel?: string
  onCta?: () => void
  className?: string
  testId?: string
}

export const DetailPanel: React.FC<DetailPanelProps> = ({
  open,
  onClose,
  title = "Detail",
  onEdit,
  editLabel = "Edit",
  tabs,
  activeTab,
  onTabChange,
  sections,
  footerActions = [],
  onDownload,
  ctaLabel,
  onCta,
  className,
  testId,
}) => {
  const [internalActiveTab, setInternalActiveTab] = React.useState(tabs?.[0]?.id ?? "")
  const resolvedActiveTab = activeTab ?? internalActiveTab
  const resolvedOnTabChange = onTabChange ?? setInternalActiveTab

  if (!open) return null

  const hasFooter = onDownload || footerActions.length > 0 || (ctaLabel && onCta)

  return (
    <div
      data-testid={toTestId(testId, "detail_panel")}
      className={cn(
        "flex flex-col bg-lb-surface border-l border-lb-line-1",
        "h-full min-h-0",
        className
      )}
    >
      {/* ── Header ── */}
      <div className="flex-none flex items-center justify-between px-6 h-[56px] border-b border-lb-line-1">
        <span className="font-lb text-[11px] font-lb-bold text-lb-on-surface-3 uppercase tracking-widest">
          {title}
        </span>
        <div className="flex items-center gap-2">
          {onEdit && (
            <MainBtn
              variant="secondary"
              size="sm"
              leftIcon={<Pencil size={14} aria-hidden="true" />}
              label={editLabel}
              onClick={onEdit}
            />
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close panel"
            className="w-8 h-8 flex items-center justify-center rounded-full text-lb-on-surface-2 hover:bg-lb-surface-grey transition-colors cursor-pointer border-none bg-transparent"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
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
        {sections.map((section, si) => (
          <React.Fragment key={si}>
            {si > 0 && <Separator />}
            <div className="px-6 py-5">
              {section.title && (
                <p className="font-lb text-[11px] font-lb-bold text-lb-on-surface-3 uppercase tracking-widest mb-4 m-0">
                  {section.title}
                </p>
              )}
              <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                {section.fields.map((field, fi) => (
                  <div key={fi} className="flex flex-col gap-0.5 min-w-0">
                    <span className="font-lb text-[12px] text-lb-on-surface-3 leading-[18px]">
                      {field.label}
                    </span>
                    <div className="font-lb text-[14px] text-lb-on-surface leading-[20px] break-words">
                      {field.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </React.Fragment>
        ))}
      </div>

      {/* ── Footer ── */}
      {hasFooter && (
        <div className="flex-none border-t border-lb-line-1 px-6 py-4 flex flex-col gap-3">
          {(onDownload || footerActions.length > 0) && (
            <div className="flex items-center gap-3">
              {onDownload && (
                <IconBtn
                  variant="secondary"
                  size="sm"
                  icon={<Download size={16} aria-hidden="true" />}
                  onClick={onDownload}
                  aria-label="Download"
                />
              )}
              {footerActions.map((action, i) => (
                <MainBtn
                  key={action.label}
                  className="flex-1"
                  variant={action.variant ?? (i === footerActions.length - 1 ? "primary" : "secondary")}
                  size="lg"
                  label={action.label}
                  disabled={action.disabled}
                  loading={action.loading}
                  onClick={action.onClick}
                />
              ))}
            </div>
          )}
          {ctaLabel && onCta && (
            <div className="flex justify-center">
              <CTAButton label={ctaLabel} onClick={onCta} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default DetailPanel
