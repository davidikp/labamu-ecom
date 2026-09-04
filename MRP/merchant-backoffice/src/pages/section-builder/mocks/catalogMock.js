/**
 * MOCK IMPLEMENTATION — no backend exists yet for this logic (as of
 * 2026-08-14). This defines the request/response contract a real API
 * should implement. Replace the function body with a real fetch() call
 * when the backend is ready; keep the exported function signature stable
 * so call sites don't change.
 */

/**
 * @typedef {object} Product
 * @property {string} id
 * @property {string} name
 * @property {number} price
 * @property {string} category
 * @property {string} createdAt - ISO 8601 date string
 * @property {string} imageUrl
 */

/**
 * Filters, sorts, and paginates a product catalog. Pure function — no side
 * effects, no randomness. Sort by 'newest'/'oldest' uses each product's
 * `createdAt` field rather than the current time, so results stay
 * deterministic and testable.
 *
 * @param {Product[]} products
 * @param {object} [options]
 * @param {string} [options.category] - exact category match, if provided
 * @param {number} [options.minPrice]
 * @param {number} [options.maxPrice]
 * @param {'newest'|'oldest'|'price-asc'|'price-desc'} [options.sort]
 * @param {number} [options.page] - 1-indexed
 * @param {number} [options.pageSize]
 * @returns {{ items: Product[], total: number, page: number, pageSize: number, totalPages: number }}
 */
export function filterAndSortCatalog(products, { category, minPrice, maxPrice, sort = 'newest', page = 1, pageSize = 16 } = {}) {
  let filtered = products.filter((product) => {
    if (category && product.category !== category) return false;
    if (minPrice != null && product.price < minPrice) return false;
    if (maxPrice != null && product.price > maxPrice) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    switch (sort) {
      case 'oldest':
        return new Date(a.createdAt) - new Date(b.createdAt);
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      case 'newest':
      default:
        return new Date(b.createdAt) - new Date(a.createdAt);
    }
  });

  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  const items = sorted.slice(start, start + pageSize);

  return { items, total, page, pageSize, totalPages };
}
