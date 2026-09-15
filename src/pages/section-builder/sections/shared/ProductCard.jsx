import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { resolveColor } from '../../ui/fields/colorValue';
import { themedButtonStyle, themedButtonHoverStyle } from './themedButtonStyle';
import { themedCardStyle, CARD_SHADOW_CSS } from './themedLayout';
import { resolveCardRecipe } from './cardRecipes';
import { buildProductPath } from './productSource';
import ThemedButtonHover from './ThemedButtonHover';

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
function ProductCard({ product, theme, showPrice, showQuickAdd, aspectClass, widthStyle, onQuickAddClick, onNavigate }) {
  const { t } = useTranslation();
  const [hovered, setHovered] = useState(false);
  const soldOut = product.stock === 0;
  const layout = theme?.layout ?? {};
  const cardStyle = themedCardStyle(layout);
  const border = layout.card_border !== false ? theme?.colors?.border : undefined;
  const hoverShadow = hovered ? CARD_SHADOW_CSS[layout.card_shadow] ?? 'none' : 'none';
  // Theme-resolved, not the previous hardcoded `text-gray-*`/`bg-gray-50`
  // classes — those read fine on every existing (light-background) theme's
  // card, but render illegibly dark-on-dark for a theme like Barger whose
  // `theme.colors.surface`/`text_primary` are a dark card fill and white
  // text. Falls back to the same original Tailwind grays when no theme is
  // passed (e.g. a bare unit test render), so behavior is unchanged there.
  const imagePlaceholderBg = theme?.colors?.surface;
  // `layout.image_fit === 'contain'` (Barger only, so far — see its
  // `image_fit: 'contain'` layout token) insets a whole product photo on
  // its surface tile like Figma's own cutout product shots (node
  // 932:119167), instead of the previous unconditional `object-cover` crop
  // every other theme's own (already edge-to-edge) product photography
  // still wants and keeps unchanged.
  const imageFit = layout.image_fit;
  const nameColor = theme?.colors?.text_secondary;
  const priceColor = theme?.colors?.text_primary;
  const mutedColor = theme?.colors?.text_secondary;
  const cardRecipe = resolveCardRecipe(theme);
  // Optional — `onNavigate` is only wired for callers that render a real
  // storefront (see catalog_list/Renderer.jsx's identical pattern); a
  // caller that doesn't pass it (e.g. a context this card isn't clickable
  // in) renders exactly as before, non-interactive.
  const handleClick = onNavigate && product.handle ? () => onNavigate(buildProductPath(product.handle)) : undefined;

  return (
    <div
      className={`flex flex-col text-left ${handleClick ? 'cursor-pointer' : ''}`}
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
      onClick={handleClick}
      role={handleClick ? 'link' : undefined}
    >
      <div
        className={`flex items-center justify-center ${imagePlaceholderBg ? '' : 'bg-gray-50 text-gray-300'} ${aspectClass} ${imageFit === 'contain' ? 'p-8' : ''}`}
        style={imagePlaceholderBg ? { backgroundColor: imagePlaceholderBg, color: mutedColor } : undefined}
      >
        {product.image ? (
          <img src={product.image} alt={product.name} className={`h-full w-full ${imageFit === 'contain' ? 'object-contain' : 'object-cover'}`} />
        ) : (
          t('sectionBuilder:sections.common.noImage')
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p
          className={`mb-1 overflow-hidden ${nameColor ? '' : 'text-gray-600'}`}
          style={{
            fontSize: cardRecipe.nameFontSize,
            lineHeight: 1.5,
            fontWeight: cardRecipe.nameFontWeight,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            color: nameColor,
          }}
        >
          {product.name}
        </p>
        {showPrice !== false && (
          <p className={`mt-auto font-bold ${priceColor ? '' : 'text-gray-900'}`} style={{ color: priceColor, fontSize: cardRecipe.priceFontSize }}>
            {soldOut ? (
              <span className={`text-sm font-medium ${mutedColor ? '' : 'text-gray-400'}`} style={{ color: mutedColor }}>{t('sectionBuilder:sections.common.soldOut', 'Sold out')}</span>
            ) : (
              <>
                {typeof product.price === 'string' ? product.price : `$${product.price.toFixed(2)}`}
                {product.compareAtPrice && (
                  <span className={`ml-1 text-sm font-normal line-through ${mutedColor ? '' : 'text-gray-400'}`} style={{ color: mutedColor }}>${product.compareAtPrice.toFixed(2)}</span>
                )}
              </>
            )}
          </p>
        )}
        {showQuickAdd && !soldOut && (() => {
          const quickAddPrimary = resolveColor({ slot: 'primary' }, theme.colors);
          const quickAddStyle = themedButtonStyle(theme.buttons, { primary: quickAddPrimary, primaryText: resolveColor({ slot: 'primary_text' }, theme.colors) });
          const quickAddHoverStyle = themedButtonHoverStyle(theme.buttons, quickAddStyle, quickAddPrimary);
          return (
            <div className="mt-3">
              <ThemedButtonHover
                as="button"
                type="button"
                disabled
                onClick={(e) => { e.stopPropagation(); onQuickAddClick?.(e); }}
                className="w-full text-xs font-semibold"
                style={quickAddStyle}
                hoverStyle={quickAddHoverStyle}
              >
                {t('sectionBuilder:sections.common.addToCart', 'Add to cart')}
              </ThemedButtonHover>
            </div>
          );
        })()}
      </div>
    </div>
  );
}

export default ProductCard;
