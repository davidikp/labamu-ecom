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
  showWeekNumbers,
  className,
  testId,
}) => {
  const now = new Date()
  const [viewYear, setViewYear] = React.useState(() => (value ?? now).getFullYear())
  const [viewMonth, setViewMonth] = React.useState(() => (value ?? now).getMonth())

  // Preserve time independently so it isn't lost when no date is selected yet
  const [localTime, setLocalTime] = React.useState<TimeValue>(() => ({
    hours: value?.getHours() ?? 0,
    minutes: value?.getMinutes() ?? 0,
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
    onChange?.(d)
  }

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
        />
      </div>

      {/* Divider */}
      <div className="w-px bg-lb-line-1 self-stretch" />

      {/* Time */}
      <div className="flex items-center">
        <TimePickerCore
          value={timeValue}
          onChange={handleTimeChange}
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