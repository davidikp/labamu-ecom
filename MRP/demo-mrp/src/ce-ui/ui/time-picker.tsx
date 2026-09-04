"use client"

import * as React from "react"
import { cn, toTestId } from "../lib/utils"
import { useLocale } from "../locale"

// ── Helpers ───────────────────────────────────────────────────────────────────

function pad2(n: number): string {
  return String(n).padStart(2, "0")
}

// ── TimeColumn ────────────────────────────────────────────────────────────────

const ITEM_H = 40
const COL_H = ITEM_H * 6 // 240px – ~6 items visible

interface TimeColumnProps {
  values: readonly string[]
  selectedIndex: number
  onSelect: (i: number) => void
  ariaLabel: string
}

const TimeColumn: React.FC<TimeColumnProps> = ({ values, selectedIndex, onSelect, ariaLabel }) => {
  const ref = React.useRef<HTMLDivElement>(null)
  const mounted = React.useRef(false)

  React.useLayoutEffect(() => {
    const el = ref.current as HTMLDivElement
    const top = selectedIndex * ITEM_H
    if (!mounted.current) {
      el.scrollTop = top
      mounted.current = true
    } else {
      el.scrollTo({ top, behavior: "smooth" })
    }
  }, [selectedIndex])

  return (
    <div
      ref={ref}
      role="listbox"
      aria-label={ariaLabel}
      className="overflow-y-auto flex-1 min-w-[64px] [&::-webkit-scrollbar]:hidden"
      style={{ height: COL_H, scrollbarWidth: "none" }}
    >
      {values.map((v, i) => (
        <button
          key={i}
          type="button"
          role="option"
          aria-selected={i === selectedIndex}
          onClick={() => onSelect(i)}
          style={{ height: ITEM_H }}
          className="w-full flex items-center justify-center px-2"
        >
          <span
            className={cn(
              "w-full h-9 flex items-center justify-center rounded-lb-sm font-lb text-[16px] leading-none transition-colors duration-100",
              i === selectedIndex
                ? "bg-lb-brand font-lb-bold text-white"
                : "text-lb-on-surface-2 hover:text-lb-on-surface"
            )}
          >
            {v}
          </span>
        </button>
      ))}
    </div>
  )
}

// ── Public types ──────────────────────────────────────────────────────────────

export interface TimeValue {
  hours: number    // 0–23
  minutes: number  // 0–59
}

export interface TimePickerCoreProps {
  value?: TimeValue | null
  onChange?: (time: TimeValue) => void
  onNow?: () => void
  /** Hour format. Default: "24h" */
  format?: "12h" | "24h"
  /** Minute increment step. Default: 1 */
  minuteStep?: number
}

export interface TimePickerProps extends TimePickerCoreProps {
  className?: string
  testId?: string
}

// ── TimePickerCore ────────────────────────────────────────────────────────────

export const TimePickerCore: React.FC<TimePickerCoreProps> = ({
  value,
  onChange,
  onNow,
  format = "24h",
  minuteStep = 1,
}) => {
  const locale = useLocale()

  const h24 = value?.hours ?? 0
  const min = value?.minutes ?? 0
  const isPM = h24 >= 12
  // 12h display: 0→12, 1–11→1–11, 12→12, 13–23→1–11
  const h12display = h24 === 0 ? 12 : h24 > 12 ? h24 - 12 : h24

  const hours24Vals = Array.from({ length: 24 }, (_, i) => pad2(i))
  // ["12","01","02",...,"11"]
  const hours12Vals = Array.from({ length: 12 }, (_, i) => pad2(i === 0 ? 12 : i))
  const minuteCount = Math.floor(60 / minuteStep)
  const minuteVals = Array.from({ length: minuteCount }, (_, i) => pad2(i * minuteStep))
  const periodVals = [locale.timePicker.amLabel, locale.timePicker.pmLabel] as const

  // Snap incoming minutes to the nearest step index
  const minuteIndex = Math.round(min / minuteStep) % minuteCount
  // Index in hours12Vals: 12→0, 1→1, ..., 11→11
  const h12Index = h12display === 12 ? 0 : h12display

  const emit = (newH24: number, newMinIndex: number) =>
    onChange?.({ hours: newH24, minutes: newMinIndex * minuteStep })

  const handleHour24 = (i: number) => emit(i, minuteIndex)

  const handleHour12 = (i: number) => {
    const hVal = i === 0 ? 12 : i
    const newH24 = isPM
      ? hVal === 12 ? 12 : hVal + 12
      : hVal === 12 ? 0 : hVal
    emit(newH24, minuteIndex)
  }

  const handleMinute = (i: number) => emit(h24, i)

  const handlePeriod = (i: number) => {
    const wantPM = i === 1
    if (wantPM && h24 < 12) emit(h24 + 12, minuteIndex)
    else if (!wantPM && h24 >= 12) emit(h24 - 12, minuteIndex)
  }

  const handleNow = () => {
    const now = new Date()
    const snapped = Math.round(now.getMinutes() / minuteStep) * minuteStep
    onChange?.({ hours: now.getHours(), minutes: snapped >= 60 ? 0 : snapped })
    onNow?.()
  }

  return (
    <div className="flex flex-col">
      {/* Columns */}
      <div className="flex">
        {format === "24h" ? (
          <TimeColumn
            values={hours24Vals}
            selectedIndex={h24}
            onSelect={handleHour24}
            ariaLabel={locale.timePicker.hoursLabel}
          />
        ) : (
          <TimeColumn
            values={hours12Vals}
            selectedIndex={h12Index}
            onSelect={handleHour12}
            ariaLabel={locale.timePicker.hoursLabel}
          />
        )}

        <div className="w-px bg-lb-line-1 self-stretch" />

        <TimeColumn
          values={minuteVals}
          selectedIndex={minuteIndex}
          onSelect={handleMinute}
          ariaLabel={locale.timePicker.minutesLabel}
        />

        {format === "12h" && (
          <>
            <div className="w-px bg-lb-line-1 self-stretch" />
            <TimeColumn
              values={periodVals}
              selectedIndex={isPM ? 1 : 0}
              onSelect={handlePeriod}
              ariaLabel="AM/PM"
            />
          </>
        )}
      </div>

      {/* Now button */}
      <div className="border-t border-lb-line-1">
        <button
          type="button"
          onClick={handleNow}
          className="w-full h-11 font-lb text-[14px] text-lb-on-surface-2 hover:text-lb-on-surface hover:bg-lb-surface-grey transition-colors"
        >
          {locale.timePicker.nowLabel}
        </button>
      </div>
    </div>
  )
}

// ── TimePicker (card) ─────────────────────────────────────────────────────────

export const TimePicker: React.FC<TimePickerProps> = ({
  value,
  onChange,
  format = "24h",
  minuteStep = 1,
  className,
  testId,
}) => (
  <div
    className={cn(
      "inline-flex bg-lb-surface rounded-lb-card shadow-lb border border-lb-line-1 overflow-hidden",
      className
    )}
    data-testid={toTestId(testId, "time_picker")}
  >
    <TimePickerCore value={value} onChange={onChange} format={format} minuteStep={minuteStep} />
  </div>
)

export default TimePicker