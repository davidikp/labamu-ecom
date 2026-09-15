import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import EditableText from '../../ui/EditableText';
import StorefrontContainer from '../../ui/primitives/StorefrontContainer';
import { ASPECT_RATIO_CLASS } from '../shared/imageAspectRatio';
import { EDITORIAL_COLLECTIONS, buildEditorialCollectionPath } from '../shared/editorialCollections';

/** Desktop/tablet/mobile column class, following catalog_list/collection_list's
 * canonical `breakpoint`-first pattern (see catalog_list/Renderer.jsx), with a
 * Tailwind responsive fallback for a real, un-framed browser viewport. Editorial
 * cards favor a predictable grid over masonry, per this feature's MVP scope.
 * 2 columns is the deliberate default at every tier down to tablet — this is
 * an editorial index, not a dense inventory grid, so image presence matters
 * more than fitting extra cards above the fold (see schema.js). */
function resolveGridColsClass(breakpoint, columnsDesktop) {
  const desktopCols = [2, 3].includes(columnsDesktop) ? columnsDesktop : 2;
  if (breakpoint === 'mobile') return 'grid-cols-1';
  if (breakpoint === 'tablet') return 'grid-cols-2';
  if (breakpoint === 'desktop' || breakpoint === 'largeDesktop' || breakpoint === 'fit') return `grid-cols-${desktopCols}`;
  return `grid-cols-1 md:grid-cols-2 lg:grid-cols-${desktopCols}`;
}

/**
 * A single editorial Collection card — image-led, editorial hierarchy
 * (image, title, optional subtitle), deliberately with no commerce UI
 * (price/cart/rating) per this feature's spec. Rendered as a real `<a href>`
 * (not a clickable `<div>`/`<button>`) so it's both keyboard-reachable with a
 * visible focus ring AND exposed to assistive tech/browsers as an actual
 * link (e.g. "open in new tab") — mirrors footer/header nav links'
 * onNavigate pattern exactly (see footer/Renderer.jsx's `renderLink`):
 * a real anchor with `preventDefault` + `onNavigate` outside the builder,
 * degrading to inert (non-interactive) markup with no onNavigate at all
 * (interactive builder canvas, editing the section itself).
 */
function CollectionCard({ collection, aspectClass, onNavigate }) {
  const { t } = useTranslation();
  const href = buildEditorialCollectionPath(collection.slug);
  const content = (
    <>
      <div className={`relative mb-4 overflow-hidden bg-gray-100 text-gray-300 ${aspectClass}`}>
        {collection.coverImage ? (
          <img
            src={collection.coverImage}
            alt={collection.coverImageAlt || collection.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:transform-none"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">{t('sectionBuilder:sections.common.noImage')}</div>
        )}
      </div>
      <span className="block text-xl font-semibold text-gray-900 transition-colors group-hover:text-gray-600">{collection.title}</span>
      {collection.subtitle && <span className="mt-1 block text-sm text-gray-500">{collection.subtitle}</span>}
    </>
  );

  if (!onNavigate) {
    // Inert in the interactive builder canvas — no href to navigate to
    // there, so a plain block keeps the section's own click/select handling
    // from being shadowed by a real anchor.
    return <div className="group flex flex-col text-left">{content}</div>;
  }

  return (
    <a
      href={href}
      onClick={(e) => {
        e.preventDefault();
        onNavigate(href);
      }}
      className="group flex flex-col text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--sb-accent,#006BFF)]"
    >
      {content}
    </a>
  );
}

function EditorialCollectionListRenderer({ data, onEdit, theme, breakpoint, onNavigate }) {
  const { t } = useTranslation();
  const columnsDesktop = Number(data.columns_desktop) || 2;
  const gridColsClass = resolveGridColsClass(breakpoint, columnsDesktop);
  // Landscape is the deliberate default (not square) — a wider frame reads
  // closer to an editorial portfolio thumbnail than a commerce product tile.
  const aspectClass = ASPECT_RATIO_CLASS[data.image_aspect_ratio] ?? ASPECT_RATIO_CLASS.landscape;
  const alignClass = data.heading_alignment === 'center' ? 'text-center items-center' : 'text-left items-start';
  const collections = EDITORIAL_COLLECTIONS;

  return (
    <section>
      <StorefrontContainer theme={theme} maxWidth>
        {data.show_heading !== false && (
          <div className={`mb-16 flex flex-col gap-4 ${alignClass}`}>
            {onEdit ? (
              <EditableText as="h2" className="text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl" value={data.heading} placeholder="Our Collections" onCommit={(v) => onEdit('heading', v)} />
            ) : (
              // h2, matching catalog_list/product_detail's own main-heading
              // level (see catalog_list/Renderer.jsx) — this codebase has no
              // page-level <h1> in any section renderer today, so h2 keeps
              // this section consistent with its sibling system pages
              // rather than introducing a one-off <h1> found nowhere else.
              <h2 className="text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">{data.heading || 'Our Collections'}</h2>
            )}
            {onEdit ? (
              <EditableText as="p" className="max-w-xl text-base leading-relaxed text-gray-500" value={data.description} placeholder="Optional description" onCommit={(v) => onEdit('description', v)} multiline />
            ) : (
              data.description && <p className="max-w-xl text-base leading-relaxed text-gray-500">{data.description}</p>
            )}
          </div>
        )}

        {collections.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-sm text-gray-400">{t('sectionBuilder:sections.common.noImage', 'No collections available')}</p>
          </div>
        ) : (
          <div className={`grid gap-x-8 gap-y-16 sm:gap-y-20 ${gridColsClass}`} data-testid="editorial-collection-grid">
            {collections.map((collection) => (
              <CollectionCard key={collection.id} collection={collection} aspectClass={aspectClass} onNavigate={onNavigate} />
            ))}
          </div>
        )}
      </StorefrontContainer>
    </section>
  );
}

export default memo(EditorialCollectionListRenderer);
