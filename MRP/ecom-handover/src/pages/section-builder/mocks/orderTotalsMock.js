/**
 * MOCK IMPLEMENTATION — no backend exists yet for this logic (as of
 * 2026-08-14). This defines the request/response contract a real API
 * should implement. Replace the function body with a real fetch() call
 * when the backend is ready; keep the exported function signature stable
 * so call sites don't change.
 */

/**
 * @typedef {object} OrderItem
 * @property {number} price - unit price
 * @property {number} quantity
 * @property {number} [modifierTotal] - sum of selected modifier priceDeltas for this item, default 0
 */

/**
 * Calculates order totals from line items. Pure function, IDR amounts as
 * plain numbers — currency formatting is a UI concern, not handled here.
 *
 * @param {object} [params]
 * @param {OrderItem[]} params.items
 * @param {number} [params.taxRatePercent] - default 11
 * @param {number} [params.pointUsed] - loyalty points applied as a direct deduction
 * @param {number} [params.pointRedeemed] - additional point-based deduction
 * @returns {{ subtotal: number, tax: number, pointUsed: number, pointRedeemed: number, grandTotal: number }}
 */
export function calculateOrderTotals({ items = [], taxRatePercent = 11, pointUsed = 0, pointRedeemed = 0 } = {}) {
  const subtotal = items.reduce((sum, item) => sum + (item.price + (item.modifierTotal || 0)) * item.quantity, 0);
  const tax = Math.round((subtotal * taxRatePercent) / 100);
  const grandTotal = Math.max(0, subtotal + tax - pointUsed - pointRedeemed);

  return { subtotal, tax, pointUsed, pointRedeemed, grandTotal };
}
