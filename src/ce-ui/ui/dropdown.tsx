"use client"

import * as React from "react"
import { Check, ChevronDown, Search, X } from "lucide-react"
import { cn, toTestId } from "../lib/utils"
import Popup from "./popup"
import { FieldDesktopRow } from "./field-desktop"
import { useLocale } from "../locale"

export interface DropdownOption {
  value: string
  label: string
  disabled?: boolean
}

export const Dropdown: React.FC<{
  options: DropdownOption[]
  value?: string | string[]
  onChange?: (value: string | string[]) => void
  placeholder?: string
  multi?: boolean
  searchable?: boolean
  disabled?: boolean
  error?: boolean
  errorText?: string
  label?: string
  required?: boolean
  size?: "lg" | "md" | "sm"
  appearance?: "default" | "toolbar"
  menuPosition?: "top" | "bottom"
  className?: string
  testId?: string
  addNewOptionEnabled?: boolean
  addNewOptionLabel?: string
  addNewOptionTitle?: string
  addNewOptionPlaceholder?: string
  addNewOptionSubmitLabel?: string
  onAddNewOption?: (value: string) => void
  customValueEnabled?: boolean
  customValueLabel?: string
  helperText?: string
  tooltip?: string
  fieldDesktop?: boolean
  /** Called on every keystroke in the search box. Use to fetch options from an API and update `options` prop. When provided, local filtering is disabled. */
  onSearch?: (query: string) => void
  /** Show a loading indicator in the option list (e.g. while an API call is in flight). */
  loading?: boolean
  /** Whether there are more pages to load. When true and the user scrolls to the bottom, `onLoadMore` is called. */
  hasMore?: boolean
  /** Called when the user scrolls to the bottom of the list and `hasMore` is true. Use to fetch the next page and append items to `options`. */
  onLoadMore?: () => void
}> = ({
  options,
  value,
  onChange,
  placeholder,
  multi = false,
  searchable = false,
  disabled = false,
  error = false,
  errorText,
  label,
  required,
  size = "md",
  appearance = "default",
  menuPosition,
  className,
  testId,
  addNewOptionEnabled = false,
  addNewOptionLabel,
  addNewOptionTitle,
  addNewOptionPlaceholder,
  addNewOptionSubmitLabel,
  onAddNewOption,
  customValueEnabled = false,
  customValueLabel,
  helperText,
  tooltip,
  fieldDesktop = false,
  onSearch,
  loading = false,
  hasMore = false,
  onLoadMore,
}) => {
  const locale = useLocale()
  const resolvedPlaceholder = placeholder ?? locale.dropdown.placeholder
  const resolvedAddNewLabel = addNewOptionLabel ?? locale.dropdown.addNewLabel
  const resolvedAddNewTitle = addNewOptionTitle ?? locale.dropdown.addNewTitle
  const resolvedAddNewPlaceholder = addNewOptionPlaceholder ?? locale.dropdown.addNewInputPlaceholder
  const resolvedAddNewSubmitLabel = addNewOptionSubmitLabel ?? locale.dropdown.addNewSubmitLabel
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const [openAddNewPopup, setOpenAddNewPopup] = React.useState(false)
  const [newOptionValue, setNewOptionValue] = React.useState("")
  const [autoPosition, setAutoPosition] = React.useState<"top" | "bottom">("bottom")
  const ref = React.useRef<HTMLDivElement>(null)
  const searchInputRef = React.useRef<HTMLInputElement>(null)
  const listRef = React.useRef<HTMLDivElement>(null)
  const menuRef = React.useRef<HTMLDivElement>(null)
  const sentinelRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  React.useEffect(() => {
    if (!open || !onLoadMore || !hasMore || loading) return
    const sentinel = sentinelRef.current
    const container = listRef.current
    if (!sentinel || !container) return
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) onLoadMore() },
      { root: container, threshold: 0.1 }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [open, onLoadMore, hasMore, loading])

  React.useEffect(() => {
    if (!open || !(searchable || customValueEnabled)) return
    const t = window.setTimeout(() => searchInputRef.current?.focus(), 0)
    return () => window.clearTimeout(t)
  }, [open, searchable, customValueEnabled])

  const isSelected = (v: string) => (multi ? ((value as string[]) || []).includes(v) : value === v)

  const selectedValues = multi ? ((value as string[]) || []) : []

  const displayValue = multi
    ? ""
    : options.find((o) => o.value === value)?.label || ""

  const isSearchable = searchable || customValueEnabled || !!onSearch
  const filtered = isSearchable && !onSearch
    ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
    : options

  // Auto-flip the menu above the trigger when there isn't enough room below
  // (and there's more room above), unless the consumer explicitly forces
  // `menuPosition`.
  React.useLayoutEffect(() => {
    if (!open || menuPosition) return
    const trigger = ref.current
    if (!trigger) return
    const rect = trigger.getBoundingClientRect()
    const spaceBelow = window.innerHeight - rect.bottom
    const spaceAbove = rect.top
    const menuHeight = menuRef.current?.offsetHeight ?? 320
    setAutoPosition(spaceBelow < menuHeight && spaceAbove > spaceBelow ? "top" : "bottom")
  }, [open, menuPosition, filtered.length])

  const showCustomValueRow =
    customValueEnabled &&
    search.trim().length > 0 &&
    !options.some((o) => o.label.toLowerCase() === search.trim().toLowerCase())

  const handleAddCustomValue = () => {
    const trimmed = search.trim()
    if (!trimmed) return
    onAddNewOption?.(trimmed)
    setSearch("")
    if (!multi) setOpen(false)
  }

  const handleSelect = (v: string) => {
    if (multi) {
      const arr = (value as string[]) || []
      onChange?.(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v])
    } else {
      onChange?.(v)
      setOpen(false)
    }
  }

  const handleRemoveTag = (v: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const arr = (value as string[]) || []
    onChange?.(arr.filter((x) => x !== v))
  }

  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange?.([])
  }

  const handleOpenAddNewPopup = () => {
    setOpen(false)
    setOpenAddNewPopup(true)
  }

  const handleSubmitAddNew = () => {
    const trimmedValue = newOptionValue.trim()
    if (!trimmedValue) return
    onAddNewOption?.(trimmedValue)
    setNewOptionValue("")
    setOpenAddNewPopup(false)
  }

  // Size-driven tokens
  const triggerSize = {
    lg: "h-12 px-4 pr-12 text-[16px] leading-[22px] tracking-[0.11px]",
    md: "h-10 px-3 pr-10 text-[14px] leading-[20px] tracking-[0.0962px]",
    sm: "h-8  px-2 pr-8  text-[13px] leading-[18px] tracking-[0.0825px]",
  }[size]

  const chevronSize = {
    lg: "right-4 w-5 h-5",
    md: "right-3 w-5 h-5",
    sm: "right-2 w-4 h-4",
  }[size]

  const itemSize = {
    lg: "px-4 py-3   min-h-12 text-[16px] leading-[22px]",
    md: "px-3 py-2.5 min-h-10 text-[14px] leading-[20px]",
    sm: "px-2 py-1.5 min-h-8  text-[13px] leading-[18px]",
  }[size]

  const dropdownDiv = (
      <div
        className={cn("flex flex-col gap-1", !className?.includes("w-") && "w-full", className)}
        ref={ref}
        data-testid={toTestId(testId, "dropdown")}
      >
        {!fieldDesktop && label && (
          <div className="flex items-center gap-0.5">
            {required && <span className="font-lb text-[14px] font-lb-bold text-lb-red">*</span>}
            <span className="font-lb text-[12px] text-lb-on-surface leading-[18px]">{label}</span>
          </div>
        )}
        <div className="relative">
          <div
            onClick={() => {
              if (disabled) return
              if (isSearchable && !multi && open) return
              setOpen(!open)
            }}
            role="button"
            tabIndex={disabled ? -1 : 0}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); !disabled && setOpen(!open) } }}
            className={cn(
              "w-full border text-left rounded-lb-sm font-lb",
              multi ? "min-h-10 px-3 py-2 pr-16 flex flex-wrap gap-1.5 items-center" : `flex items-center ${triggerSize}`,
              size === "sm" && appearance === "toolbar" && "rounded-lb-pill",
              "transition-colors duration-150 outline-none",
              !disabled && "cursor-pointer",
              disabled && "bg-lb-surface-grey text-lb-on-surface-3 cursor-not-allowed border-lb-line-1",
              !disabled && error && "border-lb-red bg-lb-surface text-lb-on-surface",
              !disabled && !error && open && "border-lb-brand bg-lb-surface text-lb-on-surface",
              !disabled &&
                !error &&
                !open &&
                appearance === "toolbar" &&
                "border-lb-brand bg-white text-lb-brand hover:border-lb-line-2 focus-visible:border-lb-brand",
              !disabled &&
                !error &&
                !open &&
                appearance === "default" &&
                "border-lb-line-1 bg-lb-surface text-lb-on-surface hover:border-lb-line-2",
              (!displayValue && !multi) && "text-lb-on-surface-3"
            )}
          >
            {multi ? (
              selectedValues.length === 0 ? (
                <span className="text-lb-on-surface-3 text-[14px] leading-[20px] tracking-[0.0962px]">{resolvedPlaceholder}</span>
              ) : (
                selectedValues.map((v) => {
                  const label = options.find((o) => o.value === v)?.label ?? v
                  return (
                    <span
                      key={v}
                      className="inline-flex items-center gap-1 h-6 pl-2.5 pr-1.5 rounded-lb-pill bg-lb-brand-light border border-lb-brand text-lb-brand font-lb-bold text-[12px] leading-[18px] whitespace-nowrap"
                    >
                      {label}
                      {!disabled && (
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(e) => handleRemoveTag(v, e)}
                          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); const ev = e as unknown as React.MouseEvent; handleRemoveTag(v, ev) } }}
                          className="flex items-center justify-center w-3.5 h-3.5 rounded-full hover:bg-lb-brand/20 transition-colors cursor-pointer"
                          aria-label="Remove"
                        >
                          <X size={8} strokeWidth={2} aria-hidden="true" />
                        </span>
                      )}
                    </span>
                  )
                })
              )
            ) : isSearchable && open ? (
              <input
                ref={searchInputRef}
                value={search}
                onChange={(e) => { setSearch(e.target.value); onSearch?.(e.target.value) }}
                onClick={(e) => e.stopPropagation()}
                placeholder={displayValue || resolvedPlaceholder}
                className="flex-1 min-w-0 bg-transparent outline-none border-none font-lb text-inherit placeholder:text-lb-on-surface-3"
              />
            ) : (
              displayValue || resolvedPlaceholder
            )}

            <span className="absolute top-1/2 -translate-y-1/2 right-3 flex items-center gap-1 pointer-events-none">
              {multi && selectedValues.length > 0 && !disabled && (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={handleClearAll}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); const ev = e as unknown as React.MouseEvent; handleClearAll(ev) } }}
                  className="pointer-events-auto flex items-center justify-center w-4 h-4 rounded-full hover:bg-lb-surface-grey transition-colors cursor-pointer text-lb-on-surface-3 hover:text-lb-on-surface"
                  aria-label="Clear all"
                >
                  <X size={10} strokeWidth={2} aria-hidden="true" />
                </span>
              )}
              <ChevronDown
                className={cn(
                  "transition-transform duration-200",
                  chevronSize,
                  open ? "rotate-180 text-lb-brand" : "text-lb-on-surface"
                )}
                strokeWidth={1.5}
                aria-hidden="true"
              />
            </span>
          </div>

          {open && (
            <div
              ref={menuRef}
              className={cn(
                "absolute left-0 right-0 z-[1000] bg-lb-surface border border-lb-line-2 rounded-lb-sm shadow-lb-filter flex flex-col",
                (menuPosition ?? autoPosition) === "top" ? "bottom-[calc(100%+4px)]" : "top-[calc(100%+4px)]"
              )}
            >
              {isSearchable && multi && (
                <div className="p-1 pb-0 flex-shrink-0">
                  <div className="relative mb-1">
                    <input
                      ref={searchInputRef}
                      value={search}
                      onChange={(e) => { setSearch(e.target.value); onSearch?.(e.target.value) }}
                      placeholder={locale.dropdown.searchPlaceholder}
                      className="w-full h-9 pl-9 pr-3 rounded-lb-sm border border-lb-line-1 font-lb text-[14px] outline-none focus:border-lb-brand text-lb-on-surface placeholder:text-lb-on-surface-3"
                    />
                    <Search size={16} className="absolute left-2.5 top-2.5 text-lb-on-surface-3" strokeWidth={1.5} aria-hidden="true" />
                  </div>
                </div>
              )}
              <div
                ref={listRef}
                className="p-1 max-h-[300px] overflow-y-auto"
              >
              {showCustomValueRow && (
                <button
                  type="button"
                  onClick={handleAddCustomValue}
                  className="w-full flex items-center gap-1.5 px-3 py-2.5 mb-1 text-left font-lb text-[14px] text-lb-brand hover:bg-lb-brand-light rounded-lb-sm border-none cursor-pointer"
                >
                  <span className="font-lb-bold">+</span>
                  <span>
                    Add <span className="font-lb-bold">"{search.trim()}"</span>
                    {customValueLabel ? ` as ${customValueLabel}` : ""}
                  </span>
                </button>
              )}
              {loading && options.length === 0 ? (
                <p className="text-center text-[12px] text-lb-on-surface-3 py-3 font-lb">{locale.loading.label}</p>
              ) : !loading && filtered.length === 0 && !showCustomValueRow ? (
                <p className="text-center text-[12px] text-lb-on-surface-3 py-3 font-lb">{locale.dropdown.noResults}</p>
              ) : null}
              {!(loading && options.length === 0) && filtered.map((opt) => (
                <button
                  key={opt.value}
                  data-testid={`${toTestId(testId, "dropdown")}_option_${opt.value}`}
                  disabled={opt.disabled}
                  onClick={() => !opt.disabled && handleSelect(opt.value)}
                  className={cn(
                    "w-full flex items-center justify-between gap-2 rounded-lb-sm font-lb text-left",
                    itemSize,
                    "border-none cursor-pointer transition-colors duration-[120ms]",
                    isSelected(opt.value)
                      ? "bg-lb-brand-dark text-lb-brand font-lb-bold"
                      : "bg-transparent text-lb-on-surface font-lb-regular hover:bg-lb-surface-grey",
                    opt.disabled && "text-lb-on-surface-3 cursor-not-allowed"
                  )}
                  type="button"
                >
                  {multi && (
                    <span
                      className={cn(
                        "w-6 h-6 rounded-lb-xs border flex items-center justify-center flex-shrink-0 transition-colors",
                        isSelected(opt.value) ? "bg-lb-brand border-lb-brand" : "bg-lb-surface border-lb-line-2"
                      )}
                    >
                      {isSelected(opt.value) && <Check size={12} strokeWidth={2} className="text-white" aria-hidden="true" />}
                    </span>
                  )}
                  <span className="flex-1">{opt.label}</span>
                  {!multi && isSelected(opt.value) && (
                    <Check size={14} strokeWidth={2} aria-hidden="true" />
                  )}
                </button>
              ))}
              <div ref={sentinelRef} className="h-px" />
              {loading && options.length > 0 && (
                <p className="text-center text-[12px] text-lb-on-surface-3 py-2 font-lb">{locale.loading.label}</p>
              )}
              {addNewOptionEnabled && (
                <div className="mt-1 pt-1 border-t border-lb-line-1">
                  <button
                    type="button"
                    onClick={handleOpenAddNewPopup}
                    className="w-full px-3 py-2.5 text-left font-lb text-[14px] text-lb-brand hover:bg-lb-brand-light rounded-lb-sm border-none cursor-pointer"
                  >
                    + {resolvedAddNewLabel}
                  </button>
                </div>
              )}
              </div>
            </div>
          )}
        </div>
        {errorText && <span className="font-lb text-[12px] text-lb-red">{errorText}</span>}
      </div>
  )

  return (
    <>
      {fieldDesktop ? (
        <FieldDesktopRow label={label ?? ""} required={required} helperText={helperText} tooltip={tooltip}>
          {dropdownDiv}
        </FieldDesktopRow>
      ) : dropdownDiv}

      <Popup
        open={openAddNewPopup}
        onClose={() => setOpenAddNewPopup(false)}
        title={resolvedAddNewTitle}
        align="left"
        platform="desktop"
        primaryAction={{
          label: resolvedAddNewSubmitLabel,
          onClick: handleSubmitAddNew,
          disabled: !newOptionValue.trim(),
        }}
        secondaryAction={{
          label: locale.dropdown.addNewCancelLabel,
          onClick: () => setOpenAddNewPopup(false),
        }}
      >
        <input
          value={newOptionValue}
          onChange={(e) => setNewOptionValue(e.target.value)}
          placeholder={resolvedAddNewPlaceholder}
          className={cn(
            "w-full h-10 rounded-lb-input border border-lb-line-1 px-3",
            "font-lb text-[14px] leading-[20px] text-lb-on-surface",
            "outline-none focus:border-lb-brand"
          )}
          type="text"
        />
      </Popup>
    </>
  )
}

export default Dropdown

