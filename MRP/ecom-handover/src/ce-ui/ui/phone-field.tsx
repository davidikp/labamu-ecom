"use client"

import * as React from "react"
import { cva } from "class-variance-authority"
import { ChevronDown, Search, X } from "lucide-react"
import { cn, toTestId } from "../lib/utils"
import { useLocale } from "../locale"
import { COUNTRY_CODES, type CountryCode } from "./country-codes"

// ── Variants ──────────────────────────────────────────────────────────────────

const phoneFieldVariants = cva(
  [
    "flex items-center w-full font-lb rounded-lb-input border",
    "transition-all duration-200",
  ],
  {
    variants: {
      size: {
        lg: "h-12",
        md: "h-10",
      },
      state: {
        default: [
          "bg-lb-surface border-lb-line-1",
          "hover:border-lb-line-2",
          "focus-within:border-lb-brand focus-within:shadow-[0_0_0_3px_theme(colors.lb-brand-light)]",
        ],
        error: [
          "bg-lb-surface border-lb-red",
          "hover:border-lb-red",
          "focus-within:border-lb-red focus-within:shadow-[0_0_0_3px_theme(colors.lb-red-bg)]",
        ],
        success: [
          "bg-lb-surface border-lb-green",
          "hover:border-lb-green",
          "focus-within:border-lb-green",
        ],
        disabled: ["bg-lb-surface-grey border-lb-line-1 pointer-events-none"],
        readonly: ["bg-lb-surface-grey border-lb-line-1"],
      },
    },
    defaultVariants: { size: "lg", state: "default" },
  }
)

// ── Props ─────────────────────────────────────────────────────────────────────

export interface PhoneFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "type"> {
  /**
   * Controlled ISO 3166-1 alpha-2 country code (e.g. "ID").
   * Takes precedence over `dialCode` when both are supplied.
   */
  countryCode?: string
  /** Default country code for uncontrolled mode. Defaults to "ID". */
  defaultCountryCode?: string
  /**
   * Controlled dial code (e.g. "+62"). Alternative to `countryCode`.
   * Resolves to the first country whose dialCode matches.
   */
  dialCode?: string
  /** Default dial code for uncontrolled mode (e.g. "+62"). */
  defaultDialCode?: string
  /** Called whenever the user selects a different country. */
  onCountryChange?: (country: CountryCode) => void
  label?: string
  required?: boolean
  helperText?: string
  errorText?: string
  successText?: string
  size?: "lg" | "md"
  state?: "default" | "error" | "success" | "disabled" | "readonly"
  /** Override the country search input placeholder. */
  searchPlaceholder?: string
  /** z-index applied to the country dropdown. Defaults to 50. */
  dropdownZIndex?: number
  testId?: string
}

export type { CountryCode }

// ── Component ─────────────────────────────────────────────────────────────────

export const PhoneField = React.forwardRef<HTMLInputElement, PhoneFieldProps>(
  (
    {
      countryCode,
      defaultCountryCode,
      dialCode,
      defaultDialCode,
      onCountryChange,
      label,
      required,
      helperText,
      errorText,
      successText,
      size = "lg",
      state,
      searchPlaceholder,
      dropdownZIndex = 50,
      className,
      placeholder,
      disabled,
      readOnly,
      testId,
      onBlur,
      onFocus,
      ...inputProps
    },
    ref
  ) => {
    const locale = useLocale()

    // ── State ─────────────────────────────────────────────────────────────────

    const [open, setOpen] = React.useState(false)
    const [search, setSearch] = React.useState("")

    const resolveDefaultCode = () => {
      if (defaultCountryCode) return defaultCountryCode
      if (defaultDialCode) return COUNTRY_CODES.find(c => c.dialCode === defaultDialCode)?.code ?? "ID"
      return "ID"
    }
    const [internalCountryCode, setInternalCountryCode] = React.useState(resolveDefaultCode)

    const activeCountryCode = React.useMemo(() => {
      if (countryCode !== undefined) return countryCode
      if (dialCode !== undefined) return COUNTRY_CODES.find(c => c.dialCode === dialCode)?.code ?? "ID"
      return internalCountryCode
    }, [countryCode, dialCode, internalCountryCode])

    const selectedCountry = React.useMemo(
      () => COUNTRY_CODES.find(c => c.code === activeCountryCode) ?? COUNTRY_CODES[0],
      [activeCountryCode]
    )

    const inputState = state ?? (errorText ? "error" : "default")
    const isDisabled = disabled || inputState === "disabled"
    const isReadOnly = readOnly || inputState === "readonly"

    // ── Refs ──────────────────────────────────────────────────────────────────

    const containerRef = React.useRef<HTMLDivElement>(null)
    const inputRef = React.useRef<HTMLInputElement | null>(null)
    const searchRef = React.useRef<HTMLInputElement>(null)
    const selectedItemRef = React.useRef<HTMLButtonElement>(null)

    // ── Close on outside click ────────────────────────────────────────────────

    React.useEffect(() => {
      if (!open) return
      const handler = (e: MouseEvent) => {
        if (!containerRef.current?.contains(e.target as Node)) {
          setOpen(false)
          setSearch("")
        }
      }
      document.addEventListener("mousedown", handler)
      return () => document.removeEventListener("mousedown", handler)
    }, [open])

    // ── Close on Escape ───────────────────────────────────────────────────────

    React.useEffect(() => {
      if (!open) return
      const handler = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setOpen(false)
          setSearch("")
          inputRef.current?.focus()
        }
      }
      document.addEventListener("keydown", handler)
      return () => document.removeEventListener("keydown", handler)
    }, [open])

    // ── Focus search & scroll selected item into view on open ─────────────────

    React.useEffect(() => {
      if (!open) return
      const timer = window.setTimeout(() => {
        searchRef.current?.focus()
        selectedItemRef.current?.scrollIntoView({ block: "nearest" })
      }, 0)
      return () => window.clearTimeout(timer)
    }, [open])

    // ── Filtered country list ─────────────────────────────────────────────────

    const filteredCountries = React.useMemo(() => {
      const q = search.toLowerCase().replace(/^\+/, "")
      if (!q) return COUNTRY_CODES
      return COUNTRY_CODES.filter(
        c =>
          c.name.toLowerCase().includes(q) ||
          c.dialCode.replace("+", "").startsWith(q) ||
          c.code.toLowerCase().includes(q)
      )
    }, [search])

    // ── Handlers ──────────────────────────────────────────────────────────────

    const handleToggleOpen = () => {
      if (isDisabled || isReadOnly) return
      if (open) {
        setOpen(false)
        setSearch("")
      } else {
        setOpen(true)
      }
    }

    const handleCountrySelect = (country: CountryCode) => {
      if (countryCode === undefined && dialCode === undefined) setInternalCountryCode(country.code)
      onCountryChange?.(country)
      setOpen(false)
      setSearch("")
      window.setTimeout(() => inputRef.current?.focus(), 0)
    }

    // ── Render ────────────────────────────────────────────────────────────────

    return (
      <div className="flex flex-col gap-1 w-full">
        {/* Label */}
        {label && (
          <div className="flex items-center gap-0.5">
            {required && (
              <span className="font-lb text-[14px] font-lb-bold text-lb-red">*</span>
            )}
            <span className="font-lb text-[12px] text-lb-on-surface leading-[18px] tracking-[0.0825px]">
              {label}
            </span>
          </div>
        )}

        <div className="relative" ref={containerRef}>
          {/* Field container */}
          <div className={cn(phoneFieldVariants({ size, state: inputState }), className)}>
            {/* Country selector trigger */}
            <button
              type="button"
              role="combobox"
              aria-expanded={open}
              aria-haspopup="listbox"
              aria-label="Select country code"
              disabled={isDisabled}
              onClick={handleToggleOpen}
              data-testid={`${toTestId(testId, "phone_field")}_dropdown`}
              className={cn(
                "flex items-center gap-1.5 h-full border-r border-lb-line-1 shrink-0 select-none",
                "transition-colors",
                size === "md" ? "px-2.5" : "px-3",
                isDisabled
                  ? "cursor-not-allowed"
                  : isReadOnly
                  ? "cursor-default"
                  : "hover:bg-lb-brand-light cursor-pointer",
                open && !isDisabled && !isReadOnly && "bg-lb-brand-light"
              )}
            >
              <span className="text-[18px] leading-none" aria-hidden="true">
                {selectedCountry.flag}
              </span>
              <span
                className={cn(
                  "font-lb tabular-nums",
                  size === "md" ? "text-[13px]" : "text-[15px]",
                  isDisabled ? "text-lb-on-surface-3" : "text-lb-on-surface"
                )}
              >
                {selectedCountry.dialCode}
              </span>
              <ChevronDown
                className={cn(
                  "transition-transform duration-200",
                  size === "md" ? "w-3.5 h-3.5" : "w-4 h-4",
                  open ? "rotate-180" : "rotate-0",
                  isDisabled ? "text-lb-on-surface-3" : "text-lb-on-surface-2"
                )}
              />
            </button>

            {/* Phone number input */}
            <input
              ref={(node) => {
                inputRef.current = node
                if (typeof ref === "function") ref(node)
                else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = node
              }}
              type="number"
              inputMode="numeric"
              placeholder={placeholder ?? locale.phoneField.placeholder}
              disabled={isDisabled}
              readOnly={isReadOnly}
              onBlur={onBlur}
              onFocus={onFocus}
              aria-label={label ?? "Phone number"}
              data-testid={toTestId(testId, "phone_field")}
              className={cn(
                "flex-1 h-full outline-none bg-transparent font-lb",
                "text-lb-on-surface placeholder:text-lb-on-surface-3",
                "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                size === "md" ? "px-2.5 text-[14px] leading-[20px]" : "px-3 text-[16px] leading-[22px]",
                isDisabled ? "cursor-not-allowed text-lb-on-surface-3" : "",
                isReadOnly ? "cursor-default" : ""
              )}
              {...inputProps}
              onKeyDown={(e) => {
                const allowed = ["Backspace", "Delete", "Tab", "Escape", "Enter", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"]
                if (!allowed.includes(e.key) && !e.ctrlKey && !e.metaKey && !/^\d$/.test(e.key)) {
                  e.preventDefault()
                }
                inputProps.onKeyDown?.(e)
              }}
              onPaste={(e) => {
                e.preventDefault()
                const clean = e.clipboardData.getData("text").replace(/\D/g, "")
                if (clean) {
                  const input = e.currentTarget
                  const start = input.selectionStart ?? input.value.length
                  const end = input.selectionEnd ?? input.value.length
                  input.setRangeText(clean, start, end, "end")
                  input.dispatchEvent(new Event("input", { bubbles: true }))
                }
                inputProps.onPaste?.(e)
              }}
            />
          </div>

          {/* Country dropdown */}
          {open && (
            <div
              role="listbox"
              aria-label="Select country"
              style={{ zIndex: dropdownZIndex }}
              className={cn(
                "absolute mt-1 left-0 w-full min-w-[260px]",
                "bg-lb-surface border border-lb-line-1 rounded-lb-sm shadow-lb",
                "overflow-hidden"
              )}
            >
              {/* Search */}
              <div className="p-2 border-b border-lb-line-1">
                <div className="flex items-center gap-2 px-2.5 h-9 rounded-lb-sm bg-lb-surface-grey">
                  <Search className="w-4 h-4 text-lb-on-surface-3 shrink-0" aria-hidden="true" />
                  <input
                    ref={searchRef}
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder={searchPlaceholder ?? locale.phoneField.searchPlaceholder}
                    className="flex-1 outline-none bg-transparent font-lb text-[14px] text-lb-on-surface placeholder:text-lb-on-surface-3"
                    aria-label="Search country"
                  />
                  {search && (
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setSearch("")}
                      className="text-lb-on-surface-3 hover:text-lb-on-surface transition-colors"
                      aria-label="Clear search"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Country list */}
              <div className="max-h-[224px] overflow-y-auto overscroll-contain">
                {filteredCountries.length === 0 ? (
                  <div className="px-4 py-3 font-lb text-[14px] text-lb-on-surface-3">
                    {locale.phoneField.noResults}
                  </div>
                ) : (
                  filteredCountries.map(country => {
                    const isSelected = country.code === selectedCountry.code
                    return (
                      <button
                        key={country.code}
                        ref={isSelected ? selectedItemRef : undefined}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => handleCountrySelect(country)}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-2.5 text-left",
                          "transition-colors font-lb text-[14px]",
                          isSelected
                            ? "bg-lb-brand-light text-lb-brand"
                            : "text-lb-on-surface hover:bg-lb-surface-grey"
                        )}
                      >
                        <span className="text-[18px] leading-none shrink-0" aria-hidden="true">
                          {country.flag}
                        </span>
                        <span className="flex-1 truncate">{country.name}</span>
                        <span
                          className={cn(
                            "tabular-nums shrink-0 text-[13px]",
                            isSelected ? "text-lb-brand" : "text-lb-on-surface-3"
                          )}
                        >
                          {country.dialCode}
                        </span>
                      </button>
                    )
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Helper / Error / Success text */}
        {(helperText || errorText || successText) && (
          <span
            className={cn(
              "font-lb text-[12px] leading-[18px] tracking-[0.0825px]",
              errorText ? "text-lb-red" : successText ? "text-lb-green-text" : "text-lb-on-surface-3"
            )}
          >
            {errorText || successText || helperText}
          </span>
        )}
      </div>
    )
  }
)

PhoneField.displayName = "PhoneField"

export default PhoneField
