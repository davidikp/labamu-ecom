import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import catalog from '../../mocks/catalog.json';
import EditableText from '../../ui/EditableText';
import { resolveMedia } from '../../ui/fields/imageValue';
import { HEADING_SIZE_CLASS } from '../shared/headingSize';
import { ASPECT_RATIO_CLASS } from '../shared/imageAspectRatio';
import { useResponsiveMobile } from '../shared/useResponsiveMobile';

// TODO(catalog integration): sourced from the static mock fixture — swap
// for a real products API once one exists (see api/client.js's registerMock
// pattern, already used for /storefront/products).
function ProductCard({ product, showPrice, showQuickAdd, aspectClass }) {
  const { t } = useTranslation();
  const soldOut = product.stock === 0;
  return (
    <div className="text-left">
      <div className={`mb-2 flex items-center justify-center rounded-md bg-gray-100 text-gray-300 ${aspectClass}`}>
        {product.image ? <img src={product.image} alt={product.name} className="h-full w-full rounded-md object-cover" /> : t('sectionBuilder:sections.common.noImage')}
      </div>
      <p className="text-sm text-gray-700">{product.name}</p>
      {showPrice !== false && (
        <p className="text-sm font-semibold text-gray-900">
          {soldOut ? (
            <span className="font-medium text-gray-400">{t('sectionBuilder:sections.featuredProducts.soldOut')}</span>
          ) : (
            <>
              {/* Custom items carry a free-text price (e.g. "Rp 4.200.000") —
                  shown verbatim. Catalog items carry a real number, formatted
                  as USD to match catalog_list's own $-prefixed formatting. */}
              {typeof product.price === 'string' ? product.price : `$${product.price.toFixed(2)}`}
              {product.compareAtPrice && (
                <span className="ml-1 font-normal text-gray-400 line-through">${product.compareAtPrice.toFixed(2)}</span>
              )}
            </>
          )}
        </p>
      )}
      {showQuickAdd && !soldOut && (
        <button
          type="button"
          disabled
          className="mt-2 w-full rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white"
        >
          {t('sectionBuilder:sections.featuredProducts.quickAdd', 'Add to cart')}
        </button>
      )}
    </div>
  );
}

const COLS_CLASS = { '1': 'grid-cols-1', '2': 'grid-cols-2', '3': 'grid-cols-3', '4': 'grid-cols-4', '5': 'grid-cols-5' };

// Shape-adapter shim: catalog.json has no `category` field, so — consistent
// with the same derivation used in catalog_list/Renderer.jsx's ADAPTED_PRODUCTS
// shim — we fall back to each product's `vendor` (or 'General' if absent) as
// a stand-in display category, so the two sections show consistent groupings
// for the same mock products.
function deriveCategory(product) {
  return product.vendor || 'General';
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

// `data.products` is a repeater where each item picks its own source: a
// real catalog product (by id) or fully custom title/image/price/url —
// resolved here into the normalized shape ProductCard expects. Mirrors
// collection_list's `collections` field. Empty/unset falls back to the
// first few catalog products — the original, pre-picker default — so
// sections saved before this field existed don't render nothing.
function productsForSection(data, mediaLibrary) {
  const items = data.products ?? [];
  if (!items.length) return catalog.products.slice(0, 4);
  return items
    .map((item) => {
      if (item.source === 'custom') {
        // Kept as the raw string the merchant typed (e.g. "Rp 4.200.000",
        // "$12.00 – $18.00") — ProductCard renders it verbatim rather than
        // assuming it parses as a plain USD number.
        return { id: item.id, name: item.title, image: resolveMedia(item.image, mediaLibrary)?.url ?? null, price: item.price || '', compareAtPrice: null, stock: 1 };
      }
      return catalog.products.find((p) => p.id === item.product_id) ?? null;
    })
    .filter(Boolean);
}

function FeaturedProductsRenderer({ data, onEdit, isMobile, mediaLibrary }) {
  const { t } = useTranslation();
  const mobile = useResponsiveMobile(isMobile);
  const products = productsForSection(data, mediaLibrary);
  const colsClass = COLS_CLASS[mobile ? data.columns_mobile ?? '2' : data.columns_desktop ?? '4'] ?? 'grid-cols-2';
  const groups = data.group_by_category ? groupProductsByCategory(products) : null;
  const headingSizeClass = HEADING_SIZE_CLASS[data.heading_size] ?? HEADING_SIZE_CLASS.medium;
  const aspectClass = ASPECT_RATIO_CLASS[data.image_aspect_ratio] ?? ASPECT_RATIO_CLASS.square;
  const viewAllLabel = t('sectionBuilder:sections.featuredProducts.viewAll');

  return (
    <section className="px-6">
      {(data.show_heading !== false || (!groups && data.show_view_all !== false)) && (
        <div className="mb-6 flex items-center justify-between gap-4">
          {data.show_heading !== false ? (
            onEdit ? (
              <EditableText
                as="h2"
                className={`font-semibold text-gray-900 ${headingSizeClass}`}
                value={data.heading}
                placeholder={t('sectionBuilder:sections.featuredProducts.defaultHeading')}
                onCommit={(v) => onEdit('heading', v)}
              />
            ) : (
              <h2 className={`font-semibold text-gray-900 ${headingSizeClass}`}>{data.heading || t('sectionBuilder:sections.featuredProducts.defaultHeading')}</h2>
            )
          ) : (
            <span />
          )}
          {!groups && data.show_view_all !== false && (
            <p className="shrink-0 text-sm font-medium text-gray-700 underline">{viewAllLabel} →</p>
          )}
        </div>
      )}
      {groups ? (
        <div className="flex flex-col gap-8">
          {groups.map((group) => (
            <div key={group.category}>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-base font-semibold text-gray-900">{group.category}</h3>
                {data.show_view_all !== false && (
                  <p className="shrink-0 text-sm font-medium text-gray-700 underline">{viewAllLabel} →</p>
                )}
              </div>
              <div className={`grid gap-4 ${colsClass}`}>
                {group.products.map((product) => (
                  <ProductCard key={product.id} product={product} showPrice={data.show_price} showQuickAdd={data.show_quick_add} aspectClass={aspectClass} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={`grid gap-4 ${colsClass}`}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} showPrice={data.show_price} showQuickAdd={data.show_quick_add} aspectClass={aspectClass} />
          ))}
        </div>
      )}
    </section>
  );
}

export default memo(FeaturedProductsRenderer);
