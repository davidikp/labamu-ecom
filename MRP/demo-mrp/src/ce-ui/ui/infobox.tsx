"use client"

import * as React from "react"
import { Info } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn, toTestId } from "../lib/utils"

const infoboxVariants = cva(
  "flex items-start gap-3 p-3 rounded-lb-card font-lb text-[12px] leading-[18px] tracking-[0.0825px]",
  {
    variants: {
      variant: {
        info: "",
        success: "",
        warning: "",
        error: "",
      },
      appearance: {
        filled: "",
        bordered: "border",
      },
    },
    compoundVariants: [
      { variant: "info",    appearance: "filled",   class: "bg-lb-brand-light text-lb-brand-hover" },
      { variant: "success", appearance: "filled",   class: "bg-lb-green-bg text-lb-green-text" },
      { variant: "warning", appearance: "filled",   class: "bg-lb-orange-bg text-lb-orange-text" },
      { variant: "error",   appearance: "filled",   class: "bg-lb-red-bg text-lb-red-text" },
      { variant: "info",    appearance: "bordered", class: "bg-lb-brand-light border-lb-brand text-lb-brand-hover" },
      { variant: "success", appearance: "bordered", class: "bg-lb-green-bg border-lb-green-text text-lb-green-text" },
      { variant: "warning", appearance: "bordered", class: "bg-lb-orange-bg border-lb-orange-text text-lb-orange-text" },
      { variant: "error",   appearance: "bordered", class: "bg-lb-red-bg border-lb-red-text text-lb-red-text" },
    ],
    defaultVariants: { variant: "info", appearance: "filled" },
  }
)

type InfoboxProps = VariantProps<typeof infoboxVariants> & {
  /** Short single-line message. Use `title` + `description` for richer content. */
  message?: string
  title?: string
  description?: string
  icon?: React.ReactNode
  className?: string
  testId?: string
}

export function Infobox({
  message,
  title,
  description,
  icon = <Info size={16} className="flex-shrink-0 mt-px" aria-hidden="true" />,
  variant,
  appearance,
  className,
  testId,
}: InfoboxProps) {
  return (
    <div className={cn(infoboxVariants({ variant, appearance }), className)} data-testid={toTestId(testId, "infobox")}>
      {icon}
      {title || description ? (
        <div className="flex flex-col gap-0.5">
          {title && <span className="font-lb-bold text-[13px] leading-[18px]">{title}</span>}
          {description && <span>{description}</span>}
        </div>
      ) : (
        <span>{message}</span>
      )}
    </div>
  )
}

export default Infobox
