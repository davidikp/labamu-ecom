import { memo } from 'react';
import { Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import EditableText from '../../ui/EditableText';
import BlockBoundary from '../../ui/BlockBoundary';
import BlockStream from '../../ui/BlockStream';
import AddBlockControl from '../../ui/AddBlockControl';
import StorefrontContainer from '../../ui/primitives/StorefrontContainer';
import { HEADING_SIZE_CLASS, DISPLAY_HEADING_CLASS } from '../shared/headingSize';
import { themedCardStyle } from '../shared/themedLayout';
import { useResponsiveMobile } from '../shared/useResponsiveMobile';

const COLS_CLASS = { '2': 'grid-cols-2', '3': 'grid-cols-3' };
// Default falls back to the previous hardcoded value (a universally-recognised
// rating color) when a theme doesn't set `colors.rating` — themes opt into a
// different star color (e.g. Houzez's golden-reference #FACC15) via that
// token instead of this default ever changing globally.
const DEFAULT_STAR_COLOR = '#F59E0B';

function TestimonialsRenderer({ data, blocks = [], theme, mediaLibrary, onEdit, blockCtx, isMobile, breakpoint }) {
  const { t } = useTranslation();
  // The builder/preview canvas simulates each device as a fixed-width frame
  // inside a real (usually wide) browser, so a `sm:`/`md:` Tailwind
  // breakpoint never reflects the selected device there (see
  // useResponsiveMobile.js, and the same fix already applied to
  // map_embed/contact_form's Renderer). Collapse to one column for mobile
  // and tablet, driven by the `breakpoint`/`isMobile` props instead of CSS.
  const mobile = useResponsiveMobile(isMobile);
  const stacked = mobile || breakpoint === 'tablet';
  const colsClass = stacked ? 'grid-cols-1' : (COLS_CLASS[data.columns_desktop] ?? COLS_CLASS['3']);
  const starColor = theme?.colors?.rating ?? DEFAULT_STAR_COLOR;
  const quotes = blocks.filter((b) => b.type === 'quote');
  const genericBlocks = blocks.filter((b) => b.type !== 'quote');
  const isDisplayHeading = data.heading_size === 'display';
  // 'display' swaps in its own weight/leading wholesale (see headingSize.js)
  // instead of composing with the shared `font-semibold` + size-class idiom
  // every other heading_size step uses — and gets golden's 32px bottom
  // margin (mb-8) instead of the shared mb-6, scoped to this section only.
  const headingAlignClass = data.heading_align === 'center' ? 'text-center' : '';
  // No `text-gray-900` here (unlike before) — SectionShell already sets an
  // inherited `color: scheme.text` on this section's own wrapper (see
  // ui/SectionShell.jsx/resolveSectionScheme), which a hardcoded gray class
  // would otherwise override and render illegibly dark on a dark-background
  // theme like Barger.
  const headingClass = isDisplayHeading
    ? `mb-8 ${DISPLAY_HEADING_CLASS} ${headingAlignClass}`
    : `mb-6 font-semibold ${HEADING_SIZE_CLASS[data.heading_size] ?? HEADING_SIZE_CLASS.medium} ${headingAlignClass}`;
  // Only the radius comes from the theme's card recipe — `card_shadow` is a
  // hover-affordance token meant for clickable product cards (see
  // shared/ProductCard.jsx), not a resting testimonial card; applying it
  // here unconditionally doesn't match any theme's actual card design
  // (the golden reference's testimonial cards have a border only, no shadow).
  const { borderRadius } = themedCardStyle(theme?.layout);
  const nameFirst = data.card_hierarchy === 'name_first';
  const bodyColor = theme?.colors?.text_secondary;
  // Card fill/border both read off `colors.surface` (node 96:126580's own
  // `bg-[#262522]`/`border-[#262522]` — one shade up from the section's own
  // `#1b1916` page background, fill and border the same color so the
  // border itself is invisible but the card still reads as a raised tile),
  // not a distinct light "bg-white" panel like this previously hardcoded
  // regardless of theme (fine for Houzez/Xinear's own white page
  // background, illegible as a light box on Barger's dark one). Falls back
  // to the original white/gray-200 when no theme is passed, so a bare unit
  // test render is unchanged.
  const cardBg = theme?.colors?.surface;
  const cardBorder = theme?.colors?.surface ?? theme?.colors?.border;

  return (
    <StorefrontContainer as="section" theme={theme}>
      {data.show_heading !== false &&
        (onEdit ? (
          <EditableText
            as="h2"
            className={headingClass}
            value={data.heading}
            placeholder={t('sectionBuilder:sections.testimonials.defaultHeading')}
            onCommit={(v) => onEdit('heading', v)}
          />
        ) : (
          <h2 className={headingClass}>{data.heading || t('sectionBuilder:sections.testimonials.defaultHeading')}</h2>
        ))}

      {(genericBlocks.length > 0 || blockCtx) && (
        <BlockStream sectionType="testimonials" blocks={genericBlocks} theme={theme} mediaLibrary={mediaLibrary} blockCtx={blockCtx} hideAdd className="mb-6 flex flex-col gap-3" />
      )}

      {quotes.length === 0 && !blockCtx ? (
        <p className="text-sm text-gray-400">{t('sectionBuilder:sections.testimonials.emptyState')}</p>
      ) : (
        <div className={`grid gap-6 ${colsClass}`}>
          {quotes.map((b) => {
            const nameMutedClass = nameFirst ? '' : bodyColor ? 'text-xs font-medium' : 'text-xs font-medium text-gray-500';
            const nameEl = blockCtx ? (
              <EditableText
                className={nameFirst ? `mb-3 block text-base font-bold` : nameMutedClass}
                style={{ color: nameFirst ? theme?.colors?.text_primary : bodyColor }}
                value={b.data?.reviewer_name}
                placeholder={t('sectionBuilder:sections.testimonials.defaultAuthor')}
                onCommit={(v) => blockCtx.onEdit(b.id, 'reviewer_name', v)}
              />
            ) : (
              <p
                className={nameFirst ? 'mb-3 text-base font-bold' : nameMutedClass}
                style={{ color: nameFirst ? theme?.colors?.text_primary : bodyColor }}
              >
                {b.data?.reviewer_name || t('sectionBuilder:sections.testimonials.defaultAuthor')}
              </p>
            );
            const quoteEl = blockCtx ? (
              <EditableText
                as="p"
                multiline
                className="mb-2 text-sm text-gray-700"
                style={{ color: bodyColor }}
                value={b.data?.quote}
                placeholder={t('sectionBuilder:sections.testimonials.defaultQuote')}
                onCommit={(v) => blockCtx.onEdit(b.id, 'quote', v)}
              />
            ) : (
              <p className="mb-2 text-sm text-gray-700" style={{ color: bodyColor }}>
                "{b.data?.quote || t('sectionBuilder:sections.testimonials.defaultQuote')}"
              </p>
            );
            return (
              <BlockBoundary
                key={b.id}
                selected={blockCtx?.selectedBlockId === b.id}
                onSelect={blockCtx ? () => blockCtx.onSelect(b.id) : undefined}
                label={t('sectionBuilder:sections.testimonials.blockLabel', 'Testimonial')}
              >
                <div
                  className={`h-full border p-6 ${cardBg ? '' : 'border-gray-200 bg-white'}`}
                  style={{ borderRadius, backgroundColor: cardBg, borderColor: cardBorder }}
                >
                  <div className="mb-4 flex gap-1" style={{ color: starColor }}>
                    {Array.from({ length: Number(b.data?.star_rating ?? 5) }).map((_, i) => (
                      <Star key={i} size={24} fill={starColor} stroke={starColor} />
                    ))}
                  </div>
                  {nameFirst ? (
                    <>
                      {nameEl}
                      {quoteEl}
                    </>
                  ) : (
                    <>
                      {quoteEl}
                      {nameEl}
                    </>
                  )}
                </div>
              </BlockBoundary>
            );
          })}
        </div>
      )}

      {blockCtx && (blockCtx.selectedBlockId || blockCtx.sectionActive) && !blockCtx.atMax && (
        <div className="mt-4"><AddBlockControl sectionType="testimonials" atMax={false} onAdd={(ty) => blockCtx.onAdd(ty)} variant="canvas" /></div>
      )}
    </StorefrontContainer>
  );
}

export default memo(TestimonialsRenderer);
