"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn, toTestId } from "../lib/utils"
import { MainBtn, type MainBtnProps } from "./main-btn"
import { CTAButton, type CTAButtonProps } from "./cta-button"
import { Separator } from "./separator"

export interface CardMainBtn {
  label: string
  onClick?: () => void
  variant?: "primary" | "secondary"
  size?: MainBtnProps["size"]
  disabled?: boolean
  loading?: boolean
}

export interface CardCtaButton {
  label: string
  onClick?: () => void
  variant?: CTAButtonProps["variant"]
  size?: CTAButtonProps["size"]
  disabled?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export interface CardProps extends Omit<React.ComponentProps<"div">, "title"> {
  title?: React.ReactNode
  description?: React.ReactNode
  isCollapsible?: boolean
  /** Structured primary/secondary action button rendered on the right. */
  mainBtn?: CardMainBtn
  /** Structured CTA link-style button rendered to the left of mainBtn. */
  ctaButton?: CardCtaButton
  /** Escape hatch for arbitrary action nodes. */
  actions?: React.ReactNode
  /** Show the left blue accent bar. Defaults to true. */
  showAccent?: boolean
  testId?: string
}

export const Card: React.FC<CardProps> = ({
  className,
  title,
  description,
  mainBtn,
  ctaButton,
  actions,
  children,
  isCollapsible = false,
  showAccent = true,
  testId,
  ...props
}) => {
  const [isExpanded, setIsExpanded] = React.useState(true)
  const baseId = React.useId()
  const headingId = `${baseId}-heading`
  const panelId = `${baseId}-panel`

  const hasActions = mainBtn || ctaButton || actions || isCollapsible

  return (
    <div data-slot="card" className={cn("bg-white rounded-lg font-lato", className)} data-testid={toTestId(testId, "card")} {...props}>
      <div className={cn("flex gap-3", showAccent ? "mb-4" : "mb-0")}>
        {showAccent && (
          <div
            aria-hidden
            className={cn(
              "w-1.5 shrink-0 self-stretch rounded-r bg-lb-brand mt-3.5",
              description ? "h-12" : "h-7"
            )}
          />
        )}
        <div className={cn("flex min-w-0 flex-1 gap-2", hasActions ? "justify-between" : "")}>
          <div className={cn("mt-4 min-w-0", !showAccent && "ml-4")}>
            {title ? (
              <p id={headingId} className="font-bold">
                {title}
              </p>
            ) : null}
            {description ? <p className="text-muted-foreground text-sm">{description}</p> : null}
          </div>
          <div className="flex shrink-0 items-center gap-2 mt-4 justify-end pr-4">
            {actions}
            {ctaButton && (
              <CTAButton
                label={ctaButton.label}
                variant={ctaButton.variant}
                size={ctaButton.size}
                disabled={ctaButton.disabled}
                leftIcon={ctaButton.leftIcon}
                rightIcon={ctaButton.rightIcon}
                onClick={ctaButton.onClick}
              />
            )}
            {mainBtn && (
              <MainBtn
                label={mainBtn.label}
                variant={mainBtn.variant ?? "primary"}
                size={mainBtn.size ?? "sm"}
                disabled={mainBtn.disabled}
                loading={mainBtn.loading}
                onClick={mainBtn.onClick}
              />
            )}
            {isCollapsible ? (
              <button
                type="button"
                onClick={() => setIsExpanded((open) => !open)}
                className="flex items-center justify-center"
                aria-expanded={isExpanded}
                aria-controls={panelId}
                aria-labelledby={title ? headingId : undefined}
                aria-label={title ? undefined : "Toggle section"}
              >
                <ChevronDown
                  className={cn(
                    "h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-300 ease-out",
                    isExpanded && "-rotate-180"
                  )}
                />
              </button>
            ) : null}
          </div>
        </div>
      </div>
      {!showAccent && <Separator className="my-4"/>}
      {isCollapsible ? (
        <div
          id={panelId}
          role="region"
          aria-labelledby={title ? headingId : undefined}
          className={cn(
            "grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none",
            isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          )}
        >
          <div className="min-h-0 overflow-hidden">{children}</div>
        </div>
      ) : (
        children
      )}
    </div>
  )
}

export default Card
