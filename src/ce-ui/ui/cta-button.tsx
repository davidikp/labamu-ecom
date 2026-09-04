"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn, toTestId } from "../lib/utils"

const ctaButtonVariants = cva(
  [
    "inline-flex items-center gap-0.5 bg-transparent border-none cursor-pointer p-2",
    "font-lb transition-colors duration-150",
    "hover:enabled:bg-lb-brand-light",
    "disabled:text-lb-on-surface-3 disabled:cursor-not-allowed",
  ],
  {
    variants: {
      variant: {
        primary: ["text-lb-on-surface-blue hover:text-lb-brand-hover"],
        danger: ["text-lb-red"],
      },
      size: {
        lg: "text-[14px] rounded-lb-btn font-lb-bold leading-[20px] tracking-[0.0962px]",
        md: "text-[14px] rounded-lb-btn font-lb-regular leading-[20px] tracking-[0.0962px]",
        sm: "text-[12px] rounded-lb-sm font-lb-bold leading-[20px] tracking-[0.0962px]"
      }
    },
    defaultVariants: {variant: "primary", size: "lg"}
  }
)

export interface CTAButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof ctaButtonVariants> {
  label: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  testId?: string
}

export const CTAButton = React.forwardRef<HTMLButtonElement, CTAButtonProps>(
  ({ label, variant, size, leftIcon, rightIcon, className, testId, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(ctaButtonVariants({ variant, size }), className)}
      {...props}
      data-testid={toTestId(testId, "cta_button")}
    >
      {leftIcon}
      <span>{label}</span>
      {rightIcon}
    </button>
  )
)
CTAButton.displayName = "CTAButton"

export default CTAButton

