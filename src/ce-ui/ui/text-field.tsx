"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { useLocale } from "../locale"
import Editor, { Toolbar } from "react-simple-wysiwyg"
import { cn, toTestId } from "../lib/utils"
import { FieldDesktopRow } from "./field-desktop"

// ── WysiwygBtn ────────────────────────────────────────────────────────────────
// Custom toolbar button that uses the native `selectionchange` event to track
// active state — bypasses the library's focus-dependent active detection.

const WysiwygBtn: React.FC<{ command: string; title: string; children: React.ReactNode }> = ({
  command,
  title,
  children,
}) => {
  const [active, setActive] = React.useState(false)

  const syncActive = React.useCallback(() => {
    try { setActive(document.queryCommandState(command)) } catch { setActive(false) }
  }, [command])

  React.useEffect(() => {
    document.addEventListener("selectionchange", syncActive)
    return () => document.removeEventListener("selectionchange", syncActive)
  }, [syncActive])

  return (
    <button
      type="button"
      title={title}
      tabIndex={-1}
      onMouseDown={(e) => {
        e.preventDefault() // keep editor focus
        document.execCommand(command)
        syncActive() // selectionchange may not fire when selection position is unchanged
      }}
      className={cn(
        "w-8 h-8 flex items-center justify-center rounded-lb-sm font-lb text-[14px] leading-none transition-colors",
        active
          ? "bg-lb-brand text-white"
          : "text-lb-on-surface hover:bg-lb-brand-light hover:text-lb-brand"
      )}
    >
      {children}
    </button>
  )
}

const textFieldVariants = cva(
  [
    "w-full font-lb rounded-lb-input border",
    "transition-all duration-200 outline-none",
    "placeholder:text-lb-on-surface-3 text-lb-on-surface",
  ],
  {
    variants: {
      variant: {
        outlined: [
          "bg-lb-surface border-lb-line-1",
          "hover:border-lb-line-2",
          "focus:border-lb-brand focus:shadow-[0_0_0_3px_theme(colors.lb-brand-light)]",
        ],
        filled: [
          "border-lb-brand border-lb-line-1",
          "hover:border-lb-line-2",
          "focus:border-lb-brand focus:shadow-[0_0_0_3px_theme(colors.lb-brand-light)]",
        ],
      },
      size: {
        lg: "text-[16px] leading-[22px] tracking-[0.11px]",
        md: "text-[14px] leading-[20px] tracking-[0.0962px]",
      },
      state: {
        default: "",
        error: [
          "border-lb-red hover:border-lb-red",
          "focus:border-lb-red focus:shadow-[0_0_0_3px_theme(colors.lb-red-bg)]",
        ],
        success: "border-lb-green hover:border-lb-green focus:border-lb-green",
        disabled: ["bg-lb-surface-grey border-lb-line-1", "text-lb-on-surface-3 cursor-not-allowed"],
        readonly: "bg-lb-surface-grey border-lb-line-1 cursor-default",
      },
    },
    defaultVariants: { variant: "outlined", size: "lg", state: "default" },
  }
)

export interface TextFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof textFieldVariants> {
  label?: string
  required?: boolean
  helperText?: string
  errorText?: string
  successText?: string
  showCount?: boolean
  maxLength?: number
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  multiline?: boolean
  richText?: boolean
  rows?: number
  showEditorToolbar?: boolean
  /** Show read view first, click to switch into edit mode. */
  inlineEditable?: boolean
  /** Placeholder shown in inline read view when value is empty. */
  inlinePlaceholder?: string
  tooltip?: string
  fieldDesktop?: boolean
  testId?: string
}

export const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  (
    {
      label,
      required,
      helperText,
      errorText,
      successText,
      showCount,
      maxLength,
      leftIcon,
      rightIcon,
      multiline,
      richText = false,
      rows = 3,
      showEditorToolbar = true,
      inlineEditable = false,
      inlinePlaceholder,
      tooltip,
      fieldDesktop = false,
      variant,
      size,
      state,
      className,
      value,
      testId,
      onChange,
      onBlur,
      onFocus = undefined,
      placeholder,
      name,
      id,
      ...props
    },
    ref
  ) => {
    // Inject RSW toolbar overrides into <head> once per app lifetime.
    React.useEffect(() => {
      const id = "lb-rsw-overrides"
      if (document.getElementById(id)) return
      const el = document.createElement("style")
      el.id = id
      el.textContent = `
        .rsw-editor{border:0!important;box-shadow:none!important;background:transparent!important;display:flex!important;flex-direction:column-reverse!important}
        .rsw-ce{padding:12px;color:inherit;outline:none!important}
        .rsw-ce[contenteditable="false"]{cursor:not-allowed}
        .rsw-ce ul{list-style:disc;padding-left:1.5rem;margin:.25rem 0}
        .rsw-ce ol{list-style:decimal;padding-left:1.5rem;margin:.25rem 0}
        .rsw-ce li{margin:.125rem 0}
        .rsw-toolbar{padding:0!important;background:transparent!important}
      `
      document.head.appendChild(el)
    }, [])

    const locale = useLocale()
    const resolvedInlinePlaceholder = inlinePlaceholder ?? locale.textField.inlinePlaceholder
    const inputState = state || (errorText ? "error" : "default")
    const [isInlineEditing, setIsInlineEditing] = React.useState(!inlineEditable)
    const [editorFocused, setEditorFocused] = React.useState(false)
    const inputRef = React.useRef<HTMLInputElement | null>(null)
    const stringValue = typeof value === "string" ? value : ""
    const plainEditorValue = stringValue
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(p|div|li)>/gi, "\n")
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/\u200B/g, "")
    const normalizedEditorValue = plainEditorValue.replace(/\n{3,}/g, "\n\n")
    const inlineDisplayText = multiline ? normalizedEditorValue : stringValue
    const editorCharCount = normalizedEditorValue.trim().length === 0 ? 0 : normalizedEditorValue.length
    const charCount = multiline ? editorCharCount : stringValue.length
    const inputSizeClass = size === "md" ? "h-10 px-3" : "h-12 px-4"
    const leftPad = leftIcon ? (size === "md" ? "pl-10" : "pl-11") : ""
    const rightPad = rightIcon ? (size === "md" ? "pr-10" : "pr-11") : ""
    const isDisabled = inputState === "disabled"
    const isReadOnly = inputState === "readonly"
    const showInlineReadView = inlineEditable && !isInlineEditing && !isDisabled

    React.useEffect(() => {
      if (!inlineEditable) {
        setIsInlineEditing(true)
      }
    }, [inlineEditable])

const handleInlineEnterEdit = () => {
      if (isDisabled || isReadOnly) return
      setIsInlineEditing(true)
    }

    const handleBlur: React.FocusEventHandler<HTMLInputElement> = (event) => {
      onBlur?.(event)
      if (inlineEditable) setIsInlineEditing(false)
    }
    const handleEditorFocus = (event: any) => {
      setEditorFocused(true)
      ;(onFocus as any)?.(event)
    }

    const handleEditorBlur = (event: any) => {
      setEditorFocused(false)
      ;(onBlur as any)?.(event)
      if (inlineEditable) setIsInlineEditing(false)
    }

    const fieldNode = (
      <div className="flex flex-col gap-1 w-full">
        {!fieldDesktop && label && (
          <div className="flex items-center justify-between gap-0.5">
            <div className="flex items-center gap-0.5">
              {required && <span className="font-lb text-[14px] font-lb-bold text-lb-red">*</span>}
              <span className="font-lb text-[12px] text-lb-on-surface leading-[18px] tracking-[0.0825px]">
                {label}
              </span>
            </div>
            {!fieldDesktop && (!multiline || !richText) && showCount && maxLength && (
              <span className={cn("font-lb text-[12px]", charCount > maxLength ? "text-lb-red" : "text-lb-on-surface-3")}>
                {charCount}/{maxLength}
              </span>
            )}
          </div>
        )}
        <div className="relative">
          {showInlineReadView ? (
            <button
              type="button"
              onClick={handleInlineEnterEdit}
              className={cn(
                textFieldVariants({ variant, size, state: "readonly" }),
                inputSizeClass,
                leftPad,
                rightPad,
                "w-full text-left",
                !inlineDisplayText && "text-lb-on-surface-3",
                className
              )}
            >
              {inlineDisplayText || resolvedInlinePlaceholder || placeholder}
            </button>
          ) : null}
          {leftIcon && (
            <span
              className={cn(
                "absolute left-3 top-1/2 -translate-y-1/2",
                inputState === "disabled" ? "text-lb-on-surface-3" : "text-lb-on-surface-2"
              )}
            >
              {leftIcon}
            </span>
          )}
          {!showInlineReadView && multiline && !richText ? (
            <textarea
              className={cn(
                textFieldVariants({ variant, size, state: inputState }),
                "h-auto px-4 py-3 resize-none",
                showCount && !!maxLength && (fieldDesktop || !label) && "pb-6",
                className
              )}
              rows={rows}
              maxLength={maxLength}
              value={value as string}
              onChange={onChange as any}
              onBlur={onBlur as any}
              onFocus={onFocus as any}
              placeholder={placeholder}
              name={name}
              id={id}
              disabled={isDisabled}
              readOnly={isReadOnly}
              data-testid={toTestId(testId, "textarea")}
            />
          ) : !showInlineReadView && multiline && richText ? (
            <div
              className={cn(
                textFieldVariants({ variant, size, state: inputState }),
                "h-auto p-0 overflow-hidden",
                className
              )}
              data-testid={toTestId(testId, "text_field")}
              style={
                editorFocused && inputState === "error"
                  ? { borderColor: "var(--lb-red)", boxShadow: "0 0 0 3px var(--lb-red-bg)" }
                  : editorFocused
                  ? { borderColor: "var(--lb-brand)", boxShadow: "0 0 0 3px var(--lb-brand-light)" }
                  : undefined
              }
            >
              <Editor
                value={stringValue}
                onChange={onChange as any}
                onBlur={handleEditorBlur}
                onFocus={handleEditorFocus}
                placeholder={placeholder}
                name={name}
                id={id}
                disabled={inputState === "disabled" || inputState === "readonly"}
                containerProps={{
                  className: cn("w-full"),
                  style: { minHeight: `${Math.max(rows, 3) * 24}px` },
                }}
              >
                {showEditorToolbar && (
                  <Toolbar className="!border-x-0 !border-t !border-b-0 !border-lb-line-1 !px-2 !h-[44px] !flex !items-center !justify-between">
                    <div className="flex items-center gap-0.5">
                      <WysiwygBtn command="bold" title="Bold">
                        <span className="font-bold">B</span>
                      </WysiwygBtn>
                      <WysiwygBtn command="italic" title="Italic">
                        <span className="italic">I</span>
                      </WysiwygBtn>
                      <WysiwygBtn command="underline" title="Underline">
                        <span className="underline">U</span>
                      </WysiwygBtn>
                      <WysiwygBtn command="insertOrderedList" title="Numbered list">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 5h14v2H7V5zm0 8v-2h14v2H7zM4 4.5c.83 0 1.5.67 1.5 1.5S4.83 7.5 4 7.5 2.5 6.83 2.5 6 3.17 4.5 4 4.5zM4 10.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5.67-1.5 1.5-1.5zM7 19v-2h14v2H7zm-3-2.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5.67-1.5 1.5-1.5z"/></svg>
                      </WysiwygBtn>
                      <WysiwygBtn command="insertUnorderedList" title="Bullet list">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h16v2H4v-2z"/></svg>
                      </WysiwygBtn>
                    </div>
                    {showCount && maxLength && (
                      <span
                        className={cn(
                          "font-lb text-[12px]",
                          charCount > maxLength ? "text-lb-red" : "text-lb-on-surface-3"
                        )}
                      >
                        {charCount}/{maxLength}
                      </span>
                    )}
                  </Toolbar>
                )}
              </Editor>
            </div>
          ) : !showInlineReadView ? (
            <input
              ref={(node) => {
                inputRef.current = node
                if (typeof ref === "function") ref(node)
                else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = node
              }}
              className={cn(textFieldVariants({ variant, size, state: inputState }), inputSizeClass, leftPad, rightPad, className)}
              maxLength={maxLength}
              value={value}
              onChange={onChange}
              onBlur={handleBlur}
              onFocus={onFocus}
              placeholder={placeholder}
              name={name}
              id={id}
              disabled={isDisabled}
              readOnly={isReadOnly}
              data-testid={toTestId(testId, "text_field")}
              {...(props as any)}
            />
          ) : null}
          {rightIcon && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-lb-on-surface-2">{rightIcon}</span>
          )}
          {(fieldDesktop || !label) && !multiline && showCount && maxLength && (
            <span className={cn("absolute right-3 top-1/2 -translate-y-1/2 font-lb text-[12px]", charCount > maxLength ? "text-lb-red" : "text-lb-on-surface-3")}>
              {charCount}/{maxLength}
            </span>
          )}
          {multiline && !richText && showCount && maxLength && (fieldDesktop || !label) && (
            <span className={cn("absolute bottom-2 right-3 font-lb text-[12px]", charCount > maxLength ? "text-lb-red" : "text-lb-on-surface-3")}>
              {charCount}/{maxLength}
            </span>
          )}
        </div>
        {((fieldDesktop ? (errorText || successText) : (helperText || errorText || successText))) && (
          <span
            className={cn(
              "font-lb text-[12px] leading-[18px] tracking-[0.0825px]",
              errorText ? "text-lb-red" : successText ? "text-lb-green-text" : "text-lb-on-surface-3"
            )}
          >
            {errorText || successText || (!fieldDesktop ? helperText : undefined)}
          </span>
        )}
      </div>
    )

    return fieldDesktop ? (
      <FieldDesktopRow label={label ?? ""} required={required} helperText={helperText} tooltip={tooltip}>
        {fieldNode}
      </FieldDesktopRow>
    ) : fieldNode
  }
)
TextField.displayName = "TextField"

export default TextField

