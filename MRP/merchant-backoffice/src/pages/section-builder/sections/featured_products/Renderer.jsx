import { memo } from 'react';
import { ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import catalog from '../../mocks/catalog.json';
import EditableText from '../../ui/EditableText';
import StorefrontContainer from '../../ui/primitives/StorefrontContainer';
import { resolveMedia } from '../../ui/fields/imageValue';
import ProductCard from '../shared/ProductCard';
import { HEADING_SIZE_CLASS } from '../shared/headingSize';
import { ASPECT_RATIO_CLASS } from '../shared/imageAspectRatio';
import { useResponsiveMobile } from '../shared/useResponsiveMobile';

const COLS_CLASS = { '1': 'grid-cols-1', '2': 'grid-cols-2', '3': 'grid-cols-3', '4': 'grid-cols-4', '5': 'grid-cols-5', '6': 'grid-cols-6' };

// Fixed card width for the horizontal-scroll mobile layout — matches the
// golden-reference Houzez product row (140px cards, scroll-snapped).
const SCROLL_CARD_WIDTH = { width: '140px', flexShrink: 0, scrollSnapAlign: 'start' };

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

function productsForSection(data, mediaLibrary) {
  const items = data.products ?? [];
  if (!items.length) return catalog.products.slice(0, 4);
  return items
    .map((item) => {
      if (item.source === 'custom') {
        return { id: item.id, name: item.title, image: resolveMedia(item.image, mediaLibrary)?.url ?? null, price: item.price || '', compareAtPrice: null, stock: 1 };
      }
      return catalog.products.find((p) => p.id === item.product_id) ?? null;
    })
    .filter(Boolean);
}

/** Renders one row of product cards, either as a wrapping grid or — when
 * `mobile` and `mobile_layout === 'horizontal_scroll'` — a single
 * scroll-snapped row (golden-reference Houzez mobile behavior). */
function ProductRow({ products, theme, data, aspectClass, colsClass, mobile, horizontalScroll }) {
  if (mobile && horizontalScroll) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} theme={theme} showPrice={data.show_price} showQuickAdd={data.show_quick_add} aspectClass={aspectClass} widthStyle={SCROLL_CARD_WIDTH} />
        ))}
      </div>
    );
  }
  return (
    <div className={`grid gap-4 ${colsClass}`}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} theme={theme} showPrice={data.show_price} showQuickAdd={data.show_quick_add} aspectClass={aspectClass} />
      ))}
    </div>
  );
}

function ViewAllLink({ label, theme }) {
  const primary = theme?.colors?.primary;
  return (
    <p className={`flex shrink-0 items-center gap-1 text-sm font-semibold ${primary ? '' : 'text-gray-700 underline'}`} style={{ color: primary }}>
      {label} <ChevronRight size={16} strokeWidth={2.5} />
    </p>
  );
}

function FeaturedProductsRenderer({ data, onEdit, isMobile, mediaLibrary, theme }) {
  const { t } = useTranslation();
  const mobile = useResponsiveMobile(isMobile);
  const products = productsForSection(data, mediaLibrary);
  const colsClass = COLS_CLASS[mobile ? data.columns_mobile ?? '2' : data.columns_desktop ?? '4'] ?? 'grid-cols-2';
  const horizontalScroll = data.mobile_layout === 'horizontal_scroll';
  const groups = data.group_by_category ? groupProductsByCategory(products) : null;
  const headingSizeClass = HEADING_SIZE_CLASS[data.heading_size] ?? HEADING_SIZE_CLASS.medium;
  const aspectClass = ASPECT_RATIO_CLASS[data.image_aspect_ratio] ?? ASPECT_RATIO_CLASS.square;
  const viewAllLabel = t('sectionBuilder:sections.featuredProducts.viewAll');

  return (
    <StorefrontContainer as="section" theme={theme}>
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
          {!groups && data.show_view_all !== false && <ViewAllLink label={viewAllLabel} theme={theme} />}
        </div>
      )}
      {groups ? (
        <div className="flex flex-col gap-8">
          {groups.map((group) => (
            <div key={group.category}>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-base font-semibold text-gray-900">{group.category}</h3>
                {data.show_view_all !== false && <ViewAllLink label={viewAllLabel} theme={theme} />}
              </div>
              <ProductRow products={group.products} theme={theme} data={data} aspectClass={aspectClass} colsClass={colsClass} mobile={mobile} horizontalScroll={horizontalScroll} />
            </div>
          ))}
        </div>
      ) : (
        <ProductRow products={products} theme={theme} data={data} aspectClass={aspectClass} colsClass={colsClass} mobile={mobile} horizontalScroll={horizontalScroll} />
      )}
    </StorefrontContainer>
  );
}

export default memo(FeaturedProductsRenderer);
