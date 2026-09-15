import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import BlockStream from '../../ui/BlockStream';
import StorefrontContainer from '../../ui/primitives/StorefrontContainer';
import { resolveMedia } from '../../ui/fields/imageValue';
import { resolveColor } from '../../ui/fields/colorValue';
import { themedButtonStyle, useThemedButtonHover } from '../shared/themedButtonStyle';
import { useResponsiveMobile } from '../shared/useResponsiveMobile';

// TODO(backend): submission, email notification, and rate limiting (US-9.1's
// AC) need a real endpoint — this renders the form fields only.
function ContactFormRenderer({ data, blocks = [], theme, mediaLibrary, blockCtx, isMobile, breakpoint }) {
  const { t } = useTranslation();
  // See map_embed/Renderer.jsx's comment: the builder/preview canvas
  // simulates each device as a fixed-width frame inside a real (usually
  // wide) browser, so a `md:` Tailwind breakpoint never reflects the
  // selected device there — at the 768px tablet frame this two-column
  // layout's own minmax() minimums (400+500=900px) overflowed it. Collapse
  // to one column for tablet too, driven by the `breakpoint` prop instead.
  const mobile = useResponsiveMobile(isMobile);
  const stacked = mobile || breakpoint === 'tablet';
  const isSplit = data.layout === 'split';
  const image = isSplit ? resolveMedia(data.image, mediaLibrary) : null;
  const buttonPrimary = resolveColor({ slot: 'primary' }, theme.colors);
  const restingButtonStyle = themedButtonStyle(theme.buttons, {
    primary: buttonPrimary,
    primaryText: resolveColor({ slot: 'primary_text' }, theme.colors),
  });
  const { style: buttonStyle, hoverHandlers } = useThemedButtonHover(theme.buttons, restingButtonStyle, buttonPrimary);

  const form = (
    <div className={isSplit ? 'space-y-5' : 'relative max-w-md space-y-3'}>
      <BlockStream
        sectionType="contact_form"
        blocks={blocks}
        theme={theme}
        mediaLibrary={mediaLibrary}
        blockCtx={blockCtx}
        className={isSplit ? 'flex flex-col gap-5' : 'flex flex-col gap-3'}
        // 'themed_form' is the same opt-in `context` mechanism hero_banner's
        // CTA typography uses (see blockRenderers.jsx) — a section's own
        // layout choice (here, 'split') decides whether its blocks resolve
        // recipe-driven styling; the default 'form_only' layout never passes
        // it, so it renders exactly as before.
        context={isSplit ? 'themed_form' : undefined}
      />
      <span className="inline-block text-sm" style={buttonStyle} {...hoverHandlers}>{data.button_label || t('sectionBuilder:sections.contactForm.sendButton')}</span>
    </div>
  );

  if (!isSplit) {
    return <StorefrontContainer as="section" theme={theme}>{form}</StorefrontContainer>;
  }

  const imageFirst = data.image_position === 'left';
  const imageEl = (
    <div
      className="w-full overflow-hidden rounded-2xl"
      style={{ ...(stacked ? { aspectRatio: '1 / 1' } : { height: '600px' }), order: stacked ? 2 : imageFirst ? 1 : 2 }}
    >
      {image ? (
        <img src={image.url} alt="" className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gray-100 text-sm text-gray-300">{t('sectionBuilder:sections.common.noImage')}</div>
      )}
    </div>
  );

  return (
    <StorefrontContainer as="section" theme={theme}>
      <div
        className="grid items-center"
        style={{
          // Grid auto-placement follows order-modified document order, so
          // swapping visual order via `order` (below) also swaps which
          // track each side lands in — the wider 500px-min track needs to
          // stay with whichever side is visually first for `image_position:
          // 'left'` to get the same minimum width Houzez's image gets.
          gridTemplateColumns: stacked
            ? '1fr'
            : imageFirst
              ? 'minmax(500px, 1fr) minmax(400px, 1fr)'
              : 'minmax(400px, 1fr) minmax(500px, 1fr)',
          gap: stacked ? '32px' : '64px',
        }}
      >
        <div style={{ order: stacked ? 1 : imageFirst ? 2 : 1 }}>{form}</div>
        {imageEl}
      </div>
    </StorefrontContainer>
  );
}

export default memo(ContactFormRenderer);
