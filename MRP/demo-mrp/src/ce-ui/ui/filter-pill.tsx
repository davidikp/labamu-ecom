"use client"

import * as React from "react"
import { Check, ChevronDown, Loader2, Search } from "lucide-react"
import { cn, toTestId } from "../lib/utils"
import { useLocale } from "../locale"
import { DateField } from "./date-field"

export interface FilterOption {
  value: string
  label: string
}

// ── Internal option indicators ────────────────────────────────────────────────

const RadioIcon = ({ selected }: { selected: boolean }) => (
  <span
    className={cn(
      "w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors duration-150",
      selected ? "border-lb-brand" : "border-lb-line-2"
    )}
  >
    {selected && <span className="w-2 h-2 rounded-full bg-lb-brand" />}
  </span>
)

const CheckboxIcon = ({ selected }: { selected: boolean }) => (
  <span
    className={cn(
      "w-4 h-4 rounded flex items-center justify-center border-2 flex-shrink-0 transition-colors duration-150",
      selected ? "bg-lb-brand border-lb-brand" : "border-lb-line-2"
    )}
  >
    {selected && <Check size={10} strokeWidth={3} className="text-white" aria-hidden="true" />}
  </span>
)

// ── Helpers ───────────────────────────────────────────────────────────────────

const CUSTOM_VALUE = "__custom__"

const formatDisplay = (d: Date | null | undefined) => {
  if (!d) return ""
  const dd = String(d.getDate()).padStart(2, "0")
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const yy = String(d.getFullYear()).slice(2)
  return `${dd}/${mm}/${yy}`
}

// ── Props ─────────────────────────────────────────────────────────────────────

export interface FilterPillProps {
  label: string
  options: FilterOption[]
  size?: "sm" | "lg"
  searchable?: boolean
  /** Called on every search input change. When provided, local filtering is skipped — update `options` from your API response. */
  onSearch?: (query: string) => void
  /** Show a spinner in the search box while the API request is in flight. */
  searchLoading?: boolean
  /** Whether more pages are available. When true, scrolling to the bottom triggers onLoadMore. */
  hasMore?: boolean
  /** Called when the user scrolls to the bottom of the list and hasMore is true. */
  onLoadMore?: () => void
  /** Show a spinner at the bottom of the list while the next page is being fetched. */
  loadingMore?: boolean
  // Single select (default)
  value?: string
  onChange?: (value: string) => void
  /** Value that means "no filter" — defaults to "all" */
  allValue?: string
  // Multiple select
  multiple?: boolean
  values?: string[]
  onChangeMultiple?: (values: string[]) => void
  // Custom date
  customDateEnabled?: boolean
  /** Override the label shown in the option row and trigger. Defaults to locale string. */
  customDateLabel?: string
  customDateFrom?: Date | null
  customDateTo?: Date | null
  onCustomDateChange?: (from: Date | null, to: Date | null) => void
  className?: string
  testId?: string
}

// ── Component ─────────────────────────────────────────────────────────────────

export const FilterPill: React.FC<FilterPillProps> = ({
  label,
  options,
  size = "sm",
  searchable = true,
  onSearch,
  searchLoading = false,
  hasMore = false,
  onLoadMore,
  loadingMore = false,
  value,
  onChange,
  allValue = "all",
  multiple = false,
  values = [],
  onChangeMultiple,
  customDateEnabled = false,
  customDateLabel,
  customDateFrom,
  customDateTo,
  onCustomDateChange,
  className,
  testId,
}) => {
  const locale = useLocale()
  const resolvedCustomDateLabel = customDateLabel ?? locale.filterPill.customDateLabel

  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const ref = React.useRef<HTMLDivElement>(null)
  const panelRef = React.useRef<HTMLDivElement>(null)
  const sentinelRef = React.useRef<HTMLDivElement>(null)
  const [dropUp, setDropUp] = React.useState(false)

  // Flip the panel above the pill when it would overflow the bottom of the viewport.
  React.useLayoutEffect(() => {
    if (!open) { setDropUp(false); return }
    const trigger = ref.current
    const panel = panelRef.current
    if (!trigger || !panel || typeof window === "undefined") return
    const rect = trigger.getBoundingClientRect()
    const panelH = panel.offsetHeight
    const spaceBelow = window.innerHeight - rect.bottom - 8
    const spaceAbove = rect.top - 8
    setDropUp(spaceBelow < panelH && spaceAbove > spaceBelow)
  }, [open])

  const isCustomSelected = !multiple && value === CUSTOM_VALUE

  // ── Active state ────────────────────────────────────────────────────────────
  const isSingleActive = !multiple && !!value && value !== allValue && value !== ""
  const isMultiActive = multiple && values.length > 0
  const isActive = isSingleActive || isMultiActive
  const isOpenOrActive = open || isActive

  // ── Trigger label ───────────────────────────────────────────────────────────
  const triggerLabel = React.useMemo(() => {
    if (!multiple && isCustomSelected && customDateFrom && customDateTo)
      return `${formatDisplay(customDateFrom)} - ${formatDisplay(customDateTo)}`
    if (!multiple && isCustomSelected)
      return resolvedCustomDateLabel
    if (!multiple && isSingleActive)
      return options.find((o) => o.value === value)?.label ?? label
    return label
  }, [multiple, isCustomSelected, customDateFrom, customDateTo, isSingleActive, value, options, label, resolvedCustomDateLabel])

  // ── Click outside ───────────────────────────────────────────────────────────
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  // ── Infinite scroll sentinel ─────────────────────────────────────────────────
  React.useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || !hasMore || loadingMore) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) onLoadMore?.() },
      { threshold: 0.1 }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasMore, loadingMore, onLoadMore, open])

  // When onSearch is provided, the consumer owns filtering — use options as-is
  const filtered = searchable && !onSearch
    ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
    : options

  const handleSearchChange = (query: string) => {
    setSearch(query)
    onSearch?.(query)
  }

  const handleToggle = () => {
    setSearch("")
    if (open === false) onSearch?.("")
    setOpen((o) => !o)
  }

  // Single select
  const handleSingleSelect = (v: string) => {
    onChange?.(v)
    if (v !== CUSTOM_VALUE) setOpen(false)
  }

  const handleSingleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange?.("")
    onCustomDateChange?.(null, null)
    setOpen(false)
  }

  // Multiple select
  const handleMultiToggle = (v: string) => {
    const next = values.includes(v) ? values.filter((x) => x !== v) : [...values, v]
    onChangeMultiple?.(next)
  }

  const handleMultiClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChangeMultiple?.([])
    setOpen(false)
  }

  // ── Size tokens ─────────────────────────────────────────────────────────────
  const sizeClass = size === "lg"
    ? "h-12 px-4 rounded-lb-btn text-[15px] gap-2"
    : "h-9 px-3 rounded-lb-btn text-[13px] gap-2"

  const badgeSizeClass = size === "lg"
    ? "w-6 h-6 text-[12px]"
    : "w-5 h-5 text-[11px]"

  const baseId = toTestId(testId, "filter_pill")

  return (
    <div ref={ref} className="relative inline-block" data-testid={baseId}>
      {/* ── Trigger ── */}
      <button
        type="button"
        onClick={handleToggle}
        data-testid={`${baseId}_trigger`}
        className={cn(
          "inline-flex items-center font-lb font-lb-regular",
          "bg-lb-surface border cursor-pointer whitespace-nowrap transition-all duration-150",
          sizeClass,
          isOpenOrActive
            ? "border-lb-brand text-lb-brand"
            : "border-lb-line-2 text-lb-on-surface-3 hover:border-lb-brand",
          className
        )}
      >
        {isMultiActive && (
          <span
            className={cn(
              "rounded-full bg-lb-brand text-white font-lb-bold",
              "flex items-center justify-center flex-shrink-0",
              badgeSizeClass
            )}
          >
            {values.length}
          </span>
        )}
        <span>{triggerLabel}</span>
        <ChevronDown
          size={size === "lg" ? 18 : 16}
          aria-hidden="true"
          className={cn("flex-shrink-0 transition-transform duration-200", open && "rotate-180")}
        />
      </button>

      {/* ── Dropdown panel ── */}
      {open && (
        <div
          ref={panelRef}
          data-testid={`${baseId}_panel`}
          className={cn(
            "absolute left-0 z-[300]",
            dropUp ? "bottom-[calc(100%+6px)]" : "top-[calc(100%+6px)]",
            "w-[260px] bg-lb-surface border border-lb-line-2",
            "rounded-lb-card shadow-lb-filter",
            "p-4 flex flex-col gap-3"
          )}
        >
          {/* Panel header */}
          <div className="flex items-center justify-between flex-shrink-0">
            <span className="font-lb text-[14px] font-lb-bold text-lb-on-surface leading-[20px]">
              {label}
            </span>
            {isActive && (
              <button
                type="button"
                data-testid={`${baseId}_clear`}
                onClick={multiple ? handleMultiClear : handleSingleClear}
                className="font-lb text-[12px] text-lb-red bg-transparent border-none cursor-pointer leading-[18px] p-0 whitespace-nowrap hover:underline"
              >
                {locale.filterPill.clearFilter}
              </button>
            )}
          </div>

          {/* Search */}
          {searchable && (
            <div className="relative flex-shrink-0">
              {searchLoading ? (
                <Loader2
                  size={15}
                  aria-hidden="true"
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-lb-on-surface-3 pointer-events-none animate-spin"
                />
              ) : (
                <Search
                  size={15}
                  aria-hidden="true"
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-lb-on-surface-3 pointer-events-none"
                />
              )}
              <input
                autoFocus
                data-testid={`${baseId}_search`}
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder={locale.filterPill.searchPlaceholder}
                className={cn(
                  "w-full h-9 pl-8 pr-3 rounded-lb-sm",
                  "bg-lb-surface-grey border-none",
                  "font-lb text-[13px] text-lb-on-surface",
                  "placeholder:text-lb-on-surface-3 outline-none"
                )}
              />
            </div>
          )}

          {/* Options */}
          <div className="flex flex-col max-h-[240px] overflow-y-auto">
            {filtered.length === 0 && !customDateEnabled ? (
              <p className="font-lb text-[13px] text-lb-on-surface-2 leading-[20px] py-2">
                {locale.filterPill.noResults(search)}
              </p>
            ) : multiple ? (
              filtered.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  data-testid={`${baseId}_option_${opt.value}`}
                  onClick={() => handleMultiToggle(opt.value)}
                  className="flex items-center gap-3 py-2 bg-transparent border-none cursor-pointer text-left w-full hover:bg-lb-surface-grey rounded transition-colors"
                >
                  <CheckboxIcon selected={values.includes(opt.value)} />
                  <span className="font-lb text-[13px] text-lb-on-surface leading-[18px]">
                    {opt.label}
                  </span>
                </button>
              ))
            ) : (
              <>
                {filtered.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    data-testid={`${baseId}_option_${opt.value}`}
                    onClick={() => handleSingleSelect(opt.value)}
                    className="flex items-center gap-3 py-2 bg-transparent border-none cursor-pointer text-left w-full hover:bg-lb-surface-grey rounded transition-colors"
                  >
                    <RadioIcon selected={value === opt.value} />
                    <span className="font-lb text-[13px] text-lb-on-surface leading-[18px]">
                      {opt.label}
                    </span>
                  </button>
                ))}

                {/* Custom date option */}
                {customDateEnabled && (
                  <button
                    type="button"
                    data-testid={`${baseId}_option_${CUSTOM_VALUE}`}
                    onClick={() => handleSingleSelect(CUSTOM_VALUE)}
                    className="flex items-center gap-3 py-2 bg-transparent border-none cursor-pointer text-left w-full hover:bg-lb-surface-grey rounded transition-colors"
                  >
                    <RadioIcon selected={isCustomSelected} />
                    <span className="font-lb text-[13px] text-lb-on-surface leading-[18px]">
                      {resolvedCustomDateLabel}
                    </span>
                  </button>
                )}
              </>
            )}
            {/* Infinite scroll sentinel */}
            <div ref={sentinelRef} className="h-px" />
            {loadingMore && (
              <div className="flex justify-center py-2">
                <Loader2 size={16} className="animate-spin text-lb-on-surface-3" aria-hidden="true" />
              </div>
            )}
          </div>

          {/* Date range input — outside the scrollable container so the calendar popover isn't clipped */}
          {!multiple && customDateEnabled && isCustomSelected && (
            <DateField
              variant="range"
              startDate={customDateFrom ?? null}
              endDate={customDateTo ?? null}
              onChange={(start, end) => onCustomDateChange?.(start, end)}
              size="md"
              fieldVariant="outlined"
            />
          )}
        </div>
      )}
    </div>
  )
}

export default FilterPill
