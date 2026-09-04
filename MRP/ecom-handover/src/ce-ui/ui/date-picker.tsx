"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn, toTestId } from "../lib/utils"
import { useLocale } from "../locale"

export function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function isoWeek(d: Date): number {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  const day = ((date.getUTCDay() + 6) % 7) + 1
  date.setUTCDate(date.getUTCDate() + 4 - day)
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
  return Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}

function buildCalendar(year: number, month: number): Date[] {
  const firstWeekday = new Date(year, month, 1).getDay()
  const days: Date[] = []
  for (let i = firstWeekday; i > 0; i--) days.push(new Date(year, month, 1 - i))
  const total = new Date(year, month + 1, 0).getDate()
  for (let d = 1; d <= total; d++) days.push(new Date(year, month, d))
  for (let d = 1; days.length % 7 !== 0; d++) days.push(new Date(year, month + 1, d))
  return days
}

// ── CalendarGrid ──────────────────────────────────────────────────────────────

export interface CalendarGridProps {
  year: number
  month: number
  showWeekNumbers?: boolean
  isSelected: (d: Date) => boolean
  isRangeStart?: (d: Date) => boolean
  isRangeEnd?: (d: Date) => boolean
  isInRange?: (d: Date) => boolean
  activeRange?: boolean
  onDayClick: (d: Date) => void
  onDayHover?: (d: Date) => void
  onMouseLeave?: () => void
  onPrev?: () => void
  onNext?: () => void
  onMonthYearChange?: (year: number, month: number) => void
  hidePrev?: boolean
  hideNext?: boolean
  minDate?: Date
  maxDate?: Date
  testId?: string
}

const NavBtn: React.FC<{ onClick?: () => void; hidden?: boolean; disabled?: boolean; label: string; children: React.ReactNode }> = ({
  onClick, hidden, disabled, label, children,
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    aria-label={label}
    className={cn(
      "w-7 h-7 flex items-center justify-center rounded-full transition-colors",
      hidden && "invisible pointer-events-none",
      disabled
        ? "text-lb-on-surface-3 cursor-not-allowed"
        : "text-lb-on-surface-2 hover:bg-lb-surface-grey"
    )}
  >
    {children}
  </button>
)

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  year, month, showWeekNumbers,
  isSelected, isRangeStart, isRangeEnd, isInRange, activeRange,
  onDayClick, onDayHover, onMouseLeave,
  onPrev, onNext, onMonthYearChange,
  hidePrev, hideNext,
  minDate, maxDate,
  testId,
}) => {
  const locale = useLocale()
  const WEEK_DAYS = locale.datePicker.weekDays
  const MONTH_NAMES = locale.datePicker.monthNames
  const [view, setView] = React.useState<"days" | "months" | "years">("days")
  const [decadeStart, setDecadeStart] = React.useState(() => Math.floor(year / 12) * 12)

  const minDay = minDate ? new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate()) : null
  const maxDay = maxDate ? new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate()) : null

  const isDayDisabled = (d: Date): boolean => {
    const day = new Date(d.getFullYear(), d.getMonth(), d.getDate())
    if (minDay && day < minDay) return true
    if (maxDay && day > maxDay) return true
    return false
  }

  const isMonthDisabled = (y: number, m: number): boolean => {
    if (minDay && new Date(y, m + 1, 0) < minDay) return true
    if (maxDay && new Date(y, m, 1) > maxDay) return true
    return false
  }

  const isYearDisabled = (y: number): boolean => {
    if (minDay && new Date(y, 11, 31) < minDay) return true
    if (maxDay && new Date(y, 0, 1) > maxDay) return true
    return false
  }

  const prevYear = month === 0 ? year - 1 : year
  const prevMonthVal = month === 0 ? 11 : month - 1
  const isPrevDisabled = isMonthDisabled(prevYear, prevMonthVal)

  const nextYearVal = month === 11 ? year + 1 : year
  const nextMonthVal = month === 11 ? 0 : month + 1
  const isNextDisabled = isMonthDisabled(nextYearVal, nextMonthVal)

  // Sync decade range when opening year view
  const openYearView = () => {
    setDecadeStart(Math.floor(year / 12) * 12)
    setView("years")
  }

  // ── Month picker ────────────────────────────────────────────────────────────
  if (view === "months") {
    return (
      <div className="w-[272px]">
        <div className="flex items-center justify-between mb-3 px-1">
          <NavBtn onClick={() => onMonthYearChange?.(year - 1, month)} label="Previous year">
            <ChevronLeft size={15} strokeWidth={2} />
          </NavBtn>
          <button
            type="button"
            onClick={openYearView}
            className="font-lb font-lb-bold text-[13px] leading-[18px] text-lb-on-surface hover:text-lb-brand transition-colors"
          >
            {year}
          </button>
          <NavBtn onClick={() => onMonthYearChange?.(year + 1, month)} label="Next year">
            <ChevronRight size={15} strokeWidth={2} />
          </NavBtn>
        </div>
        <div className="grid grid-cols-3 gap-1">
          {MONTH_NAMES.map((name, i) => {
            const monthDisabled = isMonthDisabled(year, i)
            return (
              <button
                key={name}
                type="button"
                disabled={monthDisabled}
                onClick={() => { if (!monthDisabled) { onMonthYearChange?.(year, i); setView("days") } }}
                className={cn(
                  "h-10 rounded-lb-sm font-lb text-[13px] leading-[18px] transition-colors",
                  monthDisabled
                    ? "text-lb-on-surface-3 cursor-not-allowed opacity-40"
                    : i === month
                      ? "bg-lb-brand text-lb-brand-on"
                      : "text-lb-on-surface hover:bg-lb-surface-grey"
                )}
              >
                {name}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  // ── Year picker ─────────────────────────────────────────────────────────────
  if (view === "years") {
    const years = Array.from({ length: 12 }, (_, i) => decadeStart + i)
    return (
      <div className="w-[272px]">
        <div className="flex items-center justify-between mb-3 px-1">
          <NavBtn onClick={() => setDecadeStart(s => s - 12)} label="Previous years">
            <ChevronLeft size={15} strokeWidth={2} />
          </NavBtn>
          <span className="font-lb font-lb-bold text-[13px] leading-[18px] text-lb-on-surface">
            {decadeStart} – {decadeStart + 11}
          </span>
          <NavBtn onClick={() => setDecadeStart(s => s + 12)} label="Next years">
            <ChevronRight size={15} strokeWidth={2} />
          </NavBtn>
        </div>
        <div className="grid grid-cols-3 gap-1">
          {years.map(y => {
            const yearDisabled = isYearDisabled(y)
            return (
              <button
                key={y}
                type="button"
                disabled={yearDisabled}
                onClick={() => { if (!yearDisabled) { onMonthYearChange?.(y, month); setView("days") } }}
                className={cn(
                  "h-10 rounded-lb-sm font-lb text-[13px] leading-[18px] transition-colors",
                  yearDisabled
                    ? "text-lb-on-surface-3 cursor-not-allowed opacity-40"
                    : y === year
                      ? "bg-lb-brand text-lb-brand-on"
                      : "text-lb-on-surface hover:bg-lb-surface-grey"
                )}
              >
                {y}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  // ── Days view ───────────────────────────────────────────────────────────────
  const today = new Date()
  const days = buildCalendar(year, month)
  const weeks = Array.from({ length: days.length / 7 }, (_, i) => days.slice(i * 7, i * 7 + 7))

  return (
    <div className="w-[272px]" onMouseLeave={onMouseLeave}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <NavBtn onClick={onPrev} hidden={hidePrev} disabled={!hidePrev && isPrevDisabled} label="Previous month">
          <ChevronLeft size={15} strokeWidth={2} />
        </NavBtn>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setView("months")}
            className="font-lb font-lb-bold text-[13px] leading-[18px] text-lb-on-surface tracking-[0.5px] hover:text-lb-brand transition-colors"
          >
            {MONTH_NAMES[month]}
          </button>
          <button
            type="button"
            onClick={openYearView}
            className="font-lb text-[13px] leading-[18px] text-lb-on-surface-2 hover:text-lb-brand transition-colors"
          >
            {year}
          </button>
        </div>
        <NavBtn onClick={onNext} hidden={hideNext} disabled={!hideNext && isNextDisabled} label="Next month">
          <ChevronRight size={15} strokeWidth={2} />
        </NavBtn>
      </div>

      {/* Grid: column headers + day cells */}
      <div className={cn("grid", showWeekNumbers ? "grid-cols-8" : "grid-cols-7")}>
        {showWeekNumbers && (
          <div className="h-8 flex items-center justify-center text-[11px] font-lb font-lb-bold text-lb-on-surface-3">
            Week
          </div>
        )}
        {WEEK_DAYS.map(d => (
          <div key={d} className="h-8 flex items-center justify-center text-[12px] font-lb font-lb-bold text-lb-on-surface-2">
            {d}
          </div>
        ))}

        {weeks.map((week, wi) => (
          <React.Fragment key={wi}>
            {showWeekNumbers && (
              <div className="h-10 flex items-center justify-center text-[11px] font-lb text-lb-on-surface-3">
                {isoWeek(week[4])}
              </div>
            )}
            {week.map((day, di) => {
              const inCurrentMonth = day.getMonth() === month
              const selected = isSelected(day)
              const rStart = isRangeStart?.(day) ?? false
              const rEnd = isRangeEnd?.(day) ?? false
              const inRange = isInRange?.(day) ?? false
              const disabled = isDayDisabled(day)
              const isToday = sameDay(day, today)

              const showBand =
                !disabled && (
                  inRange ||
                  (rStart && !rEnd && activeRange) ||
                  (rEnd && !rStart && activeRange)
                )

              const bandLeft = rStart && !rEnd ? "left-1/2" : "left-0"
              const bandRight = rEnd && !rStart ? "right-1/2" : "right-0"

              return (
                <div
                  key={di}
                  className="relative h-10 flex items-center justify-center"
                  onMouseEnter={() => !disabled && onDayHover?.(day)}
                >
                  {showBand && (
                    <div
                      className={cn(
                        "absolute top-[4px] bottom-[4px] bg-lb-brand-light",
                        bandLeft,
                        bandRight
                      )}
                    />
                  )}
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => onDayClick(day)}
                    data-testid={testId ? `${testId}_day_${day.getFullYear()}_${String(day.getMonth() + 1).padStart(2, "0")}_${String(day.getDate()).padStart(2, "0")}` : undefined}
                    className={cn(
                      "relative z-10 w-9 h-9 flex items-center justify-center",
                      "font-lb text-[13px] leading-[18px] transition-colors duration-100",
                      "rounded-full",
                      rStart && !rEnd ? "rounded-l-full"
                        : rEnd && !rStart ? "rounded-r-full"
                        : "rounded-full",
                      disabled
                        ? "text-lb-on-surface-3 opacity-40 cursor-not-allowed"
                        : selected || rStart || rEnd
                          ? "bg-lb-brand text-white"
                          : isToday
                            ? cn("bg-[#E6F0FF]", inCurrentMonth ? "text-lb-on-surface" : "text-lb-on-surface-3", "hover:bg-lb-brand hover:text-white")
                            : inRange
                              ? cn(inCurrentMonth ? "text-lb-on-surface" : "text-lb-on-surface-3", "hover:bg-lb-brand hover:text-white")
                              : cn(inCurrentMonth ? "text-lb-on-surface" : "text-lb-on-surface-3", "hover:bg-lb-surface-grey")
                    )}
                  >
                    {day.getDate()}
                  </button>
                </div>
              )
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

// ── Public types ──────────────────────────────────────────────────────────────

export interface DatePickerSingleProps {
  variant?: "single"
  value?: Date | null
  onChange?: (date: Date | null) => void
  showWeekNumbers?: boolean
  minDate?: Date
  maxDate?: Date
  className?: string
  testId?: string
}

export interface DatePickerRangeProps {
  variant: "range"
  startDate?: Date | null
  endDate?: Date | null
  onChange?: (start: Date | null, end: Date | null) => void
  showWeekNumbers?: boolean
  minDate?: Date
  maxDate?: Date
  className?: string
  testId?: string
}

export type DatePickerProps = DatePickerSingleProps | DatePickerRangeProps

// ── DatePicker ────────────────────────────────────────────────────────────────

export const DatePicker: React.FC<DatePickerProps> = (props) => {
  const now = new Date()
  const locale = useLocale()
  const [viewYear, setViewYear] = React.useState(now.getFullYear())
  const [viewMonth, setViewMonth] = React.useState(now.getMonth())
  const [selecting, setSelecting] = React.useState<"start" | "end">("start")
  const [hoverDate, setHoverDate] = React.useState<Date | null>(null)

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
  }

  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
  }

  const nextM = viewMonth === 11 ? 0 : viewMonth + 1
  const nextY = viewMonth === 11 ? viewYear + 1 : viewYear

  // ── Range variant ───────────────────────────────────────────────────────────
  if (props.variant === "range") {
    const { startDate = null, endDate = null, onChange, showWeekNumbers, minDate, maxDate, className, testId } = props

    const effectiveEnd =
      selecting === "end" && !endDate && hoverDate ? hoverDate : null

    const normalizeRange = (s: Date, e: Date): [Date, Date] =>
      e < s ? [e, s] : [s, e]

    const isRangeStart = (d: Date): boolean => {
      const end = endDate ?? effectiveEnd
      if (!startDate) return false
      if (!end) return sameDay(d, startDate)
      const [s] = normalizeRange(startDate, end)
      return sameDay(d, s)
    }

    const isRangeEnd = (d: Date): boolean => {
      const end = endDate ?? effectiveEnd
      if (!startDate || !end) return false
      const [, e] = normalizeRange(startDate, end)
      return sameDay(d, e)
    }

    const isInRange = (d: Date): boolean => {
      const end = endDate ?? effectiveEnd
      if (!startDate || !end) return false
      const [s, e] = normalizeRange(startDate, end)
      return d > s && d < e
    }

    const activeRange = !!(startDate && (endDate ?? effectiveEnd))

    const handleDayClick = (date: Date) => {
      if (selecting === "start" || (startDate && endDate)) {
        onChange?.(date, null)
        setSelecting("end")
        setHoverDate(null)
      } else {
        const [s, e] = normalizeRange(startDate!, date)
        onChange?.(s, e)
        setSelecting("start")
        setHoverDate(null)
      }
    }

    const handleHover = (d: Date) => {
      if (selecting === "end") setHoverDate(d)
    }

    const sharedGridProps = {
      isSelected: (d: Date) => isRangeStart(d) || isRangeEnd(d),
      isRangeStart,
      isRangeEnd,
      isInRange,
      activeRange,
      onDayClick: handleDayClick,
      onDayHover: handleHover,
      onMouseLeave: () => setHoverDate(null),
      showWeekNumbers,
      minDate,
      maxDate,
      testId,
    }

    const goToday = () => {
      setViewYear(now.getFullYear())
      setViewMonth(now.getMonth())
    }

    return (
      <div
        className={cn(
          "inline-flex flex-col bg-lb-surface rounded-lb-card shadow-lb border border-lb-line-1 overflow-hidden",
          className
        )}
        data-testid={toTestId(testId, "date_picker")}
      >
        <div className="flex">
          <div className="p-5">
            <CalendarGrid
              {...sharedGridProps}
              year={viewYear}
              month={viewMonth}
              onPrev={prevMonth}
              onMonthYearChange={(y, m) => { setViewYear(y); setViewMonth(m) }}
              hideNext
            />
          </div>
          <div className="w-px bg-lb-line-1 self-stretch" />
          <div className="p-5">
            <CalendarGrid
              {...sharedGridProps}
              year={nextY}
              month={nextM}
              onNext={nextMonth}
              onMonthYearChange={(y, m) => { setViewYear(y); setViewMonth(m) }}
              hidePrev
            />
          </div>
        </div>
        <div className="border-t border-lb-line-1 px-5 py-2.5 flex justify-center">
          <button
            type="button"
            onClick={goToday}
            className="font-lb text-[13px] leading-[18px] text-lb-on-surface-2 hover:text-lb-brand transition-colors"
          >
            {locale.datePicker.todayLabel}
          </button>
        </div>
      </div>
    )
  }

  // ── Single variant ──────────────────────────────────────────────────────────
  const { value = null, onChange, showWeekNumbers, minDate, maxDate, className, testId } = props as DatePickerSingleProps

  const goToday = () => {
    setViewYear(now.getFullYear())
    setViewMonth(now.getMonth())
    onChange?.(now)
  }

  return (
    <div
      className={cn(
        "inline-flex flex-col bg-lb-surface rounded-lb-card shadow-lb border border-lb-line-1",
        className
      )}
      data-testid={toTestId(testId, "date_picker")}
    >
      <div className="p-5">
        <CalendarGrid
          year={viewYear}
          month={viewMonth}
          isSelected={(d) => !!(value && sameDay(d, value))}
          onDayClick={(date) => onChange?.(value && sameDay(date, value) ? null : date)}
          showWeekNumbers={showWeekNumbers}
          onPrev={prevMonth}
          onNext={nextMonth}
          onMonthYearChange={(y, m) => { setViewYear(y); setViewMonth(m) }}
          minDate={minDate}
          maxDate={maxDate}
          testId={testId}
        />
      </div>
      <div className="border-t border-lb-line-1 px-5 py-2.5 flex justify-center">
        <button
          type="button"
          onClick={goToday}
          className="font-lb text-[13px] leading-[18px] text-lb-on-surface-2 hover:text-lb-brand transition-colors"
        >
          {locale.datePicker.todayLabel}
        </button>
      </div>
    </div>
  )
}

export default DatePicker
