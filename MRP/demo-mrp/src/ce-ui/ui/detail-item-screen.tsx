"use client"

import * as React from "react"
import { cn, toTestId } from "../lib/utils"
import Breadcrumbs, { type BreadcrumbItem } from "./breadcrumbs"
import { ChipTabs, type ChipTab } from "./chip-tabs"
import { MainBtn } from "./main-btn"
import { Card } from "./card"
import { Table, type TableColumn, type TableFiltersConfig, type SortDirection } from "./table"

// ── Action types ──────────────────────────────────────────────────────────────

export interface DetailItemAction {
  label: string
  onClick: () => void
  variant?: "primary" | "secondary"
  size?: "sm" | "md" | "lg" | "xl"
  disabled?: boolean
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export interface DetailItemSectionAction {
  label: string
  onClick: () => void
  variant?: "primary" | "secondary"
  size?: "sm" | "md" | "lg" | "xl"
  disabled?: boolean
  loading?: boolean
  leftIcon?: React.ReactNode
}

// ── Field type ────────────────────────────────────────────────────────────────

export interface DetailItemField {
  title: string
  value: React.ReactNode
}

// ── Section types ─────────────────────────────────────────────────────────────

interface DetailItemBaseSection {
  title?: React.ReactNode
  description?: React.ReactNode
  /** Rendered to the left of the section action button (e.g. a StatusBadge). */
  status?: React.ReactNode
  action?: DetailItemSectionAction
}

export interface DetailItemInfoSection extends DetailItemBaseSection {
  type: "info"
  fields: DetailItemField[]
  /** Number of columns in the fields grid. Defaults to 4. */
  gridColumns?: 2 | 3 | 4
}

export interface DetailItemTableSection extends DetailItemBaseSection {
  type: "table"
  tableColumns: TableColumn<any>[]
  tableData: { id: string | number; [key: string]: any }[]
  loading?: boolean
  totalRows?: number
  page?: number
  perPage?: number
  onPageChange?: (page: number) => void
  filters?: TableFiltersConfig
  onRowClick?: (row: any) => void
  selectedRowId?: string | number | null
  selectable?: boolean
  selectedIds?: (string | number)[]
  onSelectionChange?: (ids: (string | number)[]) => void
  sortKey?: string | number | null
  sortDirection?: SortDirection
  onSortChange?: (key: any, direction: SortDirection) => void
  footerStart?: React.ReactNode
  footerTotal?: React.ReactNode
  emptyStateTitle?: string
  emptyStateDescription?: string
  emptyStateAction?: React.ReactNode
  tableClassName?: string
}

export type DetailItemSection = DetailItemInfoSection | DetailItemTableSection

// ── Screen props ──────────────────────────────────────────────────────────────

export interface DetailItemScreenProps {
  // ── Header ──────────────────────────────────────────────────────────────────
  title: string
  breadcrumbs: BreadcrumbItem[]
  titleOnBreadcrumb?: string
  onBack?: () => void
  showBackButton?: boolean
  /** Page-level action buttons. Last item defaults to "primary", rest to "secondary". */
  actions?: DetailItemAction[]

  // ── Chip tabs ────────────────────────────────────────────────────────────────
  tabs?: ChipTab[]
  activeTab?: string
  onTabChange?: (id: string) => void

  // ── Content ──────────────────────────────────────────────────────────────────
  sections: DetailItemSection[]

  // ── Layout ──────────────────────────────────────────────────────────────────
  className?: string
  contentClassName?: string
  testId?: string
}

// ── Internal: Info section body ───────────────────────────────────────────────

const GRID_COLS: Record<2 | 3 | 4, string> = {
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
}

function InfoSectionBody({ section }: { section: DetailItemInfoSection }) {
  return (
    <div className={cn("grid gap-x-6 gap-y-5 px-4 pb-5", GRID_COLS[section.gridColumns ?? 4])}>
      {section.fields.map((field, i) => (
        <div key={i} className="flex flex-col gap-0.5 min-w-0">
          <span className="font-lb text-[12px] text-lb-on-surface-3 leading-[18px]">
            {field.title}
          </span>
          <div className="font-lb text-[14px] font-lb-bold text-lb-on-surface leading-[20px] break-words">
            {field.value}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Internal: Table section body ──────────────────────────────────────────────

function TableSectionBody({ section }: { section: DetailItemTableSection }) {
  return (
    <Table
      className={section.tableClassName}
      columns={section.tableColumns}
      data={section.tableData}
      loading={section.loading}
      totalRows={section.totalRows ?? section.tableData.length}
      page={section.page}
      perPage={section.perPage}
      onPageChange={section.onPageChange}
      filters={section.filters}
      onRowClick={section.onRowClick}
      selectedRowId={section.selectedRowId}
      selectable={section.selectable}
      selectedIds={section.selectedIds}
      onSelectionChange={section.onSelectionChange}
      sortKey={section.sortKey as any}
      sortDirection={section.sortDirection}
      onSortChange={section.onSortChange}
      footerStart={section.footerStart}
      footerTotal={section.footerTotal}
      emptyStateTitle={section.emptyStateTitle}
      emptyStateDescription={section.emptyStateDescription}
      emptyStateAction={section.emptyStateAction}
    />
  )
}

// ── Internal: Section card ────────────────────────────────────────────────────

function SectionCard({ section }: { section: DetailItemSection }) {
  const hasStatus = !!section.status
  const hasAction = !!section.action

  const sectionActions =
    hasStatus || hasAction ? (
      <>
        {section.status}
        {hasAction && (
          <MainBtn
            variant={section.action!.variant ?? "primary"}
            size={section.action!.size ?? "sm"}
            label={section.action!.label}
            leftIcon={section.action!.leftIcon}
            disabled={section.action!.disabled}
            loading={section.action!.loading}
            onClick={section.action!.onClick}
          />
        )}
      </>
    ) : undefined

  return (
    <Card
      title={section.title}
      description={section.description}
      actions={sectionActions}
      showAccent={false}
    >
      {section.type === "info" && <InfoSectionBody section={section} />}
      {section.type === "table" && <TableSectionBody section={section} />}
    </Card>
  )
}

// ── DetailItemScreen ──────────────────────────────────────────────────────────

export const DetailItemScreen: React.FC<DetailItemScreenProps> = ({
  title,
  breadcrumbs,
  titleOnBreadcrumb,
  onBack,
  showBackButton = true,
  actions = [],
  tabs,
  activeTab,
  onTabChange,
  sections,
  className,
  contentClassName,
  testId,
}) => {
  const [internalTab, setInternalTab] = React.useState(tabs?.[0]?.id ?? "")
  const resolvedTab = activeTab ?? internalTab
  const resolvedOnTabChange = onTabChange ?? setInternalTab

  return (
    <div
      data-testid={toTestId(testId, "detail_item_screen")}
      className={cn("flex flex-col gap-4 h-full min-h-0", className)}
    >
      {/* ── Header ── */}
      <div className="flex-none flex items-start justify-between gap-4">
        <Breadcrumbs
          title={title}
          titleOnBreadcrumb={titleOnBreadcrumb}
          breadcrumbs={breadcrumbs}
          onBack={onBack}
          showBackButton={showBackButton}
        />
        {actions.length > 0 && (
          <div className="flex items-center gap-3 shrink-0 pt-1">
            {actions.map((action, i) => (
              <MainBtn
                key={action.label}
                variant={action.variant ?? (i === actions.length - 1 ? "primary" : "secondary")}
                size={action.size ?? "sm"}
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

      {/* ── ChipTabs ── */}
      {tabs && tabs.length > 0 && (
        <div className="flex-none">
          <ChipTabs
            tabs={tabs}
            activeTab={resolvedTab}
            onChange={resolvedOnTabChange}
          />
        </div>
      )}

      {/* ── Content sections ── */}
      <div className={cn("flex flex-col gap-4 flex-1 min-h-0 overflow-y-auto", contentClassName)}>
        {sections.map((section, i) => (
          <SectionCard key={i} section={section} />
        ))}
      </div>
    </div>
  )
}

export default DetailItemScreen
