import { useCallback, useMemo, useState } from 'react';
import { StorefrontCartContext } from './storefrontCartContext';

/**
 * @module section-builder/sections/shared/storefrontCart
 * @description Smallest possible storefront-wide cart state — a provider
 * mounted once at a storefront-level boundary (PreviewLive.jsx /
 * ThemePreview.jsx, alongside Header/Footer and the page body) so both
 * `product_detail` (Add to Cart) and `header` (cart-count badge) can reach
 * the SAME cart instance, rather than each page/section owning its own
 * local state. See storefrontCartContext.js for the reader hook
 * (`useStorefrontCart`).
 *
 * In-memory only: state lives in a plain `useState` with no persistence
 * layer (no localStorage, no backend) — a reload of the preview clears it,
 * same as any other unsaved builder/preview state. This is a deliberate
 * Phase 3 scope limit, not an oversight.
 *
 * Line-item shape: `{ productId, handle, name, image, price, quantity,
 * options }`. `options` is the selected visual-option map (see
 * productOptionsConfig.js), serialized (sorted-entries JSON) to form the
 * line's identity key: two adds of the same product with the same
 * serialized options increment the existing line's quantity (clamped to
 * stock when the product's stock is a number); different options produce a
 * separate line item — matching how a real cart treats size/color variants
 * as distinct lines, even though this codebase's "options" are
 * presentation-only, not real commerce variants.
 */
function serializeOptions(options) {
  if (!options || typeof options !== 'object') return '';
  const entries = Object.entries(options).sort(([a], [b]) => a.localeCompare(b));
  return JSON.stringify(entries);
}

function lineKey(productId, options) {
  return `${productId}::${serializeOptions(options)}`;
}

export function StorefrontCartProvider({ children }) {
  const [lines, setLines] = useState(() => new Map());

  const addItem = useCallback((item) => {
    const { productId, handle, name, image, price, options, stock } = item;
    const quantity = Math.max(1, Number(item.quantity) || 1);
    const key = lineKey(productId, options);
    setLines((prev) => {
      const next = new Map(prev);
      const existing = next.get(key);
      const maxQty = typeof stock === 'number' ? stock : Infinity;
      if (existing) {
        next.set(key, { ...existing, quantity: Math.min(existing.quantity + quantity, maxQty) });
      } else {
        next.set(key, { productId, handle, name, image, price, options, quantity: Math.min(quantity, maxQty) });
      }
      return next;
    });
  }, []);

  const items = useMemo(() => Array.from(lines.values()), [lines]);
  const count = useMemo(() => items.reduce((sum, line) => sum + line.quantity, 0), [items]);

  const value = useMemo(() => ({ items, count, addItem }), [items, count, addItem]);

  return <StorefrontCartContext.Provider value={value}>{children}</StorefrontCartContext.Provider>;
}
