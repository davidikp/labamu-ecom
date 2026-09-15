import { memo } from 'react';
import { ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import EditableText from '../../ui/EditableText';
import StorefrontContainer from '../../ui/primitives/StorefrontContainer';
import { resolveMedia } from '../../ui/fields/imageValue';
import ProductCard from '../shared/ProductCard';
import { buildShopPath, resolveStorefrontProducts } from '../shared/productSource';
import { HEADING_SIZE_CLASS } from '../shared/headingSize';
import { ASPECT_RATIO_CLASS } from '../shared/imageAspectRatio';
import { useResponsiveMobile } from '../shared/useResponsiveMobile';
import catalog from '../../mocks/catalog.json';

const COLS_CLASS = { '1': 'grid-cols-1', '2': 'grid-cols-2', '3': 'grid-cols-3', '4': 'grid-cols-4', '5': 'grid-cols-5', '6': 'grid-cols-6' };

// Fixed card width for the horizontal-scroll mobile layout — matches the
// golden-reference Houzez product row (140px cards, scroll-snapped).
const SCROLL_CARD_WIDTH = { width: '140px', flexShrink: 0, scrollSnapAlign: 'start' };

function deriveCategory(product) {
  return product.category || 'General';
}

function groupProductsByCategory(products) {
  const groups = [];
  const indexByCategory = new Map();
  for (const product of products) {
    const category = deriveCategory(product);
    if (!indexByCategory.has(category)) {
      indexByCategory.set(category, groups.length);
      groups.push({ category, products: [] });
    }
    groups[indexByCategory.get(category)].products.push(product);
  }
  return groups;
}

/** `collectionHandle` (the Collection Detail page's own `/collections/
 * :handle` route param — see Canvas.jsx/ThemePreview.jsx/PreviewLive.jsx's
 * own doc comments) resolves this section into showing exactly that one
 * catalog collection's own products/name, overriding whatever `data.products`
 * /heading the section was otherwise configured with. Without this, the
 * Collection Detail page rendered byte-identical, unfiltered content for
 * every collection regardless of which one was actually clicked — the route
 * param existed but nothing ever consumed it. `catalog.json` is the same
 * source `collection_list`'s own `collectionsForSection` reads real
 * collections from (see its doc comment) — not Xinear/Houzez-specific
 * itself, just whichever theme's demo/real catalog happens to be in play
 * (Houzez has none, so its own collection links never resolve one here). */
function resolveCollection(collectionHandle, theme, mediaLibrary) {
  if (!collectionHandle) return null;
  const collection = catalog.collections.find((c) => c.handle === collectionHandle);
  if (!collection) return null;
  const idSet = new Set(collection.productIds ?? []);
  const products = resolveStorefrontProducts(theme, mediaLibrary).filter((p) => idSet.has(p.id));
  return { collection, products };
}

/** Resolves each item through `resolveStorefrontProducts` (the same
 * normalization/handle-assignment product_detail's PDP and catalog_list's
 * Shop page use — see productSource.js) rather than a separately hand-
 * rolled shape, so a card built here always carries a real `handle` and
 * `category` a click/"See All" link can use, and always matches the exact
 * product a click actually resolves to. A `source: 'custom'` item not
 * found there (a merchant's own ad-hoc entry, not part of
 * `theme.productCatalog`) falls back to the original minimal shape — it
 * has no PDP page to link to, so it simply renders non-clickable (see
 * ProductCard's own `product.handle`-gated click handler). */
function productsForSection(data, theme, mediaLibrary) {
  const items = data.products ?? [];
  const resolved = resolveStorefrontProducts(theme, mediaLibrary);
  if (!items.length) return resolved.slice(0, 4);
  return items
    .map((item) => {
      if (item.source === 'custom') {
        return (
          resolved.find((p) => p.id === item.id) ?? {
            id: item.id, name: item.title, image: resolveMedia(item.image, mediaLibrary)?.url ?? null, price: item.price || '', compareAtPrice: null, stock: 1,
          }
        );
      }
      return resolved.find((p) => p.id === item.product_id) ?? null;
    })
    .filter(Boolean);
}

/** Renders one row of product cards, either as a wrapping grid or — when
 * `mobile` and `mobile_layout === 'horizontal_scroll'` — a single
 * scroll-snapped row (golden-reference Houzez mobile behavior). */
function ProductRow({ products, theme, data, aspectClass, colsClass, mobile, horizontalScroll, onNavigate }) {
  if (mobile && horizontalScroll) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} theme={theme} showPrice={data.show_price} showQuickAdd={data.show_quick_add} aspectClass={aspectClass} widthStyle={SCROLL_CARD_WIDTH} onNavigate={onNavigate} />
        ))}
      </div>
    );
  }
  return (
    <div className={`grid gap-4 ${colsClass}`}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} theme={theme} showPrice={data.show_price} showQuickAdd={data.show_quick_add} aspectClass={aspectClass} onNavigate={onNavigate} />
      ))}
    </div>
  );
}

/** `category` is the Shop-page category this row's own "See All" should
 * pre-filter to (derived from its own products/group — see
 * FeaturedProductsRenderer below); `undefined` renders inert (no
 * `onNavigate`, e.g. the interactive builder canvas — matching header/
 * footer nav links' inert-in-the-builder convention) rather than a dead
 * link. */
function ViewAllLink({ label, theme, onClick }) {
  const primary = theme?.colors?.primary;
  const Tag = onClick ? 'button' : 'p';
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`flex shrink-0 items-center gap-1 text-sm font-semibold hover:underline ${primary ? '' : 'text-gray-700 underline'} ${onClick ? 'cursor-pointer' : ''}`}
      style={{ color: primary }}
    >
      {label} <ChevronRight size={16} strokeWidth={2.5} />
    </Tag>
  );
}

function FeaturedProductsRenderer({ data, onEdit, isMobile, breakpoint, mediaLibrary, theme, onNavigate, collectionHandle }) {
  const { t } = useTranslation();
  const mobile = useResponsiveMobile(isMobile);
  const collectionMatch = resolveCollection(collectionHandle, theme, mediaLibrary);
  const products = collectionMatch ? collectionMatch.products : productsForSection(data, theme, mediaLibrary);
  // See map_embed/testimonials/etc Renderer.jsx — the builder/preview canvas
  // simulates each device as a fixed-width frame inside a real (usually
  // wide) browser, so this reads the `breakpoint` prop Canvas.jsx already
  // passes down rather than a CSS breakpoint.
  const columns = mobile
    ? data.columns_mobile ?? '2'
    : breakpoint === 'tablet'
      ? data.columns_tablet ?? '3'
      : data.columns_desktop ?? '4';
  const colsClass = COLS_CLASS[columns] ?? 'grid-cols-2';
  const horizontalScroll = data.mobile_layout === 'horizontal_scroll';
  // A collection detail page is already the destination a "View all"/group
  // link would send you to, and its own products aren't grouped-by-category
  // sub-rows — both only apply to the section's ordinary (non-collection)
  // configuration.
  const groups = !collectionMatch && data.group_by_category ? groupProductsByCategory(products) : null;
  const headingSizeClass = HEADING_SIZE_CLASS[data.heading_size] ?? HEADING_SIZE_CLASS.medium;
  const aspectClass = ASPECT_RATIO_CLASS[data.image_aspect_ratio] ?? ASPECT_RATIO_CLASS.square;
  const viewAllLabel = data.view_all_label || t('sectionBuilder:sections.featuredProducts.viewAll');
  const showViewAll = !collectionMatch && data.show_view_all !== false;

  return (
    <StorefrontContainer as="section" theme={theme}>
      {(data.show_heading !== false || (!groups && showViewAll)) && (
        <div className="mb-6 flex items-center justify-between gap-4">
          {data.show_heading !== false ? (
            // No `text-gray-900` here (unlike before) — SectionShell already
            // sets an inherited `color: scheme.text` on this section's own
            // wrapper (see ui/SectionShell.jsx/resolveSectionScheme), which
            // a hardcoded gray class would otherwise override and render
            // illegibly dark on a dark-background theme like Barger.
            collectionMatch ? (
              <h2 className={`font-semibold ${headingSizeClass}`}>{collectionMatch.collection.name}</h2>
            ) : onEdit ? (
              <EditableText
                as="h2"
                className={`font-semibold ${headingSizeClass}`}
                value={data.heading}
                placeholder={t('sectionBuilder:sections.featuredProducts.defaultHeading')}
                onCommit={(v) => onEdit('heading', v)}
              />
            ) : (
              <h2 className={`font-semibold ${headingSizeClass}`}>{data.heading || t('sectionBuilder:sections.featuredProducts.defaultHeading')}</h2>
            )
          ) : (
            <span />
          )}
          {!groups && showViewAll && (
            <ViewAllLink
              label={viewAllLabel}
              theme={theme}
              onClick={onNavigate ? () => onNavigate(buildShopPath(products[0] ? deriveCategory(products[0]) : null)) : undefined}
            />
          )}
        </div>
      )}
      {collectionMatch && products.length === 0 ? (
        <p className="text-sm text-gray-400">{t('sectionBuilder:sections.featuredProducts.collectionEmpty', 'No products in this collection yet.')}</p>
      ) : groups ? (
        <div className="flex flex-col gap-8">
          {groups.map((group) => (
            <div key={group.category}>
              <div className="mb-4 flex items-center justify-between">
                {/* No `text-gray-900` — see the section heading's comment above. */}
                <h3 className="text-base font-semibold">{group.category}</h3>
                {data.show_view_all !== false && (
                  <ViewAllLink label={viewAllLabel} theme={theme} onClick={onNavigate ? () => onNavigate(buildShopPath(group.category)) : undefined} />
                )}
              </div>
              <ProductRow products={group.products} theme={theme} data={data} aspectClass={aspectClass} colsClass={colsClass} mobile={mobile} horizontalScroll={horizontalScroll} onNavigate={onNavigate} />
            </div>
          ))}
        </div>
      ) : (
        <ProductRow products={products} theme={theme} data={data} aspectClass={aspectClass} colsClass={colsClass} mobile={mobile} horizontalScroll={horizontalScroll} onNavigate={onNavigate} />
      )}
    </StorefrontContainer>
  );
}

export default memo(FeaturedProductsRenderer);
