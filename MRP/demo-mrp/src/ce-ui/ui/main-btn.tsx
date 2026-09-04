"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { LoaderCircle } from "lucide-react"
import { cn, toTestId } from "../lib/utils"

const mainBtnVariants = cva(
  [
    "inline-flex items-center justify-center",
    "font-lb",
    "cursor-pointer transition-all duration-150",
    "active:scale-[0.97] outline-none whitespace-nowrap select-none",
    "focus-visible:ring-2 focus-visible:ring-lb-brand-light focus-visible:ring-offset-2 focus-visible:ring-offset-lb-surface",
    "disabled:cursor-not-allowed",
    "disabled:active:scale-100",
    "disabled:bg-lb-surface-grey disabled:text-lb-on-surface-3 disabled:border-transparent",
  ],
  {
    variants: {
      variant: {
        primary: ["bg-lb-brand text-lb-brand-on", "hover:enabled:bg-lb-brand-hover"],
        secondary: [
          "bg-lb-surface text-lb-brand",
          "border border-lb-brand",
          "hover:enabled:bg-lb-brand-light",
          "disabled:border-lb-line-1",
        ],
        danger: [
          "bg-lb-surface text-lb-red",
          "border border-lb-red",
          "hover:enabled:bg-[#FAE6E8]",
          "disabled:border-lb-line-1",
        ],
        "danger-fill": [
          "bg-lb-red text-white",
          "hover:enabled:bg-lb-red/90",
        ],
      },
      size: {
        xl: "h-14 px-6 rounded-lb-btn text-[16px] font-lb-bold leading-[22px] tracking-[0.11px] gap-2",
        lg: "h-[50px] px-6 rounded-lb-btn text-[16px] font-lb-regular leading-[22px] tracking-[0.11px] gap-2",
        md: "h-11 px-4 rounded-lb-sm text-[14px] font-lb-regular leading-[22px] tracking-[0.11px] gap-2",
        sm: "h-9 px-3 rounded-lb-sm text-[14px] font-lb-regular leading-[20px] tracking-[0.0962px] gap-1.5",
      },
    },
    defaultVariants: { variant: "primary", size: "lg" },
  }
)


export interface MainBtnProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof mainBtnVariants> {
  label?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  indicator?: number | null
  loading?: boolean
  testId?: string
}

export const MainBtn = React.forwardRef<HTMLButtonElement, MainBtnProps>(
  (
    { label = "Action", variant, size, leftIcon, rightIcon, indicator, loading = false, className, type = "button", testId, disabled, ...props },
    ref
  ) => (
    <button
      ref={ref}
      type={type}
      disabled={loading || disabled}
      className={cn(
        mainBtnVariants({ variant, size }),
        loading && "!bg-[#F4F4F4] !text-[#ADADAD] !border-transparent cursor-not-allowed",
        className
      )}
      {...props}
      data-testid={toTestId(testId, "main_btn")}
    >
      {loading ? <LoaderCircle size={size === "sm" ? 16 : 20} className="animate-spin" aria-hidden="true" /> : leftIcon}
      {size === "sm" && indicator != null ? (
        <span className="flex items-center gap-1">
          <strong className="font-lb-bold">{indicator}</strong>
          <span>{label}</span>
        </span>
      ) : (
        <span>{label}</span>
      )}
      {rightIcon}
    </button>
  )
)
MainBtn.displayName = "MainBtn"

export default MainBtn

