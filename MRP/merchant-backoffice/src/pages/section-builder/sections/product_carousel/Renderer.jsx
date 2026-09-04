import { memo, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import catalog from '../../mocks/catalog.json';
import EditableText from '../../ui/EditableText';
import BlockStream from '../../ui/BlockStream';
import ProductCard from '../shared/ProductCard';
import { HEADING_SIZE_CLASS } from '../shared/headingSize';
import { ASPECT_RATIO_CLASS } from '../shared/imageAspectRatio';
import { useResponsiveMobile } from '../shared/useResponsiveMobile';

function ProductCarouselRenderer({ data, blocks = [], theme, mediaLibrary, onEdit, blockCtx, isMobile }) {
  const { t } = useTranslation();
  const mobile = useResponsiveMobile(isMobile);
  const count = data.products_to_show ?? 8;
  const products = [];
  for (let i = 0; i < count; i += 1) products.push(catalog.products[i % catalog.products.length]);
  const visibleMobile = Number(data.cards_visible_mobile ?? 2);
  const visibleDesktop = Number(data.cards_visible_desktop ?? 4);
  const visible = mobile ? visibleMobile : visibleDesktop;
  const cardWidthStyle = { width: `calc(${100 / visible}% - 12px)`, flexShrink: 0 };
  const headingSizeClass = HEADING_SIZE_CLASS[data.heading_size] ?? HEADING_SIZE_CLASS.medium;
  const scrollRef = useRef(null);

  const scrollByOneCard = (direction) => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = (el.clientWidth / visible) * direction;
    const atEnd = direction > 0 && el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
    el.scrollTo({ left: atEnd ? 0 : el.scrollLeft + amount, behavior: 'smooth' });
  };

  // Manual mode (BlockStream, arbitrary child blocks) has no fixed card width
  // to auto-scroll by, so autoplay only applies to the catalog-driven mode.
  useEffect(() => {
    if (!data.autoplay || data.source_mode === 'manual') return undefined;
    const id = setInterval(() => scrollByOneCard(1), (data.autoplay_speed ?? 4) * 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.autoplay, data.autoplay_speed, data.source_mode, visible]);

  return (
    <section className="px-6">
      {data.show_heading !== false && (
        onEdit ? (
          <EditableText
            as="h2"
            className={`mb-6 font-semibold text-gray-900 ${headingSizeClass}`}
            value={data.heading}
            placeholder={t('sectionBuilder:sections.productCarousel.defaultHeading')}
            onCommit={(v) => onEdit('heading', v)}
          />
        ) : (
          <h2 className={`mb-6 font-semibold text-gray-900 ${headingSizeClass}`}>{data.heading || t('sectionBuilder:sections.productCarousel.defaultHeading')}</h2>
        )
      )}
      <div className="relative">
        {data.source_mode === 'manual' ? (
          <BlockStream
            sectionType="product_carousel"
            blocks={blocks}
            theme={theme}
            mediaLibrary={mediaLibrary}
            blockCtx={blockCtx}
            className="flex gap-4 overflow-x-auto pb-2"
            isMobile={isMobile}
            direction="horizontal"
          />
        ) : (
          <div ref={scrollRef} className="flex gap-4 overflow-x-auto pb-2">
            {products.map((product, i) => (
              <ProductCard
                key={`${product.id}-${i}`}
                product={product}
                theme={theme}
                showPrice={data.show_price}
                showQuickAdd={data.show_add_to_cart}
                aspectClass={ASPECT_RATIO_CLASS.square}
                widthStyle={cardWidthStyle}
              />
            ))}
          </div>
        )}
        {data.show_nav_arrows !== false && data.source_mode !== 'manual' && !mobile && (
          <div className="pointer-events-none absolute inset-y-0 left-0 right-0 flex items-center justify-between">
            <button type="button" onClick={() => scrollByOneCard(-1)} aria-label={t('sectionBuilder:sections.productCarousel.previous', 'Previous')} className="pointer-events-auto rounded-full bg-white p-1 text-gray-600 shadow">‹</button>
            <button type="button" onClick={() => scrollByOneCard(1)} aria-label={t('sectionBuilder:sections.productCarousel.next', 'Next')} className="pointer-events-auto rounded-full bg-white p-1 text-gray-600 shadow">›</button>
          </div>
        )}
      </div>
    </section>
  );
}

export default memo(ProductCarouselRenderer);
