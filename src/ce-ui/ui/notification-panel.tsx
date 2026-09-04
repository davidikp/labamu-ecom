"use client"

import * as React from "react"
import { FileText } from "lucide-react"
import { cn, toTestId } from "../lib/utils"

// ── Types ─────────────────────────────────────────────────────────────────────

export interface NotificationItem {
  id: string
  /** Category label shown above the title, e.g. "Tagihan" */
  category: string
  /** Bold title text */
  title: string
  /** Subtitle / description text */
  description: string
  /** Date label shown on the right, e.g. "Hari Ini" */
  date: string
  /**
   * Icon node rendered inside the circular badge on the left.
   * Defaults to a FileText icon when omitted.
   */
  icon?: React.ReactNode
  /** Unread items are highlighted with a tinted background. Defaults to false. */
  read?: boolean
  onClick?: () => void
}

export interface NotificationPanelProps {
  items: NotificationItem[]
  /** Label for the "read all" link. Defaults to "Baca semua notifikasi". */
  readAllLabel?: string
  onReadAll?: () => void
  /** Panel title. Defaults to "Notifikasi". */
  title?: string
  /** Max visible height before the list scrolls. Defaults to 480px. */
  maxHeight?: number
  className?: string
  testId?: string
}

// ── DefaultIcon ───────────────────────────────────────────────────────────────

const DefaultIcon: React.FC = () => (
  <FileText className="w-5 h-5 text-orange-400" />
)

// ── NotificationPanel ─────────────────────────────────────────────────────────

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  items,
  readAllLabel = "Baca semua notifikasi",
  onReadAll,
  title = "Notifikasi",
  maxHeight = 480,
  className,
  testId,
}) => {
  return (
    <div
      data-testid={toTestId(testId, "notification_panel")}
      className={cn(
        "w-[360px] max-w-[calc(100vw-32px)]",
        "bg-lb-surface border border-lb-line-1 rounded-lb-sm shadow-lb overflow-hidden",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 shrink-0">
        <h3 className="font-lb font-lb-bold text-[18px] text-lb-on-surface leading-snug">
          {title}
        </h3>
        {onReadAll && (
          <button
            type="button"
            onClick={onReadAll}
            className="font-lb text-[13px] text-lb-brand hover:underline transition-colors"
          >
            {readAllLabel}
          </button>
        )}
      </div>

      {/* Items */}
      <div
        className="overflow-y-auto overscroll-contain divide-y divide-lb-line-1"
        style={{ maxHeight }}
      >
        {items.length === 0 ? (
          <p className="px-5 py-8 text-center font-lb text-[14px] text-lb-on-surface-3">
            Tidak ada notifikasi
          </p>
        ) : (
          items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={item.onClick}
              className={cn(
                "w-full flex items-start gap-3 px-5 py-4 text-left transition-colors",
                item.read
                  ? "bg-lb-surface hover:bg-lb-surface-grey"
                  : "bg-lb-brand-light hover:brightness-[0.97]"
              )}
            >
              {/* Icon circle */}
              <span className="shrink-0 w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center mt-0.5">
                {item.icon ?? <DefaultIcon />}
              </span>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-lb text-[11px] text-lb-on-surface-3 leading-[18px]">
                    {item.category}
                  </span>
                  <span className="font-lb text-[11px] text-lb-on-surface-3 leading-[18px] shrink-0">
                    {item.date}
                  </span>
                </div>
                <p className="font-lb font-lb-bold text-[13px] text-lb-on-surface leading-snug mt-0.5 truncate">
                  {item.title}
                </p>
                <p className="font-lb text-[12px] text-lb-on-surface-3 leading-[18px] mt-0.5 truncate">
                  {item.description}
                </p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  )
}

export default NotificationPanel
