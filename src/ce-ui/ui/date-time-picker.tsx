"use client"

import * as React from "react"
import { cn, toTestId } from "../lib/utils"
import { CalendarGrid, sameDay } from "./date-picker"
import { TimePickerCore, TimeValue } from "./time-picker"

// ── Public types ──────────────────────────────────────────────────────────────

export interface DateTimePickerProps {
  value?: Date | null
  onChange?: (date: Date | null) => void
  /** Hour format. Default: "24h" */
  format?: "12h" | "24h"
  /** Minute increment step. Default: 1 */
  minuteStep?: number
  /**
   * Disallows any date before this moment — greys out earlier calendar days
   * entirely, and (24h format only) also disables hours/minutes earlier
   * than `minDate`'s time-of-day when the day currently selected is the
   * same day `minDate` falls on. Pass `new Date()` to block scheduling
   * anything in the past.
   */
  minDate?: Date
  showWeekNumbers?: boolean
  className?: string
  testId?: string
}

// ── DateTimePicker ────────────────────────────────────────────────────────────

export const DateTimePicker: React.FC<DateTimePickerProps> = ({
  value,
  onChange,
  format = "24h",
  minuteStep = 1,
  minDate,
  showWeekNumbers,
  className,
  testId,
}) => {
  const now = new Date()
  const [viewYear, setViewYear] = React.useState(() => (value ?? now).getFullYear())
  const [viewMonth, setViewMonth] = React.useState(() => (value ?? now).getMonth())

  // Preserve time independently so it isn't lost when no date is selected yet
  // — defaults to the current time (not midnight) so that, combined with
  // `minDate`, the initial state isn't already sitting in the disabled
  // "before now" range the moment a caller passes minDate={new Date()}.
  const [localTime, setLocalTime] = React.useState<TimeValue>(() => ({
    hours: value?.getHours() ?? now.getHours(),
    minutes: value?.getMinutes() ?? now.getMinutes(),
  }))

  const timeValue: TimeValue = value
    ? { hours: value.getHours(), minutes: value.getMinutes() }
    : localTime

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
  }

  const handleDayClick = (date: Date) => {
    if (value && sameDay(date, value)) {
      onChange?.(null)
      return
    }
    const d = new Date(date)
    d.setHours(timeValue.hours, timeValue.minutes, 0, 0)
    // Landing on minDate's own day with a carried-over time that's earlier
    // in the day than minDate itself would otherwise produce a selection
    // the time column can't actually represent as selected (its minutes
    // for that hour are disabled) — snap forward to minDate's time instead.
    if (minDate && sameDay(d, minDate) && d.getTime() < minDate.getTime()) {
      d.setHours(minDate.getHours(), minDate.getMinutes(), 0, 0)
    }
    onChange?.(d)
  }

  // Also applies before any day has been explicitly clicked yet (`!value`)
  // — the time columns are already live and interactive at that point (and
  // default to the current time, not midnight), so leaving them unrestricted
  // until a day is picked would let someone dial in an already-past time
  // that only gets blocked retroactively once they click a day.
  const minTime: TimeValue | undefined =
    minDate && (!value || sameDay(value, minDate))
      ? { hours: minDate.getHours(), minutes: minDate.getMinutes() }
      : undefined

  const handleTimeChange = (time: TimeValue) => {
    setLocalTime(time)
    if (value) {
      const d = new Date(value)
      d.setHours(time.hours, time.minutes, 0, 0)
      onChange?.(d)
    }
  }

  return (
    <div
      className={cn(
        "inline-flex bg-lb-surface rounded-lb-card shadow-lb border border-lb-line-1 overflow-hidden",
        className
      )}
      data-testid={toTestId(testId, "date_time_picker")}
    >
      {/* Calendar */}
      <div className="p-5">
        <CalendarGrid
          year={viewYear}
          month={viewMonth}
          isSelected={(d) => !!(value && sameDay(d, value))}
          onDayClick={handleDayClick}
          onPrev={prevMonth}
          onNext={nextMonth}
          onMonthYearChange={(y, m) => { setViewYear(y); setViewMonth(m) }}
          showWeekNumbers={showWeekNumbers}
          minDate={minDate}
        />
      </div>

      {/* Divider */}
      <div className="w-px bg-lb-line-1 self-stretch" />

      {/* Time */}
      <div className="flex items-center">
        <TimePickerCore
          value={timeValue}
          onChange={handleTimeChange}
          minTime={minTime}
          onNow={() => {
            const n = new Date()
            setViewYear(n.getFullYear())
            setViewMonth(n.getMonth())
            const d = new Date(n)
            d.setSeconds(0, 0)
            onChange?.(d)
          }}
          format={format}
          minuteStep={minuteStep}
        />
      </div>
    </div>
  )
}

export default DateTimePicker