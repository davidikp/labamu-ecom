"use client"

import * as React from "react"
import { X, Plus } from "lucide-react"
import { cn, toTestId } from "../lib/utils"
import { ImageCrop } from "./image-crop"
import { FieldDesktopRow } from "./field-desktop"

export interface ImageFieldProps {
  /** Array of image data URLs or object URLs to display */
  images: string[]
  /** Maximum number of images. Default: 5 */
  maxImages?: number
  /** Called with the cropped File after the user confirms the crop */
  onAdd: (file: File) => void
  /** Called with the index of the image to remove */
  onRemove: (index: number) => void
  /** Index of the primary image. When provided, clicking an image calls onPrimaryChange. */
  primaryIndex?: number
  /** Called with the index when the user clicks an image to mark it as primary. */
  onPrimaryChange?: (index: number) => void
  /** Label rendered above the grid */
  label?: string
  /** Text shown on the primary badge. Default: "Primary" */
  primaryLabel?: string
  /** Accepted MIME types for the file picker. Default: "image/*" */
  accept?: string
  /** Platform variant passed to ImageCrop. Default: "mobile" */
  platform?: "mobile" | "tablet" | "desktop"
  required?: boolean
  helperText?: string
  tooltip?: string
  fieldDesktop?: boolean
  className?: string
  testId?: string
}

export const ImageField: React.FC<ImageFieldProps> = ({
  images,
  maxImages = 5,
  onAdd,
  onRemove,
  primaryIndex,
  onPrimaryChange,
  label,
  primaryLabel = "Primary",
  accept = "image/*",
  platform = "desktop",
  required,
  helperText,
  tooltip,
  fieldDesktop = false,
  className,
  testId,
}) => {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const pendingFileName = React.useRef<string>("image.jpg")

  const [cropSrc, setCropSrc] = React.useState<string | null>(null)
  const [cropOpen, setCropOpen] = React.useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    pendingFileName.current = file.name
    const reader = new FileReader()
    reader.onload = (ev) => {
      setCropSrc(ev.target?.result as string)
      setCropOpen(true)
    }
    reader.readAsDataURL(file)
    e.target.value = ""
  }

  const handleCropSave = (_dataUrl: string, blob: Blob) => {
    const file = new File([blob], pendingFileName.current, { type: blob.type })
    onAdd(file)
    setCropOpen(false)
    setCropSrc(null)
  }

  const handleCropClose = () => {
    setCropOpen(false)
    setCropSrc(null)
  }

  const canAdd = images.length < maxImages
  const baseId = toTestId(testId, "image_field")

  const fieldDiv = (
    <div className={cn("flex flex-col gap-3", className)} data-testid={baseId}>
      {!fieldDesktop && label && (
        <span className="font-lb text-[16px] font-lb-regular text-lb-on-surface leading-[24px]">
          {label}
        </span>
      )}

        <div className="flex flex-wrap gap-4">
          {images.map((src, index) => {
            const isPrimary = primaryIndex === index
            return (
              <div
                key={index}
                className="relative"
                onClick={() => onPrimaryChange?.(index)}
                style={{ cursor: onPrimaryChange ? "pointer" : undefined }}
              >
                <div
                  className={cn(
                    "w-[160px] h-[160px] rounded-lb-card overflow-hidden border border-[#D4D4D4] p-1",
                    isPrimary && "ring-2 ring-lb-brand"
                  )}
                >
                  <img
                    src={src}
                    alt={`Image ${index + 1}`}
                    className="w-full h-full object-cover rounded-lb-card"
                    draggable={false}
                  />
                </div>

                {isPrimary && (
                  <span className="absolute top-2 left-2 bg-lb-brand text-white font-lb font-lb-bold text-[13px] leading-[18px] px-3 py-1 rounded-xl pointer-events-none">
                    {primaryLabel}
                  </span>
                )}

                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onRemove(index) }}
                  aria-label="Remove image"
                  className={cn(
                    "absolute -top-3 -right-3 w-8 h-8 rounded-full",
                    "bg-lb-surface border-[1px] border-lb-red",
                    "flex items-center justify-center",
                    "cursor-pointer hover:opacity-90 transition-opacity",
                  )}
                  data-testid={`${baseId}_remove_${index}`}
                >
                  <X size={13} color="red" strokeWidth={2.5} aria-hidden="true" />
                </button>
              </div>
            )
          })}

          {canAdd && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              aria-label="Add image"
              className={cn(
                "w-[160px] h-[160px] rounded-lb-card",
                "border-2 border-dashed border-lb-line-2",
                "flex items-center justify-center",
                "bg-transparent cursor-pointer hover:bg-lb-surface-grey transition-colors",
              )}
              data-testid={`${baseId}_add`}
            >
              <div className="w-12 h-12 rounded-full bg-lb-surface-grey flex items-center justify-center">
                <Plus size={20} className="text-lb-on-surface-3" strokeWidth={2} aria-hidden="true" />
              </div>
            </button>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
          aria-hidden="true"
          tabIndex={-1}
        />
    </div>
  )

  return (
    <>
      {fieldDesktop ? (
        <FieldDesktopRow label={label ?? ""} required={required} helperText={helperText} tooltip={tooltip}>
          {fieldDiv}
        </FieldDesktopRow>
      ) : fieldDiv}
      <ImageCrop
        open={cropOpen}
        imageSrc={cropSrc}
        aspectRatio="1:1"
        platform={platform}
        onSave={handleCropSave}
        onClose={handleCropClose}
      />
    </>
  )
}

export default ImageField
