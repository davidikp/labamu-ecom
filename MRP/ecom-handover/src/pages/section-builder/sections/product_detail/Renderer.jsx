import { memo } from 'react';
import { resolveColor } from '../../ui/fields/colorValue';
import { themedButtonStyle } from '../shared/themedButtonStyle';
import catalog from '../../mocks/catalog.json';
import EditableText from '../../ui/EditableText';
import { useResponsiveMobile } from '../shared/useResponsiveMobile';

function ProductDetailRenderer({ data, theme, onEdit, isMobile }) {
  const mobile = useResponsiveMobile(isMobile);
  const product = catalog.products.find((p) => p.id === data.product_id) ?? catalog.products[0];
  const soldOut = product.stock === 0;
  const related = catalog.products.filter((p) => p.id !== product.id);

  return (
    <section className="px-6">
      <div className={`flex gap-8 ${mobile ? 'flex-col' : 'flex-row'}`}>
        <div className="flex flex-1 flex-col gap-3">
          <div className="flex aspect-square items-center justify-center rounded-md bg-gray-100 text-gray-300">
            {product.image ? <img src={product.image} alt={product.name} className="h-full w-full rounded-md object-cover" /> : 'No image'}
          </div>
          {data.show_gallery_thumbnails !== false && (
            // There's only one image per mock product, so the thumbnail row
            // just repeats the same placeholder/image — a real gallery needs
            // a real multi-image catalog this codebase doesn't have yet.
            <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex h-16 w-16 items-center justify-center rounded-md bg-gray-100 text-xs text-gray-300">
                  {product.image ? <img src={product.image} alt={product.name} className="h-full w-full rounded-md object-cover" /> : 'No image'}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-3">
          <h2 className="text-2xl font-bold">{product.name}</h2>
          <p className="text-lg text-gray-500">${product.price.toFixed(2)}</p>

          <div className="flex w-24 items-center justify-between rounded-md border border-gray-300 px-2 py-1 text-sm">
            <span>−</span><span>1</span><span>+</span>
          </div>

          <div className="flex gap-3">
            <span
              style={themedButtonStyle(theme.buttons, { primary: resolveColor({ slot: 'primary' }, theme.colors), primaryText: resolveColor({ slot: 'primary_text' }, theme.colors) })}
              className="w-fit"
            >
              {soldOut ? 'Sold out' : 'Buy now'}
            </span>
            <span
              style={themedButtonStyle(theme.buttons, { variant: 'outline', primary: resolveColor({ slot: 'primary' }, theme.colors) })}
              className="w-fit"
            >
              {soldOut ? 'Sold out' : 'Add to cart'}
            </span>
          </div>

          {data.show_description_tab !== false && (
            <div className="mt-4 flex flex-col gap-2 border-t border-gray-200 pt-4">
              <span className="text-sm font-semibold">Description</span>
              {onEdit ? (
                <EditableText
                  as="p"
                  multiline
                  className="text-sm opacity-80"
                  value={data.custom_description}
                  placeholder="No description yet."
                  onCommit={(v) => onEdit('custom_description', v)}
                />
              ) : (
                <p className="text-sm opacity-80">{data.custom_description || 'No description yet.'}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {data.show_related_products !== false && (
        <div className="mt-10 flex flex-col gap-4 border-t border-gray-200 pt-6">
          {onEdit ? (
            <EditableText as="h3" className="text-lg font-semibold" value={data.related_heading} placeholder="Other picks" onCommit={(v) => onEdit('related_heading', v)} />
          ) : (
            <h3 className="text-lg font-semibold">{data.related_heading || 'Other picks'}</h3>
          )}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {related.map((p) => (
              <div key={p.id} className="flex flex-col gap-2">
                <div className="flex aspect-square items-center justify-center rounded-md bg-gray-100 text-xs text-gray-300">
                  {p.image ? <img src={p.image} alt={p.name} className="h-full w-full rounded-md object-cover" /> : 'No image'}
                </div>
                <span className="text-sm font-medium">{p.name}</span>
                <span className="text-sm text-gray-500">${p.price.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export default memo(ProductDetailRenderer);
