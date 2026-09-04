"use client"

import * as React from "react"
import { cn, toTestId } from "../lib/utils"
import { useLocale } from "../locale"
import { Dropdown, type DropdownOption } from "./dropdown"
import { FilterPill, type FilterOption } from "./filter-pill"
import { LoadingState } from "../ui/loading-state"
import { SearchBar } from "./search-bar"
import { Tooltip } from "./tooltip"
import { Checkbox } from "./checkbox"
import { ChevronsUpDown, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, CircleHelp } from "lucide-react"
import { Tabs, type Tab } from "./tabs"

export type SortDirection = "asc" | "desc" | null

function SortIcon({ direction }: { direction: SortDirection }) {
  if (direction === "asc") return <ChevronUp size={14} className="shrink-0" aria-hidden="true" />
  if (direction === "desc") return <ChevronDown size={14} className="shrink-0" aria-hidden="true" />
  return <ChevronsUpDown size={14} className="shrink-0 opacity-40" aria-hidden="true" />
}

function InfoIcon() {
  return <CircleHelp size={14} className="text-lb-on-surface-3 shrink-0" aria-hidden="true" />
}

export interface TableFiltersConfig {
  /** Search field; with other filters it sits on the right (`justify-between`). */
  search?: {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    className?: string
  }
  /** Single-select filter pill. */
  singleSelect?: {
    label: string
    options: FilterOption[]
    value?: string
    onChange: (value: string) => void
    allValue?: string
    searchable?: boolean
    size?: "sm" | "lg"
    className?: string
  }
  /** Multi-select filter pill. */
  multiSelect?: {
    label: string
    options: FilterOption[]
    values?: string[]
    onChange: (values: string[]) => void
    searchable?: boolean
    size?: "sm" | "lg"
    className?: string
  }
  /** One or more filter pills (compact category filters). */
  filterPills?: Array<{
    label: string
    value: string
    options: FilterOption[]
    onChange: (value: string) => void
    allValue?: string
    searchable?: boolean
    className?: string
  }>
  /**
   * Rows per page (single-select), rendered in the footer to the right of `footerStart` (e.g. Export).
   * Display value comes from the Table `perPage` prop. Reset page to 1 in `onChange` when the size changes.
   */
  rowsPerPage?: {
    onChange: (perPage: number) => void
    /** Defaults to `[25, 50, 100]`. */
    options?: number[]
    label?: string
    placeholder?: string
    className?: string
  }
  className?: string
}

export interface TableColumn<T> {
  key: keyof T
  /** Unique identifier for this column used as the React key. Defaults to `key`. Use this when two columns share the same `key`. */
  columnId?: string
  header: string
  /** Tooltip text shown via an info icon next to the header label. */
  tooltip?: string
  /** When true, clicking the header cycles sort: asc → desc → unsorted. */
  sortable?: boolean
  width?: number
  align?: "left" | "right" | "center"
  sticky?: "left" | "right"
  render?: (value: T[keyof T], row: T) => React.ReactNode
}

export function Table<T extends { id: string | number }>({
  columns,
  data,
  loading,
  onRowClick,
  selectedRowId,
  totalRows = 0,
  page = 1,
  perPage = 20,
  onPageChange,
  showPagination = true,
  toolbar,
  filters,
  footerStart,
  footerTotal,
  emptyState,
  emptyStateTitle,
  emptyStateDescription,
  emptyStateAction,
  loadingTitle,
  loadingDescription,
  loadingLabel,
  className,
  testId,
  hidePaginationOnSinglePage = false,
  sortKey,
  sortDirection,
  onSortChange,
  selectable = false,
  selectedIds = [],
  onSelectionChange,
  tabs,
  activeTab,
  onTabChange,
}: {
  columns: TableColumn<T>[]
  data: T[]
  loading?: boolean
  onRowClick?: (row: T) => void
  /** ID of the currently selected row — highlights it with a blue background. */
  selectedRowId?: string | number | null
  totalRows?: number
  page?: number
  perPage?: number
  onPageChange?: (page: number) => void
  /** Controls visibility of pagination controls in the footer. Defaults to true. */
  showPagination?: boolean
  toolbar?: React.ReactNode
  /** Search bar + dropdowns + filter pills row below the toolbar (and above the grid). */
  filters?: TableFiltersConfig
  /** Left side of the footer row (e.g. download), before per-page and total. */
  footerStart?: React.ReactNode
  /** Overrides default total copy next to the per-page control (e.g. `from 64 rows`). */
  footerTotal?: React.ReactNode
  /** Custom empty state node rendered inside tbody when data is empty */
  emptyState?: React.ReactNode
  /** Title shown in the default empty state (when emptyState is not provided) */
  emptyStateTitle?: string
  /** Description shown in the default empty state (when emptyState is not provided) */
  emptyStateDescription?: string
  /** Optional action button rendered below the description in the default empty state */
  emptyStateAction?: React.ReactNode
  /** Optional title shown in loading state. */
  loadingTitle?: React.ReactNode
  /** Optional description shown in loading state. */
  loadingDescription?: React.ReactNode
  /** Accessible label announced during loading. */
  loadingLabel?: string
  /** The key of the column currently sorted. Pass `null` for no active sort. */
  sortKey?: keyof T | null
  /** Current sort direction. Pass `null` for no active sort. */
  sortDirection?: SortDirection
  /** Called when the user clicks a sortable header. `key` and `direction` are both `null` when the sort is cleared. */
  onSortChange?: (key: keyof T | null, direction: SortDirection) => void
  className?: string
  testId?: string
  /** Hide prev/next/page-number controls when all rows fit on one page. Defaults to false. */
  hidePaginationOnSinglePage?: boolean
  /** When true, renders a checkbox column as the first column for multi-row selection. */
  selectable?: boolean
  /** Controlled list of selected row IDs. */
  selectedIds?: (string | number)[]
  /** Called when the selection changes. */
  onSelectionChange?: (ids: (string | number)[]) => void
  /** Tabs rendered at the top of the card, above the filters row. */
  tabs?: Tab[]
  activeTab?: string
  onTabChange?: (id: string) => void
}) {
  const locale = useLocale()
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const [scrolled, setScrolled] = React.useState(false)
  const [activeRowId, setActiveRowId] = React.useState<string | number | null>(null)
  const [internalActiveTab, setInternalActiveTab] = React.useState(tabs?.[0]?.id ?? "")
  const resolvedActiveTab = activeTab ?? internalActiveTab
  const resolvedOnTabChange = onTabChange ?? setInternalActiveTab
  const effectiveSelectedId = selectedRowId !== undefined ? selectedRowId : activeRowId
  const totalPages = Math.max(1, Math.ceil(totalRows / perPage))

  const handleScroll = () => {
    setScrolled(scrollRef.current!.scrollLeft > 0)
  }

  const stickyBg = "bg-lb-surface"

  const filterPillCount = filters?.filterPills?.length ?? 0
  const hasFilters = !!filters && [filters.search, filters.singleSelect, filters.multiSelect, filterPillCount > 0].some(Boolean)
  const hasFilterLeft = [filters?.singleSelect, filters?.multiSelect, filterPillCount > 0].some(Boolean)
  const hasFilterSearch = !!filters?.search

  const rowsPerPageDropdownOptions: DropdownOption[] = filters?.rowsPerPage
    ? (() => {
        const base = (filters.rowsPerPage.options ?? [25, 50, 100]).filter((n) => n !== 100 || totalRows >= 50)
        const nums = base.includes(perPage) ? [...base] : [...base, perPage].sort((a, b) => a - b)
        return nums.map((n) => ({ value: String(n), label: String(n) }))
      })()
    : []

  const pageNums = React.useMemo(() => {
    const pages = Math.max(totalPages, 1)
    if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1)
    const delta = 2
    const range: (number | "...")[] = []
    let prev: number | null = null
    for (let i = 1; i <= pages; i++) {
      if (i === 1 || i === pages || (i >= page - delta && i <= page + delta)) {
        if (prev !== null && i - prev > 1) range.push("...")
        range.push(i)
        prev = i
      }
    }
    return range
  }, [page, totalPages])

  function handleSort(key: keyof T) {
    if (sortKey === key) {
      if (sortDirection === "asc") onSortChange?.(key, "desc")
      else if (sortDirection === "desc") onSortChange?.(null, null)
      else onSortChange?.(key, "asc")
    } else {
      onSortChange?.(key, "asc")
    }
  }

  const selectedSet = new Set(selectedIds)
  const selectableIds = data.map((r) => r.id)
  const selectedCount = selectableIds.filter((id) => selectedSet.has(id)).length
  const allSelected = selectableIds.length > 0 && selectedCount === selectableIds.length
  const someSelected = selectedCount > 0 && !allSelected

  function toggleRow(id: string | number) {
    const next = new Set(selectedSet)
    next.has(id) ? next.delete(id) : next.add(id)
    onSelectionChange?.(Array.from(next))
  }

  function toggleAll() {
    if (allSelected) {
      onSelectionChange?.(selectedIds.filter((id) => !selectableIds.includes(id)))
    } else {
      const next = new Set(selectedSet)
      selectableIds.forEach((id) => next.add(id))
      onSelectionChange?.(Array.from(next))
    }
  }

  return (
    <div
      data-testid={toTestId(testId, "table")}
      className={cn(
        "flex flex-col bg-lb-surface",
        "rounded-lb-card overflow-hidden",
        // Parent should set an explicit height (or wrap with a fixed height).
        // This makes the internal scroll area behave correctly.
        "h-full min-h-0",
        className
      )}
    >
      {tabs && tabs.length > 0 && (
        <div className="flex-none">
          <Tabs tabs={tabs} activeTab={resolvedActiveTab} onChange={resolvedOnTabChange} />
        </div>
      )}

      {toolbar && (
        <div className="flex-none min-h-14 px-5 py-3 border-b border-lb-line-2 flex items-center justify-between gap-3 bg-lb-surface">
          {toolbar}
        </div>
      )}

      {hasFilters && filters && (
        <div
          className={cn(
            "flex-none px-5 py-3 border-b border-lb-line-2 bg-lb-surface",
            filters.className
          )}
        >
          <div
            className={cn(
              "flex flex-wrap items-end gap-3",
              hasFilterLeft && hasFilterSearch && "justify-between",
              !hasFilterLeft && hasFilterSearch && "justify-end",
              hasFilterLeft && !hasFilterSearch && "justify-start"
            )}
          >
            {hasFilterLeft && (
              <div className="flex flex-wrap items-end gap-3 min-w-0">
                {filters.singleSelect && (
                  <FilterPill
                    className={filters.singleSelect.className}
                    label={filters.singleSelect.label}
                    options={filters.singleSelect.options}
                    value={filters.singleSelect.value}
                    onChange={filters.singleSelect.onChange}
                    allValue={filters.singleSelect.allValue}
                    searchable={filters.singleSelect.searchable}
                    size={filters.singleSelect.size}
                  />
                )}
                {filters.multiSelect && (
                  <FilterPill
                    multiple
                    className={filters.multiSelect.className}
                    label={filters.multiSelect.label}
                    options={filters.multiSelect.options}
                    values={filters.multiSelect.values}
                    onChangeMultiple={filters.multiSelect.onChange}
                    searchable={filters.multiSelect.searchable}
                    size={filters.multiSelect.size}
                  />
                )}
                {filters.filterPills && filters.filterPills.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 min-w-0">
                    {filters.filterPills.map((pill) => (
                      <FilterPill
                        key={pill.label}
                        label={pill.label}
                        value={pill.value}
                        options={pill.options}
                        onChange={pill.onChange}
                        allValue={pill.allValue}
                        searchable={pill.searchable}
                        className={pill.className}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
            {filters.search && (
              <SearchBar
                className={cn(
                  "w-full min-w-0 sm:w-72 sm:max-w-sm sm:shrink-0",
                  filters.search.className
                )}
                value={filters.search.value}
                onChange={(e) => filters.search!.onChange(e.target.value)}
                placeholder={filters.search.placeholder ?? locale.table.searchPlaceholder}
              />
            )}
          </div>
        </div>
      )}

      <div ref={scrollRef} onScroll={handleScroll} className="flex-1 min-h-0 overflow-auto">
        <table className="w-full border-collapse">
          <thead className="bg-lb-surface">
            <tr>
              {selectable && (
                <th
                  className={cn(
                    "sticky top-0 z-20 w-[52px]",
                    "h-[49px] px-4",
                    "border-b border-lb-line-2 bg-lb-surface"
                  )}
                >
                  <Checkbox
                    checked={allSelected ? true : someSelected ? "indeterminate" : false}
                    onChange={toggleAll}
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.columnId ?? String(col.key)}
                  style={col.width ? { width: col.width } : undefined}
                  className={cn(
                    // Sticky header (more reliable on <th> than <thead> across browsers)
                    "sticky top-0 z-20",
                    "h-[49px] px-4 font-lb text-[14px]",
                    "font-lb-bold text-lb-on-surface leading-[20px]",
                    "whitespace-nowrap border-b border-lb-line-2 bg-lb-surface",
                    col.align === "right" && "text-right",
                    col.align === "center" && "text-center",
                    !col.align && "text-left",
                    col.sticky === "left" && `sticky left-0 z-[22] ${stickyBg}`,
                    col.sticky === "right" && `sticky right-0 z-[22] ${stickyBg}`,
                    col.sticky === "right" && scrolled && "shadow-lb-sticky-col",
                    col.sortable && "cursor-pointer select-none hover:text-lb-brand transition-colors duration-[120ms]"
                  )}
                  onClick={col.sortable ? () => handleSort(col.key) : undefined}
                  aria-sort={
                    col.sortable
                      ? sortKey === col.key
                        ? sortDirection === "asc"
                          ? "ascending"
                          : "descending"
                        : "none"
                      : undefined
                  }
                >
                  <div
                    className={cn(
                      "flex items-center gap-1.5",
                      col.align === "right" && "justify-end",
                      col.align === "center" && "justify-center"
                    )}
                  >
                    {col.header}
                    {col.tooltip && (
                      <Tooltip content={col.tooltip} placement="bottom">
                        <span onClick={(e) => e.stopPropagation()}>
                          <InfoIcon />
                        </span>
                      </Tooltip>
                    )}
                    {col.sortable && (
                      <SortIcon direction={sortKey === col.key ? (sortDirection ?? null) : null} />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="text-center py-12 text-lb-on-surface-3 font-lb text-[14px]">
                  <LoadingState
                    className="mx-auto"
                    label={loadingLabel ?? locale.table.loadingLabel}
                    title={loadingTitle}
                    description={loadingDescription}
                  />
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)}>
                  {emptyState ?? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4 px-6 text-center">
                      <img src="/file.svg" alt="" width={120} height={120} />
                      <div>
                        <p className="font-lb font-lb-semibold text-[15px] text-lb-on-surface">
                          {emptyStateTitle ?? locale.table.emptyTitle}
                        </p>
                        {emptyStateDescription && (
                          <p className="font-lb text-[13px] text-lb-on-surface-2 mt-1">
                            {emptyStateDescription}
                          </p>
                        )}
                      </div>
                      {emptyStateAction}
                    </div>
                  )}
                </td>
              </tr>
            ) : (
              data.map((row) => {
                const isSelected = effectiveSelectedId != null && row.id === effectiveSelectedId
                const isChecked = selectedSet.has(row.id)
                return (
                  <tr
                    key={row.id}
                    onClick={() => { setActiveRowId(row.id); onRowClick?.(row); if (selectable) toggleRow(row.id) }}
                    className={cn("transition-colors duration-[120ms]", onRowClick && "cursor-pointer hover:bg-lb-brand-light")}
                  >
                    {selectable && (
                      <td
                        className={cn(
                          "h-[49px] px-4",
                          isChecked || isSelected ? "bg-lb-brand-light" : "bg-lb-surface",
                          "border-b border-lb-line-1"
                        )}
                        onClick={(e) => { e.stopPropagation(); toggleRow(row.id) }}
                      >
                        <Checkbox checked={isChecked} onChange={() => toggleRow(row.id)} />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td
                        key={col.columnId ?? String(col.key)}
                        className={cn(
                          "h-[49px] px-4 font-lb text-[14px]",
                          "text-lb-on-surface leading-[20px]",
                          isSelected ? "bg-lb-brand-light" : "bg-lb-surface",
                          "border-b border-lb-line-1",
                          col.align === "right" && "text-right",
                          col.align === "center" && "text-center",
                          !col.align && "text-left",
                          col.sticky === "left" && `sticky left-0 z-[21] ${isSelected ? "bg-lb-brand-light" : stickyBg}`,
                          col.sticky === "right" && `sticky right-0 z-[21] ${isSelected ? "bg-lb-brand-light" : stickyBg}`,
                          col.sticky === "right" && scrolled && "shadow-lb-sticky-col"
                        )}
                      >
                        {col.render ? col.render(row[col.key], row) : String(row[col.key] ?? "")}
                      </td>
                    ))}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex-none min-h-[60px] px-5 py-2 border-t border-lb-line-1 flex items-center justify-between gap-3 bg-lb-surface">
        <div className="flex items-center flex-nowrap gap-2 min-w-0 shrink-0">
          {footerStart}
          {footerStart && filters?.rowsPerPage && (
            <div className="h-6 w-px shrink-0 bg-lb-line-1" role="presentation" aria-hidden />
          )}
          {filters?.rowsPerPage && (
            <Dropdown
              menuPosition="top"
              appearance="toolbar"
              size="sm"
              disabled={totalRows <= 25}
              className={cn("shrink-0 w-20", filters.rowsPerPage.className)}
              options={rowsPerPageDropdownOptions}
              value={String(perPage)}
              onChange={(v) => {
                const raw = `${v}`
                const next = Number.parseInt(raw, 10)
                if (!Number.isNaN(next) && next > 0) filters.rowsPerPage!.onChange(next)
              }}
              label={filters.rowsPerPage.label}
              placeholder={filters.rowsPerPage.placeholder ?? locale.table.rowsPerPagePlaceholder}
            />
          )}
          {footerTotal ?? (
            <span className="font-lb text-[12px] text-lb-on-surface-2 whitespace-nowrap leading-none truncate">
              {filters?.rowsPerPage ? locale.table.fromRows(totalRows) : locale.table.totalData(totalRows)}
            </span>
          )}
        </div>
        {showPagination && (!hidePaginationOnSinglePage || totalPages > 1) && <div className="flex items-center gap-1 shrink-0 ml-auto">
            <button
              onClick={() => onPageChange?.(page - 1)}
              disabled={page <= 1}
              className={cn(
                "w-[30px] h-[30px] rounded-lb-sm flex items-center justify-center",
                "font-lb text-[14px] border transition-colors duration-[120ms] cursor-pointer",
                page <= 1
                  ? "bg-lb-surface-grey text-lb-on-surface-3 border-transparent cursor-not-allowed"
                  : "bg-lb-surface border-lb-brand text-lb-on-surface hover:bg-lb-surface-grey"
              )}
              type="button"
            >
              <ChevronLeft size={16} aria-hidden="true" />
            </button>

            {pageNums.map((n, i) =>
              n === "..." ? (
                <span key={`ellipsis-${i}`} className="min-w-[30px] h-[30px] px-1 flex items-center justify-center font-lb text-[14px] text-lb-on-surface-2">
                  …
                </span>
              ) : (
                <button
                  key={n}
                  onClick={() => onPageChange?.(n as number)}
                  className={cn(
                    "min-w-[30px] h-[30px] px-1 rounded-lb-sm flex items-center justify-center",
                    "font-lb text-[14px] border-none transition-colors duration-[120ms] cursor-pointer",
                    n === page ? "bg-lb-brand text-lb-brand-on" : "bg-transparent text-lb-on-surface hover:bg-lb-surface-grey"
                  )}
                  type="button"
                >
                  {n}
                </button>
              )
            )}

            <button
              onClick={() => onPageChange?.(page + 1)}
              disabled={page >= totalPages}
              className={cn(
                "w-[30px] h-[30px] rounded-lb-sm flex items-center justify-center",
                "font-lb text-[14px] border transition-colors duration-[120ms] cursor-pointer",
                page >= totalPages
                  ? "bg-lb-surface-grey text-lb-on-surface-3 border-transparent cursor-not-allowed"
                  : "bg-lb-surface border-lb-brand text-lb-on-surface hover:bg-lb-surface-grey"
              )}
              type="button"
            >
              <ChevronRight size={16} aria-hidden="true" />
            </button>
          </div>}
      </div>
    </div>
  )
}

export default Table

