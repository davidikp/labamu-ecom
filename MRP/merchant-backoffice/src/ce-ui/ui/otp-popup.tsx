"use client"

import * as React from "react"
import { cn, toTestId } from "../lib/utils"
import { useLocale } from "../locale"
import { MainBtn } from "./main-btn"
import { CTAButton } from "./cta-button"

export interface OtpPopupProps {
  open: boolean
  onClose: () => void
  /** Phone number or email address shown in the subtitle. */
  recipient: string
  /** Number of OTP digits. Defaults to 6. */
  length?: number
  /** Called with the full OTP string once all digits are filled. */
  onComplete: (otp: string) => void
  /** Called when the user clicks "Kirim Ulang". */
  onResend: () => void
  /** Cooldown in seconds before resend is allowed. Defaults to 60. */
  resendCooldown?: number
  title?: string
  /** Subtitle/description shown below the title. */
  description?: string
  /** Text shown before the resend button/countdown. */
  noOtpText?: string
  /** Resend button label. */
  resendText?: string
  /** Text shown during cooldown. Receives formatted time string (e.g. "0:45"). */
  resendInLabel?: (timeLabel: string) => React.ReactNode
  /** Aria-label for the close button. */
  closeAriaLabel?: string
  /** Called when the user clicks the alternative action link at the bottom. */
  onUsePin?: () => void
  /** Label for the alternative action link. */
  usePinLabel?: string
  className?: string
  testId?: string
}

export const OtpPopup: React.FC<OtpPopupProps> = ({
  open,
  onClose,
  recipient,
  length = 6,
  onComplete,
  onResend,
  resendCooldown = 60,
  title,
  description,
  noOtpText,
  resendText,
  resendInLabel,
  closeAriaLabel,
  onUsePin,
  usePinLabel = "Use PIN Instead",
  className,
  testId,
}) => {
  const locale = useLocale()
  const resolvedTitle = title ?? locale.otpPopup.title
  const resolvedDescription = description ?? locale.otpPopup.subtitle(recipient)
  const resolvedNoOtpText = noOtpText ?? locale.otpPopup.noOtp
  const resolvedResendText = resendText ?? locale.otpPopup.resend
  const resolvedResendInLabel = resendInLabel ?? ((t: string) => locale.otpPopup.resendIn(t))
  const resolvedCloseAriaLabel = closeAriaLabel ?? locale.otpPopup.close
  const [digits, setDigits] = React.useState<string[]>(Array(length).fill(""))
  const [countdown, setCountdown] = React.useState(resendCooldown)
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([])

  // Reset state when popup opens
  React.useEffect(() => {
    if (open) {
      setDigits(Array(length).fill(""))
      setCountdown(resendCooldown)
      setTimeout(() => inputRefs.current[0]?.focus(), 50)
    }
  }, [open, length, resendCooldown])

  // Countdown timer
  React.useEffect(() => {
    if (!open || countdown <= 0) return
    const id = setInterval(() => setCountdown((c) => c - 1), 1000)
    return () => clearInterval(id)
  }, [open, countdown])

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

    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }

    if (next.every((d) => d !== "")) {
      onComplete(next.join(""))
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
    } else if (e.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault()
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length)
    if (!pasted) return
    const next = Array(length).fill("")
    pasted.split("").forEach((ch, i) => { next[i] = ch })
    setDigits(next)
    const focusIdx = Math.min(pasted.length, length - 1)
    inputRefs.current[focusIdx]?.focus()
    if (pasted.length === length) onComplete(pasted)
  }

  function handleResend() {
    setDigits(Array(length).fill(""))
    setCountdown(resendCooldown)
    onResend()
    setTimeout(() => inputRefs.current[0]?.focus(), 50)
  }

  const minutes = Math.floor(countdown / 60)
  const seconds = countdown % 60
  const timeLabel = `${minutes}:${String(seconds).padStart(2, "0")}`

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center"
      data-testid={toTestId(testId, "otp_popup")}
    >
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div
        className={cn(
          "relative bg-lb-surface rounded-lb-card shadow-lb",
          "w-[400px] max-w-[calc(100vw-32px)]",
          "flex flex-col items-center px-8 py-8 gap-6",
          className
        )}
      >
        {/* Close button */}
        <MainBtn
          onClick={onClose}
          aria-label={resolvedCloseAriaLabel}
          label=""
          leftIcon={
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          }
          className="absolute top-4 right-4 !w-8 !h-8 !p-0 rounded-full !bg-transparent !text-lb-on-surface-2 hover:!bg-lb-surface-grey"
        />

        {/* Header */}
        <div className="text-center flex flex-col gap-2">
          <h2 className="font-lb text-[20px] font-lb-bold text-lb-on-surface leading-[30px] tracking-[0.1375px] m-0">
            {resolvedTitle}
          </h2>
          <p className="font-lb text-[14px] text-lb-on-surface-2 leading-[20px] tracking-[0.0962px] m-0">
            {resolvedDescription}
          </p>
        </div>

        {/* OTP inputs */}
        <div className="flex items-center gap-2" onPaste={handlePaste}>
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el }}
              type="text"
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
                digit
                  ? "border-lb-line-2"
                  : "border-lb-line-1"
              )}
              style={{} /* focus handled via :focus-visible below */}
            />
          ))}
        </div>

        {/* Resend */}
        <p className="font-lb text-[14px] text-lb-on-surface-2 leading-[20px] text-center m-0">
          {resolvedNoOtpText}{" "}
          {countdown > 0 ? (
            <span className="font-lb-bold text-lb-on-surface">
              {resolvedResendInLabel(timeLabel)}
            </span>
          ) : (
            <MainBtn
              onClick={handleResend}
              label={resolvedResendText}
              size="sm"
              className="!bg-transparent !border-none !text-lb-brand !p-0 !h-auto font-lb-bold hover:underline"
            />
          )}
        </p>

        {/* Use PIN link */}
        {onUsePin && (
           <div className="flex flex-col items-center gap-2 w-full -mt-2">
            <div className="flex items-center gap-2 w-full align-center">
              <div className="flex-1 h-px bg-lb-line-1" />
              <span className="font-lb text-[12px] text-lb-on-surface-3 leading-[18px]">or</span>
              <div className="flex-1 h-px bg-lb-line-1" />
            </div>
            <CTAButton
              onClick={onUsePin}
              label={usePinLabel}
              size="sm"
            />
          </div>
        )}
      </div>

      <style>{`
        [data-testid="otp_popup"] input:focus {
          border-color: var(--lb-brand);
          box-shadow: 0 0 0 3px var(--lb-brand-light);
        }
      `}</style>
    </div>
  )
}

export default OtpPopup
