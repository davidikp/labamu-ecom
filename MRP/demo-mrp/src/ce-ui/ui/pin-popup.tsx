"use client"

import * as React from "react"
import { Eye, EyeOff, X } from "lucide-react"
import { cn, toTestId } from "../lib/utils"
import { MainBtn } from "./main-btn"
import { IconBtn } from "./icon-btn"
import { CTAButton } from "./cta-button"

export interface PinPopupProps {
  open: boolean
  onClose: () => void
  /** Called with the 6-digit PIN string when all boxes are filled and confirm is clicked */
  onConfirm: (pin: string) => void
  /** Called when the user clicks the "Use OTP Instead" link */
  onUseOtp?: () => void
  title?: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  useOtpLabel?: string
  className?: string
  testId?: string
}

const PIN_LENGTH = 6

export const PinPopup: React.FC<PinPopupProps> = ({
  open,
  onClose,
  onConfirm,
  onUseOtp,
  title = "Confirm Changes",
  description = "Enter your 6-digit PIN to confirm changes.",
  confirmLabel = "Save",
  cancelLabel = "Cancel",
  useOtpLabel = "Use OTP Instead",
  className,
  testId,
}) => {
  const [digits, setDigits] = React.useState<string[]>(Array(PIN_LENGTH).fill(""))
  const [visible, setVisible] = React.useState(false)
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([])

  // Reset and focus first box when opened
  React.useEffect(() => {
    if (open) {
      setDigits(Array(PIN_LENGTH).fill(""))
      setVisible(false)
      setTimeout(() => inputRefs.current[0]?.focus(), 50)
    }
  }, [open])

  // Lock body scroll
  React.useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [open])

  function handleChange(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1)
    const next = [...digits]
    next[index] = digit
    setDigits(next)
    if (digit && index < PIN_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      if (digits[index]) {
        const next = [...digits]
        next[index] = ""
        setDigits(next)
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus()
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === "ArrowRight" && index < PIN_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    } else if (e.key === "Enter") {
      if (digits.every((d) => d !== "")) onConfirm(digits.join(""))
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault()
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, PIN_LENGTH)
    if (!pasted) return
    const next = Array(PIN_LENGTH).fill("")
    pasted.split("").forEach((ch, i) => { next[i] = ch })
    setDigits(next)
    const focusIdx = Math.min(pasted.length, PIN_LENGTH - 1)
    inputRefs.current[focusIdx]?.focus()
  }

  const handleConfirm = () => {
    if (digits.every((d) => d !== "")) onConfirm(digits.join(""))
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center"
      data-testid={toTestId(testId, "pin_popup")}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Panel */}
      <div
        className={cn(
          "relative bg-lb-surface rounded-lb-card shadow-lb",
          "w-[440px] max-w-[calc(100vw-32px)]",
          "flex flex-col items-center px-8 py-8 gap-6",
          className
        )}
      >
        {/* Close button */}
        <IconBtn
          icon={<X size={16} />}
          variant="secondary"
          size="sm"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 !border-0 !bg-transparent text-lb-on-surface-2 hover:!bg-lb-surface-grey"
        />

        {/* Header */}
        <div className="text-center flex flex-col gap-2">
          <h2 className="font-lb text-[20px] font-lb-bold text-lb-on-surface leading-[30px] m-0">
            {title}
          </h2>
          <p className="font-lb text-[14px] text-lb-on-surface-2 leading-[20px] m-0">
            {description}
          </p>
        </div>

        {/* PIN digit inputs + visibility toggle */}
        <div className="flex flex-col items-center gap-3 w-full">
          <div className="flex items-center gap-2" onPaste={handlePaste}>
            {digits.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el }}
                type={visible ? "text" : "password"}
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onFocus={(e) => e.target.select()}
                className={cn(
                  "w-[52px] h-[56px] rounded-lb-input border text-center",
                  "font-lb text-[20px] font-lb-bold text-lb-on-surface",
                  "outline-none transition-all duration-200",
                  "bg-lb-surface",
                  digit ? "border-lb-line-2" : "border-lb-line-1"
                )}
                data-testid={`${toTestId(testId, "pin_popup")}_input_${i}`}
              />
            ))}
          </div>

          {/* Show / hide toggle */}
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="flex items-center gap-1.5 font-lb text-[13px] text-lb-on-surface-2 hover:text-lb-on-surface border-none bg-transparent cursor-pointer p-0 transition-colors"
          >
            {visible ? <EyeOff size={15} aria-hidden="true" /> : <Eye size={15} aria-hidden="true" />}
            {visible ? "Hide PIN" : "Show PIN"}
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 w-full">
          <MainBtn
            variant="secondary"
            label={cancelLabel}
            onClick={onClose}
            className="flex-1"
          />
          <MainBtn
            variant="primary"
            label={confirmLabel}
            onClick={handleConfirm}
            disabled={digits.some((d) => !d)}
            className="flex-1"
            testId={`${toTestId(testId, "pin_popup")}_confirm`}
          />
        </div>

        {/* Use OTP link */}
        {onUseOtp && (
          <div className="flex flex-col items-center gap-2 w-full -mt-2">
            <div className="flex items-center gap-2 w-full align-center">
              <div className="flex-1 h-px bg-lb-line-1" />
              <span className="font-lb text-[12px] text-lb-on-surface-3 leading-[18px]">or</span>
              <div className="flex-1 h-px bg-lb-line-1" />
            </div>
            <CTAButton label={useOtpLabel} onClick={onUseOtp} />
          </div>
        )}
      </div>

      <style>{`
        [data-testid="pin_popup"] input:focus {
          border-color: var(--lb-brand);
          box-shadow: 0 0 0 3px var(--lb-brand-light);
        }
      `}</style>
    </div>
  )
}

export default PinPopup
