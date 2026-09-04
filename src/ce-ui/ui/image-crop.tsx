"use client"

import * as React from "react"
import { cn, toTestId } from "../lib/utils"
import { useLocale } from "../locale"

// ── Types ─────────────────────────────────────────────────────────────────────

export type CropRatio = "1:1" | "4:3" | "3:4" | "16:9" | "9:16"

const RATIO_MAP: Record<CropRatio, number> = {
  "1:1":  1,
  "4:3":  4 / 3,
  "3:4":  3 / 4,
  "16:9": 16 / 9,
  "9:16": 9 / 16,
}

function resolveRatio(r: CropRatio | number): number {
  return typeof r === "number" ? r : RATIO_MAP[r]
}

// ── Frame helpers ─────────────────────────────────────────────────────────────

/** Height of the preview area (px). Fixed so the modal doesn't resize. */
const PREVIEW_H = 300

/** Padding between the preview area edge and the crop frame (px, each side). */
const FRAME_PAD = 20

/**
 * Compute the largest frame that fits inside the preview area
 * (previewW × PREVIEW_H minus FRAME_PAD on each side) with the given ratio.
 */
function computeFrameSize(previewW: number, ratio: number): { w: number; h: number } {
  const maxW = previewW - FRAME_PAD * 2
  const maxH = PREVIEW_H - FRAME_PAD * 2
  // Which dimension is the bottleneck?
  if (maxW / maxH > ratio) {
    // Container is wider than the frame ratio → height-limited
    return { w: maxH * ratio, h: maxH }
  }
  // Container is narrower → width-limited
  return { w: maxW, h: maxW / ratio }
}

// ── Props ─────────────────────────────────────────────────────────────────────

export interface ImageCropProps {
  /** Whether the popup is open */
  open: boolean
  /** Data URL or object URL of the source image (e.g. from a file input) */
  imageSrc: string | null
  onClose: () => void
  /** Called with the cropped image as a data URL and Blob */
  onSave: (dataUrl: string, blob: Blob) => void
  /** Crop frame aspect ratio. Preset strings or a raw number (width / height). Default: "1:1" */
  aspectRatio?: CropRatio | number
  /** Output canvas dimensions in pixels. Default: { width: 512, height: 512 } */
  outputSize?: { width: number; height: number }
  /** Output MIME type. Default: "image/jpeg" */
  outputType?: "image/jpeg" | "image/png" | "image/webp"
  /** Compression quality 0–1 for JPEG/WebP. Default: 0.9 */
  outputQuality?: number
  /** Maximum zoom multiplier relative to the minimum fill scale. Default: 3 */
  maxZoomFactor?: number
  title?: string
  description?: string
  saveLabel?: string
  platform?: "mobile" | "tablet" | "desktop"
  className?: string
  testId?: string
}

// ── Component ─────────────────────────────────────────────────────────────────

export const ImageCrop: React.FC<ImageCropProps> = ({
  open,
  imageSrc,
  onClose,
  onSave,
  aspectRatio = "1:1" as CropRatio,
  outputSize = { width: 512, height: 512 },
  outputType = "image/jpeg",
  outputQuality = 0.9,
  maxZoomFactor = 3,
  title,
  description,
  saveLabel,
  platform = "mobile",
  className,
  testId,
}) => {
  const locale = useLocale()
  const resolvedTitle = title ?? locale.imageCrop.title
  const resolvedDescription = description ?? locale.imageCrop.description
  const resolvedSaveLabel = saveLabel ?? locale.imageCrop.saveLabel

  const ratio = resolveRatio(aspectRatio)

  // ── Refs ──────────────────────────────────────────────────────────────────

  const previewRef = React.useRef<HTMLDivElement>(null)
  const imgRef    = React.useRef<HTMLImageElement>(null)
  const dragRef = React.useRef<{
    startX: number; startY: number
    startOffsetX: number; startOffsetY: number
  } | null>(null)

  // Stale-closure-safe mirrors for values used inside callbacks / effects
  const scaleRef    = React.useRef(1)
  const offsetRef   = React.useRef({ x: 0, y: 0 })
  const natRef      = React.useRef<{ w: number; h: number } | null>(null)
  const frameRef    = React.useRef<{ w: number; h: number } | null>(null)

  // ── State ─────────────────────────────────────────────────────────────────

  const [naturalSize, setNaturalSize] = React.useState<{ w: number; h: number } | null>(null)
  const [previewW,    setPreviewW]    = React.useState(0)
  const [minScale,    setMinScale]    = React.useState(1)
  const [scale,       setScale]       = React.useState(1)
  const [offset,      setOffset]      = React.useState({ x: 0, y: 0 })

  // Keep refs in sync with state
  React.useEffect(() => { scaleRef.current = scale },        [scale])
  React.useEffect(() => { offsetRef.current = offset },      [offset])
  React.useEffect(() => { natRef.current = naturalSize },    [naturalSize])

  // ── Derived: frame size ───────────────────────────────────────────────────

  const frameSize = React.useMemo(() => {
    if (previewW === 0) return null
    return computeFrameSize(previewW, ratio)
  }, [previewW, ratio])

  React.useEffect(() => { frameRef.current = frameSize }, [frameSize])

  // ── Effects ───────────────────────────────────────────────────────────────

  // Lock body scroll while open
  React.useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [open])

  // Reset everything when the source image changes
  React.useEffect(() => {
    setNaturalSize(null)
    setMinScale(1)
    setScale(1)
    setOffset({ x: 0, y: 0 })
  }, [imageSrc])

  // Observe preview container width (handles orientation changes)
  React.useEffect(() => {
    if (!open) return
    const el = previewRef.current as HTMLDivElement
    const update = () => setPreviewW(el.clientWidth)
    update() // immediate first read
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [open])

  // Data URLs can decode synchronously before onLoad is attached — handle that case
  React.useEffect(() => {
    if (!open || !imageSrc) return
    const img = imgRef.current
    const el  = previewRef.current
    if (!img || !el || !img.complete || img.naturalWidth === 0) return
    const pW = el.clientWidth
    if (!pW) return
    const nat = { w: img.naturalWidth, h: img.naturalHeight }
    const fr  = computeFrameSize(pW, ratio)
    const ms  = Math.max(fr.w / nat.w, fr.h / nat.h)
    natRef.current    = nat
    frameRef.current  = fr
    scaleRef.current  = ms
    offsetRef.current = { x: 0, y: 0 }
    setPreviewW(pW)
    setNaturalSize(nat)
    setMinScale(ms)
    setScale(ms)
    setOffset({ x: 0, y: 0 })
  }, [open, imageSrc, ratio]) // eslint-disable-line react-hooks/exhaustive-deps

  // Recalculate scale / offset when the frame size changes (resize / ratio change)
  React.useEffect(() => {
    const nat = natRef.current
    if (!nat || !frameSize) return
    const ms = Math.max(frameSize.w / nat.w, frameSize.h / nat.h)
    const newScale = Math.max(scaleRef.current, ms)
    const clamped = doClamp(offsetRef.current.x, offsetRef.current.y, newScale, nat, frameSize)
    setMinScale(ms)
    setScale(newScale)
    setOffset(clamped)
  }, [frameSize]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Helpers ───────────────────────────────────────────────────────────────

  /** Clamp pan offset so the image always fully covers the crop frame. */
  function doClamp(
    ox: number, oy: number, s: number,
    nat: { w: number; h: number },
    frame: { w: number; h: number },
  ) {
    const maxX = Math.max(0, (nat.w * s - frame.w) / 2)
    const maxY = Math.max(0, (nat.h * s - frame.h) / 2)
    return {
      x: Math.min(maxX, Math.max(-maxX, ox)),
      y: Math.min(maxY, Math.max(-maxY, oy)),
    }
  }

  // ── Event handlers ────────────────────────────────────────────────────────

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget
    const el  = previewRef.current as HTMLDivElement
    const pW  = el.clientWidth
    const nat = { w: img.naturalWidth, h: img.naturalHeight }
    const fr  = computeFrameSize(pW, ratio)
    const ms  = Math.max(fr.w / nat.w, fr.h / nat.h)
    // Sync state + refs atomically
    natRef.current   = nat
    frameRef.current = fr
    scaleRef.current = ms
    offsetRef.current = { x: 0, y: 0 }
    setPreviewW(pW)
    setNaturalSize(nat)
    setMinScale(ms)
    setScale(ms)
    setOffset({ x: 0, y: 0 })
  }

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nat   = natRef.current
    const frame = frameRef.current
    if (!nat || !frame) return
    const t        = parseFloat(e.target.value)
    const newScale = minScale * (1 + t * (maxZoomFactor - 1))
    const clamped  = doClamp(offsetRef.current.x, offsetRef.current.y, newScale, nat, frame)
    scaleRef.current  = newScale
    offsetRef.current = clamped
    setScale(newScale)
    setOffset(clamped)
  }

  const sliderValue = (scale / minScale - 1) / (maxZoomFactor - 1)

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    dragRef.current = {
      startX: e.clientX, startY: e.clientY,
      startOffsetX: offsetRef.current.x,
      startOffsetY: offsetRef.current.y,
    }
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const nat   = natRef.current
    const frame = frameRef.current
    if (!dragRef.current || !nat || !frame) return
    const dx      = e.clientX - dragRef.current.startX
    const dy      = e.clientY - dragRef.current.startY
    const clamped = doClamp(
      dragRef.current.startOffsetX + dx,
      dragRef.current.startOffsetY + dy,
      scaleRef.current, nat, frame,
    )
    offsetRef.current = clamped
    setOffset(clamped)
  }

  const handlePointerUp = () => { dragRef.current = null }

  const handleSave = () => {
    if (!imageSrc) return
    const nat   = natRef.current as { w: number; h: number }
    const frame = frameRef.current as { w: number; h: number }
    const s       = scaleRef.current
    const { x, y } = offsetRef.current

    // Source rectangle in natural image coordinates
    const srcX = nat.w / 2 - (frame.w / 2 + x) / s
    const srcY = nat.h / 2 - (frame.h / 2 + y) / s
    const srcW = frame.w / s
    const srcH = frame.h / s

    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement("canvas")
      canvas.width  = outputSize.width
      canvas.height = outputSize.height
      const ctx = canvas.getContext("2d")
      if (!ctx) return
      ctx.drawImage(
        img,
        Math.max(0, srcX), Math.max(0, srcY),
        Math.min(nat.w - Math.max(0, srcX), srcW),
        Math.min(nat.h - Math.max(0, srcY), srcH),
        0, 0, outputSize.width, outputSize.height,
      )
      const dataUrl = canvas.toDataURL(outputType, outputQuality)
      canvas.toBlob(
        (blob) => { if (blob) onSave(dataUrl, blob) },
        outputType, outputQuality,
      )
    }
    img.src = imageSrc
  }

  // ── Render ────────────────────────────────────────────────────────────────

  if (!open || !imageSrc) return null

  const panelClass = {
    mobile:  "w-full rounded-t-3xl rounded-b-none max-h-[90vh]",
    tablet:  "w-[480px] rounded-lb-card max-h-[90vh]",
    desktop: "w-[560px] rounded-lb-card max-h-[90vh]",
  }[platform]

  const imgW = naturalSize ? naturalSize.w * scale : undefined
  const imgH = naturalSize ? naturalSize.h * scale : undefined

  return (
    <div
      className={cn(
        "fixed inset-0 z-[200] flex justify-center",
        platform === "mobile" ? "items-end" : "items-center",
      )}
      data-testid={toTestId(testId, "image_crop")}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Panel */}
      <div className={cn("relative bg-lb-surface shadow-lb flex flex-col overflow-hidden", panelClass, className)}>

        {/* Mobile drag handle */}
        {platform === "mobile" && (
          <div className="w-10 h-1 rounded-lb-pill bg-lb-line-2 mx-auto mt-2 flex-shrink-0" />
        )}

        {/* Header */}
        <div className="relative px-6 pt-5 pb-3 text-center flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 w-6 h-6 flex items-center justify-center text-lb-on-surface hover:bg-lb-surface-grey transition-colors bg-transparent border-none cursor-pointer rounded-full"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
          <h2 className="font-lb text-[20px] font-lb-bold text-lb-on-surface leading-[30px] tracking-[0.1375px] m-0">
            {resolvedTitle}
          </h2>
          <p className="font-lb text-[14px] text-lb-on-surface-2 leading-[20px] tracking-[0.0962px] mt-1 mb-0">
            {resolvedDescription}
          </p>
        </div>

        {/* ── Preview area ─────────────────────────────────────────────────── */}
        <div
          ref={previewRef}
          className={cn(
            "relative flex-shrink-0 overflow-hidden bg-lb-surface-grey select-none touch-none",
            naturalSize ? "cursor-grab active:cursor-grabbing" : "cursor-default",
          )}
          style={{ height: PREVIEW_H }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          {/* Source image (fills the area, pannable/zoomable) */}
          <img
            ref={imgRef}
            src={imageSrc}
            alt=""
            onLoad={handleImageLoad}
            draggable={false}
            style={{
              position: "absolute",
              width: imgW,
              height: imgH,
              maxWidth: "none",   // override global.css `max-width: 100%`
              top: "50%",
              left: "50%",
              transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`,
              userSelect: "none",
              pointerEvents: "none",
              display: naturalSize ? "block" : "none",
            }}
          />

          {/* Loading placeholder (shown while image is loading) */}
          {!naturalSize && (
            <div className="absolute inset-0 flex items-center justify-center">
              <svg
                width="40" height="40" viewBox="0 0 40 40" fill="none"
                className="text-lb-on-surface-3 animate-pulse" aria-hidden="true"
              >
                <rect x="4" y="4" width="32" height="32" rx="3" stroke="currentColor" strokeWidth="2" />
                <circle cx="15" cy="15" r="4" stroke="currentColor" strokeWidth="1.5" />
                <path d="M4 30l9-10 6 7 5-6 12 9" stroke="currentColor" strokeWidth="1.5"
                  strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          )}

          {/*
           * Crop frame overlay
           *
           * The element sits exactly at the frame position (centered).
           * Its `box-shadow` with a huge spread fills the rest of the preview area
           * with a semi-transparent dark mask, leaving only the frame transparent.
           * The `border` draws the blue frame edge on top.
           */}
          {frameSize && (
            <div
              className="absolute pointer-events-none z-10"
              style={{
                top:    "50%",
                left:   "50%",
                width:  frameSize.w,
                height: frameSize.h,
                transform: "translate(-50%, -50%)",
                boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.45)",
              }}
            >
              {/* Top-left */}
              <div className="absolute top-[-2px] left-[-2px] w-5 h-[3px] bg-lb-brand" />
              <div className="absolute top-[-2px] left-[-2px] w-[3px] h-5 bg-lb-brand" />
              {/* Top-right */}
              <div className="absolute top-[-2px] right-[-2px] w-5 h-[3px] bg-lb-brand" />
              <div className="absolute top-[-2px] right-[-2px] w-[3px] h-5 bg-lb-brand" />
              {/* Bottom-left */}
              <div className="absolute bottom-[-2px] left-[-2px] w-5 h-[3px] bg-lb-brand" />
              <div className="absolute bottom-[-2px] left-[-2px] w-[3px] h-5 bg-lb-brand" />
              {/* Bottom-right */}
              <div className="absolute bottom-[-2px] right-[-2px] w-5 h-[3px] bg-lb-brand" />
              <div className="absolute bottom-[-2px] right-[-2px] w-[3px] h-5 bg-lb-brand" />
            </div>
          )}
        </div>

        {/* ── Zoom slider ──────────────────────────────────────────────────── */}
        <div className="px-4 pt-4 pb-2 flex items-center gap-3 flex-shrink-0">
          {/* Smaller image icon */}
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"
            className="flex-shrink-0 text-lb-on-surface-3" aria-hidden="true">
            <rect x="2.5" y="2.5" width="15" height="15" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.25" />
            <path d="M2.5 16.5l5-5.5 3.5 3.5 3-3.5 4 5"
              stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
          </svg>

          <div className="relative flex-1 h-5 flex items-center">
            <div className="absolute inset-x-0 h-1 rounded-full bg-lb-line-1 pointer-events-none" />
            <div
              className="absolute left-0 h-1 rounded-full bg-lb-brand pointer-events-none"
              style={{ width: `${sliderValue * 100}%` }}
            />
            <input
              type="range"
              min={0} max={1} step={0.001}
              value={sliderValue}
              onChange={handleSliderChange}
              className={cn(
                "relative w-full h-1 rounded-full appearance-none bg-transparent cursor-pointer",
                "[&::-webkit-slider-thumb]:appearance-none",
                "[&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5",
                "[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-lb-brand",
                "[&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-sm",
                "[&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5",
                "[&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-lb-brand",
                "[&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:cursor-pointer",
              )}
            />
          </div>

          {/* Larger image icon */}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
            className="flex-shrink-0 text-lb-on-surface-3" aria-hidden="true">
            <rect x="2.5" y="2.5" width="19" height="19" rx="2" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="9.5" cy="9.5" r="3" stroke="currentColor" strokeWidth="1.5" />
            <path d="M2.5 20l6.5-7 4.5 4.5 3.5-4 5 6.5"
              stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* ── Save button ───────────────────────────────────────────────────── */}
        <div className="px-4 pb-6 pt-2 flex-shrink-0">
          <button
            type="button"
            onClick={handleSave}
            disabled={!naturalSize}
            className={cn(
              "w-full h-[50px] rounded-lb-btn",
              "font-lb text-[16px] font-lb-regular",
              "transition-colors duration-150 border-none cursor-pointer",
              "bg-lb-brand text-lb-brand-on hover:enabled:bg-lb-brand-hover",
              "disabled:bg-lb-surface-grey disabled:text-lb-on-surface-3 disabled:cursor-default",
            )}
          >
            {resolvedSaveLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ImageCrop
