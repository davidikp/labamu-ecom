import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import catalog from '../../mocks/catalog.json';
import EditableText from '../../ui/EditableText';
import { resolveMedia } from '../../ui/fields/imageValue';
import { HEADING_SIZE_CLASS } from '../shared/headingSize';
import { ASPECT_RATIO_CLASS } from '../shared/imageAspectRatio';
import { useResponsiveMobile } from '../shared/useResponsiveMobile';

const COLS_CLASS = { '1': 'grid-cols-1', '2': 'grid-cols-2', '3': 'grid-cols-3', '4': 'grid-cols-4' };

// TODO(catalog integration): sourced from the static mock fixture — swap for
// a real collections API once one exists.
//
// `data.collections` is a repeater where each item picks its own source:
// a real catalog collection (by handle) or fully custom title/image/url —
// resolved here into one normalized { id, name, image, url } shape so the
// render branches below don't need to care which it was.
// Empty/unset falls back to "show everything" in the catalog — the
// original, pre-picker behavior — so sections saved before this field
// existed don't suddenly render nothing.
function collectionsForSection(data, mediaLibrary) {
  const items = data.collections ?? [];
  if (!items.length) return catalog.collections;
  return items
    .map((item) => {
      if (item.source === 'custom') {
        // `item.image` is normally `{mediaId}` (merchant-uploaded), but also
        // tolerates a plain public-asset path string (e.g. a theme seeding
        // catalog.json's own `/assets/catalog/categories/tops.png` rather
        // than duplicating it into that theme's own media library) — same
        // convention category_grid's own icon_image resolution and
        // productSource.js's resolveImageValue already use.
        const image = typeof item.image === 'string' ? item.image : resolveMedia(item.image, mediaLibrary)?.url ?? null;
        return { id: item.id, name: item.title, image, url: item.url };
      }
      const collection = catalog.collections.find((c) => c.handle === item.handle);
      return collection ? { id: item.id, name: collection.name, image: collection.image, url: `/collections/${collection.handle}` } : null;
    })
    .filter(Boolean);
}

function CollectionListRenderer({ data, onEdit, isMobile, breakpoint, mediaLibrary, theme, onNavigate }) {
  const { t } = useTranslation();
  const mobile = useResponsiveMobile(isMobile);
  const collections = collectionsForSection(data, mediaLibrary);
  // Theme-driven, like ProductCard — was hardcoded rounded-2xl regardless of
  // theme.layout.image_corners, so e.g. Xinear's sharp-corner reference
  // (image_corners: 0) never actually got sharp collection thumbnails. `?? 16`
  // matches rounded-2xl's own 16px exactly, so a theme that doesn't override
  // image_corners sees zero change.
  const circularImageRadius = `${theme?.layout?.image_corners ?? 16}px`;
  // See map_embed/testimonials/etc Renderer.jsx — the builder/preview canvas
  // simulates each device as a fixed-width frame inside a real (usually
  // wide) browser, so this reads the `breakpoint` prop Canvas.jsx already
  // passes down rather than a CSS breakpoint. Only meaningful for 'cards' —
  // 'circular' wraps naturally via flexbox, no fixed column count.
  const columns = mobile
    ? data.columns_mobile ?? '2'
    : breakpoint === 'tablet'
      ? data.columns_tablet ?? '3'
      : data.columns_desktop ?? '3';
  const colsClass = COLS_CLASS[columns] ?? 'grid-cols-2';
  const headingSizeClass = HEADING_SIZE_CLASS[data.heading_size] ?? HEADING_SIZE_CLASS.medium;
  const aspectClass = ASPECT_RATIO_CLASS[data.image_aspect_ratio] ?? ASPECT_RATIO_CLASS.square;

  return (
    <section className="px-6">
      {data.show_heading !== false && (
        // No `text-gray-900` — see featured_products/Renderer.jsx's
        // identical fix; this section renders inside the same SectionShell-
        // provided inherited text color.
        onEdit ? (
          <EditableText
            as="h2"
            className={`mb-6 font-semibold ${headingSizeClass}`}
            value={data.heading}
            placeholder={t('sectionBuilder:sections.collectionList.defaultHeading')}
            onCommit={(v) => onEdit('heading', v)}
          />
        ) : (
          <h2 className={`mb-6 font-semibold ${headingSizeClass}`}>{data.heading || t('sectionBuilder:sections.collectionList.defaultHeading')}</h2>
        )
      )}
      {data.display_style === 'pills' ? (
        // Rounded-rectangle bar of text-only labels (24px corners, NOT a
        // full stadium/pill shape) — Barger's Figma category strip (node
        // 96:114743's "Border" row is literally `rounded-[24px]` on an 86px
        // bar, read directly off the design-context export). `justify-between`
        // unconditionally (not a `sm:` breakpoint, which — same pitfall as
        // every other Renderer's own doc comments — never reflects the
        // builder's simulated device frame) spreads the items edge-to-edge
        // on wide layouts; `mobile` collapses to wrapped/centered instead.
        // Explicit theme-resolved bg/text (not inherited `color:
        // scheme.text`), since this bar is its own visually distinct
        // surface against the section's own background.
        <div
          className={`flex flex-wrap items-center gap-2 rounded-3xl px-6 py-7 ${mobile ? 'justify-center' : 'justify-between'}`}
          style={{ backgroundColor: theme?.colors?.surface }}
        >
          {collections.map((collection) => (
            <a
              key={collection.id}
              href={collection.url || undefined}
              onClick={
                onNavigate && collection.url
                  ? (e) => { e.preventDefault(); onNavigate(collection.url); }
                  : (e) => e.preventDefault()
              }
              className="whitespace-nowrap px-4 py-2 text-base font-semibold"
              style={{ color: theme?.colors?.text_primary }}
            >
              {collection.name}
            </a>
          ))}
        </div>
      ) : data.display_style === 'circular' ? (
        // Xinear-style compact icon-shortcut row — a single edge-to-edge
        // row of rounded-square thumbnails (not full circles; Figma's
        // reference uses 190x190 rounded squares). columns_desktop,
        // columns_mobile, and image_aspect_ratio are intentionally ignored
        // here, they only apply to the 'cards' display style.
        // `sm:` (a real, ≥640px browser-width media query) doesn't reflect
        // the builder canvas's simulated device frame — see
        // useResponsiveMobile.js — so this reads the same `mobile` boolean
        // used above instead of a CSS breakpoint.
        <div className={`flex flex-wrap justify-center gap-6 ${mobile ? '' : 'justify-between'}`}>
          {collections.map((collection) => (
            <a
              key={collection.id}
              href={collection.url || undefined}
              // Was a plain `<div>` — no link, no click handler at all, so
              // every collection tile here was inert regardless of theme.
              // Same real-navigation-vs-inert-in-the-builder convention
              // category_grid/header/footer nav links already use: a bare
              // `href` alone would do a real full-page browser navigation
              // this preview/live storefront only ever resolves client-side.
              onClick={
                onNavigate && collection.url
                  ? (e) => { e.preventDefault(); onNavigate(collection.url); }
                  : (e) => e.preventDefault()
              }
              className={`flex flex-col items-center gap-2 ${mobile ? 'w-20' : 'w-auto flex-1'}`}
            >
              {/* Theme-resolved, not hardcoded `bg-gray-100 text-gray-300`/
                  `text-gray-900` — same fix as ProductCard's image
                  placeholder / featured_products' heading. */}
              <div
                className={`flex aspect-square items-center justify-center overflow-hidden ${theme?.colors?.surface ? '' : 'bg-gray-100 text-gray-300'} ${mobile ? 'w-20' : 'w-full'}`}
                style={{ borderRadius: circularImageRadius, backgroundColor: theme?.colors?.surface, color: theme?.colors?.text_secondary }}
              >
                {collection.image ? (
                  <img src={collection.image} alt={collection.name} className="h-full w-full object-cover" />
                ) : (
                  t('sectionBuilder:sections.common.noImage')
                )}
              </div>
              {data.show_collection_title !== false && (
                <p className={`text-center text-sm font-medium ${theme?.colors?.text_primary ? '' : 'text-gray-900'}`} style={{ color: theme?.colors?.text_primary }}>{collection.name}</p>
              )}
            </a>
          ))}
        </div>
      ) : (
        <div className={`grid gap-4 ${colsClass}`}>
          {collections.map((collection) => (
            <a
              key={collection.id}
              href={collection.url || undefined}
              onClick={
                onNavigate && collection.url
                  ? (e) => { e.preventDefault(); onNavigate(collection.url); }
                  : (e) => e.preventDefault()
              }
              className="block"
            >
              <div
                className={`mb-2 flex items-center justify-center overflow-hidden rounded-md ${theme?.colors?.surface ? '' : 'bg-gray-100 text-gray-300'} ${aspectClass}`}
                style={{ backgroundColor: theme?.colors?.surface, color: theme?.colors?.text_secondary }}
              >
                {collection.image ? (
                  <img src={collection.image} alt={collection.name} className="h-full w-full object-cover" />
                ) : (
                  t('sectionBuilder:sections.common.noImage')
                )}
              </div>
              {data.show_collection_title !== false && (
                <p className={`text-sm font-medium ${theme?.colors?.text_primary ? '' : 'text-gray-900'}`} style={{ color: theme?.colors?.text_primary }}>{collection.name}</p>
              )}
            </a>
          ))}
        </div>
      )}
    </section>
  );
}

export default memo(CollectionListRenderer);
