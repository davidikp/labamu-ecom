import { memo } from 'react';
import { ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { resolveColor } from '../../ui/fields/colorValue';
import { themedButtonStyle, themedButtonHoverStyle } from '../shared/themedButtonStyle';
import ThemedButtonHover from '../shared/ThemedButtonHover';
import StorefrontContainer from '../../ui/primitives/StorefrontContainer';
import { EDITORIAL_COLLECTIONS } from '../shared/editorialCollections';
import { groupGalleryRows } from '../shared/galleryRhythm';

function GalleryImage({ src, alt, caption, className = '' }) {
  const { t } = useTranslation();
  return (
    <figure className="m-0">
      <div className={`overflow-hidden bg-gray-100 text-gray-300 ${className}`}>
        {src ? (
          <img src={src} alt={alt || ''} loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center aspect-[4/3]">{t('sectionBuilder:sections.common.noImage')}</div>
        )}
      </div>
      {/* Caption is independent of `alt` — alt serves accessibility (always
          present, never shown), caption is optional visible editorial text.
          Restrained: small, muted, left-aligned, no overlay on the image. */}
      {caption && <figcaption className="mt-3 max-w-md text-left text-sm text-gray-500">{caption}</figcaption>}
    </figure>
  );
}

/** A mid-story editorial text moment (see schema/shared/editorialCollections.js's
 * `storyBlocks`) — a deliberate pause in the gallery, not a UI callout: same
 * constrained reading width as the introduction, generous whitespace above/
 * below, no card/border/background of its own. */
function StoryBlock({ block }) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 text-left">
      {block.title && <h3 className="text-2xl font-semibold tracking-tight text-gray-900">{block.title}</h3>}
      {(block.body ?? []).map((paragraph, i) => (
        <p key={i} className="text-base leading-relaxed text-gray-700">{paragraph}</p>
      ))}
    </div>
  );
}

/** Alternating full-width / two-column rows (see shared/galleryRhythm.js's
 * `groupGalleryRows`). Pair rows alternate which side is portrait vs.
 * landscape using each row's own `pairIndex` (not the overall row index,
 * since full rows sit between pairs, and not a mutable counter during
 * render) so consecutive pairs don't all mirror the same composition. This
 * is the one deliberately opinionated editorial rhythm the template uses —
 * not a merchant-configurable choice among several gallery layouts. */
function GalleryRows({ rows }) {
  return (
    <>
      {rows.map((row, rowIndex) => {
        if (row.type === 'full') {
          const image = row.items[0];
          return <GalleryImage key={rowIndex} src={image.src} alt={image.alt} caption={image.caption} className="aspect-[21/9]" />;
        }
        const isEvenPairRow = row.pairIndex % 2 === 0;
        return (
          <div key={rowIndex} className="grid grid-cols-1 gap-10 sm:gap-14 md:grid-cols-2 md:gap-6">
            {row.items.map((image, i) => {
              const isPortraitSlot = isEvenPairRow ? i === 1 : i === 0;
              return (
                <GalleryImage key={image.src ?? i} src={image.src} alt={image.alt} caption={image.caption} className={isPortraitSlot ? 'aspect-[3/4]' : 'aspect-[4/3]'} />
              );
            })}
          </div>
        );
      })}
    </>
  );
}

/**
 * @module section-builder/sections/editorial_collection_detail/Renderer
 * @description The single, shared "Collection story" template every
 * editorial Collection renders through (see schema.js). `collection` is
 * resolved by the caller (EditorialCollectionDetailPage.jsx) from the
 * route's `:slug`, exactly like product_detail's `product` prop; when no
 * `collection` prop is given at all (the interactive builder canvas editing
 * the Editorial Collection Detail system page in the abstract, with no
 * specific slug in the URL), this falls back to the first mock collection
 * purely so there is something to preview/style against — never used on the
 * real routed path, which always either has a resolved collection or
 * renders a Not Found state instead of this component.
 */
function EditorialCollectionDetailRenderer({ data, theme, collection: collectionProp, onNavigate }) {
  const { t } = useTranslation();
  const collection = collectionProp ?? EDITORIAL_COLLECTIONS[0] ?? null;

  if (!collection) {
    return (
      <section className="px-6 py-16 text-center text-sm text-gray-500">
        {t('sectionBuilder:sections.common.noImage', 'No collection available')}
      </section>
    );
  }

  const ctaPrimary = resolveColor({ slot: 'primary' }, theme?.colors);
  const ctaButtonStyle = themedButtonStyle(theme?.buttons ?? {}, { primary: ctaPrimary, primaryText: resolveColor({ slot: 'primary_text' }, theme?.colors) });
  const ctaButtonHoverStyle = themedButtonHoverStyle(theme?.buttons ?? {}, ctaButtonStyle, ctaPrimary);

  const usesFirstGalleryImageAsHero = !collection.coverImage && Boolean(collection.images?.[0]);
  const heroImage = collection.coverImage ?? collection.images?.[0]?.src ?? null;
  const heroAlt = collection.coverImage ? collection.coverImageAlt : collection.images?.[0]?.alt;
  // Never repeat the hero image in the gallery below it — when there's no
  // dedicated coverImage and the hero borrowed gallery image 0, the gallery
  // starts from image 1 instead of showing that same photo twice.
  const galleryImages = usesFirstGalleryImageAsHero ? (collection.images ?? []).slice(1) : (collection.images ?? []);
  const rows = groupGalleryRows(galleryImages);
  // Story blocks sit inside the gallery rhythm at a fixed, deterministic
  // point — never merchant-positioned. With one block it lands after the
  // first two rows (a full image + its following pair, i.e. one full
  // "chapter" of imagery); with a second block, the remaining rows are
  // split the same way. A short gallery (<=2 rows) just shows all its rows
  // before any story block rather than splitting an already-short rhythm.
  const storyBlocks = (collection.storyBlocks ?? []).filter((block) => block?.body?.length);
  const firstRows = rows.slice(0, Math.min(2, rows.length));
  const secondRows = rows.slice(firstRows.length, storyBlocks.length > 1 ? firstRows.length + 2 : undefined);
  const remainingRows = rows.slice(firstRows.length + secondRows.length);
  const cta = collection.cta;
  const showCta = data.show_cta !== false && cta?.enabled && cta?.label;
  const ctaHref = cta?.href || '#';

  const handleNavigate = (path) => {
    if (!onNavigate) return; // inert in the interactive builder
    onNavigate(path);
  };

  return (
    <section className="bg-white">
      <StorefrontContainer theme={theme} maxWidth>
        {/* Breadcrumb: Home > Collection > {collection title} — same
            treatment as product_detail's own breadcrumb (a real
            ChevronRight icon, uniform gray-500 text-sm for every crumb
            including the current page), this page's own equivalent was
            simply missing entirely. */}
        <div className="mb-4 flex items-center gap-1 text-sm text-gray-500">
          <button
            type="button"
            onClick={() => handleNavigate('/')}
            className={onNavigate ? 'cursor-pointer hover:underline' : 'cursor-default'}
          >
            {t('sectionBuilder:sections.editorialCollectionDetail.home', 'Home')}
          </button>
          <ChevronRight size={16} className="shrink-0" aria-hidden />
          <button
            type="button"
            onClick={() => handleNavigate('/collection')}
            className={onNavigate ? 'cursor-pointer hover:underline' : 'cursor-default'}
          >
            {t('sectionBuilder:sections.editorialCollectionDetail.collectionList', 'Collection')}
          </button>
          <ChevronRight size={16} className="shrink-0" aria-hidden />
          <span>{collection.title}</span>
        </div>

        {/* 1. Collection introduction — an editorial reading width (~672px,
            Tailwind's max-w-2xl) rather than stretching across the whole
            page, so long-form copy stays comfortable to scan. */}
        <div className="mx-auto flex max-w-2xl flex-col gap-5 text-center">
          {/* h2, matching catalog_list/product_detail's own main-heading
              level — no section renderer in this codebase uses <h1> today
              (see editorial_collection_list/Renderer.jsx for the same note),
              so this stays consistent with its sibling system pages rather
              than introducing a one-off heading level found nowhere else. */}
          <h2 className="text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">{collection.title}</h2>
          {data.show_subtitle !== false && collection.subtitle && (
            <p className="text-lg text-gray-500">{collection.subtitle}</p>
          )}
          {data.show_description !== false && collection.description && (
            <div className="mt-3 flex flex-col gap-5 text-left text-base leading-relaxed text-gray-700">
              {collection.description
                .split('\n')
                .map((paragraph) => paragraph.trim())
                .filter(Boolean)
                .map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
            </div>
          )}
        </div>

        {/* 2. Hero / primary image — the collection's one clear visual
            moment: a wide, deliberately larger frame than any gallery image,
            with generous whitespace on both sides so it isn't immediately
            crowded by the gallery below. */}
        <div className="mt-16 sm:mt-24">
          <GalleryImage src={heroImage} alt={heroAlt || collection.title} className="aspect-[21/9] w-full" />
        </div>

        {/* 3. Collection gallery — one opinionated full/pair rhythm (see
            GalleryRows), with any story blocks woven in at fixed points
            rather than a merchant-chosen alternate layout. */}
        {rows.length > 0 && (
          <div className="mt-16 flex flex-col gap-10 sm:mt-24 sm:gap-14" data-testid="editorial-collection-gallery">
            <GalleryRows rows={firstRows} />
            {storyBlocks[0] && <StoryBlock block={storyBlocks[0]} />}
            <GalleryRows rows={secondRows} />
            {storyBlocks[1] && <StoryBlock block={storyBlocks[1]} />}
            <GalleryRows rows={remainingRows} />
          </div>
        )}

        {/* 4. Optional CTA — a real link (not a `<button>`), matching this
            codebase's header/footer nav-link pattern exactly (see
            footer/Renderer.jsx's `renderLink`): a real anchor with
            `preventDefault` + `onNavigate` outside the builder, degrading to
            an inert `<span>` (not just a dead href) in the interactive
            builder canvas where there's no real navigation to perform. The
            conclusion of the story, not an ecommerce banner, so no reserved
            space at all when disabled/absent. */}
        {showCta && (
          <div className="mt-16 flex justify-center sm:mt-24">
            {onNavigate ? (
              <ThemedButtonHover
                as="a"
                href={ctaHref}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate(cta.href);
                }}
                style={ctaButtonStyle}
                hoverStyle={ctaButtonHoverStyle}
                className="cursor-pointer"
              >
                {cta.label}
              </ThemedButtonHover>
            ) : (
              <ThemedButtonHover style={ctaButtonStyle} hoverStyle={ctaButtonHoverStyle} className="cursor-default">
                {cta.label}
              </ThemedButtonHover>
            )}
          </div>
        )}
      </StorefrontContainer>
    </section>
  );
}

export default memo(EditorialCollectionDetailRenderer);
