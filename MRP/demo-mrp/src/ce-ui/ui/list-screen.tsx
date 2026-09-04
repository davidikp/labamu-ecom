"use client"

import * as React from "react"
import { Download } from "lucide-react"
import { cn } from "../lib/utils"
import { MainBtn } from "./main-btn"
import { FilterCard, type FilterCardProps } from "./filter-card"
import { Table, type TableColumn, type TableFiltersConfig, type SortDirection } from "./table"
import { type Tab } from "./tabs"

export interface ListScreenAction {
  label: string
  onClick: () => void
  variant?: "primary" | "secondary"
  size?: "sm" | "md" | "lg" | "xl"
  disabled?: boolean
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export interface ListScreenProps<T extends { id: string | number }> {
  // ── Header ──────────────────────────────────────────────────────────────────
  title: string
  /** Buttons rendered in the top-right. Last item defaults to "primary" variant, rest to "secondary". */
  actions?: ListScreenAction[]

  // ── Filter cards ────────────────────────────────────────────────────────────
  filterCards?: FilterCardProps[]
  /** Controlled list of selected filter card labels. When provided, enables multi-selection. */
  selectedFilterCards?: string[]
  /** Called when a filter card is toggled. Receives the updated selected labels array. */
  onFilterCardsChange?: (selected: string[]) => void

  // ── Tabs (rendered inside the table card) ───────────────────────────────────
  tabs?: Tab[]
  activeTab?: string
  onTabChange?: (id: string) => void

  // ── Table data ──────────────────────────────────────────────────────────────
  columns: TableColumn<T>[]
  data: T[]
  loading?: boolean
  totalRows?: number
  page?: number
  perPage?: number
  onPageChange?: (page: number) => void

  // ── Table interaction ───────────────────────────────────────────────────────
  onRowClick?: (row: T) => void
  selectedRowId?: string | number | null
  selectable?: boolean
  selectedIds?: (string | number)[]
  onSelectionChange?: (ids: (string | number)[]) => void
  sortKey?: keyof T | null
  sortDirection?: SortDirection
  onSortChange?: (key: keyof T | null, direction: SortDirection) => void

  // ── Table filters ───────────────────────────────────────────────────────────
  filters?: TableFiltersConfig

  // ── Table footer ────────────────────────────────────────────────────────────
  /** When provided, renders a Download button as the first footer element. */
  onDownload?: () => void
  /** Custom left-footer node — overrides the auto-generated download button. */
  footerStart?: React.ReactNode
  footerTotal?: React.ReactNode

  // ── Empty state ─────────────────────────────────────────────────────────────
  emptyStateTitle?: string
  emptyStateDescription?: string
  emptyStateAction?: React.ReactNode

  // ── Layout ──────────────────────────────────────────────────────────────────
  className?: string
  tableClassName?: string
}

export function ListScreen<T extends { id: string | number }>({
  title,
  actions = [],
  filterCards = [],
  selectedFilterCards,
  onFilterCardsChange,
  tabs,
  activeTab,
  onTabChange,
  columns,
  data,
  loading,
  totalRows = 0,
  page = 1,
  perPage = 25,
  onPageChange,
  filters,
  onRowClick,
  selectedRowId,
  selectable,
  selectedIds,
  onSelectionChange,
  sortKey,
  sortDirection,
  onSortChange,
  onDownload,
  footerStart,
  footerTotal,
  emptyStateTitle,
  emptyStateDescription,
  emptyStateAction,
  className,
  tableClassName,
}: ListScreenProps<T>) {
  const resolvedFooterStart =
    footerStart !== undefined
      ? footerStart
      : onDownload
        ? (
            <MainBtn
              variant="secondary"
              size="sm"
              leftIcon={<Download size={16} aria-hidden="true" />}
              label="Download"
              onClick={onDownload}
            />
          )
        : undefined

  return (
    <div className={cn("flex flex-col gap-4 h-full min-h-0", className)}>
      {/* ── Page header ── */}
      <div className="flex-none flex items-center justify-between gap-4">
        <h1 className="font-lb font-lb-bold text-[24px] leading-[32px] text-lb-on-surface">
          {title}
        </h1>

        {actions.length > 0 && (
          <div className="flex items-center gap-3">
            {actions.map((action, i) => (
              <MainBtn
                key={action.label}
                variant={action.variant ?? (i === actions.length - 1 ? "primary" : "secondary")}
                size={action.size ?? "md"}
                label={action.label}
                leftIcon={action.leftIcon}
                rightIcon={action.rightIcon}
                disabled={action.disabled}
                loading={action.loading}
                onClick={action.onClick}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Filter cards ── */}
      {filterCards.length > 0 && (
        <div className="flex-none grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2 md:gap-3">
          {filterCards.map((card) => {
            const isSelected = selectedFilterCards
              ? selectedFilterCards.includes(card.label)
              : card.selected ?? false
            const handleChange = selectedFilterCards !== undefined
              ? (sel: boolean) => {
                  const next = sel
                    ? [...selectedFilterCards, card.label]
                    : selectedFilterCards.filter((l) => l !== card.label)
                  onFilterCardsChange?.(next)
                }
              : card.onChange
            return (
              <FilterCard key={card.label} {...card} selected={isSelected} onChange={handleChange} />
            )
          })}
        </div>
      )}

      {/* ── Table ── */}
      <div className="flex-1 min-h-0">
        <Table<T>
          className={tableClassName}
          columns={columns}
          data={data}
          loading={loading}
          totalRows={totalRows}
          page={page}
          perPage={perPage}
          onPageChange={onPageChange}
          filters={filters}
          onRowClick={onRowClick}
          selectedRowId={selectedRowId}
          selectable={selectable}
          selectedIds={selectedIds}
          onSelectionChange={onSelectionChange}
          sortKey={sortKey}
          sortDirection={sortDirection}
          onSortChange={onSortChange}
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={onTabChange}
          footerStart={resolvedFooterStart}
          footerTotal={footerTotal}
          emptyStateTitle={emptyStateTitle}
          emptyStateDescription={emptyStateDescription}
          emptyStateAction={emptyStateAction}
        />
      </div>
    </div>
  )
}

export default ListScreen
