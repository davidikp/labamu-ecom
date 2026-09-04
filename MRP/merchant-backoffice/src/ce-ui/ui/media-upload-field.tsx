"use client"

import * as React from "react"
import ReactDOM from "react-dom"
import { CloudUpload, Plus, X, Maximize2 } from "lucide-react"
import { cn, toTestId } from "../lib/utils"
import { ImageCrop, type CropRatio } from "./image-crop"
import { MainBtn } from "./main-btn"

const RATIO_MAP: Record<CropRatio, number> = {
  "1:1": 1,
  "4:3": 4 / 3,
  "3:4": 3 / 4,
  "16:9": 16 / 9,
  "9:16": 9 / 16,
}

const BASE_SIZE = 1280

function computeOutputSize(ratio: CropRatio | number): { width: number; height: number } {
  const r = typeof ratio === "number" ? ratio : RATIO_MAP[ratio]
  return r >= 1
    ? { width: BASE_SIZE, height: Math.round(BASE_SIZE / r) }
    : { width: Math.round(BASE_SIZE * r), height: BASE_SIZE }
}

function toCssRatio(ratio: CropRatio | number): string {
  if (typeof ratio === "number") return String(ratio)
  return ratio.replace(":", " / ")
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface MediaItem {
  id: string
  type: "image" | "video"
  /** Preview URL — data URL (cropped image) or object URL (video) */
  src: string
  /** Original filename */
  name?: string
  /** File size in bytes — shown below the filename when provided */
  size?: number
}

export interface MediaUploadPayload {
  file: File
  /** Data URL for images (post-crop), object URL for videos */
  src: string
  type: "image" | "video"
  name: string
  /** File size in bytes */
  size: number
}

export interface MediaUploadFieldProps {
  items: MediaItem[]
  /** Max total items. Default: 5 */
  maxItems?: number
  /** Max file size in MB shown in the drop zone hint. Default: 10 */
  maxSizeMB?: number
  /**
   * Aspect ratio for the image crop frame.
   * When omitted, images are added as-is without cropping and display at their natural ratio.
   * When provided, the ImageCrop modal opens and constrains the output to this ratio.
   */
  imageAspectRatio?: CropRatio | number
  /**
   * Output canvas size for cropped images.
   * Defaults to 1280px on the longer side derived from imageAspectRatio.
   * Only used when imageAspectRatio is set.
   */
  imageOutputSize?: { width: number; height: number }
  /** Called after a new image/video is ready. Parent assigns id and appends to items. */
  onAdd: (payload: MediaUploadPayload) => void
  /** Called when an existing item is replaced. Parent updates the matching item in items. */
  onReplace: (id: string, payload: MediaUploadPayload) => void
  /** Called when an item is removed. Parent removes it from items. */
  onRemove: (id: string) => void
  label?: string
  required?: boolean
  /** Platform variant for the ImageCrop modal. Default: "desktop" */
  platform?: "mobile" | "tablet" | "desktop"
  className?: string
  testId?: string
}

// ── MediaUploadField ──────────────────────────────────────────────────────────

export const MediaUploadField: React.FC<MediaUploadFieldProps> = ({
  items,
  maxItems = 5,
  maxSizeMB = 10,
  imageAspectRatio,
  imageOutputSize,
  onAdd,
  onReplace,
  onRemove,
  label,
  required,
  platform = "desktop",
  className,
  testId,
}) => {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const pendingFileRef = React.useRef<{ file: File; name: string } | null>(null)
  const replacingIdRef = React.useRef<string | null>(null)
  const sizesRef = React.useRef<Map<string, number>>(new Map())

  const [cropSrc, setCropSrc] = React.useState<string | null>(null)
  const [cropOpen, setCropOpen] = React.useState(false)
  const [isDragging, setIsDragging] = React.useState(false)

  const effectiveOutputSize =
    imageOutputSize ?? (imageAspectRatio !== undefined ? computeOutputSize(imageAspectRatio) : { width: 1280, height: 720 })

  const canAdd = items.length < maxItems
  const isEmpty = items.length === 0

  const openPicker = (replacingId?: string) => {
    replacingIdRef.current = replacingId ?? null
    inputRef.current?.click()
  }

  const processFile = (file: File) => {
    const name = file.name
    if (file.type.startsWith("image/") && imageAspectRatio !== undefined) {
      // Ratio set → open crop modal
      pendingFileRef.current = { file, name }
      const reader = new FileReader()
      reader.onload = (ev) => {
        setCropSrc(ev.target?.result as string)
        setCropOpen(true)
      }
      reader.readAsDataURL(file)
    } else {
      // No ratio (or video) → add raw with object URL
      const src = URL.createObjectURL(file)
      sizesRef.current.set(src, file.size)
      const type: "image" | "video" = file.type.startsWith("image/") ? "image" : "video"
      const payload: MediaUploadPayload = { file, src, type, name, size: file.size }
      if (replacingIdRef.current) {
        onReplace(replacingIdRef.current, payload)
      } else {
        onAdd(payload)
      }
      replacingIdRef.current = null
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ""
    processFile(file)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    if (!canAdd) return
    const file = e.dataTransfer.files?.[0]
    if (!file) return
    processFile(file)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => setIsDragging(false)

  const handleCropSave = (dataUrl: string, blob: Blob) => {
    const pending = pendingFileRef.current
    if (!pending) return
    const file = new File([blob], pending.name, { type: blob.type })
    sizesRef.current.set(dataUrl, blob.size)
    const payload: MediaUploadPayload = { file, src: dataUrl, type: "image", name: pending.name, size: blob.size }
    if (replacingIdRef.current) {
      onReplace(replacingIdRef.current, payload)
    } else {
      onAdd(payload)
    }
    replacingIdRef.current = null
    pendingFileRef.current = null
    setCropOpen(false)
    setCropSrc(null)
  }

  const handleCropClose = () => {
    replacingIdRef.current = null
    pendingFileRef.current = null
    setCropOpen(false)
    setCropSrc(null)
  }

  return (
    <>
      <div
        className={cn("flex flex-col gap-3", className)}
        data-testid={toTestId(testId, "media_upload_field")}
      >
        {label && (
          <div className="flex items-center gap-0.5">
            {required && (
              <span className="font-lb text-[14px] font-lb-bold text-lb-red">*</span>
            )}
            <span className="font-lb text-[12px] text-lb-on-surface leading-[18px]">
              {label}
            </span>
          </div>
        )}

        {/* ── Empty state drop zone ─────────────────────────────────────────── */}
        {isEmpty && (
          <div
            role="button"
            tabIndex={0}
            aria-label="Upload media"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => openPicker()}
            onKeyDown={(e) => e.key === "Enter" && openPicker()}
            className={cn(
              "w-full rounded-lb-card border-2 border-dashed cursor-pointer",
              "flex flex-col items-center justify-center gap-2 py-10 px-6",
              "transition-colors duration-150",
              isDragging
                ? "border-lb-brand bg-lb-brand-light"
                : "border-lb-brand bg-lb-surface hover:bg-lb-brand-light",
            )}
            data-testid={`${toTestId(testId, "media_upload_field")}_add`}
          >
            <CloudUpload
              size={40}
              className="text-lb-brand"
              strokeWidth={1.5}
              aria-hidden="true"
            />
            <div className="flex flex-col items-center gap-0.5 text-center">
              <span className="font-lb text-[13px] text-lb-on-surface-3 leading-[18px]">
                Max {maxItems} files, {maxSizeMB}MB each
              </span>
              <span className="font-lb text-[13px] text-lb-on-surface-3 leading-[18px]">
                Images and videos
              </span>
              <span className="font-lb text-[14px] text-lb-on-surface font-lb-semibold leading-[20px] mt-1">
                Drag file or{" "}
                <span className="text-lb-brand underline-offset-2 hover:underline">
                  browse file
                </span>
              </span>
            </div>
          </div>
        )}

        {/* ── Items grid (shown once at least one item exists) ──────────────── */}
        {!isEmpty && (
          <div className="flex flex-wrap gap-4">
            {items.map((item, index) => {
              const resolvedSize = item.size ?? sizesRef.current.get(item.src)
              return (
                <MediaCard
                  key={item.id}
                  item={resolvedSize !== undefined ? { ...item, size: resolvedSize } : item}
                  onReplace={() => openPicker(item.id)}
                  onRemove={() => onRemove(item.id)}
                  removeTestId={`${toTestId(testId, "media_upload_field")}_remove_${index}`}
                />
              )
            })}

            {canAdd && (
              <button
                type="button"
                onClick={() => openPicker()}
                aria-label="Add media"
                style={imageAspectRatio !== undefined ? { aspectRatio: toCssRatio(imageAspectRatio) } : undefined}
                className={cn(
                  "w-[180px] rounded-lb-card",
                  imageAspectRatio === undefined && "h-[120px]",
                  "border-2 border-dashed border-lb-line-2",
                  "flex items-center justify-center",
                  "bg-transparent cursor-pointer hover:bg-lb-surface-grey transition-colors",
                )}
              >
                <div className="w-12 h-12 rounded-full bg-lb-surface-grey flex items-center justify-center">
                  <Plus size={20} className="text-lb-on-surface-3" strokeWidth={2} aria-hidden="true" />
                </div>
              </button>
            )}
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/*"
          onChange={handleFileChange}
          className="hidden"
          aria-hidden="true"
          tabIndex={-1}
        />
      </div>

      {imageAspectRatio !== undefined && (
        <ImageCrop
          open={cropOpen}
          imageSrc={cropSrc}
          aspectRatio={imageAspectRatio}
          outputSize={effectiveOutputSize}
          platform={platform}
          onSave={handleCropSave}
          onClose={handleCropClose}
        />
      )}
    </>
  )
}

// ── MediaPreviewLightbox ──────────────────────────────────────────────────────

const MediaPreviewLightbox: React.FC<{ item: MediaItem; onClose: () => void }> = ({
  item,
  onClose,
}) => {
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
  }, [onClose])

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Close */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close preview"
        className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
      >
        <X size={18} className="text-white" />
      </button>

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center max-w-[90vw] max-h-[90vh]">
        {item.type === "image" ? (
          <img
            src={item.src}
            alt={item.name ?? "Preview"}
            className="max-w-[90vw] max-h-[90vh] rounded-lb-sm object-contain"
            draggable={false}
          />
        ) : (
          <video
            src={item.src}
            controls
            autoPlay
            playsInline
            className="max-w-[90vw] max-h-[90vh] rounded-lb-sm bg-black"
          />
        )}
      </div>
    </div>,
    document.body,
  )
}

// ── MediaCard ─────────────────────────────────────────────────────────────────

const CARD_PREVIEW_H = 200

interface MediaCardProps {
  item: MediaItem
  onReplace: () => void
  onRemove: () => void
  removeTestId?: string
}

const MediaCard: React.FC<MediaCardProps> = ({ item, onReplace, onRemove, removeTestId }) => {
  const [lightboxOpen, setLightboxOpen] = React.useState(false)

  return (
    <div className="flex flex-col w-full rounded-lb-card border border-lb-line-1 overflow-hidden bg-lb-surface shadow-sm">
      {/* Preview — fixed height, click to expand */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Preview media"
        onClick={() => setLightboxOpen(true)}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setLightboxOpen(true)}
        className="group relative w-full bg-black overflow-hidden cursor-pointer"
        style={{ height: CARD_PREVIEW_H }}
      >
        {item.type === "image" ? (
          <img
            src={item.src}
            alt={item.name ?? "Image preview"}
            className="w-full h-full object-cover"
            draggable={false}
          />
        ) : (
          <video
            src={item.src}
            preload="metadata"
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        )}

        {/* Hover overlay with expand icon */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity w-10 h-10 rounded-full bg-black/50 flex items-center justify-center">
            <Maximize2 size={16} className="text-white" aria-hidden="true" />
          </div>
        </div>
      </div>

      {/* Info + Actions */}
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="min-w-0 flex-1">
          {item.name && (
            <p className="font-lb text-[13px] text-lb-on-surface leading-[18px] truncate">
              {item.name}
            </p>
          )}
          {item.size !== undefined && (
            <p className="font-lb text-[12px] text-lb-on-surface-3 leading-[16px] mt-0.5">
              {formatBytes(item.size)}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <MainBtn
            label="Change"
            variant="secondary"
            size="sm"
            onClick={onReplace}
            aria-label="Change media"
          />
          <MainBtn
            label="Remove"
            variant="danger"
            size="sm"
            onClick={onRemove}
            aria-label="Remove media"
            testId={removeTestId}
          />
        </div>
      </div>

      {lightboxOpen && (
        <MediaPreviewLightbox item={item} onClose={() => setLightboxOpen(false)} />
      )}
    </div>
  )
}

export default MediaUploadField
