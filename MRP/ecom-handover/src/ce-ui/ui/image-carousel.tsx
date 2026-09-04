"use client"

import * as React from "react"
import { cn, toTestId } from "../lib/utils"

export interface CarouselImage {
  src: string
  alt?: string
}

export interface ImageCarouselProps {
  /** Between 1 and 5 images. */
  images: [CarouselImage, ...CarouselImage[]] & { length: 1 | 2 | 3 | 4 | 5 }
  /** Index of the initially active image. Defaults to 0. */
  defaultActiveIndex?: number
  /** Controlled active index. */
  activeIndex?: number
  /** Called when the user selects a thumbnail. */
  onActiveIndexChange?: (index: number) => void
  /** Aspect ratio of the main image area. Defaults to "1/1". */
  aspectRatio?: string
  /** Border radius applied to the main image and thumbnails. */
  className?: string
  testId?: string
}

export const ImageCarousel: React.FC<ImageCarouselProps> = ({
  images,
  defaultActiveIndex = 0,
  activeIndex: controlledIndex,
  onActiveIndexChange,
  aspectRatio = "1/1",
  className,
  testId,
}) => {
  const [internalIndex, setInternalIndex] = React.useState(defaultActiveIndex)

  const activeIndex = controlledIndex ?? internalIndex

  const handleSelect = (index: number) => {
    if (controlledIndex === undefined) {
      setInternalIndex(index)
    }
    onActiveIndexChange?.(index)
  }

  const active = images[activeIndex] ?? images[0]

  return (
    <div
      data-testid={toTestId(testId, "image_carousel")}
      className={cn("flex flex-col gap-3 w-full", className)}
    >
      {/* ── Main image ── */}
      <div
        className="w-full overflow-hidden rounded-lb-card bg-lb-surface-grey"
        style={{ aspectRatio }}
      >
        <img
          key={activeIndex}
          src={active.src}
          alt={active.alt ?? `Image ${activeIndex + 1}`}
          className="w-full h-full object-cover transition-opacity duration-200"
        />
      </div>

      {/* ── Thumbnails ── */}
      {images.length > 1 && (
        <div className="flex items-center gap-2">
          {images.map((img, i) => {
            const isActive = i === activeIndex
            return (
              <button
                key={i}
                type="button"
                aria-label={img.alt ?? `View image ${i + 1}`}
                aria-pressed={isActive}
                onClick={() => handleSelect(i)}
                className={cn(
                  "relative flex-1 min-w-0 overflow-hidden rounded-lb-sm",
                  "cursor-pointer outline-none transition-all duration-150",
                  "focus-visible:ring-2 focus-visible:ring-lb-brand focus-visible:ring-offset-1",
                  isActive
                    ? "ring-2 ring-lb-brand ring-offset-1"
                    : "ring-1 ring-lb-line-1 hover:ring-lb-brand hover:ring-2"
                )}
                style={{ aspectRatio: "1/1" }}
              >
                <img
                  src={img.src}
                  alt={img.alt ?? `Thumbnail ${i + 1}`}
                  className="w-full h-full object-cover"
                />
                {/* Overlay to dim inactive thumbnails slightly */}
                {!isActive && (
                  <span
                    className="absolute inset-0 bg-white/20 pointer-events-none"
                    aria-hidden="true"
                  />
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default ImageCarousel
