import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { resolveMedia } from '../../ui/fields/imageValue';
import BlockStream from '../../ui/BlockStream';
import { HeroArrow, HeroDots } from '../shared/HeroCarouselControls';
import { buildLinearGradient } from '../shared/colorUtils';
import { useResponsiveMobile } from '../shared/useResponsiveMobile';
import { resolveHeroRecipe } from '../shared/heroRecipes';

const ALIGN_CLASS = { left: 'items-start text-left', center: 'items-center text-center', right: 'items-end text-right' };
const POSITION_CLASS = { top: 'justify-start', center: 'justify-center', bottom: 'justify-end' };

const AUTOPLAY_MS = 5000;

/** `data.overlay_style`/`overlay_opacity` -> the overlay layer for the
 * 'background' layout. 'theme' resolves its exact gradient shape from the
 * theme's recipe (see heroRecipes.js) — this is also what the golden
 * reference's Appointment CTA green wash actually is: a 'theme' overlay on
 * an otherwise-ordinary background hero, not a bespoke section. */
function BackgroundOverlay({ data, theme, mobile }) {
  const style = data.overlay_style ?? 'dark';
  const opacity = (data.overlay_opacity ?? 0) / 100;
  if (style === 'none' || opacity === 0) return null;
  if (style === 'theme') {
    const primary = theme?.colors?.primary ?? '#111827';
    const recipe = resolveHeroRecipe(theme).overlayTheme;
    const stops = mobile ? recipe.mobile : recipe.desktop;
    return (
      <div
        className="pointer-events-none absolute inset-y-0 left-0"
        style={{ width: mobile ? recipe.widthMobile : recipe.widthDesktop, background: buildLinearGradient('to right', primary, stops) }}
      />
    );
  }
  return <div className="pointer-events-none absolute inset-0" style={{ backgroundColor: `rgba(0,0,0,${opacity})` }} />;
}

function SplitPanelHero({ blocks, theme, mediaLibrary, blockCtx, activeImage, isCarousel, activeIndex, slides, goTo, setIsPaused, mobile, isMobile }) {
  const surface = theme?.colors?.surface ?? '#f3f4f6';
  const recipe = resolveHeroRecipe(theme).splitPanel;
  const height = mobile ? recipe.heightMobile : recipe.heightDesktop;
  const radius = mobile ? recipe.radiusMobile : recipe.radiusDesktop;
  const imageWidth = mobile ? recipe.imageWidthMobile : recipe.imageWidthDesktop;
  const contentWidth = mobile ? recipe.contentWidthMobile : recipe.contentWidthDesktop;
  const contentPadding = mobile ? recipe.contentPaddingMobile : recipe.contentPaddingDesktop;
  const blendStops = mobile ? recipe.blendMobile : recipe.blendDesktop;

  return (
    <div className="px-6 py-6">
      <div
        className="relative mx-auto flex items-center overflow-hidden"
        style={{ background: surface, maxWidth: '1280px', height: `${height}px`, borderRadius: `${radius}px` }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="relative z-[3] flex flex-col justify-center" style={{ flex: `0 0 ${contentWidth}`, maxWidth: contentWidth, padding: contentPadding }}>
          <BlockStream
            sectionType="hero_banner"
            blocks={blocks}
            theme={theme}
            mediaLibrary={mediaLibrary}
            blockCtx={blockCtx}
            className="flex flex-col items-start gap-3 text-left"
            isMobile={isMobile}
            context="hero"
          />
        </div>
        {activeImage && (
          <>
            <div
              className="absolute inset-y-0 right-0 bg-cover bg-center"
              style={{ width: imageWidth, backgroundImage: `url(${activeImage.url})`, borderTopRightRadius: radius, borderBottomRightRadius: radius }}
            />
            {/* Blends the image panel's right edge into the surface color —
                same technique as the golden reference's card background. */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{ borderRadius: radius, background: buildLinearGradient('to right', surface, blendStops) }}
            />
          </>
        )}
        {isCarousel && !mobile && (
          <>
            <div className="absolute left-0 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
              <HeroArrow direction="prev" variant="bordered" onClick={() => goTo(activeIndex - 1)} theme={theme} />
            </div>
            <div className="absolute right-0 top-1/2 z-10 translate-x-1/2 -translate-y-1/2">
              <HeroArrow direction="next" variant="bordered" onClick={() => goTo(activeIndex + 1)} theme={theme} />
            </div>
          </>
        )}
        {isCarousel && (
          <div className="absolute left-1/2 z-10 -translate-x-1/2" style={{ bottom: mobile ? '-14px' : '24px' }}>
            <HeroDots count={slides.length} active={activeIndex} onSelect={goTo} variant="bordered" theme={theme} />
          </div>
        )}
      </div>
    </div>
  );
}

function HeroBannerRenderer({ data, blocks = [], theme, mediaLibrary, blockCtx, isMobile }) {
  const mobile = useResponsiveMobile(isMobile);
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

  if ((data.layout_variant ?? 'background') === 'split_panel') {
    return (
      <SplitPanelHero
        blocks={blocks}
        theme={theme}
        mediaLibrary={mediaLibrary}
        blockCtx={blockCtx}
        activeImage={activeImage}
        isCarousel={isCarousel}
        activeIndex={activeIndex}
        slides={slides}
        goTo={goTo}
        setIsPaused={setIsPaused}
        mobile={mobile}
        isMobile={isMobile}
      />
    );
  }

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
      {activeImage && <BackgroundOverlay data={data} theme={theme} mobile={mobile} />}
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
          <HeroArrow direction="prev" variant="minimal" onClick={() => goTo(activeIndex - 1)} theme={theme} />
          <HeroDots count={slides.length} active={activeIndex} onSelect={goTo} variant="minimal" theme={theme} />
          <HeroArrow direction="next" variant="minimal" onClick={() => goTo(activeIndex + 1)} theme={theme} />
        </div>
      )}
    </section>
  );
}

export default memo(HeroBannerRenderer);
