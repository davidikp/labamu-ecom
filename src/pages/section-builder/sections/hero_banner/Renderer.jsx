import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { resolveMedia } from '../../ui/fields/imageValue';
import BlockStream from '../../ui/BlockStream';
import { HeroArrow, HeroDots } from '../shared/HeroCarouselControls';
import { buildLinearGradient } from '../shared/colorUtils';
import { useResponsiveMobile } from '../shared/useResponsiveMobile';
import { resolveHeroRecipe } from '../shared/heroRecipes';

const ALIGN_CLASS = { left: 'items-start text-left', center: 'items-center text-center', right: 'items-end text-right' };
const POSITION_CLASS = { top: 'justify-start', center: 'justify-center', bottom: 'justify-end' };
// Horizontal placement of the content box *within* the full-width section —
// separate from ALIGN_CLASS, which only controls text alignment *inside*
// that box. Without this, the box itself always sat centered on the page
// (the section's own flex-justify was hardcoded to `justify-center`) even
// when its text read as left-aligned relative to its own box.
const H_JUSTIFY_CLASS = { left: 'justify-start', center: 'justify-center', right: 'justify-end' };

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
      {/* Outer wrapper matches the card's own box exactly (same maxWidth/
          height) but has no overflow-hidden, so the prev/next arrows —
          positioned straddling its left/right edge — float fully visible
          above the card instead of being clipped by it. Only the inner card
          clips the image/blend layer, which do need to respect the rounded
          corners. */}
      <div
        className="relative mx-auto"
        style={{ maxWidth: '1280px', height: `${height}px` }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div
          className="relative flex h-full w-full items-center overflow-hidden"
          style={{ background: surface, borderRadius: `${radius}px` }}
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
        </div>
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

function HeroBannerRenderer({ data, blocks = [], theme, mediaLibrary, blockCtx, isMobile, breakpoint }) {
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
  const hJustify = H_JUSTIFY_CLASS[data.text_alignment] ?? H_JUSTIFY_CLASS.left;
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

  // A 'background'-layout hero with a themed overlay is, semantically, a
  // branded CTA banner (the overlay_style: 'theme' field's own stated
  // purpose — see schema.js) — the golden-reference Appointment section is
  // exactly this combination, not a bespoke section type. That's the only
  // signal that opts a hero_banner instance into 'hero_cta' typography /
  // recipe-driven background position; an ordinary background hero
  // (overlay_style !== 'theme') never passes a context and renders exactly
  // as before.
  const isCtaBanner = data.overlay_style === 'theme';
  const heroRecipe = resolveHeroRecipe(theme);
  const bgPositionRecipe = heroRecipe.backgroundPosition;
  const backgroundPosition = (mobile ? bgPositionRecipe?.mobile : bgPositionRecipe?.desktop) ?? 'center';
  // Falls back to 1 (DEFAULT_HERO_RECIPE) for every theme that doesn't set
  // its own recipe — a plain, unzoomed 'cover' background hero renders
  // byte-identical to before. Houzez's recipe zooms further than 'cover' to
  // fully crop a mockup-style background image's own baked-in content off
  // the visible edge — see heroRecipes.js's comment.
  const bgZoomRecipe = heroRecipe.backgroundZoom;
  const backgroundZoom = (mobile ? bgZoomRecipe?.mobile : bgZoomRecipe?.desktop) ?? 1;

  return (
    <section
      className={`relative flex ${hJustify} overflow-hidden px-6 md:px-16 lg:px-28`}
      style={{ minHeight: `${data.min_height ?? 500}px` }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {activeImage && (
        // Two layers, not a single `background-size: <percent>`: a plain
        // percentage (e.g. '190% auto') only sets the image's *width*,
        // leaving its height to scale proportionally — on a container
        // whose aspect ratio doesn't match the image (a narrow, tall
        // mobile frame vs. a wide photo), that computed height falls short
        // of the container's, and the default `background-repeat` tiles
        // the leftover space instead of leaving it covered. The inner
        // layer uses `cover` (which *always* fills both dimensions, at any
        // container aspect ratio, with no repeat) and the extra zoom the
        // Houzez recipe needs to crop its baked-in panel off-screen (see
        // heroRecipes.js) is layered on top via `transform: scale(...)`,
        // anchored at the same point `backgroundPosition` uses so it zooms
        // toward/away from that same focal point.
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute inset-0 bg-no-repeat"
            style={{
              backgroundImage: `url(${activeImage.url})`,
              backgroundPosition,
              backgroundSize: 'cover',
              transform: backgroundZoom !== 1 ? `scale(${backgroundZoom})` : undefined,
              transformOrigin: backgroundPosition,
            }}
          />
        </div>
      )}
      {activeImage && <BackgroundOverlay data={data} theme={theme} mobile={mobile} />}
      {/* max-w-2xl (not the previous max-w-lg/512px) — too narrow for the
          heading block's own 'xlarge' size option (up to 96px desktop,
          see blockRenderers.jsx's HEADING_SIZE), which would otherwise wrap
          onto several lines regardless of how wide the source photo/section
          actually is. Widening this is a no-op for any heading short enough
          to already fit in 512px (Xinear/Houzez's own hero headings at
          their 'medium' default) — it only gives long or large-size
          headings more room before wrapping. */}
      <div className={`relative z-10 flex ${isCtaBanner ? 'max-w-3xl' : 'max-w-2xl'} flex-col ${position}`}>
        <BlockStream
          sectionType="hero_banner"
          blocks={blocks}
          theme={theme}
          mediaLibrary={mediaLibrary}
          blockCtx={blockCtx}
          breakpoint={breakpoint}
          className={`flex flex-col gap-4 ${align}`}
          isMobile={isMobile}
          context={isCtaBanner ? 'hero_cta' : undefined}
        />
      </div>
      {isCarousel && (
        <div className="absolute inset-x-0 bottom-4 z-10 flex items-center justify-center">
          {/* 'minimal' arrows/dots are plain white — legible over a
              Houzez-style dark/photo-heavy hero, but Xinear's own hero
              photo is pale, leaving them nearly invisible without some
              backdrop. A small translucent dark pill (sized to the
              controls, not the full section width) keeps them visible
              against any photo brightness, not just dark ones. */}
          <div className="flex items-center gap-2 rounded-full bg-black/25 px-3 py-1.5">
            <HeroArrow direction="prev" variant="minimal" onClick={() => goTo(activeIndex - 1)} theme={theme} />
            <HeroDots count={slides.length} active={activeIndex} onSelect={goTo} variant="minimal" theme={theme} />
            <HeroArrow direction="next" variant="minimal" onClick={() => goTo(activeIndex + 1)} theme={theme} />
          </div>
        </div>
      )}
    </section>
  );
}

export default memo(HeroBannerRenderer);
