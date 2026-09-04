"use client"

import * as React from "react"
import { Pencil } from "lucide-react"
import { cn, toTestId } from "../lib/utils"
import { SideTabs, type SideTabItem } from "./side-tabs"
import { MainBtn } from "./main-btn"
import type { MainBtnProps } from "./main-btn"

// ── SideTabScreenHeader ───────────────────────────────────────────────────────

export interface SideTabScreenHeaderStat {
  value: React.ReactNode
  /** Text shown right after value, e.g. "/10". */
  suffix?: string
  label: string
}

export interface SideTabScreenHeaderLink {
  label: string
  icon?: React.ReactNode
  onClick?: () => void
}

export interface SideTabScreenHeaderProps {
  /** Content rendered inside the avatar circle (e.g. an <img>). */
  avatar?: React.ReactNode
  onEditAvatar?: () => void
  name: string
  description?: string
  /** Secondary line below description (e.g. membership expiry). */
  statusText?: string
  link?: SideTabScreenHeaderLink
  stats?: SideTabScreenHeaderStat[]
  className?: string
  testId?: string
}

export const SideTabScreenHeader: React.FC<SideTabScreenHeaderProps> = ({
  avatar,
  onEditAvatar,
  name,
  description,
  statusText,
  link,
  stats,
  className,
  testId,
}) => (
  <div
    className={cn("bg-lb-surface rounded-lb-card p-6 flex items-center gap-6", className)}
    data-testid={toTestId(testId, "side_tab_screen_header")}
  >
    {/* Avatar */}
    <div className="relative flex-shrink-0">
      <div className="w-[100px] h-[100px] rounded-full border-2 border-lb-brand overflow-hidden bg-lb-surface-grey flex items-center justify-center">
        {avatar}
      </div>
      {onEditAvatar && (
        <button
          type="button"
          onClick={onEditAvatar}
          aria-label="Edit avatar"
          className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-lb-brand flex items-center justify-center hover:opacity-90 transition-opacity cursor-pointer"
        >
          <Pencil size={14} className="text-white" strokeWidth={2.5} />
        </button>
      )}
    </div>

    {/* Info */}
    <div className="flex-1 min-w-0 flex flex-col gap-0.5">
      <h2 className="font-lb font-lb-bold text-[24px] leading-[32px] text-lb-on-surface truncate">
        {name}
      </h2>
      {description && (
        <p className="font-lb text-[14px] leading-[20px] text-lb-on-surface-2">{description}</p>
      )}
      {statusText && (
        <p className="font-lb text-[13px] leading-[18px] text-lb-on-surface-3">{statusText}</p>
      )}
      {link && (
        <button
          type="button"
          onClick={link.onClick}
          className="mt-1.5 flex items-center gap-1.5 font-lb text-[13px] leading-[18px] text-lb-brand hover:underline w-fit"
        >
          {link.icon}
          {link.label}
        </button>
      )}
    </div>

    {/* Stats */}
    {stats && stats.length > 0 && (
      <div className="flex gap-3 flex-shrink-0">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="border border-lb-line-1 rounded-lb-card px-6 py-4 flex flex-col items-center gap-1 min-w-[108px]"
          >
            <div className="flex items-baseline gap-0.5">
              <span className="font-lb font-lb-bold text-[32px] leading-none text-lb-on-surface">
                {stat.value}
              </span>
              {stat.suffix && (
                <span className="font-lb text-[16px] leading-none text-lb-on-surface-3">
                  {stat.suffix}
                </span>
              )}
            </div>
            <span className="font-lb text-[13px] text-lb-on-surface-2">{stat.label}</span>
          </div>
        ))}
      </div>
    )}
  </div>
)

// ── SideTabScreenSection ──────────────────────────────────────────────────────

export interface SideTabScreenSectionField {
  title: string
  value: React.ReactNode
}

export interface SideTabScreenSectionAction {
  label: string
  onClick: () => void
  variant?: MainBtnProps["variant"]
  size?: MainBtnProps["size"]
  disabled?: boolean
  loading?: boolean
  leftIcon?: React.ReactNode
}

export interface SideTabScreenSectionProps {
  title: string
  action?: SideTabScreenSectionAction
  fields: SideTabScreenSectionField[]
  /** Number of columns in the fields grid. Default: 4. */
  columns?: 2 | 3 | 4
  className?: string
  testId?: string
}

const COLS: Record<2 | 3 | 4, string> = {
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
}

export const SideTabScreenSection: React.FC<SideTabScreenSectionProps> = ({
  title,
  action,
  fields,
  columns = 4,
  className,
  testId,
}) => (
  <div
    className={cn("bg-lb-surface rounded-lb-card overflow-hidden", className)}
    data-testid={toTestId(testId, "side_tab_screen_section")}
  >
    <div className="flex items-center justify-between px-6 py-4 border-b border-lb-line-1">
      <h3 className="font-lb font-lb-bold text-[16px] leading-[24px] text-lb-on-surface">
        {title}
      </h3>
      {action && (
        <MainBtn
          label={action.label}
          onClick={action.onClick}
          variant={action.variant ?? "primary"}
          size={action.size ?? "sm"}
          disabled={action.disabled}
          loading={action.loading}
          leftIcon={action.leftIcon}
        />
      )}
    </div>
    <div className={cn("grid gap-x-8 gap-y-6 px-6 py-5", COLS[columns])}>
      {fields.map((field, i) => (
        <div key={i} className="flex flex-col gap-1 min-w-0">
          <span className="font-lb text-[12px] leading-[18px] text-lb-on-surface-3 truncate">
            {field.title}
          </span>
          <span className="font-lb font-lb-bold text-[14px] leading-[20px] text-lb-on-surface break-words">
            {field.value}
          </span>
        </div>
      ))}
    </div>
  </div>
)

// ── SideTabScreen ─────────────────────────────────────────────────────────────

export interface SideTabScreenProps {
  tabs: SideTabItem[]
  activeTab?: string
  onTabChange?: (value: string) => void
  header?: React.ReactNode
  children: React.ReactNode
  className?: string
  testId?: string
}

export const SideTabScreen: React.FC<SideTabScreenProps> = ({
  tabs,
  activeTab,
  onTabChange,
  header,
  children,
  className,
  testId,
}) => (
  <div
    className={cn("flex items-start gap-5", className)}
    data-testid={toTestId(testId, "side_tab_screen")}
  >
    {/* Sidebar */}
    <div className="w-[280px] flex-shrink-0 bg-lb-surface rounded-lb-card shadow-lb-card overflow-hidden py-2">
      <SideTabs items={tabs} value={activeTab} onChange={onTabChange} />
    </div>

    {/* Content */}
    <div className="flex-1 min-w-0 flex flex-col gap-4">
      {header}
      {children}
    </div>
  </div>
)

export default SideTabScreen
