import { memo } from 'react';
import { resolveColor } from '../../ui/fields/colorValue';
import { themedButtonStyle } from '../shared/themedButtonStyle';
import catalog from '../../mocks/catalog.json';
import EditableText from '../../ui/EditableText';

// Same demo-only line items as cart_summary — no real cart/session backend exists yet.
const DEMO_LINE_ITEMS = catalog.products.slice(0, 2).map((product) => ({ product, quantity: 1 }));

const disabledInputClass = 'w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-400';

function CheckoutSummaryRenderer({ data, theme, onEdit }) {
  const total = DEMO_LINE_ITEMS.reduce((sum, { product, quantity }) => sum + product.price * quantity, 0);

  return (
    <section className="px-6">
      {onEdit ? (
        <EditableText as="h2" className="mb-6 text-2xl font-bold" value={data.heading} placeholder="Checkout" onCommit={(v) => onEdit('heading', v)} />
      ) : (
        <h2 className="mb-6 text-2xl font-bold">{data.heading || 'Checkout'}</h2>
      )}

      <div className="flex flex-col gap-8 md:flex-row">
        <div className="flex flex-1 flex-col gap-5">
          {data.show_shipping_fields !== false && (
            <fieldset className="flex flex-col gap-3">
              <legend className="mb-1 text-sm font-semibold">Shipping address</legend>
              <input className={disabledInputClass} placeholder="Full name" disabled />
              <input className={disabledInputClass} placeholder="Address" disabled />
              <div className="flex gap-3">
                <input className={disabledInputClass} placeholder="City" disabled />
                <input className={disabledInputClass} placeholder="Postal code" disabled />
              </div>
            </fieldset>
          )}

          {data.show_payment_fields !== false && (
            <fieldset className="flex flex-col gap-3">
              <legend className="mb-1 text-sm font-semibold">Payment</legend>
              <input className={disabledInputClass} placeholder="Card number" disabled />
              <div className="flex gap-3">
                <input className={disabledInputClass} placeholder="MM / YY" disabled />
                <input className={disabledInputClass} placeholder="CVC" disabled />
              </div>
            </fieldset>
          )}

          <p className="text-xs opacity-60">No payment provider is connected yet — this form doesn't submit anything.</p>
        </div>

        {data.show_order_summary !== false && (
          <div className="flex flex-1 flex-col gap-3 rounded-md bg-gray-50 p-4">
            {DEMO_LINE_ITEMS.map(({ product, quantity }) => (
              <div key={product.id} className="flex items-center justify-between text-sm">
                <span>{product.name} × {quantity}</span>
                <span>${(product.price * quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="mt-2 flex items-center justify-between border-t border-gray-200 pt-2 text-base font-semibold">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>

      <span
        style={themedButtonStyle(theme.buttons, { primary: resolveColor({ slot: 'primary' }, theme.colors), primaryText: resolveColor({ slot: 'primary_text' }, theme.colors) })}
        className="mt-6 inline-block w-fit"
      >
        {onEdit ? (
          <EditableText value={data.button_label} placeholder="Place order" onCommit={(v) => onEdit('button_label', v)} />
        ) : (
          data.button_label || 'Place order'
        )}
      </span>
    </section>
  );
}

export default memo(CheckoutSummaryRenderer);
