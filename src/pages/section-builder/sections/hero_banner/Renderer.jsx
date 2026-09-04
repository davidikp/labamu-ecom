import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { resolveMedia } from '../../ui/fields/imageValue';
import BlockStream from '../../ui/BlockStream';

const ALIGN_CLASS = { left: 'items-start text-left', center: 'items-center text-center', right: 'items-end text-right' };
const POSITION_CLASS = { top: 'justify-start', center: 'justify-center', bottom: 'justify-end' };

const AUTOPLAY_MS = 5000;

function HeroBannerRenderer({ data, blocks = [], theme, mediaLibrary, blockCtx }) {
  const slides = useMemo(() => {
    const images = [data.background_image, ...(data.extra_slides ?? []).map((slide) => slide.image)];
    return images.map((image) => resolveMedia(image, mediaLibrary)).filter(Boolean);
  }, [data, mediaLibrary]);
  const isCarousel = slides.length > 1;

  const [activeIndexRaw, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  // Clamp during render (not via effect) in case slides are added/removed.
  const activeIndex = slides.length ? activeIndexRaw % slides.length : 0;

  useEffect(() => {
    if (!isCarousel || isPaused) return undefined;
    timerRef.current = setInterval(() => {
      setActiveIndex((i) => (i + 1) % slides.length);
    }, AUTOPLAY_MS);
    return () => clearInterval(timerRef.current);
  }, [isCarousel, isPaused, slides.length]);

  const goTo = (index) => {
    setActiveIndex(((index % slides.length) + slides.length) % slides.length);
  };

  const align = ALIGN_CLASS[data.text_alignment] ?? ALIGN_CLASS.left;
  const position = POSITION_CLASS[data.content_position] ?? POSITION_CLASS.center;
  const activeImage = slides[activeIndex];

  return (
    <section
      className="relative flex justify-center overflow-hidden bg-cover bg-center px-6"
      style={{
        backgroundImage: activeImage ? `url(${activeImage.url})` : undefined,
        minHeight: `${data.min_height ?? 500}px`,
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {activeImage && (
        <div className="absolute inset-0" style={{ backgroundColor: `rgba(0,0,0,${(data.overlay_opacity ?? 0) / 100})` }} />
      )}
      <div className={`relative z-10 flex max-w-lg flex-col ${position}`}>
        <BlockStream
          sectionType="hero_banner"
          blocks={blocks}
          theme={theme}
          mediaLibrary={mediaLibrary}
          blockCtx={blockCtx}
          className={`flex flex-col gap-4 ${align}`}
        />
      </div>
      {isCarousel && (
        <div className="absolute inset-x-0 bottom-4 z-10 flex items-center justify-center gap-2">
          <button
            type="button"
            aria-label="Previous slide"
            onClick={() => goTo(activeIndex - 1)}
            className="text-white/70 transition-colors hover:text-white"
          >
            ‹
          </button>
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === activeIndex}
              onClick={() => goTo(i)}
              className={`h-1.5 rounded-full bg-white transition-all ${i === activeIndex ? 'w-6 opacity-100' : 'w-1.5 opacity-50'}`}
            />
          ))}
          <button
            type="button"
            aria-label="Next slide"
            onClick={() => goTo(activeIndex + 1)}
            className="text-white/70 transition-colors hover:text-white"
          >
            ›
          </button>
        </div>
      )}
    </section>
  );
}

export default memo(HeroBannerRenderer);
