"use client"

import * as React from "react"
import { cn, toTestId } from "../lib/utils"
import { useLocale } from "../locale"

export interface LoadingStateProps extends Omit<React.ComponentProps<"div">, "title"> {
  /** Accessible text announced by screen readers. */
  label?: string
  /** Loading title shown under the animation. */
  title?: React.ReactNode
  /** Supporting description shown under the title. */
  description?: React.ReactNode
  testId?: string
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  className,
  label,
  title,
  description,
  testId,
  ...props
}) => {
  const locale = useLocale()
  const resolvedLabel = label ?? locale.loading.label
  const resolvedTitle = title ?? locale.loading.title
  const resolvedDescription = description ?? locale.loading.description
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={resolvedLabel}
      className={cn("inline-flex flex-col items-center justify-center gap-4 text-center", className)}
      data-testid={toTestId(testId, "loading_state")}
      {...props}
    >
      <svg
        width="120"
        height="40"
        viewBox="0 0 120 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle cx="30" cy="30" r="8" fill="#0069FF">
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0 0;0 -4;0 0"
            dur="0.5s"
            begin="0s"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="60" cy="30" r="8" fill="#0069FF">
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0 0;0 -4;0 0"
            dur="0.5s"
            begin="0.2s"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="90" cy="30" r="8" fill="#0069FF">
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0 0;0 -4;0 0"
            dur="0.5s"
            begin="0.4s"
            repeatCount="indefinite"
          />
        </circle>
      </svg>
      <div className="space-y-2">
        <p className="font-lato text-[18px] leading-[26px] font-semibold text-lb-on-surface">{resolvedTitle}</p>
        <p className="font-lato text-[14px] leading-[20px] text-lb-on-surface">{resolvedDescription}</p>
      </div>
      <span className="sr-only">{resolvedLabel}</span>
    </div>
  )
}

export default LoadingState
