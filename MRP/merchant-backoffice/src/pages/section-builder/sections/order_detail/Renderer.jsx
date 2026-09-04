import { memo } from 'react';
import catalog from '../../mocks/catalog.json';
import { calculateOrderTotals } from '../../mocks/orderTotalsMock.js';
import EditableText from '../../ui/EditableText';

// Demo-only: real order line items need a backend order/session, which this
// codebase doesn't have yet, so this always shows the first two mock
// products — same convention as cart_summary's DEMO_LINE_ITEMS, plus
// `modifierTotal: 0` per item to match orderTotalsMock's OrderItem shape.
const DEMO_LINE_ITEMS = catalog.products.slice(0, 2).map((product) => ({ product, quantity: 1, price: product.price, modifierTotal: 0 }));

function OrderDetailRenderer({ data, onEdit }) {
  const totals = calculateOrderTotals({
    items: DEMO_LINE_ITEMS,
    taxRatePercent: data.tax_rate_percent,
    pointUsed: data.demo_point_used,
    pointRedeemed: data.demo_point_redeemed,
  });

  return (
    <section className="px-6">
      {onEdit ? (
        <EditableText as="h2" className="mb-6 text-2xl font-bold" value={data.heading} placeholder="Order Detail" onCommit={(v) => onEdit('heading', v)} />
      ) : (
        <h2 className="mb-6 text-2xl font-bold">{data.heading || 'Order Detail'}</h2>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-md border border-gray-200 p-4">
          <span className="mb-2 inline-block rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">Waiting Payment</span>
          <p className="text-sm">Order #MRP-000123</p>
          <p className="text-xs opacity-60">Placed 14 Aug 2026, 10:32</p>
        </div>

        <div className="rounded-md border border-gray-200 p-4">
          <p className="text-sm font-semibold">Payment method: QRIS</p>
          {data.show_payment_countdown !== false && (
            // Demo-only static countdown label — a real live-ticking timer
            // needs a real order's expiry timestamp, which this codebase
            // doesn't have yet. This is just a concept placeholder.
            <p className="mt-1 text-sm opacity-80">Expires in 02:59:50</p>
          )}
        </div>

        <div className="rounded-md border border-gray-200 p-4">
          <p className="text-sm font-semibold">Customer</p>
          <p className="text-sm opacity-80">Charlie</p>
          <p className="text-xs opacity-60">+62 812-3456-7890</p>
        </div>

        <div className="rounded-md border border-gray-200 p-4">
          <p className="mb-2 text-sm font-semibold">Items</p>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left opacity-60">
                <th className="pb-1">Product</th>
                <th className="pb-1">Qty</th>
                <th className="pb-1">Price</th>
                <th className="pb-1">Total</th>
              </tr>
            </thead>
            <tbody>
              {DEMO_LINE_ITEMS.map(({ product, quantity, price }) => (
                <tr key={product.id}>
                  <td className="py-1">{product.name}</td>
                  <td className="py-1">{quantity}</td>
                  <td className="py-1">${price.toFixed(2)}</td>
                  <td className="py-1">${(price * quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2 rounded-md bg-gray-50 p-4 text-sm">
        <div className="flex items-center justify-between"><span>Subtotal</span><span>${totals.subtotal.toFixed(2)}</span></div>
        <div className="flex items-center justify-between"><span>Tax</span><span>${totals.tax.toFixed(2)}</span></div>
        <div className="flex items-center justify-between"><span>Point Used</span><span>-${totals.pointUsed.toFixed(2)}</span></div>
        <div className="flex items-center justify-between"><span>Point Redeemed</span><span>-${totals.pointRedeemed.toFixed(2)}</span></div>
        <div className="flex items-center justify-between border-t border-gray-200 pt-2 text-base font-semibold">
          <span>Grand Total</span><span>${totals.grandTotal.toFixed(2)}</span>
        </div>
      </div>
    </section>
  );
}

export default memo(OrderDetailRenderer);
