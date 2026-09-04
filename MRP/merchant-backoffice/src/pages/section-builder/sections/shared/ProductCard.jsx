import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { resolveColor } from '../../ui/fields/colorValue';
import { themedButtonStyle } from './themedButtonStyle';
import { themedCardStyle, CARD_SHADOW_CSS } from './themedLayout';

/**
 * @module section-builder/sections/shared/ProductCard
 * @description Shared product-card visual primitive for `featured_products`
 * and `product_carousel` (both previously hand-rolled near-identical
 * image/title/price/quick-add markup independently). Everything about how a
 * product card *looks* — border, radius, hover shadow, title clamp/size,
 * price weight, quick-add button — is theme-driven (`theme.layout`,
 * `theme.colors`, `theme.buttons`), never hardcoded per-theme, so a theme
 * like Houzez reaches its golden-reference card look purely through token
 * values, not a special-cased card component.
 *
 * `product_spotlight` is intentionally NOT built on this — it's a single
 * large PDP-style split layout (image + details panel), not a repeated grid
 * card, so it doesn't share this component's visual concerns.
 */
function ProductCard({ product, theme, showPrice, showQuickAdd, aspectClass, widthStyle, onQuickAddClick }) {
  const { t } = useTranslation();
  const [hovered, setHovered] = useState(false);
  const soldOut = product.stock === 0;
  const layout = theme?.layout ?? {};
  const cardStyle = themedCardStyle(layout);
  const border = theme?.colors?.border;
  const hoverShadow = hovered ? CARD_SHADOW_CSS[layout.card_shadow] ?? 'none' : 'none';

  return (
    <div
      className="flex flex-col text-left"
      style={{
        ...cardStyle,
        boxShadow: hoverShadow,
        border: border ? `1px solid ${border}` : undefined,
        overflow: 'hidden',
        transition: 'box-shadow 0.3s ease',
        ...widthStyle,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className={`flex items-center justify-center bg-gray-50 text-gray-300 ${aspectClass}`}>
        {product.image ? (
          <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          t('sectionBuilder:sections.common.noImage')
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p
          className="mb-2 overflow-hidden text-gray-600"
          style={{
            fontSize: '13px',
            lineHeight: 1.5,
            fontWeight: 500,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            minHeight: 'calc(13px * 1.5 * 2)',
          }}
        >
          {product.name}
        </p>
        {showPrice !== false && (
          <p className="mt-auto text-[15px] font-bold text-gray-900">
            {soldOut ? (
              <span className="text-sm font-medium text-gray-400">{t('sectionBuilder:sections.common.soldOut', 'Sold out')}</span>
            ) : (
              <>
                {typeof product.price === 'string' ? product.price : `$${product.price.toFixed(2)}`}
                {product.compareAtPrice && (
                  <span className="ml-1 text-sm font-normal text-gray-400 line-through">${product.compareAtPrice.toFixed(2)}</span>
                )}
              </>
            )}
          </p>
        )}
        {showQuickAdd && !soldOut && (
          <div className="mt-3">
            <button
              type="button"
              disabled
              onClick={onQuickAddClick}
              className="w-full text-xs font-semibold"
              style={themedButtonStyle(theme.buttons, {
                primary: resolveColor({ slot: 'primary' }, theme.colors),
                primaryText: resolveColor({ slot: 'primary_text' }, theme.colors),
              })}
            >
              {t('sectionBuilder:sections.common.addToCart', 'Add to cart')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductCard;
