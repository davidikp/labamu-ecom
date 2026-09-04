"use client"

import * as React from "react"
import { Search, XCircle, Plus } from "lucide-react"
import { cn, toTestId } from "../lib/utils"

export type SearchBarProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> & {
  testId?: string
  size?: "lg" | "sm"
  onAdd?: () => void
  onClear?: () => void
}

export const SearchBar = React.forwardRef<HTMLInputElement, SearchBarProps>(
  ({ className, testId, size = "lg", onAdd, onClear, value, onChange, ...props }, ref) => {
    const isLg = size === "lg"
    const hasValue = value !== undefined ? String(value).length > 0 : false

    const handleClear = () => {
      onClear?.()
      onChange?.({ target: { value: "" } } as React.ChangeEvent<HTMLInputElement>)
    }

    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div
          className={cn(
            "group relative flex-1 rounded-[8px] transition-all duration-200",
            "focus-within:ring-2 focus-within:ring-lb-brand/40 focus-within:outline-none"
          )}
        >
          <Search
            className={cn(
              "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-lb-on-surface-3 transition-colors duration-200 group-focus-within:text-lb-brand",
              isLg ? "w-4 h-4" : "w-3.5 h-3.5"
            )}
            aria-hidden="true"
          />
          <input
            ref={ref}
            type="text"
            value={value}
            onChange={onChange}
            data-testid={toTestId(testId, "search_bar")}
            className={cn(
              "w-full rounded-[8px] border border-transparent bg-lb-surface-grey font-lb text-lb-on-surface placeholder:text-lb-on-surface-3 outline-none transition-all duration-200 focus:bg-lb-surface focus:border-lb-brand disabled:cursor-not-allowed disabled:opacity-70",
              isLg
                ? "h-10 pl-10 pr-9 text-[14px]"
                : "h-8 pl-9 pr-8 text-[13px]"
            )}
            {...props}
          />
          {hasValue && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-lb-on-surface-3 hover:text-lb-on-surface transition-colors"
            >
              <XCircle className={isLg ? "w-4 h-4" : "w-3.5 h-3.5"} />
            </button>
          )}
        </div>

        {onAdd && (
          <button
            type="button"
            onClick={onAdd}
            aria-label="Add"
            className={cn(
              "flex-shrink-0 flex items-center justify-center rounded-[8px] transition-colors",
              isLg
                ? "w-10 h-10 bg-lb-brand/10 text-lb-brand hover:bg-lb-brand/20"
                : "w-8 h-8 border border-lb-brand text-lb-brand bg-transparent hover:bg-lb-brand/10"
            )}
          >
            <Plus className={isLg ? "w-4 h-4" : "w-3.5 h-3.5"} />
          </button>
        )}
      </div>
    )
  }
)
SearchBar.displayName = "SearchBar"

export default SearchBar
