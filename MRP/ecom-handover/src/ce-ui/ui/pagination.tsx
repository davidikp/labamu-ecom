"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn, toTestId } from "../lib/utils"

export interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  /** Hide controls when all rows fit on one page. Defaults to false. */
  hideSinglePage?: boolean
  className?: string
  testId?: string
}

export const Pagination: React.FC<PaginationProps> = ({
  page,
  totalPages,
  onPageChange,
  hideSinglePage = false,
  className,
  testId,
}) => {
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

  if (hideSinglePage && totalPages <= 1) return null

  return (
    <div
      className={cn("flex items-center gap-1", className)}
      data-testid={toTestId(testId, "pagination")}
    >
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className={cn(
          "w-[30px] h-[30px] rounded-lb-sm flex items-center justify-center",
          "font-lb text-[14px] border transition-colors duration-[120ms] cursor-pointer",
          page <= 1
            ? "bg-lb-surface-grey text-lb-on-surface-3 border-transparent cursor-not-allowed"
            : "bg-lb-surface border-lb-brand text-lb-on-surface hover:bg-lb-surface-grey"
        )}
        aria-label="Previous page"
      >
        <ChevronLeft size={16} aria-hidden="true" />
      </button>

      {pageNums.map((n, i) =>
        n === "..." ? (
          <span
            key={`ellipsis-${i}`}
            className="min-w-[30px] h-[30px] px-1 flex items-center justify-center font-lb text-[14px] text-lb-on-surface-2"
          >
            …
          </span>
        ) : (
          <button
            key={n}
            type="button"
            onClick={() => onPageChange(n as number)}
            aria-current={n === page ? "page" : undefined}
            className={cn(
              "min-w-[30px] h-[30px] px-1 rounded-lb-sm flex items-center justify-center",
              "font-lb text-[14px] border-none transition-colors duration-[120ms] cursor-pointer",
              n === page
                ? "bg-lb-brand text-lb-brand-on"
                : "bg-transparent text-lb-on-surface hover:bg-lb-surface-grey"
            )}
          >
            {n}
          </button>
        )
      )}

      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className={cn(
          "w-[30px] h-[30px] rounded-lb-sm flex items-center justify-center",
          "font-lb text-[14px] border transition-colors duration-[120ms] cursor-pointer",
          page >= totalPages
            ? "bg-lb-surface-grey text-lb-on-surface-3 border-transparent cursor-not-allowed"
            : "bg-lb-surface border-lb-brand text-lb-on-surface hover:bg-lb-surface-grey"
        )}
        aria-label="Next page"
      >
        <ChevronRight size={16} aria-hidden="true" />
      </button>
    </div>
  )
}

export default Pagination
