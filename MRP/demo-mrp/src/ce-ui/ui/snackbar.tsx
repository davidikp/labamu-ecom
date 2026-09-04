"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn, toTestId } from "../lib/utils"

const snackbarVariants = cva(
  [
    // Mobile: bottom-center
    "fixed bottom-6 left-1/2 -translate-x-1/2 z-[500]",
    // Desktop: top-right, cancel mobile transforms
    "sm:bottom-auto sm:top-10 sm:right-6 sm:left-auto sm:translate-x-0",
    "flex items-center gap-3 px-4 py-3",
    "rounded-lb-sm",
    "shadow-lb",
    "font-lb text-[14px] leading-[20px]",
    "min-w-[280px] max-w-[400px]",
  ],
  {
    variants: {
      variant: {
        default: "bg-lb-on-surface text-lb-on-surface-rev",
        success: "bg-lb-green text-white",
        error: "bg-lb-red text-lb-on-surface-rev",
        warning: "bg-lb-orange-bg text-lb-orange-text",
      },
    },
    defaultVariants: { variant: "default" },
  }
)

export interface SnackbarProps extends VariantProps<typeof snackbarVariants> {
  message: string
  action?: { label: string; onClick: () => void }
  onClose?: () => void
  duration?: number
  className?: string
  testId?: string
}

export const Snackbar: React.FC<SnackbarProps> = ({
  message,
  variant,
  action,
  onClose,
  duration = 4000,
  className,
  testId,
}) => {
  const [phase, setPhase] = React.useState<"in" | "idle" | "out">("in")

  React.useEffect(() => {
    const timer = setTimeout(() => setPhase("out"), duration)
    return () => clearTimeout(timer)
  }, [duration])

  const handleAnimationEnd = () => {
    if (phase === "in") setPhase("idle")
    else if (phase === "out") onClose?.()
  }

  const handleClose = () => setPhase("out")

  return (
    <div
      className={cn(
        snackbarVariants({ variant }),
        phase === "in"  && "animate-lb-snack-in  sm:animate-lb-snack-in-tr",
        phase === "out" && "animate-lb-snack-out sm:animate-lb-snack-out-tr",
        className
      )}
      onAnimationEnd={handleAnimationEnd}
      data-testid={toTestId(testId, "snackbar")}
    >
      <span className="flex-1">{message}</span>
      {onClose && (
        <button
          onClick={handleClose}
          className="transition-opacity bg-transparent border-none cursor-pointer"
          type="button"
        >
          Oke
        </button>
      )}
    </div>
  )
}

export default Snackbar

