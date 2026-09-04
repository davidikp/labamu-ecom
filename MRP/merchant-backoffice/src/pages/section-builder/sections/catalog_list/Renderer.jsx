import { memo } from 'react';
import catalog from '../../mocks/catalog.json';
import { filterAndSortCatalog } from '../../mocks/catalogMock.js';
import EditableText from '../../ui/EditableText';

// Shape-adapter shim: catalogMock's filterAndSortCatalog expects a `Product`
// with `category` and `createdAt` fields, but the real mock fixture
// (catalog.json) only has {id,name,price,compareAtPrice,image,vendor,stock} —
// there's no real catalog with real categories/dates yet. `category` falls
// back to each product's `vendor` (or 'General' if absent), and `createdAt`
// is a fixed, deterministic string derived from the product's array index
// (NOT `new Date()`/`Date.now()`) so sorting stays stable across renders.
const ADAPTED_PRODUCTS = catalog.products.map((product, index) => ({
  ...product,
  category: product.vendor || 'General',
  createdAt: `2024-01-${String(index + 1).padStart(2, '0')}T00:00:00.000Z`,
  imageUrl: product.image,
}));

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
];

function CatalogListRenderer({ data, onEdit }) {
  const columnsDesktop = data.columns_desktop ?? 4;
  const pageSize = data.page_size ?? 16;
  const categories = [...new Set(ADAPTED_PRODUCTS.map((p) => p.category))];

  const { items, total, totalPages } = filterAndSortCatalog(ADAPTED_PRODUCTS, { page: 1, pageSize });

  const gridColsClass = { 2: 'grid-cols-2', 3: 'grid-cols-2 md:grid-cols-3', 4: 'grid-cols-2 md:grid-cols-4' }[columnsDesktop] || 'grid-cols-2 md:grid-cols-4';

  return (
    <section className="px-6">
      {onEdit ? (
        <EditableText as="h2" className="mb-6 text-2xl font-bold" value={data.heading} placeholder="Shop" onCommit={(v) => onEdit('heading', v)} />
      ) : (
        <h2 className="mb-6 text-2xl font-bold">{data.heading || 'Shop'}</h2>
      )}

      <div className={`flex gap-8 ${data.show_filters !== false ? 'flex-col md:flex-row' : 'flex-col'}`}>
        {data.show_filters !== false && (
          <aside className="flex w-full flex-none flex-col gap-3 md:w-48">
            <span className="text-sm font-semibold">Category</span>
            {categories.map((category) => (
              <label key={category} className="flex items-center gap-2 text-sm opacity-80">
                <input type="checkbox" disabled />
                {category}
              </label>
            ))}
          </aside>
        )}

        <div className="flex flex-1 flex-col gap-4">
          {data.show_sort !== false && (
            <div className="flex justify-end">
              <select className="rounded-md border border-gray-300 px-2 py-1 text-sm" disabled>
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          )}

          <div className={`grid gap-4 ${gridColsClass}`}>
            {items.map((product) => (
              <div key={product.id} className="flex flex-col gap-2">
                <div className="flex aspect-square items-center justify-center rounded-md bg-gray-100 text-xs text-gray-300">
                  {product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="h-full w-full rounded-md object-cover" /> : 'No image'}
                </div>
                <span className="text-sm font-medium">{product.name}</span>
                <span className="text-sm text-gray-500">${product.price.toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between border-t border-gray-200 pt-3 text-sm opacity-60">
            <span>{total} products</span>
            <span>Page 1 of {totalPages}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default memo(CatalogListRenderer);
