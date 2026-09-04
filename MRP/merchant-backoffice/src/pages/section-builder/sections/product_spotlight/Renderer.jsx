import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { resolveColor } from '../../ui/fields/colorValue';
import { themedButtonStyle } from '../shared/themedButtonStyle';
import catalog from '../../mocks/catalog.json';
import EditableText from '../../ui/EditableText';
import BlockStream from '../../ui/BlockStream';
import { useResponsiveMobile } from '../shared/useResponsiveMobile';

function ProductSpotlightRenderer({ data, blocks = [], theme, mediaLibrary, onEdit, blockCtx, isMobile }) {
  const { t } = useTranslation();
  const mobile = useResponsiveMobile(isMobile);
  const product = catalog.products.find((p) => p.id === data.product_id) ?? catalog.products[0];
  const soldOut = product.stock === 0;
  // Same JS-driven (not `sm:` classes) technique as image_with_text/Renderer.jsx.
  const imageFirst = mobile ? (data.image_position_mobile ?? 'top') === 'top' : data.image_position !== 'right';
  const imageOrder = imageFirst ? 'order-1' : 'order-2';
  const detailsOrder = imageFirst ? 'order-2' : 'order-1';

  return (
    <section className="relative px-6">
      {data.source_mode === 'manual' ? (
        <BlockStream
          sectionType="product_spotlight"
          blocks={blocks}
          theme={theme}
          mediaLibrary={mediaLibrary}
          blockCtx={blockCtx}
          className="flex flex-col gap-4"
          isMobile={isMobile}
        />
      ) : (
      <div className={`flex gap-8 ${mobile ? 'flex-col' : 'flex-row'}`}>
        <div className={`flex aspect-square flex-1 items-center justify-center rounded-md bg-gray-100 text-gray-300 ${imageOrder}`}>
          {product.image ? <img src={product.image} alt={product.name} className="h-full w-full rounded-md object-cover" /> : t('sectionBuilder:sections.common.noImage')}
        </div>
        <div className={`flex flex-1 flex-col justify-center gap-3 ${detailsOrder}`}>
          {onEdit ? (
            <EditableText
              as="h2"
              className="text-2xl font-bold"
              value={data.custom_heading}
              placeholder={product.name}
              onCommit={(v) => onEdit('custom_heading', v)}
            />
          ) : (
            <h2 className="text-2xl font-bold">{data.custom_heading || product.name}</h2>
          )}
          {data.show_price !== false && <p className="text-lg text-gray-500">${product.price.toFixed(2)}</p>}
          {onEdit ? (
            <EditableText
              as="p"
              multiline
              className="text-sm opacity-80"
              value={data.custom_description}
              placeholder={t('sectionBuilder:sections.productSpotlight.defaultDescription')}
              onCommit={(v) => onEdit('custom_description', v)}
            />
          ) : (
            <p className="text-sm opacity-80">{data.custom_description || t('sectionBuilder:sections.productSpotlight.defaultDescription')}</p>
          )}
          {data.show_variant_selector && (
            <select className="w-40 rounded-md border border-gray-300 px-2 py-1 text-sm" disabled>
              <option>{t('sectionBuilder:sections.productSpotlight.defaultVariant')}</option>
            </select>
          )}
          {data.show_quantity_selector && (
            <div className="flex w-24 items-center justify-between rounded-md border border-gray-300 px-2 py-1 text-sm">
              <span>−</span><span>1</span><span>+</span>
            </div>
          )}
          {data.show_add_to_cart !== false && (
            <span
              style={themedButtonStyle(theme.buttons, { primary: resolveColor({ slot: 'primary' }, theme.colors), primaryText: resolveColor({ slot: 'primary_text' }, theme.colors) })}
              className="w-fit"
            >
              {soldOut ? (
                t('sectionBuilder:sections.productSpotlight.soldOut')
              ) : onEdit ? (
                <EditableText
                  value={data.button_label}
                  placeholder={t('sectionBuilder:sections.productSpotlight.defaultButtonText')}
                  onCommit={(v) => onEdit('button_label', v)}
                />
              ) : (
                data.button_label || t('sectionBuilder:sections.productSpotlight.defaultButtonText')
              )}
            </span>
          )}
        </div>
      </div>
      )}
    </section>
  );
}

export default memo(ProductSpotlightRenderer);
