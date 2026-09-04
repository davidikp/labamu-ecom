"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn, toTestId } from "../lib/utils"

const iconBtnVariants = cva(
  [
    "inline-flex items-center justify-center",
    "cursor-pointer",
    "transition-all duration-150 active:scale-[0.97] outline-none",
    "disabled:cursor-not-allowed",
    "disabled:bg-lb-surface-grey disabled:text-lb-on-surface-3 disabled:border-transparent",
  ],
  {
    variants: {
      variant: {
        primary: ["bg-lb-brand text-lb-brand-on", "hover:enabled:bg-lb-brand-hover"],
        secondary: [
          "bg-lb-surface text-lb-brand border-lb-brand border",
          "hover:enabled:bg-lb-brand hover:enabled:text-lb-surface",
          "disabled:border-lb-line-1",
        ],
        danger: [
          "bg-lb-surface text-lb-red border-lb-red border",
          "hover:enabled:bg-lb-red hover:enabled:text-lb-surface",
          "disabled:border-lb-line-1",
        ],
        ghost: [
          "bg-transparent text-lb-brand border-none",
          "hover:enabled:bg-lb-brand-light",
        ],
        "danger-ghost": [
          "bg-transparent text-lb-red",
          "hover:enabled:bg-lb-brand-light"
        ]
      },
      size: {
        lg: "w-[50px] h-[50px] rounded-lb-btn",
        md: "w-11 h-11 rounded-lb-sm",
        sm: "w-8 h-8 rounded-lb-sm",
      },
    },
    defaultVariants: { variant: "primary", size: "lg" },
  }
)

export interface IconBtnProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof iconBtnVariants> {
  icon: React.ReactNode
  testId?: string
}

export const IconBtn = React.forwardRef<HTMLButtonElement, IconBtnProps>(
  ({ icon, variant, size, className, testId, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(iconBtnVariants({ variant, size }), className)}
      {...props}
      data-testid={toTestId(testId, "icon_btn")}
    >
      {icon}
    </button>
  )
)
IconBtn.displayName = "IconBtn"

export default IconBtn

